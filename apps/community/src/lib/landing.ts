import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/database";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { blogUrl } from "@/lib/site-urls";

type BlogPostRow = Pick<
  Tables<"blog_posts">,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "author_id"
  | "author_name"
  | "published_at"
  | "is_featured"
  | "featured_on_community_landing"
  | "tags"
>;

type CommunityUserRow = Pick<
  Tables<"community_users">,
  "id" | "name" | "username" | "avatar_url" | "bio" | "featured_on_community_landing"
>;

export type LandingFeaturedPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorId: string | null;
  publishedAt: string | null;
  tags: string[];
  views: number;
  reactions: number;
  comments: number;
};

export type LandingProfile = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
};

export type LandingTopic = {
  tag: string;
  postCount: number;
};

async function getSupabase(): Promise<SupabaseClient<Database> | null> {
  return createServerSupabaseClient();
}

function scoreEngagement(views: number, reactions: number, comments: number): number {
  return views + reactions * 2 + comments * 3;
}

export async function fetchFeaturedBlogPosts(limit = 4): Promise<LandingFeaturedPost[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,author_id,author_name,published_at,is_featured,featured_on_community_landing,tags"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(64);

  if (error || !data) {
    return [];
  }

  const rows = data as BlogPostRow[];
  const engagementMap = await fetchEngagementCountsForSlugs(
    supabase,
    rows.map((row) => row.slug)
  );
  const adminFeatured = rows.filter((row) => row.featured_on_community_landing);

  if (adminFeatured.length >= limit) {
    return adminFeatured.slice(0, limit).map((row) => mapPostRowToLandingPost(row, engagementMap[row.slug]));
  }

  const remaining = rows.filter((row) => !row.featured_on_community_landing);

  const scored = remaining
    .map((row) => {
      const counts = engagementMap[row.slug];
      return { row, score: scoreEngagement(counts.views, counts.reactions, counts.comments) };
    })
    .sort((a, b) => b.score - a.score);

  const combined = [...adminFeatured, ...scored.map((item) => item.row)].slice(0, limit);
  return combined.map((row) => mapPostRowToLandingPost(row, engagementMap[row.slug]));
}

export async function fetchTrendingProfiles(limit = 6): Promise<LandingProfile[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("community_users")
    .select("id,name,username,avatar_url,bio,featured_on_community_landing")
    .order("created_at", { ascending: false })
    .limit(128);

  if (error || !data) {
    return [];
  }

  const rows = data as CommunityUserRow[];
  const adminFeatured = rows.filter((row) => row.featured_on_community_landing);
  const remaining = rows.filter((row) => !row.featured_on_community_landing);

  const { data: posts, error: postsError } = await supabase
    .from("blog_posts")
    .select("author_id,slug")
    .eq("status", "published");

  if (postsError || !posts) {
    const combined = [...adminFeatured, ...remaining].slice(0, limit);
    return combined.map(mapProfileRowToLandingProfile);
  }

  const slugsByAuthor = new Map<string, string[]>();
  (posts as Pick<Tables<"blog_posts">, "author_id" | "slug">[]).forEach((post) => {
    if (!post.author_id) return;
    const current = slugsByAuthor.get(post.author_id) ?? [];
    current.push(post.slug);
    slugsByAuthor.set(post.author_id, current);
  });

  const allSlugs = Array.from(new Set(posts.map((p) => p.slug)));
  const engagementMap = await fetchEngagementCountsForSlugs(supabase, allSlugs);

  const scoredRemaining = remaining
    .map((profile) => {
      const slugs = slugsByAuthor.get(profile.id) ?? [];
      const aggregate = slugs.reduce(
        (acc, slug) => {
          const counts = engagementMap[slug] ?? { views: 0, reactions: 0, comments: 0 };
          acc.views += counts.views;
          acc.reactions += counts.reactions;
          acc.comments += counts.comments;
          return acc;
        },
        { views: 0, reactions: 0, comments: 0 }
      );
      const score = scoreEngagement(aggregate.views, aggregate.reactions, aggregate.comments);
      return { profile, score };
    })
    .sort((a, b) => b.score - a.score);

  const combinedProfiles = [...adminFeatured, ...scoredRemaining.map((item) => item.profile)].slice(0, limit);
  return combinedProfiles.map(mapProfileRowToLandingProfile);
}

export async function fetchTrendingTopics(limit = 10): Promise<LandingTopic[]> {
  const supabase = await getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug,tags")
    .eq("status", "published");

  if (error || !data) {
    return [];
  }

  const rows = data as Pick<Tables<"blog_posts">, "slug" | "tags">[];
  const allTags = new Map<string, { postCount: number; slugs: string[] }>();

  rows.forEach((row) => {
    const tags = row.tags ?? [];
    tags.forEach((tag) => {
      const normalized = tag.trim();
      if (!normalized) return;
      const entry = allTags.get(normalized) ?? { postCount: 0, slugs: [] };
      entry.postCount += 1;
      entry.slugs.push(row.slug);
      allTags.set(normalized, entry);
    });
  });

  const engagementMap = await fetchEngagementCountsForSlugs(
    supabase,
    Array.from(new Set(rows.map((row) => row.slug)))
  );

  const scored = Array.from(allTags.entries()).map(([tag, info]) => {
    const aggregate = info.slugs.reduce(
      (acc, slug) => {
        const counts = engagementMap[slug] ?? { views: 0, reactions: 0, comments: 0 };
        acc.views += counts.views;
        acc.reactions += counts.reactions;
        acc.comments += counts.comments;
        return acc;
      },
      { views: 0, reactions: 0, comments: 0 }
    );
    const score = scoreEngagement(aggregate.views, aggregate.reactions, aggregate.comments) + info.postCount;
    return { tag, postCount: info.postCount, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ tag, postCount }) => ({ tag, postCount }));
}

async function fetchEngagementCountsForSlugs(
  supabase: SupabaseClient<Database>,
  slugs: string[]
): Promise<Record<string, { views: number; reactions: number; comments: number }>> {
  const result: Record<string, { views: number; reactions: number; comments: number }> = {};
  if (slugs.length === 0) return result;

  const viewPromise = supabase
    .from("blog_post_views")
    .select("slug", { count: "exact", head: false })
    .in("slug", slugs);
  const reactionsPromise = supabase
    .from("blog_post_reactions")
    .select("slug", { count: "exact", head: false })
    .in("slug", slugs);
  const commentsPromise = supabase
    .from("blog_post_comments")
    .select("slug", { count: "exact", head: false })
    .in("slug", slugs)
    .eq("is_approved", true);

  const [viewsResult, reactionsResult, commentsResult] = await Promise.all([
    viewPromise,
    reactionsPromise,
    commentsPromise
  ]);

  slugs.forEach((slug) => {
    result[slug] = { views: 0, reactions: 0, comments: 0 };
  });

  if (!viewsResult.error && viewsResult.data) {
    viewsResult.data.forEach((row: { slug: string }) => {
      if (result[row.slug]) {
        result[row.slug].views += 1;
      }
    });
  }

  if (!reactionsResult.error && reactionsResult.data) {
    reactionsResult.data.forEach((row: { slug: string }) => {
      if (result[row.slug]) {
        result[row.slug].reactions += 1;
      }
    });
  }

  if (!commentsResult.error && commentsResult.data) {
    commentsResult.data.forEach((row: { slug: string }) => {
      if (result[row.slug]) {
        result[row.slug].comments += 1;
      }
    });
  }

  return result;
}

function mapPostRowToLandingPost(
  row: BlogPostRow,
  counts: { views: number; reactions: number; comments: number } | undefined
): LandingFeaturedPost {
  const safeCounts = counts ?? { views: 0, reactions: 0, comments: 0 };
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    authorName: row.author_name ?? "CodeBay",
    authorId: row.author_id,
    publishedAt: row.published_at,
    tags: row.tags ?? [],
    views: safeCounts.views,
    reactions: safeCounts.reactions,
    comments: safeCounts.comments
  };
}

function mapProfileRowToLandingProfile(row: CommunityUserRow): LandingProfile {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    avatarUrl: row.avatar_url,
    bio: row.bio
  };
}

export function buildPostUrl(authorName: string, slug: string): string {
  const base = authorName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "author";
  return `${blogUrl}/${base}/${slug}`;
}

