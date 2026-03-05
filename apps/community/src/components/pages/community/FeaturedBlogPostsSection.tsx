import { BlogPostCard, AnimatedCardSection } from "@codebay/ui";
import { buildPostUrl, fetchFeaturedBlogPosts } from "@/lib/landing";
import { mapLandingFeaturedPostToBlogPostCardData } from "@/lib/ui-mappers";

export async function FeaturedBlogPostsSection() {
  const posts = await fetchFeaturedBlogPosts(4);

  if (posts.length === 0) {
    return null;
  }

  return (
    <AnimatedCardSection as="section" title="Featured blog posts" columns={{ base: 1, md: 2 }} className="mt-10">
      {posts.map((post) => {
        const cardData = mapLandingFeaturedPostToBlogPostCardData(post);
        return (
          <BlogPostCard
            key={cardData.id}
            post={cardData}
            href={buildPostUrl(post.authorName, post.slug)}
            showAuthor
            showAuthorAvatar
            showDate
            showEngagement
            showTags
          />
        );
      })}
    </AnimatedCardSection>
  );
}
