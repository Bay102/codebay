import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Explore the CodeBay community – a focused space for AI-powered engineering, discussions, and shared resources."
};

const placeholderSections = [
  {
    title: "Latest discussions",
    body: "A feed of in-progress conversations around architecture decisions, performance tuning, and production incidents."
  },
  {
    title: "Community resources",
    body: "Curated guides, reference implementations, and templates shared by the community."
  },
  {
    title: "Events & office hours",
    body: "Upcoming live sessions, AMAs, and office hours for teams shipping with AI."
  }
];

export default function CommunityLandingPage() {
  return (
    <main className="min-h-screen bg-background pt-10 sm:pt-14">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card/40 px-6 py-8 sm:px-8 sm:py-10 md:px-10">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">CodeBay Community</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Community hub for builders shipping with AI
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            This is the starting point for CodeBay community activity. We will surface discussions, resources, and
            events here as the community evolves.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/join"
              className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              Join the community
            </Link>
            <Link
              href="https://codingbay.blog"
              className="inline-flex rounded-full border border-border/70 bg-card px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
            >
              Browse blog posts
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {placeholderSections.map((section) => (
            <article key={section.title} className="rounded-2xl border border-border/70 bg-card/60 p-5">
              <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-border/70 bg-card/40 p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">Future community surface</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            This area will evolve into a richer community experience: personalized activity, saved threads, featured
            posts, and more. For now, it serves as a placeholder so we can wire up navigation and authentication flows.
          </p>
        </section>
      </section>
    </main>
  );
}
