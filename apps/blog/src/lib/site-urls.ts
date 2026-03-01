/**
 * Base URLs for this app and sibling apps. Set in .env for local dev
 * (e.g. NEXT_PUBLIC_MAIN_URL=http://localhost:3000, NEXT_PUBLIC_COMMUNITY_URL=http://localhost:3002).
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

const siteUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://codingbay.blog");
const mainUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_MAIN_URL, "https://codebay.solutions");
const communityUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_COMMUNITY_URL, "https://codingbay.community");

export { siteUrl, mainUrl, communityUrl };
