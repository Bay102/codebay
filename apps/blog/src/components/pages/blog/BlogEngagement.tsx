"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Tables, TablesInsert } from "@/lib/database";
import { communityUrl, siteUrl } from "@/lib/site-urls";
import { getBlogSupabaseClient } from "@/lib/supabase";

type ReactionType = "like" | "insightful" | "love";
type ReactionResponse = "up" | "down";

type BlogEngagementProps = {
  slug: string;
  postPath: string;
};

type CommentRow = Pick<Tables<"blog_post_comments">, "id" | "author_name" | "body" | "created_at">;

const reactionOptions: { type: ReactionType; label: string; badge: string }[] = [
  { type: "like", label: "Helpful", badge: "H" },
  { type: "insightful", label: "Insightful", badge: "I" },
  { type: "love", label: "Loved", badge: "L" }
];

function formatShortDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function getSessionDisplayName(session: Session): string {
  const metadataName = session.user.user_metadata.name;
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName;
  }

  return session.user.email ?? "Community Member";
}

export function BlogEngagement({ slug, postPath }: BlogEngagementProps) {
  const supabase = useMemo(() => getBlogSupabaseClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [viewCount, setViewCount] = useState<number | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, { up: number; down: number }>>({
    like: { up: 0, down: 0 },
    insightful: { up: 0, down: 0 },
    love: { up: 0, down: 0 }
  });
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reactionSubmitting, setReactionSubmitting] = useState<ReactionType | null>(null);
  const reactionInProgressRef = useRef(false);
  const hasRecordedViewRef = useRef(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `blog_reacted:${slug}`;
    setHasReacted(window.localStorage.getItem(key) === "1");
  }, [slug]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      setViewCount(0);
      setComments([]);
      setError("Blog engagement is unavailable because Supabase is not configured.");
      return;
    }

    let isMounted = true;
    hasRecordedViewRef.current = false;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const [viewsResult, reactionsResult, commentsResult] = await Promise.all([
        supabase.from("blog_post_views").select("*", { count: "exact", head: true }).eq("slug", slug),
        supabase.from("blog_post_reactions").select("reaction_type,response").eq("slug", slug),
        supabase
          .from("blog_post_comments")
          .select("id,author_name,body,created_at")
          .eq("slug", slug)
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
      ]);

      if (!isMounted) return;

      if (viewsResult.error || reactionsResult.error || commentsResult.error) {
        setError("Unable to load engagement data right now.");
      } else {
        setViewCount(viewsResult.count ?? 0);

        const nextReactionCounts: Record<ReactionType, { up: number; down: number }> = {
          like: { up: 0, down: 0 },
          insightful: { up: 0, down: 0 },
          love: { up: 0, down: 0 }
        };

        (reactionsResult.data ?? []).forEach((row) => {
          const type = row.reaction_type as ReactionType;
          if (!(type in nextReactionCounts)) return;

          const response: ReactionResponse = row.response === "down" ? "down" : "up";
          nextReactionCounts[type][response] += 1;
        });

        setReactionCounts(nextReactionCounts);
        setComments((commentsResult.data ?? []) as CommentRow[]);
        setCurrentPage(1);
      }

      setIsLoading(false);

      if (hasRecordedViewRef.current) return;
      hasRecordedViewRef.current = true;

      const viewInsert: TablesInsert<"blog_post_views"> = { slug };
      const { error: recordError } = await supabase.from("blog_post_views").insert(viewInsert);

      if (!recordError && isMounted) {
        setViewCount((previous) => (previous ?? 0) + 1);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [slug, supabase]);

  const handleReact = async (type: ReactionType, response: ReactionResponse) => {
    if (!supabase) {
      setError("Blog engagement is unavailable because Supabase is not configured.");
      return;
    }

    if (!session) {
      setError("Sign in on the blog to react.");
      return;
    }

    if (hasReacted || reactionInProgressRef.current) return;
    reactionInProgressRef.current = true;
    setReactionSubmitting(type);
    setError(null);

    const reactionInsert: TablesInsert<"blog_post_reactions"> = {
      slug,
      reaction_type: type,
      response,
      user_id: session.user.id
    };

    const { error: insertError } = await supabase.from("blog_post_reactions").insert(reactionInsert);

    reactionInProgressRef.current = false;
    setReactionSubmitting(null);

    if (insertError) {
      setError("Unable to save your reaction right now.");
      return;
    }

    setReactionCounts((previous) => ({
      ...previous,
      [type]: {
        up: previous[type].up + (response === "up" ? 1 : 0),
        down: previous[type].down + (response === "down" ? 1 : 0)
      }
    }));

    setHasReacted(true);
    if (typeof window !== "undefined") {
      const key = `blog_reacted:${slug}`;
      window.localStorage.setItem(key, "1");
    }
  };

  const handleSubmitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setError("Blog engagement is unavailable because Supabase is not configured.");
      return;
    }

    if (!session) {
      setError("Sign in on the blog to comment.");
      return;
    }

    if (!commentBody.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    setError(null);

    const payload: TablesInsert<"blog_post_comments"> = {
      slug,
      author_id: session.user.id,
      author_name: getSessionDisplayName(session),
      body: commentBody.trim()
    };

    const { data, error: insertError } = await supabase
      .from("blog_post_comments")
      .insert(payload)
      .select("id,author_name,body,created_at")
      .single();

    setIsSubmittingComment(false);

    if (insertError) {
      setError("Unable to post your comment right now.");
      return;
    }

    if (data) {
      setComments((previous) => [data, ...previous]);
      setCommentBody("");
      setCurrentPage(1);
      setAreCommentsVisible(true);
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((sum, value) => sum + value.up + value.down, 0);
  const totalPages = Math.max(1, Math.ceil(comments.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleComments = comments.slice(startIndex, startIndex + pageSize);
  const communityJoinHref = `${communityUrl}/join?redirect=${encodeURIComponent(`${siteUrl}${postPath}`)}`;
  const signInHref = `/sign-in?redirect=${encodeURIComponent(postPath)}`;
  const hasEngagementAccess = !!session;

  return (
    <section className="mx-auto mt-10 w-full max-w-5xl px-5 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Engagement</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {viewCount === null
                ? "Loading views..."
                : `${viewCount.toLocaleString()} views - ${totalReactions} reactions - ${comments.length} comment${comments.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {reactionOptions.map((option) => {
              const counts = reactionCounts[option.type];
              const totalForType = counts.up + counts.down;
              const upPct = totalForType > 0 ? Math.round((counts.up / totalForType) * 100) : 0;

              return (
                <div
                  key={option.type}
                  className="flex min-w-[180px] flex-1 flex-col gap-2 rounded-xl border border-border/70 bg-background/60 p-3 sm:min-w-[200px] sm:p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/70 text-sm">
                        {option.badge}
                      </span>
                      <span className="text-xs font-medium text-foreground">{option.label}</span>
                    </div>
                    {totalForType > 0 ? (
                      <span className="text-[11px] text-muted-foreground">
                        {upPct}% positive - {totalForType} vote{totalForType === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">No feedback yet</span>
                    )}
                  </div>

                  {totalForType > 0 ? (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border/80">
                      <div className="h-full bg-primary transition-[width]" style={{ width: `${upPct}%` }} aria-hidden />
                    </div>
                  ) : (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-border/40" aria-hidden />
                  )}

                  {!hasReacted ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => void handleReact(option.type, "up")}
                        disabled={reactionSubmitting !== null || isLoading || isAuthLoading || !hasEngagementAccess}
                        aria-label={`Mark this article as ${option.label.toLowerCase()}`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="h-8 flex-1 rounded-md border border-transparent bg-muted px-2 text-xs font-medium transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => void handleReact(option.type, "down")}
                        disabled={reactionSubmitting !== null || isLoading || isAuthLoading || !hasEngagementAccess}
                        aria-label={`This article was not ${option.label.toLowerCase()}`}
                      >
                        No
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {!hasEngagementAccess ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Reactions and comments are available for community members.{" "}
            <Link href={communityJoinHref} className="text-primary underline-offset-4 hover:underline">
              Join
            </Link>{" "}
            or{" "}
            <Link href={signInHref} className="text-primary underline-offset-4 hover:underline">
              sign in
            </Link>
            .
          </p>
        ) : null}

        <div className="mt-6 border-t border-border/70 pt-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground">Comments</p>
            <button
              type="button"
              className="h-7 rounded-md border border-input bg-background px-3 text-xs font-medium transition-colors hover:bg-muted"
              onClick={() => setAreCommentsVisible((visible) => !visible)}
              aria-expanded={areCommentsVisible}
            >
              {areCommentsVisible
                ? "Hide comments"
                : comments.length > 0
                  ? `Show comments (${comments.length})`
                  : "Show comments"}
            </button>
          </div>

          {areCommentsVisible ? (
            <>
              <div className="mt-4 space-y-4">
                {visibleComments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{comment.author_name || "Reader"}</p>
                      <p className="text-xs text-muted-foreground">{formatShortDateTime(comment.created_at)}</p>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{comment.body}</p>
                  </div>
                ))}
                {!isLoading && comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No comments yet. Be the first to share your thoughts.</p>
                ) : null}
              </div>

              {totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <button
                    type="button"
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="h-7 rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : null}

          {hasEngagementAccess ? (
            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground">Leave a comment</p>
              <form className="mt-3 space-y-3" onSubmit={(event) => void handleSubmitComment(event)}>
                <div className="space-y-2">
                  <label htmlFor="comment-body" className="text-sm font-medium text-foreground">
                    Your comment
                  </label>
                  <textarea
                    id="comment-body"
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                    placeholder="What resonated with you from this article?"
                    rows={3}
                    className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentBody.trim()}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmittingComment ? "Posting..." : "Post comment"}
                </button>
              </form>
            </div>
          ) : null}

          {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
