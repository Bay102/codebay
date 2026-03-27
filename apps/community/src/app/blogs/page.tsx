import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, MessageSquareText, Rss, Sparkles } from "lucide-react";
import { BlogPostCard, SurfaceCard } from "@codebay/ui";
import { fetchBlogEngagementCounts, getBlogPostsForCommunityList } from "@/lib/blog";
import { buildBlogPostPath } from "@/lib/blog-urls";
import { fetchAllTags } from "@/lib/tags";
import { parseScoreModeParam, parseScorePeriodParam } from "@/lib/explore";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapLandingFeaturedPostToBlogPostCardData } from "@/lib/ui-mappers";
import { FocusButton } from "@/components/shared/buttons/FocusButton";
import { BlogsToolbar } from "@/components/pages/blogs/BlogsToolbar";
import { CommunityListingsHero } from "@/components/pages/community/CommunityListingsHero";
import { ContentScoreSwitcher } from "@/components/pages/community/ContentScoreSwitcher";
import { ContentScoreMarker } from "@/components/shared/ContentScoreMarker";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Community blog posts — read and discover articles from members."
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; tag?: string; score?: string; period?: string }>;
};

export default async function BlogsListPage({ searchParams }: PageProps) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-background">
        <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              ← Home
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">Unable to load blog posts.</p>
        </section>
      </main>
    );
  }

  const resolved = await searchParams;
  const q = typeof resolved.q === "string" ? resolved.q : undefined;
  const tag = typeof resolved.tag === "string" ? resolved.tag : undefined;
  const scoreMode = parseScoreModeParam(resolved.score) ?? "hot";
  const scorePeriod = parseScorePeriodParam(resolved.period) ?? "7d";

  const [posts, tags] = await Promise.all([
    getBlogPostsForCommunityList(supabase, {
      limit: 32,
      offset: 0,
      search: q,
      tagFilter: tag,
      scoreMode,
      scorePeriod
    }),
    fetchAllTags(supabase)
  ]);

  const engagementBySlug =
    posts.length > 0 ? await fetchBlogEngagementCounts(posts.map((p) => p.slug)) : {};

  return (
    <main className="bg-background">
      <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-6 sm:pb-14 lg:px-8">
        <CommunityListingsHero
          EyebrowIcon={Rss}
          eyebrow="Community writing"
          title="Blogs"
          description="Browse long-form posts from members, search by topic or author, and publish your own guides from the dashboard."
          // chips={[
          //   { Icon: BookOpen, label: "Guides & tutorials" },
          //   { Icon: Sparkles, label: "Fresh perspectives" },
          //   { Icon: MessageSquareText, label: "Comments & reactions" }
          // ]}
          stats={[
            { label: "In this view", value: String(posts.length), detail: "posts listed" },
            { label: "Topic catalog", value: String(tags.length), detail: "tags to explore" }
          ]}
          statsFooter={
            <FocusButton
              href="/dashboard/blog/new"
              colorVariant="primary"
              borderVariant="bordered"
              sizeVariant="sm"
              radiusVariant="square"
            >
              New blog post
            </FocusButton>
          }
        >
          <ContentScoreSwitcher
            mode={scoreMode}
            period={scorePeriod}
            className="mb-3"
          />
          <BlogsToolbar tags={tags} initialQuery={q} initialTag={tag ?? null} variant="hero" />
        </CommunityListingsHero>

        {posts.length === 0 ? (
          <SurfaceCard as="div" variant="card" className="mt-6 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {q || tag
                ? "No blog posts match your search or filter. Try different terms or clear filters."
                : "No blog posts yet. Be the first to publish from your dashboard."}
            </p>
          </SurfaceCard>
        ) : (
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {posts.map((post) => {
              const counts = engagementBySlug[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
              const cardData = mapLandingFeaturedPostToBlogPostCardData({
                id: post.id,
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                authorName: post.authorName,
                authorId: post.authorId,
                authorAvatarUrl: post.authorAvatarUrl,
                publishedAt: post.publishedAt,
                tags: post.tags,
                views: counts.views,
                reactions: counts.reactions,
                comments: counts.comments
              });
              return (
                <BlogPostCard
                  key={post.id}
                  post={cardData}
                  href={buildBlogPostPath(post.authorName, post.slug)}
                  headerSlot={post.scoreSummary ? <ContentScoreMarker summary={post.scoreSummary} /> : undefined}
                  showAuthorAvatar
                  showAuthor
                  showDate
                  showEngagement
                  showTags
                  variant="compact"
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
