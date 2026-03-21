import type { LucideIcon } from "lucide-react";
import { Heart, Lightbulb, Mail, MessageCircle, Reply, ThumbsUp } from "lucide-react";
import type { DashboardActivityItem } from "@/lib/dashboard";

/**
 * Reaction visuals match `DiscussionReactionBar` (like / insightful / love).
 * Comment rows use `MessageCircle` like the discussion engagement comment count.
 */
const REACTION_BY_TYPE = {
  like: { Icon: ThumbsUp, iconClassName: "text-primary" },
  insightful: { Icon: Lightbulb, iconClassName: "text-amber-500" },
  love: { Icon: Heart, iconClassName: "text-rose-500" }
} as const;

type KnownReactionType = keyof typeof REACTION_BY_TYPE;

/** Same types/colors as `DiscussionReactionBar` — single source for picker + notifications. */
export const COMMUNITY_REACTION_TYPES = (
  [
    ["like", "Helpful"],
    ["insightful", "Insightful"],
    ["love", "Loved"]
  ] as const
).map(([type, label]) => {
  const { Icon, iconClassName } = REACTION_BY_TYPE[type];
  return { type, label, Icon, iconColor: iconClassName };
});

export type CommunityReactionType = KnownReactionType;

export function getDashboardActivityIcon(item: DashboardActivityItem): {
  Icon: LucideIcon;
  iconClassName: string;
} {
  const { kind, reactionType } = item;

  if (kind === "blog_reaction" || kind === "discussion_reaction") {
    if (reactionType && reactionType in REACTION_BY_TYPE) {
      return REACTION_BY_TYPE[reactionType as KnownReactionType];
    }
    return { Icon: ThumbsUp, iconClassName: "text-muted-foreground" };
  }

  switch (kind) {
    case "comment":
    case "discussion_comment":
      return { Icon: MessageCircle, iconClassName: "text-muted-foreground" };
    case "reply":
      return { Icon: Reply, iconClassName: "text-muted-foreground" };
    case "direct_message":
      return { Icon: Mail, iconClassName: "text-muted-foreground" };
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}
