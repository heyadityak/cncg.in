import type { MetadataRoute } from "next";
import { groups } from "@/data/groups";
import { SITE_URL, cityCanonical, stateCanonical } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const states: MetadataRoute.Sitemap = groups.map((state) => ({
    url: stateCanonical(state.slug),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const cities: MetadataRoute.Sitemap = groups.flatMap((state) =>
    state.cities.map((city) => ({
      url: cityCanonical(city.slug),
      lastModified: city.latestEvent?.syncedAt
        ? new Date(city.latestEvent.syncedAt)
        : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }))
  );

  return [...home, ...states, ...cities];
}
