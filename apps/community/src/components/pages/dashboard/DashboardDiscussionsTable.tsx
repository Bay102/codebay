import Link from "next/link";
import { ExternalLink, MessageSquare } from "lucide-react";
import type { DiscussionListItem } from "@/lib/discussions";

type DashboardDiscussionsTableProps = {
  discussions: DiscussionListItem[];
  maxRows?: number;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function DashboardDiscussionsTable({
  discussions,
  maxRows = 8
}: DashboardDiscussionsTableProps) {
  const displayItems = discussions.slice(0, maxRows);

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Discussions
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/discussions/new"
            className="inline-flex items-center rounded-md border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/20"
          >
            Start a discussion
          </Link>
          <Link
            href="/discussions"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Browse all
            <MessageSquare className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {displayItems.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          You haven&apos;t started any discussions yet. Create one to get the conversation going.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/70">
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Comments
                </th>
                <th className="py-3 px-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Reactions
                </th>
                <th className="py-3 pl-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Created
                </th>
                <th className="py-3 pl-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((discussion) => (
                <tr
                  key={discussion.id}
                  className="border-b border-border/50 transition-colors last:border-b-0 hover:bg-background/50"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/discussions/${discussion.slug}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {discussion.title || "Untitled"}
                    </Link>
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-foreground">
                    {discussion.commentCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums text-foreground">
                    {discussion.reactionCount.toLocaleString()}
                  </td>
                  <td className="py-3 pl-2 text-muted-foreground">
                    {formatDate(discussion.createdAt)}
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <Link
                      href={`/discussions/${discussion.slug}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                      aria-label={`View ${discussion.title || "discussion"}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
