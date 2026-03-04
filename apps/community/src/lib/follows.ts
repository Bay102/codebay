import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database";

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface FollowProfileRow {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * Returns follower count, following count, and (when viewer is provided) whether the viewer follows this profile.
 * One round-trip via Postgres RPC.
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

/**
 * List users who follow the given user. For use in Followers modal (client or server).
 */
export async function getFollowers(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 24,
  offset = 0
): Promise<FollowProfileRow[]> {
  const { data, error } = await supabase
    .from("user_follows")
    .select(
      `
      follower_id,
      community_users!user_follows_follower_id_fkey (
        id,
        name,
        username,
        avatar_url
      )
    `
    )
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];

  return (data as { follower_id: string; community_users: { id: string; name: string; username: string; avatar_url: string | null } | null }[])
    .filter((row) => row.community_users != null)
    .map((row) => ({
      id: row.community_users!.id,
      name: row.community_users!.name,
      username: row.community_users!.username,
      avatarUrl: row.community_users!.avatar_url
    }));
}

/**
 * List users the given user is following. For use in Following modal (client or server).
 */
export async function getFollowing(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 24,
  offset = 0
): Promise<FollowProfileRow[]> {
  const { data, error } = await supabase
    .from("user_follows")
    .select(
      `
      following_id,
      community_users!user_follows_following_id_fkey (
        id,
        name,
        username,
        avatar_url
      )
    `
    )
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) return [];

  return (data as { following_id: string; community_users: { id: string; name: string; username: string; avatar_url: string | null } | null }[])
    .filter((row) => row.community_users != null)
    .map((row) => ({
      id: row.community_users!.id,
      name: row.community_users!.name,
      username: row.community_users!.username,
      avatarUrl: row.community_users!.avatar_url
    }));
}
