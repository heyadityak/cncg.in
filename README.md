# cncg.in — Cloud Native Community Groups India

A subdomain-routed Next.js site deployed on Cloudflare Workers that helps people discover [Cloud Native Computing Foundation](https://cncf.io) (CNCF) community groups across India.

> **Disclaimer.** This is an independent, community-run directory. CNCG India is **not affiliated with, endorsed by, or sponsored by** the Cloud Native Computing Foundation or The Linux Foundation. All trademarks belong to their respective owners.

Live at <https://cncg.in>.

## URL Structure

| URL | Page |
|---|---|
| `cncg.in` | India map — clickable states + nearest-group widget |
| `karnataka.cncg.in` | Karnataka state page — city list + map |
| `bangalore.cncg.in` | Bengaluru group page — info, map, "Join Community" CTA |
| `xyz.cncg.in` | Unknown subdomain → 301 redirect to `cncg.in` |

The middleware in `middleware.ts` parses the host header and rewrites `<slug>.cncg.in/` to `/state/<slug>` or `/city/<slug>` at the Cloudflare edge.

## Local Development

```bash
npm install
npm run dev
```

App starts at <http://localhost:3000>. In dev, the middleware passes through and you navigate via paths:

| URL | What it shows |
|---|---|
| `localhost:3000/` | India map (home) |
| `localhost:3000/state/karnataka` | Karnataka city list |
| `localhost:3000/city/bangalore` | Bengaluru group page |

## Adding a New Group

The full guide is in [CONTRIBUTING.md](./CONTRIBUTING.md). The short version:

1. Confirm the group exists on <https://ocgroups.dev>.
2. Edit `data/groups.yaml` and add the city entry inside the right state's `cities` list.
3. Run `npm run build` to type-check.
4. Open a PR.

## Tech Stack

- **Next.js 16** with the App Router, built for Cloudflare Workers via `@opennextjs/cloudflare`
- **Cloudflare Workers** + Workers Static Assets (wildcard subdomain routing via Worker routes)
- **Pure SVG choropleth** for the India map (no external map library, Mercator projection computed at runtime)
- **Leaflet + react-leaflet** for city/state mini-maps (OpenStreetMap tiles)
- **Tailwind CSS** + **Shadcn UI** for styling
- **`middleware.ts`** for subdomain → path rewriting

## Self-updating data

The directory keeps itself current from [ocgroups.dev](https://ocgroups.dev), the official CNCF Open Community Groups platform:

| Workflow | Schedule | What it does |
|---|---|---|
| [`sync-groups.yml`](.github/workflows/sync-groups.yml) | Weekly (Mon 03:20 UTC) | Adds Indian CNCF groups that appeared upstream, removes ones that vanished or were deactivated. The state is resolved offline from `public/india-states-simple.geojson`. |
| [`sync-events.yml`](.github/workflows/sync-events.yml) | Every 6 hours | Refreshes each group's latest event and mirrors its icon into `public/group-icons/`. |

Both commit to `main` and trigger a deploy when the data actually changes. New entries carry only slug, name, coordinates, and the upstream link — `organizer`, `description`, and socials are still human-curated, and the run summary lists anything that needs a look.

Locally: `task sync:groups:dry` previews roster changes, `task sync:groups` applies them.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml` which builds and deploys to Cloudflare Workers automatically.

Manual deploy from a workstation:

```bash
task deploy
# or
npm run deploy
```

See the **Deployment Pipeline** section of [CONTRIBUTING.md](./CONTRIBUTING.md) for what the build does.

## Smoke Test

After any deploy:

```bash
./scripts/smoke-test.sh
```

Checks every state + city subdomain, the canonical `www → apex` redirect, the unknown-subdomain fallback, and a couple of static-asset paths. Exits non-zero on the first failure.

## Contributing

Contributions are warmly welcomed — from data updates to bug fixes. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

## License

[MIT](./LICENSE) © 2026 Aditya Krishnakumar and CNCG India contributors
