import { AnimatedCardSection, BlogPostCard, DiscussionCard } from "@codebay/ui";
import type { ExploreContentType } from "@/lib/explore";
import type { ScoreMode, ScorePeriod } from "@/lib/content-scoring";
import { buildContentScoreSummary } from "@/lib/content-scoring";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { fetchBlogEngagementCounts, getBlogPostsForCommunityList } from "@/lib/blog";
import { buildBlogPostPath } from "@/lib/blog-urls";
import { mapDiscussionListItemToDiscussionCardData, mapLandingFeaturedPostToBlogPostCardData } from "@/lib/ui-mappers";
import { ContentScoreMarker } from "@/components/shared/ContentScoreMarker";
import { ScoreModeInfoButton } from "@/components/pages/community/ContentScoreSwitcher";

type ScoredContentSectionProps = {
  contentType: ExploreContentType;
  scoreMode: ScoreMode;
  scorePeriod: ScorePeriod;
  limit?: number;
  title: string;
  description?: string;
  controlsSlot?: import("react").ReactNode;
  /**
   * `"headerEnd"` places score controls in the section header (replacing the in-header view-all link)
   * and moves view-all below the cards. Default keeps controls under the subtitle (landing layout).
   */
  controlsSlotPosition?: "headerSlot" | "headerEnd";
  viewAllHref: string;
  viewAllLabel: string;
};

export async function ScoredContentSection({
  contentType,
  scoreMode,
  scorePeriod,
  limit = 6,
  title,
  description,
  controlsSlot,
  controlsSlotPosition = "headerSlot",
  viewAllHref,
  viewAllLabel
}: ScoredContentSectionProps) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  if (contentType === "discussions") {
    const discussions = await getDiscussionsWithCounts(supabase, {
      limit,
      orderByTrend: false,
      scoreMode,
      scorePeriod
    });
    if (discussions.length === 0) return null;

    const useHeaderEndControls = controlsSlotPosition === "headerEnd" && Boolean(controlsSlot);

    return (
      <AnimatedCardSection
        as="section"
        title={title}
        subtitle={description}
        headerSlot={useHeaderEndControls ? undefined : controlsSlot}
        headerEndSlot={useHeaderEndControls ? controlsSlot : undefined}
        viewAllPlacement={useHeaderEndControls ? "footer" : "header"}
        titleRightSlot={<ScoreModeInfoButton />}
        stackHeaderOnMobile
        columns={{ base: 1, sm: 2 }}
        viewAllHref={viewAllHref}
        viewAllLabel={viewAllLabel}
      >
        {discussions.map((item) => {
          const discussion = mapDiscussionListItemToDiscussionCardData(item);
          const scoreSummary =
            item.scoreSummary ??
            buildContentScoreSummary({
              mode: scoreMode,
              period: scorePeriod,
              metrics: { views: 0, reactions: 0, comments: 0 },
              publishedAt: item.createdAt
            });
          return (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              href={`/discussions/${discussion.slug}`}
              headerSlot={<ContentScoreMarker summary={scoreSummary} />}
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

  const posts = await getBlogPostsForCommunityList(supabase, {
    limit,
    scoreMode,
    scorePeriod
  });
  if (posts.length === 0) return null;

  const engagementTotalsBySlug =
    posts.length > 0 ? await fetchBlogEngagementCounts(posts.map((p) => p.slug)) : {};

  const useHeaderEndControls = controlsSlotPosition === "headerEnd" && Boolean(controlsSlot);

  return (
    <AnimatedCardSection
      as="section"
      title={title}
      subtitle={description}
      headerSlot={useHeaderEndControls ? undefined : controlsSlot}
      headerEndSlot={useHeaderEndControls ? controlsSlot : undefined}
      viewAllPlacement={useHeaderEndControls ? "footer" : "header"}
      titleRightSlot={<ScoreModeInfoButton />}
      stackHeaderOnMobile
      columns={{ base: 1, md: 2 }}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    >
      {posts.map((post) => {
        const displayCounts =
          engagementTotalsBySlug[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
        const scoreSummary =
          post.scoreSummary ??
          buildContentScoreSummary({
            mode: scoreMode,
            period: scorePeriod,
            metrics: { views: 0, reactions: 0, comments: 0 },
            publishedAt: post.publishedAt
          });
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
          views: displayCounts.views,
          reactions: displayCounts.reactions,
          comments: displayCounts.comments
        });
        return (
          <BlogPostCard
            key={post.id}
            post={cardData}
            href={buildBlogPostPath(post.authorName, post.slug)}
            headerSlot={<ContentScoreMarker summary={scoreSummary} />}
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
