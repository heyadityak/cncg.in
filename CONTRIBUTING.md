# Contributing to CNCG India

First of all — thank you for taking the time to contribute. CNCG India is an independent, community-run directory of Cloud Native Computing Foundation (CNCF) community groups across India, and it stays useful only because people like you keep it current.

This document is the canonical guide for contributors. If anything here is unclear or outdated, that itself is a worthy PR.

> **Note.** CNCG India is **not affiliated with, endorsed by, or sponsored by** the Cloud Native Computing Foundation or The Linux Foundation. We are a fan-run index linking out to the official [Open Community Groups](https://ocgroups.dev) listings.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Ways to Contribute](#ways-to-contribute)
3. [Project Layout](#project-layout)
4. [Local Setup](#local-setup)
5. [Adding or Updating a Community Group](#adding-or-updating-a-community-group)
6. [Reporting an Issue](#reporting-an-issue)
7. [Submitting Code Changes](#submitting-code-changes)
8. [Coding Conventions](#coding-conventions)
9. [Testing & Verification](#testing--verification)
10. [Deployment Pipeline](#deployment-pipeline)
11. [License & Sign-off](#license--sign-off)

---

## Code of Conduct

Be kind. Be patient. Assume good faith. This project follows the spirit of the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). Harassment, discrimination, or personal attacks against any contributor or community are not tolerated and will result in being removed from the project.

If you encounter unacceptable behaviour, please open a confidential email to the project owner listed in the repository profile.

---

## Ways to Contribute

You don't need to write code to contribute. We welcome:

- **Adding a community group** (most common ask — see the [data section below](#adding-or-updating-a-community-group)).
- **Fixing typos** in city names, descriptions, or organiser names.
- **Updating links** when an Open Community Groups URL changes.
- **Fixing bugs** in the map, routing, or page rendering.
- **Improving accessibility** (alt text, keyboard navigation, contrast).
- **Improving performance** or bundle size.
- **Improving documentation** — including this file.
- **Triaging issues** by reproducing reports and adding relevant context.

The smallest fixes are often the most valuable. A 3-line PR fixing a city name is a great PR.

---

## Project Layout

```
cncg.in/
├── app/                          Next.js App Router pages
│   ├── page.tsx                  Home (India map + nearest-group widget)
│   ├── state/[state]/page.tsx    State city list + map
│   ├── city/[city]/page.tsx      City group detail + join CTA
│   ├── not-found.tsx             404 page
│   └── layout.tsx                Root layout + global metadata
├── components/                   Reusable UI components
│   ├── india-map.tsx             SVG India choropleth (no map lib)
│   ├── india-map-client.tsx      Dynamic client wrapper
│   ├── city-map.tsx              Leaflet mini-map (city/state)
│   ├── city-map-client.tsx       Dynamic client wrapper
│   ├── join-cta.tsx              "Join Community" / social link block
│   ├── nearest-group.tsx         Geolocation-based suggestion
│   └── site-footer.tsx           Shared footer + CNCF disclaimer
├── data/
│   ├── groups.yaml               Source of truth for all CNCG entries
│   ├── groups.json               Generated from groups.yaml (do not edit by hand)
│   └── groups.ts                 Types + helpers
├── public/
│   ├── india-states-simple.geojson  Map data (India + UTs)
│   ├── _headers                  CDN response headers
│   └── _redirects                CDN-level redirect rules
├── scripts/
│   ├── build-groups.mjs          YAML → JSON for app imports
│   ├── rewrite-bracket-paths.mjs Post-build: rename [state]/[city] dirs
│   └── smoke-test.sh             Post-deploy URL health check
├── middleware.ts                 Subdomain routing (state/city rewrites)
├── wrangler.toml                 Cloudflare Worker config
├── Taskfile.yml                  Task runner (https://taskfile.dev)
└── .github/workflows/deploy.yml  CI/CD to Cloudflare Workers
```

---

## Local Setup

### Prerequisites

| Tool | Why | Install |
|---|---|---|
| **Node.js 24+** | Build the Next.js app (LTS) | [nodejs.org](https://nodejs.org) |
| **npm** | Package management (ships with Node) | — |
| **Task** *(optional)* | Convenience commands | `brew install go-task` |
| **wrangler** *(optional)* | Cloudflare CLI; only needed if you plan to deploy locally | `npm i -g wrangler` |

### Clone and install

```bash
git clone https://github.com/heyadityak/cncg.in.git
cd cncg.in
npm install
```

This project uses `legacy-peer-deps=true` (declared in `.npmrc`) because `react-simple-maps@3` lists React `<=18` as a peer dep even though it works on React 19.

### Run the dev server

```bash
npm run dev          # or: task dev
```

The app starts at <http://localhost:3000>. In dev, the middleware passes through and you can navigate via paths:

| URL | What it shows |
|---|---|
| `localhost:3000/` | India map (home) |
| `localhost:3000/state/karnataka` | Karnataka city list |
| `localhost:3000/city/bangalore` | Bengaluru group page |

---

## Adding or Updating a Community Group

This is the most common contribution and you don't need any web-dev experience to do it.

### Step 1 — confirm the group exists on ocgroups.dev

CNCG India is a directory, not a registry. Every group we list must have a corresponding entry on <https://ocgroups.dev> (the official CNCF Open Community Groups platform). If the group you want to add is not on ocgroups.dev yet, please first apply through <https://community.cncf.io/chapters>.

### Step 2 — open `data/groups.yaml`

The file is a YAML array of states. Find the state your city belongs to, or add a new state entry if needed.

Each state and city entry uses these fields (types are defined in `data/groups.ts`):

`latestEvent`, `iconUrl`, and `iconSourceUrl` are **auto-synced** from [ocgroups.dev](https://ocgroups.dev) every 6 hours — do not edit them by hand. Icons are mirrored to `public/group-icons/` and served locally.

```ts
type CityGroup = {
  slug: string;        // kebab-case URL slug — becomes `<slug>.cncg.in`
  name: string;        // Display name (e.g. "Bengaluru")
  lat: number;         // Approximate city centroid latitude
  lng: number;         // Approximate city centroid longitude
  organizer?: string;  // Optional organiser name
  description?: string; // Optional 1–2 sentence blurb
  ocGroupUrl?: string; // Full https://ocgroups.dev/... URL
  twitterUrl?: string; // Optional
  linkedinUrl?: string; // Optional
};

type StateGroup = {
  slug: string;        // kebab-case URL slug — becomes `<slug>.cncg.in`
  name: string;        // Display name (e.g. "Karnataka")
  lat: number;         // State centroid (used for map centering)
  lng: number;
  cities: CityGroup[];
};
```

### Step 3 — add the entry

Example: adding Indore (Madhya Pradesh) — a brand-new state:

```yaml
- slug: "madhya-pradesh"
  name: "Madhya Pradesh"
  lat: 22.9734
  lng: 78.6569
  cities:
    - slug: "indore"
      name: "Indore"
      lat: 22.7196
      lng: 75.8577
      ocGroupUrl: "https://ocgroups.dev/cncf/group/abcd123"
```

Example: adding a new city to an existing state — Bhubaneswar in Odisha:

```yaml
# Inside the existing `odisha` state's `cities` list:
- slug: "bhubaneswar"
  name: "Bhubaneswar"
  lat: 20.2961
  lng: 85.8245
  ocGroupUrl: "https://ocgroups.dev/cncf/group/xyz456"
```

### Step 4 — confirm slug conventions

- `slug` must be **lowercase, hyphen-separated, ASCII only**.
- The slug becomes the subdomain (`<slug>.cncg.in`) and the URL segment, so keep it short and recognisable.
- For states, prefer the official short name (e.g. `tamil-nadu`, not `tamilnadu` and not `tn`).
- For cities, prefer the modern Indian name (e.g. `bengaluru` over `bangalore` when the group itself uses the modern name).

### Step 5 — build and preview

```bash
npm run build       # type-check + Next.js static export
npm run dev         # visit localhost:3000/city/<your-slug> to preview
```

If the build passes and the page renders, you're ready to open a PR.

---

## Reporting an Issue

Before opening an issue, please:

1. Check the [existing issues](https://github.com/heyadityak/cncg.in/issues) for duplicates.
2. Try to reproduce the problem in the latest deploy (<https://cncg.in>) and locally with `npm run dev`.

A great bug report contains:

- **What you expected to happen.**
- **What actually happened** (paste the exact error / screenshot the page).
- **Steps to reproduce.**
- **Environment** — browser, OS, whether you were on Wi-Fi or mobile data, whether geolocation was allowed.
- **Console output** — open DevTools, copy any red errors.

For visual bugs, a screenshot or short screen recording is almost always faster than describing the issue.

---

## Submitting Code Changes

### Fork and branch

```bash
gh repo fork heyadityak/cncg.in --clone
cd cncg.in
git checkout -b feat/short-descriptive-branch-name
```

Use a short prefix on your branch:

| Prefix | When |
|---|---|
| `feat/` | New feature or visible change |
| `fix/` | Bug fix |
| `data/` | Group data updates only |
| `docs/` | Documentation only |
| `chore/` | Build, deps, tooling |

### Make focused commits

Each commit should do **one** thing. Squash trivial WIP commits before opening the PR.

We use [Conventional Commits](https://www.conventionalcommits.org/) for the subject line — at minimum one of the prefixes above followed by a colon. The body should explain *why*, not what (the diff already shows what).

Example:

```
fix: prevent ChunkLoadError on subdomain navigation

Cloudflare Workers Assets refuses to serve files inside URL-encoded
bracket directories (%5Bstate%5D). The post-build script now renames
the bracket dirs to underscore form so the asset bucket can match
them. Without this, navigating from a city page to a state list
throws ChunkLoadError when the stale webpack runtime asks for the
old chunk path.
```

### Open a Pull Request

Push your branch and open a PR against `main`. The PR template will prompt you for:

- A summary of the change.
- A test plan (what you verified manually).
- Any linked issues.

If your PR touches `data/groups.yaml`, please include in the description:

- The `ocgroups.dev` URL for any new group.
- Confirmation that you ran `npm run build` and `npm run lint`.

### What to expect after opening a PR

- **CI** will run on the PR — see `.github/workflows/deploy.yml`. CI builds the site for Cloudflare and (on `main`) deploys it. PR previews are not currently set up.
- A maintainer will review within a few days. Smaller and clearer PRs get merged faster — that's true everywhere but especially true here.
- If review feedback is given, push fixup commits to the same branch; the PR will update automatically.

---

## Coding Conventions

- **TypeScript everywhere.** No `any` unless the surrounding type system actively fights you, and even then leave a comment.
- **Functional React components.** No class components.
- **Server Components by default.** Only add `"use client"` when the component needs hooks, browser APIs, or event handlers. Map components are client-only for obvious reasons.
- **Tailwind for styling.** No CSS modules or inline `style` props unless absolutely necessary for dynamic values (e.g. computed SVG coordinates).
- **Lucide for icons.** Stay consistent across the app.
- **No comments narrating what code does.** Comments should explain *why* — trade-offs, edge cases, non-obvious decisions. The code itself is what.
- **kebab-case file names** for components (`site-footer.tsx`, not `SiteFooter.tsx`).
- **Named exports** for utilities, **default exports** for React components.

Run the linter before pushing:

```bash
npm run lint
```

---

## Testing & Verification

This project currently relies on three forms of verification — there's no Jest / Vitest unit-test suite yet (a great first contribution if you'd like to add one).

### 1. The TypeScript compiler

`npm run build` will fail if any type is wrong. Treat it as your primary safety net.

### 2. ESLint

`npm run lint` catches unused variables, common React mistakes, and Next.js anti-patterns.

### 3. The smoke test

`scripts/smoke-test.sh` hits every subdomain (root + 15 states + 41 cities + a couple of static asset paths) against the live deployment and asserts the expected HTTP status code. Run it after deploying to confirm the routing tier is healthy:

```bash
./scripts/smoke-test.sh
```

If you add a new state or city, please update the `STATES` / `CITIES` arrays in that script so it stays in sync.

---

## Deployment Pipeline

You almost certainly don't need to deploy yourself — pushing to `main` triggers the [GitHub Actions workflow](.github/workflows/deploy.yml) which builds and deploys to Cloudflare Workers.

If you want to deploy manually (e.g. you're a maintainer and need to hotfix):

```bash
task deploy            # one-step: build + deploy
# or, equivalently:
npm run build:cf       # build + run post-build path rewrites
npx wrangler deploy
```

The build pipeline:

1. `npx @cloudflare/next-on-pages` — runs `next build` and adapts the output for Cloudflare's edge runtime.
2. `node scripts/rewrite-bracket-paths.mjs` — renames `[state]`/`[city]` dirs to `_state_`/`_city_` and patches every reference. Cloudflare's asset bucket cannot serve files inside URL-encoded bracket directories.
3. `.assetsignore` — keeps the Worker bundle directory out of the static-asset upload.
4. `wrangler deploy` — uploads everything and binds the routes `cncg.in/*` and `*.cncg.in/*`.

The middleware (`middleware.ts`) handles the subdomain routing inside the Worker.

---

## License & Sign-off

This project is licensed under the [MIT License](./LICENSE). By contributing, you agree that your contributions will be licensed under the same terms.

You don't need a CLA or DCO sign-off — opening a pull request is itself an affirmative declaration that you have the right to contribute the code and license it under MIT.

---

Thanks again for contributing. The Indian cloud-native community is better because of you.
