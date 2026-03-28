export type ContentType = "discussions" | "blogs";
export type ScoreMode = "hot" | "quality";
export type ScorePeriod = "24h" | "7d" | "30d" | "365d";

export type ScoreMetrics = {
  views: number;
  reactions: number;
  comments: number;
};

export type ContentScoreSummary = {
  mode: ScoreMode;
  period: ScorePeriod;
  score: number;
  metrics: ScoreMetrics;
};

const SCORE_PERIOD_HOURS: Record<ScorePeriod, number> = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
  "365d": 24 * 365
};

export const SCORE_PERIODS: ScorePeriod[] = ["24h", "7d", "30d", "365d"];
export const SCORE_MODES: ScoreMode[] = ["hot", "quality"];

/** URL-agnostic defaults when `score` / `period` query params are omitted */
export const DEFAULT_SCORE_MODE: ScoreMode = "hot";
export const DEFAULT_SCORE_PERIOD: ScorePeriod = "7d";

/** Lucide stroke colors for Flame / Target when denoting score modes (matches dashboard + tooltips). */
export const SCORE_MODE_ICON_CLASS: Record<ScoreMode, string> = {
  hot: "text-amber-600 dark:text-amber-400",
  quality: "text-sky-700 dark:text-sky-300"
};

export function getScoreModeLabel(mode: ScoreMode): string {
  return mode === "hot" ? "Momentum" : "Impact";
}

export function getScoreModeDescription(mode: ScoreMode): string {
  return mode === "hot"
    ? "Surfaces what is gaining traction in the period you choose—threads and posts people are engaging with right now. Use it when you want to jump into active conversations or spot what is newly resonant."
    : "Surfaces posts and discussions that have built meaningful engagement over a chosen period—not just a quick spike.";
}

export function isScoreMode(value: string | null | undefined): value is ScoreMode {
  return value === "hot" || value === "quality";
}

export function isScorePeriod(value: string | null | undefined): value is ScorePeriod {
  return value === "24h" || value === "7d" || value === "30d" || value === "365d";
}

export function getPeriodStart(period: ScorePeriod, now = new Date()): Date {
  const cutoff = new Date(now);
  cutoff.setHours(cutoff.getHours() - SCORE_PERIOD_HOURS[period]);
  return cutoff;
}

export function toIsoDate(value: Date): string {
  return value.toISOString();
}

function safeAgeHours(isoDate: string | null | undefined, nowMs: number): number {
  if (!isoDate) return 0;
  const createdAtMs = new Date(isoDate).getTime();
  if (Number.isNaN(createdAtMs)) return 0;
  const ageMs = Math.max(0, nowMs - createdAtMs);
  return ageMs / (1000 * 60 * 60);
}

export function computeHotScore(metrics: ScoreMetrics, publishedAt: string | null | undefined, now = Date.now()): number {
  const ageHours = safeAgeHours(publishedAt, now);
  const weightedEngagement = metrics.views * 1 + metrics.reactions * 3 + metrics.comments * 5;
  return Math.log1p(weightedEngagement) / Math.pow(ageHours + 2, 1.35);
}

export function computeQualityScore(metrics: ScoreMetrics): number {
  const qualityRaw =
    0.5 * Math.log1p(metrics.views) +
    2 * Math.log1p(metrics.reactions) +
    3 * Math.log1p(metrics.comments);
  const totalEvents = metrics.views + metrics.reactions + metrics.comments;
  const confidenceFactor = Math.min(1, totalEvents / 25);
  return qualityRaw * confidenceFactor;
}

export function computeScore(
  mode: ScoreMode,
  metrics: ScoreMetrics,
  publishedAt: string | null | undefined,
  now = Date.now()
): number {
  if (mode === "quality") return computeQualityScore(metrics);
  return computeHotScore(metrics, publishedAt, now);
}

export function buildContentScoreSummary(input: {
  mode: ScoreMode;
  period: ScorePeriod;
  metrics: ScoreMetrics;
  publishedAt: string | null | undefined;
  now?: number;
}): ContentScoreSummary {
  return {
    mode: input.mode,
    period: input.period,
    metrics: input.metrics,
    score: computeScore(input.mode, input.metrics, input.publishedAt, input.now)
  };
}
