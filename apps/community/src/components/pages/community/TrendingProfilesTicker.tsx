"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LandingProfile } from "@/lib/landing";
import type { FollowStats } from "@/lib/follows";
import { TrendingProfileCard } from "./TrendingProfileCard";

type LandingProfileWithFollowers = LandingProfile & { followerCount: number };

type TrendingProfilesTickerProps = {
  profiles: LandingProfileWithFollowers[];
  getFollowStatsAction: (profileUserId: string) => Promise<FollowStats>;
};

const AUTO_SCROLL_INTERVAL = 5000;

export function TrendingProfilesTicker({ profiles, getFollowStatsAction }: TrendingProfilesTickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const hasMultipleProfiles = profiles.length > 1;

  const clampedPageIndex = useMemo(
    () => (pageCount > 0 ? Math.min(pageIndex, pageCount - 1) : 0),
    [pageIndex, pageCount]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || profiles.length === 0) return;

    const computePages = () => {
      const firstCard = container.querySelector<HTMLElement>("[data-profile-card]");
      if (!firstCard) {
        setPageCount(1);
        return;
      }

      const containerWidth = container.clientWidth;
      const cardWidth = firstCard.offsetWidth || 1;
      const cardsPerPage = Math.max(1, Math.floor(containerWidth / cardWidth));
      const totalPages = Math.max(1, Math.ceil(profiles.length / cardsPerPage));
      setPageCount(totalPages);
    };

    computePages();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => computePages());
      observer.observe(container);
      return () => observer.disconnect();
    }

    const onResize = () => computePages();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [profiles.length]);

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const target = clampedPageIndex * width;

    container.scrollTo({
      left: target,
      behavior: "smooth"
    });
  }, [clampedPageIndex]);

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
        ref={containerRef}
        className="overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Profiles getting noticed carousel"
      >
        <div className="flex gap-3 px-0.5 sm:px-1 snap-x snap-mandatory">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="snap-start shrink-0 w-full sm:w-[260px] md:w-[320px]"
              data-profile-card
            >
              <TrendingProfileCard profile={profile} getFollowStatsAction={getFollowStatsAction} />
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="mt-3 flex justify-end text-[11px]">
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
                    className={`inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border px-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                      isActive
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

