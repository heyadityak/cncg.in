#!/usr/bin/env node
/**
 * Shared read/write helpers for data/groups.yaml.
 *
 * Every sync script must write through writeGroups() so they all emit the same
 * header and formatting — otherwise each scheduled run rewrites the previous
 * script's header and produces noisy diffs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const root = path.join(__dirname, "..");
export const groupsYamlPath = path.join(root, "data", "groups.yaml");

const HEADER = `# CNCG community groups across India
# Edit this file to add or update groups by hand — the sync scripts keep it fresh.
# Groups are added/removed by scripts/sync-ocg-groups.mjs (weekly)
# latestEvent, iconUrl, and iconSourceUrl are updated by scripts/sync-ocg-events.mjs
# cfpUrl is updated by scripts/sync-ocg-cfp.mjs from ocgroups.dev group descriptions
# iconUrl points to mirrored files under public/group-icons/

`;

export function readGroups() {
  const groups = parse(fs.readFileSync(groupsYamlPath, "utf8"));
  if (!Array.isArray(groups)) {
    throw new Error("data/groups.yaml must contain a top-level array of states");
  }
  return groups;
}

export function writeGroups(groups) {
  const body = stringify(groups, {
    lineWidth: 0,
    defaultKeyType: "PLAIN",
    defaultStringType: "QUOTE_DOUBLE",
  });
  fs.writeFileSync(groupsYamlPath, `${HEADER}${body}`);
}
