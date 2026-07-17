import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/dashboard",
        "/journey",
        "/curriculum",
        "/homework",
        "/resources",
        "/class",
        "/progress",
        "/league",
        "/referrals",
        "/profile",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
