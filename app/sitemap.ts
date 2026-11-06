import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const routes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/course-curriculum", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/for-parents", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/student-projects", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/book-a-free-demo", changeFrequency: "monthly" as const, priority: 0.9 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
