import { blogUrl } from "@/lib/site-urls";

export function buildPostUrl(authorName: string, slug: string): string {
  const base =
    authorName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "author";

  return `${blogUrl}/${base}/${slug}`;
}

