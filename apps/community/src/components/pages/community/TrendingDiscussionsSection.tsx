import { AnimatedCardSection, DiscussionCard } from "@codebay/ui";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { mapDiscussionListItemToDiscussionCardData } from "@/lib/ui-mappers";

export async function TrendingDiscussionsSection() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const discussions = await getDiscussionsWithCounts(supabase, {
    limit: 4,
    offset: 0,
    orderByTrend: true
  });

  if (discussions.length === 0) return null;

  return (
    <AnimatedCardSection
      as="section"
      title="Trending discussions"
      columns={{ base: 1, sm: 2 }}
      viewAllHref="/discussions"
      viewAllLabel="View all discussions →"
    >
      {discussions.map((item) => {
        const discussion = mapDiscussionListItemToDiscussionCardData(item);
        return (
          <DiscussionCard
            key={discussion.id}
            discussion={discussion}
            href={`/discussions/${discussion.slug}`}
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
