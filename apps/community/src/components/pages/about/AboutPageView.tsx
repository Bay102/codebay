import Link from "next/link";
import {
  Activity,
  Compass,
  LayoutGrid,
  Mail,
  MessageSquareText,
  Rss,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import { SegmentNavbar, SurfaceCard } from "@codebay/ui";
import { buildContentScoreSummary } from "@/lib/content-scoring";
import { ContentScoreMarker } from "@/components/shared/ContentScoreMarker";

export function AboutPageView() {
  const sampleMomentum = buildContentScoreSummary({
    mode: "hot",
    period: "24h",
    metrics: { views: 182, reactions: 47, comments: 29 },
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  });
  const sampleImpact = buildContentScoreSummary({
    mode: "quality",
    period: "30d",
    metrics: { views: 1430, reactions: 280, comments: 96 },
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="relative isolate overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/5 via-background to-background">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
          aria-hidden
        />
        <section className="mx-auto w-full max-w-4xl px-5 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Home
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">CodingBay Community</p>
          <h1 className="font-hero mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            About the platform
          </h1>
          <p className="font-hero mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            One place to follow the people, stacks, and ideas shaping tech—through open discussions and creator-led
            blogs, tuned to what you care about.
          </p>
        </section>
      </div>

      <section className="mx-auto w-full max-w-4xl space-y-10 px-5 py-10 sm:space-y-12 sm:px-6 sm:py-12 lg:px-8">
        <SurfaceCard as="article" variant="panel" className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary/60 via-primary/25 to-transparent sm:w-1.5"
            aria-hidden
          />
          <div className="pl-4 sm:pl-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Compass className="h-4 w-4" aria-hidden />
              What it is
            </div>
            <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">A global hub for tech conversation</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              CodingBay Community is a tech platform where members start and join discussions, read creators&apos; blog
              posts, and react in the open. Instead of chasing updates across scattered channels, you get a single
              surface to stay current on the topics and voices that matter to you.
            </p>
          </div>
        </SurfaceCard>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
            Why it helps you
          </div>
          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Less noise, more signal</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Follow creators and topics you trust. Surface new threads and posts in one feed-minded experience—built for
            engineers, founders, and teams who want depth without the scroll fatigue.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {[
              {
                icon: MessageSquareText,
                title: "Discussions that go deep",
                body: "Ask hard questions, share what you tried, and learn from peers—not just headlines."
              },
              {
                icon: Rss,
                title: "Blogs with reach",
                body: "Long-form from people building in public, easy to discover and share."
              },
              {
                icon: Users,
                title: "Profiles you can trust",
                body: "See who is behind the content and what they focus on before you follow."
              },
              {
                icon: LayoutGrid,
                title: "Topics, not algorithms-only",
                body: "Lean on tags and follows so your stream reflects your stack and interests."
              }
            ].map((item) => (
              <li key={item.title}>
                <SurfaceCard as="div" variant="card" className="h-full border-border/60 bg-card/50 p-4 sm:p-5">
                  <item.icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.body}</p>
                </SurfaceCard>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <LayoutGrid className="h-4 w-4" aria-hidden />
            Features
          </div>
          <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">Built for visibility and habit</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 sm:gap-5">
            <SurfaceCard as="div" variant="panel" className="flex flex-col border-border/60 bg-card/55">
              <Users className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="mt-4 text-sm font-semibold text-foreground">Your tech profile</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                A dedicated profile that highlights skills and accomplishments so collaborators and readers know who you
                are at a glance.
              </p>
            </SurfaceCard>
            <SurfaceCard as="div" variant="panel" className="flex flex-col border-border/60 bg-card/55">
              <Rss className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="mt-4 text-sm font-semibold text-foreground">Personal blog</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Publish on your own URL-style path to grow engagement and strengthen SEO for your personal or team
                brand.
              </p>
            </SurfaceCard>
            <SurfaceCard as="div" variant="panel" className="flex flex-col border-border/60 bg-card/55">
              <Mail className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="mt-4 text-sm font-semibold text-foreground">Follow-based digests</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Optional email digests summarize new posts and discussions from creators you follow—on a cadence you
                control.
              </p>
            </SurfaceCard>
          </div>
        </div>

        <SurfaceCard as="article" variant="panel" className="border-border/60 bg-card/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Activity className="h-4 w-4" aria-hidden />
            Momentum & Impact
          </div>
          <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
            Ranking that balances speed and depth
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Momentum and Impact are two complementary score modes used across discussions and blogs. Momentum surfaces
            posts that are accelerating right now, while Impact highlights content with stronger sustained engagement.
            Together, they make discovery clearer and reduce noisy, one-dimensional sorting.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">What it is</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                A dual scoring model that combines engagement signals (views, reactions, comments) with time windows
                so users can switch between fast-moving and high-quality content.
              </p>
            </div>
            <div className="border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Why it helps</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Readers find relevant posts faster, creators get better visibility for both trending and evergreen
                content, and ranking feels more transparent through clear labels and score indicators.
              </p>
            </div>
          </div>

          <div className="mt-6 border border-border/70 bg-background/70 p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Example UI (placeholder discussion card)
            </p>
            <div className="mt-3 border border-border/60 bg-card/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">@alexdev · 6h ago</p>
                  <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                    How are teams adopting AI coding workflows in production?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    We&apos;ve tested pair-programming with LLMs in CI-heavy repos. Curious what guardrails and review
                    patterns are working for other teams.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <ContentScoreMarker summary={sampleMomentum} />
                  <ContentScoreMarker summary={sampleImpact} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>182 views</span>
                <span>·</span>
                <span>29 comments</span>
                <span>·</span>
                <span>47 reactions</span>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          as="article"
          variant="subtle"
          className="border-primary/20 bg-gradient-to-br from-card/80 via-card/60 to-primary/5"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Target className="h-4 w-4" aria-hidden />
            Our goal
          </div>
          <h2 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">Where tech updates actually live together</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Technology changes fast, yet there is still no single place to opt in to steady, trustworthy updates across
            the stacks and creators you care about. We are building toward a global home for tech discussions and
            announcements—imagine if organizations like GitHub, Meta, or Slack each had a profile where they published
            product and ecosystem updates on a rhythm you could follow. Visibility would flow to the right discussions
            and posts, and you would see only the topics you chose—not everything the internet wants to push.
          </p>
        </SurfaceCard>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm text-muted-foreground">Ready to explore?</p>
          <div className="flex w-full min-w-0 justify-stretch sm:shrink-0 sm:w-auto sm:justify-end">
            <SegmentNavbar
              aria-label="Explore CodingBay Community"
              className="w-full sm:w-auto"
              links={[
                { href: "/join", label: "Join the community", kind: "primary" },
                { href: "/discussions", label: "Browse discussions", kind: "neutral" },
                { href: "/blogs", label: "Read blogs", kind: "neutral" }
              ]}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
