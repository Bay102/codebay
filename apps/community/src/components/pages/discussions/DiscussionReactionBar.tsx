"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { COMMUNITY_REACTION_TYPES, type CommunityReactionType } from "@/components/pages/dashboard/dashboard-activity-icons";
import { setDiscussionReaction } from "@/lib/discussions";
import { useAuth } from "@/contexts/AuthContext";

const REACTION_TYPES = COMMUNITY_REACTION_TYPES;

type ReactionType = CommunityReactionType;

type ReactionCounts = Record<ReactionType, number>;

type DiscussionReactionBarProps = {
  discussionId: string;
  slug: string;
  initialCommentCount: number;
  initialReactionCount: number;
  initialViewerReactionType: ReactionType | null;
};

export function DiscussionReactionBar({
  discussionId,
  slug,
  initialCommentCount,
  initialReactionCount,
  initialViewerReactionType
}: DiscussionReactionBarProps) {
  const { supabase, user } = useAuth();

  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({
    like: 0,
    insightful: 0,
    love: 0
  });
  const [viewerReactionType, setViewerReactionType] = useState<ReactionType | null>(initialViewerReactionType);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    const loadReactions = async () => {
      const { data, error } = await supabase
        .from("discussion_reactions")
        .select("reaction_type")
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
    };

    void loadReactions();

    return () => {
      isMounted = false;
    };
  }, [discussionId, supabase]);

  const hasEngagementAccess = Boolean(user && supabase);

  const handleReaction = async (reactionType: ReactionType) => {
    if (!supabase || !user || isLoading) return;

    // Hard one-reaction rule: once a viewer has reacted for this discussion,
    // they cannot change or add another reaction (including across reloads).
    if (viewerReactionType !== null) return;

    setIsLoading(true);

    try {
      const ok = await setDiscussionReaction(supabase, discussionId, user.id, reactionType);
      if (!ok) return;

      setViewerReactionType(reactionType);
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
              const isSelected = viewerReactionType === type;
              const isLocked = viewerReactionType !== null;

              return (
                <button
                  key={type}
                  type="button"
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${isSelected
                      ? "border-border/60 bg-muted cursor-default"
                      : "border-border/70 bg-background hover:bg-secondary/70"
                    } ${isSelected ? iconColor : "text-muted-foreground"}`}
                  onClick={() => void handleReaction(type)}
                  disabled={isLoading || isLocked}
                  aria-label={label}
                  aria-pressed={isSelected}
                  aria-disabled={isSelected || undefined}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
