"use client";

import { useEffect, useMemo, useState } from "react";
import type { LandingProfile } from "@/lib/landing";
import type { FollowStats } from "@/lib/follows";
import { TrendingProfileCard } from "./TrendingProfileCard";

type LandingProfileWithFollowers = LandingProfile & {
  followerCount: number;
  isFollowing?: boolean;
};

type TrendingProfilesTickerProps = {
  profiles: LandingProfileWithFollowers[];
  getFollowStatsAction: (profileUserId: string) => Promise<FollowStats>;
};

const AUTO_SCROLL_INTERVAL = 8000;

/** Cards per page = 2 rows × columns (Tailwind sm=640, md=768). */
function getCardsPerPage(width: number): number {
  if (width < 640) return 4;
  if (width < 768) return 6;
  return 8;
}

export function TrendingProfilesTicker({ profiles, getFollowStatsAction }: TrendingProfilesTickerProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [cardsPerPage, setCardsPerPage] = useState(8);

  const hasMultipleProfiles = profiles.length > 1;

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(profiles.length / cardsPerPage)),
    [profiles.length, cardsPerPage]
  );

  const clampedPageIndex = useMemo(
    () => (pageCount > 0 ? Math.min(pageIndex, pageCount - 1) : 0),
    [pageIndex, pageCount]
  );

  const visibleProfiles = useMemo(() => {
    const start = clampedPageIndex * cardsPerPage;
    return profiles.slice(start, start + cardsPerPage);
  }, [profiles, clampedPageIndex, cardsPerPage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => setCardsPerPage(getCardsPerPage(window.innerWidth));

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!hasMultipleProfiles || pageCount <= 1 || isHovered) return;

    const id = window.setInterval(() => {
      setPageIndex((prev) => {
        if (pageCount <= 1) return 0;
        return (prev + 1) % pageCount;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => window.clearInterval(id);
  }, [hasMultipleProfiles, isHovered, pageCount]);

  if (profiles.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setPageIndex((prev) => {
      if (pageCount <= 1) return 0;
      return prev === 0 ? pageCount - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setPageIndex((prev) => {
      if (pageCount <= 1) return 0;
      return (prev + 1) % pageCount;
    });
  };

  return (
    <div
      className="relative mt-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        aria-label="Profiles getting noticed"
      >
        {visibleProfiles.map((profile) => (
          <div key={profile.id} data-profile-card>
            <TrendingProfileCard profile={profile} getFollowStatsAction={getFollowStatsAction} />
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex justify-center text-[11px]">
          <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/90 px-1.5 py-0.5 shadow-sm">
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70"
              aria-label="Previous profiles"
            >
              ←
            </button>
            <div className="inline-flex items-center gap-0.5">
              {Array.from({ length: pageCount }, (_, index) => {
                const page = index;
                const isActive = page === clampedPageIndex;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setPageIndex(page)}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border px-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors ${isActive
                      ? "border-primary/80 bg-primary/90 text-primary-foreground shadow-sm"
                      : "border-border/60 bg-background/90 text-muted-foreground hover:bg-secondary/80"
                      }`}
                  >
                    {page + 1}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/70"
              aria-label="Next profiles"
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

