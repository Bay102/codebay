import type { ReactNode } from "react";
import Link from "next/link";
import { Eye, MessageSquareText, Zap } from "lucide-react";
import { SurfaceCard } from "../SurfaceCard";
import { Tag } from "../Tag";
import { cn } from "../utils";
import { CardShareLinkButton } from "./CardShareLinkButton";
import type { BlogPostCardData } from "./types";

export type BlogPostCardVariant = "default" | "compact" | "list";

export interface BlogPostCardProps {
  post: BlogPostCardData;
  href: string;
  variant?: BlogPostCardVariant;
  showAuthor?: boolean;
  showAuthorAvatar?: boolean;
  showDate?: boolean;
  showEngagement?: boolean;
  showTags?: boolean;
  headerSlot?: ReactNode;
  footerSlot?: ReactNode;
  className?: string;
}

function formatPublishedDate(date: string | null): string {
  if (!date) return "Unpublished";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function BlogPostCard({
  post,
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
}: BlogPostCardProps) {
  const Container = SurfaceCard;

  const spacing =
    variant === "compact"
      ? "p-4"
      : variant === "list"
        ? "p-4 sm:p-5"
        : "";

  const showFooterRow = (showTags && post.tags.length > 0) || showEngagement;

  return (
    <Container
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
              {showDate || showAuthor ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {showAuthorAvatar && post.authorAvatarUrl ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/70 text-[10px] font-medium text-foreground">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.authorAvatarUrl}
                        alt={`${post.authorName} avatar`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </span>
                  ) : null}
                  <span className="flex min-w-0 items-center gap-2">
                    {showAuthor ? (
                      <span className="truncate font-medium text-foreground">{post.authorName}</span>
                    ) : null}
                    {showAuthor && showDate ? <span aria-hidden>·</span> : null}
                    {showDate && post.publishedAt ? (
                      <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
                    ) : showDate ? (
                      <span>{formatPublishedDate(null)}</span>
                    ) : null}
                  </span>
                </div>
              ) : null}

              <h3 className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                {post.title}
              </h3>

              {post.excerpt ? (
                <p className="mt-2 line-clamp-3 text-xs leading-6 text-muted-foreground sm:text-sm">
                  {post.excerpt}
                </p>
              ) : null}
            </div>

            {showFooterRow ? (
              <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3">
                {showTags && post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Tag key={tag} variant="tech">
                        #{tag}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <div />
                )}

                {showEngagement ? (
                  <div className="ml-auto flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground" aria-label="Engagement">
                    {post.views > 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                        <span className="tabular-nums">{post.views.toLocaleString()}</span>
                        <span className="sr-only">views</span>
                      </span>
                    ) : null}

                    {post.views > 0 ? <span aria-hidden>·</span> : null}

                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                      <span className="tabular-nums">{post.reactions}</span>
                      <span className="sr-only">reactions</span>
                    </span>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
                      <span className="tabular-nums">{post.comments}</span>
                      <span className="sr-only">comments</span>
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {headerSlot ? <div className="shrink-0">{headerSlot}</div> : null}
        </div>

        {footerSlot ? <div className="mt-3 shrink-0">{footerSlot}</div> : null}
      </Link>
    </Container>
  );
}

