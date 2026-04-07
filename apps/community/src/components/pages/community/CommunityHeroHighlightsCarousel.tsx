"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, Flame, MessageSquareText, Rss, Sparkles, Target } from "lucide-react";
import { ContentScoreMarker } from "@/components/shared/ContentScoreMarker";
import type { ContentScoreSummary } from "@/lib/content-scoring";

type FeaturedDiscussionPayload = {
  title: string;
  href: string;
  comments: number;
  reactions: number;
  momentumSummary: ContentScoreSummary;
  impactSummary: ContentScoreSummary;
};

type FeaturedBlogPayload = {
  title: string;
  href: string;
  views: number;
  comments: number;
  reactions: number;
  momentumSummary: ContentScoreSummary;
  impactSummary: ContentScoreSummary;
};

type CommunityHeroHighlightsCarouselProps = {
  featuredDiscussion: FeaturedDiscussionPayload | null;
  featuredBlog: FeaturedBlogPayload | null;
  intervalMs?: number;
};

type Slide = {
  id: "marketing" | "discussion" | "blog";
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
  ctaLabel: string;
  icon: typeof Activity;
  scoreSummaries?: [ContentScoreSummary, ContentScoreSummary];
  stats: { label: string; value: string }[];
};

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function CommunityHeroHighlightsCarousel({
  featuredDiscussion,
  featuredBlog,
  intervalMs = 5000
}: CommunityHeroHighlightsCarouselProps) {
  const slideCardHeightClass = "min-h-[232px] sm:h-[236px]";
  const slides = useMemo<Slide[]>(
    () => [
      {
        id: "marketing",
        eyebrow: "Marketing CTA",
        title: "Build momentum with the right technical audience.",
        detail:
          "Launch discussions, publish content, and turn reactions into repeat engagement from builders following your domain.",
        href: "/blogs",
        ctaLabel: "Explore community content",
        icon: Sparkles,
        stats: [
          { label: "Discovery", value: "Momentum" },
          { label: "Signal", value: "Impact" }
        ]
      },
      {
        id: "discussion",
        eyebrow: "Featured Discussion",
        title: featuredDiscussion?.title ?? "Join live engineering threads",
        detail:
          "Follow active debates and contribute practical implementation insights where teams compare trade-offs in real time.",
        href: featuredDiscussion?.href ?? "/discussions",
        ctaLabel: "Open discussions",
        icon: MessageSquareText,
        scoreSummaries: featuredDiscussion
          ? [featuredDiscussion.momentumSummary, featuredDiscussion.impactSummary]
          : undefined,
        stats: [
          { label: "Comments", value: formatCompactNumber(featuredDiscussion?.comments ?? 0) },
          { label: "Reactions", value: formatCompactNumber(featuredDiscussion?.reactions ?? 0) }
        ]
      },
      {
        id: "blog",
        eyebrow: "Featured Blog Post",
        title: featuredBlog?.title ?? "Catch up on high-signal releases",
        detail:
          "Track practical write-ups and postmortems as soon as they publish to stay current on modern engineering patterns.",
        href: featuredBlog?.href ?? "/blogs",
        ctaLabel: "Browse posts",
        icon: Rss,
        scoreSummaries: featuredBlog ? [featuredBlog.momentumSummary, featuredBlog.impactSummary] : undefined,
        stats: [
          { label: "Views", value: formatCompactNumber(featuredBlog?.views ?? 0) },
          { label: "Interactions", value: formatCompactNumber((featuredBlog?.comments ?? 0) + (featuredBlog?.reactions ?? 0)) }
        ]
      }
    ],
    [featuredBlog, featuredDiscussion]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, slides.length]);

  const activeSlide = slides[activeIndex];
  const Icon = activeSlide.icon;

  return (
    <div className="border border-border/60 bg-background/80 p-3.5 backdrop-blur sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">Community spotlight</div>
        <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
          <Activity className="h-3 w-3" />
          Auto rotate
        </div>
      </div>

      <Link
        href={activeSlide.href}
        className={`group/carousel mt-2.5 block border border-border/60 bg-card/70 p-3 transition-colors hover:border-primary/50 hover:bg-card ${slideCardHeightClass}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/90">
              <Icon className="h-3.5 w-3.5" />
              {activeSlide.eyebrow}
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover/carousel:text-primary" />
          </div>

          <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-foreground">{activeSlide.title}</h3>
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground sm:text-xs sm:leading-5">{activeSlide.detail}</p>

          {/* Reserve score rail height so all current/future slides stay equal-height. */}
          {activeSlide.scoreSummaries ? (
            <div className="mt-2 min-h-[26px]">
              <div className="grid gap-1.5 sm:grid-cols-2">
                <ContentScoreMarker summary={activeSlide.scoreSummaries[0]} periodLabelOverride="7D" />
                <ContentScoreMarker summary={activeSlide.scoreSummaries[1]} periodLabelOverride="30D" />
              </div>
            </div>
          ) : (
            <div className="mt-2 min-h-[26px]" />
          )}

          <div className="mt-2 flex items-center gap-3">
            {activeSlide.stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{stat.label}</div>
                <div className="text-xs font-semibold text-foreground">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto inline-flex items-center gap-1 pt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-primary/90 sm:text-[11px]">
            {activeSlide.id === "discussion" ? <Flame className="h-3 w-3" /> : null}
            {activeSlide.id === "blog" ? <Target className="h-3 w-3" /> : null}
            {activeSlide.ctaLabel}
          </div>
        </div>
      </Link>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show ${slide.eyebrow}`}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-5 bg-primary" : "w-2 bg-border hover:bg-border/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
