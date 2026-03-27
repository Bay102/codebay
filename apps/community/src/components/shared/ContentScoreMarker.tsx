import type { ContentScoreSummary } from "@/lib/content-scoring";
import { getScoreModeLabel } from "@/lib/content-scoring";
import { ContentScoreSparkline } from "@/components/shared/ContentScoreSparkline";
import { Flame, Target } from "lucide-react";

type ContentScoreMarkerProps = {
  summary: ContentScoreSummary;
  points?: number[];
  showModeLabel?: boolean;
  periodLabelOverride?: string;
};

export function ContentScoreMarker({
  summary,
  points,
  showModeLabel = true,
  periodLabelOverride
}: ContentScoreMarkerProps) {
  const modeLabel = getScoreModeLabel(summary.mode);
  const period =
    periodLabelOverride ?? (summary.period === "365d" ? "1Y" : summary.period.toUpperCase());
  const ModeIcon = summary.mode === "hot" ? Flame : Target;

  return (
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
      <ContentScoreSparkline
        summary={summary}
        className="text-primary/80"
        points={points}
      />
    </div>
  );
}

