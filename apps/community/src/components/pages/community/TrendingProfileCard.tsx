"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { FollowStats } from "@/lib/follows";
import type { LandingProfile } from "@/lib/landing";
import { blogUrl } from "@/lib/site-urls";
import { SurfaceCard } from "@codebay/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FollowButton } from "@/components/pages/dashboard/FollowButton";
import { useAuth } from "@/contexts/AuthContext";

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
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
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary text-sm font-semibold">
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
            <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
              </div>
              {showFollowButton ? (
                <FollowButton
                  profileUserId={profile.id}
                  initialIsFollowing={false}
                  getFollowStatsAction={getFollowStatsAction}
                  className="shrink-0 h-8 rounded-md border border-primary/40 bg-primary/10 px-3 text-xs font-medium text-primary hover:bg-primary/20"
                />
              ) : null}
            </div>
          </div>

          {profile.techStack.length > 0 ? (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tech stack</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {profile.techStack.slice(0, 6).map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[10px] text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {profile.featuredArticles.length > 0 ? (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Featured articles
              </p>
              <div className="mt-1.5 space-y-1">
                {profile.featuredArticles.slice(0, 4).map((article) => (
                  <Link
                    key={article.href}
                    href={article.href}
                    className="block truncate rounded-md px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60 hover:text-primary"
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-3 border-t border-border/70 pt-2.5">
            <Link
              href={href}
              className="inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Open full profile
            </Link>
          </div>
        </PopoverContent>
      </SurfaceCard>
    </Popover>
  );
}

