import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/database";

type CommunityUserRow = Tables<"community_users">;

type BlogPostListRow = Pick<
  Tables<"blog_posts">,
  "id" | "slug" | "title" | "author_name" | "status" | "created_at" | "updated_at" | "published_at"
>;

type ActivityCommentRow = Pick<Tables<"blog_post_comments">, "id" | "slug" | "author_id" | "author_name" | "body" | "created_at">;

type ActivityMessageRow = Pick<Tables<"chat_handoffs">, "id" | "name" | "created_at" | "notes">;

export interface FeaturedProject {
  title: string;
  description: string;
  url: string | null;
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
}

export interface DashboardBlogPostStats {
  id: string;
  slug: string;
  title: string;
  authorName: string;
  status: "draft" | "published" | string;
  createdAt: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  views: number;
  reactions: number;
  comments: number;
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

export type ActivityKind = "reply" | "comment" | "direct_message";

export interface DashboardActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  createdAt: string;
  href: string;
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

function isMissingColumnError(error: { message?: string } | null): boolean {
  if (!error?.message) return false;
  return error.message.includes("column") && (error.message.includes("tech_stack") || error.message.includes("featured_projects"));
}

export async function fetchDashboardProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardProfile | null> {
  const enhancedSelection = "id,name,username,email,bio,avatar_url,tech_stack,featured_projects";
  const fallbackSelection = "id,name,username,email,bio,avatar_url";

  const enhancedResult = await supabase.from("community_users").select(enhancedSelection).eq("id", userId).maybeSingle();
  if (!enhancedResult.error && enhancedResult.data) {
    const profile = enhancedResult.data as CommunityUserRow & {
      tech_stack?: string[] | Json | null;
      featured_projects?: Json | null;
    };

    return {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      email: profile.email,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      techStack: parseTechStack(profile.tech_stack ?? []),
      featuredProjects: parseFeaturedProjects(profile.featured_projects ?? [])
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
    featuredProjects: []
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

export async function fetchUserBlogPostsWithStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardBlogPostStats[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug,title,author_name,status,created_at,updated_at,published_at")
    .eq("author_id", userId)
    .order("updated_at", { ascending: false, nullsFirst: false });

  if (error || !data) {
    return [];
  }

  const rows = data as BlogPostListRow[];
  const countsBySlug = await fetchEngagementCountsBySlug(
    supabase,
    rows.map((row) => row.slug)
  );

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    authorName: row.author_name ?? "CodeBay Team",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    views: countsBySlug[row.slug]?.views ?? 0,
    reactions: countsBySlug[row.slug]?.reactions ?? 0,
    comments: countsBySlug[row.slug]?.comments ?? 0
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
    postMapBySlug: Record<string, { id: string; title: string }>;
    limit?: number;
  }
): Promise<DashboardActivityItem[]> {
  const resolvedLimit = limit ?? 8;
  const postSlugs = Object.keys(postMapBySlug);
  const items: DashboardActivityItem[] = [];

  if (postSlugs.length > 0) {
    const incomingCommentsPromise = supabase
      .from("blog_post_comments")
      .select("id,slug,author_id,author_name,body,created_at")
      .in("slug", postSlugs)
      .order("created_at", { ascending: false })
      .limit(resolvedLimit * 2);

    const userRepliesPromise = supabase
      .from("blog_post_comments")
      .select("id,slug,author_id,author_name,body,created_at")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(resolvedLimit);

    const [incomingCommentsResult, userRepliesResult] = await Promise.all([incomingCommentsPromise, userRepliesPromise]);

    const incomingComments = (incomingCommentsResult.data ?? []) as ActivityCommentRow[];
    const userReplies = (userRepliesResult.data ?? []) as ActivityCommentRow[];

    incomingComments
      .filter((comment) => comment.author_id !== userId)
      .slice(0, resolvedLimit)
      .forEach((comment) => {
        const post = postMapBySlug[comment.slug];
        if (!post) return;

        items.push({
          id: `incoming-comment-${comment.id}`,
          kind: "comment",
          title: "New comment on your post",
          description: `${comment.author_name ?? "A reader"} commented on "${post.title}"`,
          createdAt: comment.created_at,
          href: `/dashboard/blog/edit/${post.id}`
        });
      });

    userReplies.slice(0, resolvedLimit).forEach((comment) => {
      const post = postMapBySlug[comment.slug];
      if (!post) return;

      items.push({
        id: `reply-${comment.id}`,
        kind: "reply",
        title: "You replied in a blog thread",
        description: `Your recent reply on "${post.title}" is live`,
        createdAt: comment.created_at,
        href: `/dashboard/blog/edit/${post.id}`
      });
    });
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
        createdAt: message.created_at,
        href: "/dashboard"
      });
    });
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, resolvedLimit);
}
