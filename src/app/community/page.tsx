import type { Metadata } from "next";
import Link from "next/link";
import { CommunityAuthCard } from "@/components/pages/community/CommunityAuthCard";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join the CodeBay community to connect with developers, share progress, and collaborate on practical AI-powered engineering patterns."
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

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            CodeBay
          </Link>
          <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card/40 px-6 py-8 sm:px-8 sm:py-10 md:px-10">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">CodeBay Community</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            A focused developer community for builders shipping with AI
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            The CodeBay community is where developers collaborate on architecture decisions, share shipping patterns, and
            learn faster from real implementation experience.
          </p>
          <div className="mt-6">
            <a
              href="#community-auth"
              className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Join the community
            </a>
          </div>
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
