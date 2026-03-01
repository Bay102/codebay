/**
 * Base URLs for this app and sibling apps. Set in .env so local dev can use
 * localhost (e.g. NEXT_PUBLIC_BLOG_URL=http://localhost:3001).
 */
function normalizePublicUrl(value: string | undefined, fallback: string): string {
  const raw = value?.trim();
  const candidate = raw
    ? /^https?:\/\//i.test(raw)
      ? raw
      : `https://${raw}`
    : fallback;

  try {
    return new URL(candidate).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

const siteUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://codebay.dev");
const blogUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_BLOG_URL, "https://codingbay.blog");
const communityUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_COMMUNITY_URL, "https://codingbay.community");

export { siteUrl, blogUrl, communityUrl };
