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
