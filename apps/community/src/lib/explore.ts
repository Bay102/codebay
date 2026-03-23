import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database";

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
