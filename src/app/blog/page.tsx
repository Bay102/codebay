import type { Metadata } from "next";
import Link from "next/link";
import { fetchPublishedBlogPosts } from "@/lib/blog";

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
      url: `${blogUrl}/${post.slug}`,
      author: {
        "@type": "Organization",
        name: post.authorName
      }
    }))
  };
}

export default async function BlogPage() {
  const posts = await fetchPublishedBlogPosts();
  const blogSchema = buildBlogSchema(posts);

  const featuredPost = posts.find((post) => post.isFeatured) ?? posts[0];
  const latestPosts = posts.filter((post) => post.slug !== featuredPost?.slug);

  return (
    <main className="min-h-screen bg-background pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            CodeBay
          </Link>
          <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <section className="rounded-3xl border border-border/60 bg-card/40 px-6 py-8 sm:px-8 sm:py-10 md:px-10">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">CodeBay Blog</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            Practical engineering insights for AI-powered product teams
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
            We publish implementation-focused content on software delivery, SEO for modern web applications, and
            product engineering decisions that help teams ship faster with confidence.
          </p>
        </section>

        {featuredPost ? (
          <section className="mt-12">
            <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Featured post</h2>
            <article className="mt-4 rounded-3xl border border-border/70 bg-card px-6 py-7 shadow-sm sm:px-8 sm:py-8 md:px-10">
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <time dateTime={featuredPost.publishedAt}>{formatPublishedDate(featuredPost.publishedAt)}</time>
                <span aria-hidden="true">-</span>
                <span>{featuredPost.readTimeMinutes} min read</span>
              </div>
              <h3 className="mt-4 max-w-4xl text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                <Link href={`/blog/${featuredPost.slug}`} className="transition-colors hover:text-primary">
                  {featuredPost.title}
                </Link>
              </h3>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{featuredPost.excerpt}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredPost.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="mt-6 inline-flex text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Read featured article {"->"}
              </Link>
            </article>
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">Latest articles</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {latestPosts.map((post) => (
              <article
                key={post.slug}
                className="rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/35 sm:p-6"
              >
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
                  <span aria-hidden="true">-</span>
                  <span>{post.readTimeMinutes} min read</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-foreground">
                  <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-primary">
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-3 text-base leading-8 text-muted-foreground">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
