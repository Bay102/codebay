"use client";

import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Tables, TablesInsert } from "@/lib/database";
import { communityUrl, siteUrl } from "@/lib/site-urls";
import { useAuth } from "@/contexts/AuthContext";
import { EngagementPanel } from "@/components/shared/engagement/EngagementPanel";
import { CustomButton } from "@/components/shared/buttons/CustomButton";

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

/** Total nested comments under this node (all depths). */
function countDescendantReplies(comment: CommentWithReplies): number {
  return comment.replies.reduce(
    (acc, reply) => acc + 1 + countDescendantReplies(reply),
    0
  );
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
  const [threadCollapsed, setThreadCollapsed] = useState(false);
  const descendantReplyCount = countDescendantReplies(comment);
  const repliesRegionId = `blog-comment-replies-${comment.id}`;

  return (
    <div
      className={
        isNested
          ? "border border-border/50 bg-background/50 p-3 text-sm"
          : "border border-border/70 bg-background/70 p-4 text-sm"
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
        className={`mt-2 whitespace-pre-line leading-relaxed text-muted-foreground ${isNested ? "text-xs" : "text-sm"
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
            <CustomButton
              type="submit"
              radius="none"
              size="xs"
              fontWeight="medium"
              disabled={isSubmittingReply || !replyBody.trim()}
            >
              {isSubmittingReply ? "Posting..." : "Post reply"}
            </CustomButton>
            <CustomButton
              type="button"
              radius="none"
              size="xs"
              fontWeight="medium"
              onClick={() => {
                onReplyClick(comment.id);
                onReplyBodyChange("");
              }}
            >
              Cancel
            </CustomButton>
          </div>
        </form>
      ) : null}
      {comment.replies.length > 0 ? (
        <>
          <div className="mt-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              aria-expanded={!threadCollapsed}
              aria-controls={repliesRegionId}
              onClick={() => setThreadCollapsed((c) => !c)}
            >
              {threadCollapsed ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span>
                {threadCollapsed
                  ? `Show ${descendantReplyCount} ${descendantReplyCount === 1 ? "reply" : "replies"}`
                  : "Hide replies"}
              </span>
            </button>
          </div>
          <div
            id={repliesRegionId}
            className="mt-2 ml-4 space-y-3 border-l-2 border-border/60 pl-4"
            hidden={threadCollapsed}
          >
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
        </>
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
  const [isCommentComposerOpen, setIsCommentComposerOpen] = useState(false);
  const commentComposerTextareaRef = useRef<HTMLTextAreaElement>(null);

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
  const engagementSubtitle =
    viewCount === null
      ? "Loading views..."
      : `${viewCount.toLocaleString()} views - ${totalReactions} reactions - ${totalCommentCount} comment${totalCommentCount === 1 ? "" : "s"
      }`;

  const reactionCards = reactionOptions.map((option) => {
    const counts = reactionCounts[option.type];
    const totalForType = counts.up + counts.down;
    const upPct = totalForType > 0 ? Math.round((counts.up / totalForType) * 100) : 0;
    const hasReactedToType = !!userReactions[option.type];
    const canReact = hasEngagementAccess && !isLoading && !isAuthLoading && reactionSubmitting === null;

    return {
      label: option.label,
      icon: option.icon,
      summary:
        totalForType > 0
          ? `${upPct}% - ${totalForType} vote${totalForType === 1 ? "" : "s"}`
          : "No feedback yet",
      progressPct: totalForType > 0 ? upPct : 0,
      actions: !hasReactedToType
        ? {
          primary: {
            icon: <ThumbsUp className="h-4 w-4" strokeWidth={2} aria-hidden />,
            onClick: () => void handleReact(option.type, "up"),
            ariaLabel: `Mark this article as ${option.label.toLowerCase()}`,
            disabled: !canReact
          },
          secondary: {
            icon: <ThumbsDown className="h-4 w-4" strokeWidth={2} aria-hidden />,
            onClick: () => void handleReact(option.type, "down"),
            ariaLabel: `This article was not ${option.label.toLowerCase()}`,
            disabled: !canReact
          }
        }
        : undefined
    } as const;
  });

  return (
    <section className="mx-auto mt-4 w-full max-w-5xl px-5 sm:px-6 lg:px-8">
      <div className="border border-border/70 bg-card p-2.5 sm:p-3">
        <EngagementPanel
          variant="embedded"
          density="compact"
          subtitle={engagementSubtitle}
          cards={reactionCards}
          hasEngagementAccess={hasEngagementAccess}
          joinHref={communityJoinHref}
          signInHref={signInHref}
          accessCopy="Reactions and comments are available for community members."
          error={error}
        />

        <div className="mt-4 border-t border-border/70 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground">Comments</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <CustomButton
                radius="none"
                size="xs"
                fontWeight="medium"
                className="shrink-0"
                onClick={() => setAreCommentsVisible((visible) => !visible)}
                aria-expanded={areCommentsVisible}
              >
                {areCommentsVisible
                  ? "Hide comments"
                  : comments.length > 0
                    ? `Show comments (${totalCommentCount})`
                    : "Show comments"}
              </CustomButton>
              {hasEngagementAccess ? (
                <CustomButton
                  type="button"
                  radius="none"
                  size="xs"
                  fontWeight="medium"
                  className="shrink-0"
                  aria-expanded={isCommentComposerOpen}
                  aria-controls="blog-comment-composer"
                  onClick={() => {
                    setIsCommentComposerOpen((open) => {
                      const next = !open;
                      if (next) {
                        requestAnimationFrame(() => commentComposerTextareaRef.current?.focus());
                      }
                      return next;
                    });
                  }}
                >
                  {isCommentComposerOpen ? "Hide comment box" : "Comment"}
                </CustomButton>
              ) : null}
            </div>
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

          {hasEngagementAccess && isCommentComposerOpen ? (
            <form
              id="blog-comment-composer"
              className="mt-4 space-y-3"
              onSubmit={(event) => void handleSubmitComment(event)}
            >
              <div className="space-y-2">
                <label htmlFor="comment-body" className="text-sm font-medium text-foreground">
                  Your comment
                </label>
                <textarea
                  ref={commentComposerTextareaRef}
                  id="comment-body"
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="What resonated with you from this article?"
                  rows={3}
                  className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <CustomButton
                type="submit"
                radius="none"
                size="xs"
                fontWeight="medium"
                disabled={isSubmittingComment || !commentBody.trim()}
              >
                {isSubmittingComment ? "Posting..." : "Post comment"}
              </CustomButton>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}

