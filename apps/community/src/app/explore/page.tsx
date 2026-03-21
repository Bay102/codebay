import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Compass, Filter, MessageSquareText, Rss, Sparkles, Users } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchAllTags } from "@/lib/tags";
import { getFollowing } from "@/lib/follows";
import {
  fetchPreferredTopicNames,
  parseExploreTypeParam,
  parseUuidSearchParam
} from "@/lib/explore";
import { getDiscussionsWithCounts } from "@/lib/discussions";
import { fetchBlogEngagementCounts, getBlogPostsForCommunityList } from "@/lib/blog";
import { CommunityListingsHero, type ListingsHeroStat } from "@/components/pages/community/CommunityListingsHero";
import { ExploreToolbar, type ExploreAuthorOption } from "@/components/pages/explore/ExploreToolbar";
import {
  ExploreFilteredFeed,
  ExploreGuestFeed,
  ExplorePersonalizedFeed
} from "@/components/pages/explore/ExploreFeed";

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover discussions and blog posts by topic, author, and your interests."
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ type?: string; tag?: string; author?: string; q?: string }>;
};

export default async function ExplorePage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const contentType = parseExploreTypeParam(resolved.type);
  const tag = typeof resolved.tag === "string" && resolved.tag.trim() ? resolved.tag.trim() : undefined;
  const q = typeof resolved.q === "string" ? resolved.q : undefined;

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

  let authorOptions: ExploreAuthorOption[] = followingProfiles.map((p) => ({
    id: p.id,
    label: p.name?.trim() || `@${p.username}`
  }));

  let effectiveAuthorId = parseUuidSearchParam(resolved.author);
  if (effectiveAuthorId) {
    const { data: authorRow } = await supabase
      .from("community_users")
      .select("id,name,username")
      .eq("id", effectiveAuthorId)
      .maybeSingle();
    if (!authorRow) {
      effectiveAuthorId = undefined;
    } else if (!authorOptions.some((o) => o.id === effectiveAuthorId)) {
      authorOptions = [
        ...authorOptions,
        {
          id: authorRow.id,
          label: authorRow.name?.trim() || `@${authorRow.username}`
        }
      ];
    }
  }

  const preferredTagNames =
    userId ? await fetchPreferredTopicNames(supabase, userId) : [];

  const followingIds = followingProfiles.map((p) => p.id);
  const hasScopedFilters = Boolean(tag || effectiveAuthorId || q?.trim());

  let stats: ListingsHeroStat[];
  let feed: ReactNode;

  if (hasScopedFilters) {
    if (contentType === "discussions") {
      const discussions = await getDiscussionsWithCounts(supabase, {
        limit: 48,
        offset: 0,
        orderByTrend: !effectiveAuthorId,
        search: q,
        tagFilter: tag,
        authorId: effectiveAuthorId
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
      const posts = await getBlogPostsForCommunityList(supabase, {
        limit: 48,
        search: q,
        tagFilter: tag,
        authorId: effectiveAuthorId
      });
      const engagementBySlug =
        posts.length > 0 ? await fetchBlogEngagementCounts(posts.map((p) => p.slug)) : {};
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
  } else if (userId) {
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
      <section className="mx-auto w-full max-w-4xl px-5 pb-12 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8">
        <CommunityListingsHero
          EyebrowIcon={Compass}
          eyebrow="Discover"
          title="Explore"
          description="Switch between discussions and blog posts, narrow by topic or author, or browse feeds tuned to people and topics you follow."
          chips={[
            { Icon: Filter, label: "Topic & author filters" },
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
            initialAuthorId={effectiveAuthorId ?? null}
            authorOptions={authorOptions}
          />
        </CommunityListingsHero>

        {feed}
      </section>
    </main>
  );
}
