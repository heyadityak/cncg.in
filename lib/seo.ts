import type { Metadata, MetadataRoute } from "next";
import type { CityGroup, LatestEvent, StateGroup } from "@/data/groups";
import { isEventUpcoming } from "@/lib/event-utils";

export const SITE_URL = "https://cncg.in";
export const SITE_NAME = "CNCG India";
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const CNCF_URL = "https://www.cncf.io";
export const CNCF_COMMUNITY_URL = "https://community.cncf.io";

/** Published on https://heyadityak.com and in this repo's license. */
export const CREATOR_NAME = "Aditya Krishnakumar";
export const CREATOR_URL = "https://heyadityak.com";

/** Unique homepage title for India-intent queries. */
export const HOME_TITLE =
  "CNCG India — Cloud Native Community Groups in India";

/** ~150 characters. States who the site is, where it applies, and how it differs from cncf.io. */
export const HOME_DESCRIPTION =
  "CNCG India (cncg.in) lists Cloud Native Community Groups and CNCF meetups in Indian cities. Find a local chapter. Foundation programs stay on cncf.io.";

export const HOME_FAQS: { question: string; answer: string }[] = [
  {
    question: "What is CNCG India?",
    answer:
      "CNCG India is the independent directory at cncg.in of Cloud Native Community Groups in India. It lists city chapters, organisers, and meetups for people looking for a local cloud-native community.",
  },
  {
    question: "How does CNCG India relate to the CNCF?",
    answer:
      "Chapters listed on cncg.in are local communities in the CNCF community program. CNCG India is a community-run directory. The Cloud Native Computing Foundation publishes projects and global programs at cncf.io.",
  },
  {
    question: "Where can I find a CNCF meetup in India?",
    answer:
      "Open a city chapter on cncg.in. Each city page shows the latest listed meetup when one is available, plus links to join that Cloud Native Community Group.",
  },
];

export const indexableRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

/** Self-referencing en-IN hreflang. The site is English written for India, with one URL per page. */
export function pageAlternates(url: string): Metadata["alternates"] {
  return {
    canonical: url,
    languages: {
      "en-IN": url,
      "x-default": url,
    },
  };
}

export function sitemapLanguageAlternates(
  url: string
): NonNullable<MetadataRoute.Sitemap[number]["alternates"]> {
  return {
    languages: {
      "en-IN": url,
      "x-default": url,
    },
  };
}

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

export function cityDescription(city: CityGroup, state: StateGroup): string {
  if (city.description) {
    const hasCncf = /CNCF/i.test(city.description);
    const hasCloudNative = /cloud[\s-]?native/i.test(city.description);
    if (hasCncf && hasCloudNative) return city.description;
  }

  return (
    `Join CNCF ${city.name} (also known as CNCG ${city.name} / Cloud Native ${city.name}) — ` +
    `the Cloud Native Computing Foundation community group in ${city.name}, ${state.name}, India. ` +
    `Meetups, workshops, and talks on Kubernetes, CNCF projects, and cloud-native technologies.`
  );
}

export function stateTitle(stateName: string): string {
  return `CNCF ${stateName} — Cloud Native Community Groups (CNCG)`;
}

export function stateDescription(state: StateGroup): string {
  const cities = state.cities.map((c) => c.name).join(", ");
  return (
    `Find CNCF and Cloud Native Community Groups (CNCG) in ${state.name}, India. ` +
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
    "India",
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
    "India",
  ];
}

export function cityFaqs(
  city: CityGroup,
  state: StateGroup
): { question: string; answer: string }[] {
  const url = cityCanonical(city.slug);
  return [
    {
      question: `What is CNCF ${city.name}?`,
      answer:
        `CNCF ${city.name} (also called CNCG ${city.name} or Cloud Native ${city.name}) is the local Cloud Native Community Group serving ${city.name} and nearby areas in ${state.name}, India. ` +
        `The community runs meetups and workshops on Kubernetes and the broader CNCF ecosystem. This page is part of the CNCG India directory at cncg.in.`,
    },
    {
      question: `How do I join Cloud Native ${city.name}?`,
      answer: city.ocGroupUrl
        ? `Join CNCG ${city.name} from the group page at ${city.ocGroupUrl}. Social and CFP links on this page are included when the chapter publishes them.`
        : `Follow CNCG ${city.name} from this directory page at ${url} for meetup updates in ${city.name}, ${state.name}.`,
    },
    {
      question: `Is CNCG ${city.name} the same as CNCF ${city.name}?`,
      answer:
        `Yes. CNCG stands for Cloud Native Community Group. Searches for CNCF ${city.name}, Cloud Native ${city.name}, and CNCG ${city.name} refer to this same local chapter in ${city.name}, ${state.name}, India.`,
    },
    {
      question: `Is CNCF ${city.name} the same as the CNCF website?`,
      answer:
        `CNCF ${city.name} on cncg.in is a city chapter in the CNCG India directory. The Cloud Native Computing Foundation publishes projects and global programs at cncf.io. Use this page for the local community group and its meetups in ${city.name}, ${state.name}.`,
    },
  ];
}

type JsonLd = Record<string, unknown>;

function creatorPerson(): JsonLd {
  return {
    "@type": "Person",
    name: CREATOR_NAME,
    url: CREATOR_URL,
  };
}

function creatorAttribution(): { author: JsonLd; creator: JsonLd } {
  const person = creatorPerson();
  return { author: person, creator: person };
}

function indiaCountry(): JsonLd {
  return {
    "@type": "Country",
    name: "India",
    sameAs: "https://www.wikidata.org/wiki/Q668",
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    alternateName: [
      "Cloud Native Community Groups India",
      "Cloud Native Community Group India",
      "cncg.in",
    ],
    url: SITE_URL,
    description: HOME_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@id": ORG_ID },
    ...creatorAttribution(),
    about: {
      "@type": "Thing",
      name: "Cloud Native Community Groups in India",
      description:
        "Local CNCF community chapters and their meetups in Indian cities, listed by the independent directory CNCG India.",
    },
    areaServed: indiaCountry(),
  };
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: [
      "Cloud Native Community Groups India",
      "Cloud Native Community Group India",
      "cncg.in",
    ],
    url: SITE_URL,
    ...creatorAttribution(),
    description:
      "Community-run directory of Cloud Native Community Groups across India. Chapters take part in the CNCF community program. CNCG India is independent of the Cloud Native Computing Foundation (cncf.io) and The Linux Foundation.",
    areaServed: indiaCountry(),
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    knowsAbout: [
      "Cloud Native Community Groups in India",
      "CNCF community chapters in India",
      "Kubernetes meetups in India",
    ],
    sameAs: ["https://github.com/heyadityak/cncg.in"],
  };
}

export function homeJsonLd(): JsonLd[] {
  const attribution = creatorAttribution();
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      inLanguage: "en-IN",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      mainEntity: { "@id": ORG_ID },
      ...attribution,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      url: SITE_URL,
      inLanguage: "en-IN",
      isPartOf: { "@id": WEBSITE_ID },
      ...attribution,
      mainEntity: HOME_FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];
}

export function cityJsonLd(city: CityGroup, state: StateGroup): JsonLd[] {
  const url = cityCanonical(city.slug);
  const description = cityDescription(city, state);
  const faqs = cityFaqs(city, state);
  const orgId = `${url}/#organization`;

  const organization: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": orgId,
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
        containedInPlace: indiaCountry(),
      },
    },
    location: {
      "@type": "Place",
      name: `${city.name}, ${state.name}, India`,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressRegion: state.name,
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.lat,
        longitude: city.lng,
      },
    },
    parentOrganization: { "@id": ORG_ID },
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
    "@id": `${url}/#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "CNCG India",
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

  const webpage: JsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}/#webpage`,
    url,
    name: cityTitle(city.name),
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": orgId },
    breadcrumb: { "@id": `${url}/#breadcrumb` },
    ...creatorAttribution(),
  };

  const faq: JsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}/#faq`,
    url,
    inLanguage: "en-IN",
    ...creatorAttribution(),
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const items: JsonLd[] = [webpage, organization, breadcrumbs, faq];

  if (city.latestEvent && isEventUpcoming(city.latestEvent)) {
    items.push(eventJsonLd(city, state, city.latestEvent));
  }

  return items;
}

function eventAttendanceMode(kind?: string): string {
  if (kind === "virtual") return "https://schema.org/OnlineEventAttendanceMode";
  if (kind === "hybrid") return "https://schema.org/MixedEventAttendanceMode";
  return "https://schema.org/OfflineEventAttendanceMode";
}

export function eventJsonLd(
  city: CityGroup,
  state: StateGroup,
  event: LatestEvent
): JsonLd {
  const chapterUrl = cityCanonical(city.slug);
  const locality = event.venueCity ?? city.name;
  const venueMatchesChapter =
    !event.venueCity ||
    event.venueCity.toLowerCase() === city.name.toLowerCase();
  const isOnline = event.kind === "virtual";
  const isHybrid = event.kind === "hybrid";

  const place: JsonLd = {
    "@type": "Place",
    name: locality,
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      addressRegion: state.name,
      addressCountry: "IN",
    },
  };

  if (venueMatchesChapter) {
    place.geo = {
      "@type": "GeoCoordinates",
      latitude: city.lat,
      longitude: city.lng,
    };
  }

  const virtualLocation: JsonLd = {
    "@type": "VirtualLocation",
    url: event.eventUrl,
  };

  const jsonLd: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: `${event.name} is a Cloud Native meetup listed for ${city.name}, ${state.name}, India on CNCG India.`,
    url: event.eventUrl,
    startDate: event.startsAt,
    inLanguage: "en-IN",
    eventAttendanceMode: eventAttendanceMode(event.kind),
    eventStatus: "https://schema.org/EventScheduled",
    organizer: {
      "@type": "Organization",
      "@id": `${chapterUrl}/#organization`,
      name: `CNCF ${city.name}`,
      url: chapterUrl,
    },
    location: isOnline
      ? virtualLocation
      : isHybrid
        ? [place, virtualLocation]
        : place,
  };

  if (event.endsAt) jsonLd.endDate = event.endsAt;
  if (city.iconUrl) jsonLd.image = absoluteAssetUrl(city.iconUrl, chapterUrl);

  return jsonLd;
}

export function stateJsonLd(state: StateGroup): JsonLd[] {
  const url = stateCanonical(state.slug);
  const description = stateDescription(state);

  const itemList: JsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}/#chapters`,
    name: `Cloud Native Community Groups in ${state.name}, India`,
    description,
    numberOfItems: state.cities.length,
    itemListElement: state.cities.map((city, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Organization",
        name: `CNCF ${city.name}`,
        url: cityCanonical(city.slug),
      },
    })),
  };

  const breadcrumbs: JsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}/#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "CNCG India",
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

  const webpage: JsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}/#webpage`,
    url,
    name: stateTitle(state.name),
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    ...creatorAttribution(),
    about: {
      "@type": "AdministrativeArea",
      name: state.name,
      containedInPlace: indiaCountry(),
    },
    mainEntity: { "@id": `${url}/#chapters` },
    breadcrumb: { "@id": `${url}/#breadcrumb` },
  };

  return [webpage, itemList, breadcrumbs];
}
