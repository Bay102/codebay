import { Flame, Sparkles } from "lucide-react";
import type { ContentScoreSummary } from "@/lib/content-scoring";
import { getScoreModeLabel } from "@/lib/content-scoring";

type ContentScoreBadgeProps = {
  summary: ContentScoreSummary;
};

function formatPeriod(period: ContentScoreSummary["period"]): string {
  switch (period) {
    case "24h":
      return "24h";
    case "7d":
      return "7d";
    case "30d":
      return "30d";
    case "365d":
      return "1y";
    default:
      return period;
  }
}

export function ContentScoreBadge({ summary }: ContentScoreBadgeProps) {
  const isHot = summary.mode === "hot";
  const modeLabel = getScoreModeLabel(summary.mode);
  const scoreLabel = summary.score.toFixed(2);
  const periodLabel = formatPeriod(summary.period);

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/85 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground/90"
      title={`${modeLabel} score ${scoreLabel} over ${periodLabel}`}
      aria-label={`${modeLabel} score ${scoreLabel} over ${periodLabel}`}
    >
      {isHot ? <Flame className="h-3 w-3 text-primary/80" aria-hidden /> : <Sparkles className="h-3 w-3 text-primary/80" aria-hidden />}
      <span>{modeLabel}</span>
      <span className="text-muted-foreground">·</span>
      <span>{periodLabel}</span>
    </div>
  );
}
