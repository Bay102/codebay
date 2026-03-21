"use client";

import { useEffect, useRef, useState } from "react";
import { ThumbsUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { setDiscussionReaction } from "@/lib/discussions";
import { communityUrl, siteUrl } from "@/lib/site-urls";
import { EngagementPanel } from "@/components/shared/engagement/EngagementPanel";

const reactionOptions = [
  { type: "like", label: "Helpful", icon: "👍" },
  { type: "insightful", label: "Insightful", icon: "💡" },
  { type: "love", label: "Loved", icon: "❤️" }
] as const;

type ReactionType = (typeof reactionOptions)[number]["type"];

type DiscussionEngagementProps = {
  discussionId: string;
  slug: string;
  initialCommentCount: number;
  initialViewerReactionType: ReactionType | null;
};

export function DiscussionEngagement({
  discussionId,
  slug,
  initialCommentCount,
  initialViewerReactionType
}: DiscussionEngagementProps) {
  const { supabase, user, isLoading: isAuthLoading } = useAuth();

  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    like: 0,
    insightful: 0,
    love: 0
  });
  const [viewerReactionType, setViewerReactionType] = useState<ReactionType | null>(initialViewerReactionType);
  const [isLoading, setIsLoading] = useState(true);
  const [reactionSubmitting, setReactionSubmitting] = useState<ReactionType | null>(null);
  const reactionInProgressRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      setError("Discussion engagement is unavailable because Supabase is not configured.");
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: reactionsError } = await supabase
        .from("discussion_reactions")
        .select("reaction_type,user_id")
        .eq("discussion_id", discussionId);

      if (!isMounted) return;

      if (reactionsError) {
        setError("Unable to load engagement data right now.");
        setIsLoading(false);
        return;
      }

      const nextCounts: Record<ReactionType, number> = { like: 0, insightful: 0, love: 0 };
      let nextViewerReaction: ReactionType | null = initialViewerReactionType;

      (data ?? []).forEach((row) => {
        const type = row.reaction_type as ReactionType;
        if (!(type in nextCounts)) return;
        nextCounts[type] += 1;

        if (!nextViewerReaction && user && row.user_id === user.id) {
          nextViewerReaction = type;
        }
      });

      setReactionCounts(nextCounts);
      setViewerReactionType(nextViewerReaction);
      setIsLoading(false);
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [discussionId, initialViewerReactionType, supabase, user]);

  const hasEngagementAccess = Boolean(user && supabase);
  const totalReactions = Object.values(reactionCounts).reduce((sum, value) => sum + value, 0);
  const postPath = `/discussions/${slug}`;
  const communityJoinHref = `${communityUrl}/join?redirect=${encodeURIComponent(`${siteUrl}${postPath}`)}`;
  const signInHref = `/sign-in?redirect=${encodeURIComponent(postPath)}`;
  const engagementSubtitle = isLoading
    ? "Loading engagement..."
    : `${totalReactions} reaction${totalReactions === 1 ? "" : "s"} - ${initialCommentCount} comment${initialCommentCount === 1 ? "" : "s"
    }`;

  const reactionCards = reactionOptions.map((option) => {
    const count = reactionCounts[option.type];
    const pct = totalReactions > 0 ? Math.round((count / totalReactions) * 100) : 0;
    const hasReacted = viewerReactionType !== null;
    const canReact =
      hasEngagementAccess && !isLoading && !isAuthLoading && reactionSubmitting === null && !hasReacted;

    return {
      label: option.label,
      icon: option.icon,
      summary:
        totalReactions > 0
          ? `${pct}% - ${count} vote${count === 1 ? "" : "s"}`
          : "No feedback yet",
      progressPct: totalReactions > 0 ? pct : 0,
      actions: !hasReacted && hasEngagementAccess
        ? {
          primary: {
            icon: <ThumbsUp className="h-4 w-4" strokeWidth={2} aria-hidden />,
            onClick: () => void handleReact(option.type),
            ariaLabel: `Mark this discussion as ${option.label.toLowerCase()}`,
            disabled: !canReact
          }
        }
        : undefined,
    } as const;
  });

  const handleReact = async (type: ReactionType) => {
    if (!supabase) {
      setError("Discussion engagement is unavailable because Supabase is not configured.");
      return;
    }

    if (!user) {
      setError("Sign in to react.");
      return;
    }

    if (reactionInProgressRef.current) return;

    // One reaction per viewer per discussion.
    if (viewerReactionType) return;

    reactionInProgressRef.current = true;
    setReactionSubmitting(type);
    setError(null);

    const ok = await setDiscussionReaction(supabase, discussionId, user.id, type);

    reactionInProgressRef.current = false;
    setReactionSubmitting(null);

    if (!ok) {
      setError("Unable to save your reaction right now.");
      return;
    }

    setReactionCounts((previous) => ({
      ...previous,
      [type]: previous[type] + 1
    }));
    setViewerReactionType(type);
  };

  return (
    <EngagementPanel
      subtitle={engagementSubtitle}
      cards={reactionCards}
      hasEngagementAccess={hasEngagementAccess}
      joinHref={communityJoinHref}
      signInHref={signInHref}
      accessCopy="Reactions are available for community members."
      error={error}
      density="compact"
    />
  );
}

