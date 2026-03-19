"use server";

import type { FollowStats } from "@/lib/follows";
import { getFollowStatsForProfile } from "@/lib/follows";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Returns follow stats for a profile (for the current user as viewer).
 * Use after follow/unfollow to refresh UI with one call.
 */
export async function getFollowStatsAction(profileUserId: string): Promise<FollowStats> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { followerCount: 0, followingCount: 0 };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return getFollowStatsForProfile(supabase, profileUserId, user?.id ?? null);
}

/**
 * Returns the current user's preferred tag ids (for "Topics to follow").
 * Returns empty array if not authenticated or on error.
 */
export async function getPreferredTagIdsAction(): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("user_preferred_tags")
    .select("tag_id")
    .eq("user_id", user.id);
  if (error) return [];
  return (data ?? []).map((row) => row.tag_id);
}

/**
 * Replaces the current user's preferred tags with the given tag ids.
 * Only valid tag ids (existing in tags table) are stored; invalid ids are skipped.
 * Returns { success: boolean, error?: string }.
 */
export async function setPreferreldTagsAction(tagIds: string[]): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Not configured" };
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not signed in" };
  }
  const { error: deleteError } = await supabase.from("user_preferred_tags").delete().eq("user_id", user.id);
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }
  const uniqueIds = [...new Set(tagIds)].filter(Boolean);
  if (uniqueIds.length === 0) {
    return { success: true };
  }
  const { error: insertError } = await supabase.from("user_preferred_tags").insert(
    uniqueIds.map((tag_id) => ({ user_id: user.id, tag_id }))
  );
  if (insertError) {
    return { success: false, error: insertError.message };
  }
  return { success: true };
}
