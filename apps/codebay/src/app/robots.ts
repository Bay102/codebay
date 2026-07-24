import type { MetadataRoute } from "next";
import { isSitePaused } from "@/lib/site-config";
import { siteUrl } from "@/lib/site-urls";

export default function robots(): MetadataRoute.Robots {
  if (isSitePaused()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
