import type { MetadataRoute } from "next";

const siteUrl = "https://codebay.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    }
  ];
}
