import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchBlogAuthorProfileByUsername,
  fetchBlogEngagementCounts,
  fetchPublishedBlogPostsByAuthorId
} from "@/lib/blog";
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

function formatPublishedDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
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
      canonical: `/author/${author.username}`
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
    <main className="min-h-screen bg-background pb-20 pt-10 sm:pt-14">
      <section className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <AuthorHero author={author} posts={posts} />

        {featuredPosts.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Featured articles</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {featuredPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/${authorSegment}/${post.slug}`}
                  className="rounded-2xl border border-border/70 bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/35 sm:p-6"
                >
                  <article>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
                      <span aria-hidden="true">-</span>
                      <span>{post.readTimeMinutes} min read</span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold leading-tight text-foreground sm:text-lg">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-8">
          <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Published articles</h2>
          {posts.length > 0 ? (
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {posts.map((post) => {
                const counts = engagement[post.slug] ?? { views: 0, reactions: 0, comments: 0 };
                return (
                  <Link
                    key={post.slug}
                    href={`/${authorSegment}/${post.slug}`}
                    className="rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/35 sm:p-6"
                  >
                    <article>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
                        <span aria-hidden="true">-</span>
                        <span>{post.readTimeMinutes} min read</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {counts.views.toLocaleString()} views · {counts.reactions} reactions · {counts.comments} comments
                      </p>
                      <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground">{post.title}</h3>
                      <p className="mt-3 text-base leading-8 text-muted-foreground">{post.excerpt}</p>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-border/70 bg-card p-6">
              <p className="text-sm text-muted-foreground">No published posts yet.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
