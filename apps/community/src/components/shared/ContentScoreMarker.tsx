import type { ContentScoreSummary } from "@/lib/content-scoring";
import { getScoreModeLabel } from "@/lib/content-scoring";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@codebay/ui";
import { ContentScoreSparkline } from "@/components/shared/ContentScoreSparkline";
import { Flame, Target } from "lucide-react";

type ContentScoreMarkerProps = {
  summary: ContentScoreSummary;
  points?: number[];
  showModeLabel?: boolean;
  periodLabelOverride?: string;
  showNumericScore?: boolean;
  showScoreTooltip?: boolean;
};

/** Raw momentum values are small by design (order matters more than magnitude). ×100 is display-only; ranking still uses the raw score in `summary.score`. */
const MOMENTUM_DISPLAY_MULTIPLIER = 100;

function formatScore(score: number, mode: ContentScoreSummary["mode"]): string {
  if (!Number.isFinite(score)) return "0.00";
  const value = mode === "hot" ? score * MOMENTUM_DISPLAY_MULTIPLIER : score;
  if (value === 0) return "0.00";
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

export function ContentScoreMarker({
  summary,
  points,
  showModeLabel = true,
  periodLabelOverride,
  showNumericScore = false,
  showScoreTooltip = false
}: ContentScoreMarkerProps) {
  const modeLabel = getScoreModeLabel(summary.mode);
  const period =
    periodLabelOverride ?? (summary.period === "365d" ? "1Y" : summary.period.toUpperCase());
  const ModeIcon = summary.mode === "hot" ? Flame : Target;
  const scoreLabel = formatScore(summary.score, summary.mode);
  const tooltipText =
    summary.mode === "hot"
      ? `${modeLabel} score ${scoreLabel} over ${period}. Prioritizes recent engagement, with comments weighted highest, then reactions, then views.`
      : `${modeLabel} score ${scoreLabel} over ${period}. Prioritizes sustained engagement quality with confidence scaling for low-volume content.`;
  const marker = (
    <div
      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/75 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground/90"
      aria-label={`${modeLabel} score indicator over ${period}`}
    >
      {showModeLabel ? (
        <span className="inline-flex items-center text-primary/90" aria-hidden>
          <ModeIcon className="h-3 w-3" />
        </span>
      ) : null}
      {showModeLabel ? <span className="text-muted-foreground">·</span> : null}
      <span className="text-muted-foreground">{period}</span>
      <span className="mx-0.5 h-3 w-px bg-border/70" aria-hidden />
      {showNumericScore ? <span className="font-semibold text-foreground/95">{scoreLabel}</span> : null}
      {showNumericScore ? <span className="mx-0.5 h-3 w-px bg-border/70" aria-hidden /> : null}
      <ContentScoreSparkline
        summary={summary}
        className="text-primary/80"
        points={points}
      />
    </div>
  );

  if (!showScoreTooltip) return marker;

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{marker}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-[360px] border-border/70 bg-popover/95 text-xs leading-relaxed text-popover-foreground"
        >
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

