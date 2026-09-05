#!/usr/bin/env node
/**
 * Regenerate the STATES / CITIES arrays in scripts/smoke-test.sh from
 * data/groups.yaml, so `npm run smoke:verify` keeps passing after the roster
 * changes (by hand or via scripts/sync-ocg-groups.mjs).
 *
 * Layout: STATES wrapped to 80 columns, CITIES one line per state (wrapped the
 * same way) so the per-state grouping stays readable in review.
 */
import fs from "node:fs";
import path from "node:path";
import { readGroups, root } from "./groups-yaml.mjs";

const smokePath = path.join(root, "scripts", "smoke-test.sh");
const INDENT = " ".repeat(8);
const MAX_WIDTH = 80;

// The verifier parses these two blocks positionally: STATES=(…), a blank line,
// CITIES=(…), a blank line, then the "# Pre-build resolve" comment.
const BLOCK_RE =
  /STATES=\([\s\S]*?\)\n\nCITIES=\([\s\S]*?\)\n\n# Pre-build resolve/;

function wrapSlugs(slugs, firstPrefix) {
  const lines = [];
  let current = null;

  for (const slug of slugs) {
    if (current === null) {
      current = `${firstPrefix}${slug}`;
    } else if (current.length + 1 + slug.length > MAX_WIDTH) {
      lines.push(current);
      current = `${INDENT}${slug}`;
    } else {
      current += ` ${slug}`;
    }
  }

  if (current !== null) lines.push(current);
  return lines;
}

const groups = readGroups();
const stateSlugs = groups.map((state) => state.slug);
const cityCount = groups.flatMap((state) => state.cities ?? []).length;

const statesLines = wrapSlugs(stateSlugs, "STATES=(");

const cityLines = [];
for (const state of groups) {
  const slugs = (state.cities ?? []).map((city) => city.slug);
  if (slugs.length === 0) continue;
  cityLines.push(...wrapSlugs(slugs, cityLines.length === 0 ? "CITIES=(" : INDENT));
}

const block = `${statesLines.join("\n")})\n\n${cityLines.join("\n")})\n\n# Pre-build resolve`;

const original = fs.readFileSync(smokePath, "utf8");

if (!BLOCK_RE.test(original)) {
  throw new Error(
    "Could not locate the STATES=/CITIES= blocks in scripts/smoke-test.sh"
  );
}

const next = original.replace(BLOCK_RE, block);

if (next === original) {
  console.log(
    `OK: scripts/smoke-test.sh already matches data/groups.yaml (${stateSlugs.length} states, ${cityCount} cities).`
  );
} else {
  fs.writeFileSync(smokePath, next);
  console.log(
    `Updated scripts/smoke-test.sh (${stateSlugs.length} states, ${cityCount} cities).`
  );
}
