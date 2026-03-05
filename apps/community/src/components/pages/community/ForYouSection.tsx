import Link from "next/link";
import { AnimatedCardSection, BlogPostCard, DiscussionCard, SurfaceCard } from "@codebay/ui";
import { buildPostUrl, fetchForYouBlogPosts, fetchForYouDiscussions } from "@/lib/landing";
import { fetchAllTags } from "@/lib/tags";
import { getPreferredTagIdsAction } from "@/app/actions";
import { PreferredTopicsDialog } from "@/components/pages/community/PreferredTopicsDialog";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InViewSection } from "@/components/InViewSection";
import { mapForYouDiscussionToDiscussionCardData, mapLandingFeaturedPostToBlogPostCardData } from "@/lib/ui-mappers";

type ForYouSectionProps = {
  userId: string | null;
};

export async function ForYouSection({ userId }: ForYouSectionProps) {
  if (!userId) {
    return (
      <InViewSection as="section" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <SurfaceCard
          as="div"
          variant="card"
          className="mt-3 hover:shadow-lg hover:border-border/40 hover:bg-card/80"
        >
          <p className="text-sm text-muted-foreground">
            <Link href="/join" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            and set your preferred topics in{" "}
            <Link href="/dashboard/profile" className="font-medium text-primary underline-offset-4 hover:underline">
              profile settings
            </Link>{" "}
            to see blog posts and discussions tailored to your interests.
          </p>
        </SurfaceCard>
      </InViewSection>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const [posts, discussions, allowedTags, preferredTagIds] = await Promise.all([
    fetchForYouBlogPosts(supabase, userId, 4),
    fetchForYouDiscussions(supabase, userId, 4),
    fetchAllTags(supabase),
    getPreferredTagIdsAction()
  ]);

  const hasContent = posts.length > 0 || discussions.length > 0;
  if (!hasContent) {
    return (
      <InViewSection as="section" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <SurfaceCard
          as="div"
          variant="card"
          className="mt-3 hover:shadow-lg hover:border-border/40 hover:bg-card/80"
        >
          <p className="text-sm text-muted-foreground">
            Choose topics you follow in{" "}
            <Link href="/dashboard/profile" className="font-medium text-primary underline-offset-4 hover:underline">
              profile settings
            </Link>{" "}
            to see relevant blog posts and discussions here.
          </p>
        </SurfaceCard>
      </InViewSection>
    );
  }

  return (
    <InViewSection as="section" className="mt-8">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <PreferredTopicsDialog allowedTags={allowedTags} initialPreferredTagIds={preferredTagIds} />
      </div>
      {/* <p className="mt-1 text-xs text-muted-foreground">Based on your preferred topics</p> */}
      {posts.length > 0 ? (
        <>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Blog posts</p>
          <div className="mt-1">
            <AnimatedCardSection as="div" columns={{ base: 1, md: 2 }}>
              {posts.map((post) => {
                const cardData = mapLandingFeaturedPostToBlogPostCardData(post);
                return (
                  <BlogPostCard
                    key={cardData.id}
                    post={cardData}
                    href={buildPostUrl(post.authorName, post.slug)}
                    showAuthor
                    showDate
                    showEngagement
                    showTags
                  />
                );
              })}
            </AnimatedCardSection>
          </div>
        </>
      ) : null}
      {discussions.length > 0 ? (
        <>
          <p className="mt-4 text-xs font-medium text-muted-foreground">Discussions</p>
          <div className="mt-1">
            <AnimatedCardSection as="div" columns={{ base: 1, sm: 2 }}>
              {discussions.map((item) => {
                const discussion = mapForYouDiscussionToDiscussionCardData(item);
                return (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    href={`/discussions/${discussion.slug}`}
                    showAuthor
                    showDate
                    showEngagement
                    showTags
                  />
                );
              })}
            </AnimatedCardSection>
          </div>
        </>
      ) : null}
    </InViewSection>
  );
}
