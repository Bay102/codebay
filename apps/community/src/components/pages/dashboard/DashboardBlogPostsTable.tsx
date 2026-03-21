import Link from "next/link";
import { ExternalLink, FileText, Pencil } from "lucide-react";
import type { DashboardBlogPostStats } from "@/lib/dashboard";
import { buildPostUrl } from "@/lib/blog-urls";
import { FocusButton } from "@/components/shared/buttons/FocusButton";

type DashboardBlogPostsTableProps = {
  posts: DashboardBlogPostStats[];
  maxRows?: number;
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function DashboardBlogPostsTable({
  posts,
  maxRows = 8
}: DashboardBlogPostsTableProps) {
  const displayPosts = posts.slice(0, maxRows);

  return (
    <div className="border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Blog posts
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <FocusButton
            href="/dashboard/blog/new"
            colorVariant="primary"
            borderVariant="bordered"
            radiusVariant="square"
            sizeVariant="xs"
          >
            New blog post
          </FocusButton>
          <Link
            href="/dashboard/blog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Manage all
            <FileText className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {displayPosts.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No posts yet. Create your first post from the blog dashboard.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/70">
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title
                </th>
                <th className="py-3 px-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Views
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Reactions
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Comments
                </th>
                <th className="py-3 pl-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Updated
                </th>
                <th className="py-3 pl-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayPosts.map((post) => {
                const viewUrl = buildPostUrl(post.authorName, post.slug);
                const editUrl = `/dashboard/blog/edit/${post.id}`;
                const isPublished = post.status === "published";

                return (
                  <tr
                    key={post.id}
                    className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-background/50"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={editUrl}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {post.title || "Untitled"}
                      </Link>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isPublished
                          ? "border border-primary/30 bg-primary/10 text-primary"
                          : "border border-border/70 bg-muted/50 text-muted-foreground"
                          }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-foreground">
                      {post.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-foreground">
                      {post.reactions.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-foreground">
                      {post.comments.toLocaleString()}
                    </td>
                    <td className="py-3 pl-2 text-muted-foreground">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={editUrl}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                          aria-label={`Edit ${post.title || "post"}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {isPublished && (
                          <Link
                            href={viewUrl}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                            aria-label={`View ${post.title || "post"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
