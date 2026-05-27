#!/usr/bin/env node
/**
 * Ensure scripts/smoke-test.sh STATES / CITIES match slugs in data/groups.yaml.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const groupsYamlPath = path.join(root, "data", "groups.yaml");
const smokePath = path.join(root, "scripts", "smoke-test.sh");

function slugsFromGroupsYaml(text) {
  const groups = parse(text);
  if (!Array.isArray(groups)) {
    throw new Error("data/groups.yaml must contain a top-level array");
  }
  const states = groups.map((g) => g.slug);
  const cities = groups.flatMap((g) => g.cities.map((c) => c.slug));
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
    return `  ${label}: length ${a.length} (groups.yaml) vs ${b.length} (smoke-test.sh)`;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return `  ${label}: first diff at [${i}]: "${a[i]}" vs "${b[i]}"`;
    }
  }
  return null;
}

const groupsText = fs.readFileSync(groupsYamlPath, "utf8");
const smokeText = fs.readFileSync(smokePath, "utf8");

const fromData = slugsFromGroupsYaml(groupsText);
const fromSmoke = parseSmokeArrays(smokeText);

const stateErr = sameOrder(fromData.states, fromSmoke.states, "STATES");
const cityErr = sameOrder(fromData.cities, fromSmoke.cities, "CITIES");

if (stateErr || cityErr) {
  console.error("smoke-test.sh is out of sync with data/groups.yaml:\n");
  if (stateErr) console.error(stateErr);
  if (cityErr) console.error(cityErr);
  console.error("\nUpdate the STATES= and CITIES= arrays in scripts/smoke-test.sh.");
  process.exit(1);
}

console.log(
  `OK: smoke-test.sh matches data/groups.yaml (${fromData.states.length} states, ${fromData.cities.length} cities).`
);
