import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogEngagement } from "@/components/pages/blog/BlogEngagement";
import { fetchBlogPostBySlug, fetchPublishedBlogPosts } from "@/lib/blog";
import { mainUrl, siteUrl } from "@/lib/site-urls";

export const dynamic = "force-dynamic";

type BlogPostPageParams = {
  author: string;
  slug: string;
};

type BlogPostPageProps = {
  params: Promise<BlogPostPageParams>;
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

export async function generateMetadata(
  { params }: BlogPostPageProps,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found"
    };
  }

  const authorSegment = buildAuthorSegment(post.authorName);

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: `/${authorSegment}/${post.slug}`
    },
    openGraph: {
      type: "article",
      url: `/${authorSegment}/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      authors: [post.authorName]
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await fetchPublishedBlogPosts();
  const relatedPosts = allPosts.filter((candidate) => candidate.slug !== post.slug).slice(0, 2);
  const authorSegment = buildAuthorSegment(post.authorName);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.authorName
    },
    publisher: {
      "@type": "Organization",
      name: "CodeBay",
      url: mainUrl
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/${authorSegment}/${post.slug}`
    },
    keywords: post.tags.join(", ")
  };

  return (
    <main className="min-h-screen bg-background pb-20 pt-10 sm:pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="rounded-3xl border border-border/60 bg-card/40 px-6 py-8 sm:px-8 md:px-10">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">CodeBay Insights</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
            <span aria-hidden="true">-</span>
            <span>{post.readTimeMinutes} min read</span>
            <span aria-hidden="true">-</span>
            <span>{post.authorName}</span>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8">
        <article className="rounded-3xl border border-border/70 bg-card px-6 py-8 shadow-sm sm:px-8 sm:py-10 md:px-10">
          <div className="space-y-10">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.heading}</h2>
                <div className="mt-4 space-y-4">
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.heading}-${paragraphIndex}`} className="text-base leading-8 text-muted-foreground sm:text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </section>

      <BlogEngagement slug={post.slug} postPath={`/${authorSegment}/${post.slug}`} />

      <section className="mx-auto mt-10 w-full max-w-5xl px-5 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Continue reading</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                href={`/${buildAuthorSegment(relatedPost.authorName)}/${relatedPost.slug}`}
                className="rounded-xl border border-border/80 bg-background/70 p-4 transition-colors hover:border-primary/40"
              >
                <p className="text-sm text-muted-foreground">{formatPublishedDate(relatedPost.publishedAt)}</p>
                <p className="mt-1 font-medium text-foreground">{relatedPost.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
