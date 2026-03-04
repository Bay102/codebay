"use client";

import * as React from "react";

import type {
  ProfilePreviewHeader,
  ProfilePreviewSections,
  ProfilePreviewProject,
  ProfilePreviewArticle,
  ProfilePreviewLink
} from "@codebay/ui";
import { ProfilePreviewContent } from "@codebay/ui";
import { getFollowStatsForProfile } from "@/lib/follows";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FollowButton } from "@/components/profile/FollowButton";
import { useAuth } from "@/contexts/AuthContext";

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
  const [followState, setFollowState] = React.useState<boolean | null>(null);
  const { supabase, user } = useAuth();

  const showFollowButton = Boolean(profileId && user && supabase && user.id !== profileId);

  React.useEffect(() => {
    if (!open || !profileId || !user || !supabase) {
      setFollowState(null);
      return;
    }
    setFollowState(null);
    getFollowStatsForProfile(supabase, profileId, user.id).then((stats) => {
      setFollowState(stats.isFollowing ?? false);
    });
  }, [open, profileId, user?.id, supabase]);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  };

  const handleTriggerMouseEnter = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  const handleTriggerMouseLeave = () => {
    scheduleClose();
  };

  const handleContentMouseEnter = () => {
    clearCloseTimeout();
  };

  const handleContentMouseLeave = () => {
    scheduleClose();
  };

  const followButton =
    showFollowButton && profileId && followState !== null ? (
      <FollowButton
        key={profileId}
        profileUserId={profileId}
        initialIsFollowing={followState}
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
        />
      </PopoverContent>
    </Popover>
  );
}
