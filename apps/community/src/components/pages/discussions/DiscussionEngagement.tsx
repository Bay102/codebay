"use client";

import { useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { DiscussionComment } from "@/lib/discussions";
import { setDiscussionReaction } from "@/lib/discussions";
import { communityUrl, siteUrl } from "@/lib/site-urls";
import { EngagementPanel } from "@/components/shared/engagement/EngagementPanel";
import { CustomButton } from "@/components/shared/buttons/CustomButton";
import { DiscussionCommentTree } from "@/components/pages/discussions/DiscussionCommentTree";

const reactionOptions = [
  { type: "like", label: "Helpful", icon: "👍" },
  { type: "insightful", label: "Insightful", icon: "💡" },
  { type: "love", label: "Loved", icon: "❤️" }
] as const;

type ReactionType = (typeof reactionOptions)[number]["type"];
type ReactionResponse = "up" | "down";

type DiscussionEngagementProps = {
  discussionId: string;
  slug: string;
  initialViewCount: number;
  initialCommentCount: number;
  initialViewerReactions: Partial<Record<ReactionType, ReactionResponse>>;
  initialComments: DiscussionComment[];
  viewerId: string | null;
};

export function DiscussionEngagement({
  discussionId,
  slug,
  initialViewCount,
  initialCommentCount,
  initialViewerReactions,
  initialComments,
  viewerId
}: DiscussionEngagementProps) {
  const { supabase, user, isLoading: isAuthLoading } = useAuth();

  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, { up: number; down: number }>>({
    like: { up: 0, down: 0 },
    insightful: { up: 0, down: 0 },
    love: { up: 0, down: 0 }
  });
  const [userReactions, setUserReactions] =
    useState<Partial<Record<ReactionType, ReactionResponse>>>(initialViewerReactions);
  const [isLoading, setIsLoading] = useState(true);
  const [reactionSubmitting, setReactionSubmitting] = useState<ReactionType | null>(null);
  const reactionInProgressRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [areCommentsVisible, setAreCommentsVisible] = useState(false);
  const [isCommentComposerOpen, setIsCommentComposerOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [viewCount, setViewCount] = useState(initialViewCount);
  const hasRecordedViewRef = useRef(false);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      setError("Discussion engagement is unavailable because Supabase is not configured.");
      return;
    }

    let isMounted = true;
    hasRecordedViewRef.current = false;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: reactionsError } = await supabase
        .from("discussion_reactions")
        .select("reaction_type,response,user_id")
        .eq("discussion_id", discussionId);

      if (!isMounted) return;

      if (reactionsError) {
        setError("Unable to load engagement data right now.");
        setIsLoading(false);
        return;
      }

      const nextCounts: Record<ReactionType, { up: number; down: number }> = {
        like: { up: 0, down: 0 },
        insightful: { up: 0, down: 0 },
        love: { up: 0, down: 0 }
      };
      const nextUserReactions: Partial<Record<ReactionType, ReactionResponse>> = {};

      (data ?? []).forEach((row) => {
        const type = row.reaction_type as ReactionType;
        if (!(type in nextCounts)) return;
        const response: ReactionResponse = row.response === "down" ? "down" : "up";
        nextCounts[type][response] += 1;

        if (user && row.user_id === user.id) {
          nextUserReactions[type] = response;
        }
      });

      setReactionCounts(nextCounts);
      setUserReactions(nextUserReactions);
      setIsLoading(false);

      if (hasRecordedViewRef.current) return;
      hasRecordedViewRef.current = true;

      const { error: viewError } = await supabase.from("discussion_views").insert({ discussion_id: discussionId });
      if (!viewError && isMounted) {
        setViewCount((previous) => previous + 1);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [discussionId, supabase, user]);

  const hasEngagementAccess = Boolean(user && supabase);
  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, value) => sum + value.up + value.down,
    0
  );
  const postPath = `/discussions/${slug}`;
  const communityJoinHref = `${communityUrl}/join?redirect=${encodeURIComponent(`${siteUrl}${postPath}`)}`;
  const signInHref = `/join?mode=signin&redirect=${encodeURIComponent(postPath)}`;
  const engagementSubtitle = isLoading
    ? "Loading engagement..."
    : `${viewCount.toLocaleString()} views - ${totalReactions} reaction${totalReactions === 1 ? "" : "s"} - ${commentCount} comment${commentCount === 1 ? "" : "s"
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
            ariaLabel: `Mark this discussion as ${option.label.toLowerCase()}`,
            disabled: !canReact
          },
          secondary: {
            icon: <ThumbsDown className="h-4 w-4" strokeWidth={2} aria-hidden />,
            onClick: () => void handleReact(option.type, "down"),
            ariaLabel: `This discussion was not ${option.label.toLowerCase()}`,
            disabled: !canReact
          }
        }
        : undefined,
    } as const;
  });

  const handleReact = async (type: ReactionType, response: ReactionResponse) => {
    if (!supabase) {
      setError("Discussion engagement is unavailable because Supabase is not configured.");
      return;
    }

    if (!user) {
      setError("Sign in to react.");
      return;
    }

    if (reactionInProgressRef.current) return;

    // One vote per reaction type (matches blog engagement behavior).
    if (userReactions[type]) return;

    reactionInProgressRef.current = true;
    setReactionSubmitting(type);
    setError(null);

    const ok = await setDiscussionReaction(supabase, discussionId, user.id, type, response);

    reactionInProgressRef.current = false;
    setReactionSubmitting(null);

    if (!ok) {
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

  return (
    <section className="mx-auto w-full">
      <div className="border border-border/70 bg-card p-2.5 sm:p-3">
        <EngagementPanel
          variant="embedded"
          subtitle={engagementSubtitle}
          cards={reactionCards}
          hasEngagementAccess={hasEngagementAccess}
          joinHref={communityJoinHref}
          signInHref={signInHref}
          accessCopy="Reactions and comments are available for community members."
          error={error}
          density="compact"
        />

        <div className="mt-4 border-t border-border/70 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground">Comments</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <CustomButton
                size="xs"
                fontWeight="medium"
                radius="none"
                className="shrink-0"
                onClick={() => setAreCommentsVisible((visible) => !visible)}
                aria-expanded={areCommentsVisible}
              >
                {areCommentsVisible
                  ? "Hide comments"
                  : commentCount > 0
                    ? `Show comments (${commentCount})`
                    : "Show comments"}
              </CustomButton>
              {hasEngagementAccess ? (
                <CustomButton
                  type="button"
                  size="xs"
                  fontWeight="medium"
                  radius="none"
                  className="shrink-0"
                  aria-expanded={isCommentComposerOpen}
                  onClick={() => setIsCommentComposerOpen((open) => !open)}
                >
                  {isCommentComposerOpen ? "Hide comment box" : "Comment"}
                </CustomButton>
              ) : null}
            </div>
          </div>

          {areCommentsVisible ? (
            <div className="mt-4">
              <DiscussionCommentTree
                discussionId={discussionId}
                initialComments={initialComments}
                viewerId={viewerId}
                composerOpen={isCommentComposerOpen}
                onComposerOpenChange={setIsCommentComposerOpen}
                hideComposerToggle
                onTotalCommentsChange={setCommentCount}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

