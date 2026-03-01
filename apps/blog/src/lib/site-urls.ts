/**
 * Base URLs for this app and sibling apps. Set in .env for local dev
 * (e.g. NEXT_PUBLIC_MAIN_URL=http://localhost:3000, NEXT_PUBLIC_COMMUNITY_URL=http://localhost:3002).
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codingbay.blog";
const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL ?? "https://codebay.dev";
const communityUrl = process.env.NEXT_PUBLIC_COMMUNITY_URL ?? "https://codingbay.community";

export { siteUrl, mainUrl, communityUrl };
