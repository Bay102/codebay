"use client";

import { useEffect, useState } from "react";
import { Bell, Heart, MessageSquare, Newspaper, Users, type LucideIcon } from "lucide-react";
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
  const hasHeader = Boolean(eyebrow?.trim() || heading?.trim());

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, slides.length]);

  const activeSlide = slides[index];
  const IconComponent = activeSlide.icon ? SLIDE_ICONS[activeSlide.icon] : null;

  const innerContent = (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-card/80 to-card/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-5",
        "before:pointer-events-none before:absolute before:-right-12 before:-top-12 before:h-40 before:w-40 before:rounded-full before:bg-primary/10 before:blur-3xl"
      )}
    >
      <div
        key={index}
        className={cn(
          "flex gap-4",
          IconComponent ? "flex-col sm:flex-row sm:items-start" : "flex-col",
          IconComponent && "animate-in fade-in duration-300"
        )}
      >
        {IconComponent && (
          <div
            className="flex shrink-0 justify-center sm:justify-start"
            aria-hidden
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 ring-1 ring-primary/25 shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]">
              <IconComponent className="h-8 w-8 text-primary sm:h-9 sm:w-9" strokeWidth={1.75} />
            </div>
          </div>
        )}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{activeSlide.title}</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">{activeSlide.body}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1.5 sm:justify-start">
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

