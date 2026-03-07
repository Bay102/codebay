"use client";

import * as React from "react";

import type {
  ProfilePreviewHeader,
  ProfilePreviewSections,
  ProfilePreviewProject,
  ProfilePreviewArticle,
  ProfilePreviewLink
} from "@codebay/ui";
import { Popover, PopoverContent, PopoverTrigger, ProfilePreviewContent } from "@codebay/ui";
import type { FollowStats } from "@/lib/follows";
import { getFollowStatsForProfile } from "@/lib/follows";
import { FollowButton } from "@/components/profile/FollowButton";
import { useAuth } from "@/contexts/AuthContext";

const followStatsCache = new Map<string, FollowStats>();

/** Re-export shared types for consumers that import from this file */
export type {
  ProfilePreviewHeader,
  ProfilePreviewSections,
  ProfilePreviewProject,
  ProfilePreviewArticle,
  ProfilePreviewLink
};

export interface ProfilePreviewPopoverProps {
  profile: ProfilePreviewHeader;
  /** Optional sections to display. Omit a section to hide it. */
  sections?: ProfilePreviewSections;
  /** Link to full profile/author page */
  authorPageHref?: string;
  /** When set and viewer is logged in and not self, show follow icon button. */
  profileId?: string;
  children?: React.ReactNode;
}

function buildInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "CB";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

export function ProfilePreviewPopover({
  profile,
  sections = {},
  authorPageHref,
  profileId,
  children
}: ProfilePreviewPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [followStats, setFollowStats] = React.useState<FollowStats | null>(null);
  const { supabase, user } = useAuth();

  const showFollowButton = Boolean(profileId && user && supabase && user.id !== profileId);

  React.useEffect(() => {
    if (!open || !profileId || !user || !supabase) {
      return;
    }

    const cached = followStatsCache.get(profileId);
    if (cached) {
      setFollowStats(cached);
      return;
    }

    let isCancelled = false;

    getFollowStatsForProfile(supabase, profileId, user.id).then((stats) => {
      if (!isCancelled) {
        followStatsCache.set(profileId, stats);
        setFollowStats(stats);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [open, profileId, user?.id, supabase]);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const clearOpenTimeout = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    clearOpenTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  };

  const handleTriggerMouseEnter = () => {
    clearCloseTimeout();
    clearOpenTimeout();
    openTimeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 180);
  };

  const handleTriggerMouseLeave = () => {
    scheduleClose();
  };

  const handleContentMouseEnter = () => {
    clearCloseTimeout();
    clearOpenTimeout();
  };

  const handleContentMouseLeave = () => {
    scheduleClose();
  };

  const followButton =
    showFollowButton && profileId && followStats && typeof followStats.isFollowing !== "undefined" ? (
      <FollowButton
        key={profileId}
        profileUserId={profileId}
        initialIsFollowing={followStats.isFollowing ?? false}
        variant="icon"
      />
    ) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-16 w-16 items-center justify-center rounded-full border border-border/70 bg-secondary text-base font-semibold sm:h-20 sm:w-20"
          aria-label={`View ${profile.name}'s profile`}
          onMouseEnter={handleTriggerMouseEnter}
          onMouseLeave={handleTriggerMouseLeave}
          onClick={() => setOpen((previous) => !previous)}
        >
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={`${profile.name} avatar`}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            buildInitials(profile.name)
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        sideOffset={12}
        className="w-80 max-h-[min(80dvh,480px)] overflow-y-auto rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur"
        onMouseEnter={handleContentMouseEnter}
        onMouseLeave={handleContentMouseLeave}
      >
        <ProfilePreviewContent
          profile={profile}
          sections={sections}
          authorPageHref={authorPageHref}
          authorPageLabel="View full author profile"
          followButton={followButton}
          followStats={
            followStats
              ? {
                followerCount: followStats.followerCount,
                followingCount: followStats.followingCount
              }
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
}
