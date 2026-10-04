# Architecture — [Product Name]

> Authority: This document describes the currently implemented system. It does not describe unimplemented proposals as current state.

This document describes how **[Product Name]** is constructed: the layers, the modules, the data flow, the build/test/gate pipeline, and the conventions enforced by tooling. It answers: where does this code belong, and how do these pieces talk to each other?

For the product purpose and domain model, see [CONCEPT.md](./CONCEPT.md). For the rationale behind key decisions, see the Notable Trade-offs section below or [Architecture Decision Records](adr/README.md).

---

## 1. Top-Level Shape

### 1.1 Target architecture (approved proposal)

> Status: approved 2026-10-02, **partially implemented** — F1 (site foundation), F2 (route-first rendering), F4 (Elspeth migration), F3 (verification notes UI), F7 (route transitions), and F5 (VCO campaign ledger) are implemented and merged to `main` (F4, F3, and F7 on 2026-10-03; F5 on 2026-10-04); F6 (search) remains approved-but-unbuilt. This subsection records the approved target stack and direction; §2 and §3 describe the currently implemented system. Rationale: [ADR-0001](adr/0001-vite-preact-runtime-loaded-site.md), [ADR-0002](adr/0002-content-as-markdown-json.md).

A local, single-user web app. One Preact SPA in TypeScript, built by Vite, with no static site generator and no backend. Guide content is never compiled into the bundle — it is fetched at runtime from the repository as Markdown and JSON files.

| Layer | Choice |
| ----- | ------ |
| UI | Preact SPA, TypeScript, hash routing, single HTML shell |
| Runtime dependencies | `preact`, `markdown-it` |
| Dev tooling | `vite`, `typescript` (`tsc --noEmit`), small esbuild-based content lint script; Node ≥ 22 |
| Content | Markdown + YAML frontmatter (prose, confidence states) and JSON (structured dashboard data) in `content/`, git-versioned, loaded at runtime |
| Ledger state | JSON files in a gitignored local directory (e.g. `.local/state/ledgers/`); SQLite deferred per PRD F8 |
| Serving | Small dependency-free local server script — the reading path. `node tools/server.mjs` serves `dist/` at `/`, `content/` under `/content/`, and the ledger store at `/ledgers/` over `http://127.0.0.1`; ledger JSON in `.local/state/ledgers/` is listed/read via GET, written via PUT, and removed via DELETE. A direct `file://` open of `dist/index.html` is blocked in Chromium (verified 2026-10-02: module scripts, fetch, and XHR fail; see the ADR-0001 correction) |
| Design system | `.wiki/DESIGN.md` oklch tokens as CSS custom properties; no UI library |
| Testing | Node built-in `node:test`; tests cover content-schema validation and ledger logic (pure functions) |

```text
 Browser (Preact SPA, served dist/ or Vite dev)
   │  HTTP fetch over the local origin — the reading path (file:// is blocked in Chromium)
   ├──► content/<lord-slug>/        Markdown + JSON  (read path; git-versioned; served under /content/)
   └──► .local/state/ledgers/<lord>/<route>.json (write path; gitignored; plain-text exportable; served at /ledgers/)

 Local server: small dependency-free Node script — static serving +
 GET index/document, PUT whole documents, and DELETE under /ledgers/ with path-safety checks. No other server code.

 Raw archive (read-only reference, gitignored): .work/references/*.html
```

#### Module layout

```text
app/
├── main.ts            # bootstrap: build the content tree, mount the router
├── router.ts          # hash router (~50 lines): #/faction/elspeth/route-ii → view
├── views/             # one file per page; owns layout and page-local state
│   ├── home.tsx  faction.tsx  lord.tsx  route.tsx  ledger.ts
│   ├── dashboard.tsx  search.tsx
├── components/        # dumb reusable panels: TabStrip, Panel, ConfidenceBadge,
│                      # SourceChip, LedgerTable (`app/components/LedgerTable.ts`), SearchResults — plain props in, UI out
├── content/
│   ├── types.ts       # the content model: Faction, Lord, Route, Claim, Army, …
│   ├── load.ts        # side effect: fetch + parse Markdown/JSON → immutable ContentTree
│   └── query.ts       # pure selectors: byRoute(), flaggedClaims(), search corpus
├── ledger/
│   ├── types.ts       # campaign and item state contracts
│   ├── logic.ts       # pure campaign transitions, validation, content reconciliation
│   ├── state.ts       # pure optimistic command state and rollback
│   ├── io.ts          # only ledger network I/O to /ledgers/
│   └── useCampaign.ts # on-demand page state and command orchestration
└── styles/            # tokens.css (DESIGN.md oklch tokens as custom properties), components.css
```

#### Readability rules

1. **Side effects only in `content/load.ts` and `ledger/io.ts`.** Everything else is pure functions or dumb components; those two files are the only places where "something else happens".
2. **State lives where it is rendered.** No state library, no global store. Tabs, sections, and search text are component-local. The only shared mutable documents are ledger documents (owned by `ledger/`) plus a small in-memory ledger index (id, lord, route, status, last updated) derived from them.
3. **Views compose, components do not decide.** Panels receive data and emit events; they know nothing about factions, routes, or VCO. Reusability across factions comes from rendering data, not topics.

#### Data flow

- **Boot (once):** fetch the manifest, fetch all guide files in one parallel pass, parse and validate, build the immutable `ContentTree` in memory (tens of ms over a few MB). Markdown is rendered to HTML once at load and cached in the tree.
- **After boot:** every page, tab, and search hit is a synchronous in-memory read — no per-view fetching, no loading states, no cache invalidation.
- **Ledgers load on demand**, never at boot: opening a campaign loads its document via `io.ts`. Boot cost is independent of the number of campaigns, so the file-based store stays adequate at 100+ campaigns.
- **Ledger write path:** the on-demand campaign hook queues a command; `logic.ts` computes the next document, `state.ts` applies it optimistically, and `io.ts` PUTs the whole document to `/ledgers/`. Success settles the command; failure restores the prior document and exposes a row-level error. Completion uses PUT; confirmed deletion uses DELETE. Single user; no conflict handling.

#### Performance expectations

- One small bundle, no code splitting. Sub-100 ms in-browser search over the loaded corpus (naive tokenized matching in `query.ts`; MiniSearch is the named upgrade inside the same file).
- The expensive work (fetch + parse) happens once at boot; everything the user touches afterwards is memory-bound.

#### Deliberately absent

No service worker, virtualization, event bus, DI, ORM, WebSocket, code splitting, state library, or cross-campaign analytics layer. New-faction extensibility is met by the content schema, not by framework indirection.

#### When this direction stops being optimal

Cross-campaign querying/analysis (comparisons, history stats across many campaigns) is the trigger for the PRD F8 store step: the local server gains a local database and serves the same document-level get/put surface; `ledger/io.ts` internals change, and nothing above it does. Until that usage appears, the file-based design carries the project.

### 1.2 Current state

F1 (site foundation), F2 (route-first rendering), F4 (Elspeth migration), F3 (verification notes UI), F7 (route transitions), and F5 (VCO campaign ledger) are implemented and merged to `main`: the committed `content/` includes the migrated Elspeth guide, with its shared introduction and four blocks, six populated datasets, and three fully sectioned route documents. F3 adds the `getFlaggedEntries` selector and `FlaggedEntry` type in `query.ts`, the lord-page Version Banner and flagged-items section, and per-section Source panels. F7 is implemented and merged to `main`: `app/views/route.ts` renders present `Transition → <route>` sections as same-lord cross-links to the target route's `Opening`, or to the route page top when that `Opening` is a declared gap; `app/styles/app.css` adds one token-only link class. F5 is implemented and merged to `main`: `app/ledger/{types,logic,state,io,useCampaign}.ts` define the campaign contract, pure transitions, rollback state, network I/O, and on-demand orchestration; `app/views/ledger.ts` composes the page, and `app/components/LedgerTable.ts` renders its table. F6 (search) remains approved-but-unbuilt. §2 (Project Layout) and §3 (Build, Test, and Gate Pipeline) describe the implemented system; the sections that belong to unbuilt layers (parts of §1.1's module layout, §4–§11) remain unfilled placeholders.

---

## 2. Project Layout

The F1 (site-foundation) tree, as implemented:

```text
tww3-tracker/
├── index.html            # bare document shell: #wordmark slot, #app mount node,
│                         #   app/styles/tokens.css, the entry module script
├── vite.config.ts        # build config only: defineConfig({ base: "./" }), no plugins
├── tsconfig.json         # strict; module nodenext; the tsc --noEmit gate covers app/, tools/, test/
├── package.json          # scripts (see §3.1); the ADR-0001/0002-pinned dependency set — preact +
│                         #   markdown-it (runtime), vite + typescript + esbuild + @types/node (dev)
├── app/
│   ├── main.tsx          # sole JSX entry (Vite-loaded only): one load.ts boot pass over real
│   │                     #   fetch → immutable tree → render the shell (nav + router view)
│   ├── router.ts         # pure hash → HashRoute parsing plus the useHashRoute hook
│   ├── views/            # presentational h()-based views: home, lord, route, not-found, boot-error
│   ├── content/          # the content contract — pure over an injected ContentReader
│   │   ├── types.ts      # ContentTree/lord/route/dataset types — the contract F2–F8 import
│   │   ├── load.ts       # the only I/O file in the content domain: fetch the manifest + every
│   │   │                 #   named file in one parallel pass; parse (frontmatter subset, JSON,
│   │   │                 #   markdown-it); validate via lint.ts; build the immutable tree
│   │   ├── lint.ts       # every DESIGN §4 rule → { file, field, message } violations (no I/O)
│   │   └── query.ts      # pure typed reads over the tree: listLords, getLord, getRoute,
│   │                     #   getSection, getSource, getFlaggedEntries + FlaggedEntry
│   └── styles/
│       ├── tokens.css    # every DESIGN.md frontmatter token as a CSS custom property
│       └── app.css       # shell layout, nav, cards, claim blocks, gap list, empty/error/not-found
├── content/              # the git-versioned content root — the committed source of truth
│                         #   (ADR-0002); the site never writes here. One directory per lord:
│   └── elspeth-von-draken/   # guide.json manifest + routes/ route docs + shared.md + data/ datasets
├── tools/
│   ├── content-lint.mjs  # esbuild-bundled content lint CLI over app/content/lint.ts
│   └── server.mjs        # dependency-free Node http static server (dist/ at /, content/ at /content/)
├── test/                 # node:test suites
│   ├── fixtures/content/ # the valid two-lord fixture root (content-model + lint-cli tests)
│   └── *.test.ts         # tokens, content-model, lint-cli, router, elspeth-skeleton, views, server
└── dist/                 # gitignored Vite build output (npm run build; served at /)
```

### 2.1 Source layout rules

| Rule | Enforcement | Effect on code |
| ---- | ----------- | -------------- |
| No TypeScript parameter properties (`constructor(public …)`) | Code review; the class constructors (FrontmatterError, ContentBootError) assign parameters explicitly | Constructor shape lives in one visible place; no implicit fields |
| Views are plain `.ts` modules built with Preact's `h()` | `node --test` discovery: Node cannot execute `.tsx` (`ERR_UNKNOWN_FILE_EXTENSION`) and skips it | `test/*.test.ts` can import and assert every view's VNode output; only the Vite-loaded `main.tsx` may use JSX |
| Relative imports carry explicit `.ts` extensions | `allowImportingTsExtensions` + `module: nodenext` in tsconfig; Node ESM requires them at runtime | Every import resolves identically under Vite, node:test, and the bundled CLI |
| `markdown-it` is confined to `app/content/load.ts` | No other module imports it (type-check/grep surface any new one) | One rendering seam; tools and tests never bundle markdown-it |
| Views are presentational — no I/O, no fetch, no localStorage, no writes | Code review; `load.ts` is the content domain's only I/O file | Views render a plain in-memory tree; node:test needs no DOM |
| CSS values are token-only | `test/tokens.test.ts` pins tokens.css to DESIGN.md; app.css only references `--…` custom properties (the known exceptions are DESIGN-fixed: 1px/2px hairlines, 3px radius offsets, the 0.15s transition, font fallback stacks) | No raw colour/radius/type values in app.css |
| Dependency set is exactly the ADR-pinned manifest | `package.json` is stable from the design-tokens commit; later packages never extend it | New project-level dependencies require an ADR-level decision |

### 2.2 State and reactivity patterns

- **Content tree (the only shared state):** one immutable `ContentTree` is built exactly once at boot (`main.tsx` → `load.ts` over real `fetch`) and sealed with `deepFreeze`. Every post-boot read is a synchronous in-memory lookup — no per-view fetching, no loading states after boot.
- **Reads:** `query.ts` selectors are pure functions returning typed results (`{ found: false, kind: "not-found" }` or `{ found: true, value }`); views never reach into the tree directly.
- **Boot edge cases:** a 404/absent `content/index.json` yields the empty tree (a fresh checkout is valid); any parse/validate failure throws a `ContentBootError` naming file and field, rendered by the boot-error view.
- **No store, no localStorage:** the URL hash is the only external state (`useHashRoute`); reload rebuilds the tree and restores the exact page/section. Ledger state (localStorage or a store) is deliberately F5 scope.
- **Side effects:** `app/content/load.ts` is the content domain's only I/O file; when F5 lands, ledger I/O joins it as a second, isolated module.

### 2.3 Interface contract

The layers communicate through three small seams — no framework message bus:

- **`ContentReader`** (`app/content/types.ts`) — `readFile(path): Promise<string>` (throws when missing) plus `listFiles(): Promise<string[] | null>`. `load.ts` and `lint.ts` accept any reader: browser `fetch` at boot, `node:fs` in tests, the filesystem in the CLI. One contract, three implementations, no drift.
- **`loadContentTree`** (`app/content/load.ts`) — `(ContentReader) → Promise<ContentTree>`, throwing `ContentBootError { file, field, message }` on invalid content.
- **Views** receive tree-shaped data in props and return VNodes; they never fetch, never write, and never make routing decisions.
- **Hash routing** — `router.ts` parses `location.hash` into the `HashRoute` union (`home` / `lord` / `route` / `route` + section anchor / `not-found`); garbage hashes map to the explicit not-found view.

---

## 3. Build, Test, and Gate Pipeline

### 3.1 Build and check commands

| Command | Purpose |
| ------- | ------- |
| `npm test` | `node --test` over `test/*.test.ts` — tokens, content model (loader + lint rules on the fixture tree), lint CLI (spawned process), router table, committed-skeleton load, view VNode output, server HTTP shapes |
| `npx tsc --noEmit` | Hard type gate: strict TypeScript over `app/`, `tools/`, `test/` (module `nodenext`, preact JSX) |
| `npm run build` | `vite build` → static `dist/` with relative (`base: "./"`) asset URLs |
| `npm run serve` | `node tools/server.mjs` — serves `dist/` at `/` and `content/` under `/content/`; binds `127.0.0.1:8123` (`PORT` overrides; `PORT=0` prints the bound port) |
| `npm run dev` | Vite dev server with HMR — the same SPA over HTTP for content/code iteration |
| `npm run lint:content` | `node tools/content-lint.mjs` — the content gate over the committed `content/`; exit 0 clean or "no content yet", 1 violations, 2 usage/environment error |

### 3.2 Validation gate

Feature-gate order (feature ledger, "Final validation"): 1 `npm test` green → 2 `npx tsc --noEmit` clean → 3 `node tools/content-lint.mjs` exits 0 → 4 `npm run build` → 5 HTTP boot — headless Chromium against `npm run serve` (or `npm run dev`) shows the Elspeth home card, the lord page, route identity/claim states/declared gaps, not-found for unknown hashes, and the boot error naming a corrupted `content/` file → 6 `node tools/server.mjs` serves the same site over HTTP (its GET shapes are covered by `test/server.test.ts`). Step 5's original `file://` form was voided on 2026-10-02: Chromium blocks module scripts, fetch, and XHR under `file://`, so the server is the reading path (see the ADR-0001 correction).

### 3.3 Commit message convention

Conventional Commits — `type(scope): subject` in lowercase imperative (e.g. `feat(app): add Preact shell with hash router and views`, `feat(content): add content model, loader and query layer`, `feat(tools): add content lint CLI`, `docs(wiki): …`, `chore(scaffold): …`). No commitlint/husky enforces it in this repo (`package.json` adds no commit tooling); the convention is applied by the delivery workflow and checked in review. Transport/scratch commits made by delivery tooling are never part of trunk history.

---

## 4. Configuration Files Reference

[Map each configuration file to its role in the project.]

| File | Role |
| ---- | ---- |
| `[file path]` | [What it configures — build, lint, type system, runtime, etc.] |
| `[file path]` | [What it configures] |
| `[file path]` | [What it configures] |
| `[file path]` | [What it configures] |
| `[file path]` | [What it configures] |

---

## 5. Data Flow

### 5.1 Read path

[Trace one read from user action through the layers to the data source and back to the UI. Use a real example.]

```text
[Step-by-step trace with layer boundaries labelled]
```

### 5.2 Write path

[Trace one mutation the same way, including cache invalidation, optimistic updates, rollback, and user feedback.]

```text
[Step-by-step trace with layer boundaries labelled]
```

[Note any invalidation edge cases — mutations that must clear more than one cache key, and why.]

---

## 6. Testing Strategy

### 6.1 How tests are organised

[Describe where tests live relative to the source, what framework and environment each layer uses, and what coverage is expected.]

### 6.2 What each layer covers

- **[Layer / module type]** — [what kind of tests, what they assert, notable patterns (in-memory DB, mocking strategy, fixtures)]
- **[Layer / module type]** — [what kind of tests, what they assert]
- **[Layer / module type]** — [what kind of tests, what they assert]

### 6.3 Test quality guidelines

[State what tests should target: behaviour, not implementation; the surface the user sees, not internal state. State what to avoid: testing the framework, brittle mocks.]

---

## 7. Deployable Artifacts

- **Development** — [how to run locally: dependency setup, dev command, local data location]
- **Production build** — [build command and what it produces — platform-specific installer, container image, static bundle, etc.]
- **Deployment model** — [self-hosted, cloud, desktop installer, mobile store, etc.]
- **Network / telemetry policy** — [offline-first, online-only, optional sync. No telemetry or opt-in telemetry]

---

## 8. Lint & Architecture Enforcement Matrix

[Which rules each layer of tooling enforces, and where the gaps are.]

### 8.1 [Platform / language 1]

| Rule | Mechanism | Enforcement |
| ---- | --------- | ----------- |
| [Rule description] | [Tool and configuration] | [Hard error / Warning / Convention] |
| [Rule description] | [Tool and configuration] | [Hard error / Warning / Convention] |

### 8.2 [Platform / language 2]

| Rule | Mechanism | Enforcement |
| ---- | --------- | ----------- |
| [Rule description] | [Tool and configuration] | [Hard error / Warning / Convention] |
| [Rule description] | [Tool and configuration] | [Hard error / Warning / Convention] |

**Known tooling gaps:** [List rules that are convention-only — no linter enforces them — so reviewers know where to look manually.]

---

## 9. Notable Trade-offs and Decisions

- **[Decision]:** [What was chosen, the trade-off, and the concrete condition that would justify revisiting an intentional limit.]
- **[Decision]:** [What was chosen, the trade-off, and the upgrade trigger.]
- **[Decision]:** [What was chosen, the trade-off, and the upgrade trigger.]

---

## 10. Where to Look Next

- **[Common task 1]:** [Ordered steps across layers — which files to touch, what pattern to follow.]
- **[Common task 2]:** [Ordered steps across layers — which files to touch, what pattern to follow.]
- **[Common task 3]:** [Ordered steps across layers — which files to touch, what pattern to follow.]

---

## 11. Operational Notes

[Any environment-specific setup, troubleshooting tips, or operational constraints not covered above.]
