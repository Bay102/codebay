import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { blogUrl } from "@/lib/site-urls";
import { buildBlogSummary, fetchDashboardProfile, fetchUserBlogPostsWithStats } from "@/lib/dashboard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FocusButton } from "@/components/shared/buttons/FocusButton";
import { DashboardBlogPostCard } from "@/components/pages/dashboard/blog/DashboardBlogPostCard";

export const metadata: Metadata = {
  title: "Blog Dashboard",
  description: "Manage your drafts, publish posts, and track engagement."
};

type StatusFilter = "all" | "draft" | "published";

const MAX_FEATURED_POSTS = 4;

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

  const { data: profile } = await supabase
    .from("community_users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/blog");
  if (profile?.username) {
    revalidatePath(`/blog/${profile.username}`);
  }
}

async function updatePostFeaturedAction(formData: FormData) {
  "use server";

  const postId = formData.get("postId");
  const nextFeaturedRaw = formData.get("nextFeatured");
  if (typeof postId !== "string" || typeof nextFeaturedRaw !== "string") {
    return;
  }

  const nextFeatured = nextFeaturedRaw === "true";

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

  const { data: post, error: postError } = await supabase
    .from("blog_posts")
    .select("id,status,is_featured")
    .eq("id", postId)
    .eq("author_id", user.id)
    .maybeSingle();

  if (postError || !post) {
    return;
  }

  if (nextFeatured) {
    // Featured slots are only shown on the public blog when the post is published.
    if (post.status !== "published") {
      return;
    }

    if (!post.is_featured) {
      const { count } = await supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", user.id)
        .eq("status", "published")
        .eq("is_featured", true);

      const featuredCount = count ?? 0;
      if (featuredCount >= MAX_FEATURED_POSTS) {
        const { data: oldestFeaturedRows } = await supabase
          .from("blog_posts")
          .select("id")
          .eq("author_id", user.id)
          .eq("status", "published")
          .eq("is_featured", true)
          .order("published_at", { ascending: true })
          .limit(1);

        const oldestFeatured = oldestFeaturedRows?.[0];
        if (oldestFeatured?.id) {
          await supabase.from("blog_posts").update({ is_featured: false }).eq("id", oldestFeatured.id);
        }
      }
    }

    await supabase
      .from("blog_posts")
      .update({ is_featured: true })
      .eq("id", postId)
      .eq("author_id", user.id);
  } else {
    if (post.is_featured) {
      await supabase
        .from("blog_posts")
        .update({ is_featured: false })
        .eq("id", postId)
        .eq("author_id", user.id);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/blog");

  const { data: profile } = await supabase
    .from("community_users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.username) {
    revalidatePath(`/blog/${profile.username}`);
  }
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
  const featuredPublishedCount = posts.filter((post) => post.status === "published" && post.isFeatured).length;
  const summary = buildBlogSummary(posts);
  const params = await searchParams;
  const filter = resolveStatusFilter(params.status);
  const filteredPosts = filter === "all" ? posts : posts.filter((post) => post.status === filter);
  const publicBlogUrl = profile.username ? `${blogUrl}/${profile.username}` : blogUrl;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl p-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">CodingBay Community</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Blog dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your drafts and published posts from the community app.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <FocusButton href="/dashboard/blog/new" colorVariant="primary">
              New post
            </FocusButton>
            <FocusButton href="/dashboard" borderVariant="bordered" glassVariant="off">
              Back to dashboard
            </FocusButton>
            <FocusButton href={publicBlogUrl} borderVariant="bordered" glassVariant="off">
              View my blog
            </FocusButton>
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
              <FocusButton
                key={status}
                href={href}
                radiusVariant="pill"
                colorVariant={isActive ? "primary" : "plain"}
                borderVariant={isActive ? "borderless" : "bordered"}
                sizeVariant="xs"
              >
                {status === "all" ? "All posts" : status === "draft" ? "Drafts" : "Published"}
              </FocusButton>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Your blog page shows up to {MAX_FEATURED_POSTS} featured published posts. Featuring another post replaces
          the oldest featured one.
        </p>

        <div className="mt-6 space-y-3">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const publicPostUrl = `${blogUrl}/${buildAuthorSegment(post.authorName)}/${post.slug}`;
              const nextStatus: "draft" | "published" = post.status === "published" ? "draft" : "published";

              return (
                <DashboardBlogPostCard
                  key={post.id}
                  post={post}
                  publicPostUrl={publicPostUrl}
                  nextStatus={nextStatus}
                  featuredPublishedCount={featuredPublishedCount}
                  maxFeaturedPosts={MAX_FEATURED_POSTS}
                  updatePostFeaturedAction={updatePostFeaturedAction}
                  updatePostStatusAction={updatePostStatusAction}
                />
              );
            })
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/70 p-8 text-center">
              <p className="text-base font-medium text-foreground">No posts found for this filter.</p>
              <p className="mt-2 text-sm text-muted-foreground">Create a new draft to get started.</p>
              <div className="mt-4">
                <FocusButton href="/dashboard/blog/new" colorVariant="primary">
                  New post
                </FocusButton>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
