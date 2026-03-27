import type { ContentScoreSummary } from "@/lib/content-scoring";

type ContentScoreSparklineProps = {
  summary: ContentScoreSummary;
  className?: string;
  width?: number;
  height?: number;
  points?: number[];
};

function normalizeScore(score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  const maxReference = 5; // heuristic upper-bound for normalization
  const normalized = Math.log1p(score) / Math.log1p(maxReference);
  return Math.min(1, Math.max(0, normalized));
}

export function ContentScoreSparkline({
  summary,
  className,
  width = 34,
  height = 10,
  points
}: ContentScoreSparklineProps) {
  const baseline = height - 1;
  const normalizedPoints =
    Array.isArray(points) && points.length >= 2
      ? points.map((value) => Math.min(1, Math.max(0, value)))
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
        const intensity = normalizeScore(summary.score);
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

