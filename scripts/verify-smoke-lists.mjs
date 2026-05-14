#!/usr/bin/env node
/**
 * Ensure scripts/smoke-test.sh STATES / CITIES match slugs in data/groups.ts.
 * Convention: state slugs use 4-space indent, city slugs use 8-space indent
 * before `slug: "…",` in the `groups` array (not in TypeScript type blocks).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const groupsPath = path.join(root, "data", "groups.ts");
const smokePath = path.join(root, "scripts", "smoke-test.sh");

function slugsFromGroupsTs(text) {
  const states = [];
  const cities = [];
  const inGroups =
    /export const groups\s*=\s*\[/.test(text) ||
    text.includes("export const groups: StateGroup[] = [");
  if (!inGroups) {
    throw new Error("Could not find groups array export in data/groups.ts");
  }
  // Only count slug lines inside the file body; skip `slug: string` type lines.
  for (const line of text.split("\n")) {
    const state = line.match(/^    slug: "([^"]+)",\s*$/);
    if (state) states.push(state[1]);
    const city = line.match(/^        slug: "([^"]+)",\s*$/);
    if (city) cities.push(city[1]);
  }
  return { states, cities };
}

function parseSmokeArrays(script) {
  const states = [];
  const cities = [];
  const st = script.match(/STATES=\(([\s\S]*?)\)\n\nCITIES=/);
  const ci = script.match(/CITIES=\(([\s\S]*?)\)\n\n# Pre-build resolve/);
  if (!st || !ci) {
    throw new Error("Could not parse STATES=/CITIES= from smoke-test.sh");
  }
  for (const w of st[1].trim().split(/\s+/)) {
    if (w) states.push(w);
  }
  for (const w of ci[1].trim().split(/\s+/)) {
    if (w) cities.push(w);
  }
  return { states, cities };
}

function sameOrder(a, b, label) {
  if (a.length !== b.length) {
    return `  ${label}: length ${a.length} (groups.ts) vs ${b.length} (smoke-test.sh)`;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return `  ${label}: first diff at [${i}]: "${a[i]}" vs "${b[i]}"`;
    }
  }
  return null;
}

const groupsText = fs.readFileSync(groupsPath, "utf8");
const smokeText = fs.readFileSync(smokePath, "utf8");

const fromData = slugsFromGroupsTs(groupsText);
const fromSmoke = parseSmokeArrays(smokeText);

const stateErr = sameOrder(fromData.states, fromSmoke.states, "STATES");
const cityErr = sameOrder(fromData.cities, fromSmoke.cities, "CITIES");

if (stateErr || cityErr) {
  console.error("smoke-test.sh is out of sync with data/groups.ts:\n");
  if (stateErr) console.error(stateErr);
  if (cityErr) console.error(cityErr);
  console.error("\nUpdate the STATES= and CITIES= arrays in scripts/smoke-test.sh.");
  process.exit(1);
}

console.log(
  `OK: smoke-test.sh matches data/groups.ts (${fromData.states.length} states, ${fromData.cities.length} cities).`
);
