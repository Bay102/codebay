import type { ContentScoreSummary } from "@/lib/content-scoring";

type ContentScoreSparklineProps = {
  summary: ContentScoreSummary;
  className?: string;
  width?: number;
  height?: number;
  points?: number[];
};

const MOMENTUM_VISUAL_MULTIPLIER = 100;

function normalizeScore(score: number, mode: ContentScoreSummary["mode"]): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  /**
   * Momentum scores are intentionally small for ranking stability, so scale for visualization
   * to avoid near-flat sparklines while keeping ordering based on raw score.
   */
  const visualScore = mode === "hot" ? score * MOMENTUM_VISUAL_MULTIPLIER : score;
  const maxReference = mode === "hot" ? MOMENTUM_VISUAL_MULTIPLIER : 5;
  const normalized = Math.log1p(visualScore) / Math.log1p(maxReference);
  return Math.min(1, Math.max(0, normalized));
}

function hasMeaningfulVariation(values: number[]): boolean {
  if (values.length < 2) return false;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return max - min > 0.01;
}

export function ContentScoreSparkline({
  summary,
  className,
  width = 34,
  height = 10,
  points
}: ContentScoreSparklineProps) {
  const baseline = height - 1;
  const normalizedPointsCandidate =
    Array.isArray(points) && points.length >= 2
      ? points.map((value) => Math.min(1, Math.max(0, value)))
      : null;
  const normalizedPoints =
    normalizedPointsCandidate && hasMeaningfulVariation(normalizedPointsCandidate)
      ? normalizedPointsCandidate
      : null;

  const polylinePoints = normalizedPoints
    ? normalizedPoints
        .map((value, index) => {
          const x = (index / (normalizedPoints.length - 1)) * width;
          const y = baseline - value * (height - 3);
          return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(" ")
    : (() => {
        const intensity = normalizeScore(summary.score, summary.mode);
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

