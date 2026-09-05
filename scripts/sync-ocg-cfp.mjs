#!/usr/bin/env node
/**
 * Extract speaker CFP Google Form links from ocgroups.dev group descriptions
 * and update data/groups.yaml (cfpUrl field).
 *
 * Resolves forms.gle, goo.gl/forms, and other shorteners to canonical viewform URLs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { writeGroups } from "./groups-yaml.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const yamlPath = path.join(root, "data", "groups.yaml");
const USER_AGENT = "CNCG-India/1.0 (+https://cncg.in)";
const CONCURRENCY = 6;

const URL_RE = /https?:\/\/[^\s"'<>)\\]+/gi;
const RESOLVABLE_HOSTS = new Set([
  "bit.ly",
  "goo.gl",
  "tinyurl.com",
  "t.co",
  "forms.gle",
]);

function decodeHtml(text) {
  return text
    .replace(/&#38;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/\\_/g, "_")
    .replace(/\\"/g, '"');
}

function extractMarkdownBlocks(html) {
  const blocks = [];
  const re = /class="[^"]*markdown[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    blocks.push(decodeHtml(match[1]));
  }

  // Social / action links with explicit CFP titles
  const iconRe =
    /href="(https?:\/\/[^"]+)"[^>]*title="Submit CFP"|title="Submit CFP"[^>]*href="(https?:\/\/[^"]+)"/gi;
  while ((match = iconRe.exec(html)) !== null) {
    blocks.push(`CFP @ ${match[1] || match[2]}`);
  }

  return blocks.join("\n");
}

function extractUrls(text) {
  return [...text.matchAll(URL_RE)].map((m) =>
    decodeHtml(m[0].replace(/[.,;:!?)]+$/, ""))
  );
}

function isGoogleForm(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "forms.gle") return true;
    if (u.hostname === "docs.google.com" && u.pathname.includes("/forms/"))
      return true;
    if (u.hostname === "goo.gl" && u.pathname.startsWith("/forms/")) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function canonicalFormUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname === "docs.google.com" && u.pathname.includes("/forms/")) {
      return `${u.origin}${u.pathname.split("?")[0]}`;
    }
  } catch {
    /* ignore */
  }
  return url;
}

function paragraphForUrl(text, url) {
  const idx = text.indexOf(url);
  if (idx < 0) return text.toLowerCase();

  const before = text.slice(0, idx);
  const paraStart = Math.max(before.lastIndexOf("<p"), before.lastIndexOf("<li"));
  const after = text.slice(idx + url.length);
  const paraEndRel = after.search(/<\/p>|<\/li>/);
  const paraEnd =
    paraEndRel >= 0 ? idx + url.length + paraEndRel : idx + url.length + 120;

  return text
    .slice(paraStart >= 0 ? paraStart : Math.max(0, idx - 120), paraEnd)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function scoreCfpContext(text, url) {
  const ctx = paragraphForUrl(text, url);

  let score = 0;
  if (/\bcfp\b|call for (?:proposals?|propsals?|papers?|speakers?)/.test(ctx))
    score += 20;
  if (
    /submit (?:a )?(?:talk|proposal|cfp)|speaker registration|interested in (?:speaking|giving a talk|presenting)|talk proposal|speaker proposal|session suggestions|submit your proposal|present any topic|interested to talk|submit a talk|be a speaker|speaker\/cfp/.test(
      ctx
    )
  )
    score += 10;
  if (/interested in speaking|giving a talk|this form|interested in presenting/.test(ctx))
    score += 6;
  if (/volunteer(?:ing)?\b/.test(ctx)) score -= 25;
  if (/sponsor(?:ship)?|support us with venue|food or swag/.test(ctx)) score -= 20;
  if (/rsvp|registration|register|attendee|ticket|waitlist|reminder on future/.test(ctx))
    score -= 15;

  return score;
}

async function resolveToGoogleForm(url) {
  if (!isGoogleForm(url)) return null;

  let current = url;
  for (let depth = 0; depth < 6; depth += 1) {
    try {
      const host = new URL(current).hostname;
      const needsResolve =
        RESOLVABLE_HOSTS.has(host) ||
        ["bit.ly", "goo.gl", "tinyurl.com", "t.co"].includes(host);

      if (!needsResolve && isGoogleForm(current)) {
        return canonicalFormUrl(current);
      }

      const res = await fetch(current, {
        redirect: "follow",
        headers: { "User-Agent": USER_AGENT },
      });
      const final = res.url || current;
      if (isGoogleForm(final)) return canonicalFormUrl(final);
      if (final === current) break;
      current = final;
    } catch {
      break;
    }
  }

  return isGoogleForm(current) ? canonicalFormUrl(current) : null;
}

async function extractCfpUrl(ocGroupUrl) {
  const res = await fetch(ocGroupUrl, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const markdown = extractMarkdownBlocks(html);
  if (!markdown.trim()) return null;

  const candidates = [];
  const seen = new Set();

  for (const rawUrl of extractUrls(markdown)) {
    if (seen.has(rawUrl)) continue;
    seen.add(rawUrl);

    const score = scoreCfpContext(markdown, rawUrl);
    if (score <= 0) continue;

    const resolved = await resolveToGoogleForm(rawUrl);
    if (!resolved) continue;

    candidates.push({ url: resolved, score, raw: rawUrl });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.url ?? null;
}

async function mapWithConcurrency(items, concurrency, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  );
  return results;
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
    targets.push(city);
  }
}

console.log(`Syncing CFP URLs from OCG descriptions for ${targets.length} groups…`);

let updated = 0;
let cleared = 0;
let unchanged = 0;
let failed = 0;

await mapWithConcurrency(targets, CONCURRENCY, async (city) => {
  const previous = city.cfpUrl ?? null;
  try {
    const cfpUrl = await extractCfpUrl(city.ocGroupUrl);
    if (cfpUrl === previous) {
      unchanged += 1;
      return;
    }
    if (cfpUrl) {
      city.cfpUrl = cfpUrl;
      updated += 1;
      console.log(`  updated ${city.slug}: ${cfpUrl}`);
    } else if (previous) {
      delete city.cfpUrl;
      cleared += 1;
      console.log(`  cleared ${city.slug}`);
    } else {
      unchanged += 1;
    }
  } catch (error) {
    failed += 1;
    console.error(`  failed ${city.slug}: ${error.message}`);
  }
});

writeGroups(groups);

console.log(
  `\nDone. updated=${updated}, cleared=${cleared}, unchanged=${unchanged}, failed=${failed}`
);

if (failed > 0) process.exitCode = 1;

await import("./build-groups.mjs");
