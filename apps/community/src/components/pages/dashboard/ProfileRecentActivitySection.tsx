"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, MessageSquareText } from "lucide-react";
import { buildContentScoreSummary, type ScorePeriod } from "@/lib/content-scoring";
import { ContentScoreSparkline } from "@/components/shared/ContentScoreSparkline";

export type ProfileRecentActivityItem = {
  id: string;
  kind: "discussion" | "blog";
  title: string;
  href: string;
  createdAt: string;
  metricSegments: string[];
  actionText: string;
  ctaText: string;
  views: number;
  reactions: number;
  comments: number;
};

type ProfileRecentActivitySectionProps = {
  profileName: string;
  items: ProfileRecentActivityItem[];
};

type DashboardWindow = "7d" | "30d" | "90d" | "6m";

const WINDOW_OPTIONS: { id: DashboardWindow; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "6m", label: "6M" }
];

function toScorePeriod(window: DashboardWindow): ScorePeriod {
  if (window === "7d") return "7d";
  if (window === "30d" || window === "90d") return "30d";
  return "365d";
}

function getWindowStart(window: DashboardWindow, nowMs: number): number {
  const dayMs = 86_400_000;
  if (window === "7d") return nowMs - 7 * dayMs;
  if (window === "30d") return nowMs - 30 * dayMs;
  if (window === "90d") return nowMs - 90 * dayMs;
  return nowMs - 183 * dayMs;
}

function formatActivityDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minuteMs = 60_000;
  const hourMs = 3_600_000;
  const dayMs = 86_400_000;

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs));
    return `${minutes}m ago`;
  }
  if (diffMs < dayMs) {
    const hours = Math.max(1, Math.floor(diffMs / hourMs));
    return `${hours}h ago`;
  }
  if (diffMs < dayMs * 7) {
    const days = Math.max(1, Math.floor(diffMs / dayMs));
    return `${days}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export function ProfileRecentActivitySection({
  profileName,
  items
}: ProfileRecentActivitySectionProps) {
  const [activeWindow, setActiveWindow] = useState<DashboardWindow>("30d");
  const period = toScorePeriod(activeWindow);

  const scoredItems = useMemo(
    () => {
      const nowMs = Date.now();
      const windowStart = getWindowStart(activeWindow, nowMs);

      return items
        .filter((item) => {
          const createdAtMs = new Date(item.createdAt).getTime();
          return Number.isFinite(createdAtMs) && createdAtMs >= windowStart;
        })
        .map((item) => {
        const metrics = {
          views: item.views,
          reactions: item.reactions,
          comments: item.comments
        };
          return {
            ...item,
            momentum: buildContentScoreSummary({
              mode: "hot",
              period,
              metrics,
              publishedAt: item.createdAt
            }),
            impact: buildContentScoreSummary({
              mode: "quality",
              period,
              metrics,
              publishedAt: item.createdAt
            })
          };
        });
    },
    [activeWindow, items, period]
  );

  const hasOverflowingActivity = scoredItems.length > 3;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 border border-border/70 bg-background/70 px-2.5 py-1.5">
        <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/95">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/80" aria-hidden />
          <span>Recent activity</span>
        </p>
        <div className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background/80 p-1 text-[10px]">
          {WINDOW_OPTIONS.map((option) => {
            const active = option.id === activeWindow;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveWindow(option.id)}
                className={
                  active
                    ? "rounded px-1.5 py-0.5 font-semibold text-foreground ring-1 ring-border/60"
                    : "rounded px-1.5 py-0.5 text-muted-foreground hover:text-foreground"
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="border border-border/70 bg-background/70 p-2.5 sm:p-3.5">
        {scoredItems.length > 0 ? (
          <div
            className={`space-y-2.5 ${hasOverflowingActivity
              ? "max-h-[19rem] overflow-y-auto pr-1 scrollbar-none"
              : ""
              }`}
          >
            {scoredItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group block border border-border/60 bg-card/70 p-3 transition-colors hover:border-primary/35 sm:p-3.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/80">
                    {item.kind === "discussion" ? (
                      <MessageSquareText className="h-3.5 w-3.5 text-primary/90" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-primary/90" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px]">
                        <span className="font-semibold text-foreground">{profileName}</span>
                        <span className="text-muted-foreground">{item.actionText}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{formatActivityDate(item.createdAt)}</span>
                      </div>
                      <div className="ml-1 flex shrink-0 items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded border border-border/60 bg-background/75 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                          <span>M</span>
                          <ContentScoreSparkline
                            summary={item.momentum}
                            width={24}
                            height={8}
                            className="text-primary/80"
                          />
                        </span>
                        <span className="inline-flex items-center gap-1 rounded border border-border/60 bg-background/75 px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                          <span>I</span>
                          <ContentScoreSparkline
                            summary={item.impact}
                            width={24}
                            height={8}
                            className="text-primary/80"
                          />
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
                      <span className="text-[11px] text-muted-foreground">
                        {item.metricSegments.join(" · ")}
                      </span>
                      <span className="text-[11px] font-medium text-primary transition-opacity group-hover:opacity-85">
                        {item.ctaText}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recent activity in this period yet.
          </p>
        )}
      </div>
    </div>
  );
}

