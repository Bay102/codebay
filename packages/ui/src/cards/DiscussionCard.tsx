import type { ReactNode } from "react";
import Link from "next/link";
import { SurfaceCard } from "../SurfaceCard";
import { Tag } from "../Tag";
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
        "flex h-full flex-col transition-all hover:shadow-lg hover:border-border/40 hover:bg-card/80",
        spacing,
        className,
      )}
    >
      <Link href={href} className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1 flex-wrap items-stretch justify-between gap-3">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1">
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
            </div>

            {showTags && discussion.tags.length > 0 ? (
              <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                {discussion.tags.map((tag) => (
                  <Tag key={tag} variant="tech">
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : null}
          </div>

          {headerSlot ? <div className="shrink-0">{headerSlot}</div> : null}
        </div>

        {footerSlot ? <div className="mt-3 shrink-0">{footerSlot}</div> : null}
      </Link>
    </SurfaceCard>
  );
}

