import Link from "next/link";
import type { ComponentType } from "react";
import { Activity, Eye, MessageSquareText, RadioTower, Rss, Sparkles, Zap } from "lucide-react";
import { SurfaceCard } from "@codebay/ui";
import { DiscussionAuthorAvatar } from "@/components/pages/discussions/DiscussionAuthorAvatar";
import { DashboardHeroButtons } from "@/components/pages/dashboard/DashboardHeroButtons";
import { buildPostUrl } from "@/lib/blog-urls";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { fetchFeaturedBlogPosts, fetchTrendingTopics } from "@/lib/landing";
import { blogUrl } from "@/lib/site-urls";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CommunityHeroSectionProps = {
  hasSession: boolean;
};

type SignalMetric = {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
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

function SignalMetricGrid({
  eyebrow,
  metrics,
  compact = false
}: {
  eyebrow: string;
  metrics: SignalMetric[];
  compact?: boolean;
}) {
  const columnClassName = metrics.length >= 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div
      className={`rounded-xl border border-border/60 bg-card/55 backdrop-blur-sm ${compact ? "px-1.5 py-1.5" : "px-2 py-2"}`}
    >
      <div
        className={`flex items-center gap-2 uppercase text-muted-foreground ${compact ? "text-[7px] tracking-[0.18em]" : "text-[8px] tracking-[0.22em]"}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.55)]" />
        <span className="font-mono-ticker">{eyebrow}</span>
      </div>

      <div className={`mt-1.5 grid gap-px overflow-hidden rounded-lg bg-border/50 ${columnClassName}`}>
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className={`relative min-w-0 bg-background/60 ${compact ? "px-2 py-1.5" : "px-2.5 py-2"}`}
            >
              <div
                className={`pointer-events-none absolute top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent ${compact ? "inset-x-2" : "inset-x-2.5"}`}
              />
              <div className="flex items-center justify-between gap-2 lg:justify-end">
                <span
                  className={`min-w-0 truncate uppercase text-muted-foreground lg:hidden ${compact ? "text-[7px] tracking-[0.05em]" : "text-[8px] tracking-[0.08em]"}`}
                >
                  {metric.label}
                </span>
                <Icon className={`shrink-0 text-primary/80 ${compact ? "h-2.5 w-2.5" : "h-3 w-3"}`} />
              </div>
              <div
                className={`font-mono-ticker font-semibold leading-none text-foreground ${compact ? "mt-0.5 text-base sm:text-lg" : "mt-1 text-lg sm:text-xl"}`}
              >
                {formatCompactNumber(metric.value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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

          <div className="grid gap-4">
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

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex h-full flex-col rounded-[1.5rem] border border-border/60 bg-background/80 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  <MessageSquareText className="h-3.5 w-3.5 text-primary" />
                  Live discussion
                </div>
                {trendingDiscussion ? (
                  <div className="mt-2.5 flex flex-1 flex-col">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Link
                        href={`/${trendingDiscussion.authorUsername}`}
                        className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
                      >
                        <DiscussionAuthorAvatar
                          name={trendingDiscussion.authorName}
                          avatarUrl={trendingDiscussion.authorAvatarUrl}
                          sizeClassName="h-6 w-6"
                          textClassName="text-[9px]"
                        />
                      </Link>
                      <Link
                        href={`/${trendingDiscussion.authorUsername}`}
                        className="truncate transition-colors hover:text-foreground"
                      >
                        {trendingDiscussion.authorName}
                      </Link>
                    </div>
                    <Link
                      href={`/discussions/${trendingDiscussion.slug}`}
                      className="line-clamp-2 text-base font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {trendingDiscussion.title}
                    </Link>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {trendingDiscussion.body || "Join the thread and add your perspective to the discussion."}
                    </p>
                    <div className="mt-auto pt-3">
                      <SignalMetricGrid
                        eyebrow="thread telemetry"
                        metrics={[
                          { label: "comments", value: trendingDiscussion.commentCount, icon: MessageSquareText },
                          { label: "reactions", value: trendingDiscussion.reactionCount, icon: Zap }
                        ]}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-muted-foreground">
                    New discussion activity will appear here as members start posting.
                  </div>
                )}
              </div>

              <div className="flex h-full flex-col rounded-[1.5rem] border border-border/60 bg-background/80 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  <Rss className="h-3.5 w-3.5 text-primary" />
                  Featured post
                </div>
                {featuredPost ? (
                  <div className="mt-2.5 flex flex-1 flex-col">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <DiscussionAuthorAvatar
                        name={featuredPost.authorName}
                        avatarUrl={featuredPost.authorAvatarUrl}
                        sizeClassName="h-6 w-6"
                        textClassName="text-[9px]"
                      />
                      <span className="truncate">{featuredPost.authorName}</span>
                    </div>
                    <Link
                      href={buildPostUrl(featuredPost.authorName, featuredPost.slug)}
                      className="line-clamp-2 text-base font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {featuredPost.title}
                    </Link>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {formatShortDate(featuredPost.publishedAt)}
                    </p>
                    <div className="mt-auto pt-3">
                      <SignalMetricGrid
                        eyebrow="post telemetry"
                        compact
                        metrics={[
                          { label: "views", value: featuredPost.views, icon: Eye },
                          { label: "comments", value: featuredPost.comments, icon: MessageSquareText },
                          { label: "reactions", value: featuredPost.reactions, icon: Zap }
                        ]}
                      />
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
