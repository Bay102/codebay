import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/database";

type DiscussionRow = Tables<"discussions">;
type DiscussionCommentRow = Tables<"discussion_comments">;

interface DiscussionAuthor {
  id: string;
  name: string;
  username: string;
}

interface DiscussionWithAuthor extends DiscussionRow {
  author: DiscussionAuthor;
}

interface DiscussionCounts {
  commentCount: number;
  reactionCount: number;
  viewerReactionType?: string | null;
}

export interface DiscussionListItem {
  id: string;
  slug: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  commentCount: number;
  reactionCount: number;
}

export interface DiscussionComment {
  id: string;
  discussionId: string;
  authorId: string | null;
  authorName: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  replies: DiscussionComment[];
}

/** Single discussion by slug with author. Use with getDiscussionCounts for full detail. */
export async function getDiscussionBySlug(
  supabase: SupabaseClient<Database>,
  slug: string
): Promise<DiscussionWithAuthor | null> {
  const { data, error } = await supabase
    .from("discussions")
    .select(
      `
      id,
      author_id,
      title,
      body,
      slug,
      created_at,
      updated_at,
      tags,
      community_users!discussions_author_id_fkey (
        id,
        name,
        username
      )
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as DiscussionRow & {
    community_users: { id: string; name: string; username: string } | null;
  };
  if (!row.community_users) return null;

  return {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    body: row.body,
    slug: row.slug,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: (row as DiscussionRow).tags ?? [],
    author: {
      id: row.community_users.id,
      name: row.community_users.name,
      username: row.community_users.username
    }
  };
}

/** Comment count, reaction count, and optional viewer reaction for a discussion. One batch. */
export async function getDiscussionCounts(
  supabase: SupabaseClient<Database>,
  discussionId: string,
  viewerId?: string | null
): Promise<DiscussionCounts> {
  const [commentsRes, reactionsRes, viewerRes] = await Promise.all([
    supabase
      .from("discussion_comments")
      .select("id", { count: "exact", head: true })
      .eq("discussion_id", discussionId),
    supabase
      .from("discussion_reactions")
      .select("id", { count: "exact", head: true })
      .eq("discussion_id", discussionId),
    viewerId
      ? supabase
          .from("discussion_reactions")
          .select("reaction_type")
          .eq("discussion_id", discussionId)
          .eq("user_id", viewerId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null })
  ]);

  return {
    commentCount: commentsRes.count ?? 0,
    reactionCount: reactionsRes.count ?? 0,
    viewerReactionType: viewerRes.data?.reaction_type ?? null
  };
}

/** All comments for a discussion; build threaded tree in memory. */
export async function getDiscussionComments(
  supabase: SupabaseClient<Database>,
  discussionId: string
): Promise<DiscussionComment[]> {
  const { data, error } = await supabase
    .from("discussion_comments")
    .select("id, discussion_id, author_id, author_name, body, parent_id, created_at")
    .eq("discussion_id", discussionId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const rows = data as DiscussionCommentRow[];
  const byParent = new Map<string | null, DiscussionComment[]>();
  byParent.set(null, []);

  rows.forEach((r) => {
    const parentKey = r.parent_id ?? null;
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey)!.push({
      id: r.id,
      discussionId: r.discussion_id,
      authorId: r.author_id,
      authorName: r.author_name,
      body: r.body,
      parentId: r.parent_id,
      createdAt: r.created_at,
      replies: []
    });
  });

  function attachReplies(comments: DiscussionComment[]): DiscussionComment[] {
    return comments.map((c) => ({
      ...c,
      replies: attachReplies(byParent.get(c.id) ?? [])
    }));
  }

  return attachReplies(byParent.get(null) ?? []);
}

/** Trending or list: discussions with comment_count and reaction_count in one query. */
export async function getDiscussionsWithCounts(
  supabase: SupabaseClient<Database>,
  options: {
    authorId?: string;
    limit?: number;
    offset?: number;
    orderByTrend?: boolean;
  } = {}
): Promise<DiscussionListItem[]> {
  const { authorId, limit = 20, offset = 0, orderByTrend = true } = options;

  let query = supabase
    .from("discussions")
    .select(
      `
      id,
      slug,
      title,
      body,
      author_id,
      created_at,
      updated_at,
      tags,
      community_users!discussions_author_id_fkey (
        name,
        username
      )
    `
    );

  if (authorId) {
    query = query.eq("author_id", authorId);
  }

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data: rows, error } = await query;

  if (error || !rows || rows.length === 0) return [];

  const ids = rows.map((r) => (r as { id: string }).id);
  const [commentCounts, reactionCounts] = await Promise.all([
    supabase.from("discussion_comments").select("discussion_id").in("discussion_id", ids),
    supabase.from("discussion_reactions").select("discussion_id").in("discussion_id", ids)
  ]);

  const commentByDiscussion = new Map<string, number>();
  (commentCounts.data ?? []).forEach((r: { discussion_id: string }) => {
    commentByDiscussion.set(r.discussion_id, (commentByDiscussion.get(r.discussion_id) ?? 0) + 1);
  });
  const reactionByDiscussion = new Map<string, number>();
  (reactionCounts.data ?? []).forEach((r: { discussion_id: string }) => {
    reactionByDiscussion.set(r.discussion_id, (reactionByDiscussion.get(r.discussion_id) ?? 0) + 1);
  });

  type Row = DiscussionRow & {
    community_users: { name: string; username: string } | null;
  };

  const items: DiscussionListItem[] = (rows as Row[]).map((r) => {
    const author = r.community_users;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      body: r.body,
      authorId: r.author_id,
      authorName: author?.name ?? "Unknown",
      authorUsername: author?.username ?? "unknown",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      tags: (r as { tags?: string[] }).tags ?? [],
      commentCount: commentByDiscussion.get(r.id) ?? 0,
      reactionCount: reactionByDiscussion.get(r.id) ?? 0
    };
  });

  if (orderByTrend && !authorId) {
    const now = Date.now();

    function computeTrendingScore(item: DiscussionListItem): number {
      const createdAtTime = new Date(item.createdAt).getTime();
      if (Number.isNaN(createdAtTime)) return 0;

      const ageMs = Math.max(0, now - createdAtTime);
      const ageDays = ageMs / (24 * 3600 * 1000);

      const commentWeight = 3;
      const reactionWeight = 1.5;
      const base = 1;

      const rawEngagement = commentWeight * item.commentCount + reactionWeight * item.reactionCount + base;
      const decayExponent = 1.5;
      const denominator = Math.pow(1 + ageDays, decayExponent);

      return denominator > 0 ? rawEngagement / denominator : rawEngagement;
    }

    items.sort((a, b) => {
      const scoreA = computeTrendingScore(a);
      const scoreB = computeTrendingScore(b);
      return scoreB - scoreA;
    });
  }

  return items;
}

/** Generate URL-safe slug from title; caller must ensure uniqueness (e.g. append id). */
export function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "discussion"
  );
}

/** Create a discussion; slug must be unique (e.g. slugifyTitle + "-" + shortId or retry). */
export async function createDiscussion(
  supabase: SupabaseClient<Database>,
  input: { authorId: string; title: string; body: string; slug: string; tags?: string[] }
): Promise<{ id: string; slug: string } | null> {
  const tags = (input.tags ?? []).filter(Boolean);
  const { data, error } = await supabase
    .from("discussions")
    .insert({
      author_id: input.authorId,
      title: input.title,
      body: input.body,
      slug: input.slug,
      tags,
      updated_at: new Date().toISOString()
    })
    .select("id, slug")
    .single();

  if (error || !data) return null;
  return { id: data.id, slug: data.slug };
}

/** Add a comment. */
export async function createDiscussionComment(
  supabase: SupabaseClient<Database>,
  input: {
    discussionId: string;
    authorId: string;
    authorName: string;
    body: string;
    parentId?: string | null;
  }
): Promise<string | null> {
  const { data, error } = await supabase
    .from("discussion_comments")
    .insert({
      discussion_id: input.discussionId,
      author_id: input.authorId,
      author_name: input.authorName,
      body: input.body,
      parent_id: input.parentId ?? null
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id;
}

/** Add a reaction if the viewer has not reacted yet (one reaction per user per discussion). */
export async function setDiscussionReaction(
  supabase: SupabaseClient<Database>,
  discussionId: string,
  userId: string,
  reactionType: string
): Promise<boolean> {
  // Check for an existing reaction from this user on this discussion.
  const { data: existing, error: existingError } = await supabase
    .from("discussion_reactions")
    .select("id, reaction_type")
    .eq("discussion_id", discussionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    // Unexpected error (other than no rows); surface as failure.
    return false;
  }

  if (existing) {
    // User has already reacted on this discussion; do not allow another reaction.
    return false;
  }

  const { error } = await supabase.from("discussion_reactions").insert({
    discussion_id: discussionId,
    user_id: userId,
    reaction_type: reactionType
  });
  return !error;
}

/** Remove reaction. */
export async function removeDiscussionReaction(
  supabase: SupabaseClient<Database>,
  discussionId: string,
  userId: string,
  reactionType: string
): Promise<boolean> {
  const { error } = await supabase
    .from("discussion_reactions")
    .delete()
    .eq("discussion_id", discussionId)
    .eq("user_id", userId)
    .eq("reaction_type", reactionType);
  return !error;
}
