import Link from "next/link";
import { Activity, ArrowUpRight, MessageSquareText, RadioTower, Rss, Sparkles } from "lucide-react";
import { SurfaceCard } from "@codebay/ui";
import { DashboardHeroButtons } from "@/components/pages/dashboard/DashboardHeroButtons";
import { buildPostUrl } from "@/lib/blog-urls";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { fetchFeaturedBlogPosts, fetchTrendingTopics } from "@/lib/landing";
import { blogUrl } from "@/lib/site-urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CommunityHeroSectionProps = {
  hasSession: boolean;
};

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatShortDate(value: string | null): string {
  if (!value) return "Fresh from the community";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fresh from the community";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export async function CommunityHeroSection({ hasSession }: CommunityHeroSectionProps) {
  const [topics, featuredPosts, trendingDiscussion] = await Promise.all([
    fetchTrendingTopics(5),
    fetchFeaturedBlogPosts(1),
    (async () => {
      const supabase = await createServerSupabaseClient();
      if (!supabase) return null;
      const discussions = await getDiscussionsWithCounts(supabase, {
        limit: 1,
        offset: 0,
        orderByTrend: true
      });
      return discussions[0] ?? null;
    })()
  ]);

  const featuredPost = featuredPosts[0] ?? null;
  const primaryTopics = topics.slice(0, 4);
  const metricItems = [
    {
      label: "Topics in motion",
      value: formatCompactNumber(topics.length || 0),
      detail: "signal clusters"
    },
    {
      label: "Discussion activity",
      value: formatCompactNumber((trendingDiscussion?.commentCount ?? 0) + (trendingDiscussion?.reactionCount ?? 0)),
      detail: "comments + reactions"
    },
    {
      label: "Post engagement",
      value: formatCompactNumber(
        (featuredPost?.views ?? 0) + (featuredPost?.reactions ?? 0) + (featuredPost?.comments ?? 0)
      ),
      detail: "views + feedback"
    }
  ];

  return (
    <SurfaceCard
      as="section"
      variant="borderless"
      className="relative overflow-hidden border border-border/40 bg-card/70 p-5 shadow-xl sm:p-6 lg:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:2.75rem_2.75rem] [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[calc(38%+20px)] hidden px-5 sm:block sm:px-6 lg:px-8">
        <div className="relative h-12">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/50" />
          <div
            data-signal-beam
            className="absolute top-1/2 h-10 w-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/35 to-transparent blur-xl"
          />
          <div
            data-signal-beam-core
            className="absolute top-1/2 h-px w-24 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/90 to-transparent"
          />
        </div>
      </div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end">
        <div className="max-w-3xl pb-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            <RadioTower className="h-3.5 w-3.5" />
            CodingBay Community
          </div>

          <h1 className="font-hero mt-4 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Stay relevant with the conversations shaping modern tech.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            CodingBay brings live engineering discussions, trending topics, and practical blog posts into one
            community feed for developers building in the open.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Real-time community pulse
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <MessageSquareText className="h-3.5 w-3.5 text-primary" />
              Discussions + blog context
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Built for curious builders
            </span>
          </div>

          <DashboardHeroButtons hasSession={hasSession} blogUrl={blogUrl} />
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {metricItems.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-border/60 bg-background/80 p-4 backdrop-blur"
              >
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{metric.label}</div>
                <div className="mt-2 font-mono-ticker text-2xl font-semibold uppercase tracking-[0.18em] text-foreground">
                  {metric.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{metric.detail}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            {/* <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Trending topics
                </div>
                <Link
                  href={blogUrl}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Explore
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {primaryTopics.length > 0 ? (
                  primaryTopics.map((topic, index) => (
                    <Link
                      key={topic.tag}
                      href={`${blogUrl}?tag=${encodeURIComponent(topic.tag)}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        index === 0
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="font-mono-ticker uppercase tracking-[0.16em]">{topic.tag}</span>
                      <span className="text-muted-foreground">{topic.postCount}</span>
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">Topics will appear here as the feed warms up.</div>
                )}
              </div>
            </div> */}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  <MessageSquareText className="h-3.5 w-3.5 text-primary" />
                  Live discussion
                </div>
                {trendingDiscussion ? (
                  <div className="mt-3">
                    <Link
                      href={`/discussions/${trendingDiscussion.slug}`}
                      className="line-clamp-2 text-base font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {trendingDiscussion.title}
                    </Link>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {trendingDiscussion.body || "Join the thread and add your perspective to the discussion."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        {trendingDiscussion.commentCount} comments
                      </span>
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        {trendingDiscussion.reactionCount} reactions
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-muted-foreground">
                    New discussion activity will appear here as members start posting.
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-border/60 bg-background/80 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  <Rss className="h-3.5 w-3.5 text-primary" />
                  Featured post
                </div>
                {featuredPost ? (
                  <div className="mt-3">
                    <Link
                      href={buildPostUrl(featuredPost.authorName, featuredPost.slug)}
                      className="line-clamp-2 text-base font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {featuredPost.title}
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {featuredPost.authorName} · {formatShortDate(featuredPost.publishedAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        {featuredPost.views} views
                      </span>
                      <span className="rounded-full border border-border/70 px-2.5 py-1">
                        {featuredPost.comments} comments
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-muted-foreground">
                    Featured writing will surface here once published posts are available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
