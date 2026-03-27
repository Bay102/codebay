import type { ReactNode } from "react";
import Link from "next/link";
import { Eye, MessageSquareText, Zap } from "lucide-react";
import { SurfaceCard } from "../SurfaceCard";
import { Tag } from "../Tag";
import { cn } from "../utils";
import { CardShareLinkButton } from "./CardShareLinkButton";
import type { DiscussionCardData } from "./types";

export type DiscussionCardVariant = "default" | "compact";

export interface DiscussionCardProps {
  discussion: DiscussionCardData;
  href: string;
  variant?: DiscussionCardVariant;
  showAuthor?: boolean;
  showAuthorAvatar?: boolean;
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
  showAuthorAvatar = false,
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

  const showFooterRow = (showTags && discussion.tags.length > 0) || showEngagement || Boolean(headerSlot);

  return (
    <SurfaceCard
      as="article"
      variant="card"
      className={cn(
        "relative flex h-full flex-col transition-all hover:border-border/40 hover:bg-card/80 hover:shadow-lg",
        spacing,
        className,
      )}
    >
      <CardShareLinkButton href={href} className="absolute right-2 top-2" />
      <Link href={href} className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1 flex-wrap items-stretch justify-between gap-3">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 pr-9">
              {showAuthor || showDate ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {showAuthorAvatar && discussion.authorAvatarUrl ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-[10px] font-medium text-foreground">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={discussion.authorAvatarUrl}
                        alt={`@${discussion.authorUsername} avatar`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </span>
                  ) : null}
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    {showAuthor ? <span className="truncate">@{discussion.authorUsername}</span> : null}
                    {showAuthor && showDate ? <span aria-hidden>·</span> : null}
                    {showDate ? (
                      <time dateTime={discussion.createdAt}>{formatDate(discussion.createdAt)}</time>
                    ) : null}
                  </span>
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

            {showFooterRow ? (
              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                {showTags && discussion.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {discussion.tags.map((tag) => (
                      <Tag key={tag} variant="tech">
                        #{tag}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <div />
                )}

                <div className="ml-auto flex shrink-0 items-center gap-2">
                  {headerSlot ? <div className="shrink-0">{headerSlot}</div> : null}
                  {headerSlot && showEngagement ? (
                    <span
                      className="h-3.5 w-px shrink-0 bg-border/70"
                      aria-hidden
                    />
                  ) : null}
                  {showEngagement ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                        <span className="tabular-nums">{discussion.viewCount}</span>
                        <span className="sr-only">views</span>
                      </span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                        <span className="tabular-nums">{discussion.commentCount}</span>
                        <span className="sr-only">comments</span>
                      </span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                        <span className="tabular-nums">{discussion.reactionCount}</span>
                        <span className="sr-only">reactions</span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {footerSlot ? <div className="mt-3 shrink-0">{footerSlot}</div> : null}
      </Link>
    </SurfaceCard>
  );
}

