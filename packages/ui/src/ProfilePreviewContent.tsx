"use client";

import type { ReactNode } from "react";
import Link from "next/link";

/** Minimal profile data for the preview header */
export interface ProfilePreviewHeader {
  name: string;
  username: string;
  avatarUrl?: string | null;
}

export interface ProfilePreviewProject {
  title: string;
  description?: string | null;
  url?: string | null;
}

export interface ProfilePreviewArticle {
  title: string;
  href: string;
}

export interface ProfilePreviewLink {
  label: string;
  url: string;
}

/**
 * Optional sections. Pass only the sections you want to show.
 * Omit a section or pass empty array to hide it.
 */
export interface ProfilePreviewSections {
  bio?: string | null;
  techStack?: string[];
  featuredProjects?: ProfilePreviewProject[];
  articles?: ProfilePreviewArticle[];
  profileLinks?: ProfilePreviewLink[];
}

export interface ProfilePreviewFollowStats {
  followerCount: number;
  followingCount: number;
}

export interface ProfilePreviewContentProps {
  profile: ProfilePreviewHeader;
  /** Optional sections; only rendered when present and non-empty. */
  sections?: ProfilePreviewSections;
  /** Link to full profile/author page; when set, shows a footer link. */
  authorPageHref?: string;
  /** Label for the author page link (e.g. "View full author profile", "Open full profile"). */
  authorPageLabel?: string;
  /** Optional follow button slot (e.g. app-provided FollowButton). Rendered in header when provided. */
  followButton?: ReactNode;
  /** Optional follower/following counts to display under the name. */
  followStats?: ProfilePreviewFollowStats;
}

function buildInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "CB";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

/**
 * Shared profile preview content for use inside a popover or card.
 * Sections are optional; pass only the sections you want to display.
 */
export function ProfilePreviewContent({
  profile,
  sections = {},
  authorPageHref,
  authorPageLabel = "View full profile",
  followButton,
  followStats
}: ProfilePreviewContentProps) {
  const {
    bio,
    techStack = [],
    featuredProjects = [],
    articles = [],
    profileLinks = []
  } = sections;

  const hasFollowStats =
    typeof followStats?.followerCount === "number" || typeof followStats?.followingCount === "number";

  const formatCount = (count: number): string => {
    if (count >= 1_000_000) {
      return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (count >= 1_000) {
      return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return count.toString();
  };

  return (
    <>
      <div className="grid w-full grid-cols-[1fr_auto] items-start gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary text-sm font-semibold">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={`${profile.name} avatar`}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              buildInitials(profile.name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{profile.username}</p>
            {hasFollowStats ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {typeof followStats?.followerCount === "number" ? (
                  <span>
                    <span className="font-semibold text-foreground">
                      {formatCount(followStats.followerCount)}
                    </span>{" "}
                    follower{followStats.followerCount === 1 ? "" : "s"}
                  </span>
                ) : null}
                {typeof followStats?.followerCount === "number" &&
                typeof followStats?.followingCount === "number" ? (
                  <span className="mx-1.5 text-border">•</span>
                ) : null}
                {typeof followStats?.followingCount === "number" ? (
                  <span>
                    <span className="font-semibold text-foreground">
                      {formatCount(followStats.followingCount)}
                    </span>{" "}
                    following
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
        {followButton ? <div className="justify-self-end">{followButton}</div> : null}
      </div>

      {bio?.trim() ? (
        <p className="mt-3 line-clamp-3 text-xs leading-6 text-muted-foreground">{bio.trim()}</p>
      ) : null}

      {techStack.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/90">
            Tech stack
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {techStack.slice(0, 6).map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-border/60 bg-secondary/60 px-2.5 py-0.5 text-[10px] font-mono tracking-[0.16em] uppercase text-foreground/90"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {featuredProjects.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Featured projects
          </p>
          <div className="mt-1.5 space-y-1.5">
            {featuredProjects.map((project) => (
              <div
                key={project.title}
                className="rounded-lg border border-border/60 bg-background/60 p-2"
              >
                <p className="truncate text-xs font-medium text-foreground">{project.title}</p>
                {project.description ? (
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-muted-foreground">
                    {project.description}
                  </p>
                ) : null}
                {project.url ? (
                  <Link
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex text-[11px] font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Visit project
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {articles.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Featured articles
          </p>
          <div className="mt-1.5 space-y-1">
            {articles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="block truncate rounded-md px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60 hover:text-primary"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {profileLinks.length > 0 ? (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Links
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {profileLinks.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-md border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium text-foreground underline-offset-4 transition-colors hover:border-primary/50 hover:text-primary hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {authorPageHref ? (
        <div className="mt-3 border-t border-border/70 pt-2.5">
          <Link
            href={authorPageHref}
            className="inline-flex text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            {authorPageLabel}
          </Link>
        </div>
      ) : null}
    </>
  );
}
