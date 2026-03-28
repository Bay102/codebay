import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExploreSort } from "@/lib/explore";
import type { Database, Tables } from "@/lib/database";
import type { ContentScoreSummary, ScoreMode, ScorePeriod } from "@/lib/content-scoring";
import { buildContentScoreSummary, getPeriodStart, toIsoDate } from "@/lib/content-scoring";

type DiscussionRow = Tables<"discussions">;
type DiscussionCommentRow = Tables<"discussion_comments">;

interface DiscussionAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}

interface DiscussionWithAuthor {
  id: string;
  author_id: string;
  title: string;
  body: string;
  slug: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  author: DiscussionAuthor;
}

interface DiscussionCounts {
  viewCount: number;
  commentCount: number;
  reactionCount: number;
  viewerReactions?: Partial<Record<string, "up" | "down">>;
}

export interface DiscussionListItem {
  id: string;
  slug: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  viewCount: number;
  commentCount: number;
  reactionCount: number;
  scoreSummary?: ContentScoreSummary;
  momentumGraphPoints?: number[];
  impactGraphPoints?: number[];
}

export interface DiscussionComment {
  id: string;
  discussionId: string;
  authorId: string | null;
  authorName: string;
  authorAvatarUrl: string | null;
  body: string;
  parentId: string | null;
  createdAt: string;
  replies: DiscussionComment[];
}

/** Converts discussion body (HTML or plain text) to safe HTML for rendering. */
export function getDiscussionBodyHtml(rawBody: string): string {
  const trimmed = rawBody.trim();
  if (!trimmed) {
    return "<p></p>";
  }

  // If it already looks like HTML, return as-is.
  if (/[<][a-zA-Z][^>]*>/.test(trimmed)) {
    return trimmed;
  }

  // Fallback: treat as plain text and preserve basic paragraphs / line breaks.
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
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
        username,
        avatar_url
      )
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as DiscussionRow & {
    community_users: { id: string; name: string; username: string; avatar_url: string | null } | null;
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
      username: row.community_users.username,
      avatarUrl: row.community_users.avatar_url
    }
  };
}

/** Comment count, reaction count, and optional viewer reaction for a discussion. One batch. */
export async function getDiscussionCounts(
  supabase: SupabaseClient<Database>,
  discussionId: string,
  viewerId?: string | null
): Promise<DiscussionCounts> {
  const [viewsRes, commentsRes, reactionsRes, viewerRes] = await Promise.all([
    supabase
      .from("discussion_views")
      .select("id", { count: "exact", head: true })
      .eq("discussion_id", discussionId),
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
          .select("reaction_type,response")
          .eq("discussion_id", discussionId)
          .eq("user_id", viewerId)
      : Promise.resolve({ data: [], error: null })
  ]);

  const viewerReactions = (viewerRes.data ?? []).reduce<Partial<Record<string, "up" | "down">>>(
    (acc, row) => {
      acc[row.reaction_type] = row.response === "down" ? "down" : "up";
      return acc;
    },
    {}
  );

  return {
    viewCount: viewsRes.count ?? 0,
    commentCount: commentsRes.count ?? 0,
    reactionCount: reactionsRes.count ?? 0,
    viewerReactions
  };
}

/** All comments for a discussion; build threaded tree in memory. */
export async function getDiscussionComments(
  supabase: SupabaseClient<Database>,
  discussionId: string
): Promise<DiscussionComment[]> {
  const { data, error } = await supabase
    .from("discussion_comments")
    .select(`
      id,
      discussion_id,
      author_id,
      author_name,
      body,
      parent_id,
      created_at,
      community_users!discussion_comments_author_id_fkey (
        avatar_url
      )
    `)
    .eq("discussion_id", discussionId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const rows = data as (DiscussionCommentRow & {
    community_users: { avatar_url: string | null } | null;
  })[];
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
      authorAvatarUrl: r.community_users?.avatar_url ?? null,
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

function matchSearchPhrase(item: DiscussionListItem, phrase: string): boolean {
  const p = phrase.toLowerCase().trim();
  if (!p) return true;
  return (
    item.title.toLowerCase().includes(p) ||
    item.authorName.toLowerCase().includes(p) ||
    item.authorUsername.toLowerCase().includes(p) ||
    item.tags.some((t) => t.toLowerCase().includes(p))
  );
}

function parseGraphPoints(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "number" && Number.isFinite(entry)) {
        return Math.min(1, Math.max(0, entry));
      }
      return null;
    })
    .filter((entry): entry is number => entry !== null)
    .slice(-24);
}

function aggregateDiscussionIdCounts(rows: { discussion_id: string }[] | null): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows ?? []) {
    map.set(row.discussion_id, (map.get(row.discussion_id) ?? 0) + 1);
  }
  return map;
}

/** When `sinceIso` is set, only rows at or after that timestamp are counted. */
async function fetchDiscussionEngagementCountMaps(
  supabase: SupabaseClient<Database>,
  discussionIds: string[],
  sinceIso: string | null
): Promise<{
  views: Map<string, number>;
  comments: Map<string, number>;
  reactions: Map<string, number>;
}> {
  if (discussionIds.length === 0) {
    return {
      views: new Map(),
      comments: new Map(),
      reactions: new Map()
    };
  }

  const viewBase = supabase.from("discussion_views").select("discussion_id").in("discussion_id", discussionIds);
  const commentBase = supabase
    .from("discussion_comments")
    .select("discussion_id")
    .in("discussion_id", discussionIds);
  const reactionBase = supabase
    .from("discussion_reactions")
    .select("discussion_id")
    .in("discussion_id", discussionIds);

  const [viewRes, commentRes, reactionRes] = await Promise.all([
    sinceIso ? viewBase.gte("created_at", sinceIso) : viewBase,
    sinceIso ? commentBase.gte("created_at", sinceIso) : commentBase,
    sinceIso ? reactionBase.gte("created_at", sinceIso) : reactionBase
  ]);

  return {
    views: aggregateDiscussionIdCounts(viewRes.data as { discussion_id: string }[] | null),
    comments: aggregateDiscussionIdCounts(commentRes.data as { discussion_id: string }[] | null),
    reactions: aggregateDiscussionIdCounts(reactionRes.data as { discussion_id: string }[] | null)
  };
}

function sortDiscussionsForExplore(items: DiscussionListItem[], sort: ExploreSort): DiscussionListItem[] {
  const copy = [...items];
  switch (sort) {
    case "date":
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "views":
      return copy.sort((a, b) => b.viewCount - a.viewCount);
    case "comments":
      return copy.sort((a, b) => b.commentCount - a.commentCount);
    case "engagements":
      return copy.sort(
        (a, b) => b.commentCount + b.reactionCount - (a.commentCount + a.reactionCount)
      );
    default:
      return copy;
  }
}

/** Trending or list: discussions with comment_count and reaction_count in one query. */
export async function getDiscussionsWithCounts(
  supabase: SupabaseClient<Database>,
  options: {
    authorId?: string;
    /** When set and non-empty, restricts to these author user ids (ignored if `authorId` is set). */
    authorIds?: string[];
    limit?: number;
    offset?: number;
    orderByTrend?: boolean;
    /** Filter by phrase in title, author name/username, or tags (topics). */
    search?: string;
    /** Filter by tag name (single tag). */
    tagFilter?: string;
    /** Match discussions tagged with any of these topic names (stored on `discussions.tags`). */
    anyOfTagNames?: string[];
    /** Explore list sort; widens the recent pool when sorting by metrics. Omit to keep legacy trending/date behavior. */
    exploreSort?: ExploreSort;
    scoreMode?: ScoreMode;
    scorePeriod?: ScorePeriod;
  } = {}
): Promise<DiscussionListItem[]> {
  const {
    authorId,
    authorIds,
    limit = 20,
    offset = 0,
    orderByTrend = true,
    search,
    tagFilter,
    anyOfTagNames,
    exploreSort,
    scoreMode,
    scorePeriod
  } = options;

  if (authorIds !== undefined && authorIds.length === 0 && !authorId) {
    return [];
  }

  const metricSort = exploreSort != null && exploreSort !== "date";
  const fetchLimit = search
    ? Math.min(100, limit * 4)
    : metricSort
      ? Math.min(200, Math.max(limit * 4, 96))
      : limit;
  const fetchOffset = search ? 0 : offset;

  let query: any = (supabase
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
      momentum_graph_points,
      impact_graph_points,
      community_users!discussions_author_id_fkey (
        name,
        username,
        avatar_url
      )
    `
    )) as any;

  if (authorId) {
    query = query.eq("author_id", authorId);
  } else if (authorIds && authorIds.length > 0) {
    query = query.in("author_id", authorIds);
  }

  if (tagFilter?.trim()) {
    query = query.overlaps("tags", [tagFilter.trim()]);
  } else if (anyOfTagNames && anyOfTagNames.length > 0) {
    query = query.overlaps("tags", anyOfTagNames);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(fetchOffset, fetchOffset + fetchLimit - 1);

  const { data: rows, error } = await query;

  if (error || !rows || rows.length === 0) return [];

  const ids = rows.map((r) => (r as { id: string }).id);
  const scoringWithPeriod = Boolean(scoreMode && scorePeriod);
  const legacyPeriodOnlyFilter = Boolean(scorePeriod && !scoreMode);
  const singleFetchSinceIso =
    legacyPeriodOnlyFilter && scorePeriod ? toIsoDate(getPeriodStart(scorePeriod)) : null;

  let viewByDiscussion: Map<string, number>;
  let commentByDiscussion: Map<string, number>;
  let reactionByDiscussion: Map<string, number>;
  let periodViewByDiscussion: Map<string, number>;
  let periodCommentByDiscussion: Map<string, number>;
  let periodReactionByDiscussion: Map<string, number>;

  if (scoringWithPeriod && scorePeriod) {
    const periodStartIso = toIsoDate(getPeriodStart(scorePeriod));
    const [allTimeMaps, periodMaps] = await Promise.all([
      fetchDiscussionEngagementCountMaps(supabase, ids, null),
      fetchDiscussionEngagementCountMaps(supabase, ids, periodStartIso)
    ]);
    viewByDiscussion = allTimeMaps.views;
    commentByDiscussion = allTimeMaps.comments;
    reactionByDiscussion = allTimeMaps.reactions;
    periodViewByDiscussion = periodMaps.views;
    periodCommentByDiscussion = periodMaps.comments;
    periodReactionByDiscussion = periodMaps.reactions;
  } else {
    const maps = await fetchDiscussionEngagementCountMaps(supabase, ids, singleFetchSinceIso);
    viewByDiscussion = maps.views;
    commentByDiscussion = maps.comments;
    reactionByDiscussion = maps.reactions;
    periodViewByDiscussion = maps.views;
    periodCommentByDiscussion = maps.comments;
    periodReactionByDiscussion = maps.reactions;
  }

  type Row = DiscussionRow & {
    community_users: { name: string; username: string; avatar_url: string | null } | null;
    momentum_graph_points?: unknown;
    impact_graph_points?: unknown;
  };

  let items: DiscussionListItem[] = (rows as Row[]).map((r) => {
    const author = r.community_users;
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      body: r.body,
      authorId: r.author_id,
      authorName: author?.name ?? "Unknown",
      authorUsername: author?.username ?? "unknown",
      authorAvatarUrl: author?.avatar_url ?? null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      tags: (r as { tags?: string[] }).tags ?? [],
      viewCount: viewByDiscussion.get(r.id) ?? 0,
      commentCount: commentByDiscussion.get(r.id) ?? 0,
      reactionCount: reactionByDiscussion.get(r.id) ?? 0,
      momentumGraphPoints: parseGraphPoints((r as Row).momentum_graph_points),
      impactGraphPoints: parseGraphPoints((r as Row).impact_graph_points)
    };
  });

  if (search?.trim()) {
    items = items.filter((item) => matchSearchPhrase(item, search));
  }

  if (scoreMode && scorePeriod) {
    items = items
      .map((item) => ({
        ...item,
        scoreSummary: buildContentScoreSummary({
          mode: scoreMode,
          period: scorePeriod,
          metrics: {
            views: periodViewByDiscussion.get(item.id) ?? 0,
            reactions: periodReactionByDiscussion.get(item.id) ?? 0,
            comments: periodCommentByDiscussion.get(item.id) ?? 0
          },
          publishedAt: item.createdAt
        })
      }))
      .sort((a, b) => (b.scoreSummary?.score ?? 0) - (a.scoreSummary?.score ?? 0));
  } else if (exploreSort === "comments" || exploreSort === "views" || exploreSort === "engagements") {
    items = sortDiscussionsForExplore(items, exploreSort);
  } else if (exploreSort === "date") {
    items = sortDiscussionsForExplore(items, "date");
  } else if (orderByTrend && !authorId) {
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

  if (search?.trim()) {
    items = items.slice(offset, offset + limit);
  } else if (metricSort) {
    items = items.slice(offset, offset + limit);
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

/** Add a reaction response for one type if the viewer has not already set one for that type. */
export async function setDiscussionReaction(
  supabase: SupabaseClient<Database>,
  discussionId: string,
  userId: string,
  reactionType: string,
  response: "up" | "down"
): Promise<boolean> {
  // Check for an existing reaction for this specific type.
  const { data: existing, error: existingError } = await supabase
    .from("discussion_reactions")
    .select("id, reaction_type")
    .eq("discussion_id", discussionId)
    .eq("user_id", userId)
    .eq("reaction_type", reactionType)
    .maybeSingle();

  if (existingError && existingError.code !== "PGRST116") {
    // Unexpected error (other than no rows); surface as failure.
    return false;
  }

  if (existing) {
    // User has already voted for this reaction type; do not allow another vote.
    return false;
  }

  const { error } = await supabase.from("discussion_reactions").insert({
    discussion_id: discussionId,
    user_id: userId,
    reaction_type: reactionType,
    response
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
