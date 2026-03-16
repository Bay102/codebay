/**
 * Base URLs for this app and sibling apps. Set in .env for local dev
 * (e.g. NEXT_PUBLIC_COMMUNITY_SITE_URL=http://localhost:3002).
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

const siteUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_COMMUNITY_SITE_URL, "https://codingbay.community");
const mainUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_MAIN_URL, "https://codebay.solutions");
const communityUrl = siteUrl;

export { siteUrl, mainUrl, communityUrl };
