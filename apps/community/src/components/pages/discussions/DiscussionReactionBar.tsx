"use client";

import { useState } from "react";
import { setDiscussionReaction, removeDiscussionReaction } from "@/lib/discussions";
import { useAuth } from "@/contexts/AuthContext";

const REACTION_TYPES = [
  { type: "like", label: "Like", icon: "👍" },
  { type: "insightful", label: "Insightful", icon: "💡" },
  { type: "love", label: "Love", icon: "❤️" }
] as const;

type DiscussionReactionBarProps = {
  discussionId: string;
  slug: string;
  initialCommentCount: number;
  initialReactionCount: number;
  initialViewerReactionType: string | null;
};

export function DiscussionReactionBar({
  discussionId,
  slug,
  initialCommentCount,
  initialReactionCount,
  initialViewerReactionType
}: DiscussionReactionBarProps) {
  const { supabase, user } = useAuth();
  const [reactionCount, setReactionCount] = useState(initialReactionCount);
  const [viewerReactionType, setViewerReactionType] = useState<string | null>(initialViewerReactionType);
  const [isLoading, setIsLoading] = useState(false);

  const handleReaction = async (reactionType: string) => {
    if (!supabase || !user || isLoading) return;
    setIsLoading(true);
    try {
      const isActive = viewerReactionType === reactionType;
      if (isActive) {
        await removeDiscussionReaction(supabase, discussionId, user.id, reactionType);
        setViewerReactionType(null);
        setReactionCount((c) => Math.max(0, c - 1));
      } else {
        await setDiscussionReaction(supabase, discussionId, user.id, reactionType);
        if (viewerReactionType) setReactionCount((c) => Math.max(0, c - 1));
        setViewerReactionType(reactionType);
        setReactionCount((c) => c + (viewerReactionType ? 0 : 1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
      <span className="text-xs text-muted-foreground">{initialCommentCount} comments</span>
      <span className="text-xs text-muted-foreground" aria-hidden>
        ·
      </span>
      <span className="text-xs text-muted-foreground">{reactionCount} reactions</span>
      {user && supabase ? (
        <div className="flex gap-2">
          {REACTION_TYPES.map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleReaction(type)}
              disabled={isLoading}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-70 ${
                viewerReactionType === type
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border/70 bg-background hover:bg-secondary/70"
              }`}
              aria-pressed={viewerReactionType === type}
              aria-label={label}
            >
              <span aria-hidden>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
