import type { ReactNode } from "react";
import Link from "next/link";
import { SurfaceCard } from "../SurfaceCard";
import { cn } from "../utils";
import type { DiscussionCardData } from "./types";

export type DiscussionCardVariant = "default" | "compact";

export interface DiscussionCardProps {
  discussion: DiscussionCardData;
  href: string;
  variant?: DiscussionCardVariant;
  showAuthor?: boolean;
  showDate?: boolean;
  showEngagement?: boolean;
  showTags?: boolean;
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  className?: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function DiscussionCard({
  discussion,
  href,
  variant = "default",
  showAuthor = true,
  showDate = true,
  showEngagement = true,
  showTags = true,
  headerSlot,
  footerSlot,
  className,
}: DiscussionCardProps) {
  const spacing =
    variant === "compact"
      ? "p-4"
      : "";

  return (
    <SurfaceCard
      as="article"
      variant="card"
      className={cn(
        "transition-all hover:shadow-lg hover:border-border/40 hover:bg-card/80",
        spacing,
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {showAuthor || showDate || showEngagement ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {showAuthor ? <span>@{discussion.authorUsername}</span> : null}
                {showAuthor && showDate ? <span aria-hidden>·</span> : null}
                {showDate ? (
                  <time dateTime={discussion.createdAt}>{formatDate(discussion.createdAt)}</time>
                ) : null}
                {showEngagement ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>
                      {discussion.commentCount} comments
                    </span>
                    <span>{discussion.reactionCount} reactions</span>
                  </>
                ) : null}
              </div>
            ) : null}

            <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">
              {discussion.title}
            </h3>

            {discussion.body ? (
              <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground sm:text-sm">
                {discussion.body}
              </p>
            ) : null}

            {showTags && discussion.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {discussion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-xs font-medium tracking-[0.08em] uppercase text-foreground/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {headerSlot ? <div className="shrink-0">{headerSlot}</div> : null}
        </div>

        {footerSlot ? <div className="mt-3">{footerSlot}</div> : null}
      </Link>
    </SurfaceCard>
  );
}

