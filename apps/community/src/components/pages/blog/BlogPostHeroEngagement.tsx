"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@codebay/ui";
import type { BlogEngagementCounts, BlogPostReactionBreakdown, BlogPostReactionType } from "@/lib/blog";

const REACTION_META: { type: BlogPostReactionType; label: string; icon: string }[] = [
  { type: "like", label: "Helpful", icon: "👍" },
  { type: "insightful", label: "Insightful", icon: "💡" },
  { type: "love", label: "Loved", icon: "❤️" }
];

type BlogPostHeroEngagementProps = {
  counts: BlogEngagementCounts;
  reactionBreakdown: BlogPostReactionBreakdown;
};

function engagementSummaryParts(counts: BlogEngagementCounts): string[] {
  const parts: string[] = [];
  if (counts.views > 0) parts.push(`${counts.views.toLocaleString()} views`);
  if (counts.reactions > 0) parts.push(`${counts.reactions} reactions`);
  parts.push(`${counts.comments} comment${counts.comments === 1 ? "" : "s"}`);
  return parts;
}

export function BlogPostHeroEngagement({ counts, reactionBreakdown }: BlogPostHeroEngagementProps) {
  const parts = engagementSummaryParts(counts);
  const summary = parts.join(" · ");
  const showReactionTooltip = counts.reactions > 0;

  const lineClassName =
    "text-xs text-muted-foreground underline decoration-dotted decoration-muted-foreground/40 underline-offset-[3px] transition-colors hover:decoration-muted-foreground/70";

  if (!showReactionTooltip) {
    return (
      <p className="text-xs text-muted-foreground" aria-label="Engagement on this post">
        {summary}
      </p>
    );
  }

  return (
    <TooltipProvider delayDuration={250} skipDelayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`${lineClassName} block w-fit max-w-full cursor-help border-0 bg-transparent p-0 text-left font-normal`}
            aria-label="Engagement on this post — hover for reaction breakdown"
          >
            {summary}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="border-border/70 bg-popover/95 px-0 py-0 text-popover-foreground shadow-lg backdrop-blur-md"
        >
          <div className="px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Reactions by type
            </p>
            <ul className="mt-2.5 space-y-2.5" role="list">
              {REACTION_META.map(({ type, label, icon }) => {
                const { up, down } = reactionBreakdown[type];
                if (up === 0 && down === 0) return null;
                return (
                  <li key={type}>
                    <div className="flex items-center justify-between gap-6 text-xs">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="text-base leading-none" aria-hidden>
                          {icon}
                        </span>
                        <span className="font-medium text-foreground">{label}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2.5 tabular-nums text-muted-foreground">
                        <span className="inline-flex items-center gap-0.5">
                          <ThumbsUp className="h-3 w-3 opacity-70" aria-hidden />
                          <span className="text-foreground/90">{up}</span>
                        </span>
                        {down > 0 ? (
                          <span className="inline-flex items-center gap-0.5">
                            <ThumbsDown className="h-3 w-3 opacity-70" aria-hidden />
                            <span>{down}</span>
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            {REACTION_META.every(({ type }) => {
              const { up, down } = reactionBreakdown[type];
              return up === 0 && down === 0;
            }) ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {counts.reactions} reaction{counts.reactions === 1 ? "" : "s"} total
              </p>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
