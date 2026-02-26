import type { MetadataRoute } from "next";
import { blogPostsByDate } from "@/content/blogPosts";

const siteUrl = "https://codebay.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    }
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPostsByDate.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8
  }));

  return [...staticRoutes, ...blogRoutes];
}
