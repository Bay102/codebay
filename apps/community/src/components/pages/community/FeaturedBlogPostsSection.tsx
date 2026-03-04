import Link from "next/link";
import { SurfaceCard } from "@codebay/ui";
import { buildPostUrl, fetchFeaturedBlogPosts } from "@/lib/landing";

export async function FeaturedBlogPostsSection() {
  const posts = await fetchFeaturedBlogPosts(4);

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Featured blog posts</h2>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <SurfaceCard as="article" key={post.id} variant="card">
            <Link href={buildPostUrl(post.authorName, post.slug)} className="block">
              <p className="text-xs text-muted-foreground">
                {post.publishedAt ? formatDate(post.publishedAt) : "Unpublished"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground" aria-label="Engagement">
                {formatEngagement(post.views, post.reactions, post.comments)}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                {post.title}
              </h3>
              {post.excerpt ? (
                <p className="mt-2 line-clamp-3 text-xs leading-6 text-muted-foreground sm:text-sm">
                  {post.excerpt}
                </p>
              ) : null}
              {post.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-border/70 bg-secondary/60 px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatEngagement(views: number, reactions: number, comments: number): string {
  const parts: string[] = [];
  if (views > 0) parts.push(`${views.toLocaleString()} views`);
  if (reactions > 0) parts.push(`${reactions} reactions`);
  parts.push(`${comments} comment${comments === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

