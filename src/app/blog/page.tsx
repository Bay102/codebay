import type { Metadata } from "next";
import Link from "next/link";
import { fetchPublishedBlogPosts, fetchBlogEngagementCounts, type BlogEngagementCounts } from "@/lib/blog";
import Footer from "@/components/Footer";

const siteUrl = "https://codebay.dev";
const blogUrl = `${siteUrl}/blog`;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Engineering Blog",
  description:
    "Technical articles from CodeBay on AI development, product engineering, and practical SEO implementation for modern web apps.",
  keywords: [
    "AI software development blog",
    "Next.js SEO",
    "product engineering",
    "MVP delivery",
    "CodeBay blog"
  ],
  alternates: {
    canonical: "/blog"
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: "CodeBay Blog | AI and Product Engineering Insights",
    description:
      "Technical articles on AI-powered development, SEO patterns, and product delivery practices from the CodeBay team.",
    siteName: "CodeBay",
    images: [{ url: "/codebay.svg" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeBay Blog | AI and Product Engineering Insights",
    description:
      "Technical articles on AI-powered development, SEO patterns, and product delivery practices from the CodeBay team.",
    images: ["/codebay.svg"]
  }
};

function formatPublishedDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function buildAuthorSegment(authorName: string): string {
  const base = authorName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "author";
}

function EngagementLine({ counts }: { counts: BlogEngagementCounts }) {
  const parts: string[] = [];
  if (counts.views > 0) parts.push(`${counts.views.toLocaleString()} views`);
  if (counts.reactions > 0) parts.push(`${counts.reactions} reactions`);
  parts.push(`${counts.comments} comment${counts.comments === 1 ? "" : "s"}`);
  return (
    <p className="text-xs text-muted-foreground" aria-label="Engagement">
      {parts.join(" · ")}
    </p>
  );
}

function buildBlogSchema(posts: Awaited<ReturnType<typeof fetchPublishedBlogPosts>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "CodeBay Blog",
    url: blogUrl,
    description:
      "Technical articles on AI development, engineering delivery, and practical SEO for modern software teams.",
    publisher: {
      "@type": "Organization",
      name: "CodeBay",
      url: siteUrl
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      url: `${blogUrl}/${buildAuthorSegment(post.authorName)}/${post.slug}`,
      author: {
        "@type": "Organization",
        name: post.authorName
      }
    }))
  };
}

type BlogPageSearchParams = {
  tag?: string | string[];
};

export default async function BlogPage({
  searchParams
}: {
  searchParams: Promise<BlogPageSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const posts = await fetchPublishedBlogPosts();
  const slugs = posts.map((p) => p.slug);
  const engagementCounts = await fetchBlogEngagementCounts(slugs);
  const blogSchema = buildBlogSchema(posts);

  const allTags = Array.from(
    new Set(
      posts.flatMap((post) => post.tags)
    )
  ).sort((a, b) => a.localeCompare(b));

  const rawTag = resolvedSearchParams.tag;
  const activeTag = Array.isArray(rawTag) ? rawTag[0] : rawTag ?? "";

  const filteredPosts =
    activeTag && allTags.includes(activeTag)
      ? posts.filter((post) => post.tags.includes(activeTag))
      : posts;

  const featuredPost = filteredPosts.find((post) => post.isFeatured) ?? filteredPosts[0];
  const latestPosts = featuredPost
    ? filteredPosts.filter((post) => post.slug !== featuredPost.slug)
    : filteredPosts;

  return (
    <>
      <main className="min-h-screen bg-background pb-20 pt-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
        />

        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
          <section className="rounded-3xl border border-border/60 bg-card/40 px-6 py-8 sm:px-8 sm:py-10 md:px-10">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">CodeBay Engineering</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
              Code, systems, and AI: real-world engineering stories
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              From low-level implementation details to high-level architecture and product trade-offs, we share hands-on
              tutorials, patterns, and opinions across web development, infrastructure, AI tooling, and everything in
              between.
            </p>
          </section>

          {allTags.length > 0 ? (
            <section className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Filter by tag</h2>
                {activeTag ? (
                  <Link
                    href="/blog"
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    Clear filter
                  </Link>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const isActive = tag === activeTag;
                  return (
                    <Link
                      key={tag}
                      href={isActive ? "/blog" : `/blog?tag=${encodeURIComponent(tag)}`}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/80 bg-secondary/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                      aria-label={isActive ? `Remove filter for ${tag}` : `Filter posts by ${tag}`}
                    >
                      {tag}
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}

          {featuredPost ? (
            <section className="mt-12">
              <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Featured post</h2>
              <Link
                href={`/blog/${buildAuthorSegment(featuredPost.authorName)}/${featuredPost.slug}`}
                className="mt-4 block rounded-3xl border border-border/70 bg-card px-6 py-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 sm:px-8 sm:py-8 md:px-10"
                aria-label={`Read featured article: ${featuredPost.title}`}
              >
                <article>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <time dateTime={featuredPost.publishedAt}>{formatPublishedDate(featuredPost.publishedAt)}</time>
                    <span aria-hidden="true">-</span>
                    <span>{featuredPost.readTimeMinutes} min read</span>
                  </div>
                  <div className="mt-2">
                    <EngagementLine counts={engagementCounts[featuredPost.slug]!} />
                  </div>
                  <h3 className="mt-4 max-w-4xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                    {featuredPost.title}
                  </h3>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {featuredPost.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="mt-6 inline-flex text-sm font-medium text-primary">
                    Read featured article {"->"}
                  </span>
                </article>
              </Link>
            </section>
          ) : null}

          <section className="mt-12">
            <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Latest articles</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {latestPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${buildAuthorSegment(post.authorName)}/${post.slug}`}
                  className="rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/35 sm:p-6"
                  aria-label={`Read article: ${post.title}`}
                >
                  <article>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
                      <span aria-hidden="true">-</span>
                      <span>{post.readTimeMinutes} min read</span>
                    </div>
                    <div className="mt-2">
                      <EngagementLine counts={engagementCounts[post.slug]!} />
                    </div>
                    <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground">{post.title}</h3>
                    <p className="mt-3 text-base leading-8 text-muted-foreground">{post.excerpt}</p>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
