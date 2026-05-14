# cncg.in — Cloud Native Community Groups India

A subdomain-routed Next.js site deployed on Cloudflare Pages that helps discover CNCF-affiliated community groups across India.

## URL Structure

| URL | Page |
|---|---|
| `cncg.in` | India map — clickable states |
| `gujarat.cncg.in` | Gujarat state page — city list + map |
| `ahmedabad.cncg.in` | City group page — info, map, join CTAs |

## Local Development

Run the dev server:

```bash
npm run dev
```

Since browser subdomains don't work on localhost, use the `?_sub=` query param to test different views:

| URL | Simulates |
|---|---|
| `localhost:3000` | `cncg.in` |
| `localhost:3000?_sub=gujarat` | `gujarat.cncg.in` |
| `localhost:3000?_sub=ahmedabad` | `ahmedabad.cncg.in` |

## Adding a New Group

Edit `data/groups.ts`:

1. If the state doesn't exist, add a new `StateGroup` entry to the `groups` array
2. Add a `CityGroup` entry inside the state's `cities` array
3. Run `npm run build` to verify

## Deploying to Cloudflare Pages

### First-time setup

1. Log in to Cloudflare: `npx wrangler login`
2. Build for Cloudflare: `npm run build:cf`
3. Create and deploy: `npx wrangler pages deploy --project-name cncg-in`

### Subsequent deploys

```bash
npm run deploy
```

### DNS & Custom Domains

In the Cloudflare Pages dashboard for this project:

1. Go to **Custom domains**
2. Add `cncg.in` (root domain)
3. Add `*.cncg.in` (wildcard subdomain — handles all state + city subdomains)

> Wildcard custom domains require your domain to be on Cloudflare (orange-cloud proxied).

## Tech Stack

- **Next.js 16** with App Router (static export)
- **Cloudflare Pages** + `@cloudflare/next-on-pages`
- **react-simple-maps** — India SVG choropleth map
- **Leaflet + react-leaflet** — City/state mini-maps (OpenStreetMap tiles)
- **Tailwind CSS** + **Shadcn UI** — Styling
- **`proxy.ts`** — Next.js 16 subdomain routing (replaces middleware)
