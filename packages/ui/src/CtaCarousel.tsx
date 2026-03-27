"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Flame, Heart, MessageSquare, Newspaper, Target, Users, type LucideIcon } from "lucide-react";
import { SurfaceCard } from "./SurfaceCard";
import { cn } from "./utils";

const SLIDE_ICONS = {
  discussions: MessageSquare,
  community: Users,
  updates: Bell,
  engage: Heart,
  newsletter: Newspaper
} as const satisfies Record<string, LucideIcon>;

export type CtaCarouselSlideIcon = keyof typeof SLIDE_ICONS;

export type CtaCarouselSlide = {
  title: string;
  body: string;
  /**
   * Optional Lucide icon key shown beside the slide copy for stronger visual hierarchy.
   */
  icon?: CtaCarouselSlideIcon;
  /**
   * Optional visual demo for a slide.
   */
  preview?: "score-markers";
};

export type CtaCarouselProps = {
  /**
   * Small label above the main heading, e.g. "Why join the community".
   * When both eyebrow and heading are empty, the outer card border is omitted.
   */
  eyebrow?: string;
  /**
   * Main heading for the section, e.g. "A focused space for engineers who actually ship".
   * When both eyebrow and heading are empty, the outer card border is omitted.
   */
  heading?: string;
  /**
   * Carousel slides to rotate through.
   */
  slides: CtaCarouselSlide[];
  /**
   * Interval between automatic slide changes, in milliseconds.
   */
  intervalMs?: number;
  /**
   * Extra Tailwind classes for the outer `SurfaceCard`.
   */
  className?: string;
  /**
   * Variant of the `SurfaceCard`.
   */
  variant?: "card" | "panel" | "hero" | "subtle";
};

export function CtaCarousel({
  eyebrow = "",
  heading = "",
  slides,
  intervalMs = 4500,
  className,
  variant = "card"
}: CtaCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const hasHeader = Boolean(eyebrow?.trim() || heading?.trim());
  const pointerStartXRef = useRef<number | null>(null);
  const lastWheelNavAtRef = useRef(0);

  const goToNextSlide = () => {
    setIndex((current) => (current + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const id = window.setInterval(() => {
      goToNextSlide();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, isPaused, slides.length]);

  const activeSlide = slides[index];
  const IconComponent = activeSlide.icon ? SLIDE_ICONS[activeSlide.icon] : null;
  const showScorePreview = activeSlide.preview === "score-markers";
  const swipeThreshold = 40;
  const previewPlaceholder = (
    <div className="h-[54px] w-[108px] rounded-md border border-transparent bg-transparent" aria-hidden />
  );
  const scorePreview = showScorePreview ? (
    <div className="rounded-md border border-border/70 bg-background/70 px-2 py-1.5">
      <div className="inline-flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded border border-border/60 bg-card px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground/90">
          <Flame className="h-3 w-3 text-primary/90" aria-hidden />
          <span>24H</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded border border-border/60 bg-card px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-foreground/90">
          <Target className="h-3 w-3 text-primary/90" aria-hidden />
          <span>30D</span>
        </span>
      </div>
      <svg
        viewBox="0 0 108 22"
        className="mt-1.5 h-5.5 w-[108px] text-primary/80"
        role="img"
        aria-label="Momentum and Impact trend example"
      >
        <path d="M2 16 L16 15 L28 11 L40 13 L54 8 L66 10 L78 6 L92 8 L106 4" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        <path d="M2 20 L16 18 L28 17 L40 14 L54 13 L66 11 L78 10 L92 8 L106 7" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      </svg>
    </div>
  ) : null;

  const innerContent = (
    <div
      className={cn(
        "relative overflow-hidden border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-card/80 to-card/40 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-3.5",
        "before:pointer-events-none before:absolute before:-right-12 before:-top-12 before:h-40 before:w-40 before:rounded-full before:bg-primary/10 before:blur-3xl"
      )}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch") {
          return;
        }

        pointerStartXRef.current = event.clientX;
        setIsPaused(true);
      }}
      onPointerUp={(event) => {
        if (event.pointerType !== "touch" || pointerStartXRef.current === null) {
          return;
        }

        const deltaX = event.clientX - pointerStartXRef.current;
        pointerStartXRef.current = null;
        setIsPaused(false);

        if (Math.abs(deltaX) < swipeThreshold) {
          return;
        }

        if (deltaX < 0) {
          goToNextSlide();
          return;
        }

        goToPrevSlide();
      }}
      onPointerCancel={() => {
        pointerStartXRef.current = null;
        setIsPaused(false);
      }}
      onWheel={(event) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 18) {
          return;
        }

        const now = Date.now();
        if (now - lastWheelNavAtRef.current < 450) {
          return;
        }

        lastWheelNavAtRef.current = now;
        setIsPaused(true);
        window.setTimeout(() => setIsPaused(false), 900);

        if (event.deltaX > 0) {
          goToNextSlide();
          return;
        }

        goToPrevSlide();
      }}
    >
      <div
        key={index}
        className={cn(
          "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3.5",
          IconComponent ? "items-start" : "justify-center",
          IconComponent && "animate-in fade-in duration-300"
        )}
      >
        {IconComponent && (
          <div
            className="flex shrink-0 justify-center sm:justify-start"
            aria-hidden
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/25 shadow-sm sm:h-11 sm:w-11">
              <IconComponent className="h-5 w-5 text-primary sm:h-5.5 sm:w-5.5" strokeWidth={1.75} />
            </div>
          </div>
        )}
        <div className="min-w-0 flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 text-left">
            <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-[0.95rem]">{activeSlide.title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{activeSlide.body}</p>
          </div>
          <div className="inline-flex shrink-0 sm:min-w-[108px] sm:justify-end">{showScorePreview ? scorePreview : previewPlaceholder}</div>
        </div>
      </div>

      <div className="mt-2.5 flex justify-start gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Show "${slide.title}"`}
            className={cn(
              "h-1.5 w-4 rounded-full transition-colors",
              i === index ? "bg-primary" : "bg-border/70 hover:bg-border"
            )}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );

  if (!hasHeader) {
    return (
      <section className={cn("mt-4", className)}>
        {innerContent}
      </section>
    );
  }

  const showHeading = Boolean(heading?.trim());

  return (
    <SurfaceCard as="section" variant="borderless" className={cn("mt-4", className)}>
      {eyebrow?.trim() ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      ) : null}
      {showHeading ? (
        <h2 className={cn("text-xl font-semibold text-foreground sm:text-2xl", eyebrow?.trim() && "mt-2")}>
          {heading}
        </h2>
      ) : null}
      <div className={cn(showHeading || eyebrow?.trim() ? "mt-4" : undefined)}>{innerContent}</div>
    </SurfaceCard>
  );
}

