import { blogUrl } from "@/lib/site-urls";

function authorUrlSegment(authorName: string): string {
  return (
    authorName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "author"
  );
}

/** Relative app path for a published community blog post. */
export function buildBlogPostPath(authorName: string, slug: string): string {
  return `/blog/${authorUrlSegment(authorName)}/${slug}`;
}

export function buildPostUrl(authorName: string, slug: string): string {
  return `${blogUrl}/${authorUrlSegment(authorName)}/${slug}`;
}

