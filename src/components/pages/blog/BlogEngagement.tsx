"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tables, TablesInsert } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type ReactionType = "like" | "insightful" | "love";
type ReactionResponse = "up" | "down";

interface BlogEngagementProps {
  slug: string;
}

type CommentRow = Pick<Tables<"blog_post_comments">, "id" | "author_name" | "body" | "created_at">;

const reactionOptions: { type: ReactionType; label: string }[] = [
  { type: "like", label: "Helpful" },
  { type: "insightful", label: "Insightful" },
  { type: "love", label: "Loved" }
];

function formatShortDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function BlogEngagement({ slug }: BlogEngagementProps) {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [reactionCounts, setReactionCounts] = useState<
    Record<ReactionType, { up: number; down: number }>
  >({
    like: { up: 0, down: 0 },
    insightful: { up: 0, down: 0 },
    love: { up: 0, down: 0 }
  });
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecordingView, setIsRecordingView] = useState(false);
  const [reactionSubmitting, setReactionSubmitting] = useState<ReactionType | null>(null);
  const reactionInProgressRef = useRef(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `blog_reacted:${slug}`;
    setHasReacted(window.localStorage.getItem(key) === "1");
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const viewsPromise = supabase
        .from("blog_post_views")
        .select("*", { count: "exact", head: true })
        .eq("slug", slug);

      const reactionsPromise = supabase
        .from("blog_post_reactions")
        .select("reaction_type,response")
        .eq("slug", slug);

      const commentsPromise = supabase
        .from("blog_post_comments")
        .select("id,author_name,body,created_at")
        .eq("slug", slug)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      const [viewsResult, reactionsResult, commentsResult] = await Promise.all([
        viewsPromise,
        reactionsPromise,
        commentsPromise
      ]);

      if (!isMounted) {
        return;
      }

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
          const response: ReactionResponse = row.response === "down" ? "down" : "up";
          if (type in nextReactionCounts) {
            nextReactionCounts[type][response] += 1;
          }
        });
        setReactionCounts(nextReactionCounts);

        setComments((commentsResult.data ?? []) as CommentRow[]);
        setCurrentPage(1);
      }

      setIsLoading(false);

      // Record this view after initial load so the count reflects prior views.
      setIsRecordingView(true);
      const viewInsert: TablesInsert<"blog_post_views"> = { slug };
      const { error: recordError } = await supabase.from("blog_post_views").insert(viewInsert);
      setIsRecordingView(false);

      if (!recordError && isMounted) {
        setViewCount((previous) => (previous ?? 0) + 1);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleReact = async (type: ReactionType, response: ReactionResponse) => {
    if (hasReacted || reactionInProgressRef.current) return;
    reactionInProgressRef.current = true;
    setReactionSubmitting(type);
    setError(null);

    const reactionInsert: TablesInsert<"blog_post_reactions"> = {
      slug,
      reaction_type: type,
      response
    };
    const { error: insertError } = await supabase
      .from("blog_post_reactions")
      .insert(reactionInsert);

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

  const handleSubmitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentBody.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    setError(null);

    const payload: TablesInsert<"blog_post_comments"> = {
      slug,
      author_name: commentAuthor.trim() || null,
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
      setComments((previous) => [...previous, data]);
      setCommentBody("");
    }
  };

  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, value) => sum + value.up + value.down,
    0
  );

  const totalPages = Math.max(1, Math.ceil(comments.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleComments = comments.slice(startIndex, startIndex + pageSize);

  return (
    <section className="mx-auto mt-10 w-full max-w-5xl px-5 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Engagement
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {viewCount === null
                ? "Loading views..."
                : `${viewCount.toLocaleString()} views • ${totalReactions} reactions • ${comments.length} comment${comments.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {reactionOptions.map((option) => {
              const counts = reactionCounts[option.type];
              const totalForType = counts.up + counts.down;
              const upPct = totalForType > 0 ? Math.round((counts.up / totalForType) * 100) : 0;
              const downPct = totalForType > 0 ? 100 - upPct : 0;
              const icon =
                option.type === "like" ? "👍" : option.type === "insightful" ? "💡" : "❤️";

              return (
                <div
                  key={option.type}
                  className="flex min-w-[180px] flex-1 flex-col gap-2 rounded-xl border border-border/70 bg-background/60 p-3 sm:min-w-[200px] sm:p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/70 text-sm">
                        {icon}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {option.label}
                      </span>
                    </div>
                    {totalForType > 0 ? (
                      <>
                        <span className="text-[11px] text-muted-foreground md:hidden">
                          {upPct}% positive · {totalForType} vote{totalForType === 1 ? "" : "s"}
                        </span>
                        <div className="hidden text-[11px] text-muted-foreground md:flex md:flex-col md:items-end">
                          <span className="whitespace-nowrap">{upPct}% positive</span>
                          <span className="whitespace-nowrap">
                            {totalForType} vote{totalForType === 1 ? "" : "s"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        No feedback yet
                      </span>
                    )}
                  </div>
                  {totalForType > 0 ? (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-border/80">
                      <div
                        className="h-full bg-primary transition-[width]"
                        style={{ width: `${upPct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-border/40" aria-hidden="true" />
                  )}
                  {!hasReacted ? (
                    <div className="mt-2 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 text-xs"
                        onClick={() => void handleReact(option.type, "up")}
                        disabled={reactionSubmitting !== null || isLoading}
                        aria-label={`Mark this article as ${option.label.toLowerCase()}`}
                      >
                        👍 Yes
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 flex-1 text-xs"
                        onClick={() => void handleReact(option.type, "down")}
                        disabled={reactionSubmitting !== null || isLoading}
                        aria-label={`This article was not ${option.label.toLowerCase().replace(" it", "")}`}
                      >
                        👎 No
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 border-t border-border/70 pt-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground">
              Comments
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs"
              onClick={() => setAreCommentsVisible((visible) => !visible)}
              aria-expanded={areCommentsVisible}
            >
              {areCommentsVisible
                ? "Hide comments"
                : comments.length > 0
                  ? `Show comments (${comments.length})`
                  : "Show comments"}
            </Button>
          </div>

          {areCommentsVisible ? (
            <>
              <div className="mt-4 space-y-4">
                {visibleComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">
                        {comment.author_name || "Reader"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatShortDateTime(comment.created_at)}
                      </p>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {comment.body}
                    </p>
                  </div>
                ))}
                {!isLoading && comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No comments yet. Be the first to share your thoughts.
                  </p>
                ) : null}
              </div>

              {totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}

          <Collapsible className="mt-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Leave a comment
              </p>
              <CollapsibleTrigger asChild>
                <Button type="button" size="sm" variant="outline" className="h-7 px-3 text-xs">
                  Write a comment
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mt-3">
              <form className="space-y-3" onSubmit={(event) => void handleSubmitComment(event)}>
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px]">
                  <div className="space-y-2">
                    <Label htmlFor="comment-body">Your comment</Label>
                    <Textarea
                      id="comment-body"
                      value={commentBody}
                      onChange={(event) => setCommentBody(event.target.value)}
                      placeholder="What resonated with you from this article?"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="comment-author">Name (optional)</Label>
                      <Input
                        id="comment-author"
                        value={commentAuthor}
                        onChange={(event) => setCommentAuthor(event.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <Button type="submit" size="sm" disabled={isSubmittingComment || !commentBody.trim()}>
                      {isSubmittingComment ? "Posting..." : "Post comment"}
                    </Button>
                  </div>
                </div>
              </form>

              {error ? (
                <p className="mt-3 text-xs text-destructive">
                  {error}
                </p>
              ) : null}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </section>
  );
}

