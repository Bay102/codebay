import type { BlogPostCardData, DiscussionCardData, ProfileCardData } from "@codebay/ui";
import type { LandingFeaturedPost, LandingProfile, ForYouDiscussion } from "@/lib/landing";
import type { DashboardBlogPostStats, DashboardProfile } from "@/lib/dashboard";
import type { DiscussionListItem } from "@/lib/discussions";

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
    body: discussion.body,
    createdAt: discussion.createdAt,
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
    body: item.body,
    createdAt: item.createdAt,
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

