import { Activity, RadioTower, Sparkles, Users } from "lucide-react";
import { SurfaceCard } from "@codebay/ui";
import { DashboardHeroButtons } from "@/components/pages/dashboard/DashboardHeroButtons";
import { buildContentScoreSummary } from "@/lib/content-scoring";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { fetchFeaturedBlogPosts } from "@/lib/landing";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildBlogPostPath } from "@/lib/blog-urls";
import { CommunityHeroHighlightsCarousel } from "@/components/pages/community/CommunityHeroHighlightsCarousel";

type CommunityHeroSectionProps = {
  hasSession: boolean;
};

export async function CommunityHeroSection({ hasSession }: CommunityHeroSectionProps) {
  const supabase = await createServerSupabaseClient();

  const [featuredPosts, trendingDiscussion, monthlyBlogPostCount, monthlyDiscussionCount] = await Promise.all([
    fetchFeaturedBlogPosts(1),
    (async () => {
      if (!supabase) return null;
      const discussions = await getDiscussionsWithCounts(supabase, {
        limit: 1,
        offset: 0,
        orderByTrend: true
      });
      return discussions[0] ?? null;
    })(),
    (async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count, error } = await supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("status", "published")
        .gte("published_at", monthStart);

      if (error || typeof count !== "number") return 0;
      return count;
    })(),
    (async () => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count, error } = await supabase
        .from("discussions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStart);

      if (error || typeof count !== "number") return 0;
      return count;
    })()
  ]);

  const featuredPost = featuredPosts[0] ?? null;
  const featuredPostEngagement =
    (featuredPost?.views ?? 0) + (featuredPost?.reactions ?? 0) + (featuredPost?.comments ?? 0);
  const discussionMomentumSummary = buildContentScoreSummary({
    mode: "hot",
    period: "7d",
    metrics: {
      views: trendingDiscussion?.viewCount ?? Math.max(0, monthlyDiscussionCount * 4),
      reactions: trendingDiscussion?.reactionCount ?? Math.max(0, monthlyDiscussionCount),
      comments: trendingDiscussion?.commentCount ?? Math.max(0, Math.round(monthlyDiscussionCount / 2))
    },
    publishedAt: trendingDiscussion?.createdAt ?? new Date().toISOString()
  });

  const discussionImpactSummary = buildContentScoreSummary({
    mode: "quality",
    period: "30d",
    metrics: {
      views: trendingDiscussion?.viewCount ?? Math.max(0, monthlyDiscussionCount * 4),
      reactions: trendingDiscussion?.reactionCount ?? Math.max(0, monthlyDiscussionCount),
      comments: trendingDiscussion?.commentCount ?? Math.max(0, Math.round(monthlyDiscussionCount / 2))
    },
    publishedAt: trendingDiscussion?.createdAt ?? new Date().toISOString()
  });

  const blogMomentumSummary = buildContentScoreSummary({
    mode: "hot",
    period: "7d",
    metrics: {
      views: featuredPost?.views ?? monthlyBlogPostCount * 8,
      reactions: featuredPost?.reactions ?? Math.max(0, Math.round(featuredPostEngagement / 9)),
      comments: featuredPost?.comments ?? Math.max(0, Math.round(featuredPostEngagement / 14))
    },
    publishedAt: featuredPost?.publishedAt ?? new Date().toISOString()
  });

  const blogImpactSummary = buildContentScoreSummary({
    mode: "quality",
    period: "30d",
    metrics: {
      views: featuredPost?.views ?? monthlyBlogPostCount * 8,
      reactions: featuredPost?.reactions ?? Math.max(0, Math.round(featuredPostEngagement / 9)),
      comments: featuredPost?.comments ?? Math.max(0, Math.round(featuredPostEngagement / 14))
    },
    publishedAt: featuredPost?.publishedAt ?? null
  });

  return (
    <SurfaceCard
      as="section"
      variant="borderless"
      className="relative isolate overflow-hidden rounded-tl-3xl border border-border/40 bg-card/70 p-5 shadow-xl sm:p-6 lg:p-6"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-30 [background-image:linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:2.75rem_2.75rem] [mask-image:radial-gradient(circle_at_center,black,transparent_85%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[calc(38%+16px)] hidden px-5 sm:block sm:px-6 lg:px-8">
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
        <div className="max-w-3xl pb-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            <RadioTower className="h-3.5 w-3.5" />
            Cirqit
          </div>

          <h1 className="font-hero mt-3.5 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Stay relevant with the conversations shaping modern tech.
          </h1>

          <p className="font-hero mt-3.5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Track your favorite creators and stay up to date with the latest discussions and blog posts about all things tech.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Join Discussions
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              Make Connections
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Stay Relevant
            </span>
          </div>

          <DashboardHeroButtons hasSession={hasSession} />
        </div>

        <div className="grid gap-3">
          <CommunityHeroHighlightsCarousel
            featuredDiscussion={
              trendingDiscussion
                ? {
                    title: trendingDiscussion.title,
                    href: `/discussions/${trendingDiscussion.slug}`,
                    comments: trendingDiscussion.commentCount,
                    reactions: trendingDiscussion.reactionCount,
                    momentumSummary: discussionMomentumSummary,
                    impactSummary: discussionImpactSummary
                  }
                : null
            }
            featuredBlog={
              featuredPost
                ? {
                    title: featuredPost.title,
                    href: buildBlogPostPath(featuredPost.authorName, featuredPost.slug),
                    views: featuredPost.views,
                    comments: featuredPost.comments,
                    reactions: featuredPost.reactions,
                    momentumSummary: blogMomentumSummary,
                    impactSummary: blogImpactSummary
                  }
                : null
            }
          />
        </div>
      </div>
    </SurfaceCard>
  );
}
