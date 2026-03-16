/**
 * Base URLs for this app and sibling apps. Set in .env so local dev can use
 * localhost (e.g. NEXT_PUBLIC_SITE_URL=http://localhost:3000).
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

const siteUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://codebay.solutions");
const communityUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_COMMUNITY_URL, "https://codingbay.community");
const blogUrl = `${communityUrl}/blog`;

export { siteUrl, communityUrl, blogUrl };
