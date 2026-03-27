import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ExternalLink, Flame, MessageSquare, Minus, Target } from "lucide-react";
import { buildContentScoreSummary } from "@/lib/content-scoring";
import type { DashboardDiscussionSummary, KpiPeriod } from "@/lib/dashboard";
import type { DiscussionListItem } from "@/lib/discussions";
import { ContentScoreMarker } from "@/components/shared/ContentScoreMarker";
import { FocusButton } from "@/components/shared/buttons/FocusButton";

type DashboardDiscussionsTableProps = {
  discussions: DiscussionListItem[];
  summary: DashboardDiscussionSummary;
  metrics: {
    views: number;
    reactions: number;
    comments: number;
    viewsLabel: string;
    viewsDelta?: { delta: number; deltaPercent: number | null; comparisonLabel: string } | null;
    reactionsDelta?: { delta: number; deltaPercent: number | null; comparisonLabel: string } | null;
    commentsDelta?: { delta: number; deltaPercent: number | null; comparisonLabel: string } | null;
  };
  maxRows?: number;
  activePeriod: KpiPeriod;
};

function mapKpiToScorePeriod(period: KpiPeriod): "24h" | "7d" | "30d" | "365d" {
  if (period === "24h") return "24h";
  if (period === "7d") return "7d";
  if (period === "30d" || period === "90d") return "30d";
  return "365d";
}

function formatKpiPeriodLabel(period: KpiPeriod): string {
  switch (period) {
    case "24h":
      return "24H";
    case "7d":
      return "7D";
    case "30d":
      return "30D";
    case "90d":
      return "90D";
    case "6m":
      return "6M";
    default:
      return "30D";
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function formatPercent(value: number): string {
  const rounded = Math.abs(value) >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${Math.abs(rounded)}%`;
}

function DeltaBadge({
  delta
}: {
  delta: { delta: number; deltaPercent: number | null; comparisonLabel: string } | null | undefined;
}) {
  if (!delta || delta.deltaPercent === null) return null;
  const isIncrease = delta.delta > 0;
  const isDecrease = delta.delta < 0;
  const Icon = isIncrease ? ArrowUpRight : isDecrease ? ArrowDownRight : Minus;
  return (
    <span
      className={[
        "mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
        isIncrease
          ? "bg-emerald-500/10 text-emerald-400"
          : isDecrease
            ? "bg-rose-500/10 text-rose-400"
            : "bg-muted text-muted-foreground"
      ].join(" ")}
    >
      <Icon className="h-3 w-3" />
      <span>
        {delta.delta > 0 ? "+" : ""}
        {formatPercent(delta.deltaPercent)} {delta.comparisonLabel}
      </span>
    </span>
  );
}

export function DashboardDiscussionsTable({
  discussions,
  summary,
  metrics,
  maxRows = 8,
  activePeriod
}: DashboardDiscussionsTableProps) {
  const displayItems = discussions.slice(0, maxRows);
  const scorePeriod = mapKpiToScorePeriod(activePeriod);
  const periodLabel = formatKpiPeriodLabel(activePeriod);

  return (
    <div className="border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Discussions
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <FocusButton
            href="/dashboard/discussions/new"
            colorVariant="primary"
            borderVariant="bordered"
            radiusVariant="square"
            sizeVariant="xs"
          >
            Start a discussion
          </FocusButton>
          <Link
            href="/discussions"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Browse all
            <MessageSquare className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="border border-border/60 bg-background/70 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Discussions</p>
          <p className="mt-1 font-mono-ticker text-xl font-semibold text-foreground">
            {summary.totalDiscussions.toLocaleString()}
          </p>
        </div>
        <div className="border border-border/60 bg-background/70 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{metrics.viewsLabel}</p>
          <p className="mt-1 font-mono-ticker text-xl font-semibold text-foreground">
            {metrics.views.toLocaleString()}
          </p>
          <DeltaBadge delta={metrics.viewsDelta} />
        </div>
        <div className="border border-border/60 bg-background/70 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Reactions</p>
          <p className="mt-1 font-mono-ticker text-xl font-semibold text-foreground">
            {metrics.reactions.toLocaleString()}
          </p>
          <DeltaBadge delta={metrics.reactionsDelta} />
        </div>
        <div className="border border-border/60 bg-background/70 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Comments</p>
          <p className="mt-1 font-mono-ticker text-xl font-semibold text-foreground">
            {metrics.comments.toLocaleString()}
          </p>
          <DeltaBadge delta={metrics.commentsDelta} />
        </div>
      </div>

      {displayItems.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          You haven&apos;t started any discussions yet. Create one to get the conversation going.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/70">
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Views
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Comments
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Reactions
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="inline-flex items-center justify-end gap-1">
                    <span>Momentum</span>
                    <Flame className="h-3.5 w-3.5 text-primary/90" aria-hidden />
                  </span>
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span className="inline-flex items-center justify-end gap-1">
                    <span>Impact</span>
                    <Target className="h-3.5 w-3.5 text-primary/90" aria-hidden />
                  </span>
                </th>
                <th className="py-3 pl-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Created
                </th>
                <th className="py-3 pl-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((discussion) => {
                const momentumSummary = buildContentScoreSummary({
                  mode: "hot",
                  period: scorePeriod,
                  metrics: {
                    views: discussion.viewCount,
                    reactions: discussion.reactionCount,
                    comments: discussion.commentCount
                  },
                  publishedAt: discussion.createdAt
                });
                const impactSummary = buildContentScoreSummary({
                  mode: "quality",
                  period: scorePeriod,
                  metrics: {
                    views: discussion.viewCount,
                    reactions: discussion.reactionCount,
                    comments: discussion.commentCount
                  },
                  publishedAt: discussion.createdAt
                });

                return (
                  <tr
                    key={discussion.id}
                    className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-background/50"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/discussions/${discussion.slug}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {discussion.title || "Untitled"}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-foreground">
                      {discussion.viewCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-foreground">
                      {discussion.commentCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-foreground">
                      {discussion.reactionCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <ContentScoreMarker
                        summary={momentumSummary}
                        points={discussion.momentumGraphPoints}
                        showModeLabel={false}
                        periodLabelOverride={periodLabel}
                        showNumericScore
                        showScoreTooltip
                      />
                    </td>
                    <td className="py-3 px-2 text-right">
                      <ContentScoreMarker
                        summary={impactSummary}
                        points={discussion.impactGraphPoints}
                        showModeLabel={false}
                        periodLabelOverride={periodLabel}
                        showNumericScore
                        showScoreTooltip
                      />
                    </td>
                    <td className="py-3 pl-2 text-muted-foreground">
                      {formatDate(discussion.createdAt)}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <Link
                        href={`/discussions/${discussion.slug}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                        aria-label={`View ${discussion.title || "discussion"}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
