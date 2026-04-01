import type { ContentScoreSummary } from "@/lib/content-scoring";

type ContentScoreSparklineProps = {
  summary: ContentScoreSummary;
  className?: string;
  width?: number;
  height?: number;
  points?: number[];
};

const MOMENTUM_VISUAL_MULTIPLIER = 100;
/** Hot scores map into log space; a higher ceiling than ×100 avoids clipping strong items to the same peak. */
const MOMENTUM_LOG_RANGE_CAP = 420;
/** Sharpens mid–high band so similar-looking scores still separate on the mini sparkline. */
const MOMENTUM_SPARKLINE_CONTRAST_EXP = 1.55;
/**
 * Hot ranking is age-penalized (`computeHotScore`), so older posts can have meaningful engagement
 * but a near-zero score—reads as a dead flat sparkline next to view/comment counts. This cap is
 * visualization-only: period engagement lifts the curve without affecting `summary.score` / ordering.
 */
const HOT_SPARKLINE_VOLUME_REF = 175;
const HOT_SPARKLINE_VOLUME_CEILING = 0.44;

function normalizeScore(score: number, mode: ContentScoreSummary["mode"]): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  /**
   * Momentum scores are intentionally small for ranking stability, so scale for visualization
   * to avoid near-flat sparklines while keeping ordering based on raw score.
   */
  const visualScore = mode === "hot" ? score * MOMENTUM_VISUAL_MULTIPLIER : score;
  const maxReference = mode === "hot" ? MOMENTUM_LOG_RANGE_CAP : 5;
  let normalized = Math.log1p(visualScore) / Math.log1p(maxReference);
  normalized = Math.min(1, Math.max(0, normalized));
  if (mode === "hot") {
    normalized = Math.pow(normalized, MOMENTUM_SPARKLINE_CONTRAST_EXP);
  }
  return normalized;
}

/** Stretch stored 0–1 series to full vertical range so day-to-day drift reads on mini charts. */
function stretchNormalizedSeries(values: number[]): number[] | null {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  if (span <= 1e-9) return null;
  return values.map((v) => (v - min) / span);
}

/** Same weights as `computeHotScore` engagement term (views + 3×reactions + 5×comments). */
function weightedEngagementForSparkline(metrics: ContentScoreSummary["metrics"]): number {
  const { views, reactions, comments } = metrics;
  if (!Number.isFinite(views) || !Number.isFinite(reactions) || !Number.isFinite(comments)) return 0;
  return Math.max(0, views + 3 * reactions + 5 * comments);
}

function hotFallbackSparklineIntensity(summary: ContentScoreSummary): number {
  const fromScore = normalizeScore(summary.score, "hot");
  const w = weightedEngagementForSparkline(summary.metrics);
  if (w <= 0) return fromScore;
  const volumeShape = Math.min(1, Math.log1p(w) / Math.log1p(HOT_SPARKLINE_VOLUME_REF));
  const fromVolume = HOT_SPARKLINE_VOLUME_CEILING * volumeShape;
  return Math.min(1, Math.max(fromScore, fromVolume));
}

export function ContentScoreSparkline({
  summary,
  className,
  width = 38,
  height = 12,
  points
}: ContentScoreSparklineProps) {
  const baseline = height - 1;
  const clamped =
    Array.isArray(points) && points.length >= 2
      ? points.map((value) => Math.min(1, Math.max(0, value)))
      : null;
  const normalizedPoints = clamped ? stretchNormalizedSeries(clamped) : null;

  const polylinePoints = normalizedPoints
    ? normalizedPoints
        .map((value, index) => {
          const x = (index / (normalizedPoints.length - 1)) * width;
          const y = baseline - value * (height - 3);
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(" ")
    : (() => {
        const intensity =
          summary.mode === "hot"
            ? hotFallbackSparklineIntensity(summary)
            : normalizeScore(summary.score, summary.mode);
        const peakY = baseline - intensity * (height - 3);
        return [
          `0,${baseline}`,
          `${width * 0.35},${baseline}`,
          `${width * 0.7},${peakY.toFixed(2)}`,
          `${width},${baseline}`
        ].join(" ");
      })();

  const strokeColor = summary.mode === "hot" ? "currentColor" : "currentColor";

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
    </svg>
  );
}

