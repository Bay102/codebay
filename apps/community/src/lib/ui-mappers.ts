import type { BlogPostCardData, DiscussionCardData, ProfileCardData } from "@codebay/ui";
import type { LandingFeaturedPost, LandingProfile, ForYouDiscussion } from "@/lib/landing";
import type { DashboardBlogPostStats, DashboardProfile } from "@/lib/dashboard";
import type { DiscussionListItem } from "@/lib/discussions";

function buildDiscussionPreviewBody(rawBody: string, maxLength = 220): string {
  const normalized = (rawBody ?? "").trim();
  if (!normalized) return "";

  // If there's HTML, strip code blocks first so they don't dominate the preview.
  let working = normalized;
  const hasHtml = /<[^>]+>/.test(working);
  const hasCode = /```|<pre[\s\S]*?>|<code[\s\S]*?>/i.test(working);

  if (hasHtml) {
    // Replace code regions with a lightweight marker.
    working = working.replace(/<pre[\s\S]*?<\/pre>/gi, " [code snippet] ");
    working = working.replace(/<code[\s\S]*?<\/code>/gi, " [code] ");
    // Strip remaining tags.
    working = working.replace(/<[^>]+>/g, " ");
  }

  // Handle fenced code (from legacy markdown-style content).
  working = working.replace(/```[\s\S]*?```/g, " [code snippet] ");

  // Collapse whitespace.
  working = working.replace(/\s+/g, " ").trim();

  if (!working) {
    return hasCode ? "Code snippet" : "";
  }

  if (working.length <= maxLength) {
    return working;
  }

  const truncated = working.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const safe = lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated;
  return `${safe}…`;
}

export function mapLandingFeaturedPostToBlogPostCardData(post: LandingFeaturedPost): BlogPostCardData {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    description: undefined,
    publishedAt: post.publishedAt,
    updatedAt: post.publishedAt,
    authorName: post.authorName,
    authorUsername: undefined,
    authorAvatarUrl: post.authorAvatarUrl,
    tags: post.tags,
    views: post.views,
    reactions: post.reactions,
    comments: post.comments,
    readTimeMinutes: undefined,
    isFeatured: false,
  };
}

export function mapDashboardBlogPostToBlogPostCardData(post: DashboardBlogPostStats): BlogPostCardData {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: "",
    description: "",
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.authorName,
    authorUsername: undefined,
    authorAvatarUrl: null,
    tags: [],
    views: post.views,
    reactions: post.reactions,
    comments: post.comments,
    readTimeMinutes: undefined,
    isFeatured: false,
  };
}

export function mapForYouDiscussionToDiscussionCardData(discussion: ForYouDiscussion): DiscussionCardData {
  return {
    id: discussion.id,
    slug: discussion.slug,
    title: discussion.title,
    body: buildDiscussionPreviewBody(discussion.body),
    createdAt: discussion.createdAt,
    authorAvatarUrl: null,
    authorUsername: discussion.authorUsername,
    tags: discussion.tags,
    commentCount: discussion.commentCount,
    reactionCount: discussion.reactionCount,
  };
}

export function mapDiscussionListItemToDiscussionCardData(item: DiscussionListItem): DiscussionCardData {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    body: buildDiscussionPreviewBody(item.body),
    createdAt: item.createdAt,
    authorAvatarUrl: item.authorAvatarUrl,
    authorUsername: item.authorUsername,
    tags: item.tags,
    commentCount: item.commentCount,
    reactionCount: item.reactionCount,
  };
}

export function mapLandingProfileToProfileCardData(
  profile: LandingProfile,
  followerCount?: number,
  followingCount?: number,
): ProfileCardData {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    techStack: profile.techStack,
    followerCount,
    followingCount,
    featuredArticles: profile.featuredArticles,
  };
}

export function mapDashboardProfileToProfileCardData(profile: DashboardProfile): ProfileCardData {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    techStack: profile.techStack,
    followerCount: profile.followerCount,
    followingCount: profile.followingCount,
    featuredArticles: [],
  };
}

