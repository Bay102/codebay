"use client";

import { useRef, useState } from "react";
import type { FollowStats } from "@/lib/follows";
import type { LandingProfile } from "@/lib/landing";
import { blogUrl } from "@/lib/site-urls";
import { Popover, PopoverContent, PopoverTrigger, ProfilePreviewContent, SurfaceCard } from "@codebay/ui";
import { FollowButton } from "@/components/pages/dashboard/FollowButton";
import { useAuth } from "@/contexts/AuthContext";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CB";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[1]![0]).toUpperCase();
}

type TrendingProfileCardProps = {
  profile: LandingProfile;
  getFollowStatsAction: (profileUserId: string) => Promise<FollowStats>;
};

export function TrendingProfileCard({ profile, getFollowStatsAction }: TrendingProfileCardProps) {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();
  const href = `${blogUrl}/author/${profile.username}`;
  const showFollowButton = user != null && user.id !== profile.id;

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

  const followButton =
    showFollowButton ? (
      <FollowButton
        profileUserId={profile.id}
        initialIsFollowing={false}
        getFollowStatsAction={getFollowStatsAction}
        variant="icon"
      />
    ) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <SurfaceCard as="article" variant="card" className="flex flex-col gap-2">
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex w-full items-center gap-2 text-left"
            onMouseEnter={() => {
              clearCloseTimeout();
              setOpen(true);
            }}
            onMouseLeave={scheduleClose}
            onClick={() => setOpen((previous) => !previous)}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-xs font-medium text-foreground">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name} avatar`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                getInitials(profile.name)
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
              <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
            </div>
          </button>
        </PopoverTrigger>

        {profile.bio ? (
          <p className="mt-1 line-clamp-3 text-xs leading-6 text-muted-foreground">
            {profile.bio}
          </p>
        ) : null}

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-[min(90vw,20rem)] sm:w-80 max-h-[min(80dvh,480px)] overflow-y-auto rounded-2xl bg-card/95 p-4"
          onMouseEnter={clearCloseTimeout}
          onMouseLeave={scheduleClose}
        >
          <ProfilePreviewContent
            profile={{
              name: profile.name,
              username: profile.username,
              avatarUrl: profile.avatarUrl
            }}
            sections={{
              bio: profile.bio ?? undefined,
              techStack: profile.techStack.length > 0 ? profile.techStack : undefined,
              articles:
                profile.featuredArticles.length > 0
                  ? profile.featuredArticles.map((a) => ({ title: a.title, href: a.href }))
                  : undefined
            }}
            authorPageHref={href}
            authorPageLabel="Open full profile"
            followButton={followButton}
          />
        </PopoverContent>
      </SurfaceCard>
    </Popover>
  );
}
