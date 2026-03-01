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
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  authorName: string;
  tags: string[];
  sections: BlogPostSection[];
  isFeatured: boolean;
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
      "slug,title,description,excerpt,published_at,updated_at,created_at,read_time_minutes,author_name,tags,sections,is_featured"
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
      "slug,title,description,excerpt,published_at,updated_at,created_at,read_time_minutes,author_name,tags,sections,is_featured"
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
