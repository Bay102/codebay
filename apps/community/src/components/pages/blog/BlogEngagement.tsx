"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import type { Tables, TablesInsert } from "@/lib/database";
import { communityUrl, siteUrl } from "@/lib/site-urls";
import { useAuth } from "@/contexts/AuthContext";

type ReactionType = "like" | "insightful" | "love";
type ReactionResponse = "up" | "down";

type BlogEngagementProps = {
  slug: string;
  postPath: string;
};

type CommentRow = Pick<
  Tables<"blog_post_comments">,
  "id" | "author_id" | "author_name" | "body" | "created_at" | "parent_id"
>;

type CommentWithReplies = CommentRow & { replies: CommentWithReplies[] };

const reactionOptions: { type: ReactionType; label: string; icon: string }[] = [
  { type: "like", label: "Helpful", icon: "👍" },
  { type: "insightful", label: "Insightful", icon: "💡" },
  { type: "love", label: "Loved", icon: "❤️" }
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

type CommentThreadProps = {
  comment: CommentWithReplies;
  replyingToId: string | null;
  replyBody: string;
  isSubmittingReply: boolean;
  hasEngagementAccess: boolean;
  onReplyClick: (commentId: string) => void;
  onReplyBodyChange: (value: string) => void;
  onSubmitReply: (parentId: string) => (event: FormEvent<HTMLFormElement>) => void;
  formatDateTime: (value: string) => string;
  isNested?: boolean;
};

function CommentThread({
  comment,
  replyingToId,
  replyBody,
  isSubmittingReply,
  hasEngagementAccess,
  onReplyClick,
  onReplyBodyChange,
  onSubmitReply,
  formatDateTime,
  isNested = false
}: CommentThreadProps) {
  const isReplying = replyingToId === comment.id;

  return (
    <div
      className={
        isNested
          ? "rounded-lg border border-border/50 bg-background/50 p-3 text-sm"
          : "rounded-xl border border-border/70 bg-background/70 p-4 text-sm"
      }
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`font-medium text-foreground ${isNested ? "text-xs" : ""}`}>
          {comment.author_name || "Reader"}
        </p>
        <p className={`text-muted-foreground ${isNested ? "text-[11px]" : "text-xs"}`}>
          {formatDateTime(comment.created_at)}
        </p>
      </div>
      <p
        className={`mt-2 whitespace-pre-line leading-relaxed text-muted-foreground ${
          isNested ? "text-xs" : "text-sm"
        }`}
      >
        {comment.body}
      </p>
      {hasEngagementAccess ? (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-primary hover:underline"
          onClick={() => onReplyClick(comment.id)}
        >
          Reply
        </button>
      ) : null}
      {isReplying ? (
        <form
          className="mt-3 space-y-2"
          onSubmit={onSubmitReply(comment.id)}
        >
          <textarea
            value={replyBody}
            onChange={(e) => onReplyBodyChange(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmittingReply || !replyBody.trim()}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmittingReply ? "Posting..." : "Post reply"}
            </button>
            <button
              type="button"
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
              onClick={() => {
                onReplyClick(comment.id);
                onReplyBodyChange("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      {comment.replies.length > 0 ? (
        <div className="mt-4 ml-4 space-y-3 border-l-2 border-border/60 pl-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              replyingToId={replyingToId}
              replyBody={replyBody}
              isSubmittingReply={isSubmittingReply}
              hasEngagementAccess={hasEngagementAccess}
              onReplyClick={onReplyClick}
              onReplyBodyChange={onReplyBodyChange}
              onSubmitReply={onSubmitReply}
              formatDateTime={formatDateTime}
              isNested
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildCommentThreads(rows: CommentRow[]): CommentWithReplies[] {
  const byId = new Map<string, CommentWithReplies>();
  const roots: CommentWithReplies[] = [];

  rows.forEach((row) => {
    const withReplies: CommentWithReplies = { ...row, replies: [] };
    byId.set(row.id, withReplies);
  });

  rows.forEach((row) => {
    const node = byId.get(row.id)!;
    if (row.parent_id) {
      const parent = byId.get(row.parent_id);
      if (parent) {
        parent.replies.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  roots.forEach((root) => {
    root.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  });
  return roots;
}

export function BlogEngagement({ slug, postPath }: BlogEngagementProps) {
  const { supabase, session, isLoading: isAuthLoading } = useAuth();

  const [viewCount, setViewCount] = useState<number | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, { up: number; down: number }>>({
    like: { up: 0, down: 0 },
    insightful: { up: 0, down: 0 },
    love: { up: 0, down: 0 }
  });
  const [userReactions, setUserReactions] = useState<Partial<Record<ReactionType, ReactionResponse>>>({});
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reactionSubmitting, setReactionSubmitting] = useState<ReactionType | null>(null);
  const reactionInProgressRef = useRef(false);
  const hasRecordedViewRef = useRef(false);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);

  const pageSize = 5;

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
        supabase.from("blog_post_reactions").select("reaction_type,response,user_id").eq("slug", slug),
        supabase
          .from("blog_post_comments")
          .select("id,author_id,author_name,body,created_at,parent_id")
          .eq("slug", slug)
          .eq("is_approved", true)
          .order("created_at", { ascending: true })
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
        const nextUserReactions: Partial<Record<ReactionType, ReactionResponse>> = {};

        (reactionsResult.data ?? []).forEach((row) => {
          const type = row.reaction_type as ReactionType;
          if (!(type in nextReactionCounts)) return;

          const response: ReactionResponse = row.response === "down" ? "down" : "up";
          nextReactionCounts[type][response] += 1;

          if (session && row.user_id && row.user_id === session.user.id) {
            nextUserReactions[type] = response;
          }
        });

        setReactionCounts(nextReactionCounts);
        setUserReactions(nextUserReactions);
        setComments(buildCommentThreads((commentsResult.data ?? []) as CommentRow[]));
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
  }, [slug, supabase, session]);

  const handleReact = async (type: ReactionType, response: ReactionResponse) => {
    if (!supabase) {
      setError("Blog engagement is unavailable because Supabase is not configured.");
      return;
    }

    if (!session) {
      setError("Sign in on the blog to react.");
      return;
    }

    if (reactionInProgressRef.current) return;

    if (userReactions[type]) {
      return;
    }

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

    setUserReactions((previous) => ({
      ...previous,
      [type]: response
    }));
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
      const newComment: CommentWithReplies = {
        id: data.id,
        author_id: session.user.id,
        author_name: data.author_name ?? getSessionDisplayName(session),
        body: data.body,
        created_at: data.created_at,
        parent_id: null,
        replies: []
      };
      setComments((previous) => [newComment, ...previous]);
      setCommentBody("");
      setCurrentPage(1);
      setAreCommentsVisible(true);
    }
  };

  const handleSubmitReply = async (event: FormEvent<HTMLFormElement>, parentId: string) => {
    event.preventDefault();
    if (!supabase || !session) return;
    const body = replyBody.trim();
    if (!body) return;

    setIsSubmittingReply(true);
    setError(null);

    const payload: TablesInsert<"blog_post_comments"> = {
      slug,
      author_id: session.user.id,
      author_name: getSessionDisplayName(session),
      body,
      parent_id: parentId
    };

    const { data, error: insertError } = await supabase
      .from("blog_post_comments")
      .insert(payload)
      .select("id,author_id,author_name,body,created_at,parent_id")
      .single();

    setIsSubmittingReply(false);
    setReplyingToId(null);
    setReplyBody("");

    if (insertError) {
      setError("Unable to post your reply right now.");
      return;
    }

    if (data) {
      const newReply: CommentWithReplies = {
        id: data.id,
        author_id: data.author_id ?? session.user.id,
        author_name: data.author_name ?? getSessionDisplayName(session),
        body: data.body,
        created_at: data.created_at,
        parent_id: data.parent_id ?? parentId,
        replies: []
      };

      function addReplyToThread(
        threads: CommentWithReplies[],
        targetId: string,
        reply: CommentWithReplies
      ): CommentWithReplies[] {
        return threads.map((c) => {
          if (c.id === targetId) {
            return { ...c, replies: [...c.replies, reply] };
          }
          return { ...c, replies: addReplyToThread(c.replies, targetId, reply) };
        });
      }

      setComments((previous) => addReplyToThread(previous, parentId, newReply));
      setAreCommentsVisible(true);
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce((sum, value) => sum + value.up + value.down, 0);
  const totalCommentCount = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);
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
                : `${viewCount.toLocaleString()} views - ${totalReactions} reactions - ${totalCommentCount} comment${totalCommentCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {reactionOptions.map((option) => {
              const counts = reactionCounts[option.type];
              const totalForType = counts.up + counts.down;
              const upPct = totalForType > 0 ? Math.round((counts.up / totalForType) * 100) : 0;
              const hasReactedToType = !!userReactions[option.type];

              return (
                <div
                  key={option.type}
                  className="flex min-w-[150px] flex-1 flex-col gap-1.5 rounded-lg border border-border/70 bg-background/60 p-2.5 sm:min-w-[160px] sm:p-3"
                >
                  <div className="flex items-center justify-between gap-1.5 md:flex-col md:items-start md:justify-start md:gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/70 text-xs" aria-hidden>
                        {option.icon}
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
                    <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-border/80">
                      <div className="h-full bg-primary transition-[width]" style={{ width: `${upPct}%` }} aria-hidden />
                    </div>
                  ) : (
                    <div className="mt-0.5 h-1 w-full rounded-full bg-border/40" aria-hidden />
                  )}

                  {!hasReactedToType ? (
                    <div className="mt-1.5 flex gap-1.5">
                      <button
                        type="button"
                        className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => void handleReact(option.type, "up")}
                        disabled={reactionSubmitting !== null || isLoading || isAuthLoading || !hasEngagementAccess}
                        aria-label={`Mark this article as ${option.label.toLowerCase()}`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className="h-7 flex-1 rounded-md border border-transparent bg-muted px-2 text-xs font-medium transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
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
                  ? `Show comments (${totalCommentCount})`
                  : "Show comments"}
            </button>
          </div>

          {areCommentsVisible ? (
            <>
              <div className="mt-4 space-y-4">
                {visibleComments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    replyingToId={replyingToId}
                    replyBody={replyBody}
                    isSubmittingReply={isSubmittingReply}
                    hasEngagementAccess={hasEngagementAccess}
                    onReplyClick={(commentId) =>
                      setReplyingToId((id) => (id === commentId ? null : commentId))
                    }
                    onReplyBodyChange={setReplyBody}
                    onSubmitReply={(parentId) => (e) => void handleSubmitReply(e, parentId)}
                    formatDateTime={formatShortDateTime}
                  />
                ))}
                {!isLoading && totalCommentCount === 0 ? (
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

