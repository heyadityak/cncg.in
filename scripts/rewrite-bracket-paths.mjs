#!/usr/bin/env node
// Post-build: rename `[param]` directories to `_param_` and patch every
// reference in HTML / JS / JSON files. Required because Cloudflare's
// static-asset bucket matches paths literally — when the browser fetches
// `/_next/static/chunks/app/state/%5Bstate%5D/page-XXX.js`, the URL-encoded
// `%5B` / `%5D` don't match the on-disk `[state]` directory name and the
// asset bucket returns a 404 "Not Found" with `Content-Type: text/plain`,
// which the browser then refuses to execute as a script.

import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".vercel/output/static");

// Map of `<original>` → `<replacement>` segment names.
// Keep this list aligned with every dynamic segment used in app/ routes.
const RENAMES = [
  { from: "[state]", to: "_state_" },
  { from: "[city]", to: "_city_" },
];

const TEXT_EXTS = new Set([
  ".html", ".js", ".mjs", ".cjs", ".css", ".json", ".rsc", ".txt", ".map",
]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : [full];
      })
    )
  ).flat();
}

async function renameBracketDirs() {
  const queue = [ROOT];
  const renames = [];
  while (queue.length) {
    const dir = queue.pop();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        const match = RENAMES.find((r) => r.from === e.name);
        if (match) {
          const next = path.join(dir, match.to);
          renames.push([full, next]);
        } else {
          queue.push(full);
        }
      }
    }
  }
  // Sort deepest-first so a parent rename never invalidates a child path.
  renames.sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of renames) {
    await fs.rename(from, to);
    console.log(`renamed: ${path.relative(ROOT, from)} → ${path.relative(ROOT, to)}`);
    // Recurse into the renamed dir to catch nested bracket dirs (e.g. [state]/[city]).
    queue.push(to);
  }
  while (queue.length) {
    const dir = queue.pop();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const full = path.join(dir, e.name);
      const match = RENAMES.find((r) => r.from === e.name);
      if (match) {
        const next = path.join(dir, match.to);
        await fs.rename(full, next);
        console.log(`renamed: ${path.relative(ROOT, full)} → ${path.relative(ROOT, next)}`);
        queue.push(next);
      } else {
        queue.push(full);
      }
    }
  }
}

async function patchFiles() {
  // Also patch files inside the compiled worker bundle so its routing tables
  // refer to the new directory names.
  const targets = [ROOT, path.resolve(".vercel/output/static/_worker.js")];
  const files = (
    await Promise.all(targets.map((t) => walk(t).catch(() => [])))
  ).flat();
  let patched = 0;
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_EXTS.has(ext)) continue;
    let content;
    try {
      content = await fs.readFile(file, "utf8");
    } catch {
      continue;
    }
    const original = content;
    for (const { from, to } of RENAMES) {
      // Replace literal bracketed form: `/state/[state]/`
      content = content.split(`/${from}/`).join(`/${to}/`);
      content = content.split(`/${from}"`).join(`/${to}"`);
      content = content.split(`/${from}'`).join(`/${to}'`);
      // Replace URL-encoded form just in case anything emits it.
      const encoded = encodeURIComponent(from);
      content = content.split(`/${encoded}/`).join(`/${to}/`);
    }
    if (content !== original) {
      await fs.writeFile(file, content);
      patched++;
    }
  }
  console.log(`patched ${patched} files`);
}

await renameBracketDirs();
await patchFiles();
console.log("done.");
