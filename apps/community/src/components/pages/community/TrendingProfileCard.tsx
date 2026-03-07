"use client";

import { useRef, useState, useEffect } from "react";
import { blogUrl } from "@/lib/site-urls";
import { Popover, PopoverContent, PopoverTrigger, ProfileCard, ProfilePreviewContent } from "@codebay/ui";
import type { FollowStats } from "@/lib/follows";
import type { LandingProfile } from "@/lib/landing";
import { FollowButton } from "@/components/pages/dashboard/FollowButton";
import { useAuth } from "@/contexts/AuthContext";
import { mapLandingProfileToProfileCardData } from "@/lib/ui-mappers";

type TrendingProfileWithFollowers = LandingProfile & { followerCount: number };

type TrendingProfileCardProps = {
  profile: TrendingProfileWithFollowers;
  getFollowStatsAction: (profileUserId: string) => Promise<FollowStats>;
};

const MOBILE_BREAKPOINT = 640;

export function TrendingProfileCard({ profile, getFollowStatsAction }: TrendingProfileCardProps) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [followerCount, setFollowerCount] = useState<number>(profile.followerCount);
  const { user } = useAuth();

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const href = `${blogUrl}/${profile.username}`;
  const showFollowButton = user != null && user.id !== profile.id;

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

  const followButton =
    showFollowButton ? (
      <FollowButton
        profileUserId={profile.id}
        initialIsFollowing={false}
        getFollowStatsAction={getFollowStatsAction}
        onSuccess={(stats) => {
          setFollowerCount(stats.followerCount);
        }}
        variant="icon"
      />
    ) : null;

  const profileCardData = {
    ...mapLandingProfileToProfileCardData(profile, followerCount),
    followerCount,
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="w-full text-left"
          onMouseEnter={() => {
            clearCloseTimeout();
            clearOpenTimeout();
            openTimeoutRef.current = setTimeout(() => {
              setOpen(true);
            }, 180);
          }}
          onMouseLeave={scheduleClose}
          onClick={() => {
            clearOpenTimeout();
            clearCloseTimeout();
            setOpen((previous) => !previous);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              clearOpenTimeout();
              clearCloseTimeout();
              setOpen((previous) => !previous);
            }
          }}
        >
          <ProfileCard
            profile={profileCardData}
            // followButton={followButton}
            className="h-[180px]"
            showBio
            showStats
            showTechStack={false}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="center"
        side={isMobile ? "bottom" : "right"}
        sideOffset={8}
        collisionPadding={16}
        className="w-[min(90vw,20rem)] sm:w-80 max-h-[min(80dvh,480px)] overflow-y-auto rounded-2xl bg-card/95 p-4"
        onMouseEnter={clearCloseTimeout}
        onMouseLeave={scheduleClose}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <ProfilePreviewContent
          profile={{
            name: profile.name,
            username: profile.username,
            avatarUrl: profile.avatarUrl
          }}
          sections={{
            // bio: profile.bio ?? undefined,
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
    </Popover>
  );
}
