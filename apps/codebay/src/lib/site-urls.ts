/**
 * Base URLs for this app and sibling apps. Set in .env so local dev can use
 * localhost (e.g. NEXT_PUBLIC_BLOG_URL=http://localhost:3001).
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://codebay.dev";
const blogUrl = process.env.NEXT_PUBLIC_BLOG_URL ?? "https://codingbay.blog";
const communityUrl = process.env.NEXT_PUBLIC_COMMUNITY_URL ?? "https://codingbay.community";

export { siteUrl, blogUrl, communityUrl };
