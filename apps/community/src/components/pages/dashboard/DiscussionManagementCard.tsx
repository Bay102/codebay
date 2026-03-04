 "use client";

import { useState } from "react";
import Link from "next/link";
import type { DiscussionListItem } from "@/lib/discussions";
import { NewDiscussionForm } from "@/components/pages/dashboard/NewDiscussionForm";

type DiscussionManagementCardProps = {
  discussions: DiscussionListItem[];
  authorName: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function DiscussionManagementCard({ discussions, authorName }: DiscussionManagementCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Discussion management
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/discussions"
            className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-secondary/70"
          >
            Manage discussions
          </Link>
          <button
            type="button"
            aria-label={isCollapsed ? "Expand discussion management card" : "Collapse discussion management card"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/60 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary/80"
            onClick={() => setIsCollapsed((value) => !value)}
          >
            {isCollapsed ? "+" : "−"}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Start a new discussion</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Share a question, pattern, or update for the community to react to.
            </p>
            <div className="mt-3 rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4">
              <NewDiscussionForm authorName={authorName} showCancelButton={false} />
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent discussions
              </p>
              <Link
                href="/discussions"
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Browse all →
              </Link>
            </div>

            {discussions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You haven’t started any discussions yet. Create one to get the conversation going.
              </p>
            ) : (
              <div className="space-y-2">
                {discussions.map((d) => (
                  <Link
                    key={d.id}
                    href={`/discussions/${d.slug}`}
                    className="block rounded-xl border border-border/70 bg-background/70 p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-secondary/60"
                  >
                    <p className="font-medium text-foreground line-clamp-2">{d.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <time dateTime={d.createdAt}>{formatDate(d.createdAt)}</time>
                      <span aria-hidden>·</span>
                      <span>{d.commentCount} comments</span>
                      <span>{d.reactionCount} reactions</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
}
