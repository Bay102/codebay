"use client";

import { useState } from "react";
import type { FollowStats } from "@/lib/follows";
import { useAuth } from "@/contexts/AuthContext";

type FollowButtonProps = {
  profileUserId: string;
  initialIsFollowing: boolean;
  onSuccess?: (stats: FollowStats) => void;
  getFollowStatsAction: (profileUserId: string) => Promise<FollowStats>;
  className?: string;
};

export function FollowButton({
  profileUserId,
  initialIsFollowing,
  onSuccess,
  getFollowStatsAction,
  className
}: FollowButtonProps) {
  const { supabase, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !supabase) return null;

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profileUserId);
        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase.from("user_follows").insert({
          follower_id: user.id,
          following_id: profileUserId
        });
        if (error) throw error;
        setIsFollowing(true);
      }
      const stats = await getFollowStatsAction(profileUserId);
      onSuccess?.(stats);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={
        className ??
        "inline-flex h-9 items-center rounded-md border border-primary/40 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-70"
      }
    >
      {isLoading ? "…" : isFollowing ? "Unfollow" : "Follow"}
    </button>
  );
}
