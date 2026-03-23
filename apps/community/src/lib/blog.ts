import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/database";
import type { ExploreSort } from "@/lib/explore";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface BlogPostSection {
  heading: string;
  paragraphs: string[];
}

type BlogPostRow = Pick<
  Tables<"blog_posts">,
  | "slug"
  | "title"
  | "description"
  | "excerpt"
  | "author_id"
  | "published_at"
  | "updated_at"
  | "created_at"
  | "read_time_minutes"
  | "author_name"
  | "tags"
  | "sections"
  | "is_featured"
>;

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  authorId: string | null;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  authorName: string;
  tags: string[];
  sections: BlogPostSection[];
  isFeatured: boolean;
}

export interface BlogFeaturedProject {
  title: string;
  description: string;
  url: string | null;
}

export interface ProfileLink {
  label: string;
  url: string;
}

export interface BlogAuthorProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  techStack: string[];
  featuredProjects: BlogFeaturedProject[];
  profileLinks: ProfileLink[];
}

function parseBlogPostSections(rawSections: Json): BlogPostSection[] {
  if (!Array.isArray(rawSections)) {
    return [];
  }

  return rawSections
    .map((rawSection) => {
      if (!rawSection || typeof rawSection !== "object" || Array.isArray(rawSection)) {
        return null;
      }

      const section = rawSection as Record<string, unknown>;
      const heading = typeof section.heading === "string" ? section.heading : "";
      const rawParagraphs = section.paragraphs;
      const paragraphs = Array.isArray(rawParagraphs)
        ? rawParagraphs.filter((paragraph): paragraph is string => typeof paragraph === "string")
        : [];

      if (!heading || paragraphs.length === 0) {
        return null;
      }

      return { heading, paragraphs };
    })
    .filter((section): section is BlogPostSection => section !== null);
}

function mapRowToBlogPost(row: BlogPostRow): BlogPost {
  const fallbackDate = new Date().toISOString();
  const publishedAt = row.published_at ?? row.created_at ?? fallbackDate;
  const updatedAt = row.updated_at ?? publishedAt;

  return {
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    excerpt: row.excerpt ?? "",
    authorId: row.author_id,
    publishedAt,
    updatedAt,
    readTimeMinutes: row.read_time_minutes ?? 5,
    authorName: row.author_name ?? "CodeBay Team",
    tags: row.tags ?? [],
    sections: parseBlogPostSections(row.sections),
    isFeatured: row.is_featured ?? false
  };
}

export async function fetchPublishedBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug,title,description,excerpt,author_id,published_at,updated_at,created_at,read_time_minutes,author_name,tags,sections,is_featured"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as BlogPostRow[];
  return rows.map(mapRowToBlogPost);
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug,title,description,excerpt,author_id,published_at,updated_at,created_at,read_time_minutes,author_name,tags,sections,is_featured"
    )
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapRowToBlogPost(data as BlogPostRow);
}

export async function fetchPublishedBlogPostsByAuthorId(authorId: string): Promise<BlogPost[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug,title,description,excerpt,author_id,published_at,updated_at,created_at,read_time_minutes,author_name,tags,sections,is_featured"
    )
    .eq("status", "published")
    .eq("author_id", authorId)
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as BlogPostRow[];
  return rows.map(mapRowToBlogPost);
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorId: string | null;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  publishedAt: string | null;
  tags: string[];
}

function matchBlogSearchPhrase(item: BlogPostListItem, phrase: string): boolean {
  const p = phrase.toLowerCase().trim();
  if (!p) return true;
  return (
    item.title.toLowerCase().includes(p) ||
    item.excerpt.toLowerCase().includes(p) ||
    item.authorName.toLowerCase().includes(p) ||
    item.authorUsername.toLowerCase().includes(p) ||
    item.tags.some((t) => t.toLowerCase().includes(p))
  );
}

/**
 * Community blog index: published posts with optional topic and text search (mirrors discussions list behavior).
 */
export async function getBlogPostsForCommunityList(
  supabase: SupabaseClient<Database>,
  options: {
    limit?: number;
    offset?: number;
    search?: string;
    tagFilter?: string;
    authorId?: string;
    /** When set and non-empty; ignored if `authorId` is set. */
    authorIds?: string[];
    /** Match posts tagged with any of these topic names (`blog_posts.tags`). */
    anyOfTagNames?: string[];
    /** When set and not `date`, fetch a larger recent pool so in-memory sort by metrics is meaningful. */
    exploreSort?: ExploreSort;
  } = {}
): Promise<BlogPostListItem[]> {
  const { limit = 32, offset = 0, search, tagFilter, authorId, authorIds, anyOfTagNames, exploreSort } = options;
  const hasSearch = Boolean(search?.trim());
  const metricSort = exploreSort != null && exploreSort !== "date";
  const fetchLimit = hasSearch
    ? Math.min(100, limit * 4)
    : metricSort
      ? Math.min(200, Math.max(limit * 4, 96))
      : limit;
  const fetchOffset = hasSearch ? 0 : offset;

  if (authorIds !== undefined && authorIds.length === 0 && !authorId) {
    return [];
  }

  let query = supabase
    .from("blog_posts")
    .select(
      `
      id,
      slug,
      title,
      excerpt,
      author_id,
      author_name,
      published_at,
      tags,
      community_users!blog_posts_author_id_fkey (
        username,
        avatar_url
      )
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

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

  query = query.range(fetchOffset, fetchOffset + fetchLimit - 1);

  const { data: rows, error } = await query;

  if (error || !rows || rows.length === 0) return [];

  type ListRow = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    author_id: string | null;
    author_name: string | null;
    published_at: string | null;
    tags: string[] | null;
    community_users: { username: string; avatar_url: string | null } | null;
  };

  let items: BlogPostListItem[] = (rows as ListRow[]).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt ?? "",
    authorId: r.author_id,
    authorName: r.author_name ?? "Unknown",
    authorUsername: r.community_users?.username ?? "",
    authorAvatarUrl: r.community_users?.avatar_url ?? null,
    publishedAt: r.published_at,
    tags: r.tags ?? []
  }));

  if (hasSearch) {
    items = items.filter((item) => matchBlogSearchPhrase(item, search!));
    items = items.slice(offset, offset + limit);
  }

  return items;
}

function normalizeUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function parseTechStack(rawTechStack: string[] | Json | null): string[] {
  if (!Array.isArray(rawTechStack)) return [];
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

function parseFeaturedProjects(rawFeaturedProjects: Json | null): BlogFeaturedProject[] {
  if (!Array.isArray(rawFeaturedProjects)) return [];

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
      } satisfies BlogFeaturedProject;
    })
    .filter((item): item is BlogFeaturedProject => item !== null);
}

function parseProfileLinks(rawProfileLinks: Json | null): ProfileLink[] {
  if (!Array.isArray(rawProfileLinks)) return [];
  return rawProfileLinks
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return null;
      const value = item as Record<string, unknown>;
      const rawLabel = typeof value.label === "string" ? value.label : "";
      const rawUrl = typeof value.url === "string" ? value.url : "";
      const label = rawLabel.trim();
      const url = normalizeUrl(rawUrl);
      if (!label || !url) return null;
      return { label, url } satisfies ProfileLink;
    })
    .filter((item): item is ProfileLink => item !== null);
}

function isMissingProfileColumnError(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  return (
    error.message.includes("column") &&
    (error.message.includes("tech_stack") ||
      error.message.includes("featured_projects") ||
      error.message.includes("profile_links"))
  );
}

function mapAuthorProfileRow(
  row: Pick<Tables<"community_users">, "id" | "name" | "username" | "bio" | "avatar_url"> & {
    tech_stack?: string[] | Json | null;
    featured_projects?: Json | null;
    profile_links?: Json | null;
  }
): BlogAuthorProfile {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    techStack: parseTechStack(row.tech_stack ?? []),
    featuredProjects: parseFeaturedProjects(row.featured_projects ?? []),
    profileLinks: parseProfileLinks(row.profile_links ?? [])
  };
}

async function fetchAuthorProfileBy(
  key: "id" | "username",
  value: string
): Promise<BlogAuthorProfile | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const enhancedSelection = "id,name,username,bio,avatar_url,tech_stack,featured_projects,profile_links";
  const fallbackSelection = "id,name,username,bio,avatar_url";

  const enhancedResult = await supabase.from("community_users").select(enhancedSelection).eq(key, value).maybeSingle();
  if (!enhancedResult.error && enhancedResult.data) {
    return mapAuthorProfileRow(enhancedResult.data);
  }

  if (!isMissingProfileColumnError(enhancedResult.error)) {
    return null;
  }

  const fallbackResult = await supabase.from("community_users").select(fallbackSelection).eq(key, value).maybeSingle();
  if (fallbackResult.error || !fallbackResult.data) {
    return null;
  }

  return mapAuthorProfileRow(fallbackResult.data);
}

export async function fetchBlogAuthorProfileByUsername(username: string): Promise<BlogAuthorProfile | null> {
  return fetchAuthorProfileBy("username", username.toLowerCase().trim());
}

export async function fetchBlogAuthorProfileById(authorId: string): Promise<BlogAuthorProfile | null> {
  return fetchAuthorProfileBy("id", authorId);
}

export interface BlogEngagementCounts {
  views: number;
  reactions: number;
  comments: number;
}

/** Re-order blog list rows after `fetchBlogEngagementCounts` using the same metrics as the cards. */
export function sortBlogPostsForExplore(
  posts: BlogPostListItem[],
  engagementBySlug: Record<string, BlogEngagementCounts>,
  sort: ExploreSort
): BlogPostListItem[] {
  const get = (slug: string) => engagementBySlug[slug] ?? { views: 0, reactions: 0, comments: 0 };
  const copy = [...posts];
  switch (sort) {
    case "date":
      return copy.sort((a, b) => {
        const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return tb - ta;
      });
    case "views":
      return copy.sort((a, b) => get(b.slug).views - get(a.slug).views);
    case "comments":
      return copy.sort((a, b) => get(b.slug).comments - get(a.slug).comments);
    case "engagements":
      return copy.sort((a, b) => {
        const ea = get(a.slug).reactions + get(a.slug).comments;
        const eb = get(b.slug).reactions + get(b.slug).comments;
        return eb - ea;
      });
    default:
      return copy;
  }
}

export async function fetchBlogEngagementCounts(
  slugs: string[]
): Promise<Record<string, BlogEngagementCounts>> {
  const supabase = await createServerSupabaseClient();
  const empty: BlogEngagementCounts = { views: 0, reactions: 0, comments: 0 };
  const result = Object.fromEntries(slugs.map((s) => [s, { ...empty }]));
  if (slugs.length === 0 || !supabase) return result;

  const countRequests = slugs.flatMap((slug) => [
    supabase.from("blog_post_views").select("*", { count: "exact", head: true }).eq("slug", slug),
    supabase.from("blog_post_reactions").select("*", { count: "exact", head: true }).eq("slug", slug),
    supabase
      .from("blog_post_comments")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug)
      .eq("is_approved", true)
  ]);

  const settled = await Promise.all(countRequests);
  const perSlug = 3;
  slugs.forEach((slug, i) => {
    const base = i * perSlug;
    const viewsResult = settled[base];
    const reactionsResult = settled[base + 1];
    const commentsResult = settled[base + 2];

    result[slug] = {
      views: viewsResult.count ?? 0,
      reactions: reactionsResult.count ?? 0,
      comments: commentsResult.count ?? 0
    };
  });

  return result;
}

const BLOG_POST_REACTION_TYPES = ["like", "insightful", "love"] as const;

export type BlogPostReactionType = (typeof BLOG_POST_REACTION_TYPES)[number];

export type BlogPostReactionBreakdown = Record<BlogPostReactionType, { up: number; down: number }>;

function emptyBlogPostReactionBreakdown(): BlogPostReactionBreakdown {
  return {
    like: { up: 0, down: 0 },
    insightful: { up: 0, down: 0 },
    love: { up: 0, down: 0 }
  };
}

export async function fetchBlogPostReactionBreakdown(slug: string): Promise<BlogPostReactionBreakdown> {
  const supabase = await createServerSupabaseClient();
  const result = emptyBlogPostReactionBreakdown();
  if (!supabase) return result;

  const { data, error } = await supabase
    .from("blog_post_reactions")
    .select("reaction_type, response")
    .eq("slug", slug);

  if (error || !data) return result;

  for (const row of data) {
    const type = row.reaction_type as BlogPostReactionType;
    if (!BLOG_POST_REACTION_TYPES.includes(type)) continue;
    const response = row.response === "down" ? "down" : "up";
    result[type][response] += 1;
  }

  return result;
}

