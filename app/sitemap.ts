import type { MetadataRoute } from "next";
import { groups } from "@/data/groups";
import {
  SITE_URL,
  cityCanonical,
  sitemapLanguageAlternates,
  stateCanonical,
} from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: sitemapLanguageAlternates(SITE_URL),
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  const states: MetadataRoute.Sitemap = groups.map((state) => {
    const url = stateCanonical(state.slug);
    return {
      url,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: sitemapLanguageAlternates(url),
    };
  });

  const cities: MetadataRoute.Sitemap = groups.flatMap((state) =>
    state.cities.map((city) => {
      const url = cityCanonical(city.slug);
      return {
        url,
        lastModified: city.latestEvent?.syncedAt
          ? new Date(city.latestEvent.syncedAt)
          : now,
        changeFrequency: "weekly" as const,
        priority: 0.9,
        alternates: sitemapLanguageAlternates(url),
      };
    })
  );

  return [...home, ...states, ...cities];
}
