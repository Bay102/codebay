import {
  buildContentScoreSummary,
  computeHotScore,
  computeQualityScore,
  getPeriodStart
} from "@/lib/content-scoring";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// Hot score should favor recency for similar engagement.
const now = Date.now();
const freshHot = computeHotScore(
  { views: 10, reactions: 4, comments: 2 },
  new Date(now - 1000 * 60 * 30).toISOString(),
  now
);
const oldHot = computeHotScore(
  { views: 10, reactions: 4, comments: 2 },
  new Date(now - 1000 * 60 * 60 * 24 * 10).toISOString(),
  now
);
assert(freshHot > oldHot, "Expected hot score to decay with age.");

// Quality score should increase with stronger engagement.
const weakQuality = computeQualityScore({ views: 5, reactions: 1, comments: 0 });
const strongQuality = computeQualityScore({ views: 200, reactions: 40, comments: 20 });
assert(strongQuality > weakQuality, "Expected quality score to rise with engagement.");

// Period helper should create a date in the past.
const weekStart = getPeriodStart("7d");
assert(weekStart.getTime() < Date.now(), "Expected period start to be in the past.");

// Summary should preserve mode/period and compute a finite score.
const summary = buildContentScoreSummary({
  mode: "quality",
  period: "30d",
  metrics: { views: 30, reactions: 10, comments: 4 },
  publishedAt: new Date().toISOString()
});
assert(summary.mode === "quality", "Expected summary mode to match input.");
assert(summary.period === "30d", "Expected summary period to match input.");
assert(Number.isFinite(summary.score), "Expected summary score to be finite.");
