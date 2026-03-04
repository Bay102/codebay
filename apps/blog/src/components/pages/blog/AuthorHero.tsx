"use client";

import type { BlogAuthorProfile, BlogPost } from "@/lib/blog";
import { SurfaceCard } from "@codebay/ui";
import { ProfilePreviewPopover } from "@/components/profile/ProfilePreviewPopover";
import { communityUrl } from "@/lib/site-urls";

function buildAuthorSegment(authorName: string): string {
  const base = authorName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "author";
}

type AuthorHeroProps = {
  author: BlogAuthorProfile;
  posts: BlogPost[];
};

export function AuthorHero({ author, posts }: AuthorHeroProps) {
  const authorSegment = buildAuthorSegment(author.name);
  const featuredPosts = posts.filter((post) => post.isFeatured);
  const sourcePosts = featuredPosts.length > 0 ? featuredPosts : posts;
  const articles = sourcePosts.slice(0, 4).map((post) => ({
    title: post.title,
    href: `/${authorSegment}/${post.slug}`
  }));

  return (
    <SurfaceCard variant="hero">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Author page</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            {author.name}&apos;s blog
          </h1>
        </div>
        <ProfilePreviewPopover
          profile={{
            name: author.name,
            username: author.username,
            avatarUrl: author.avatarUrl
          }}
          sections={{
            articles,
            profileLinks: author.profileLinks
          }}
          authorPageHref={`${communityUrl}/${author.username}`}
          profileId={author.id}
        />
      </div>
      <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
        {author.bio?.trim() || "Engineering notes, practical guides, and implementation stories from the field."}
      </p>
      {author.techStack.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {author.techStack.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  );
}

