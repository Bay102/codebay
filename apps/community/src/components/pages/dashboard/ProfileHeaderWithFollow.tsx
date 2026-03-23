"use client";

import { useState, type ReactNode } from "react";
import type { FollowStats } from "@/lib/follows";
import { getFollowStatsAction } from "@/lib/actions";
import { FollowButton } from "@/components/pages/dashboard/FollowButton";
import { FollowListModal } from "@/components/pages/dashboard/FollowListModal";

type ProfileHeaderWithFollowProps = {
  profileId: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  initialFollowerCount: number;
  initialFollowingCount: number;
  initialIsFollowing?: boolean;
  showEditLink: boolean;
  /** When set and not self, show Follow button. When set (including self), show counts and modals. */
  viewerId: string | null;
  /** Only show follow section (counts + button) when this is true (e.g. public profile or dashboard with counts). */
  showFollowSection: boolean;
  /** Profile action links (e.g. View blog); rendered after the Follow button when it is shown. */
  actionLinks: ReactNode;
};

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CB";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

export function ProfileHeaderWithFollow({
  profileId,
  username,
  name,
  avatarUrl,
  initialFollowerCount,
  initialFollowingCount,
  initialIsFollowing,
  showEditLink,
  viewerId,
  showFollowSection,
  actionLinks
}: ProfileHeaderWithFollowProps) {
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? false);
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);

  const handleFollowSuccess = (stats: FollowStats) => {
    setFollowerCount(stats.followerCount);
    setFollowingCount(stats.followingCount);
    if (stats.isFollowing !== undefined) setIsFollowing(stats.isFollowing);
  };

  const showFollowButton = showFollowSection && !showEditLink && viewerId != null && viewerId !== profileId;
  const showCounts = showFollowSection;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Profile</h2>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {showFollowButton ? (
            <FollowButton
              profileUserId={profileId}
              initialIsFollowing={isFollowing}
              onSuccess={handleFollowSuccess}
              getFollowStatsAction={getFollowStatsAction}
              variant="default"
            />
          ) : null}
          {actionLinks}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={`${name} avatar`} className="h-14 w-14 shrink-0 rounded-full border border-border/70 object-cover" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary text-sm font-semibold">
            {getInitials(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">@{username}</p>
          {showCounts ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => setFollowersOpen(true)}
                className="hover:text-foreground hover:underline"
              >
                {followerCount} {followerCount === 1 ? "follower" : "followers"}
              </button>
              <span aria-hidden>·</span>
              <button
                type="button"
                onClick={() => setFollowingOpen(true)}
                className="hover:text-foreground hover:underline"
              >
                {followingCount} following
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <FollowListModal
        open={followersOpen}
        onOpenChange={setFollowersOpen}
        mode="followers"
        userId={profileId}
        title="Followers"
      />
      <FollowListModal
        open={followingOpen}
        onOpenChange={setFollowingOpen}
        mode="following"
        userId={profileId}
        title="Following"
      />
    </>
  );
}
