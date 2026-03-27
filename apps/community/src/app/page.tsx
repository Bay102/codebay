import type { Metadata } from "next";
import { CtaCarousel, type CtaCarouselSlide } from "@codebay/ui";
import { InViewSection } from "@/components/shared/InViewSection";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseExploreTypeParam, parseScoreModeParam, parseScorePeriodParam } from "@/lib/explore";
import { DEFAULT_SCORE_MODE, DEFAULT_SCORE_PERIOD, getScoreModeLabel } from "@/lib/content-scoring";
import { CommunityHeroSection } from "@/components/pages/community/CommunityHeroSection";
import { ContentScoreSwitcher } from "@/components/pages/community/ContentScoreSwitcher";
import { ScoredContentSection } from "@/components/pages/community/ScoredContentSection";
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
    icon: "discussions",
    title: "Momentum & Impact ranking built in",
    body: "Switch views to spot what is rising now vs. proven over time.",
    preview: "score-markers"
  },
  {
    icon: "newsletter",
    title: "Newsletters built around your interests",
    body: "Create custom-tailored email digests so subscribers get the topics, authors, and cadence that fit how they follow you."
  },
  {
    icon: "discussions",
    title: "Real-world engineering discussions",
    body: "See how other teams ship AI features, debug production issues, and reason about architecture trade-offs."
  },
  {
    icon: "community",
    title: "Connect with like-minded tech professionals",
    body: "Join discussions, share your knowledge, and learn from others in the community."
  },
  {
    icon: "updates",
    title: "Follow updates from your favorite topics",
    body: "Get notified when new blog posts and discussions are published on your preferred topics."
  },
  {
    icon: "engage",
    title: "Engage with the community",
    body: "Comment on blog posts, react to discussions, and get feedback from other members."
  }
];

type CommunityLandingPageProps = {
  searchParams: Promise<{ score?: string; period?: string; type?: string }>;
};

export default async function CommunityLandingPage({ searchParams }: CommunityLandingPageProps) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user }
  } = await supabase?.auth.getUser() ?? { data: { user: null } };

  const hasSession = !!user;
  const scoreMode = parseScoreModeParam(resolvedSearchParams.score) ?? DEFAULT_SCORE_MODE;
  const scorePeriod = parseScorePeriodParam(resolvedSearchParams.period) ?? DEFAULT_SCORE_PERIOD;
  const scoreContentType = parseExploreTypeParam(resolvedSearchParams.type);
  const scoredSectionTitle = `${getScoreModeLabel(scoreMode)} ${scoreContentType === "blogs" ? "blog posts" : "discussions"}`;

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-2 md:pb-10 lg:px-8">
        <InViewSection>
          <CommunityHeroSection hasSession={hasSession} />

          {/* <TrendingTopicsSection /> */}

          {!hasSession && (
            <CtaCarousel
              eyebrow="Community Highlights"
              heading=""
              slides={whyJoinSlides}
              intervalMs={6000}
              className="hover:border-border/40 hover:bg-card/70 hover:shadow-lg"
            />
          )}
        </InViewSection>

        <InViewSection as="section" className="mt-8">
          <ScoredContentSection
            title={scoredSectionTitle}
            description="Switch between momentum and impact scoring over your selected period."
            controlsSlot={
              <ContentScoreSwitcher
                mode={scoreMode}
                period={scorePeriod}
                contentType={scoreContentType}
                enableContentTypeToggle
                showInfoButton={false}
              />
            }
            contentType={scoreContentType}
            scoreMode={scoreMode}
            scorePeriod={scorePeriod}
            limit={4}
            viewAllHref={scoreContentType === "blogs" ? "/blogs" : "/discussions"}
            viewAllLabel={scoreContentType === "blogs" ? "View all blog posts →" : "View all discussions →"}
          />
        </InViewSection>

        <SectionSeparator />
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
