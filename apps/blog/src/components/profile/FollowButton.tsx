"use client";

import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import type { FollowStats } from "@/lib/follows";
import { getFollowStatsForProfile } from "@/lib/follows";
import { useAuth } from "@/contexts/AuthContext";

type FollowButtonProps = {
  profileUserId: string;
  initialIsFollowing: boolean;
  onSuccess?: (stats: FollowStats) => void;
  /** Optional; when omitted, uses client getFollowStatsForProfile with auth supabase. */
  getFollowStatsAction?: (profileUserId: string) => Promise<FollowStats>;
  className?: string;
  variant?: "default" | "icon";
};

const defaultIconClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-70";
const followingIndicatorIconClass =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/5 text-primary cursor-default";

export function FollowButton({
  profileUserId,
  initialIsFollowing,
  onSuccess,
  getFollowStatsAction,
  className,
  variant = "icon"
}: FollowButtonProps) {
  const { supabase, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !supabase) return null;

  const fetchStats = () =>
    getFollowStatsAction
      ? getFollowStatsAction(profileUserId)
      : getFollowStatsForProfile(supabase, profileUserId, user.id);

  const handleClick = async () => {
    if (isLoading || isFollowing) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from("user_follows").insert({
        follower_id: user.id,
        following_id: profileUserId
      });
      if (error) throw error;
      setIsFollowing(true);
      const stats = await fetchStats();
      onSuccess?.(stats);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFollowing) {
    const indicatorClass = className ?? followingIndicatorIconClass;
    return (
      <span
        className={indicatorClass}
        role="status"
        aria-label="Following"
        title="Following"
      >
        <UserCheck className="h-4 w-4" aria-hidden />
      </span>
    );
  }

  const buttonClass = className ?? defaultIconClass;
  const label = isLoading ? "Updating…" : "Follow";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={label}
      title={label}
      className={buttonClass}
    >
      {variant === "icon" ? (
        isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <UserPlus className="h-4 w-4" aria-hidden />
        )
      ) : (
        <>{isLoading ? "…" : "Follow"}</>
      )}
    </button>
  );
}
