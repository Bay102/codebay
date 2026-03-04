import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database";

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

/**
 * Returns follower count, following count, and (when viewer is provided) whether the viewer follows this profile.
 * Callable from client with auth supabase instance.
 */
export async function getFollowStatsForProfile(
  supabase: SupabaseClient<Database>,
  profileUserId: string,
  viewerUserId?: string | null
): Promise<FollowStats> {
  const { data, error } = await supabase
    .rpc("get_follow_stats", {
      p_profile_user_id: profileUserId,
      p_viewer_user_id: viewerUserId ?? null
    })
    .single();

  if (error || !data) {
    return { followerCount: 0, followingCount: 0 };
  }

  const row = data as { follower_count: number; following_count: number; is_following: boolean | null };
  return {
    followerCount: row.follower_count ?? 0,
    followingCount: row.following_count ?? 0,
    ...(row.is_following != null && { isFollowing: row.is_following })
  };
}
