/**
 * Base URLs for this app and sibling apps. Set in .env for local dev
 * (e.g. NEXT_PUBLIC_BLOG_URL=http://localhost:3001).
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

const siteUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://codingbay.community");
const blogUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_BLOG_URL, "https://codingbay.blog");
const mainUrl = normalizePublicUrl(process.env.NEXT_PUBLIC_MAIN_URL, "https://codebay.dev");

export { siteUrl, blogUrl, mainUrl };
