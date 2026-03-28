import type { ContentScoreSummary } from "@/lib/content-scoring";
import { getScoreModeLabel, SCORE_MODE_ICON_CLASS } from "@/lib/content-scoring";
import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@codebay/ui";
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
  const tooltipExplanation =
    summary.mode === "hot"
      ? "Prioritizes recent engagement—comments matter most, then reactions, then views."
      : "Prioritizes sustained engagement quality, with confidence scaling when volume is low.";
  const marker = (
    <div
      className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/75 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground/90"
      aria-label={`${modeLabel} score indicator over ${period}`}
    >
      {showModeLabel ? (
        <span className={cn("inline-flex items-center", SCORE_MODE_ICON_CLASS[summary.mode])} aria-hidden>
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
          sideOffset={8}
          className="max-w-[min(380px,calc(100vw-2rem))] border-0 bg-transparent p-0 text-popover-foreground shadow-none"
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl",
              summary.mode === "hot"
                ? "border-amber-500/25 bg-gradient-to-br from-popover via-popover to-amber-500/[0.07] dark:to-amber-950/20"
                : "border-sky-500/20 bg-gradient-to-br from-popover via-popover to-sky-500/[0.06] dark:to-sky-950/25"
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl",
                summary.mode === "hot" ? "bg-amber-500/25" : "bg-sky-500/20"
              )}
              aria-hidden
            />
            <div
              className={cn(
                "pointer-events-none absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl bg-gradient-to-b",
                summary.mode === "hot"
                  ? "from-amber-400 via-orange-500 to-red-500"
                  : "from-sky-400 via-primary to-indigo-600"
              )}
              aria-hidden
            />

            <div className="relative flex gap-3 pl-2">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-inner",
                  summary.mode === "hot"
                    ? "bg-gradient-to-br from-amber-500/25 to-orange-600/20"
                    : "bg-gradient-to-br from-sky-500/20 to-primary/15",
                  SCORE_MODE_ICON_CLASS[summary.mode]
                )}
              >
                <ModeIcon className="h-5 w-5" strokeWidth={2.25} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {modeLabel}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums tracking-wide",
                      summary.mode === "hot"
                        ? "bg-amber-500/15 text-amber-900 dark:text-amber-100"
                        : "bg-sky-500/12 text-sky-950 dark:text-sky-100"
                    )}
                  >
                    {period} window
                  </span>
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-3xl font-bold tabular-nums tracking-tight",
                      summary.mode === "hot"
                        ? "bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent dark:from-amber-300 dark:via-orange-400 dark:to-amber-500"
                        : "bg-gradient-to-r from-sky-700 via-primary to-indigo-600 bg-clip-text text-transparent dark:from-sky-200 dark:via-sky-300 dark:to-indigo-300"
                    )}
                  >
                    {scoreLabel}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    score
                  </span>
                </div>

                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{tooltipExplanation}</p>

                {summary.mode === "hot" ? (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/15 bg-amber-500/[0.06] px-2.5 py-2 dark:bg-amber-500/10">
                    <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    <p className="text-[10px] leading-snug text-muted-foreground">
                      Signal weight priority: comments, then reactions, then views.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-sky-500/15 bg-sky-500/[0.06] px-2.5 py-2 dark:bg-sky-500/10">
                    <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
                    <p className="text-[10px] leading-snug text-muted-foreground">
                      Tuned for signal over raw traffic—great for finding work that holds up over time.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

