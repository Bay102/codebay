import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SurfaceCard, CtaCarousel, type CtaCarouselSlide } from "@codebay/ui";
import { blogUrl } from "@/lib/site-urls";
import { TrendingProfilesSection } from "@/components/pages/community/TrendingProfilesSection";
import { TrendingTopicsSection } from "@/components/pages/community/TrendingTopicsSection";
import { FeaturedBlogPostsSection } from "@/components/pages/community/FeaturedBlogPostsSection";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Explore the CodingBay Community – publish on your own blog, join discussions, and connect with fellow developers."
};

const whyJoinSlides: CtaCarouselSlide[] = [
  {
    title: "Real-world engineering discussions",
    body: "See how other teams ship AI features, debug production issues, and reason about architecture trade-offs."
  },
  {
    title: "Tight feedback loop with the CodeBay team",
    body: "Ask questions, share context, and influence what we build next in the platform and open-source tools."
  },
  {
    title: "Patterns, templates, and reference implementations",
    body: "Reuse production-tested flows for auth, billing, AI workflows, and more—without starting from scratch."
  },
  {
    title: "Ship faster with other builders",
    body: "Surround yourself with engineers shipping similar stacks so you can unblock each other quickly."
  }
];

export default function CommunityLandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <SurfaceCard as="div" variant="hero">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">CodingBay Community</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Unleash your presence. Grow your audience, and get noticed by the right people.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            Publish on your own blog page, join discussions, and connect with developers building in the open.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Join the community
            </Link>
            <Link
              href="/join?mode=signin"
              className="inline-flex rounded-full border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href={blogUrl}
              className="inline-flex rounded-full border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            >
              Browse blog posts
            </Link>
          </div>
        </SurfaceCard>

        <CtaCarousel
          eyebrow="Why join the community"
          heading="A focused space for engineers who actually ship"
          slides={whyJoinSlides}
        />

        <Suspense fallback={null}>
          <TrendingTopicsSection />
        </Suspense>

        <Suspense fallback={null}>
          <FeaturedBlogPostsSection />
        </Suspense>

        <Suspense fallback={null}>
          <TrendingProfilesSection />
        </Suspense>
      </section>
    </main>
  );
}
