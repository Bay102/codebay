import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database";
import type { ScoreMode, ScorePeriod } from "@/lib/content-scoring";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseUuidSearchParam(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const t = value.trim();
  return UUID_RE.test(t) ? t : undefined;
}

export type ExploreContentType = "discussions" | "blogs";

export function parseExploreTypeParam(value: unknown): ExploreContentType {
  return value === "blogs" ? "blogs" : "discussions";
}

/** URL `sort` param for Explore filtered lists (blog + discussions). */
export type ExploreSort = "date" | "views" | "comments" | "engagements";

export function parseExploreSortParam(value: unknown): ExploreSort {
  if (value === "views" || value === "comments" || value === "engagements") {
    return value;
  }
  return "date";
}

/** Optional score mode for ranked content views. */
export function parseScoreModeParam(value: unknown): ScoreMode | undefined {
  return value === "hot" || value === "quality" ? value : undefined;
}

/** Optional score period for ranked content views. */
export function parseScorePeriodParam(value: unknown): ScorePeriod | undefined {
  return value === "24h" || value === "7d" || value === "30d" || value === "365d"
    ? value
    : undefined;
}

/** Opt-in `forYou` query flag: follow + preferred-topic sections instead of a single date-sorted Results list. */
export function parseForYouExploreParam(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Preferred topic display names for the signed-in user (`user_preferred_tags` → `tags.name`).
 */
export async function fetchPreferredTopicNames(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const { data: preferredRows } = await supabase
    .from("user_preferred_tags")
    .select("tag_id")
    .eq("user_id", userId);

  const tagIds = (preferredRows ?? []).map((r) => r.tag_id);
  if (tagIds.length === 0) return [];

  const { data: tagRows } = await supabase.from("tags").select("name").in("id", tagIds);
  return (tagRows ?? []).map((r) => r.name).filter((n): n is string => Boolean(n?.trim()));
}
