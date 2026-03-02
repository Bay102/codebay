"use client";

import { useEffect, useState } from "react";
import { SurfaceCard } from "@codebay/ui";

const slides = [
  {
    title: "Real-world engineering discussions",
    body: "See how other teams ship AI features, debug production issues, and reason about architecture trade-offs."
  },
  {
    title: "Tight feedback loop with the CodeBay team",
    body: "Ask questions, share context, and influence what we build next in the platform and open-source tools."
  },
  {
    title: "Patterns, templates, and reference implementations",
    body: "Reuse production-tested flows for auth, billing, AI workflows, and more—without starting from scratch."
  },
  {
    title: "Ship faster with other builders",
    body: "Surround yourself with engineers shipping similar stacks so you can unblock each other quickly."
  }
];

export function WhyJoinCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(id);
  }, []);

  const activeSlide = slides[index];

  return (
    <SurfaceCard as="section" variant="hero" className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Why join the community</p>
      <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
        A focused space for engineers who actually ship
      </h2>

      <div className="mt-4 rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5">
        <h3 className="text-base font-semibold text-foreground sm:text-lg">{activeSlide.title}</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
          {activeSlide.body}
        </p>

        <div className="mt-3 flex gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show "${slide.title}"`}
              className={`h-1.5 w-4 rounded-full transition-colors ${
                i === index ? "bg-primary" : "bg-border/70"
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}

