import Link from "next/link";
import { SurfaceCard } from "@codebay/ui";
import { buildPostUrl, fetchForYouBlogPosts, fetchForYouDiscussions } from "@/lib/landing";
import { fetchAllTags } from "@/lib/tags";
import { getPreferredTagIdsAction } from "@/app/actions";
import { PreferredTopicsDialog } from "@/components/pages/community/PreferredTopicsDialog";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ForYouSectionProps = {
  userId: string | null;
};

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

export async function ForYouSection({ userId }: ForYouSectionProps) {
  if (!userId) {
    return (
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <SurfaceCard as="div" variant="card" className="mt-3">
          <p className="text-sm text-muted-foreground">
            <Link href="/join" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            and set your preferred topics in{" "}
            <Link href="/dashboard/profile" className="font-medium text-primary underline-offset-4 hover:underline">
              profile settings
            </Link>{" "}
            to see blog posts and discussions tailored to your interests.
          </p>
        </SurfaceCard>
      </section>
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const [posts, discussions, allowedTags, preferredTagIds] = await Promise.all([
    fetchForYouBlogPosts(supabase, userId, 4),
    fetchForYouDiscussions(supabase, userId, 4),
    fetchAllTags(supabase),
    getPreferredTagIdsAction()
  ]);

  const hasContent = posts.length > 0 || discussions.length > 0;
  if (!hasContent) {
    return (
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <SurfaceCard as="div" variant="card" className="mt-3">
          <p className="text-sm text-muted-foreground">
            Choose topics you follow in{" "}
            <Link href="/dashboard/profile" className="font-medium text-primary underline-offset-4 hover:underline">
              profile settings
            </Link>{" "}
            to see relevant blog posts and discussions here.
          </p>
        </SurfaceCard>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">For you</h2>
        <PreferredTopicsDialog allowedTags={allowedTags} initialPreferredTagIds={preferredTagIds} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Based on your preferred topics</p>
      {posts.length > 0 ? (
        <>
          <p className="mt-3 text-xs font-medium text-muted-foreground">Blog posts</p>
          <div className="mt-1 grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <SurfaceCard as="article" key={post.id} variant="card">
                <Link href={buildPostUrl(post.authorName, post.slug)} className="block">
                  <p className="text-xs text-muted-foreground">
                    {post.publishedAt ? formatDate(post.publishedAt) : "Unpublished"}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground" aria-label="Engagement">
                    {formatEngagement(post.views, post.reactions, post.comments)}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">{post.title}</h3>
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
        </>
      ) : null}
      {discussions.length > 0 ? (
        <>
          <p className="mt-4 text-xs font-medium text-muted-foreground">Discussions</p>
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            {discussions.map((d) => (
              <SurfaceCard as="article" key={d.id} variant="card">
                <Link href={`/discussions/${d.slug}`} className="block">
                  <p className="text-xs text-muted-foreground">
                    @{d.authorUsername} · {formatDate(d.createdAt)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {d.commentCount} comments · {d.reactionCount} reactions
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">{d.title}</h3>
                  {d.body ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground sm:text-sm">
                      {d.body}
                    </p>
                  ) : null}
                  {d.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {d.tags.slice(0, 3).map((tag) => (
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
        </>
      ) : null}
    </section>
  );
}
