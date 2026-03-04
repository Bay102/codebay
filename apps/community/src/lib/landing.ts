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
  | "tags"
> & {
  featured_on_community_landing: boolean;
};

type CommunityUserRow = Pick<
  Tables<"community_users">,
  "id" | "name" | "username" | "avatar_url" | "bio" | "featured_on_community_landing" | "tech_stack" | "featured_blog_post_slugs"
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
  techStack: string[];
  featuredArticles: LandingProfileArticle[];
};

export type LandingProfileArticle = {
  title: string;
  href: string;
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

  const now = Date.now();

  const scored = remaining
    .map((row) => {
      const counts = engagementMap[row.slug] ?? { views: 0, reactions: 0, comments: 0 };
      const rawScore = scoreEngagement(counts.views, counts.reactions, counts.comments);

      const publishedAtTime = row.published_at ? new Date(row.published_at).getTime() : null;
      const ageMs =
        publishedAtTime !== null && !Number.isNaN(publishedAtTime) ? Math.max(0, now - publishedAtTime) : 0;
      const ageDays = ageMs / (24 * 3600 * 1000);

      const decayExponent = 1.5;
      const denominator = Math.pow(1 + ageDays, decayExponent);
      const score = denominator > 0 ? rawScore / denominator : rawScore;

      return { row, score };
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
    .select("id,name,username,avatar_url,bio,featured_on_community_landing,tech_stack,featured_blog_post_slugs")
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
    .select("author_id,slug,title")
    .eq("status", "published");

  if (postsError || !posts) {
    const combined = [...adminFeatured, ...remaining].slice(0, limit);
    return combined.map(mapProfileRowToLandingProfile);
  }

  const slugsByAuthor = new Map<string, string[]>();
  const postsBySlug = new Map<string, { slug: string; title: string }>();

  (posts as Pick<Tables<"blog_posts">, "author_id" | "slug" | "title">[]).forEach((post) => {
    if (!post.author_id) return;
    const current = slugsByAuthor.get(post.author_id) ?? [];
    current.push(post.slug);
    slugsByAuthor.set(post.author_id, current);
    if (!postsBySlug.has(post.slug)) {
      postsBySlug.set(post.slug, { slug: post.slug, title: post.title });
    }
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

  function buildFeaturedArticlesForProfile(profile: CommunityUserRow): LandingProfileArticle[] {
    const slugs = profile.featured_blog_post_slugs ?? [];
    const articles: LandingProfileArticle[] = [];

    slugs.forEach((slug) => {
      const post = postsBySlug.get(slug);
      if (!post) return;
      articles.push({
        title: post.title,
        href: buildPostUrl(profile.name, slug)
      });
    });

    return articles.slice(0, 4);
  }

  const combinedProfiles = [...adminFeatured, ...scoredRemaining.map((item) => item.profile)].slice(0, limit);
  return combinedProfiles.map((profile) => mapProfileRowToLandingProfile(profile, buildFeaturedArticlesForProfile(profile)));
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

/**
 * Returns published blog posts that match any of the user's preferred tags.
 * Use for "For you" section when user is logged in.
 */
export async function fetchForYouBlogPosts(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 6
): Promise<LandingFeaturedPost[]> {
  const { data: preferredRows } = await supabase
    .from("user_preferred_tags")
    .select("tag_id")
    .eq("user_id", userId);
  const tagIds = (preferredRows ?? []).map((r) => r.tag_id);
  if (tagIds.length === 0) return [];

  const { data: tagRows } = await supabase.from("tags").select("name").in("id", tagIds);
  const tagNames = (tagRows ?? []).map((r) => r.name);
  if (tagNames.length === 0) return [];

  const { data: rows, error } = await supabase
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,author_id,author_name,published_at,is_featured,featured_on_community_landing,tags"
    )
    .eq("status", "published")
    .overlaps("tags", tagNames)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !rows) return [];
  const blogRows = rows as BlogPostRow[];
  const slugs = blogRows.map((r) => r.slug);
  const engagementMap = await fetchEngagementCountsForSlugs(supabase, slugs);
  return blogRows.map((row) => mapPostRowToLandingPost(row, engagementMap[row.slug]));
}

export type ForYouDiscussion = {
  id: string;
  slug: string;
  title: string;
  body: string;
  authorName: string;
  authorUsername: string;
  createdAt: string;
  tags: string[];
  commentCount: number;
  reactionCount: number;
};

/**
 * Returns discussions that match any of the user's preferred tags.
 */
export async function fetchForYouDiscussions(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 4
): Promise<ForYouDiscussion[]> {
  const { data: preferredRows } = await supabase
    .from("user_preferred_tags")
    .select("tag_id")
    .eq("user_id", userId);
  const tagIds = (preferredRows ?? []).map((r) => r.tag_id);
  if (tagIds.length === 0) return [];

  const { data: tagRows } = await supabase.from("tags").select("name").in("id", tagIds);
  const tagNames = (tagRows ?? []).map((r) => r.name);
  if (tagNames.length === 0) return [];

  const { data: rows, error } = await supabase
    .from("discussions")
    .select(
      "id,slug,title,body,author_id,created_at,updated_at,tags,community_users!discussions_author_id_fkey(name,username)"
    )
    .overlaps("tags", tagNames)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !rows || rows.length === 0) return [];

  const ids = (rows as { id: string }[]).map((r) => r.id);
  const [commentRes, reactionRes] = await Promise.all([
    supabase.from("discussion_comments").select("discussion_id").in("discussion_id", ids),
    supabase.from("discussion_reactions").select("discussion_id").in("discussion_id", ids)
  ]);
  const commentByDiscussion = new Map<string, number>();
  (commentRes.data ?? []).forEach((r: { discussion_id: string }) => {
    commentByDiscussion.set(r.discussion_id, (commentByDiscussion.get(r.discussion_id) ?? 0) + 1);
  });
  const reactionByDiscussion = new Map<string, number>();
  (reactionRes.data ?? []).forEach((r: { discussion_id: string }) => {
    reactionByDiscussion.set(r.discussion_id, (reactionByDiscussion.get(r.discussion_id) ?? 0) + 1);
  });

  return (rows as { id: string; slug: string; title: string; body: string; created_at: string; tags: string[]; community_users: { name: string; username: string } | null }[]).map(
    (r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      body: r.body ?? "",
      authorName: r.community_users?.name ?? "Unknown",
      authorUsername: r.community_users?.username ?? "unknown",
      createdAt: r.created_at,
      tags: r.tags ?? [],
      commentCount: commentByDiscussion.get(r.id) ?? 0,
      reactionCount: reactionByDiscussion.get(r.id) ?? 0
    })
  );
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

function mapProfileRowToLandingProfile(
  row: CommunityUserRow,
  featuredArticlesOrIndex?: LandingProfileArticle[] | number
): LandingProfile {
  const techStack = (row.tech_stack ?? []).map((item) => item.trim()).filter((item) => item.length > 0);
  const featuredArticles = Array.isArray(featuredArticlesOrIndex) ? featuredArticlesOrIndex : [];
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    techStack,
    featuredArticles
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

