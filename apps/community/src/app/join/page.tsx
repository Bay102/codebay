import type { Metadata } from "next";
import { Suspense } from "react";
import { CtaCarousel, SurfaceCard, type CtaCarouselSlide } from "@codebay/ui";
import { CommunityAuthCard } from "@/components/pages/community/CommunityAuthCard";

export const metadata: Metadata = {
  title: "Join the Community",
  description:
    "Create your CodingBay Community account to connect with developers, share progress, and collaborate on practical AI-powered engineering patterns."
};

const communityHighlights = [
  {
    title: "Developer-first discussions",
    description: "Share implementation details, trade-offs, and lessons from production systems."
  },
  {
    title: "Practical resources",
    description: "Discover templates, walkthroughs, and reusable patterns for modern web teams."
  },
  {
    title: "Peer feedback",
    description: "Get fast review loops on architecture, code quality, and performance bottlenecks."
  }
];

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

export default function CommunityJoinPage() {
  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-6xl px-5 sm:px-6 md:pt-5 lg:px-8">
        <SurfaceCard as="div" variant="card">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Establish your presence</p>
          <h1 className="font-hero mt-3 max-w-4xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl">
            Join the CodingBay Community
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            Set up your profile to participate in discussions, comment on blog posts, and collaborate with other
            builders.
          </p>
        </SurfaceCard>

        <CtaCarousel slides={whyJoinSlides} intervalMs={5000} />

        <section id="community-auth" className="mt-4">
          <Suspense
            fallback={
              <SurfaceCard variant="panel">
                <p className="text-sm text-muted-foreground">Loading community authentication...</p>
              </SurfaceCard>
            }
          >
            <CommunityAuthCard />
          </Suspense>
        </section>

        {/* <section className="mt-8 grid gap-4 md:grid-cols-3">
          {communityHighlights.map((item) => (
            <SurfaceCard key={item.title} as="article" variant="card">
              <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
            </SurfaceCard>
          ))}
        </section> */}

      </section>
    </main>
  );
}
