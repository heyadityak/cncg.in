#!/usr/bin/env node
/**
 * Keep the roster in data/groups.yaml in sync with the CNCF groups published in
 * India on ocgroups.dev:
 *
 *   - adds groups that exist upstream but are missing here
 *   - removes groups that vanished upstream or were deactivated
 *
 * The state a new group belongs to is resolved offline by point-in-polygon
 * against public/india-states-simple.geojson, so no geocoding service is needed.
 * A brand new state is appended with a bounding-box centre for `lat`/`lng` —
 * good enough to render, worth a human tweak later (the run logs a reminder).
 *
 * Entries edited by hand (organizer, description, socials) are never touched;
 * a group with no ocGroupUrl is treated as manual and is never removed.
 *
 * Usage:
 *   node scripts/sync-ocg-groups.mjs [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { groupsYamlPath, readGroups, root, writeGroups } from "./groups-yaml.mjs";

const OCG_GROUP_SEARCH = "https://ocgroups.dev/explore/groups/search";
const OCG_ORIGIN = "https://ocgroups.dev";
const USER_AGENT = "CNCG-India/1.0 (+https://cncg.in)";
const PAGE_SIZE = 100; // upstream rejects limit > 100
const GEOJSON_PATH = path.join(root, "public", "india-states-simple.geojson");
const ICONS_DIR = path.join(root, "public", "group-icons");

/**
 * Upstream groups that should never be added back after a human removes them
 * (duplicates, test groups, groups tracked under a different entry here).
 * Keys are ocgroups.dev group slugs, values are a short reason for the record.
 */
const IGNORED_OCG_SLUGS = new Map([]);

/** GeoJSON NAME_1 → the state slug already used on the site. */
const STATE_SLUG_OVERRIDES = new Map([
  ["Chandigarh", "chandigarh-ut"],
  ["Dadra and Nagar Haveli and Daman and Diu", "dadra-nagar-haveli-daman-diu"],
]);

/** Subdomains reserved by routing — a city slug must never collide with them. */
const RESERVED_SLUGS = new Set(["www", "api", "assets", "static", "admin", "cncg"]);

const dryRun = process.argv.includes("--dry-run");

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function round(value) {
  return Math.round(value * 1e4) / 1e4;
}

function extractGroupSlug(ocGroupUrl) {
  return ocGroupUrl?.match(/\/cncf\/group\/([^/?#]+)/)?.[1] ?? null;
}

// ── Upstream fetch ───────────────────────────────────────────────────────────

async function fetchGroupPage(offset) {
  const url = new URL(OCG_GROUP_SEARCH);
  url.searchParams.set("community[0]", "cncf");
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`OCG API ${res.status} for ${url.pathname}${url.search}`);
  }

  return res.json();
}

async function fetchAllCncfGroups() {
  const collected = [];
  let total = null;

  for (let offset = 0; total == null || offset < total; offset += PAGE_SIZE) {
    const page = await fetchGroupPage(offset);
    total ??= page.total ?? 0;
    if (!page.groups?.length) break;
    collected.push(...page.groups);
    if (collected.length >= total) break;
  }

  if (total != null && collected.length < total) {
    throw new Error(
      `Incomplete group listing: fetched ${collected.length} of ${total}`
    );
  }

  return collected;
}

// ── State resolution (offline point-in-polygon) ──────────────────────────────

function loadStateFeatures() {
  const geojson = JSON.parse(fs.readFileSync(GEOJSON_PATH, "utf8"));
  return geojson.features.map((feature) => ({
    name: feature.properties.NAME_1,
    polygons:
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates,
  }));
}

function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(point, rings) {
  if (!pointInRing(point, rings[0])) return false;
  // Any hit inside a hole puts the point outside the polygon.
  return !rings.slice(1).some((hole) => pointInRing(point, hole));
}

/** Squared distance in degrees, longitude scaled by cos(latitude). */
function approxSquaredDistance([lng, lat], [vLng, vLat]) {
  const dx = (vLng - lng) * Math.cos((lat * Math.PI) / 180);
  const dy = vLat - lat;
  return dx * dx + dy * dy;
}

function nearestStateFeature(point, features) {
  let best = null;
  let bestDistance = Infinity;

  for (const feature of features) {
    for (const rings of feature.polygons) {
      for (const vertex of rings[0]) {
        const distance = approxSquaredDistance(point, vertex);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = feature;
        }
      }
    }
  }

  return best;
}

function resolveStateFeature(point, features) {
  for (const feature of features) {
    if (feature.polygons.some((rings) => pointInPolygon(point, rings))) {
      return { feature, exact: true };
    }
  }
  return { feature: nearestStateFeature(point, features), exact: false };
}

function featureCentre(feature) {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const rings of feature.polygons) {
    for (const [lng, lat] of rings[0]) {
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }

  return { lat: round((minLat + maxLat) / 2), lng: round((minLng + maxLng) / 2) };
}

// ── Naming ───────────────────────────────────────────────────────────────────

const GENERIC_PREFIX_RE = /^(?:cloud[\s-]?native|kubernetes|cncf|cncg)\s+/i;

function cityNameFor(group) {
  const upstreamCity = group.city?.trim();
  const withoutPrefix = group.name.replace(GENERIC_PREFIX_RE, "").trim();

  // "Cloud Native Bangalore" with city "Bengaluru" → prefer the city name.
  // A group whose name is not a plain place ("Resiliency & Platform
  // Engineering Bengaluru") keeps its own name so the identity is not lost.
  if (upstreamCity && GENERIC_PREFIX_RE.test(group.name)) return upstreamCity;
  return withoutPrefix || group.name;
}

function citySlugFor(group, cityName, taken) {
  const candidates = [
    slugify(cityName),
    slugify(group.name.replace(GENERIC_PREFIX_RE, "")),
    slugify(group.name),
    `${slugify(group.name)}-${group.slug}`,
  ];

  for (const candidate of candidates) {
    if (candidate && !taken.has(candidate) && !RESERVED_SLUGS.has(candidate)) {
      return candidate;
    }
  }

  return `group-${group.slug}`;
}

// ── Icon cleanup ─────────────────────────────────────────────────────────────

function removeLocalIcon(iconUrl) {
  if (!iconUrl?.startsWith("/group-icons/")) return;
  const filePath = path.join(ICONS_DIR, path.basename(iconUrl));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// ── Reconcile ────────────────────────────────────────────────────────────────

const groups = readGroups();

const syncedCities = [];
const takenCitySlugs = new Set();
const takenStateSlugs = new Set();
const stateBySlug = new Map();

for (const state of groups) {
  takenStateSlugs.add(state.slug);
  stateBySlug.set(state.slug, state);
  for (const city of state.cities ?? []) {
    takenCitySlugs.add(city.slug);
    const ocgSlug = extractGroupSlug(city.ocGroupUrl);
    if (ocgSlug) syncedCities.push({ state, city, ocgSlug });
  }
}

console.log(
  `Local roster: ${groups.length} states, ${takenCitySlugs.size} cities (${syncedCities.length} linked to ocgroups.dev).`
);

const upstream = await fetchAllCncfGroups();
const indiaGroups = upstream.filter(
  (group) => group.country_code === "IN" || group.country_name === "India"
);
const activeIndiaGroups = indiaGroups.filter((group) => group.active !== false);

console.log(
  `Upstream: ${upstream.length} CNCF groups, ${indiaGroups.length} in India (${activeIndiaGroups.length} active).`
);

// Guard against acting on a degraded upstream response: a partial listing would
// otherwise look like a mass removal.
const floor = Math.max(20, Math.floor(syncedCities.length * 0.7));
if (activeIndiaGroups.length < floor) {
  throw new Error(
    `Refusing to sync: upstream returned only ${activeIndiaGroups.length} active India groups, expected at least ${floor}.`
  );
}

const upstreamBySlug = new Map(activeIndiaGroups.map((group) => [group.slug, group]));
const localOcgSlugs = new Set(syncedCities.map((entry) => entry.ocgSlug));

const added = [];
const removed = [];
const newStates = [];
const warnings = [];

// ── Removals ────────────────────────────────────────────────────────────────

for (const { state, city, ocgSlug } of syncedCities) {
  if (upstreamBySlug.has(ocgSlug)) continue;

  const inactive = indiaGroups.some((group) => group.slug === ocgSlug);
  const reason = inactive ? "deactivated upstream" : "no longer listed upstream";

  state.cities = state.cities.filter((candidate) => candidate !== city);
  if (!dryRun) removeLocalIcon(city.iconUrl);
  removed.push({ citySlug: city.slug, stateSlug: state.slug, ocgSlug, reason });
  console.log(`  - ${city.slug} (${state.slug}) — ${reason}`);
}

for (const state of [...groups]) {
  if ((state.cities ?? []).length === 0) {
    groups.splice(groups.indexOf(state), 1);
    takenStateSlugs.delete(state.slug);
    stateBySlug.delete(state.slug);
    console.log(`  - state ${state.slug} — no groups left`);
    warnings.push(`Removed empty state \`${state.slug}\`.`);
  }
}

// ── Additions ───────────────────────────────────────────────────────────────

const stateFeatures = loadStateFeatures();

for (const group of activeIndiaGroups) {
  if (localOcgSlugs.has(group.slug)) continue;

  if (IGNORED_OCG_SLUGS.has(group.slug)) {
    console.log(
      `  skip ${group.slug} (${group.name}) — ignored: ${IGNORED_OCG_SLUGS.get(group.slug)}`
    );
    continue;
  }

  if (typeof group.latitude !== "number" || typeof group.longitude !== "number") {
    warnings.push(
      `Skipped **${group.name}** (\`${group.slug}\`): upstream has no coordinates, so its state cannot be resolved. Add it to data/groups.yaml by hand.`
    );
    console.warn(`  skip ${group.slug} (${group.name}) — no coordinates upstream`);
    continue;
  }

  const point = [group.longitude, group.latitude];
  const { feature, exact } = resolveStateFeature(point, stateFeatures);

  if (!feature) {
    warnings.push(
      `Skipped **${group.name}** (\`${group.slug}\`): could not resolve an Indian state for ${group.latitude}, ${group.longitude}.`
    );
    console.warn(`  skip ${group.slug} (${group.name}) — state unresolved`);
    continue;
  }

  const stateSlug = STATE_SLUG_OVERRIDES.get(feature.name) ?? slugify(feature.name);
  let state = stateBySlug.get(stateSlug);

  if (!state) {
    const centre = featureCentre(feature);
    state = {
      slug: stateSlug,
      name: feature.name,
      lat: centre.lat,
      lng: centre.lng,
      cities: [],
    };
    groups.push(state);
    stateBySlug.set(stateSlug, state);
    takenStateSlugs.add(stateSlug);
    newStates.push(stateSlug);
    warnings.push(
      `New state \`${stateSlug}\` added with a bounding-box centre (${centre.lat}, ${centre.lng}) — replace it with a proper centroid if the map looks off.`
    );
    console.log(`  + state ${stateSlug} (${feature.name})`);
  }

  const cityName = cityNameFor(group);
  const citySlug = citySlugFor(group, cityName, takenCitySlugs);
  takenCitySlugs.add(citySlug);
  localOcgSlugs.add(group.slug);

  state.cities.push({
    slug: citySlug,
    name: cityName,
    lat: round(group.latitude),
    lng: round(group.longitude),
    ocGroupUrl: `${OCG_ORIGIN}/cncf/group/${group.slug}`,
  });

  added.push({ citySlug, cityName, stateSlug, ocgSlug: group.slug, exact });
  console.log(`  + ${citySlug} "${cityName}" → ${stateSlug} (${group.name})`);

  if (!exact) {
    warnings.push(
      `\`${citySlug}\` fell back to the nearest state (\`${stateSlug}\`) because ${group.latitude}, ${group.longitude} is outside every state polygon — please verify.`
    );
  }
}

// ── Write ───────────────────────────────────────────────────────────────────

const changed = added.length > 0 || removed.length > 0;

if (changed && !dryRun) {
  writeGroups(groups);
  console.log(`\nWrote ${path.relative(root, groupsYamlPath)}.`);
} else if (changed) {
  console.log("\n--dry-run: data/groups.yaml left untouched.");
} else {
  console.log("\nNo roster changes.");
}

console.log(
  `Done. added=${added.length}, removed=${removed.length}, newStates=${newStates.length}, warnings=${warnings.length}`
);

// ── Job summary (GitHub Actions) ─────────────────────────────────────────────

if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = ["## CNCG group roster sync", ""];

  if (!changed) {
    lines.push(
      `No changes — ${activeIndiaGroups.length} active India groups upstream, all already tracked.`
    );
  }

  if (added.length) {
    lines.push("### Added", "");
    for (const entry of added) {
      lines.push(
        `- \`${entry.citySlug}\` — ${entry.cityName} (state \`${entry.stateSlug}\`, [ocgroups.dev](${OCG_ORIGIN}/cncf/group/${entry.ocgSlug}))`
      );
    }
    lines.push(
      "",
      "New entries carry only slug/name/coordinates and the upstream link — add `organizer`, `description`, and socials when you can.",
      ""
    );
  }

  if (removed.length) {
    lines.push("### Removed", "");
    for (const entry of removed) {
      lines.push(
        `- \`${entry.citySlug}\` (state \`${entry.stateSlug}\`) — ${entry.reason}`
      );
    }
    lines.push("");
  }

  if (warnings.length) {
    lines.push("### Needs a human look", "");
    for (const warning of warnings) lines.push(`- ${warning}`);
    lines.push("");
  }

  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
}
