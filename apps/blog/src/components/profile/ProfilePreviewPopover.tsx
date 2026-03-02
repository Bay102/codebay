"use client";

import * as React from "react";
import Link from "next/link";

import type { BlogFeaturedProject } from "@/lib/blog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Minimal profile data required for the popover header */
export interface ProfilePreviewHeader {
  name: string;
  username: string;
  avatarUrl?: string | null;
}

export interface ProfilePreviewProject extends Pick<BlogFeaturedProject, "title" | "description" | "url"> {}

export interface ProfilePreviewArticle {
  title: string;
  href: string;
}

export interface ProfilePreviewLink {
  label: string;
  url: string;
}

/**
 * Optional content sections. Pass only the sections you want to show.
 * Different pages can show different combinations (e.g. author page vs comment author).
 */
export interface ProfilePreviewSections {
  /** Bio text - omit to hide */
  bio?: string | null;
  /** Tech stack chips - omit to hide */
  techStack?: string[];
  /** Full list of featured projects */
  featuredProjects?: ProfilePreviewProject[];
  /** Articles/posts with links */
  articles?: ProfilePreviewArticle[];
  /** Profile links (e.g. GitHub, Twitter) */
  profileLinks?: ProfilePreviewLink[];
}

export interface ProfilePreviewPopoverProps {
  profile: ProfilePreviewHeader;
  /** Optional sections to display. Omit a section to hide it. */
  sections?: ProfilePreviewSections;
  /** Link to full profile/author page */
  authorPageHref?: string;
  children?: React.ReactNode;
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

export function ProfilePreviewPopover({ profile, sections = {}, authorPageHref, children }: ProfilePreviewPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { bio, techStack = [], featuredProjects = [], articles = [], profileLinks = [] } = sections;

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 120);
  };

  const handleTriggerMouseEnter = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  const handleTriggerMouseLeave = () => {
    scheduleClose();
  };

  const handleContentMouseEnter = () => {
    clearCloseTimeout();
  };

  const handleContentMouseLeave = () => {
    scheduleClose();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-16 w-16 items-center justify-center rounded-full border border-border/70 bg-secondary text-base font-semibold sm:h-20 sm:w-20"
          aria-label={`View ${profile.name}'s profile`}
          onMouseEnter={handleTriggerMouseEnter}
          onMouseLeave={handleTriggerMouseLeave}
          onClick={() => setOpen((previous) => !previous)}
        >
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
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="right"
        sideOffset={12}
        className="w-80 max-h-[min(80dvh,480px)] overflow-y-auto rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur"
        onMouseEnter={handleContentMouseEnter}
        onMouseLeave={handleContentMouseLeave}
      >
        <div className="flex items-start gap-3">
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
          </div>
        </div>

        {bio?.trim() ? (
          <p className="mt-3 line-clamp-3 text-xs leading-6 text-muted-foreground">{bio.trim()}</p>
        ) : null}

        {techStack.length > 0 ? (
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tech stack</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {techStack.slice(0, 6).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border/70 bg-background/80 px-2 py-1 text-[10px] text-foreground"
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
                <div key={project.title} className="rounded-lg border border-border/60 bg-background/60 p-2">
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
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Articles</p>
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
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Links</p>
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
              View full author profile
            </Link>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
