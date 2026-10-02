# Site Foundation (F1 — Guide site with shared structure)

**Design:** [Site Foundation design](SITE-FOUNDATION-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Ship the site foundation in one PR: the Preact + Vite + TypeScript app shell, the complete content model (file layout, manifests, route document schema, confidence-marker syntax, gap policy), the content loader/query layer, the content lint, a dependency-free static server, and a lint-clean Elspeth content skeleton — so that every later feature is either content or rendering of this model.

## User-visible behavior

- `dist/index.html` opens via `file://` with no server; reading never requires a build step.
- Hash navigation: home (`#/`) → lord (`#/<lord-slug>`) → route (`#/<lord-slug>/route/<route-id>`) → section anchor; unknown routes show an explicit not-found.
- Home lists one card per lord with lord name, faction, and `patch · VCO version` context; zero lords shows an explicit empty state.
- The committed Elspeth skeleton renders: home card, lord page (shared fundamentals + route list), route page (identity block with typed objective/reward claims, markdown body, declared-gap list).
- Boot failure on invalid content shows an error state naming file and field, never a white page.
- `node tools/server.mjs` serves `dist/` + `content/` statically; the ledger write path does not exist yet (F5).

## Invariants

- Content under `content/` is the single source of truth; the site never writes to it (ADR-0002).
- Boot performs exactly one parallel fetch pass and builds an immutable `ContentTree`; all post-boot reads are synchronous in-memory.
- Route `objective`/`reward` always carry a confidence state; prose claims only via `::claim <state> [src=…]` block callouts; `src` ids resolve against the lord's `data/sources.json`.
- Required route H2 sections are present or declared in frontmatter `gaps`; the lint enforces this.
- Side effects live only in `app/content/load.ts` (and later `ledger/io.ts`, F5); views compose, components don't decide (ARCHITECTURE §1.1).

## Non-goals

- No structured route rendering: route tabs, dashboard panels, Confidence Badge styling — F2.
- No version banner, source panels, flagged-items view — F3.
- No full Elspeth content (only the skeleton) — F4.
- No ledger of any kind, no server write path — F5.
- No search, no route-transition cross-links — F6/F7.
- No second faction's content; no SSG, no state library, no service worker, no code splitting.

## Current-state map

- Relevant components: none — no application code exists (ARCHITECTURE §1.2). Repository holds `.wiki/`, `.work/` (gitignored raw archive with 5 seed atlases), gitignored `scripts/` (jay-pi tooling), 3 ADRs, this feature's DESIGN.
- Data model: none yet. Seed evidence (Elspeth atlas data object): per-lord structure with `date`, `version` (`2026.09.30.1`), `sources[]` (35, id/title/url/note), 3 routes with `number/name/type/motto/objective/reward/interpretation/bottleneck/transitions/panelOrder/…`. The seed deliberately carries no official VCO route titles (its own source note records this); the guide uses route numbers + its own subtitles.
- Persistence and migrations: none; git-versioned plain-text `content/` (new), no database.
- Existing behavioral assumptions: none in code. Documentation decisions are binding: ADR-0001 (Vite + Preact SPA, runtime fetch, no SSG, single bundle, hash routing), ADR-0002 (Markdown + frontmatter prose, JSON structured data, confidence markers, lint), ARCHITECTURE §1.1 (module layout, 2-file side-effect rule, boot-once tree), DESIGN.md (tokens + shell components).
- Architectural seams: `app/` (new), `tools/` (new, committed product tooling — distinct from gitignored `scripts/`), `content/` (new, committed).
- Project validation commands: none defined yet; this feature establishes them — `npm test` (node:test), `tsc --noEmit`, `node tools/content-lint.mjs`, `npm run build`.
- Primary risks: Vite output must be `file://`-compatible (asset paths, no origin-dependent fetch of JS); markdown-it callout parsing for `::claim` blocks; the content-model contract is consumed by 5 later features, so its first cut must be exactly what the DESIGN specifies, nothing more.

## Feature architecture

- `app/styles/tokens.css` — DESIGN.md frontmatter as CSS custom properties; `app/styles/app.css` — base + shell + claim-block styling.
- `app/content/types.ts` — ContentTree + dataset registry types (the contract later features import). `app/content/lint.ts` — one shared validation rule set. `app/content/load.ts` — the only side-effect file in the content domain: fetch manifest, fetch all named files in one parallel pass, parse (frontmatter subset + JSON + markdown-it), validate via `lint.ts`, build the immutable tree. `app/content/query.ts` — pure read functions over the tree (lords, lord, route, section, sources), returning typed not-found results.
- `app/main.tsx` — Preact root + hash router; `app/views/` — `home`, `lord`, `route`, `not-found`, `boot-error` (composable components only).
- `tools/content-lint.mjs` — CLI over `lint.ts` rules: walks `content/`, reports `file:field — message`, non-zero exit on violation.
- `tools/server.mjs` — dependency-free Node `http` static server for `dist/` + `content/`; GET only.
- Data flow: `content/` → (boot, once) → immutable tree → views. No other direction exists.

## Uncertainty register

### Known

- Seed structure confirmed by inspection (routes, sources, version fields, phases); skeleton content is extractable without further research.
- Route sources in the seed reference ids `vco-guide` and `ca`; the skeleton's `sources.json` must define both.
- `file://` has no directory listing — manifests must be explicit and committed.

### Assumptions

- Pinned current Vite/Preact/TypeScript toolchain versions; `preact/compat` for React-style APIs (ADR-0001).
- `markdown-it` + one small container rule for `::claim` blocks are the entire Markdown dependency surface.
- The frontmatter subset (scalars, nested maps, lists of scalars, claim objects) is sufficient for the accepted schema; a full YAML parser is not justified.

### Decisions

- One PR (no clear merge boundary justifies two); seven maximal-atomic commits in waves 1–6.
- `tools/` for committed product tooling; gitignored `scripts/` stays reserved for jay-pi workflow scripts.
- `npm test` runs `node --test`; `tsc --noEmit` is the type gate; `content-lint` gates content commits; `npm run build` gates the final validation.
- The server test uses an ephemeral port (`port: 0`) and the built `dist/` from package 7's own validation run.

### Unknowns

- Whether the pinned Vite version's default output is fully `file://`-ready — expected to need a `base`/asset-path adjustment; package 7 verifies by loading `dist/index.html` without a server and booting from `content/`. If an unavoidable origin-dependent fetch remains, replan (this would invalidate ADR-0001's file:// claim and needs a developer decision).

### Risks

- The content contract is consumed by F2–F7; scope creep into F2 territory (tabs, badges) during shell construction would violate the DESIGN non-goals — review mandate checks against them.
- Fixture drift: test fixtures and the committed Elspeth skeleton must satisfy the same `lint.ts` rules; one rule set, two entry points, keeps them aligned.

## Walking skeleton

Commit 1 (tokens + toolchain) → Commit 2 (content model on fixtures) → Commit 4 (shell renders from the real tree) → Commit 5 (Elspeth skeleton content) → Commit 6 (home shows the real Elspeth card). After commit 6 the thinnest real path — open built site → see Elspeth → open her route — works end to end.

## Delivery plan

**Commit packages:** 7

### PR `site-foundation` — Foundation: app shell, content model, Elspeth skeleton

**Status:** Planned

**Depends on:** []

**PR ref:** Not applicable

**Merge ref:** Not merged

**Branch:** `feat/site-foundation`

**Base branch:** `main`

**Publication provider:** Local

**PR template:** Not applicable

**Merge method:** ff-only

**Required checks:** `npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds

**Feature close-out:** Not run

**Provisional PR title:** `feat(site): foundation for the VCO companion guide site`

**Purpose:** The entire F1 surface is one coherent foundation consumed as a unit by F2–F7; a single trunk merge keeps the model, shell, and skeleton reviewable together and leaves `main` green at the feature boundary.

#### Package `design-tokens` — Commit 1: Toolchain scaffold and design tokens

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** ["package.json", "package-lock.json", "tsconfig.json", "vite.config.ts", "index.html", "app/styles/tokens.css", "test/tokens.test.ts", ".gitignore"]

**Provisional commit:** `chore(scaffold): add toolchain and design token stylesheet`

**Work:** Install the complete dependency set pinned by the ADRs — `preact` and `markdown-it` (runtime), `vite`, `typescript`, `esbuild`, `@types/node` (dev) — as the repo's first `package.json`, committing `package-lock.json`; create the Vite config, `index.html` shell, tsconfig, and `app/styles/tokens.css` carrying the DESIGN.md frontmatter values as CSS custom properties (the exact token names and oklch values from the DESIGN.md frontmatter block); define `npm test` and `npm run build` scripts.

**Atomicity:** One outcome: "the project builds and the token contract exists" (~15 counted lines: vite.config.ts; tokens.css is generated-adjacent configuration counted at ~60 lines). The token sheet and the toolchain are one coupled outcome — the token test proves the toolchain can run — so no valid earlier seam exists. Estimate: ~75 counted lines.

**Out of scope:** All app code (commit 4), content (commit 5), lint (commit 3), server (commit 7). `index.html` references `./app/main.tsx` which does not exist yet — `npm run build` is intentionally not this commit's gate; `tsc --noEmit` (with `main.tsx` absent) and the node:test token test are.

**Implementation packet:** `index.html` is a bare document shell (wordmark slot + mount node) linking `app/styles/tokens.css` and the entry module. `vite.config.ts` pre-sets the `file://`-hostile defaults toward static output (relative `base`) — package 7 verifies the full property. The dependency manifest is exactly the ADR-pinned set — `preact`, `markdown-it` (dependencies) and `vite`, `typescript`, `esbuild`, `@types/node` (devDependencies) — pinned once here because ADR-0001/0002 pin the project's whole third-party surface; later packages consume it but never extend it.

**Files and responsibilities:** `package.json` — scripts (`test`, `build`, `dev`) + the complete ADR-pinned dependency manifest. `package-lock.json` — committed lockfile for that manifest. `tsconfig.json` — strict TS config for `app/`, `tools/`, `test/`. `vite.config.ts` — build config only. `index.html` — document shell + mount. `app/styles/tokens.css` — every DESIGN.md frontmatter token as a CSS custom property, grouped by the DESIGN.md categories. `test/tokens.test.ts` — node:test: parses `tokens.css` and asserts every token key from a locally listed set (derived from DESIGN.md frontmatter) exists with a non-empty value. `.gitignore` — add the toolchain's untracked artifacts (`node_modules/`, `dist/`) to the existing ignore set so the committed scaffold leaves the worktree clean.

**Tests and proof:** Observable: `npx tsc --noEmit` passes; `npm test` runs the token test green. Seam: the node:test run itself (no app boot yet).

**Validation:** `npm test`, `npx tsc --noEmit`. No test resources needed.

**Stop conditions:** DESIGN.md frontmatter lacks a token the shell later needs (DESIGN defect — report, don't invent values); token test reveals a name mismatch between DESIGN.md and the implemented set.

**Review mandate:** tokens.css values must equal DESIGN.md frontmatter exactly (no re-tuned colours); no app logic creeps into the scaffold; no dependencies beyond the ADR-pinned set named in the Implementation packet.

#### Package `content-model` — Commit 2: Content loader, query layer, fixtures

**Status:** Planned

**Wave:** 2

**Depends on:** ["design-tokens"]

**Write scope:** ["app/content/types.ts", "app/content/lint.ts", "app/content/load.ts", "app/content/query.ts", "test/fixtures/content/index.json", "test/fixtures/content/als-rhyn-of-lorek/guide.json", "test/fixtures/content/als-rhyn-of-lorek/shared.md", "test/fixtures/content/als-rhyn-of-lorek/routes/route-1.md", "test/fixtures/content/als-rhyn-of-lorek/data/sources.json", "test/fixtures/content/als-rhyn-of-lorek/data/armies.json", "test/fixtures/content/als-rhyn-of-lorek/data/skills.json", "test/fixtures/content/als-rhyn-of-lorek/data/research.json", "test/fixtures/content/als-rhyn-of-lorek/data/buildings.json", "test/fixtures/content/als-rhyn-of-lorek/data/mechanics.json", "test/fixtures/content/als-rhyn-of-lorek/data/vco.json", "test/fixtures/content/second-lord/guide.json", "test/fixtures/content/second-lord/shared.md", "test/fixtures/content/second-lord/routes/route-1.md", "test/fixtures/content/second-lord/data/sources.json", "test/content-model.test.ts"]

**Provisional commit:** `feat(content): add content model, loader and query layer`

**Work:** Implement the full DESIGN content contract: `types.ts` (ContentTree, guide/route/dataset types, `sources` + 6 dataset names), `lint.ts` (the shared rule set: manifest completeness, no orphans, no dangling refs, frontmatter schema incl. claim-typed `objective`/`reward`, required H2s vs declared `gaps`, `::claim` state vocabulary, `src` id resolution, JSON parse), `load.ts` (the domain's only side-effect file: read index → guides → all named files in one parallel pass; frontmatter-subset parse; markdown-it with one `::claim` container rule; validate; build the immutable tree), `query.ts` (pure reads: `listLords`, `getLord`, `getRoute`, `getSection`, `getSource`, returning typed not-found results), and a valid two-lord fixture tree plus a `ca`-style source id proving multi-lord loading needs zero code.

**Atomicity:** One outcome: "the content model exists and its contract is proven" (~300 counted lines — the four modules are one contract: types define, lint checks, load builds, query reads; splitting them produces fragments whose only purpose is to feed the next commit, so one coupled package). Estimate exceeds the 200 soft target because the schema, validation, and loader are a single coupled contract per ADR-0002; no two-way split leaves both halves independently reviewable (a loader without its rule set or types is not a coherent outcome).

**Out of scope:** The committed Elspeth content (commit 5), the lint CLI (commit 3), any rendering (commit 4/6).

**Implementation packet:** Frontmatter parser: the accepted subset only (scalars, one-level nested maps, lists of scalars and of maps — `panelOrder` is a map of lists — and `{ text, state, src }` claim objects). `lint.ts` exports a rule function `lintContent(root: {readFile})` yielding violation objects `{ file, field, message }` — pure over an injected reader so both `load.ts` and the CLI can run it. `load.ts` is written for `fetch` (browser) but accepts an injected reader so tests drive it with `node:fs`. Fixtures: lord `als-rhyn-of-lorek` fully valid (1 route, all H2 sections present, one `::claim` callout, sources incl. ids `vco-guide` and `ca`); `second-lord` a minimal valid second lord (1 route with all required H2s declared as `gaps`).

**Files and responsibilities:** `types.ts` — the contract later features import. `lint.ts` — every DESIGN §4 rule as a violation-producing check. `load.ts` — fetch/parse/validate/build; the only file in the domain with I/O. `query.ts` — pure tree reads. `test/fixtures/content/**` — the valid two-lord tree; `test/content-model.test.ts` — the contract proof.

**Tests and proof:** Observable: valid fixture loads into a complete tree (lord/route/section counts, objective/reward carry states, callout parsed with state + src, `gaps` recorded); a second lord in the index loads with zero code change; each broken variant (dangling guide ref, orphan file, missing required H2 without `gaps` entry, invalid state word, `src` id not in `sources.json`, unparseable JSON, missing file) yields a violation naming file and field. Seam: `node --test test/content-model.test.ts` with the injected reader over `test/fixtures/`.

**Validation:** `npm test`, `npx tsc --noEmit`. Fixtures are test-owned files, no shared resources.

**Stop conditions:** The frontmatter subset proves insufficient for the DESIGN schema (a real field shape can't be expressed); a DESIGN rule turns out unenforceable from file content alone; a needed markdown-it container rule conflicts with default parsing.

**Review mandate:** `lint.ts` rules must match DESIGN §4 one-for-one (no invented rules, no missing mandatory ones); `load.ts` must be the only I/O file in the domain; the tree must be immutable after build; query functions must be pure; no F2 behavior (no rendering, no badges, no panel logic).

#### Package `lint-cli` — Commit 3: Content lint CLI

**Status:** Planned

**Wave:** 3

**Depends on:** ["content-model"]

**Write scope:** ["tools/content-lint.mjs", "package.json", "test/lint-cli.test.ts"]

**Provisional commit:** `feat(tools): add content lint CLI`

**Work:** `tools/content-lint.mjs` — an esbuild-bundled CLI (ADR-0002) that bundles `app/content/lint.ts` (and the types it needs) to a temp file, runs it over `content/` with a real filesystem reader, prints `file:field — message` lines, and exits 0/non-zero. Registers `npm run lint:content` in `package.json`.

**Atomicity:** One outcome: "the content gate is runnable from the command line" (~30 counted lines + script entry). The CLI is thin glue over the existing rule set; splitting the bundling from the exit-code contract would leave each half unprovable. Estimate: ~30 counted lines.

**Out of scope:** The Elspeth skeleton (commit 5) — this commit runs against an absent or partial `content/` and must treat "no `content/` directory" as an explicit "no content yet" pass with a notice, not a failure (fresh-checkout state per DESIGN).

**Implementation packet:** The script must work from any cwd by resolving the repo root from its own path. Exit codes: 0 clean, 1 violations, 2 usage/environment error.

**Files and responsibilities:** `tools/content-lint.mjs` — the CLI. `package.json` — `lint:content` script only (no other field changes). `test/lint-cli.test.ts` — spawns the CLI over the valid fixture (pass) and a broken fixture copy (non-zero + message line present).

**Tests and proof:** Observable: exit 0 on `test/fixtures/content/` (passed as an explicit root argument), exit 1 on a broken variant with the violating file and field printed. Seam: spawned-process test — the CLI is the product surface.

**Validation:** `npm test`, `npx tsc --noEmit`. The test uses its own fixture copies in a temp directory — no port or shared-state concerns.

**Stop conditions:** esbuild bundling of `lint.ts` reveals a hidden dependency on browser-only APIs in the content domain (would mean `load.ts`'s I/O leaked into `lint.ts` — report as a design violation).

**Review mandate:** the CLI must contain no validation logic of its own (all rules live in `lint.ts`); output format exactly `file:field — message`; no new dependencies (esbuild is already pinned as a devDependency by `design-tokens`).

#### Package `app-shell` — Commit 4: Preact shell, router, views, boot error

**Status:** Planned

**Wave:** 3

**Depends on:** ["design-tokens", "content-model"]

**Write scope:** ["app/main.tsx", "app/router.ts", "app/views/home.ts", "app/views/lord.ts", "app/views/route.ts", "app/views/not-found.ts", "app/views/boot-error.ts", "app/styles/app.css", "test/router.test.ts"]

**Provisional commit:** `feat(app): add Preact shell with hash router and views`

**Work:** The app shell on the accepted design: `main.tsx` (Preact root; boot = one `load.ts` pass over real `fetch` of `content/` → tree; on failure render `boot-error` with file + field; on success render router), `router.ts` (hash ↔ route model: home / lord / route / section anchor; unknown → not-found), the five views (home: lord cards or empty state; lord: shared markdown + route list from the tree; route: identity block from frontmatter incl. objective/reward with their states, `vcoTitle` slot showing "unresearched" when null, markdown body with `::claim` callouts rendered as labelled blocks, declared-gap list; not-found; boot-error), and `app.css` (base layout per DESIGN.md Layout & Spacing: 1200px max column, sticky 64px nav with "VCO COMPANION" wordmark and reserved search slot).

**Atomicity:** One outcome: "the site boots and navigates" (~350 counted lines — entry, router, five views, shell CSS are one coupled render surface; the DESIGN's own views are this commit's unit, and a per-view split would leave each commit unbootable, violating trunk-safe). Estimate exceeds the 200 soft target because boot, routing, and the view set form one coherent shell; no seam yields two independently reviewable, trunk-safe commits.

**Out of scope:** Real content (commit 5) — the shell must complete with zero content (empty-state home) and with invalid content (boot error); no F2 components (no Route Tab Strip, no dashboard panels, no Confidence Badge styling — the route page is deliberately the plain F1 form per DESIGN §3).

**Implementation packet:** Views are composable presentational components over `query.ts` results; `main.tsx` owns the tree and passes data down; no global state store. Views are plain `.ts` modules built with Preact's `h()` (not `.tsx` JSX) so the commit-6 node:test render assertions can import them — Node's `node --test` cannot load `.tsx` (see Discoveries); the entry `main.tsx` stays JSX since only Vite loads it. `app.css` uses only token variables — no raw colour values. Claim callouts render as blocks whose header line is the state label (mono uppercase per DESIGN.md) plus `src` ids — colour per the token for that state, but the label is always present (PRD: colour never sole indicator).

**Files and responsibilities:** `main.tsx` — boot + render root (JSX; Vite-loaded only). `router.ts` — pure hash parsing + `useHashRoute` hook. The five `.ts` views under `app/views/` (h-based, no JSX). `app/styles/app.css` — shell layout, nav, cards, claim blocks, gap list, error/empty/not-found styling. `test/router.test.ts` — hash-string → route-model cases (all valid shapes, section anchors, every garbage shape → not-found).

**Tests and proof:** Observable: every hash shape maps to the right view model; boot against the (still absent) `content/` renders the empty-state home; boot against a broken tree renders boot-error with file + field. Seam: `test/router.test.ts` for routing; boot paths proven by the existing content-model tests driving `load.ts` plus a minimal render assertion if the test environment supports it — otherwise the final validation's manual `file://` boot covers it and the test asset stays the router table.

**Validation:** `npm test`, `npx tsc --noEmit`. No services; no ports.

**Stop conditions:** Preact + `preact/compat` rendering conflicts that force a state-library or router dependency (ADR-0001 violation — report); any view needs data `query.ts` doesn't offer (contract gap — extend `query.ts` in a replanned package, not silently).

**Review mandate:** no F2 components sneak in (check the route page against DESIGN §3's F1 form); all colours/radii/typography via tokens; views stay presentational (no fetch, no localStorage, no writes); `load.ts` remains the only content I/O.

#### Package `elspeth-skeleton` — Commit 5: Committed Elspeth content skeleton

**Status:** Planned

**Wave:** 4

**Depends on:** ["lint-cli"]

**Write scope:** ["content/index.json", "content/elspeth-von-draken/guide.json", "content/elspeth-von-draken/shared.md", "content/elspeth-von-draken/routes/route-1.md", "content/elspeth-von-draken/routes/route-2.md", "content/elspeth-von-draken/routes/route-3.md", "content/elspeth-von-draken/data/sources.json", "content/elspeth-von-draken/data/armies.json", "content/elspeth-von-draken/data/skills.json", "content/elspeth-von-draken/data/research.json", "content/elspeth-von-draken/data/buildings.json", "content/elspeth-von-draken/data/mechanics.json", "content/elspeth-von-draken/data/vco.json", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): add Elspeth guide skeleton`

**Work:** The committed, lint-clean Elspeth skeleton per DESIGN §7: `content/index.json` (`{ "lords": ["elspeth-von-draken"] }`); `guide.json` (id, lord "Elspeth von Draken", faction "Empire", `version { patch, vco: "2026.09.30.1", checked: "2026-09-30" }`, the 3 routes, `shared`, all 7 datasets); 3 route files with identity frontmatter extracted verbatim from the seed (`number` I/II/III, `name` = seed thematic titles, `vcoTitle: null`, `objective`/`reward` as typed claims with state + `src: ["vco-guide"]`, `motto`, `bottleneck`, `transitions` summary, `panelOrder` from the seed, all 7 registry H2s declared in `gaps` with empty bodies); `data/sources.json` = the seed's 35 sources (id/title/url/note, incl. `vco-guide` and `ca`); the 6 remaining datasets as explicit empty stubs; a test that the committed tree loads through `load.ts` itself.

**Atomicity:** One outcome: "the pilot content exists and is contract-valid" — the index, manifest, routes, and sources must land together or the tree is dangling (any single file missing fails the lint), so this is irreducibly one commit (~25 counted lines of hand-authored JSON; the 35 sources and frontmatter are extracted data, still counted: ~250 lines total, justified — it is one content unit). Estimate: ~250 counted lines.

**Out of scope:** Any route body prose (F4 fills it); dataset content beyond stubs (F4); any second lord (v1.1).

**Implementation packet:** Objective/reward text is verbatim from the seed atlas (route objects' `objective`/`reward` fields, already recorded in planning). `patch` value comes from the seed's source notes (Warhammer 9.0 per `vco-changes` notes) — recorded as `version.patch` in `guide.json`. `gaps` lists all seven H2 registry entries; bodies contain only the H2 headings' absence (empty files below frontmatter are fine) — or the headings with a single "declared gap" line; either form must pass the lint as declared.

**Files and responsibilities:** Exactly the `content/` files listed (the single source of truth) + `test/elspeth-skeleton.test.ts` (loads `content/` through `load.ts` with the filesystem reader: 1 lord, 3 routes, objective/reward states present, 35 sources, all datasets present and empty-valid).

**Tests and proof:** Observable: `node tools/content-lint.mjs` exits 0 on the real `content/`; the test proves the loader (not just the lint) accepts it. Seam: `node --test test/elspeth-skeleton.test.ts` + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0).

**Stop conditions:** A seed field the DESIGN frontmatter has no slot for (schema gap — replan the types, don't improvise a field); sources.json ids that the routes reference but the seed's list lacks.

**Review mandate:** frontmatter values verbatim from the seed (no paraphrase); `vcoTitle` null, not guessed; `gaps` complete (all seven entries); no dataset stub contains invented data; nothing in this commit touches `app/` or `tools/`.

#### Package `home-real` — Commit 6: Render the Elspeth tree through the views

**Status:** Planned

**Wave:** 5

**Depends on:** ["app-shell", "elspeth-skeleton"]

**Write scope:** ["app/views/home.ts", "app/views/lord.ts", "app/views/route.ts", "test/views.test.ts"]

**Provisional commit:** `feat(app): render guide content in home, lord and route views`

**Work:** Wire the shell to real content: home renders one card per lord from the tree (lord, faction, `patch · VCO version`); lord page renders shared markdown and the route list (number, official title or "unresearched", thematic subtitle, objective line, links); route page renders the identity block, body, and declared-gap list from the tree. Where commit 4 rendered from empty/fixture shape, this commit completes the data-driven rendering against the committed skeleton.

**Atomicity:** One outcome: "the committed guide is visible end to end" (~120 counted lines across the three views — the three views change together because they render one tree walk; per-view splits would each be trunk-safe but none would be independently reviewable against a visible result). Estimate: ~120 counted lines.

**Out of scope:** F2's structured rendering (tabs, panels, badges) — this stays the DESIGN §3 F1 form; no search, no transitions, no ledger.

**Implementation packet:** Card/list rows are plain presentational components; version context formats as `patch <X> · VCO <version>` per DESIGN.md. Gap list entries name the section and that it is declared.

**Files and responsibilities:** The three view files (commit 4's h-based shapes, completed). `test/views.test.ts` — zero-DOM output-model assertions over the VNode trees the view functions return (no DOM library — one would require `package.json`, which is outside this commit's write scope).

**Tests and proof:** Observable: given the loaded Elspeth tree, home output contains the Elspeth card with `patch · VCO 2026.09.30.1`; lord output lists 3 routes with objectives; route output contains the identity claim texts and 7 declared gaps. Seam: the view render test over the real tree.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs`.

**Stop conditions:** A view requirement the DESIGN doesn't specify (design gap — ask, don't invent); a view assertion that is inexpressible without a DOM library (stop — plan-level gap, since the devDependency would need a `package.json` write scope this package does not own).

**Review mandate:** still no F2 components; output matches DESIGN §6 copy rules (wordmark, version format, gap wording); no new dependencies, no `package.json` changes.

#### Package `static-server` — Commit 7: Static local server

**Status:** Planned

**Wave:** 6

**Depends on:** ["home-real"]

**Write scope:** ["tools/server.mjs", "package.json", "test/server.test.ts"]

**Provisional commit:** `feat(tools): add static local server`

**Work:** `tools/server.mjs` — dependency-free Node `http` server: serves `dist/` at `/` and `content/` under `/content/`, correct content types for html/css/js/json/md, no writes, binds 127.0.0.1 on a fixed default port (overridable via `PORT`), prints the URL. `npm run serve` in `package.json`.

**Atomicity:** One outcome: "the HTTP origin exists" (~90 counted lines). The server and its `serve` script are one unit; the test needs the built `dist/`, so the server lands after the views exist. Estimate: ~90 counted lines.

**Out of scope:** Any write path (ledger PUT is F5, per ADR-0001 "small" — keep it small); no SPA-fallback cleverness beyond serving `index.html` for unknown non-content paths.

**Implementation packet:** Path safety: resolve and verify the requested path stays inside the served root (no traversal). `dist/` absent → clear startup message telling the user to run `npm run build`.

**Files and responsibilities:** `tools/server.mjs` — the server (kept standalone: no project imports, no bundling needed). `package.json` — `serve` script only. `test/server.test.ts` — boots the server on port 0 in a child process or in-process: `GET /` → `dist/index.html` bytes, `GET /content/index.json` → the committed index, `GET /nope` → `index.html` fallback, traversal attempt (`/../package.json`) → 404; then closes.

**Tests and proof:** Observable: the four request shapes above with status + body assertions. Seam: `node --test test/server.test.ts` (requires a prior `npm run build` for `dist/`; the test builds-on-demand via `execSync('npm run build')` if `dist/index.html` is absent, so `npm test` stays order-independent).

**Validation:** `npm run build`, then `npm test`, `npx tsc --noEmit`. Ephemeral port only.

**Stop conditions:** A needed behavior beyond static GET (would be F5 scope — stop).

**Review mandate:** zero dependencies (node: builtins only); traversal guard is correct (not just a string check); no ledger/write code.

## Discoveries and replanning

- **2026-10-02 (delivery preflight) — Node `node --test` cannot execute `.tsx` files.** Verified on Node v24.18.0: importing a `.tsx` module throws `ERR_UNKNOWN_FILE_EXTENSION` (including with `--experimental-transform-types`), and `node --test` silently skips `.tsx` candidates during discovery. Consequence: the planned `app/views/*.tsx` could not be imported by the commit-6 render test and `test/views.test.tsx` would never run, breaking the required `npm test` green check ("views" item). Bounded revision (requirements, feature scope, architecture, and all other packages unchanged): packages `app-shell` and `home-real` now write `app/views/*.ts` and `test/views.test.ts`; views are built with Preact's `h()` so node:test can import and assert their VNode output, while the Vite-loaded entry `main.tsx` remains JSX. Reviewed and committed as a plan revision before wave 1 dispatch.
- **2026-10-02 (wave 1, pre-integration) — `.gitignore` owned by no package.** The pre-existing `.gitignore` has no `node_modules/` or `dist/` entry, so the toolchain scaffold (commit 1) and every later build/validation would leave the worktree permanently non-clean — a trunk-safety and hygiene defect no planned package could fix without scope drift. Bounded revision (requirements, feature scope, architecture unchanged): `.gitignore` added to `design-tokens`' write scope with a single-line responsibility (add `node_modules/` and `dist/` to the existing ignore set). Reviewed and committed as a plan revision before commit 1's scratch transport commit.

## Final validation

Exact gates, in order:

1. `npm test` — full `node --test` suite green (tokens, content model, lint CLI, router, skeleton load, views, server).
2. `npx tsc --noEmit` — clean.
3. `node tools/content-lint.mjs` — exit 0 on the committed `content/`.
4. `npm run build` — static `dist/` produced.
5. Manual: open `dist/index.html` via `file://` (no server) → home shows the Elspeth card with version context → lord page → route 1 renders identity, claim states, and the declared-gap list; an unknown hash shows not-found; corrupting a `content/` file and reloading shows the boot error naming it.
6. Manual: `node tools/server.mjs` serves the same site over HTTP.
7. DESIGN §7 acceptance criteria checked item by item; DESIGN.md Pre-Delivery Checklist applicable to F1 surfaces (keyboard nav, focus-visible, contrast, reduced-motion).

## Documentation impact

Complete during reconciliation.

## Abandonment record

Include this section only after explicit developer abandonment.
