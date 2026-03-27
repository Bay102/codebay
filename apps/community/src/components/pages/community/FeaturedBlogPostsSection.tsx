import { BlogPostCard, AnimatedCardSection } from "@codebay/ui";
import { fetchFeaturedBlogPosts } from "@/lib/landing";
import { buildPostUrl } from "@/lib/blog-urls";
import { mapLandingFeaturedPostToBlogPostCardData } from "@/lib/ui-mappers";
import { ContentScoreMarker } from "@/components/shared/ContentScoreMarker";

export async function FeaturedBlogPostsSection() {
  const posts = await fetchFeaturedBlogPosts(4);

  if (posts.length === 0) {
    return null;
  }

  return (
    <AnimatedCardSection
      as="section"
      title="Featured blog posts"
      columns={{ base: 1, md: 2 }}
      className="mt-11"
      viewAllHref="/blogs"
      viewAllLabel="View all blog posts →"
    >
      {posts.map((post) => {
        const cardData = mapLandingFeaturedPostToBlogPostCardData(post);
        return (
          <BlogPostCard
            key={cardData.id}
            post={cardData}
            href={buildPostUrl(post.authorName, post.slug)}
            headerSlot={post.scoreSummary ? <ContentScoreMarker summary={post.scoreSummary} /> : undefined}
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
