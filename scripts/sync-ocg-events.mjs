#!/usr/bin/env node
/**
 * Fetch the latest event and group icon per CNCG group from ocgroups.dev,
 * mirror icons into public/group-icons/, and update data/groups.yaml.
 *
 * Events: prefer the next upcoming event; if none, use the most recent past event.
 * Icons: download once during sync; the site serves local /group-icons/* paths.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { writeGroups } from "./groups-yaml.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const yamlPath = path.join(root, "data", "groups.yaml");
const iconsDir = path.join(root, "public", "group-icons");

const OCG_SEARCH = "https://ocgroups.dev/explore/events/search";
const OCG_ORIGIN = "https://ocgroups.dev";
const USER_AGENT = "CNCG-India/1.0 (+https://cncg.in)";
const CONCURRENCY = 8;

const GROUP_ICON_RE =
  /<div class="[^"]*size-24[^"]*"[\s\S]*?<img\s+src="(\/images\/[^"]+)"[\s\S]*?object-contain/;

function extractGroupSlug(ocGroupUrl) {
  const match = ocGroupUrl.match(/\/cncf\/group\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function buildSearchUrl(params) {
  const url = new URL(OCG_SEARCH);
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        url.searchParams.append(`${key}[${index}]`, String(item));
      });
      continue;
    }
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function searchEvents(params) {
  const url = buildSearchUrl(params);
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
  });

  if (!res.ok) {
    throw new Error(`OCG API ${res.status} for ${url.pathname}${url.search}`);
  }

  return res.json();
}

function mapEvent(event) {
  const mapped = {
    name: event.name,
    eventUrl: `https://ocgroups.dev/${event.community_name}/group/${event.group_slug}/event/${event.slug}`,
    startsAt: new Date(event.starts_at * 1000).toISOString(),
    syncedAt: new Date().toISOString(),
  };

  if (event.ends_at) {
    mapped.endsAt = new Date(event.ends_at * 1000).toISOString();
  }
  if (event.timezone) mapped.timezone = event.timezone;
  if (event.kind) mapped.kind = event.kind;
  if (event.venue_city) mapped.venueCity = event.venue_city;

  return mapped;
}

async function fetchLatestEvent(groupSlug) {
  const upcoming = await searchEvents({
    community: ["cncf"],
    group: [groupSlug],
    limit: 1,
    sort_by: "date",
    sort_direction: "asc",
  });

  if (upcoming.events?.length) {
    return mapEvent(upcoming.events[0]);
  }

  const today = new Date().toISOString().slice(0, 10);
  const past = await searchEvents({
    community: ["cncf"],
    group: [groupSlug],
    date_from: "2020-01-01",
    date_to: today,
    limit: 1,
    sort_by: "date",
    sort_direction: "desc",
  });

  if (past.events?.length) {
    return mapEvent(past.events[0]);
  }

  return null;
}

async function fetchRemoteIconUrl(groupSlug) {
  const res = await fetch(`${OCG_ORIGIN}/cncf/group/${groupSlug}`, {
    headers: {
      Accept: "text/html",
      "User-Agent": USER_AGENT,
    },
  });

  if (!res.ok) {
    throw new Error(`OCG group page ${res.status} for ${groupSlug}`);
  }

  const html = await res.text();
  const match = html.match(GROUP_ICON_RE);
  if (!match) return null;

  return `${OCG_ORIGIN}${match[1]}`;
}

function extensionFromUrl(remoteUrl) {
  const ext = path.extname(new URL(remoteUrl).pathname).toLowerCase();
  if (ext && /^\.(png|jpe?g|svg|webp|gif)$/.test(ext)) {
    return ext;
  }
  return ".jpg";
}

function localIconPath(citySlug, remoteUrl) {
  return `/group-icons/${citySlug}${extensionFromUrl(remoteUrl)}`;
}

function absolutePublicPath(relativePath) {
  return path.join(root, "public", relativePath.replace(/^\//, ""));
}

async function downloadIcon(citySlug, remoteUrl) {
  const res = await fetch(remoteUrl, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: `${OCG_ORIGIN}/`,
      Accept: "image/*,*/*",
    },
  });

  if (!res.ok) {
    throw new Error(`Icon download ${res.status} for ${remoteUrl}`);
  }

  const relativePath = localIconPath(citySlug, remoteUrl);
  const filePath = absolutePublicPath(relativePath);

  fs.mkdirSync(iconsDir, { recursive: true });
  fs.writeFileSync(filePath, Buffer.from(await res.arrayBuffer()));

  return relativePath;
}

function removeLocalIcon(relativePath) {
  if (!relativePath || !relativePath.startsWith("/group-icons/")) return;
  const filePath = absolutePublicPath(relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

function iconsEqual(previousSource, nextSource, previousLocal, nextLocal) {
  return previousSource === nextSource && previousLocal === nextLocal;
}

function eventsEqual(a, b) {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return (
    a.name === b.name &&
    a.eventUrl === b.eventUrl &&
    a.startsAt === b.startsAt
  );
}

async function mapWithConcurrency(items, concurrency, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current], current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  );
  return results;
}

function collectReferencedIconPaths(groupsData) {
  const paths = new Set();
  for (const state of groupsData) {
    for (const city of state.cities ?? []) {
      if (city.iconUrl?.startsWith("/group-icons/")) {
        paths.add(city.iconUrl);
      }
    }
  }
  return paths;
}

function pruneStaleIcons(referencedPaths) {
  if (!fs.existsSync(iconsDir)) return 0;

  let removed = 0;
  for (const filename of fs.readdirSync(iconsDir)) {
    if (filename.startsWith(".")) continue;
    const relativePath = `/group-icons/${filename}`;
    if (!referencedPaths.has(relativePath)) {
      fs.unlinkSync(path.join(iconsDir, filename));
      removed += 1;
      console.log(`  removed stale icon ${relativePath}`);
    }
  }
  return removed;
}

const yamlText = fs.readFileSync(yamlPath, "utf8");
const groups = parse(yamlText);

if (!Array.isArray(groups)) {
  throw new Error("data/groups.yaml must contain a top-level array of states");
}

const targets = [];
for (const state of groups) {
  for (const city of state.cities ?? []) {
    if (!city.ocGroupUrl) continue;
    const groupSlug = extractGroupSlug(city.ocGroupUrl);
    if (!groupSlug) {
      console.warn(
        `Skipping ${city.slug}: could not parse group slug from ${city.ocGroupUrl}`
      );
      continue;
    }
    targets.push({ state, city, groupSlug });
  }
}

console.log(`Syncing OCG data for ${targets.length} groups…`);

let eventsUpdated = 0;
let eventsCleared = 0;
let eventsUnchanged = 0;
let iconsUpdated = 0;
let iconsCleared = 0;
let iconsUnchanged = 0;
let failed = 0;

await mapWithConcurrency(targets, CONCURRENCY, async ({ city, groupSlug }) => {
  const previousEvent = city.latestEvent ?? null;
  const previousIconUrl = city.iconUrl ?? null;
  const previousIconSource = city.iconSourceUrl ?? null;

  try {
    const [latestEvent, remoteIconUrl] = await Promise.all([
      fetchLatestEvent(groupSlug),
      fetchRemoteIconUrl(groupSlug),
    ]);

    if (latestEvent == null) {
      if (previousEvent != null) {
        delete city.latestEvent;
        eventsCleared += 1;
        console.log(`  cleared event ${city.slug}`);
      } else {
        eventsUnchanged += 1;
      }
    } else if (eventsEqual(previousEvent, latestEvent)) {
      eventsUnchanged += 1;
    } else {
      city.latestEvent = latestEvent;
      eventsUpdated += 1;
      console.log(`  updated event ${city.slug}: ${latestEvent.name}`);
    }

    if (remoteIconUrl == null) {
      if (previousIconUrl != null || previousIconSource != null) {
        removeLocalIcon(previousIconUrl);
        delete city.iconUrl;
        delete city.iconSourceUrl;
        iconsCleared += 1;
        console.log(`  cleared icon ${city.slug}`);
      } else {
        iconsUnchanged += 1;
      }
      return;
    }

    const nextLocalPath = localIconPath(city.slug, remoteIconUrl);
    const localFile = absolutePublicPath(nextLocalPath);
    const hasCurrentFile =
      fs.existsSync(localFile) &&
      iconsEqual(previousIconSource, remoteIconUrl, previousIconUrl, nextLocalPath);

    if (hasCurrentFile) {
      city.iconUrl = nextLocalPath;
      city.iconSourceUrl = remoteIconUrl;
      iconsUnchanged += 1;
      return;
    }

    if (previousIconUrl && previousIconUrl !== nextLocalPath) {
      removeLocalIcon(previousIconUrl);
    }

    const savedPath = await downloadIcon(city.slug, remoteIconUrl);
    city.iconUrl = savedPath;
    city.iconSourceUrl = remoteIconUrl;
    iconsUpdated += 1;
    console.log(`  updated icon ${city.slug} -> ${savedPath}`);
  } catch (error) {
    failed += 1;
    console.error(`  failed ${city.slug}: ${error.message}`);
  }
});

const referencedIcons = collectReferencedIconPaths(groups);
const staleRemoved = pruneStaleIcons(referencedIcons);

writeGroups(groups);

console.log(
  `\nDone. events(updated=${eventsUpdated}, cleared=${eventsCleared}, unchanged=${eventsUnchanged}); icons(updated=${iconsUpdated}, cleared=${iconsCleared}, unchanged=${iconsUnchanged}, staleRemoved=${staleRemoved}); failed=${failed}`
);

if (failed > 0) {
  process.exitCode = 1;
}

await import("./build-groups.mjs");
