import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Compass, Filter, MessageSquareText, Rss, Sparkles, Users } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchAllTags } from "@/lib/tags";
import { getFollowing } from "@/lib/follows";
import {
  fetchPreferredTopicNames,
  parseExploreSortParam,
  parseScoreModeParam,
  parseScorePeriodParam,
  parseExploreTypeParam,
  parseForYouExploreParam,
  parseUuidSearchParam
} from "@/lib/explore";
import { getScoreModeLabel } from "@/lib/content-scoring";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import {
  fetchBlogEngagementCounts,
  getBlogPostsForCommunityList,
  sortBlogPostsForExplore
} from "@/lib/blog";
import { CommunityListingsHero, type ListingsHeroStat } from "@/components/pages/community/CommunityListingsHero";
import { ContentScoreSwitcher } from "@/components/pages/community/ContentScoreSwitcher";
import { ScoredContentSection } from "@/components/pages/community/ScoredContentSection";
import { ExploreToolbar } from "@/components/pages/explore/ExploreToolbar";
import {
  ExploreFilteredFeed,
  ExploreGuestFeed,
  ExplorePersonalizedFeed
} from "@/components/pages/explore/ExploreFeed";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover discussions and blog posts by topic, search, sort, and your interests."
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    type?: string;
    tag?: string;
    author?: string;
    q?: string;
    sort?: string;
    score?: string;
    period?: string;
    forYou?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const contentType = parseExploreTypeParam(resolved.type);
  const tag = typeof resolved.tag === "string" && resolved.tag.trim() ? resolved.tag.trim() : undefined;
  const q = typeof resolved.q === "string" ? resolved.q : undefined;
  const hasExplicitSortParam = typeof resolved.sort === "string" && resolved.sort.trim().length > 0;
  const exploreSort = parseExploreSortParam(resolved.sort);
  const parsedScoreMode = parseScoreModeParam(resolved.score);
  const parsedScorePeriod = parseScorePeriodParam(resolved.period);
  const scoreMode = parsedScoreMode ?? "hot";
  const scorePeriod = parsedScorePeriod ?? "7d";
  const hasScoreRanking = Boolean(parsedScoreMode && parsedScorePeriod);
  const preferPersonalizedExplore = parseForYouExploreParam(resolved.forYou);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-background">
        <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Home
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Unable to load Explore.</p>
        </section>
      </main>
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const [tags, followingProfiles] = await Promise.all([
    fetchAllTags(supabase),
    userId ? getFollowing(supabase, userId, 200, 0) : Promise.resolve([])
  ]);

  let effectiveAuthorId = parseUuidSearchParam(resolved.author);
  if (effectiveAuthorId) {
    const { data: authorRow } = await supabase
      .from("community_users")
      .select("id")
      .eq("id", effectiveAuthorId)
      .maybeSingle();
    if (!authorRow) {
      effectiveAuthorId = undefined;
    }
  }

  const preferredTagNames =
    userId ? await fetchPreferredTopicNames(supabase, userId) : [];

  const followingIds = followingProfiles.map((p) => p.id);
  const hasPersonalizedFeed =
    Boolean(userId) &&
    preferPersonalizedExplore &&
    !tag &&
    !effectiveAuthorId &&
    !(q?.trim()) &&
    exploreSort === "date" &&
    !hasExplicitSortParam;
  const useExplicitExploreList = Boolean(
    tag || effectiveAuthorId || q?.trim() || hasExplicitSortParam || hasScoreRanking || (userId && !hasPersonalizedFeed)
  );

  let stats: ListingsHeroStat[];
  let feed: ReactNode;

  if (hasScoreRanking && !tag && !effectiveAuthorId && !(q?.trim())) {
    stats = [
      {
        label: "Score mode",
        value: getScoreModeLabel(scoreMode),
        detail: "ranking strategy"
      },
      {
        label: "Period",
        value: scorePeriod,
        detail: "scoring window"
      },
      { label: "Topic catalog", value: String(tags.length), detail: "tags to pick from" }
    ];
    feed = (
      <ScoredContentSection
        title={`${getScoreModeLabel(scoreMode)} ranking`}
        description="Score-ranked content from the selected period."
        contentType={contentType}
        scoreMode={scoreMode}
        scorePeriod={scorePeriod}
        limit={12}
        viewAllHref={contentType === "blogs" ? "/blogs" : "/discussions"}
        viewAllLabel={contentType === "blogs" ? "View all blog posts →" : "View all discussions →"}
      />
    );
  } else if (useExplicitExploreList) {
    if (contentType === "discussions") {
      const discussions = await getDiscussionsWithCounts(supabase, {
        limit: 48,
        offset: 0,
        orderByTrend: !effectiveAuthorId,
        search: q,
        tagFilter: tag,
        authorId: effectiveAuthorId,
        exploreSort,
        scoreMode,
        scorePeriod
      });
      stats = [
        { label: "Matches", value: String(discussions.length), detail: "discussions" },
        { label: "Topic catalog", value: String(tags.length), detail: "tags to pick from" }
      ];
      feed = (
        <ExploreFilteredFeed
          contentType="discussions"
          discussions={discussions}
          posts={[]}
          engagementBySlug={{}}
        />
      );
    } else {
      let posts = await getBlogPostsForCommunityList(supabase, {
        limit: 48,
        search: q,
        tagFilter: tag,
        authorId: effectiveAuthorId,
        exploreSort,
        scoreMode,
        scorePeriod
      });
      const engagementBySlug =
        posts.length > 0 ? await fetchBlogEngagementCounts(posts.map((p) => p.slug)) : {};
      posts = sortBlogPostsForExplore(posts, engagementBySlug, exploreSort).slice(0, 48);
      stats = [
        { label: "Matches", value: String(posts.length), detail: "blog posts" },
        { label: "Topic catalog", value: String(tags.length), detail: "tags to pick from" }
      ];
      feed = (
        <ExploreFilteredFeed
          contentType="blogs"
          discussions={[]}
          posts={posts}
          engagementBySlug={engagementBySlug}
        />
      );
    }
  } else if (hasPersonalizedFeed) {
    stats = [
      {
        label: "Creators you follow",
        value: String(followingIds.length),
        detail: "personalized rows"
      },
      {
        label: "Your topics",
        value: String(preferredTagNames.length),
        detail: "from settings"
      },
      { label: "Topic catalog", value: String(tags.length), detail: "all tags" }
    ];
    feed = (
      <ExplorePersonalizedFeed
        contentType={contentType}
        followingIds={followingIds}
        preferredTagNames={preferredTagNames}
      />
    );
  } else {
    stats = [
      {
        label: "Mode",
        value: contentType === "blogs" ? "Blog posts" : "Discussions",
        detail: "toggle in the bar"
      },
      { label: "Topic catalog", value: String(tags.length), detail: "tags when signed in" },
      { label: "Personalize", value: "Sign in", detail: "follow & topics" }
    ];
    feed = <ExploreGuestFeed contentType={contentType} />;
  }

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-6 sm:pb-14 lg:px-8">
        <CommunityListingsHero
          EyebrowIcon={Compass}
          eyebrow="Discover"
          title="Explore"
          description="Switch between discussions and blog posts, narrow by topic or search, sort results, or browse feeds tuned to people and topics you follow."
          chips={[
            { Icon: Filter, label: "Topic, search & sort" },
            { Icon: Users, label: "From your network" },
            { Icon: contentType === "blogs" ? Rss : MessageSquareText, label: contentType === "blogs" ? "Long-form posts" : "Community threads" },
            { Icon: Sparkles, label: "Matches your interests" }
          ]}
          stats={stats}
        >
          <ExploreToolbar
            tags={tags}
            contentType={contentType}
            initialQuery={q}
            initialTag={tag ?? null}
            initialSort={exploreSort}
            scoreControls={
              <ContentScoreSwitcher
                mode={scoreMode}
                period={scorePeriod}
                contentType={contentType}
              />
            }
          />
        </CommunityListingsHero>

        {feed}
      </section>
    </main>
  );
}
