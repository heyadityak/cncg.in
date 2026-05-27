import groupsData from "./groups.json";

export type LatestEvent = {
  name: string;
  eventUrl: string;
  startsAt: string;
  endsAt?: string;
  timezone?: string;
  kind?: string;
  venueCity?: string;
  syncedAt?: string;
};

export type CityGroup = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  organizer?: string;
  description?: string;
  ocGroupUrl?: string;
  /** Local path under public/, e.g. /group-icons/bangalore.jpeg */
  iconUrl?: string;
  /** Remote ocgroups.dev URL used during sync; do not edit by hand */
  iconSourceUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  latestEvent?: LatestEvent;
};

export type StateGroup = {
  slug: string;
  name: string;
  /** State centroid coordinates for map centering */
  lat: number;
  lng: number;
  cities: CityGroup[];
};

export const groups: StateGroup[] = groupsData as StateGroup[];

export const STATE_SLUGS = new Set(groups.map((g) => g.slug));

export const CITY_SLUGS = new Set(
  groups.flatMap((g) => g.cities.map((c) => c.slug))
);

export function getState(slug: string): StateGroup | undefined {
  return groups.find((g) => g.slug === slug);
}

export function getCity(
  citySlug: string
): { city: CityGroup; state: StateGroup } | undefined {
  for (const state of groups) {
    const city = state.cities.find((c) => c.slug === citySlug);
    if (city) return { city, state };
  }
  return undefined;
}
