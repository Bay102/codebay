import { BlogPostCard, DiscussionCard } from "@codebay/ui";
import { fetchBlogEngagementCounts, getBlogPostsForCommunityList, type BlogPostListItem } from "@/lib/blog";
import { getDiscussionsWithCounts, type DiscussionListItem } from "@/lib/discussions";
import { buildBlogPostPath } from "@/lib/blog-urls";
import {
  mapDiscussionListItemToDiscussionCardData,
  mapLandingFeaturedPostToBlogPostCardData
} from "@/lib/ui-mappers";
import type { ExploreContentType } from "@/lib/explore";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ExploreContentSection } from "./ExploreContentSection";

type ExploreFilteredFeedProps = {
  contentType: ExploreContentType;
  discussions: DiscussionListItem[];
  posts: BlogPostListItem[];
  engagementBySlug: Record<string, { views: number; reactions: number; comments: number }>;
};

export function ExploreFilteredFeed({
  contentType,
  discussions,
  posts,
  engagementBySlug
}: ExploreFilteredFeedProps) {
  if (contentType === "discussions") {
    return (
      <ExploreContentSection
        title="Results"
        description="Threads that match your filters."
        emptyMessage="Nothing matched. Try clearing a filter or different search terms."
        isEmpty={discussions.length === 0}
      >
        {discussions.map((item) => {
          const discussion = mapDiscussionListItemToDiscussionCardData(item);
          return (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              showAuthorAvatar
              href={`/discussions/${discussion.slug}`}
              showAuthor
              showDate
              showEngagement
              showTags
              variant="compact"
            />
          );
        })}
      </ExploreContentSection>
    );
  }

  return (
    <ExploreContentSection
      title="Results"
      description="Posts that match your filters."
      emptyMessage="Nothing matched. Try clearing a filter or different search terms."
      isEmpty={posts.length === 0}
    >
      {posts.map((post) => {
        const counts = engagementBySlug[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
        const cardData = mapLandingFeaturedPostToBlogPostCardData({
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          authorName: post.authorName,
          authorId: post.authorId,
          authorAvatarUrl: post.authorAvatarUrl,
          publishedAt: post.publishedAt,
          tags: post.tags,
          views: counts.views,
          reactions: counts.reactions,
          comments: counts.comments
        });
        return (
          <BlogPostCard
            key={post.id}
            post={cardData}
            href={buildBlogPostPath(post.authorName, post.slug)}
            showAuthorAvatar
            showAuthor
            showDate
            showEngagement
            showTags
            variant="compact"
          />
        );
      })}
    </ExploreContentSection>
  );
}

type ExplorePersonalizedFeedProps = {
  contentType: ExploreContentType;
  followingIds: string[];
  preferredTagNames: string[];
};

export async function ExplorePersonalizedFeed({
  contentType,
  followingIds,
  preferredTagNames
}: ExplorePersonalizedFeedProps) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">Unable to load personalized explore content.</p>
    );
  }

  if (contentType === "discussions") {
    const fromFollowing =
      followingIds.length > 0
        ? await getDiscussionsWithCounts(supabase, {
            authorIds: followingIds,
            limit: 14,
            orderByTrend: true
          })
        : [];

    const seen = new Set(fromFollowing.map((d) => d.id));
    const topicPool =
      preferredTagNames.length > 0
        ? await getDiscussionsWithCounts(supabase, {
            anyOfTagNames: preferredTagNames,
            limit: 40,
            orderByTrend: true
          })
        : [];
    const fromTopics = topicPool.filter((d) => !seen.has(d.id)).slice(0, 14);

    return (
      <>
        <ExploreContentSection
          title="From people you follow"
          description="Trending threads from creators in your network."
          emptyMessage={
            followingIds.length === 0
              ? "Follow profiles you care about to see their discussions here."
              : "No recent discussions from people you follow yet."
          }
          isEmpty={fromFollowing.length === 0}
        >
          {fromFollowing.map((item) => {
            const discussion = mapDiscussionListItemToDiscussionCardData(item);
            return (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                showAuthorAvatar
                href={`/discussions/${discussion.slug}`}
                showAuthor
                showDate
                showEngagement
                showTags
                variant="compact"
              />
            );
          })}
        </ExploreContentSection>

        <ExploreContentSection
          title="From topics you follow"
          description="Discussions tagged with interests you saved in settings."
          emptyMessage={
            preferredTagNames.length === 0
              ? "Add preferred topics in settings to surface related discussions."
              : "No discussions match your topics yet."
          }
          isEmpty={fromTopics.length === 0}
        >
          {fromTopics.map((item) => {
            const discussion = mapDiscussionListItemToDiscussionCardData(item);
            return (
              <DiscussionCard
                key={discussion.id}
                discussion={discussion}
                showAuthorAvatar
                href={`/discussions/${discussion.slug}`}
                showAuthor
                showDate
                showEngagement
                showTags
                variant="compact"
              />
            );
          })}
        </ExploreContentSection>
      </>
    );
  }

  const postsFromFollowing =
    followingIds.length > 0
      ? await getBlogPostsForCommunityList(supabase, {
          authorIds: followingIds,
          limit: 14
        })
      : [];

  const seenPosts = new Set(postsFromFollowing.map((p) => p.id));
  const topicPostPool =
    preferredTagNames.length > 0
      ? await getBlogPostsForCommunityList(supabase, {
          anyOfTagNames: preferredTagNames,
          limit: 40
        })
      : [];
  const postsFromTopics = topicPostPool.filter((p) => !seenPosts.has(p.id)).slice(0, 14);

  const allSlugs = [...postsFromFollowing, ...postsFromTopics].map((p) => p.slug);
  const engagementBySlug =
    allSlugs.length > 0 ? await fetchBlogEngagementCounts(allSlugs) : {};

  return (
    <>
      <ExploreContentSection
        title="From people you follow"
        description="Latest posts from creators in your network."
        emptyMessage={
          followingIds.length === 0
            ? "Follow writers you like to see their blog posts here."
            : "No published posts from people you follow yet."
        }
        isEmpty={postsFromFollowing.length === 0}
      >
        {postsFromFollowing.map((post) => {
          const counts = engagementBySlug[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
          const cardData = mapLandingFeaturedPostToBlogPostCardData({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            authorName: post.authorName,
            authorId: post.authorId,
            authorAvatarUrl: post.authorAvatarUrl,
            publishedAt: post.publishedAt,
            tags: post.tags,
            views: counts.views,
            reactions: counts.reactions,
            comments: counts.comments
          });
          return (
            <BlogPostCard
              key={post.id}
              post={cardData}
              href={buildBlogPostPath(post.authorName, post.slug)}
              showAuthorAvatar
              showAuthor
              showDate
              showEngagement
              showTags
              variant="compact"
            />
          );
        })}
      </ExploreContentSection>

      <ExploreContentSection
        title="From topics you follow"
        description="Posts tagged with interests you saved in settings."
        emptyMessage={
          preferredTagNames.length === 0
            ? "Add preferred topics in settings to surface related posts."
            : "No posts match your topics yet."
        }
        isEmpty={postsFromTopics.length === 0}
      >
        {postsFromTopics.map((post) => {
          const counts = engagementBySlug[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
          const cardData = mapLandingFeaturedPostToBlogPostCardData({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            authorName: post.authorName,
            authorId: post.authorId,
            authorAvatarUrl: post.authorAvatarUrl,
            publishedAt: post.publishedAt,
            tags: post.tags,
            views: counts.views,
            reactions: counts.reactions,
            comments: counts.comments
          });
          return (
            <BlogPostCard
              key={post.id}
              post={cardData}
              href={buildBlogPostPath(post.authorName, post.slug)}
              showAuthorAvatar
              showAuthor
              showDate
              showEngagement
              showTags
              variant="compact"
            />
          );
        })}
      </ExploreContentSection>
    </>
  );
}

type ExploreGuestFeedProps = {
  contentType: ExploreContentType;
};

export async function ExploreGuestFeed({ contentType }: ExploreGuestFeedProps) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">Unable to load explore content.</p>
    );
  }

  if (contentType === "discussions") {
    const items = await getDiscussionsWithCounts(supabase, {
      limit: 24,
      offset: 0,
      orderByTrend: true
    });

    return (
      <ExploreContentSection
        title="Trending across the community"
        description="Sign in to tailor Explore to people and topics you follow."
        emptyMessage="No discussions yet."
        isEmpty={items.length === 0}
      >
        {items.map((item) => {
          const discussion = mapDiscussionListItemToDiscussionCardData(item);
          return (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              showAuthorAvatar
              href={`/discussions/${discussion.slug}`}
              showAuthor
              showDate
              showEngagement
              showTags
              variant="compact"
            />
          );
        })}
      </ExploreContentSection>
    );
  }

  const posts = await getBlogPostsForCommunityList(supabase, { limit: 24 });
  const engagementBySlug =
    posts.length > 0 ? await fetchBlogEngagementCounts(posts.map((p) => p.slug)) : {};

  return (
    <ExploreContentSection
      title="Latest from the community"
      description="Sign in to tailor Explore to people and topics you follow."
      emptyMessage="No blog posts yet."
      isEmpty={posts.length === 0}
    >
      {posts.map((post) => {
        const counts = engagementBySlug[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
        const cardData = mapLandingFeaturedPostToBlogPostCardData({
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          authorName: post.authorName,
          authorId: post.authorId,
          authorAvatarUrl: post.authorAvatarUrl,
          publishedAt: post.publishedAt,
          tags: post.tags,
          views: counts.views,
          reactions: counts.reactions,
          comments: counts.comments
        });
        return (
          <BlogPostCard
            key={post.id}
            post={cardData}
            href={buildBlogPostPath(post.authorName, post.slug)}
            showAuthorAvatar
            showAuthor
            showDate
            showEngagement
            showTags
            variant="compact"
          />
        );
      })}
    </ExploreContentSection>
  );
}
