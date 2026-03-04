import type { Metadata } from "next";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { blogUrl } from "@/lib/site-urls";
import { buildBlogSummary, fetchDashboardProfile, fetchUserBlogPostsWithStats } from "@/lib/dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog Dashboard",
  description: "Manage your drafts, publish posts, and track engagement."
};

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "draft" | "published";

function resolveStatusFilter(rawFilter: string | string[] | undefined): StatusFilter {
  const value = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter;
  if (value === "draft" || value === "published") {
    return value;
  }
  return "all";
}

function buildAuthorSegment(value: string): string {
  const base = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "author";
}

async function updatePostStatusAction(formData: FormData) {
  "use server";

  const postId = formData.get("postId");
  const nextStatus = formData.get("nextStatus");
  if (typeof postId !== "string" || typeof nextStatus !== "string") {
    return;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  await supabase
    .from("blog_posts")
    .update({
      status: nextStatus,
      published_at: nextStatus === "published" ? new Date().toISOString() : null
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/blog");
}

export default async function CommunityBlogDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    redirect("/join");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/?next=/dashboard/blog");
  }

  const profile = await fetchDashboardProfile(supabase, user.id);
  if (!profile) {
    redirect("/join?redirect=/dashboard/blog");
  }

  const posts = await fetchUserBlogPostsWithStats(supabase, user.id);
  const summary = buildBlogSummary(posts);
  const params = await searchParams;
  const filter = resolveStatusFilter(params.status);
  const filteredPosts = filter === "all" ? posts : posts.filter((post) => post.status === filter);
  const publicBlogUrl = profile.username ? `${blogUrl}/author/${profile.username}` : blogUrl;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl p-3 sm:px-6 md:py-10 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">CodingBay Community</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Blog dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your drafts and published posts from the community app.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/blog/new"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              New post
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70"
            >
              Back to dashboard
            </Link>
            <Link
              href={publicBlogUrl}
              className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-secondary/70"
            >
              View my blog
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-xs text-muted-foreground">Total posts</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.totalPosts}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-xs text-muted-foreground">Published</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.publishedCount}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-xs text-muted-foreground">Drafts</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.draftCount}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-xs text-muted-foreground">Reactions</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.totalReactions}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-4">
            <p className="text-xs text-muted-foreground">Comments</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{summary.totalComments}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", "draft", "published"] as StatusFilter[]).map((status) => {
            const href = status === "all" ? "/dashboard/blog" : `/dashboard/blog?status=${status}`;
            const isActive = filter === status;
            return (
              <Link
                key={status}
                href={href}
                className={`inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors ${isActive
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  }`}
              >
                {status === "all" ? "All posts" : status === "draft" ? "Drafts" : "Published"}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const publicPostUrl = `${blogUrl}/${buildAuthorSegment(post.authorName)}/${post.slug}`;
              const nextStatus = post.status === "published" ? "draft" : "published";

              return (
                <article key={post.id} className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-foreground">{post.title}</p>
                        <span className="rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                          {post.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Updated {new Date(post.updatedAt ?? post.createdAt ?? new Date().toISOString()).toLocaleString()}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {post.views.toLocaleString()} views · {post.reactions} reactions · {post.comments} comments
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/blog/edit/${post.id}`}
                        className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-secondary/70"
                      >
                        Edit
                      </Link>
                      <Link
                        href={publicPostUrl}
                        className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-secondary/70"
                      >
                        View
                      </Link>
                      <form action={updatePostStatusAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="nextStatus" value={nextStatus} />
                        <button
                          type="submit"
                          className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          {post.status === "published" ? "Move to draft" : "Publish"}
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/70 p-8 text-center">
              <p className="text-base font-medium text-foreground">No posts found for this filter.</p>
              <p className="mt-2 text-sm text-muted-foreground">Create a new draft to get started.</p>
              <Link
                href="/dashboard/blog/new"
                className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                New post
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
