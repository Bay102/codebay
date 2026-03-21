import { FocusButton } from "@/components/shared/buttons/FocusButton";
import type { DashboardBlogPostStats } from "@/lib/dashboard";
import { Star, StarOff } from "lucide-react";

type UpdatePostFeaturedAction = (formData: FormData) => Promise<void>;
type UpdatePostStatusAction = (formData: FormData) => Promise<void>;

export type DashboardBlogPostCardProps = {
  post: DashboardBlogPostStats;
  publicPostUrl: string;
  nextStatus: "draft" | "published";
  featuredPublishedCount: number;
  maxFeaturedPosts: number;
  updatePostFeaturedAction: UpdatePostFeaturedAction;
  updatePostStatusAction: UpdatePostStatusAction;
};

export function DashboardBlogPostCard({
  post,
  publicPostUrl,
  nextStatus,
  featuredPublishedCount,
  maxFeaturedPosts,
  updatePostFeaturedAction,
  updatePostStatusAction
}: DashboardBlogPostCardProps) {
  return (
    <article className="border border-border/70 bg-card/70 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-foreground">{post.title}</p>
            <span className="rounded-full border border-border/80 bg-background px-2.5 py-1 text-xs uppercase tracking-wide text-muted-foreground">
              {post.status}
            </span>
            {post.status === "published" && post.isFeatured ? (
              <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                Featured
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Updated{" "}
            {new Date(post.updatedAt ?? post.createdAt ?? new Date().toISOString()).toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {post.views.toLocaleString()} views &middot; {post.reactions} reactions &middot; {post.comments} comments
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <FocusButton href={`/dashboard/blog/edit/${post.id}`} borderVariant="bordered">
            Edit
          </FocusButton>
          <FocusButton href={publicPostUrl} borderVariant="bordered">
            View
          </FocusButton>

          {post.status === "published" ? (
            post.isFeatured ? (
              <form action={updatePostFeaturedAction}>
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="nextFeatured" value="false" />
                <FocusButton
                  type="submit"
                  borderVariant="bordered"
                  iconOnly
                  colorVariant="plain"
                  aria-label="Unfeature post"
                  title="Unfeature post"
                  icon={<StarOff className="h-4 w-4" aria-hidden />}
                />
              </form>
            ) : (
              <form action={updatePostFeaturedAction}>
                <input type="hidden" name="postId" value={post.id} />
                <input type="hidden" name="nextFeatured" value="true" />
                <FocusButton
                  type="submit"
                  colorVariant="primary"
                  borderVariant="borderless"
                  iconOnly
                  aria-label={
                    featuredPublishedCount >= maxFeaturedPosts ? "Feature (replaces oldest)" : "Feature"
                  }
                  title={
                    featuredPublishedCount >= maxFeaturedPosts ? "Feature (replaces oldest)" : "Feature"
                  }
                  icon={<Star className="h-4 w-4" aria-hidden />}
                />
              </form>
            )
          ) : (
            <FocusButton
              type="button"
              disabled
              borderVariant="bordered"
              aria-label="Publish to feature"
              iconOnly
              title="Publish to feature"
              icon={<Star className="h-4 w-4" aria-hidden />}
            />
          )}

          <form action={updatePostStatusAction}>
            <input type="hidden" name="postId" value={post.id} />
            <input type="hidden" name="nextStatus" value={nextStatus} />
            <FocusButton type="submit" colorVariant="primary">
              {post.status === "published" ? "Move to draft" : "Publish"}
            </FocusButton>
          </form>
        </div>
      </div>
    </article>
  );
}

