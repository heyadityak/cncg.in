import type { CityGroup, LatestEvent, StateGroup } from "@/data/groups";

export const SITE_URL = "https://cncg.in";
export const SITE_NAME = "CNCG India";

export function cityCanonical(slug: string): string {
  return `https://${slug}.cncg.in`;
}

export function stateCanonical(slug: string): string {
  return `https://${slug}.cncg.in`;
}

export function absoluteAssetUrl(path: string, hostCanonical?: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = hostCanonical ?? SITE_URL;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Primary title targeting "CNCF {City}" and "Cloud Native {City}" searches. */
export function cityTitle(cityName: string): string {
  return `CNCF ${cityName} — Cloud Native Community Group (CNCG)`;
}

export function cityDescription(
  city: CityGroup,
  state: StateGroup
): string {
  if (city.description) {
    const hasCncf = /CNCF/i.test(city.description);
    const hasCloudNative = /cloud[\s-]?native/i.test(city.description);
    if (hasCncf && hasCloudNative) return city.description;
  }

  return (
    `Join CNCF ${city.name} (also known as CNCG ${city.name} / Cloud Native ${city.name}) — ` +
    `the Cloud Native Computing Foundation community group in ${city.name}, ${state.name}. ` +
    `Meetups, workshops, and talks on Kubernetes, CNCF projects, and cloud-native technologies.`
  );
}

export function stateTitle(stateName: string): string {
  return `CNCF ${stateName} — Cloud Native Community Groups (CNCG)`;
}

export function stateDescription(state: StateGroup): string {
  const cities = state.cities.map((c) => c.name).join(", ");
  return (
    `Find CNCF and Cloud Native Community Groups (CNCG) in ${state.name}. ` +
    `Explore local chapters in ${cities} for Kubernetes meetups, CNCF events, and cloud-native learning.`
  );
}

export function cityKeywords(city: CityGroup, state: StateGroup): string[] {
  return [
    `CNCF ${city.name}`,
    `Cloud Native ${city.name}`,
    `CNCG ${city.name}`,
    `Cloud Native Computing Group ${city.name}`,
    `Kubernetes ${city.name}`,
    `CNCF ${state.name}`,
    `Cloud Native ${state.name}`,
    "CNCF",
    "CNCG",
    "Cloud Native",
    "Kubernetes",
    city.name,
    state.name,
  ];
}

export function stateKeywords(state: StateGroup): string[] {
  return [
    `CNCF ${state.name}`,
    `Cloud Native ${state.name}`,
    `CNCG ${state.name}`,
    ...state.cities.flatMap((c) => [
      `CNCF ${c.name}`,
      `Cloud Native ${c.name}`,
      `CNCG ${c.name}`,
    ]),
    "CNCF",
    "CNCG",
    "Cloud Native",
    "Kubernetes",
    state.name,
  ];
}

type JsonLd = Record<string, unknown>;

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [
      "Cloud Native Community Groups India",
      "CNCF Community Groups India",
    ],
    url: SITE_URL,
    description:
      "Independent directory of Cloud Native Community Groups (CNCG) and CNCF-affiliated chapters across India.",
    inLanguage: "en-IN",
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Community-run directory of Cloud Native Community Groups across India. Not affiliated with or endorsed by CNCF or The Linux Foundation.",
    sameAs: ["https://github.com/heyadityak/cncg.in"],
  };
}

export function cityJsonLd(
  city: CityGroup,
  state: StateGroup
): JsonLd[] {
  const url = cityCanonical(city.slug);
  const description = cityDescription(city, state);

  const organization: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: `CNCF ${city.name}`,
    alternateName: [
      `CNCG ${city.name}`,
      `Cloud Native ${city.name}`,
      `Cloud Native Computing Group ${city.name}`,
      `${city.name} Cloud Native Community Group`,
    ],
    url,
    description,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "State",
        name: state.name,
        containedInPlace: {
          "@type": "Country",
          name: "India",
        },
      },
    },
    parentOrganization: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  if (city.iconUrl) {
    organization.logo = absoluteAssetUrl(city.iconUrl, url);
    organization.image = absoluteAssetUrl(city.iconUrl, url);
  }

  const sameAs = [city.ocGroupUrl, city.twitterUrl, city.linkedinUrl].filter(
    Boolean
  ) as string[];
  if (sameAs.length > 0) organization.sameAs = sameAs;

  const breadcrumbs: JsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "India",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: state.name,
        item: stateCanonical(state.slug),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `CNCF ${city.name}`,
        item: url,
      },
    ],
  };

  const faq: JsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is CNCF ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            `CNCF ${city.name} (also called CNCG ${city.name} or Cloud Native ${city.name}) is the local Cloud Native Community Group in ${city.name}, ${state.name}. ` +
            `It hosts meetups and workshops on Kubernetes and other CNCF / cloud-native technologies.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I join Cloud Native ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: city.ocGroupUrl
            ? `Visit the CNCG ${city.name} group page at ${city.ocGroupUrl} to join upcoming Cloud Native meetups in ${city.name}.`
            : `Follow CNCG ${city.name} via this directory at ${url} for Cloud Native meetup updates in ${city.name}.`,
        },
      },
      {
        "@type": "Question",
        name: `Is CNCG ${city.name} the same as CNCF ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text:
            `Yes — CNCG stands for Cloud Native Community Group. People searching for CNCF ${city.name}, Cloud Native ${city.name}, or CNCG ${city.name} are looking for the same local community chapter in ${city.name}.`,
        },
      },
    ],
  };

  const items: JsonLd[] = [organization, breadcrumbs, faq];

  if (city.latestEvent) {
    items.push(eventJsonLd(city, city.latestEvent));
  }

  return items;
}

export function eventJsonLd(city: CityGroup, event: LatestEvent): JsonLd {
  const jsonLd: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    url: event.eventUrl,
    startDate: event.startsAt,
    eventAttendanceMode:
      event.kind === "virtual"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    organizer: {
      "@type": "Organization",
      name: `CNCF ${city.name}`,
      url: cityCanonical(city.slug),
    },
    location:
      event.kind === "virtual"
        ? {
            "@type": "VirtualLocation",
            url: event.eventUrl,
          }
        : {
            "@type": "Place",
            name: event.venueCity ?? city.name,
            address: {
              "@type": "PostalAddress",
              addressLocality: event.venueCity ?? city.name,
              addressCountry: "IN",
            },
          },
  };

  if (event.endsAt) jsonLd.endDate = event.endsAt;

  return jsonLd;
}

export function stateJsonLd(state: StateGroup): JsonLd[] {
  const url = stateCanonical(state.slug);

  const itemList: JsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `CNCF / Cloud Native Community Groups in ${state.name}`,
    description: stateDescription(state),
    numberOfItems: state.cities.length,
    itemListElement: state.cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `CNCF ${city.name}`,
      url: cityCanonical(city.slug),
    })),
  };

  const breadcrumbs: JsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "India",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `CNCF ${state.name}`,
        item: url,
      },
    ],
  };

  return [itemList, breadcrumbs];
}
