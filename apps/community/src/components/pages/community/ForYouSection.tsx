import Link from "next/link";
import { SurfaceCard } from "@codebay/ui";
import { fetchForYouBlogPosts, fetchForYouDiscussions } from "@/lib/landing";
import { fetchAllTags } from "@/lib/tags";
import { getPreferredTagIdsAction } from "@/lib/actions";
import { PreferredTopicsDialog } from "@/components/pages/community/PreferredTopicsDialog";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InViewSection } from "@/components/shared/InViewSection";
import { ForYouSectionContent } from "./ForYouSectionContent";

type ForYouSectionProps = {
  userId: string | null;
};

export async function ForYouSection({ userId }: ForYouSectionProps) {
  const MAX_DISCUSSION_PAGES = 3;
  const DISCUSSIONS_PER_PAGE = 4;
  const MAX_POST_PAGES = 3;
  const POSTS_PER_PAGE = 2;

  if (!userId) {
    return (
      <InViewSection as="section" className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <SurfaceCard
          as="div"
          variant="borderless"
          className="mt-3 hover:shadow-lg hover:border-border/40 hover:bg-card/80"
        >
          <p className="text-sm text-muted-foreground">
            <Link href="/join?mode=signin" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/join" className="font-medium text-primary underline-offset-4 hover:underline">
              create an account
            </Link>{" "}
            and set your preferred topics in{" "}
            <Link href="/settings" className="font-medium text-primary underline-offset-4 hover:underline">
              settings
            </Link>{" "}
            to see blog posts and discussions tailored to your interests.
          </p>
        </SurfaceCard>
      </InViewSection>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const totalDiscussionLimit = MAX_DISCUSSION_PAGES * DISCUSSIONS_PER_PAGE;
  const totalPostLimit = MAX_POST_PAGES * POSTS_PER_PAGE;

  const [posts, discussions, allowedTags, preferredTagIds] = await Promise.all([
    fetchForYouBlogPosts(supabase, userId, totalPostLimit),
    fetchForYouDiscussions(supabase, userId, totalDiscussionLimit),
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
          variant="borderless"
          className="mt-3 hover:shadow-lg hover:border-border/40 hover:bg-card/80"
        >
          <p className="text-sm text-muted-foreground">
            Choose your preferred topics to follow{" "}
            <Link href="/settings" className="font-medium text-primary underline-offset-4 hover:underline">
              here
            </Link>{" "}
            to see relevant blog posts and discussions here.
          </p>
        </SurfaceCard>
      </InViewSection>
    );
  }

  return (
    <InViewSection as="section" className="mt-10">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tailored for you</h2>
        <PreferredTopicsDialog allowedTags={allowedTags} initialPreferredTagIds={preferredTagIds} />
      </div>
      <ForYouSectionContent discussions={discussions} posts={posts} />
    </InViewSection>
  );
}
