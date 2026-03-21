import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimatedCardSection, BlogPostCard } from "@codebay/ui";
import { mapLandingFeaturedPostToBlogPostCardData } from "@/lib/ui-mappers";
import { fetchBlogAuthorProfileByUsername, fetchBlogEngagementCounts, fetchPublishedBlogPostsByAuthorId } from "@/lib/blog";
import { AuthorHero } from "@/components/pages/blog/AuthorHero";

export const dynamic = "force-dynamic";

type AuthorPageProps = {
  params: Promise<{
    username: string;
  }>;
};

function buildAuthorSegment(authorName: string): string {
  const base = authorName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "author";
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { username } = await params;
  const author = await fetchBlogAuthorProfileByUsername(username);

  if (!author) {
    return {
      title: "Author Not Found"
    };
  }

  return {
    title: `${author.name} | CodingBay Blog`,
    description: author.bio ?? `Read engineering posts from ${author.name}.`,
    alternates: {
      canonical: `/blog/${author.username}`
    }
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params;
  const author = await fetchBlogAuthorProfileByUsername(username);
  if (!author) {
    notFound();
  }

  const posts = await fetchPublishedBlogPostsByAuthorId(author.id);
  const engagement = await fetchBlogEngagementCounts(posts.map((post) => post.slug));
  const featuredPosts = posts.filter((post) => post.isFeatured).slice(0, 4);
  const authorSegment = buildAuthorSegment(author.name);

  return (
    <main className="bg-background pb-10">
      <section className="mx-auto w-full max-w-6xl px-3 sm:px-6 md:py-8 lg:px-8">
        <AuthorHero author={author} posts={posts} />

        {featuredPosts.length > 0 ? (
          <AnimatedCardSection as="section" title="Featured articles" columns={{ base: 1, md: 2 }}>
            {featuredPosts.map((post) => {
              const counts = engagement[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
              const cardData = mapLandingFeaturedPostToBlogPostCardData({
                id: post.slug,
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                authorName: post.authorName,
                authorId: post.authorId,
                authorAvatarUrl: null,
                publishedAt: post.publishedAt,
                tags: post.tags,
                views: counts.views,
                reactions: counts.reactions,
                comments: counts.comments
              });
              return (
                <BlogPostCard
                  key={cardData.slug}
                  post={cardData}
                  href={`/blog/${authorSegment}/${post.slug}`}
                  showAuthor={false}
                  showDate
                  showEngagement
                  showTags
                />
              );
            })}
          </AnimatedCardSection>
        ) : null}

        {posts.length > 0 ? (
          <AnimatedCardSection as="section" title="Published articles" columns={{ base: 1, md: 2 }}>
            {posts.map((post) => {
              const counts = engagement[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
              const cardData = mapLandingFeaturedPostToBlogPostCardData({
                id: post.slug,
                slug: post.slug,
                title: post.title,
                excerpt: post.excerpt,
                authorName: post.authorName,
                authorId: post.authorId,
                authorAvatarUrl: null,
                publishedAt: post.publishedAt,
                tags: post.tags,
                views: counts.views,
                reactions: counts.reactions,
                comments: counts.comments
              });
              return (
                <BlogPostCard
                  key={cardData.slug}
                  post={cardData}
                  href={`/blog/${authorSegment}/${post.slug}`}
                  showAuthor={false}
                  showDate
                  showEngagement
                  showTags
                />
              );
            })}
          </AnimatedCardSection>
        ) : (
          <section className="mt-8">
            <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
              Published articles
            </h2>
            <div className="mt-4 border border-border/70 bg-card p-6">
              <p className="text-sm text-muted-foreground">No published posts yet.</p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

