/**
 * Base URLs for this app and sibling apps. Set in .env for local dev
 * (e.g. NEXT_PUBLIC_MAIN_URL=http://localhost:3000).
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codingbay.blog";
const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL ?? "https://codebay.dev";

export { siteUrl, mainUrl };
