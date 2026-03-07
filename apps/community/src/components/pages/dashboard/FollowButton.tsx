"use client";

import { Loader2, UserCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { FollowStats } from "@/lib/follows";
import { useAuth } from "@/contexts/AuthContext";

type FollowButtonProps = {
  profileUserId: string;
  initialIsFollowing: boolean;
  onSuccess?: (stats: FollowStats) => void;
  getFollowStatsAction: (profileUserId: string) => Promise<FollowStats>;
  className?: string;
  /** When "icon", renders only an icon (person when not following, person-with-check when following). */
  variant?: "default" | "icon";
};

const defaultButtonClass =
  "inline-flex h-8 items-center rounded-md border border-primary/40 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-70";
const defaultIconClass =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-70";
const followingIndicatorIconClass =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/5 text-primary cursor-default";
const followingIndicatorButtonClass =
  "inline-flex h-8 items-center rounded-md border border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary cursor-default";

export function FollowButton({
  profileUserId,
  initialIsFollowing,
  onSuccess,
  getFollowStatsAction,
  className,
  variant = "default"
}: FollowButtonProps) {
  const { supabase, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  if (!user || !supabase) return null;

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
      const stats = await getFollowStatsAction(profileUserId);
      onSuccess?.(stats);
    } finally {
      setIsLoading(false);
    }
  };

  const isIcon = variant === "icon";

  if (isFollowing) {
    const indicatorClass =
      className ?? (isIcon ? followingIndicatorIconClass : followingIndicatorButtonClass);
    return (
      <span
        className={indicatorClass}
        role="status"
        aria-label="Following"
        title="Following"
      >
        {isIcon ? (
          <UserCheck className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <>
            <UserCheck className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Following
          </>
        )}
      </span>
    );
  }

  const buttonClass = className ?? (isIcon ? defaultIconClass : defaultButtonClass);
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
      {isIcon ? (
        isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : (
          <UserRound className="h-3.5 w-3.5" aria-hidden />
        )
      ) : (
        <>
          {isLoading ? (
            "…"
          ) : (
            <>
              <UserRound className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Follow
            </>
          )}
        </>
      )}
    </button>
  );
}
