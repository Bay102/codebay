"use client";

import { useEffect, useState } from "react";
import { MessageCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { COMMUNITY_REACTION_TYPES, type CommunityReactionType } from "@/components/pages/dashboard/dashboard-activity-icons";
import { setDiscussionReaction } from "@/lib/discussions";
import { useAuth } from "@/contexts/AuthContext";

const REACTION_TYPES = COMMUNITY_REACTION_TYPES;

type ReactionType = CommunityReactionType;
type ReactionResponse = "up" | "down";

type ReactionCounts = Record<ReactionType, number>;

type DiscussionReactionBarProps = {
  discussionId: string;
  slug: string;
  initialCommentCount: number;
  initialReactionCount: number;
  initialViewerReactions: Partial<Record<ReactionType, ReactionResponse>>;
};

export function DiscussionReactionBar({
  discussionId,
  slug,
  initialCommentCount,
  initialReactionCount,
  initialViewerReactions
}: DiscussionReactionBarProps) {
  const { supabase, user } = useAuth();

  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({
    like: 0,
    insightful: 0,
    love: 0
  });
  const [viewerReactions, setViewerReactions] =
    useState<Partial<Record<ReactionType, ReactionResponse>>>(initialViewerReactions);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    const loadReactions = async () => {
      const { data, error } = await supabase
        .from("discussion_reactions")
        .select("reaction_type,response,user_id")
        .eq("discussion_id", discussionId);

      if (!isMounted || error || !data) {
        return;
      }

      const nextCounts: ReactionCounts = {
        like: 0,
        insightful: 0,
        love: 0
      };

      data.forEach((row: { reaction_type: string }) => {
        const type = row.reaction_type as ReactionType;
        if (type in nextCounts) {
          nextCounts[type] += 1;
        }
      });

      setReactionCounts(nextCounts);

      if (user) {
        const nextViewerReactions: Partial<Record<ReactionType, ReactionResponse>> = {};
        data.forEach((row: { reaction_type: string; response: string; user_id: string | null }) => {
          if (row.user_id !== user.id) return;
          const type = row.reaction_type as ReactionType;
          if (!(type in nextCounts)) return;
          nextViewerReactions[type] = row.response === "down" ? "down" : "up";
        });
        setViewerReactions(nextViewerReactions);
      }
    };

    void loadReactions();

    return () => {
      isMounted = false;
    };
  }, [discussionId, supabase, user]);

  const hasEngagementAccess = Boolean(user && supabase);

  const handleReaction = async (reactionType: ReactionType, response: ReactionResponse) => {
    if (!supabase || !user || isLoading) return;
    if (viewerReactions[reactionType]) return;

    setIsLoading(true);

    try {
      const ok = await setDiscussionReaction(supabase, discussionId, user.id, reactionType, response);
      if (!ok) return;

      setViewerReactions((previous) => ({ ...previous, [reactionType]: response }));
      setReactionCounts((previous) => ({
        ...previous,
        [reactionType]: (previous[reactionType] ?? 0) + 1
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const engagementItems = [
    ...REACTION_TYPES.map(({ type, label, Icon, iconColor }) => ({
      key: type,
      label,
      Icon,
      iconColor,
      count: reactionCounts[type]
    })),
    {
      key: "comments",
      label: initialCommentCount === 1 ? "comment" : "comments",
      Icon: MessageCircle,
      iconColor: "text-muted-foreground",
      count: initialCommentCount
    }
  ];

  return (
    <div className="border-t border-border/70 pt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Engagement
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6" aria-label="Reaction and comment counts">
            {engagementItems.map(({ key, label, Icon, iconColor, count }) => (
              <li key={key} className="flex items-center gap-2">
                <span
                  className={`flex h-7 min-w-7 items-center justify-center rounded-md bg-muted/70 ${iconColor}`}
                  aria-hidden
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium tabular-nums text-foreground">{count.toLocaleString()}</span>{" "}
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {hasEngagementAccess ? (
          <div className="flex shrink-0 items-center gap-2 md:justify-end">
            {REACTION_TYPES.map(({ type, label, Icon, iconColor }) => {
              const hasReactedToType = viewerReactions[type] != null;

              return (
                <div
                  key={type}
                  className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-1 py-1"
                >
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${iconColor}`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </span>
                  <button
                    type="button"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => void handleReaction(type, "up")}
                    disabled={isLoading || hasReactedToType}
                    aria-label={`Upvote ${label}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={() => void handleReaction(type, "down")}
                    disabled={isLoading || hasReactedToType}
                    aria-label={`Downvote ${label}`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
