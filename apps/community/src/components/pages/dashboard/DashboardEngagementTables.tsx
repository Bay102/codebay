"use client";

import { useMemo, useState } from "react";
import { DashboardBlogPostsTable } from "@/components/pages/dashboard/DashboardBlogPostsTable";
import { DashboardDiscussionsTable } from "@/components/pages/dashboard/DashboardDiscussionsTable";
import type {
  DashboardBlogPostStats,
  DashboardBlogSummary,
  DashboardDiscussionSummary,
  DashboardKpiPeriodSummary,
  KpiPeriod
} from "@/lib/dashboard";
import type { DiscussionListItem } from "@/lib/discussions";

type DashboardEngagementTablesProps = {
  posts: DashboardBlogPostStats[];
  discussions: DiscussionListItem[];
  blogSummary: DashboardBlogSummary;
  discussionSummary: DashboardDiscussionSummary;
  blogKpiPeriodSummary: DashboardKpiPeriodSummary | null;
  discussionKpiPeriodSummary: DashboardKpiPeriodSummary | null;
};

const PERIOD_OPTIONS: { key: KpiPeriod; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "6m", label: "6M" }
];

function getComparisonLabel(period: KpiPeriod): string {
  switch (period) {
    case "7d":
      return "vs prev 7d";
    case "30d":
      return "vs prev 30d";
    case "90d":
      return "vs prev 90d";
    case "6m":
      return "vs prev 6m";
    default:
      return "vs previous";
  }
}

export function DashboardEngagementTables({
  posts,
  discussions,
  blogSummary,
  discussionSummary,
  blogKpiPeriodSummary,
  discussionKpiPeriodSummary
}: DashboardEngagementTablesProps) {
  const [activePeriod, setActivePeriod] = useState<KpiPeriod>("30d");

  const blogMetrics = useMemo(() => {
    const hasPeriodData = Boolean(
      blogKpiPeriodSummary && blogKpiPeriodSummary.periods.includes(activePeriod)
    );
    const views = hasPeriodData
      ? blogKpiPeriodSummary!.views[activePeriod]?.current ?? 0
      : blogSummary.viewsLast30Days;
    const reactions = hasPeriodData
      ? blogKpiPeriodSummary!.reactions[activePeriod]?.current ?? 0
      : blogSummary.totalReactions;
    const comments = hasPeriodData
      ? blogKpiPeriodSummary!.comments[activePeriod]?.current ?? 0
      : blogSummary.totalComments;
    return {
      views,
      reactions,
      comments,
      viewsLabel: hasPeriodData ? `Views (${activePeriod})` : "Views (30d)",
      viewsDelta: hasPeriodData
        ? {
            delta: blogKpiPeriodSummary!.views[activePeriod]?.delta ?? 0,
            deltaPercent: blogKpiPeriodSummary!.views[activePeriod]?.deltaPercent ?? null,
            comparisonLabel: getComparisonLabel(activePeriod)
          }
        : null,
      reactionsDelta: hasPeriodData
        ? {
            delta: blogKpiPeriodSummary!.reactions[activePeriod]?.delta ?? 0,
            deltaPercent: blogKpiPeriodSummary!.reactions[activePeriod]?.deltaPercent ?? null,
            comparisonLabel: getComparisonLabel(activePeriod)
          }
        : null,
      commentsDelta: hasPeriodData
        ? {
            delta: blogKpiPeriodSummary!.comments[activePeriod]?.delta ?? 0,
            deltaPercent: blogKpiPeriodSummary!.comments[activePeriod]?.deltaPercent ?? null,
            comparisonLabel: getComparisonLabel(activePeriod)
          }
        : null
    };
  }, [activePeriod, blogKpiPeriodSummary, blogSummary.totalComments, blogSummary.totalReactions, blogSummary.viewsLast30Days]);

  const discussionMetrics = useMemo(() => {
    const hasPeriodData = Boolean(
      discussionKpiPeriodSummary && discussionKpiPeriodSummary.periods.includes(activePeriod)
    );
    const views = hasPeriodData
      ? discussionKpiPeriodSummary!.views[activePeriod]?.current ?? 0
      : discussionSummary.totalViews;
    const reactions = hasPeriodData
      ? discussionKpiPeriodSummary!.reactions[activePeriod]?.current ?? 0
      : discussionSummary.totalReactions;
    const comments = hasPeriodData
      ? discussionKpiPeriodSummary!.comments[activePeriod]?.current ?? 0
      : discussionSummary.totalComments;
    return {
      views,
      reactions,
      comments,
      viewsLabel: hasPeriodData ? `Views (${activePeriod})` : "Views (all-time)",
      viewsDelta: hasPeriodData
        ? {
            delta: discussionKpiPeriodSummary!.views[activePeriod]?.delta ?? 0,
            deltaPercent: discussionKpiPeriodSummary!.views[activePeriod]?.deltaPercent ?? null,
            comparisonLabel: getComparisonLabel(activePeriod)
          }
        : null,
      reactionsDelta: hasPeriodData
        ? {
            delta: discussionKpiPeriodSummary!.reactions[activePeriod]?.delta ?? 0,
            deltaPercent: discussionKpiPeriodSummary!.reactions[activePeriod]?.deltaPercent ?? null,
            comparisonLabel: getComparisonLabel(activePeriod)
          }
        : null,
      commentsDelta: hasPeriodData
        ? {
            delta: discussionKpiPeriodSummary!.comments[activePeriod]?.delta ?? 0,
            deltaPercent: discussionKpiPeriodSummary!.comments[activePeriod]?.deltaPercent ?? null,
            comparisonLabel: getComparisonLabel(activePeriod)
          }
        : null
    };
  }, [
    activePeriod,
    discussionKpiPeriodSummary,
    discussionSummary.totalComments,
    discussionSummary.totalReactions,
    discussionSummary.totalViews
  ]);

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Engagement window
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-1.5 py-1 text-xs">
          <span className="hidden text-[11px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
            Window
          </span>
          <div className="flex gap-1 rounded-full bg-card/60 p-1 shadow-[0_0_0_1px_rgba(148,163,184,0.25)]">
            {PERIOD_OPTIONS.map((option) => {
              const isActive = option.key === activePeriod;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setActivePeriod(option.key)}
                  className={[
                    "relative flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                    isActive
                      ? "bg-gradient-to-r from-primary/25 via-primary/35 to-primary/25 text-foreground shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
                      : "text-muted-foreground hover:bg-card/80"
                  ].join(" ")}
                >
                  <span className="relative z-10">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <DashboardBlogPostsTable posts={posts} summary={blogSummary} metrics={blogMetrics} maxRows={8} />
      <div className="mt-6">
        <DashboardDiscussionsTable discussions={discussions} summary={discussionSummary} metrics={discussionMetrics} maxRows={8} />
      </div>
    </section>
  );
}
