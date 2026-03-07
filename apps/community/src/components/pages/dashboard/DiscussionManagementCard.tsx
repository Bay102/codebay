"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatedCardSection, DiscussionCard } from "@codebay/ui";
import type { DiscussionListItem } from "@/lib/discussions";
import type { TagOption } from "@/lib/tags";
import { NewDiscussionForm } from "@/components/pages/dashboard/NewDiscussionForm";
import { mapDiscussionListItemToDiscussionCardData } from "@/lib/ui-mappers";

type DiscussionManagementCardProps = {
  discussions: DiscussionListItem[];
  authorName: string;
  allowedTags?: TagOption[];
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function DiscussionManagementCard({ discussions, authorName, allowedTags = [] }: DiscussionManagementCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">

      <div className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
        <button
          type="button"
          onClick={() => setIsFormOpen((open) => !open)}
          aria-expanded={isFormOpen}
          aria-controls="new-discussion-form"
          id="new-discussion-toggle"
          className="flex w-full flex-col items-start gap-1 rounded-lg text-left transition-colors hover:bg-secondary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex w-full items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Start a new discussion</p>
            {isFormOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
          </span>
          <p className="text-xs text-muted-foreground">
            Share a question, pattern, or update for the community to react to.
          </p>
        </button>

        {isFormOpen && (
          <div
            id="new-discussion-form"
            role="region"
            aria-labelledby="new-discussion-toggle"
            className="mt-3 rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4"
          >
            <NewDiscussionForm
              authorName={authorName}
              allowedTags={allowedTags}
              showCancelButton
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        )}
      </div>

      <article className="rounded-2xl border border-border/70 bg-card/70 p-5 sm:p-6">
        <div className="flex flex-row flex-nowrap items-center justify-between gap-3">
          <h2 className="min-w-0 shrink text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            My Latest Discussions
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={isCollapsed ? "Expand discussion management card" : "Collapse discussion management card"}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-background/60 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary/80"
              onClick={() => setIsCollapsed((value) => !value)}
            >
              {isCollapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="mt-5">
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
              <AnimatedCardSection
                as="div"
                items={discussions.map(mapDiscussionListItemToDiscussionCardData)}
                columns={{ base: 1 }}
                renderItem={(discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    discussion={discussion}
                    href={`/discussions/${discussion.slug}`}
                    showAuthor={false}
                    showDate
                    showEngagement
                    showTags
                    className="bg-background/70"
                  />
                )}
              />
            )}
          </div>
        )}
      </article>


    </div>
  );
}
