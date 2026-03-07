import type { Metadata } from "next";
import Link from "next/link";
import { SurfaceCard, CtaCarousel, type CtaCarouselSlide } from "@codebay/ui";
import { InViewSection } from "@/components/InViewSection";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { blogUrl } from "@/lib/site-urls";
import { TrendingProfilesSection } from "@/components/pages/community/TrendingProfilesSection";
import { TrendingTopicsSection } from "@/components/pages/community/TrendingTopicsSection";
import { FeaturedBlogPostsSection } from "@/components/pages/community/FeaturedBlogPostsSection";
import { TrendingDiscussionsSection } from "@/components/pages/community/TrendingDiscussionsSection";
import { ForYouSection } from "@/components/pages/community/ForYouSection";

export const metadata: Metadata = {
  title: "Community | CodingBay – Where Tech Enthusiasts Connect",
  description:
    "Join the CodingBay Community – a place for tech enthusiasts to share blog posts, join discussions, and connect with fellow developers building in the open."
};

const whyJoinSlides: CtaCarouselSlide[] = [
  {
    title: "Real-world engineering discussions",
    body: "See how other teams ship AI features, debug production issues, and reason about architecture trade-offs."
  },
  {
    title: "Connect with like-minded tech professionals",
    body: "Join discussions, share your knowledge, and learn from others in the community."
  },
  {
    title: "Follow updates from your favorite topics",
    body: "Get notified when new blog posts and discussions are published on your preferred topics."
  },
  {
    title: "Engage with the community",
    body: "Comment on blog posts, react to discussions, and get feedback from other members."
  }
];

export default async function CommunityLandingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase?.auth.getUser() ?? { data: { user: null } };
  const hasSession = !!user;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-7xl px-2 py-4 md:pb-10 lg:px-8">
        <InViewSection>
          <SurfaceCard
            as="div"
            variant="hero"
            className="shadow-xl border-border/40 bg-card/70"
          >
            <p className="text-sm font-medium uppercase tracking-wide text-primary">Stay Relevant</p>
            <h1 className="font-hero mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
              The Coding-Bay
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              Follow your favorite topics, join discussions, and connect with other tech enthusiasts.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {!hasSession && (
                <Link
                  href="/join"
                  className="inline-flex rounded-md border border-primary/35 bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  Join the community
                </Link>
              )}
              {!hasSession && (
                <Link
                  href="/join?mode=signin"
                  className="inline-flex rounded-md border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                >
                  Sign in
                </Link>
              )}
              {hasSession && (
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-md border border-primary/35 bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href={hasSession ? "/dashboard/discussions/new" : "/join?redirect=/dashboard/discussions/new"}
                className="inline-flex rounded-md border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
              >
                Start a discussion
              </Link>
              <Link
                href={blogUrl}
                className="inline-flex rounded-md border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
              >
                Browse blog posts
              </Link>
            </div>
          </SurfaceCard>

          {!hasSession && (
            <CtaCarousel
              eyebrow="Community Highlights"
              heading=""
              slides={whyJoinSlides}
              className="mt-4 hover:shadow-lg hover:border-border/40 hover:bg-card/70"
            />
          )}
        </InViewSection>

        <TrendingTopicsSection />
        <ForYouSection userId={user?.id ?? null} />
        <TrendingProfilesSection />
        <TrendingDiscussionsSection />
        <FeaturedBlogPostsSection />
      </section>
    </main>
  );
}
