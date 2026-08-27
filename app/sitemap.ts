import type { MetadataRoute } from "next";
import { POSTS } from "@/content/posts";

const BASE = "https://howiezales.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const LEGAL_ROUTES = ["/privacy", "/terms"];

  const staticRoutes = [
    "",
    "/vision",
    "/work",
    "/podcast",
    "/athena",
    "/press",
    "/blog",
    "/contact",
    ...LEGAL_ROUTES,
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: LEGAL_ROUTES.includes(path)
      ? new Date("2026-08-24")
      : new Date("2026-07-08"),
    changeFrequency: LEGAL_ROUTES.includes(path)
      ? ("yearly" as const)
      : ("weekly" as const),
    priority: path === "" ? 1 : LEGAL_ROUTES.includes(path) ? 0.3 : 0.8,
  }));

  const postRoutes = POSTS.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.isoDate),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
