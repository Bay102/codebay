import { supabase } from "@/lib/supabase";

export interface BlogPostSection {
  heading: string;
  paragraphs: string[];
}

interface BlogPostRow {
  slug: string;
  title: string;
  description: string | null;
  excerpt: string | null;
  published_at: string | null;
  updated_at: string | null;
  created_at: string | null;
  read_time_minutes: number | null;
  author_name: string | null;
  tags: string[] | null;
  sections: BlogPostSection[] | null;
  is_featured: boolean | null;
}

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
    sections: row.sections ?? [],
    isFeatured: row.is_featured ?? false
  };
}

export async function fetchPublishedBlogPosts(): Promise<BlogPost[]> {
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

