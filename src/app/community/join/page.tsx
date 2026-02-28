import type { Metadata } from "next";
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
    <main className="min-h-screen bg-background pt-20">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card/40 px-6 py-8 sm:px-8 sm:py-10 md:px-10">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Join CodeBay Community</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Create your community account
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            Set up your profile to participate in discussions, comment on blog posts, and collaborate with other
            builders.
          </p>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {communityHighlights.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border/70 bg-card/60 p-5">
              <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </section>

        <section id="community-auth" className="mt-10">
          <CommunityAuthCard />
        </section>
      </section>
    </main>
  );
}

