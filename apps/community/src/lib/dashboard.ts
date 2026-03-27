import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/database";
import { blogUrl, communityUrl } from "@/lib/site-urls";

type CommunityUserRow = Tables<"community_users">;

type BlogPostListRow = Pick<
  Tables<"blog_posts">,
  | "id"
  | "slug"
  | "title"
  | "author_name"
  | "status"
  | "is_featured"
  | "created_at"
  | "updated_at"
  | "published_at"
  | "excerpt"
>;

type ActivityCommentRow = Pick<
  Tables<"blog_post_comments">,
  "id" | "slug" | "author_id" | "author_name" | "body" | "created_at" | "parent_id"
>;

type ActivityMessageRow = Pick<Tables<"chat_handoffs">, "id" | "name" | "created_at" | "notes">;

export interface FeaturedProject {
  title: string;
  description: string;
  url: string | null;
}

export interface ProfileLink {
  label: string;
  url: string;
}

export interface DashboardProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  techStack: string[];
  featuredProjects: FeaturedProject[];
  profileLinks: ProfileLink[];
  /**
   * When true, the user has explicitly chosen which posts to feature
   * (including the case where they chose none). When false, we fall
   * back to showing the latest published posts.
   */
  hasFeaturedPostSelection: boolean;
  featuredPostSlugs: string[];
  /** Follower count (when from getFollowStatsForProfile or dashboard). */
  followerCount?: number;
  /** Following count (when from getFollowStatsForProfile or dashboard). */
  followingCount?: number;
  /** Whether the current viewer follows this profile (only when viewer is set). */
  isFollowing?: boolean;
}

export interface DashboardBlogPostStats {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  authorName: string;
  status: "draft" | "published" | string;
  isFeatured: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  views: number;
  reactions: number;
  comments: number;
  momentumGraphPoints: number[];
  impactGraphPoints: number[];
}

export interface DashboardBlogSummary {
  totalPosts: number;
  draftCount: number;
  publishedCount: number;
  viewsLast30Days: number;
  totalReactions: number;
  totalComments: number;
  latestDraft: DashboardBlogPostStats | null;
  topPostByViews: DashboardBlogPostStats | null;
}

export interface DashboardDiscussionSummary {
  totalDiscussions: number;
  totalViews: number;
  totalReactions: number;
  totalComments: number;
}

export type KpiPeriod = "24h" | "7d" | "30d" | "90d" | "6m";

export interface PeriodMetric {
  current: number;
  previous: number;
  /**
   * Absolute delta: current - previous.
   */
  delta: number;
  /**
   * Percentage change vs previous. Null when previous is 0 or missing.
   */
  deltaPercent: number | null;
}

export interface DashboardKpiPeriodSummary {
  periods: KpiPeriod[];
  views: Record<KpiPeriod, PeriodMetric>;
  reactions: Record<KpiPeriod, PeriodMetric>;
  comments: Record<KpiPeriod, PeriodMetric>;
}

export interface EngagementCounts {
  views: number;
  reactions: number;
  comments: number;
}

export type EngagementCountsByPeriod = Record<KpiPeriod, EngagementCounts>;

export type ActivityKind =
  | "reply"
  | "comment"
  | "direct_message"
  | "blog_reaction"
  | "discussion_comment"
  | "discussion_reaction";

export interface DashboardActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  /** Username (without @) of the actor that triggered this activity, when available. */
  actorUsername?: string | null;
  /** Reaction type (e.g. "insightful") when this activity is a reaction. */
  reactionType?: string | null;
  /** Public URL to navigate to. Omit for direct_message (messaging not built yet). */
  href?: string;
}

function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function parseTechStack(rawTechStack: string[] | Json | null): string[] {
  if (!Array.isArray(rawTechStack)) {
    return [];
  }

  const parsed: string[] = [];
  rawTechStack.forEach((item) => {
    if (typeof item === "string") {
      const normalized = item.trim();
      if (normalized) {
        parsed.push(normalized);
      }
    }
  });
  return parsed;
}

function parseFeaturedProjects(rawFeaturedProjects: Json | null): FeaturedProject[] {
  if (!Array.isArray(rawFeaturedProjects)) {
    return [];
  }

  return rawFeaturedProjects
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const value = item as Record<string, unknown>;
      const title = typeof value.title === "string" ? value.title.trim() : "";
      const description = typeof value.description === "string" ? value.description.trim() : "";
      const rawUrl = typeof value.url === "string" ? value.url : "";
      if (!title) {
        return null;
      }

      return {
        title,
        description,
        url: normalizeUrl(rawUrl)
      } satisfies FeaturedProject;
    })
    .filter((item): item is FeaturedProject => item !== null);
}

function parseProfileLinks(rawProfileLinks: Json | null): ProfileLink[] {
  if (!Array.isArray(rawProfileLinks)) {
    return [];
  }

  return rawProfileLinks
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const value = item as Record<string, unknown>;
      const rawLabel = typeof value.label === "string" ? value.label : "";
      const rawUrl = typeof value.url === "string" ? value.url : "";

      const label = rawLabel.trim();
      const url = normalizeUrl(rawUrl);

      if (!label || !url) {
        return null;
      }

      return {
        label,
        url
      } satisfies ProfileLink;
    })
    .filter((item): item is ProfileLink => item !== null);
}

function isMissingColumnError(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  return (
    error.message.includes("column") &&
    (error.message.includes("tech_stack") ||
      error.message.includes("featured_projects") ||
      error.message.includes("profile_links") ||
      error.message.includes("featured_blog_post_slugs") ||
      error.message.includes("momentum_graph_points") ||
      error.message.includes("impact_graph_points"))
  );
}

function parseGraphPoints(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "number" && Number.isFinite(entry)) return Math.min(1, Math.max(0, entry));
      return null;
    })
    .filter((entry): entry is number => entry !== null)
    .slice(-24);
}

export async function fetchDashboardProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardProfile | null> {
  const enhancedSelection = "id,name,username,email,bio,avatar_url,tech_stack,featured_projects,profile_links,featured_blog_post_slugs";
  const fallbackSelection = "id,name,username,email,bio,avatar_url";

  const enhancedResult = await supabase.from("community_users").select(enhancedSelection).eq("id", userId).maybeSingle();
  if (!enhancedResult.error && enhancedResult.data) {
    const profile = enhancedResult.data as unknown as CommunityUserRow & {
      tech_stack?: string[] | Json | null;
      featured_projects?: Json | null;
      profile_links?: Json | null;
      featured_blog_post_slugs?: string[] | null;
    };

    const hasFeaturedPostSelection = Array.isArray(profile.featured_blog_post_slugs);
    const featuredPostSlugs = hasFeaturedPostSelection
      ? profile.featured_blog_post_slugs.filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0
        )
      : [];

    return {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      email: profile.email,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      techStack: parseTechStack(profile.tech_stack ?? []),
      featuredProjects: parseFeaturedProjects(profile.featured_projects ?? []),
      profileLinks: parseProfileLinks(profile.profile_links ?? []),
      hasFeaturedPostSelection,
      featuredPostSlugs
    };
  }

  if (!isMissingColumnError(enhancedResult.error)) {
    return null;
  }

  const fallbackResult = await supabase.from("community_users").select(fallbackSelection).eq("id", userId).maybeSingle();
  if (fallbackResult.error || !fallbackResult.data) {
    return null;
  }

  const profile = fallbackResult.data;
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    email: profile.email,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    techStack: [],
    featuredProjects: [],
    profileLinks: [],
    hasFeaturedPostSelection: false,
    featuredPostSlugs: []
  };
}

async function fetchEngagementCountsBySlug(
  supabase: SupabaseClient<Database>,
  slugs: string[]
): Promise<Record<string, { views: number; reactions: number; comments: number }>> {
  const counts = Object.fromEntries(slugs.map((slug) => [slug, { views: 0, reactions: 0, comments: 0 }]));
  if (slugs.length === 0) {
    return counts;
  }

  const requests = slugs.flatMap((slug) => [
    supabase.from("blog_post_views").select("*", { count: "exact", head: true }).eq("slug", slug),
    supabase.from("blog_post_reactions").select("*", { count: "exact", head: true }).eq("slug", slug),
    supabase.from("blog_post_comments").select("*", { count: "exact", head: true }).eq("slug", slug).eq("is_approved", true)
  ]);

  const settled = await Promise.all(requests);
  slugs.forEach((slug, index) => {
    const offset = index * 3;
    counts[slug] = {
      views: settled[offset]?.count ?? 0,
      reactions: settled[offset + 1]?.count ?? 0,
      comments: settled[offset + 2]?.count ?? 0
    };
  });

  return counts;
}

async function fetchCountForWindow(
  supabase: SupabaseClient<Database>,
  table:
    | "blog_post_views"
    | "blog_post_reactions"
    | "blog_post_comments",
  slugs: string[],
  startIso: string,
  endIso: string
): Promise<number> {
  if (slugs.length === 0) {
    return 0;
  }

  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .in("slug", slugs)
    .gte("created_at", startIso)
    .lt("created_at", endIso);

  return count ?? 0;
}

function buildEmptyPeriodCounts(periods: KpiPeriod[]): EngagementCountsByPeriod {
  return periods.reduce(
    (accumulator, period) => {
      accumulator[period] = { views: 0, reactions: 0, comments: 0 };
      return accumulator;
    },
    {} as EngagementCountsByPeriod
  );
}

function getPeriodDurationsInDays(): Record<KpiPeriod, number> {
  return {
    "24h": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "6m": 183
  };
}

function buildPeriodStartMs(periods: KpiPeriod[], nowMs: number): Record<KpiPeriod, number> {
  const dayMs = 86_400_000;
  const durations = getPeriodDurationsInDays();
  return periods.reduce(
    (accumulator, period) => {
      accumulator[period] = nowMs - durations[period] * dayMs;
      return accumulator;
    },
    {} as Record<KpiPeriod, number>
  );
}

function incrementPeriodCountsForRow(
  store: Record<string, EngagementCountsByPeriod>,
  key: string,
  createdAt: string,
  metric: keyof EngagementCounts,
  periods: KpiPeriod[],
  periodStartMs: Record<KpiPeriod, number>
): void {
  const rowTs = new Date(createdAt).getTime();
  if (!Number.isFinite(rowTs)) return;
  const target = store[key];
  if (!target) return;
  periods.forEach((period) => {
    if (rowTs >= periodStartMs[period]) {
      target[period][metric] += 1;
    }
  });
}

export async function fetchBlogEngagementCountsBySlugByPeriod(
  supabase: SupabaseClient<Database>,
  slugs: string[],
  periods: KpiPeriod[] = ["24h", "7d", "30d", "90d", "6m"]
): Promise<Record<string, EngagementCountsByPeriod>> {
  const activePeriods = periods.filter((period): period is KpiPeriod => period in getPeriodDurationsInDays());
  const result = Object.fromEntries(slugs.map((slug) => [slug, buildEmptyPeriodCounts(activePeriods)]));
  if (slugs.length === 0 || activePeriods.length === 0) return result;

  const durations = getPeriodDurationsInDays();
  const maxWindowDays = Math.max(...activePeriods.map((period) => durations[period]));
  const nowMs = Date.now();
  const periodStartMs = buildPeriodStartMs(activePeriods, nowMs);
  const minStartIso = new Date(nowMs - maxWindowDays * 86_400_000).toISOString();

  const [viewsResult, reactionsResult, commentsResult] = await Promise.all([
    supabase.from("blog_post_views").select("slug,created_at").in("slug", slugs).gte("created_at", minStartIso),
    supabase
      .from("blog_post_reactions")
      .select("slug,created_at")
      .in("slug", slugs)
      .gte("created_at", minStartIso),
    supabase
      .from("blog_post_comments")
      .select("slug,created_at")
      .in("slug", slugs)
      .eq("is_approved", true)
      .gte("created_at", minStartIso)
  ]);

  (viewsResult.data ?? []).forEach((row: { slug: string; created_at: string }) => {
    incrementPeriodCountsForRow(result, row.slug, row.created_at, "views", activePeriods, periodStartMs);
  });
  (reactionsResult.data ?? []).forEach((row: { slug: string; created_at: string }) => {
    incrementPeriodCountsForRow(result, row.slug, row.created_at, "reactions", activePeriods, periodStartMs);
  });
  (commentsResult.data ?? []).forEach((row: { slug: string; created_at: string }) => {
    incrementPeriodCountsForRow(result, row.slug, row.created_at, "comments", activePeriods, periodStartMs);
  });

  return result;
}

export async function fetchDiscussionEngagementCountsByIdByPeriod(
  supabase: SupabaseClient<Database>,
  discussionIds: string[],
  periods: KpiPeriod[] = ["24h", "7d", "30d", "90d", "6m"]
): Promise<Record<string, EngagementCountsByPeriod>> {
  const activePeriods = periods.filter((period): period is KpiPeriod => period in getPeriodDurationsInDays());
  const result = Object.fromEntries(
    discussionIds.map((discussionId) => [discussionId, buildEmptyPeriodCounts(activePeriods)])
  );
  if (discussionIds.length === 0 || activePeriods.length === 0) return result;

  const durations = getPeriodDurationsInDays();
  const maxWindowDays = Math.max(...activePeriods.map((period) => durations[period]));
  const nowMs = Date.now();
  const periodStartMs = buildPeriodStartMs(activePeriods, nowMs);
  const minStartIso = new Date(nowMs - maxWindowDays * 86_400_000).toISOString();

  const [viewsResult, reactionsResult, commentsResult] = await Promise.all([
    supabase
      .from("discussion_views")
      .select("discussion_id,created_at")
      .in("discussion_id", discussionIds)
      .gte("created_at", minStartIso),
    supabase
      .from("discussion_reactions")
      .select("discussion_id,created_at")
      .in("discussion_id", discussionIds)
      .gte("created_at", minStartIso),
    supabase
      .from("discussion_comments")
      .select("discussion_id,created_at")
      .in("discussion_id", discussionIds)
      .gte("created_at", minStartIso)
  ]);

  (viewsResult.data ?? []).forEach((row: { discussion_id: string; created_at: string }) => {
    incrementPeriodCountsForRow(result, row.discussion_id, row.created_at, "views", activePeriods, periodStartMs);
  });
  (reactionsResult.data ?? []).forEach((row: { discussion_id: string; created_at: string }) => {
    incrementPeriodCountsForRow(result, row.discussion_id, row.created_at, "reactions", activePeriods, periodStartMs);
  });
  (commentsResult.data ?? []).forEach((row: { discussion_id: string; created_at: string }) => {
    incrementPeriodCountsForRow(result, row.discussion_id, row.created_at, "comments", activePeriods, periodStartMs);
  });

  return result;
}

async function fetchDiscussionCountForWindow(
  supabase: SupabaseClient<Database>,
  table: "discussion_views" | "discussion_reactions" | "discussion_comments",
  discussionIds: string[],
  startIso: string,
  endIso: string
): Promise<number> {
  if (discussionIds.length === 0) {
    return 0;
  }

  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .in("discussion_id", discussionIds)
    .gte("created_at", startIso)
    .lt("created_at", endIso);

  return count ?? 0;
}

function buildPeriodMetric(current: number, previous: number): PeriodMetric {
  const delta = current - previous;
  if (previous <= 0) {
    return {
      current,
      previous,
      delta,
      deltaPercent: null
    };
  }

  const deltaPercent = (delta / previous) * 100;
  return {
    current,
    previous,
    delta,
    deltaPercent
  };
}

export async function fetchEngagementKpisByPeriod(
  supabase: SupabaseClient<Database>,
  {
    slugs,
    periods = ["24h", "7d", "30d", "90d", "6m"]
  }: {
    slugs: string[];
    periods?: KpiPeriod[];
  }
): Promise<DashboardKpiPeriodSummary | null> {
  if (slugs.length === 0) {
    return null;
  }

  const now = Date.now();

  const periodDurations: Record<KpiPeriod, number> = {
    "24h": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "6m": 180
  };

  const activePeriods = periods.filter((period): period is KpiPeriod => period in periodDurations);
  if (activePeriods.length === 0) {
    return null;
  }

  const views: Partial<Record<KpiPeriod, PeriodMetric>> = {};
  const reactions: Partial<Record<KpiPeriod, PeriodMetric>> = {};
  const comments: Partial<Record<KpiPeriod, PeriodMetric>> = {};

  for (const period of activePeriods) {
    const days = periodDurations[period];
    const durationMs = days * 86_400_000;

    const currentStart = new Date(now - durationMs);
    const previousStart = new Date(now - durationMs * 2);
    const previousEnd = currentStart;

    const currentStartIso = currentStart.toISOString();
    const currentEndIso = new Date(now).toISOString();
    const previousStartIso = previousStart.toISOString();
    const previousEndIso = previousEnd.toISOString();

    // Views
    const [viewsCurrent, viewsPrevious] = await Promise.all([
      fetchCountForWindow(supabase, "blog_post_views", slugs, currentStartIso, currentEndIso),
      fetchCountForWindow(supabase, "blog_post_views", slugs, previousStartIso, previousEndIso)
    ]);

    // Reactions
    const [reactionsCurrent, reactionsPrevious] = await Promise.all([
      fetchCountForWindow(supabase, "blog_post_reactions", slugs, currentStartIso, currentEndIso),
      fetchCountForWindow(supabase, "blog_post_reactions", slugs, previousStartIso, previousEndIso)
    ]);

    // Comments (approved only, to match other dashboard use)
    const [commentsCurrent, commentsPrevious] = await Promise.all([
      fetchCountForWindow(supabase, "blog_post_comments", slugs, currentStartIso, currentEndIso),
      fetchCountForWindow(supabase, "blog_post_comments", slugs, previousStartIso, previousEndIso)
    ]);

    views[period] = buildPeriodMetric(viewsCurrent, viewsPrevious);
    reactions[period] = buildPeriodMetric(reactionsCurrent, reactionsPrevious);
    comments[period] = buildPeriodMetric(commentsCurrent, commentsPrevious);
  }

  return {
    periods: activePeriods,
    views: views as Record<KpiPeriod, PeriodMetric>,
    reactions: reactions as Record<KpiPeriod, PeriodMetric>,
    comments: comments as Record<KpiPeriod, PeriodMetric>
  };
}

export async function fetchDiscussionEngagementKpisByPeriod(
  supabase: SupabaseClient<Database>,
  {
    discussionIds,
    periods = ["24h", "7d", "30d", "90d", "6m"]
  }: {
    discussionIds: string[];
    periods?: KpiPeriod[];
  }
): Promise<DashboardKpiPeriodSummary | null> {
  if (discussionIds.length === 0) {
    return null;
  }

  const now = Date.now();
  const periodDurations: Record<KpiPeriod, number> = {
    "24h": 1,
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "6m": 180
  };

  const activePeriods = periods.filter((period): period is KpiPeriod => period in periodDurations);
  if (activePeriods.length === 0) {
    return null;
  }

  const views: Partial<Record<KpiPeriod, PeriodMetric>> = {};
  const reactions: Partial<Record<KpiPeriod, PeriodMetric>> = {};
  const comments: Partial<Record<KpiPeriod, PeriodMetric>> = {};

  for (const period of activePeriods) {
    const days = periodDurations[period];
    const durationMs = days * 86_400_000;

    const currentStart = new Date(now - durationMs);
    const previousStart = new Date(now - durationMs * 2);
    const previousEnd = currentStart;

    const currentStartIso = currentStart.toISOString();
    const currentEndIso = new Date(now).toISOString();
    const previousStartIso = previousStart.toISOString();
    const previousEndIso = previousEnd.toISOString();

    const [viewsCurrent, viewsPrevious] = await Promise.all([
      fetchDiscussionCountForWindow(
        supabase,
        "discussion_views",
        discussionIds,
        currentStartIso,
        currentEndIso
      ),
      fetchDiscussionCountForWindow(
        supabase,
        "discussion_views",
        discussionIds,
        previousStartIso,
        previousEndIso
      )
    ]);

    const [reactionsCurrent, reactionsPrevious] = await Promise.all([
      fetchDiscussionCountForWindow(
        supabase,
        "discussion_reactions",
        discussionIds,
        currentStartIso,
        currentEndIso
      ),
      fetchDiscussionCountForWindow(
        supabase,
        "discussion_reactions",
        discussionIds,
        previousStartIso,
        previousEndIso
      )
    ]);

    const [commentsCurrent, commentsPrevious] = await Promise.all([
      fetchDiscussionCountForWindow(
        supabase,
        "discussion_comments",
        discussionIds,
        currentStartIso,
        currentEndIso
      ),
      fetchDiscussionCountForWindow(
        supabase,
        "discussion_comments",
        discussionIds,
        previousStartIso,
        previousEndIso
      )
    ]);

    views[period] = buildPeriodMetric(viewsCurrent, viewsPrevious);
    reactions[period] = buildPeriodMetric(reactionsCurrent, reactionsPrevious);
    comments[period] = buildPeriodMetric(commentsCurrent, commentsPrevious);
  }

  return {
    periods: activePeriods,
    views: views as Record<KpiPeriod, PeriodMetric>,
    reactions: reactions as Record<KpiPeriod, PeriodMetric>,
    comments: comments as Record<KpiPeriod, PeriodMetric>
  };
}

export async function fetchUserBlogPostsWithStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardBlogPostStats[]> {
  const blogPostsQuery = (supabase.from("blog_posts") as any)
    .select("id,slug,title,excerpt,author_name,status,is_featured,created_at,updated_at,published_at,momentum_graph_points,impact_graph_points")
    .eq("author_id", userId)
    .order("updated_at", { ascending: false, nullsFirst: false });

  const { data, error } = await blogPostsQuery;

  if (error || !data) {
    return [];
  }

  const rows = data as (BlogPostListRow & {
    momentum_graph_points?: Json | null;
    impact_graph_points?: Json | null;
  })[];
  const countsBySlug = await fetchEngagementCountsBySlug(
    supabase,
    rows.map((row) => row.slug)
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    authorName: row.author_name ?? "CodeBay Team",
    status: row.status,
    isFeatured: row.is_featured ?? false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    views: countsBySlug[row.slug]?.views ?? 0,
    reactions: countsBySlug[row.slug]?.reactions ?? 0,
    comments: countsBySlug[row.slug]?.comments ?? 0,
    momentumGraphPoints: parseGraphPoints(row.momentum_graph_points ?? []),
    impactGraphPoints: parseGraphPoints(row.impact_graph_points ?? [])
  }));
}

export function buildBlogSummary(posts: DashboardBlogPostStats[]): DashboardBlogSummary {
  const draftPosts = posts.filter((post) => post.status === "draft");
  const publishedPosts = posts.filter((post) => post.status === "published");

  const sortedDrafts = [...draftPosts].sort((a, b) => {
    const left = a.updatedAt ?? a.createdAt ?? "";
    const right = b.updatedAt ?? b.createdAt ?? "";
    return right.localeCompare(left);
  });

  const now = Date.now();
  const last30Days = now - 1000 * 60 * 60 * 24 * 30;

  const viewsLast30Days = publishedPosts
    .filter((post) => {
      const dateValue = post.publishedAt ?? post.updatedAt ?? post.createdAt;
      if (!dateValue) {
        return false;
      }
      return new Date(dateValue).getTime() >= last30Days;
    })
    .reduce((accumulator, post) => accumulator + post.views, 0);

  const topPostByViews = [...posts].sort((a, b) => b.views - a.views)[0] ?? null;

  return {
    totalPosts: posts.length,
    draftCount: draftPosts.length,
    publishedCount: publishedPosts.length,
    viewsLast30Days,
    totalReactions: posts.reduce((accumulator, post) => accumulator + post.reactions, 0),
    totalComments: posts.reduce((accumulator, post) => accumulator + post.comments, 0),
    latestDraft: sortedDrafts[0] ?? null,
    topPostByViews
  };
}

export async function fetchDashboardDiscussionSummary(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardDiscussionSummary> {
  const { data: authoredDiscussions, count: discussionCount } = await supabase
    .from("discussions")
    .select("id", { count: "exact" })
    .eq("author_id", userId);

  const discussionIds = ((authoredDiscussions ?? []) as Array<{ id: string }>).map((row) => row.id);
  if (discussionIds.length === 0) {
    return {
      totalDiscussions: 0,
      totalViews: 0,
      totalReactions: 0,
      totalComments: 0
    };
  }

  const [viewsResult, reactionsResult, commentsResult] = await Promise.all([
    supabase
      .from("discussion_views")
      .select("id", { count: "exact", head: true })
      .in("discussion_id", discussionIds),
    supabase
      .from("discussion_reactions")
      .select("id", { count: "exact", head: true })
      .in("discussion_id", discussionIds),
    supabase
      .from("discussion_comments")
      .select("id", { count: "exact", head: true })
      .in("discussion_id", discussionIds)
  ]);

  return {
    totalDiscussions: discussionCount ?? discussionIds.length,
    totalViews: viewsResult.count ?? 0,
    totalReactions: reactionsResult.count ?? 0,
    totalComments: commentsResult.count ?? 0
  };
}

function buildAuthorSegment(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "author";
}

export async function fetchDashboardActivity(
  supabase: SupabaseClient<Database>,
  {
    userId,
    userEmail,
    postMapBySlug,
    limit
  }: {
    userId: string;
    userEmail: string | null;
    postMapBySlug: Record<string, { id: string; title: string; authorName: string }>;
    limit?: number;
  }
): Promise<DashboardActivityItem[]> {
  const resolvedLimit = limit ?? 8;
  const postSlugs = Object.keys(postMapBySlug);
  type ActivityDraft = Omit<DashboardActivityItem, "isRead" | "actorUsername"> & { actorUserId?: string | null };
  const items: ActivityDraft[] = [];

  if (postSlugs.length > 0) {
    const incomingCommentsResult = await supabase
      .from("blog_post_comments")
      .select("id,slug,author_id,author_name,body,created_at,parent_id")
      .in("slug", postSlugs)
      .order("created_at", { ascending: false })
      .limit(resolvedLimit * 2);

    const incomingComments = (incomingCommentsResult.data ?? []) as ActivityCommentRow[];

    incomingComments
      .filter((comment) => comment.parent_id === null)
      .slice(0, resolvedLimit)
      .forEach((comment) => {
        const post = postMapBySlug[comment.slug];
        if (!post) return;

        // Do not create an activity item when the post author comments on their own post.
        // Primary guard: compare Supabase user IDs.
        if (comment.author_id === userId) {
          return;
        }

        // Secondary guard: fall back to name matching in case older rows have null author_id.
        if (comment.author_name && comment.author_name === post.authorName) {
          return;
        }

        const authorSegment = buildAuthorSegment(post.authorName);
        const articleHref = `${blogUrl}/${authorSegment}/${comment.slug}`;

        items.push({
          id: `incoming-comment-${comment.id}`,
          kind: "comment",
          title: "New comment on your post",
          description: `${comment.author_name ?? "A reader"} commented on "${post.title}"`,
          createdAt: comment.created_at,
          actorUserId: comment.author_id,
          href: articleHref
        });
      });
  }

  const userCommentsResult = await supabase
    .from("blog_post_comments")
    .select("id")
    .eq("author_id", userId);
  const userCommentIds = ((userCommentsResult.data ?? []) as { id: string }[]).map((c) => c.id);

  if (userCommentIds.length > 0) {
    const repliesResult = await supabase
      .from("blog_post_comments")
      .select("id,slug,author_id,author_name,body,created_at,parent_id")
      .in("parent_id", userCommentIds)
      .neq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(resolvedLimit);

    const replies = (repliesResult.data ?? []) as ActivityCommentRow[];
    const replySlugs = [...new Set(replies.map((r) => r.slug))];
    const missingSlugs = replySlugs.filter((s) => !(s in postMapBySlug));
    let extendedPostMap = { ...postMapBySlug };

    if (missingSlugs.length > 0) {
      const { data: postsData } = await supabase
        .from("blog_posts")
        .select("slug,title,author_name")
        .in("slug", missingSlugs);
      const rows = (postsData ?? []) as { slug: string; title: string; author_name: string | null }[];
      rows.forEach((row) => {
        extendedPostMap[row.slug] = {
          id: "",
          title: row.title,
          authorName: row.author_name ?? "Author"
        };
      });
    }

    replies.slice(0, resolvedLimit).forEach((reply) => {
      const post = extendedPostMap[reply.slug];
      if (!post) return;

      const authorSegment = buildAuthorSegment(post.authorName);
      const articleHref = `${blogUrl}/${authorSegment}/${reply.slug}`;

      items.push({
        id: `reply-${reply.id}`,
        kind: "reply",
        title: "Reply to your comment",
        description: `${reply.author_name ?? "A reader"} replied to your comment on "${post.title}"`,
        createdAt: reply.created_at,
        actorUserId: reply.author_id,
        href: articleHref
      });
    });
  }

  // Blog reactions on the user's posts (positive/“up” feedback only).
  if (postSlugs.length > 0) {
    const { data: reactionRows } = await supabase
      .from("blog_post_reactions")
      .select("id, slug, reaction_type, response, user_id, created_at")
      .in("slug", postSlugs)
      .neq("user_id", userId)
      .eq("response", "up")
      .order("created_at", { ascending: false })
      .limit(resolvedLimit * 2);

    (reactionRows ?? [])
      .slice(0, resolvedLimit)
      .forEach((reaction: { id: string; slug: string; reaction_type: string; user_id: string; created_at: string }) => {
        const post = postMapBySlug[reaction.slug];
        if (!post) return;

        const authorSegment = buildAuthorSegment(post.authorName);
        const articleHref = `${blogUrl}/${authorSegment}/${reaction.slug}`;
        const reactionLabel = reaction.reaction_type === "insightful" ? "found insightful" : "reacted to";

        items.push({
          id: `blog-reaction-${reaction.id}`,
          kind: "blog_reaction",
          title: "New reaction on your post",
          description: `Someone ${reactionLabel} "${post.title}"`,
          reactionType: reaction.reaction_type,
          createdAt: reaction.created_at,
          actorUserId: reaction.user_id,
          href: articleHref
        });
      });
  }

  // Discussion activity: comments and reactions on discussions authored by this user.
  const { data: authoredDiscussions } = await supabase
    .from("discussions")
    .select("id, slug, title, author_id")
    .eq("author_id", userId);

  const discussionRows =
    (authoredDiscussions as { id: string; slug: string; title: string; author_id: string }[] | null) ?? [];
  const discussionById = new Map<string, { id: string; slug: string; title: string }>();
  discussionRows.forEach((row) => {
    discussionById.set(row.id, { id: row.id, slug: row.slug, title: row.title });
  });

  const discussionIds = discussionRows.map((row) => row.id);

  if (discussionIds.length > 0) {
    const [{ data: discussionComments }, { data: discussionReactions }] = await Promise.all([
      supabase
        .from("discussion_comments")
        .select("id, discussion_id, author_id, author_name, created_at")
        .in("discussion_id", discussionIds)
        .neq("author_id", userId)
        .order("created_at", { ascending: false })
        .limit(resolvedLimit * 2),
      supabase
        .from("discussion_reactions")
        .select("id, discussion_id, user_id, reaction_type, created_at")
        .in("discussion_id", discussionIds)
        .neq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(resolvedLimit * 2)
    ]);

    (discussionComments ?? [])
      .slice(0, resolvedLimit)
      .forEach(
        (comment: {
          id: string;
          discussion_id: string;
          author_id: string | null;
          author_name: string | null;
          created_at: string;
        }) => {
          const discussion = discussionById.get(comment.discussion_id);
          if (!discussion) return;

          items.push({
            id: `discussion-comment-${comment.id}`,
            kind: "discussion_comment",
            title: "New comment on your discussion",
            description: `${comment.author_name ?? "A member"} commented on "${discussion.title}"`,
            createdAt: comment.created_at,
            actorUserId: comment.author_id,
            href: `${communityUrl}/discussions/${discussion.slug}`
          });
        }
      );

    (discussionReactions ?? [])
      .slice(0, resolvedLimit)
      .forEach(
        (reaction: {
          id: string;
          discussion_id: string;
          user_id: string;
          reaction_type: string;
          created_at: string;
        }) => {
          const discussion = discussionById.get(reaction.discussion_id);
          if (!discussion) return;

          items.push({
            id: `discussion-reaction-${reaction.id}`,
            kind: "discussion_reaction",
            title: "New reaction on your discussion",
            description: `Someone reacted to "${discussion.title}"`,
            reactionType: reaction.reaction_type,
            createdAt: reaction.created_at,
            actorUserId: reaction.user_id,
            href: `${communityUrl}/discussions/${discussion.slug}`
          });
        }
      );
  }

  if (userEmail) {
    const directMessagesResult = await supabase
      .from("chat_handoffs")
      .select("id,name,created_at,notes")
      .eq("email", userEmail)
      .order("created_at", { ascending: false })
      .limit(resolvedLimit);

    const directMessages = (directMessagesResult.data ?? []) as ActivityMessageRow[];
    directMessages.forEach((message) => {
      items.push({
        id: `direct-message-${message.id}`,
        kind: "direct_message",
        title: "Direct message update",
        description: `New message from ${message.name}${message.notes ? `: ${message.notes}` : ""}`,
        createdAt: message.created_at
        // href omitted: messaging feature not built yet, do nothing on click
      });
    });
  }

  const readsResult = await supabase
    .from("dashboard_activity_reads")
    .select("activity_id")
    .eq("user_id", userId);

  const readIds = new Set<string>(
    (readsResult.data ?? []).map((row: { activity_id: string }) => row.activity_id)
  );

  const actorIds = [
    ...new Set(items.map((item) => item.actorUserId).filter((id): id is string => typeof id === "string"))
  ];
  const usernameById = new Map<string, string>();

  if (actorIds.length > 0) {
    const { data: actorRows } = await supabase.from("community_users").select("id,username").in("id", actorIds);
    ((actorRows ?? []) as Array<{ id: string; username: string }>).forEach((row) => {
      usernameById.set(row.id, row.username);
    });
  }

  return items
    .filter((item) => !readIds.has(item.id))
    .map((item) => ({
      ...item,
      actorUsername: item.actorUserId ? usernameById.get(item.actorUserId) ?? null : null,
      isRead: false
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, resolvedLimit);
}
