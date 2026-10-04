# tww3-tracker

A local reference site for **Total War: Warhammer III — Immortal Empires** played under the **Victory Conditions Overhaul (VCO)** mod. It hosts faction-specific campaign guides, each organized around the faction's three VCO victory routes. Every route is a complete, independent campaign plan for its Legendary Lord — opening moves, army templates, skill orders, research, settlement roles, unique mechanics, diplomacy, and territory policy.

The site is single-user and fully local: guide content lives in the repository as Markdown and JSON, is fetched at runtime over a small local server, and is never compiled into the bundle. Each route section carries the research trail behind it — which claims are verified against the current patch and VCO version, which are historical or inferred — with sources recorded next to the claims that need them.

A campaign ledger tracks one active VCO campaign per route: planning progress stays separate from in-game completion state, written as plain JSON in gitignored `.local/state/ledgers/` only through the local server.

## Prerequisites

- Node.js ≥ 22

## Running the site

```sh
npm install
npm run build
npm run serve
```

`npm run serve` starts the local server on [http://127.0.0.1:8123](http://127.0.0.1:8123) (override with `PORT=4000 npm run serve`; the bound URL is printed to stdout). Open that URL in a browser — the first lord's guide is migrated and ready to read: `#/elspeth-von-draken` opens the **reference desk** for the lord's first route in manifest order.

For live development with Vite hot reload:

```sh
npm run dev
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Build the site with Vite into `dist/` |
| `npm run serve` | Serve `dist/`, the content root, and the ledger store from `tools/server.mjs` |
| `npm run dev` | Vite dev server with hot reload |
| `npm test` | Run the full test suite (Node built-in `node:test`) |
| `npx tsc --noEmit` | Type-check the whole tree |
| `npm run lint:content` | Validate the content model (schema, cross-references, route sections) |

## Hash URLs

Navigation is hash-only, one uniform grammar — **page, optional route, optional section** (`/` → home; lord → route; each route page requires a route id). Every shape outside the table, including every pre-existing `route/<id>` hash, renders the explicit not-found page: nothing is mapped for legacy.

| Hash | Page |
| --- | --- |
| `#/` | Home (multi-lord entry) |
| `#/<lord>` | Reference desk for the lord's first route in manifest order |
| `#/<lord>/sources` | Sources & settings |
| `#/<lord>/notes` | Field notes |
| `#/<lord>/desk/<route-id>` | Reference desk for that route |
| `#/<lord>/plan/<route-id>` | Route plan |
| `#/<lord>/plan/<route-id>/<section-id>` | Route plan, anchored to a section |
| `#/<lord>/armies/<route-id>` | Armies & skills |
| `#/<lord>/settlements/<route-id>` | Settlements & economy |
| `#/<lord>/workshop/<route-id>` | Faction workshop |
| `#/<lord>/ledger/<route-id>` | VCO ledger (the unchanged 3-segment shape) |

Section anchors are a plan-page concept: a section id under any other route page is not-found.

## The campaign ledger

Each route's **plan page** offers **Start ledger** when no campaign is active. The ledger page (`#/elspeth-von-draken/ledger/<route-id>`) renders one row per route objective with two separate tracks: a planning tick and the four game-confirmed steps (appears complete → mission complete → victory registered → reward received). Writes are optimistic with visible rollback, and one active campaign blocks starting another. **Mark complete** archives the campaign (the file stays on disk, the route becomes startable again); **Delete** removes the file after a confirmation. Ledger documents live in `.local/state/ledgers/<lord-slug>/<route-id>.json`, are gitignored, and are served under `/ledgers/`.

## Project layout

- `app/` — the Preact SPA: hash router, views, dumb components, the content model, and the ledger modules (`app/ledger/`)
- `content/` — guide content as Markdown + JSON, loaded at runtime
- `tools/` — the dependency-free local server and the content lint
- `test/` — the Node `node:test` suite
- `.wiki/` — project knowledge: [CONCEPT](.wiki/CONCEPT.md) (product purpose), [ARCHITECTURE](.wiki/ARCHITECTURE.md) (how the site is built), [DESIGN](.wiki/DESIGN.md) (design system), [TODO](.wiki/TODO.md) (delivery plan), and per-feature design and implementation ledgers under `.wiki/features/`
