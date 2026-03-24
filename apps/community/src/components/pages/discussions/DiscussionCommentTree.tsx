"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DiscussionComment } from "@/lib/discussions";
import { createDiscussionComment, getDiscussionComments } from "@/lib/discussions";
import { useAuth } from "@/contexts/AuthContext";
import { DiscussionAuthorAvatar } from "@/components/pages/discussions/DiscussionAuthorAvatar";
import { FocusButton } from "@/components/shared/buttons/FocusButton";
import { CustomButton } from "@/components/shared/buttons/CustomButton";

type DiscussionCommentTreeProps = {
  discussionId: string;
  initialComments: DiscussionComment[];
  viewerId: string | null;
  composerOpen?: boolean;
  onComposerOpenChange?: (nextOpen: boolean) => void;
  hideComposerToggle?: boolean;
  onTotalCommentsChange?: (count: number) => void;
};

function countCommentsInTree(comments: DiscussionComment[]): number {
  return comments.reduce((sum, comment) => {
    return sum + 1 + countCommentsInTree(comment.replies);
  }, 0);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

/** Total nested comments under this node (all depths). */
function countDescendantReplies(comment: DiscussionComment): number {
  return comment.replies.reduce(
    (acc, reply) => acc + 1 + countDescendantReplies(reply),
    0
  );
}

function CommentNode({
  comment,
  discussionId,
  viewerId,
  onReplySubmitted,
  depth = 0
}: {
  comment: DiscussionComment;
  discussionId: string;
  viewerId: string | null;
  onReplySubmitted: () => void | Promise<void>;
  depth?: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threadCollapsed, setThreadCollapsed] = useState(false);
  const { supabase, user } = useAuth();

  const descendantReplyCount = countDescendantReplies(comment);
  const repliesRegionId = `discussion-comment-replies-${comment.id}`;

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !replyBody.trim()) return;
    setIsSubmitting(true);
    try {
      const profileRes = await supabase
        .from("community_users")
        .select("name")
        .eq("id", user.id)
        .single();
      const authorName = (profileRes.data?.name as string) ?? "Community Member";
      await createDiscussionComment(supabase, {
        discussionId,
        authorId: user.id,
        authorName,
        body: replyBody.trim(),
        parentId: comment.id
      });
      setReplyBody("");
      setReplyOpen(false);
      await onReplySubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNested = depth > 0;

  return (
    <div
      className={isNested ? "ml-4 mt-2 border border-border/50 bg-background/50 p-3" : "mt-4 border border-border/70 bg-background/70 p-4"}
    >
      <div className="flex items-start gap-3">
        <DiscussionAuthorAvatar
          name={comment.authorName}
          avatarUrl={comment.authorAvatarUrl}
          sizeClassName={isNested ? "h-8 w-8" : "h-10 w-10"}
          textClassName={isNested ? "text-[10px]" : "text-xs"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{comment.authorName}</span>
            <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
          </div>
          <p className={`mt-2 whitespace-pre-line ${isNested ? "text-xs" : "text-sm"} leading-relaxed text-muted-foreground`}>
            {comment.body}
          </p>
          {viewerId && (
            <div className="mt-2">
              {!replyOpen ? (
                <button
                  type="button"
                  onClick={() => setReplyOpen(true)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Reply
                </button>
              ) : (
                <form onSubmit={handleSubmitReply} className="mt-2">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write a reply…"
                    rows={3}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    disabled={isSubmitting}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyBody.trim()}
                      className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-70"
                    >
                      {isSubmitting ? "Sending…" : "Reply"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setReplyOpen(false); setReplyBody(""); }}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary/70"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
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
              <div id={repliesRegionId} className="mt-2 space-y-0" hidden={threadCollapsed}>
                {comment.replies.map((reply) => (
                  <CommentNode
                    key={reply.id}
                    comment={reply}
                    discussionId={discussionId}
                    viewerId={viewerId}
                    onReplySubmitted={async () => onReplySubmitted()}
                    depth={depth + 1}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function DiscussionCommentTree({
  discussionId,
  initialComments,
  viewerId,
  composerOpen,
  onComposerOpenChange,
  hideComposerToggle = false,
  onTotalCommentsChange
}: DiscussionCommentTreeProps) {
  const [comments, setComments] = useState(initialComments);
  const [newCommentBody, setNewCommentBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalComposerOpen, setInternalComposerOpen] = useState(false);
  const { supabase, user } = useAuth();
  const isComposerOpen = composerOpen ?? internalComposerOpen;

  const setComposerOpen = useCallback(
    (nextOpen: boolean) => {
      onComposerOpenChange?.(nextOpen);
      if (composerOpen === undefined) {
        setInternalComposerOpen(nextOpen);
      }
    },
    [composerOpen, onComposerOpenChange]
  );

  const refreshComments = useCallback(async () => {
    if (!supabase) return;
    const next = await getDiscussionComments(supabase, discussionId);
    setComments(next);
  }, [supabase, discussionId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !newCommentBody.trim()) return;
    setIsSubmitting(true);
    try {
      const profileRes = await supabase
        .from("community_users")
        .select("name")
        .eq("id", user.id)
        .single();
      const authorName = (profileRes.data?.name as string) ?? "Community Member";
      await createDiscussionComment(supabase, {
        discussionId,
        authorId: user.id,
        authorName,
        body: newCommentBody.trim(),
        parentId: null
      });
      setNewCommentBody("");
      await refreshComments();
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalComments = useMemo(() => countCommentsInTree(comments), [comments]);

  useEffect(() => {
    onTotalCommentsChange?.(totalComments);
  }, [onTotalCommentsChange, totalComments]);

  return (
    <div>
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-0">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentNode
                comment={comment}
                discussionId={discussionId}
                viewerId={viewerId}
                onReplySubmitted={refreshComments}
                depth={0}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        {viewerId && supabase && user ? (
          <>
            {!hideComposerToggle && !isComposerOpen ? (
              <CustomButton
                radius="sm"
                size="sm"
                onClick={() => setComposerOpen(true)}
              >
                Add a comment
              </CustomButton>
            ) : (
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={newCommentBody}
                  onChange={(e) => setNewCommentBody(e.target.value)}
                  placeholder="Add a comment…"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={isSubmitting}
                />
                <div className="mt-2 flex gap-2">
                  <CustomButton
                    type="submit"
                    radius="none"
                    size="xs"
                    fontWeight="medium"
                    disabled={isSubmitting || !newCommentBody.trim()}
                  >
                    {isSubmitting ? "Posting..." : "Post comment"}
                  </CustomButton>
                  {!hideComposerToggle ? (
                    <CustomButton
                      type="button"
                      radius="none"
                      size="sm"
                      onClick={() => {
                        setComposerOpen(false);
                        setNewCommentBody("");
                      }}
                    >
                      Cancel
                    </CustomButton>
                  ) : null}
                </div>
              </form>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/join" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to comment.
          </p>
        )}
      </div>
    </div>
  );
}
