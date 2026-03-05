"use client";

import { useEffect, useState } from "react";
import { setDiscussionReaction } from "@/lib/discussions";
import { useAuth } from "@/contexts/AuthContext";

const REACTION_TYPES = [
  { type: "like", label: "Helpful", icon: "👍" },
  { type: "insightful", label: "Insightful", icon: "💡" },
  { type: "love", label: "Loved", icon: "❤️" }
] as const;

type ReactionType = (typeof REACTION_TYPES)[number]["type"];

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
  const [totalReactions, setTotalReactions] = useState(initialReactionCount);
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
      setTotalReactions(data.length);
    };

    void loadReactions();

    return () => {
      isMounted = false;
    };
  }, [discussionId, supabase]);

  const hasEngagementAccess = Boolean(user && supabase);

  const handleReaction = async (reactionType: ReactionType) => {
    if (!supabase || !user || isLoading) return;

    // Once a user has reacted for this discussion, keep that category
    // (or a different one) selected; do not allow clearing to "no reaction".
    if (viewerReactionType === reactionType) return;

    setIsLoading(true);

    try {
      const previousType = viewerReactionType;
      const ok = await setDiscussionReaction(supabase, discussionId, user.id, reactionType);
      if (!ok) return;

      setViewerReactionType(reactionType);
      setReactionCounts((previous) => {
        const next: ReactionCounts = { ...previous };
        if (previousType && previousType in next) {
          next[previousType] = Math.max(0, next[previousType] - 1);
        } else {
          // New reaction from this viewer; increase total.
          setTotalReactions((current) => current + 1);
        }
        next[reactionType] = (next[reactionType] ?? 0) + 1;
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-border/70 pt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Engagement</p>
          <p className="mt-1 text-sm text-muted-foreground">
            👍 {reactionCounts.like} · 💡 {reactionCounts.insightful} · ❤️ {reactionCounts.love} ·{" "}
            {initialCommentCount.toLocaleString()} comment{initialCommentCount === 1 ? "" : "s"}
          </p>
        </div>

        {hasEngagementAccess ? (
          <div className="flex items-center gap-2 md:justify-end">
            {REACTION_TYPES.map(({ type, label, icon }) => {
              const isSelected = viewerReactionType === type;

              return (
                <button
                  key={type}
                  type="button"
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-border/60 bg-muted text-muted-foreground cursor-default"
                      : "border-border/70 bg-background hover:bg-secondary/70"
                  }`}
                  onClick={() => void handleReaction(type)}
                  disabled={isLoading || isSelected}
                  aria-label={label}
                  aria-pressed={isSelected}
                  aria-disabled={isSelected || undefined}
                >
                  <span aria-hidden>{icon}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
