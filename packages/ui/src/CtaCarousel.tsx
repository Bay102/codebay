"use client";

import { useEffect, useState } from "react";
import { SurfaceCard } from "./SurfaceCard";
import { cn } from "./utils";

export type CtaCarouselSlide = {
  title: string;
  body: string;
};

export type CtaCarouselProps = {
  /**
   * Small label above the main heading, e.g. "Why join the community".
   */
  eyebrow: string;
  /**
   * Main heading for the section, e.g. "A focused space for engineers who actually ship".
   */
  heading: string;
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
  eyebrow,
  heading,
  slides,
  intervalMs = 4500,
  className,
  variant = "card"
}: CtaCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, slides.length]);

  const activeSlide = slides[index];

  return (
    <SurfaceCard as="section" variant={variant} className={cn("mt-4", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{heading}</h2>

      <div className="mt-4 rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5">
        <h3 className="text-base font-semibold text-foreground sm:text-lg">{activeSlide.title}</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{activeSlide.body}</p>

        <div className="mt-3 flex gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show "${slide.title}"`}
              className={cn(
                "h-1.5 w-4 rounded-full transition-colors",
                i === index ? "bg-primary" : "bg-border/70"
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}

