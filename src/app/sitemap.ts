import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://habitforge.com";
  const lastModified = new Date();

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];

  return staticRoutes;
}
