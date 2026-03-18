"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import type { LandingTopic } from "@/lib/landing";

type TrendingTopicsTickerProps = {
  topics: LandingTopic[];
  blogUrl: string;
};

export function TrendingTopicsTicker({ topics, blogUrl }: TrendingTopicsTickerProps) {
  if (topics.length === 0) return null;

  const topicLinks = topics.map((topic, index) => {
    const href = `${blogUrl}?tag=${encodeURIComponent(topic.tag)}`;
    const isFeatured = index === 0;
    const postLabel = `${topic.postCount} ${topic.postCount === 1 ? "post" : "posts"}`;

    return (
      <div key={topic.tag} className="flex shrink-0 items-center">
        {index > 0 && (
          <span
            aria-hidden
            className="mx-3 h-1.5 w-1.5 rounded-full bg-primary/45 sm:mx-4"
          />
        )}
        <Link
          href={href}
          className={`group relative flex shrink-0 flex-col py-1 transition-transform duration-300 hover:-translate-y-0.5 ${isFeatured ? "text-foreground" : "text-foreground/72 hover:text-foreground"
            }`}
        >
          <span
            className={`font-mono-ticker text-lg font-semibold uppercase tracking-[0.28em] sm:text-xl lg:text-2xl ${isFeatured ? "text-primary" : ""
              }`}
          >
            {topic.tag}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-300 group-hover:text-primary/80 sm:text-[11px]">
            {postLabel}
          </span>
        </Link>
      </div>
    );
  });

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] px-4 py-5 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 sm:px-6">
        <div className="relative h-12">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/50" />
          <div
            data-signal-beam
            className="absolute top-1/2 h-10 w-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/35 to-transparent blur-xl"
          />
          <div
            data-signal-beam-core
            className="absolute top-1/2 h-px w-24 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/90 to-transparent"
          />
        </div>
      </div>

      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono-ticker text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground sm:text-xs">
            <span>Hot Topics</span>
            <Flame className="h-3.5 w-3.5 text-primary" />
          </span>
          <span className="h-px flex-1 bg-border/60" />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background via-background/80 to-transparent" />

          <div className="overflow-x-auto scrollbar-none">
            <div className="flex min-w-max items-end py-2 pr-4 sm:pr-6">
              {topicLinks}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
