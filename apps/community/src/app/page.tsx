import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SurfaceCard } from "@codebay/ui";
import { blogUrl } from "@/lib/site-urls";
import { WhyJoinCarousel } from "@/components/pages/community/WhyJoinCarousel";
import { TrendingProfilesSection } from "@/components/pages/community/TrendingProfilesSection";
import { TrendingTopicsSection } from "@/components/pages/community/TrendingTopicsSection";
import { FeaturedBlogPostsSection } from "@/components/pages/community/FeaturedBlogPostsSection";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Explore the CodeBay community – a focused space for AI-powered engineering, discussions, and shared resources."
};

export default function CommunityLandingPage() {
  return (
    <main className="min-h-screen bg-background pt-10 sm:pt-14">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <SurfaceCard as="div" variant="hero">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">CodeBay Community</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Community hub for builders shipping with AI
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            Join other engineers shipping AI-powered products: share patterns, get feedback, and stay close to what the
            CodeBay team is building.
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

        <WhyJoinCarousel />

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
