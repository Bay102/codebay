"use client";

import Link from "next/link";
import type { LandingTopic } from "@/lib/landing";
import { Tag } from "@codebay/ui";

type TrendingTopicsTickerProps = {
  topics: LandingTopic[];
  blogUrl: string;
};

/**
 * Stock-exchange-style infinite scrolling ticker. Uses CSS animation only
 * (transform) for performance; no JS animation loop.
 */
export function TrendingTopicsTicker({ topics, blogUrl }: TrendingTopicsTickerProps) {
  if (topics.length === 0) return null;

  const spacer = <div className="w-24 shrink-0 sm:w-28" aria-hidden />;
  const segment = (
    <>
      {spacer}
      {topics.map((topic) => {
        const href = `${blogUrl}?tag=${encodeURIComponent(topic.tag)}`;
        return (
          <Link
            key={topic.tag}
            href={href}
            className="ticker-item flex shrink-0 items-center gap-2"
          >
            <Tag variant="tech" size="md">{topic.tag}</Tag>
            {/* <span className="tabular-nums text-muted-foreground" aria-label={`${topic.postCount} posts`}>
              {topic.postCount}
            </span> */}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border/60 bg-card/50 py-3">
      {/* Label: opaque so scrolling tags don’t show through */}
      <div className="absolute left-0 top-0 z-10 flex h-full min-w-[7.5rem] items-center rounded-l-xl bg-card pl-4 pr-4 sm:min-w-[8.5rem] sm:pr-6">
        <span className="font-mono-ticker text-md font-semibold uppercase tracking-widest text-muted-foreground">
          Trending 🔥
        </span>
      </div>

      {/* Ticker track: two identical segments for seamless -50% loop */}
      <div
        data-ticker
        className="flex items-center gap-2"
        style={{
          width: "max-content",
          animation: "ticker-scroll 25s linear infinite",
          willChange: "transform",
        }}
      >
        {segment}
        {segment}
        {segment}
        {segment}
      </div>
    </div>
  );
}
