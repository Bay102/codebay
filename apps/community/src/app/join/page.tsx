import type { Metadata } from "next";
import { Suspense } from "react";
import { SurfaceCard } from "@codebay/ui";
import { CommunityAuthCard } from "@/components/pages/community/CommunityAuthCard";

export const metadata: Metadata = {
  title: "Join the Community",
  description:
    "Create your CodeBay community account to connect with developers, share progress, and collaborate on practical AI-powered engineering patterns."
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

export default function CommunityJoinPage() {
  return (
    <main className="min-h-screen bg-background pt-10 sm:pt-14">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <SurfaceCard as="div" variant="hero">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Join CodeBay Community</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Create your community account
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            Set up your profile to participate in discussions, comment on blog posts, and collaborate with other
            builders.
          </p>
        </SurfaceCard>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {communityHighlights.map((item) => (
            <SurfaceCard key={item.title} as="article" variant="card">
              <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
            </SurfaceCard>
          ))}
        </section>

        <section id="community-auth" className="mt-10">
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
      </section>
    </main>
  );
}
