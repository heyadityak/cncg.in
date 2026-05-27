#!/usr/bin/env node
/**
 * Build data/groups.json from data/groups.yaml for app imports.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const yamlPath = path.join(root, "data", "groups.yaml");
const jsonPath = path.join(root, "data", "groups.json");

const yaml = fs.readFileSync(yamlPath, "utf8");
const groups = parse(yaml);

if (!Array.isArray(groups)) {
  throw new Error("data/groups.yaml must contain a top-level array of states");
}

fs.writeFileSync(jsonPath, `${JSON.stringify(groups, null, 2)}\n`);
console.log(
  `Built ${path.relative(root, jsonPath)} from ${path.relative(root, yamlPath)} (${groups.length} states).`
);
