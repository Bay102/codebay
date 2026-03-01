/**
 * Base URLs for this app and sibling apps. Set in .env for local dev
 * (e.g. NEXT_PUBLIC_BLOG_URL=http://localhost:3001).
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codingbay.community";
const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL ?? "https://codingbay.blog";
const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL ?? "https://codebay.dev";

export { siteUrl, blogUrl, mainUrl };
