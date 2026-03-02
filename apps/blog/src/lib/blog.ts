import { getBlogSupabaseClient } from "@/lib/supabase";
import type { Json, Tables } from "@/lib/database";

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

export interface BlogAuthorProfile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  techStack: string[];
  featuredProjects: BlogFeaturedProject[];
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
  const supabase = getBlogSupabaseClient();
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
  const supabase = getBlogSupabaseClient();
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

function isMissingProfileColumnError(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  return error.message.includes("column") && (error.message.includes("tech_stack") || error.message.includes("featured_projects"));
}

function mapAuthorProfileRow(
  row: Pick<Tables<"community_users">, "id" | "name" | "username" | "bio" | "avatar_url"> & {
    tech_stack?: string[] | Json | null;
    featured_projects?: Json | null;
  }
): BlogAuthorProfile {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    techStack: parseTechStack(row.tech_stack ?? []),
    featuredProjects: parseFeaturedProjects(row.featured_projects ?? [])
  };
}

async function fetchAuthorProfileBy(
  key: "id" | "username",
  value: string
): Promise<BlogAuthorProfile | null> {
  const supabase = getBlogSupabaseClient();
  if (!supabase) return null;

  const enhancedSelection = "id,name,username,bio,avatar_url,tech_stack,featured_projects";
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

export async function fetchPublishedBlogPostsByAuthorId(authorId: string): Promise<BlogPost[]> {
  const supabase = getBlogSupabaseClient();
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

export interface BlogEngagementCounts {
  views: number;
  reactions: number;
  comments: number;
}

export async function fetchBlogEngagementCounts(
  slugs: string[]
): Promise<Record<string, BlogEngagementCounts>> {
  const supabase = getBlogSupabaseClient();
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
