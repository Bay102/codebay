import type { BlogPostCardData, ProfileCardData } from "@codebay/ui";
import type { BlogPost, BlogAuthorProfile } from "@/lib/blog";
import type { BlogEngagementCounts } from "@/lib/blog";

export function mapBlogPostToBlogPostCardData(
  post: BlogPost,
  engagement: BlogEngagementCounts,
): BlogPostCardData {
  return {
    id: post.slug,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.authorName,
    authorUsername: undefined,
    authorAvatarUrl: null,
    tags: post.tags,
    views: engagement.views,
    reactions: engagement.reactions,
    comments: engagement.comments,
    readTimeMinutes: post.readTimeMinutes,
    isFeatured: post.isFeatured,
  };
}

export function mapBlogAuthorProfileToProfileCardData(profile: BlogAuthorProfile): ProfileCardData {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    techStack: profile.techStack,
    followerCount: undefined,
    followingCount: undefined,
    featuredArticles: [],
  };
}

