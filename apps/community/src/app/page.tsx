import type { Metadata } from "next";
import { CtaCarousel, type CtaCarouselSlide } from "@codebay/ui";
import { InViewSection } from "@/components/shared/InViewSection";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CommunityHeroSection } from "@/components/pages/community/CommunityHeroSection";
import { TrendingProfilesSection } from "@/components/pages/community/TrendingProfilesSection";
import { TrendingTopicsSection } from "@/components/pages/community/TrendingTopicsSection";
import { FeaturedBlogPostsSection } from "@/components/pages/community/FeaturedBlogPostsSection";
import { TrendingDiscussionsSection } from "@/components/pages/community/TrendingDiscussionsSection";
import { SectionSeparator } from "@/components/pages/community/SectionSeparator";
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
    <main className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-2 md:pb-10 lg:px-8">
        <InViewSection>
          <CommunityHeroSection hasSession={hasSession} />

          <TrendingTopicsSection />

          {!hasSession && (
            <CtaCarousel
              eyebrow="Community Highlights"
              heading=""
              slides={whyJoinSlides}
              className="mt-4 hover:shadow-lg hover:border-border/40 hover:bg-card/70"
            />
          )}
        </InViewSection>

        <ForYouSection userId={user?.id ?? null} />
        <SectionSeparator />
        <TrendingProfilesSection />
        <SectionSeparator />
        <TrendingDiscussionsSection />
        <SectionSeparator />
        <FeaturedBlogPostsSection />
      </section>
    </main>
  );
}
