import type { ReactNode } from "react";
import Link from "next/link";
import { SurfaceCard } from "../SurfaceCard";
import { Tag } from "../Tag";
import { cn } from "../utils";
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

function formatEngagement(post: BlogPostCardData): string {
  const parts: string[] = [];
  if (post.views > 0) parts.push(`${post.views.toLocaleString()} views`);
  if (post.reactions > 0) parts.push(`${post.reactions} reactions`);
  parts.push(`${post.comments} comment${post.comments === 1 ? "" : "s"}`);
  return parts.join(" · ");
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

  return (
    <Container
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

              {showEngagement ? (
                <p className="mt-1 text-[11px] text-muted-foreground" aria-label="Engagement">
                  {formatEngagement(post)}
                </p>
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

            {showTags && post.tags.length > 0 ? (
              <div className="mt-auto flex flex-wrap gap-1 pt-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} variant="muted">
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
    </Container>
  );
}

