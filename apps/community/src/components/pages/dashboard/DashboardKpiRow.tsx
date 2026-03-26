"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Eye, Heart, MessageCircle, MessageSquare, Minus, Users } from "lucide-react";
import type {
  DashboardBlogSummary,
  DashboardDiscussionSummary,
  DashboardKpiPeriodSummary,
  KpiPeriod
} from "@/lib/dashboard";

type DashboardKpiRowProps = {
  blogSummary: DashboardBlogSummary;
  discussionSummary: DashboardDiscussionSummary;
  followerCount: number;
  kpiPeriodSummary: DashboardKpiPeriodSummary | null;
};

type KpiItem = {
  label: string;
  value: number;
  formattedValue: string;
  icon: React.ComponentType<{ className?: string }>;
  delta?: number | null;
  deltaPercent?: number | null;
  comparisonLabel?: string;
};

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

function formatPercent(value: number): string {
  const rounded = Math.abs(value) >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${Math.abs(rounded)}%`;
}

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

const PERIOD_OPTIONS: { key: KpiPeriod; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "6m", label: "6M" }
];

export function DashboardKpiRow({
  blogSummary,
  discussionSummary,
  followerCount,
  kpiPeriodSummary
}: DashboardKpiRowProps) {
  const [activePeriod, setActivePeriod] = useState<KpiPeriod>("30d");

  const hasPeriodDataForActive = Boolean(
    kpiPeriodSummary && kpiPeriodSummary.periods.includes(activePeriod)
  );

  const comparisonLabel = hasPeriodDataForActive ? getComparisonLabel(activePeriod) : undefined;

  const items: KpiItem[] = useMemo(() => {
    const viewsMetric =
      hasPeriodDataForActive && kpiPeriodSummary
        ? kpiPeriodSummary.views[activePeriod]
        : null;
    const reactionsMetric =
      hasPeriodDataForActive && kpiPeriodSummary
        ? kpiPeriodSummary.reactions[activePeriod]
        : null;
    const commentsMetric =
      hasPeriodDataForActive && kpiPeriodSummary
        ? kpiPeriodSummary.comments[activePeriod]
        : null;

    const baseComparisonLabel = comparisonLabel;

    return [
      {
        label: hasPeriodDataForActive ? "Views" : "Views (30d)",
        value: viewsMetric ? viewsMetric.current : blogSummary.viewsLast30Days,
        formattedValue: formatCompact(viewsMetric ? viewsMetric.current : blogSummary.viewsLast30Days),
        icon: Eye,
        delta: viewsMetric?.delta ?? null,
        deltaPercent: viewsMetric?.deltaPercent ?? null,
        comparisonLabel: baseComparisonLabel
      },
      {
        label: "Reactions",
        value: reactionsMetric ? reactionsMetric.current : blogSummary.totalReactions,
        formattedValue: formatCompact(
          reactionsMetric ? reactionsMetric.current : blogSummary.totalReactions
        ),
        icon: Heart,
        delta: reactionsMetric?.delta ?? null,
        deltaPercent: reactionsMetric?.deltaPercent ?? null,
        comparisonLabel: baseComparisonLabel
      },
      {
        label: "Comments",
        value: commentsMetric ? commentsMetric.current : blogSummary.totalComments,
        formattedValue: formatCompact(
          commentsMetric ? commentsMetric.current : blogSummary.totalComments
        ),
        icon: MessageCircle,
        delta: commentsMetric?.delta ?? null,
        deltaPercent: commentsMetric?.deltaPercent ?? null,
        comparisonLabel: baseComparisonLabel
      },
      {
        label: "Discussions",
        value: discussionSummary.totalDiscussions,
        formattedValue: discussionSummary.totalDiscussions.toLocaleString(),
        icon: MessageSquare
      },
      {
        label: "Views",
        value: discussionSummary.totalViews,
        formattedValue: formatCompact(discussionSummary.totalViews),
        icon: Eye
      },
      {
        label: "Reactions",
        value: discussionSummary.totalReactions,
        formattedValue: formatCompact(discussionSummary.totalReactions),
        icon: Heart
      },
      {
        label: "Comments",
        value: discussionSummary.totalComments,
        formattedValue: formatCompact(discussionSummary.totalComments),
        icon: MessageCircle
      },
      {
        label: "Followers",
        value: followerCount,
        formattedValue: formatCompact(followerCount),
        icon: Users
      }
    ];
  }, [
    activePeriod,
    blogSummary.totalComments,
    blogSummary.totalReactions,
    blogSummary.viewsLast30Days,
    comparisonLabel,
    discussionSummary.totalComments,
    discussionSummary.totalDiscussions,
    discussionSummary.totalReactions,
    discussionSummary.totalViews,
    followerCount,
    hasPeriodDataForActive,
    kpiPeriodSummary
  ]);

  const blogItems = items.slice(0, 3);
  const discussionItems = items.slice(3, 7);
  const audienceItems = items.slice(7);

  return (
    <section className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Engagement overview
        </div>
        {kpiPeriodSummary ? (
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
                    {isActive && (
                      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 via-primary/10 to-transparent opacity-60 blur-xl" />
                    )}
                    <span className="relative z-10">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,2.2fr)_minmax(0,1fr)]">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Blog metrics
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {blogItems.map(
              ({
                label,
                formattedValue,
                icon: Icon,
                delta,
                deltaPercent,
                comparisonLabel: itemComparison
              }) => {
                const hasDelta = typeof delta === "number" && typeof deltaPercent === "number";
                const isIncrease = hasDelta && delta > 0;
                const isDecrease = hasDelta && delta < 0;

                let deltaLabel: string | null = null;
                if (hasDelta) {
                  deltaLabel = `${delta > 0 ? "+" : ""}${formatPercent(deltaPercent!)}${itemComparison ? ` ${itemComparison}` : ""
                    }`;
                }

                const showNaBadge =
                  !hasDelta &&
                  typeof delta === "number" &&
                  delta !== 0 &&
                  (!deltaPercent || Number.isNaN(deltaPercent));

                return (
                  <div
                    key={label}
                    className="group border border-border/70 bg-card/70 p-4 transition-colors hover:border-primary/40 hover:bg-card/80"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60">
                        <Icon className="h-5 w-5 text-primary/80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {label}
                        </p>
                        <p className="mt-0.5 font-mono-ticker text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
                          {formattedValue}
                        </p>
                        {hasDelta && deltaLabel ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium tabular-nums">
                            <span
                              className={[
                                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                                isIncrease
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : isDecrease
                                    ? "bg-rose-500/10 text-rose-400"
                                    : "bg-muted text-muted-foreground"
                              ].join(" ")}
                            >
                              {isIncrease ? (
                                <ArrowUpRight className="h-3 w-3" />
                              ) : isDecrease ? (
                                <ArrowDownRight className="h-3 w-3" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                              <span>{deltaLabel}</span>
                            </span>
                          </p>
                        ) : showNaBadge ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em]">
                              N/A
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Discussion metrics
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {discussionItems.map(
              ({
                label,
                formattedValue,
                icon: Icon
              }) => (
                <div
                  key={`discussion-${label}`}
                  className="group border border-border/70 bg-card/70 p-4 transition-colors hover:border-primary/40 hover:bg-card/80"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60">
                      <Icon className="h-5 w-5 text-primary/80" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-0.5 font-mono-ticker text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
                        {formattedValue}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Audience
          </div>
          <div className="grid grid-cols-1 gap-3">
            {audienceItems.map(
          ({
            label,
            formattedValue,
            icon: Icon,
            delta,
            deltaPercent,
            comparisonLabel: itemComparison
          }) => {
            const hasDelta = typeof delta === "number" && typeof deltaPercent === "number";
            const isIncrease = hasDelta && delta > 0;
            const isDecrease = hasDelta && delta < 0;

            let deltaLabel: string | null = null;
            if (hasDelta) {
              deltaLabel = `${delta > 0 ? "+" : ""}${formatPercent(deltaPercent!)}${itemComparison ? ` ${itemComparison}` : ""
                }`;
            }

            const showNaBadge =
              !hasDelta &&
              typeof delta === "number" &&
              delta !== 0 &&
              (!deltaPercent || Number.isNaN(deltaPercent));

            return (
              <div
                key={label}
                className="group border border-border/70 bg-card/70 p-4 transition-colors hover:border-primary/40 hover:bg-card/80"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/60">
                    <Icon className="h-5 w-5 text-primary/80" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 font-mono-ticker text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
                      {formattedValue}
                    </p>
                    {hasDelta && deltaLabel ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium tabular-nums">
                        <span
                          className={[
                            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5",
                            isIncrease
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isDecrease
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-muted text-muted-foreground"
                          ].join(" ")}
                        >
                          {isIncrease ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : isDecrease ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          <span>{deltaLabel}</span>
                        </span>
                      </p>
                    ) : showNaBadge ? (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <span className="rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em]">
                          N/A
                        </span>
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          }
        )}
          </div>
        </div>
      </div>
    </section>
  );
}

