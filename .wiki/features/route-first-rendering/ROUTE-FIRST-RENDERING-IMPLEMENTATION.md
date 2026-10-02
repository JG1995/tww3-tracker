# Route-first Rendering (F2 — Route-first content rendering)

**Design:** [Route-first Rendering design](ROUTE-FIRST-RENDERING-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Replace F1's plain route form with the DESIGN's route-first rendering — route tab strip, upgraded route pages (identity card, registry-ordered sections with in-flow content-gap markers), the five-tab dashboard region, and the Confidence Badge — and define the typed dataset schemas for the six structured datasets, so the F4 Elspeth migration is content-only.

## User-visible behavior

- The route tab strip (Shared + one tab per manifest route, in manifest order) renders on lord and route pages directly under the sticky nav; the active tab is derived from the hash; click and Left/Right/Home/End keyboard navigation change the hash and survive reload.
- A route page renders, top to bottom: the bone Route Identity Card (mono uppercase eyebrow + primary dot with the official VCO title or an explicit unresearched marker, dimmed thematic subtitle, objective and reward as Confidence Badged claims, interpretation/bottleneck/motto when present), the registry sections (present sections and Content Gap Markers interleaved at each registry position — no trailing gap list), and the dashboard region.
- The dashboard region shows five tabbed panels (Army templates, Skills, Research, Settlements, Mechanics); each panel lists exactly its route's `panelOrder`-listed items in order, with the atlas item anatomy (army unit rows with counts/roles/kinds and legendary vs generic columns; `title`/`intro`/`steps` items with optional gates); selection is component-local and resets on navigation.
- Confidence states render as the badge everywhere the DESIGN requires: route `objective`/`reward`, `::claim` callouts in boot-rendered section prose, and dataset items carrying `state`; the badge always pairs icon + mono uppercase label + state colour, and a `src`-carrying claim shows source links.
- An optional VCO objective-item list (`data/vco.json` per-route entry) renders under the route identity; no progress or campaign state of any kind is rendered.
- The committed Elspeth stubs render explicit empty states per dashboard panel — never blank space; the committed content stays lint-clean.
- Detailed behavior, rules, edge cases, and acceptance criteria: the accepted DESIGN (Open Questions: None), which the ledger links and does not restate as a competing specification.

## Invariants

- Content under `content/` is the single source of truth; the site never writes to it (ADR-0002).
- Boot performs exactly one parallel fetch pass and builds an immutable `ContentTree`; all F2 rendering is synchronous in-memory reads over that tree — no per-view fetching, no new loading states (DESIGN §4 Loading and validation).
- The hash is the single source of truth for navigation; the strip's active state is derived from it. No UI state is persisted: panel selection and tab focus reset on navigation (DESIGN §2 Persistent Data).
- If a dataset file violates its schema, boot fails with the F1 boot-error state naming file and field — no partial dashboard. `panelOrder` id resolution and dataset schema rules live in the same shared rule set the lint CLI and the loader run (one rule set, two entry points).
- `panelOrder` group keys are exactly the five panel dataset names; a group key or id that cannot be resolved fails the lint.
- Views stay presentational `.ts` modules built with Preact's `h()` (no `.tsx` under node:test); every F2 view and component keeps its VNode output assertable by the zero-DOM flatten seam.
- Side effects live only in `app/content/load.ts`; `package.json` and the ADR-0001-pinned dependency set stay unchanged (no new dependencies; icons are hand-authored inline SVG).
- Required route H2 sections stay present or declared in frontmatter `gaps`; the lint rule set is unchanged for route documents.

## Non-goals

- No version banner, source panels, or flagged-items view (F3).
- No actual Elspeth dataset content — the committed stubs are reshaped to the typed empty forms and rendered; F4 fills them.
- No ledger of any kind: no campaign state, no ticks, no write path (F5); the `vco` dataset carries the researched objective list only.
- No cross-guide search (F6) and no route-transition cross-links (F7); F2 renders the transition sections as prose.
- No persistence of UI state (no localStorage, no panel-selection memory); no second faction's content (v1.1).
- No new project dependencies and no `.tsx` views; the zero-DOM test seam is preserved.

## Current-state map

- Relevant components: `app/content/types.ts` (the six datasets are still `JsonValue`; `PanelOrder` is an unconstrained map of lists of scalars; `STATE_LABELS` lives in `app/views/route.ts`), `app/content/lint.ts` (frontmatter subset, section/claim scanners, the DESIGN §4 route rules; `REQUIRED_SECTIONS`/`OPTIONAL_SECTIONS` constants in this module; `lintDataItems` already validates `state`/`src` vocabulary on any nested dataset object), `app/content/load.ts` (the domain's only I/O; builds the tree after validation; `claim_callout_open` renderer emits `<aside class="claim claim--<state>" data-state data-src>`), `app/content/query.ts` (pure reads: `listLords`, `getLord`, `getRoute`, `getSection`, `getSource`), `app/views/route.ts` (F1 plain route form: identity block with inline state labels, markdown body with a "no sections yet" fallback, trailing declared-gap list), `app/views/lord.ts` (shared fundamentals + route list), `app/views/home.ts`, `app/router.ts`, `app/main.tsx` (sole JSX entry; renders `LordView {lord}` and `RouteView {route}`), `app/styles/{tokens,app}.css` (token-only; `.state-label--*`, `.gap-list`, claim-block styles exist; no tab strip, panel, or badge styles).
- Data model: the committed `content/elspeth-von-draken/` skeleton holds `data/{armies,skills,research,buildings,mechanics,vco}.json` as `[]` stubs; the three route files carry `panelOrder` with seed-derived id lists and the group key `builds` (the dataset/vocabulary name is `buildings`); all seven registry sections are declared in `gaps`; `vcoTitle` is null on every route. The test fixture tree (als-rhyn-of-lorek) has `[]` stubs for the five item datasets, `{}` for `vco`, a `::claim` callout in the "Early → Mid" section, and a provisional `panelOrder` with F1-era group keys (`intro`, `army`, `economy`) that are not dataset names. The raw seed atlases remain unmodified in `.work/references/` (gitignored).
- Persistence and migrations: none at runtime; the F2 dataset-schema change is a content-contract change expressed in committed files (`content/`). No migrations.
- Existing behavioral assumptions: boot-once immutable tree with `deepFreeze`; post-boot reads are synchronous; the lint is the single rule set for both boot and CLI; the hash router restores the exact page/section on reload; boot error names file + field; empty dataset stubs must not break the lint.
- Architectural seams: `app/content/lint.ts`'s registry constants are the source of section order; `query.ts` is the pure read surface views may extend; `.wiki/ARCHITECTURE.md` §1.1 target layout already names `app/components/` (TabStrip, Panel, ConfidenceBadge) — F2 realizes it; `app/styles/app.css` remains the single token-only stylesheet.
- Project validation commands: `npm test` (node:test), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 clean on committed `content/`), `npm run build`, `npm run serve` (HTTP boot; see F1 §3.2).
- Primary risks: the dataset contract change lands before the content that satisfies it, so the committed skeleton must be reshaped in the same gate-safe order (the lint gate runs on committed content); fixture and committed content must satisfy the same rule set without drift; `app.css` is shared by every rendering package, which serializes waves; keyboard behavior (roving focus, role/ARIA) is only partially provable in the zero-DOM seam and needs the manual HTTP boot; no new dependencies must sneak in (icons are hand-authored SVG).

## Feature architecture

- Content contract layer: `app/content/types.ts` defines `PanelGroup` (the five panel dataset names), the typed dataset schemas (per-route `armies` map, flat per-lord item maps for skills/research/buildings/mechanics, per-route `vco` list), the tightened `PanelOrder`, and the typed `LordDataset` values; `app/content/lint.ts` enforces every schema and the `panelOrder` group vocabulary + id resolution against the parsed entries; `app/content/load.ts` builds the typed values into the frozen tree after validation. Consumers are F2's views and later F4/F5.
- Badge system: `app/badges.ts` owns the state → label + hand-authored inline SVG icon vocabulary (pure, no I/O); `app/content/load.ts` emits the badge anatomy (icon + mono uppercase label + per-`src` links resolved at boot) inside `::claim` callout HTML; `app/components/ConfidenceBadge.ts` is the presentational VNode component for data-driven claims and dataset items; `app/styles/app.css` supplies one badge treatment (state border + container tint + icon + label; colour never the sole indicator).
- Navigation: `app/components/TabStrip.ts` renders Shared + manifest routes, derives the active tab from the hash route prop, and owns the roving-tabindex keyboard contract (Left/Right/Home/End + focus follows the active tab); `app/main.tsx` passes the hash route and lord context down; views stay presentational.
- Route page regions: identity card + optional VCO undercard and the registry/`vco` reads live in `app/views/route.ts` + `app/content/query.ts`; the section region interleaves present sections and Content Gap Markers at registry positions using the `lint.ts` registry constants; the dashboard region is `app/components/dashboard.ts` (five fixed tabs, one visible panel, component-local selection, keyed remount reset) fed by `query.ts` panel-order resolution.
- Boundaries: no component queries the tree or performs I/O; the page view receives tree-shaped props from `app/main.tsx` (the lord context threaded by Commit 4) and resolves pure `query.ts` helpers over those props; badges compute nothing; F3/F5/F7 surfaces stay out.

## Uncertainty register

### Known

- The committed Elspeth skeleton's `panelOrder` group key `builds` does not match any dataset name (`buildings` is the DESIGN/fixed dataset); the seed-derived id lists (elspeth, master, …) resolve to nothing while every stub is empty.
- The test fixture's provisional `panelOrder` keys (`intro`, `army`, `economy`) are not dataset names and will fail any canonical group vocabulary.
- The committed and fixture six datasets are `[]`, which is not a valid shape for any typed schema; the DESIGN defines the empty form as an empty map/object per schema (`{}`).
- The lint gate (`node tools/content-lint.mjs`) runs against the committed `content/`, so the reshape that makes the stubs pass the new rules must land before the rules.
- `STATE_LABELS` currently lives in `app/views/route.ts`; the badge contract needs the label + icon vocabulary shared by the boot HTML renderer and the component (a neutral pure module, not a view import).

### Assumptions

- `panelOrder` group keys equal the five panel dataset names (`armies`, `skills`, `research`, `buildings`, `mechanics`) — the DESIGN's five fixed panels and fixed dataset vocabulary leave no other mapping; the seed's `builds` key is a seed-ism, renamed, not aliased. `vco` is not a panel group: its per-route objective list renders under the identity via its own schema.
- The seed-derived `panelOrder` ids are F4's concern (they remain in the gitignored `.work/references/` atlas); F2 commits only the canonical empty lists.
- The `vco` objective list is "optional": an absent route entry renders no undercard; a present entry renders items with badges.
- Keyboard contracts split cleanly into a pure decision function (next/prev/first/last index) plus DOM focus handling, so the zero-DOM seam can prove the decision logic and the ARIA/role surface, leaving focus-movement to the manual HTTP boot.
- The dashboard tab bar's keyboard selection (Left/Right/Home/End) mirrors the route strip's pattern but changes component-local selection instead of the hash.

### Decisions

- **One PR** (`route-first-rendering`, base `main`, provider Local, ff-only, no PR template). F2 is additive rendering of one accepted contract; every commit keeps `main` green (the stub reshape precedes the rules that would reject the old forms), and no intermediate value needs its own trunk merge. Mirrors F1's single-PR foundation.
- **Tension (a) — panelOrder ids vs empty stubs, resolved coherently:** the committed skeleton is reshaped to the DESIGN's typed empty forms — all six datasets become `{}`, and the three route `panelOrder` blocks become the five canonical group keys (`builds` renamed to `buildings`; seed-derived id lists emptied because no id can resolve in an empty content corpus). The committed content stays lint-clean with zero invented entries, and every panel renders its explicit empty state. The "unresolvable `panelOrder` id fails the lint" rule is proven by seeded test fixtures (temp copies), not by committed content. The seed's original ids stay recoverable in `.work/references/` for the F4 migration.
- **Tension (b) — wave decomposition:** waves are single-member except one honest W1 pair (content reshape + badge system: disjoint write scopes, no behavioral coupling). Every other pair examined shares `app.css`, `route.ts`, `query.ts`, `types.ts`, or `load.ts`, so waves serialize on the shared files rather than manufacturing parallelism with disjoint-but-duplicated concerns. A singleton wave is normal for this feature.
- **Typed empty form** is `{}` for all six datasets (DESIGN §4 "an empty map/object per schema").
- **Badge vocabulary** (`app/badges.ts`) is the shared owner of labels + icon SVG strings, imported by `load.ts` (HTML) and the component (VNode); `markdown-it` stays confined to `load.ts`.
- **`app/components/`** is introduced per ARCHITECTURE §1.1's approved target layout for the dumb reusable panels (TabStrip, ConfidenceBadge, dashboard); the route-page region layout stays in `app/views/route.ts`.
- **Provisional commit sequence** is the ledger order (serial integration order): reshape → badge → typed contracts → tab strip → identity/VCO → gap markers → dashboard shell → panel items.

### Unknowns

- None gating the plan. Exact badge/tab/empty-state copy beyond the meanings the DESIGN fixes is not contractual (DESIGN §6) and is left to the implementing packages.
- The `vco` undercard's rendering when the route entry is absent is "render nothing" per the DESIGN's "optional" wording; if review prefers an explicit "no objectives" marker, that is a copy decision, not a contract change.

### Risks

- Fixture/committed drift: fixtures and committed content must satisfy the same rule set after reshaping (mirrors F1's "one rule set, two entry points" guard; the fixtures-lint-clean test is the tripwire).
- `app.css` is the single stylesheet every rendering package edits — waves serialize on it; enlarging it per-wave is accepted, splitting it to manufacture parallelism is not.
- `views.test.ts` churns as `route.ts` restructures across tab-strip → identity → gap-markers → dashboard; each package owns its assertion updates, and obsolete assertions are deleted with the behavior they protected (per the testing contract).
- The canonical group vocabulary and empty committed lists change the content contract F4 will fill; recorded in the reshape package's review mandate so F4's migration reads the canonical keys.
- The keyboard contracts' DOM half (focus movement, roving tabindex) is only partially provable without a DOM; the plan names the manual HTTP boot as the completing proof rather than inventing a DOM test harness (which would need a new dependency).

## Walking skeleton

Commit 1 (stub reshape) → Commit 2 (confidence badge) → Commit 3 (typed dataset contracts) → Commit 4 (route tab strip) → Commit 5 (route identity + VCO undercard) → Commit 6 (in-flow gap markers): after commit 6 the site already renders the route-first flow end to end — open the built site, click or arrow across route tabs (hash survives reload), read the identity card with badged claims, and see every gap as an in-flow marker. Commits 7–8 complete the dashboard region: five tabbed panels with explicit empty states on the committed content, then full item anatomy proven on test fixtures — the thinnest complete path through the feature is the sequence of all eight commits on one branch.

## Delivery plan

**Commit packages:** 8

### PR `route-first-rendering` — Render the route-first content model

**Status:** Planned

**Depends on:** []

**PR ref:** Not applicable

**Merge ref:** Not merged

**Branch:** `feat/route-first-rendering`

**Base branch:** `main`

**Publication provider:** Local

**PR template:** Not applicable

**Merge method:** ff-only

**Required checks:** `npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds

**Feature close-out:** Not run

**Provisional PR title:** `feat(app): render the route-first content model`

**Purpose:** F2 is additive rendering of one accepted contract — typed dataset schemas, the badge treatment, the tab strip, the upgraded route page, and the dashboard region. The single Local boundary keeps the content reshape preceding the rules that require it, keeps `main` green at every commit, and lands the DESIGN's surfaces as one reviewable unit; F1 (already on `main`) is the only precedent and dependency. No intermediate seam justifies a second merge boundary.

#### Package `stub-reshape` — Commit 1: Reshape the Elspeth stubs to the typed empty forms

**Status:** Planned

**Wave:** 1

**Depends on:** []

**Write scope:** ["content/elspeth-von-draken/data/armies.json", "content/elspeth-von-draken/data/skills.json", "content/elspeth-von-draken/data/research.json", "content/elspeth-von-draken/data/buildings.json", "content/elspeth-von-draken/data/mechanics.json", "content/elspeth-von-draken/data/vco.json", "content/elspeth-von-draken/routes/route-1.md", "content/elspeth-von-draken/routes/route-2.md", "content/elspeth-von-draken/routes/route-3.md", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): reshape Elspeth dataset stubs to typed empty forms`

**Work:** Reshape the committed skeleton to the DESIGN's typed empty forms while it still passes the current F1 lint: the six dataset files change from `[]` to `{}` (an empty map/object per schema — DESIGN §4), and the three route files' `panelOrder` blocks become the five canonical group keys (`armies`, `skills`, `research`, `buildings`, `mechanics`) with empty id lists — the seed key `builds` is renamed to the dataset name `buildings`, and the seed-derived id lists are emptied because no id can resolve in an empty corpus. Update `test/elspeth-skeleton.test.ts` to assert the new shapes through the real loader.

**Atomicity:** One outcome: "the committed content takes its F2 empty forms and the loader still accepts it" — the six datasets and three route documents are one tree contract (index → manifest → named files must stay consistent or the lint fails), and the accompanying test proves the loader agrees. This commit must precede Commit 3's rules (which would reject `[]` stubs and non-canonical keys) so the `content-lint` gate stays green at every commit; a smaller split (one stub at a time) would leave the tree half-reshaped without a reviewable outcome. ~45 counted lines (hand-authored JSON; tests excluded). No further valid split exists.

**Out of scope:** The typed schema rules (Commit 3), any rendering, the fixture tree reshape (Commit 3), and any invented dataset content (F4).

**Implementation packet:** Datasets become `{}` exactly — no per-route scaffolding, no sample entries. Each route frontmatter keeps the `panelOrder:` map with the five canonical keys, every list `[]`. Keep every other frontmatter field verbatim (ids, numbers, names, claims, gaps, notes). The emptied seed ids are not lost to the project: the raw seed atlas (`Elspeth_VCO_Expedition_Atlas.html` in gitignored `.work/references/`) retains them for F4's migration; do not copy them anywhere in this commit.

**Files and responsibilities:** The six dataset JSON files — the typed empty form per schema. The three route files — canonical `panelOrder` with empty lists; nothing else changes. `test/elspeth-skeleton.test.ts` — asserts each six dataset `value` deep-equals `{}` and each route's `panelOrder` has exactly the five canonical keys with empty lists (loading through `app/content/load.ts` with the filesystem reader, as today).

**Tests and proof:** Observable: `node tools/content-lint.mjs` exits 0 on the reshaped committed `content/` under the unchanged F1 rules; the skeleton test loads the reshaped tree and asserts the empty forms and canonical keys. Seam: the existing loader-based skeleton test + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** A route document or dataset file that cannot express the reshape (frontmatter subset limitation — report, don't work around with a new syntax); a claim/field the DESIGN's empty form contradicts (design defect — report).

**Review mandate:** JSON shows `{}` for exactly the six; `panelOrder` keys are exactly the five canonical names with empty lists in all three routes; `builds` appears nowhere; no content invented or paraphrased; nothing outside `content/` + `test/elspeth-skeleton.test.ts` changed.

#### Package `confidence-badge` — Commit 2: Render confidence states as the Confidence Badge

**Status:** Planned

**Wave:** 1

**Depends on:** []

**Write scope:** ["app/badges.ts", "app/components/ConfidenceBadge.ts", "app/content/load.ts", "app/styles/app.css", "test/components.test.ts"]

**Provisional commit:** `feat(app): render confidence states as the Confidence Badge`

**Work:** Implement the ONE badge treatment the DESIGN requires for every confidence state — route claims, `::claim` callouts in boot-rendered section prose, and dataset items later: `app/badges.ts` owns the state → label + icon vocabulary (hand-authored 1px-stroke round-join inline SVG strings for check/clock/branch/flag, inheriting `currentColor`); `app/components/ConfidenceBadge.ts` renders the VNode badge (icon + mono uppercase label + state colour, optional trailing source links); `app/content/load.ts`'s `claim_callout_open` renderer emits the same anatomy (icon + label + resolved per-`src` links) inside the existing `<aside class="claim …">` markup; `app.css` styles `.confidence-badge` and the `.claim` callout as one badge treatment (1px state-colour border, 3px radius, container tint background, colour never the sole indicator).

**Atomicity:** One outcome: "every confidence state renders as the badge wherever the DESIGN requires it" — the component, the boot-HTML callout treatment, and the shared label/icon vocabulary are one contract; a split would leave either the data-driven or the prose path without its treatment, and the DESIGN explicitly demands identical treatment for both (you cannot ship one half as a coherent outcome). ~250 counted lines. No further valid split exists.

**Out of scope:** Route identity claims (Commit 5), dataset items (Commit 8), any tab/panel work, and F3's source panels (F2 owns only the link).

**Implementation packet:** `app/badges.ts` maps each `ClaimState` to `{ label, iconSvg }` — labels match the DESIGN confidence table (CONFIRMED/HISTORICAL/INFERRED/VERIFY), icons are 12px inline SVG strings in the design system's stroke style. `ConfidenceBadge` takes `{ state, sources? }` and renders a `span.confidence-badge confidence-badge--<state>` containing the icon (an `<svg>` element wrapping the inner markup, `viewBox` around 12×12), the mono uppercase label, and — when `sources` is non-empty — one trailing `<a>` per source linking its URL. `load.ts`'s renderer rule keeps the existing `class="claim"`, `data-state`, and `data-src` attributes (the content-model callout assertions depend on them) and adds the icon + label. Per-`src` links resolve at boot through markdown-it's render env: each route body renders with `md.render(text, env)` carrying that lord's parsed sources, and `claim_callout_open` resolves each `src` id to a link from `env.sources`; markdown-it stays confined to `load.ts`, and the existing `class="claim"` / `data-state` / `data-src` contract is preserved verbatim. app.css additions are token-only (no raw colours/radii), including the `prefers-reduced-motion` transition band. `STATE_LABELS` in `app/views/route.ts` is NOT touched by this commit (Commit 5 replaces its use with the badge).

**Files and responsibilities:** `app/badges.ts` (new) — the pure vocabulary. `app/components/ConfidenceBadge.ts` (new, h-based no-JSX) — the presentational badge. `app/content/load.ts` — the callout renderer rule emits badge anatomy. `app/styles/app.css` — badge + callout styling. `test/components.test.ts` (new) — the badge contract proof.

**Tests and proof:** Observable: the badge component renders label + icon presence + colour modifier class for all four states, and trailing source links when sources are provided. The fixture tree's "Early → Mid" section HTML (loaded via `load.ts`) contains the badged callout anatomy — icon, mono label, and a resolved source link — while the committed content (no callouts) is unchanged. Seam: zero-DOM VNode flatten + the load output string.

**Validation:** `npm test`, `npx tsc --noEmit`. No services; fixture reads only.

**Stop conditions:** A state vocabulary addition the DESIGN doesn't license (report); an icon style requirement (fill vs stroke) the DESIGN doesn't pin (use the documented 1px-stroke round-join as the only style); a `.claim` HTML contract conflict with the existing content-model assertions (a regression guard, not a reason to weaken them).

**Review mandate:** exactly the four badges; label always present (colour never sole indicator); icons are hand-authored inline SVG (no icon library, no emoji, no CSS-shape substitutes); `load.ts` stays the only markdown-it user; no `.tsx`, no `package.json` change; callout markup keeps `data-state`/`data-src`.

#### Package `dataset-contracts` — Commit 3: Typed dataset schemas and panel-order rules

**Status:** Planned

**Wave:** 2

**Depends on:** ["stub-reshape"]

**Write scope:** ["app/content/types.ts", "app/content/lint.ts", "app/content/load.ts", "test/fixtures/content/als-rhyn-of-lorek/data/armies.json", "test/fixtures/content/als-rhyn-of-lorek/data/skills.json", "test/fixtures/content/als-rhyn-of-lorek/data/research.json", "test/fixtures/content/als-rhyn-of-lorek/data/buildings.json", "test/fixtures/content/als-rhyn-of-lorek/data/mechanics.json", "test/fixtures/content/als-rhyn-of-lorek/routes/route-1.md", "test/content-model.test.ts", "test/lint-cli.test.ts"]

**Provisional commit:** `feat(content): add typed dataset schemas and panel-order rules`

**Work:** Turn the six dataset stubs into typed contracts (DESIGN §4): `app/content/types.ts` defines `PanelGroup` (the five panel dataset names), the typed dataset shapes — `armies` as a per-route map of entry id → army (label, name, optional `supportName`, `units[]` of `{n, name, role, kind}`, legendary-lord and generic-lord columns of the same unit-row shape, optional `context`, `notes[]`, `plan`, `size`, `sources[]`, optional `state`/`src`), skills/research/buildings/mechanics as flat per-lord maps of entry id → item (label, title, intro, `steps[]` of `{title, note, optional gate, optional short}`, optional `details`, `sources[]`, optional `state`/`src`), `vco` as a per-route ordered list of `{id, text, state, optional src}` — and tightens `PanelOrder` to the canonical group keys with string id lists. `app/content/lint.ts` validates every named dataset against its schema (the empty form `{}` is valid), validates `panelOrder` group keys against the five names and resolves every listed id into the parsed entries (armies ids resolve in the route's own armies map; flat-dataset ids resolve in the lord-wide map; unknown group keys and unresolvable ids emit `file:field — message` with the offending key/id), and keeps the existing `state`/`src` vocabulary rule covering all datasets. It also exports the two existing registry constants (`REQUIRED_SECTIONS`, `OPTIONAL_SECTIONS`) from `app/content/lint.ts` so the later gap-marker view can import the registry order — export-only, no rule change. `app/content/load.ts` parses the validated datasets into the typed values on the frozen tree. The fixture tree is reshaped like the committed one (five datasets `{}`, route `panelOrder` canonicalized from its provisional keys to the five canonical empty lists) so fixtures stay lint-clean.

**Atomicity:** One outcome: "the six datasets are typed contracts the shared rule set enforces and the tree carries typed values, with the fixture tree already conforming" — types, lint rules, group vocabulary, id resolution, and the typed parse share the same modules and must land against each other (the committed content already reshaped in Commit 1 is what keeps the gate green). Splitting the schemas from the panel-order rules would leave the panel contract (DESIGN §4 "Panel selection and order") unenforceable and depend on the same parsed-entry model in the same file; a types-only or load-only commit has no observable contract to prove. ~420 counted lines; exceeds the 200 soft target as one coupled contract — the same justification F1 recorded for its ~300-line `content-model` package. No further valid split exists.

**Out of scope:** All rendering (badge integration, dashboard, identity); new fixture dataset entries (Commit 8 adds them for item-anatomy proof); the committed content (already reshaped in Commit 1); F4 content.

**Implementation packet:** The lint validates the six dataset schemas with the minimal exact rules the DESIGN states — no invented fields. `state`/`src` vocabulary checks already exist generically and stay. `panelOrder` resolution scope: armies entries resolve against the route's own map; skills/research/buildings/mechanics entries against the lord-wide map; groups whose dataset is absent, or whose list is empty/absent, are valid (explicit empty state later). `vco` is not a panel group — its per-route list is validated from `vco.json` directly. Violations use `field: "datasets"` for dataset shape problems, `field: "panelOrder"` for group/id problems, with the offending id in the message so the boot-error state names file + id per DESIGN §5. The fixture route (`dark-conduits`) keeps its F1 bodies, callout, claims, and gaps unchanged; only its `panelOrder` keys become the five canonical names with empty lists.

**Files and responsibilities:** `app/content/types.ts` — `PanelGroup`, typed dataset shapes, tightened `PanelOrder`, typed `LordDataset`. `app/content/lint.ts` — per-schema dataset validators + panel-order vocabulary/resolution rules, plus the one-line export of the two existing registry constants for view consumption (no rule change). `app/content/load.ts` — build typed dataset values into the frozen tree. The five fixture dataset files + fixture route frontmatter — the canonical empty forms. `test/content-model.test.ts` — seeded violations for each new rule (bad army unit row, malformed item/steps, malformed vco item, unknown panel-order group key, unresolvable panel-order id) plus fixture-lint-clean retained. `test/lint-cli.test.ts` — at minimum one spawned-CLI case per new violation family proven at the CLI seam (bad unit row; unresolvable panel-order id), exiting 1 with a `file:field — message` line.

**Tests and proof:** Observable: the valid fixture tree loads with typed dataset values (shape assertions on the parsed values incl. frozen state); each seeded violation exits non-zero with `file:field — message` at both the `lintContent` seam and the spawned-CLI seam; the committed `content/` stays lint-clean; a schema-invalid dataset reaches boot as a `ContentBootError` naming file and field (existing boot tests extended to a shape violation). Seam: `node --test` over content-model + a spawned-CLI case.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). Fixtures are test-owned copies; no shared resources.

**Stop conditions:** A DESIGN §4 field or rule that the schema cannot express in the frontmatter/JSON subset (report, don't improvise a field); a fixture change that breaks an existing content-model assertion (the callout/claim assertions are contract, keep them); the fixture reshape proving impossible while staying lint-clean under the new rules.

**Review mandate:** rules match DESIGN §4 one-for-one (no invented rules, no missing mandatory ones); `panelOrder` resolution scopes are exactly as stated; unknown group keys and unresolvable ids are violations naming the id; the empty form is exactly `{}`; no `package.json` change; `load.ts` remains the only I/O file; no rendering added; the registry-constant export adds no rule change (same constants, now importable by views).

#### Package `route-tab-strip` — Commit 4: Route tab strip on lord and route pages

**Status:** Planned

**Wave:** 3

**Depends on:** []

**Write scope:** ["app/components/TabStrip.ts", "app/main.tsx", "app/views/lord.ts", "app/views/route.ts", "app/styles/app.css", "test/components.test.ts", "test/views.test.ts"]

**Provisional commit:** `feat(app): add route tab strip to lord and route pages`

**Work:** `app/components/TabStrip.ts` renders the Shared tab plus one tab per manifest route in manifest order, directly under the sticky nav on lord and route pages; the active tab derives from the hash route prop; links target the existing hash routes; Left/Right/Home/End and click navigation change the hash (the single source of truth), focus follows the active tab, and roving tabindex makes only the active tab tabbable. `app/main.tsx` passes the hash route down and gives `RouteView` the lord context it needs (`{ lord, route }`); `app/views/lord.ts` and `app/views/route.ts` mount the strip above their content.

**Atomicity:** One outcome: "the route tab strip navigates from both pages with keyboard and click support, hash-derived" — the component, its view wiring, and the styling are one render surface (a strip on one page only is not a coherent outcome, and its CSS is intrinsic). ~245 counted lines. No further valid split exists.

**Out of scope:** The identity card and gap markers (Commits 5–6), dashboard (7–8), any route-view data beyond the strip, and home-page changes (the strip is lord/route pages only).

**Implementation packet:** The component receives `{ lordSlug, routes, activeId }` where `activeId` is `"shared"` or a route id derived from the hash route; tabs are `<a role="tab" href="#/<lord>/route/<id>">` (Shared → `#/<lord>`), with `role="tablist"` on the container, `aria-selected`, and `tabIndex` 0 on the active tab / −1 elsewhere. Keyboard: a small exported pure helper `tabNav(direction, activeIndex, count)` (Left/Right with wrap, Home/End bounds) drives the handler, which sets `window.location.hash` (navigation state, not I/O — hash is the source of truth) and a ref/effect moves focus to the newly active tab after render. Tab content per DESIGN §6: mono uppercase route code (I/II/III), proportional title, official VCO title dimmed beneath (or the unresearched marker), "SHARED" label on the first tab. CSS in app.css: carbon `surface-container` background, hairline bottom border, 10px top radius, active = `on-surface` + 2px `primary` underline, `:focus-visible` ring, 0.15–0.2s colour transitions, `prefers-reduced-motion` disabled; all values token-only.

**Files and responsibilities:** `app/components/TabStrip.ts` (new, h-based) — the strip + pure keyboard helper. `app/main.tsx` — pass `hashRoute` and lord context into views. `app/views/lord.ts`, `app/views/route.ts` — mount the strip with the derived active id; `RouteView`'s prop becomes `{ lord, route }`. `app/styles/app.css` — strip styling. `test/components.test.ts` — helper cases + rendered-tab VNode assertions. `test/views.test.ts` — lord/route views render the strip over the committed tree (Shared + I/II/III in manifest order, correct hrefs, active tab from the hash prop).

**Tests and proof:** Observable: given a hash route, the strip renders Shared + I/II/III in manifest order with the hash-derived active tab carrying `tabIndex` 0 + `aria-selected`; the pure helper returns wrap/bounds-correct next/prev/first/last indices; lord and route views include the strip. Seam: zero-DOM VNode flatten + the exported pure helper.

**Validation:** `npm test`, `npx tsc --noEmit`. No services.

**Stop conditions:** A keyboard/ARIA requirement that needs DOM-only proof (focus movement into view is covered by the manual HTTP boot; stop rather than add a DOM test dependency); a strip state the hash cannot represent (report — hash is the single source of truth).

**Review mandate:** active state is derived, never stored; no localStorage, no DOM libraries; tab order is manifest order, not re-sorted; `RouteView` signature change is exactly `{ lord, route }`; token-only CSS; no layout-shift mechanics (no width/height/font-weight changes on state change).

#### Package `route-identity` — Commit 5: Route identity card and VCO objectives

**Status:** Planned

**Wave:** 4

**Depends on:** ["confidence-badge", "dataset-contracts"]

**Write scope:** ["app/views/route.ts", "app/content/query.ts", "app/styles/app.css", "test/fixtures/content/als-rhyn-of-lorek/data/vco.json", "test/views.test.ts"]

**Provisional commit:** `feat(app): render the route identity card and VCO objectives`

**Work:** Rebuild the route page's header region per DESIGN §3/§6: the bone Route Identity Card — mono uppercase eyebrow (`ROUTE I`) with a primary dot, the official VCO title or the explicit unresearched marker (F1 copy retained), the thematic subtitle in a dimmed proportional headline (visually distinct from the official title), objective and reward as `ConfidenceBadge`-rendered claims with their resolved source links, and interpretation/bottleneck/motto notes when present. Below the identity, render the optional VCO objective-item undercard from `data/vco.json`'s per-route entry — each item a `ConfidenceBadge`-carrying row (id, text, state, optional src link). `app/content/query.ts` gains pure lord-scoped helpers (`getVcoObjectives(lord, route)`, `resolveSources(lord, ids)`); `app/views/route.ts` resolves them internally from the `lord`/`route` props Commit 4 already threads (main.tsx is not touched); the single `vco` fixture dataset gains one valid per-route entry so the undercard is provable.

**Atomicity:** One outcome: "the route page header region renders the identity contract and the optional VCO objective list" — the identity card, its claims (via the badge), and the VCO undercard are one page region fed by one typed dataset + one query helper; the DESIGN acceptance items for the card and the VCO read as one surface, and a split would leave either the card or the objective list without proof. ~225 counted lines. No further valid split exists.

**Out of scope:** The section region (Commit 6), any dashboard work, F3 source panels, and tab-strip changes (landed in Commit 4).

**Implementation packet:** The identity card replaces the F1 identity block's inline state labels with `<ConfidenceBadge state=… sources=…/>`; claim text and src ids keep rendering verbatim from the same frontmatter. The unresearched marker keeps the F1 copy ("unresearched" meaning per DESIGN §6, F1 copy may be retained). `getVcoObjectives` returns the route's typed `VcoItem[]` (empty when the entry or dataset is absent — the undercard renders nothing then, per the DESIGN's "optional"); the fixture `vco.json` gains `{"dark-conduits": [{ id, text, state: <one of the four>, src: ["vco-guide"] }]}` — lint-clean under Commit 3's rules. CSS: identity card (bone `inverse-surface`, 10px radius, `stack-md` padding, no shadow), official-title eyebrow + primary dot, dimmed subtitle, and the VCO undercard as a hairline-bordered panel with a mono eyebrow; token-only.

**Files and responsibilities:** `app/views/route.ts` — identity card markup + VCO undercard (replaces the F1 identity block + `STATE_LABELS` map). `app/content/query.ts` — `getVcoObjectives`, `resolveSources` (pure, lord-scoped). `app/styles/app.css` — identity card and undercard styling. `test/fixtures/…/data/vco.json` — one valid fixture entry. `test/views.test.ts` — the committed route shows eyebrow/subtitle/unresearched marker/claim texts with badge anatomy (labels + colour classes + src links), interpretation/bottleneck/motto when present, and NO VCO undercard (empty committed entry); a fixture-loaded assertion renders the undercard with badge'd items and src links.

**Tests and proof:** Observable: committed route-1 renders the identity card content with badge anatomy and no VCO section; the fixture route (loaded via `load.ts`) renders the VCO undercard with each item's label/state/src link; query helpers return typed values and not-found/empty results. Seam: zero-DOM VNode flatten over the committed and fixture trees.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). Fixture is test-owned.

**Stop conditions:** A DESIGN copy requirement conflict (the "unresearched" copy is F1-retained; if the DESIGN pin differed, report); the VCO undercard proving unrenderable from the typed tree (contract gap — extend `query.ts`/types in a replanned package, not silently).

**Review mandate:** official title and subtitle remain visually distinct classes (never interchangeable); badge reuse only (no badge logic duplicated); the committed content shows no undercard while the fixture proves the real rendering; no invented VCO copy (the fixture entry is test-owned); `query.ts` functions are pure.

#### Package `gap-markers` — Commit 6: Place content gap markers in the section registry

**Status:** Planned

**Wave:** 5

**Depends on:** []

**Write scope:** ["app/views/route.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): place content gap markers in the section registry`

**Work:** Replace F1's trailing gap list with in-flow Content Gap Markers: the route body region walks the registry order — required sections, then optional sections, then declared transition gaps in declared order (the two registry constants, exported by Commit 3 from `app/content/lint.ts`) — and for each slot renders the present section (existing section markup, restyled with a mono eyebrow + panel framing) or a Content Gap Marker (dashed hairline panel, "CONTENT GAP" eyebrow, F1's explanatory copy repositioned in-flow) when the title is declared in `gaps`. The F1 trailing `gapList` markup, its copy path, the "no sections yet" fallback, and the `.gap-list` CSS are removed with the assertions that protected them.

**Atomicity:** One outcome: "every declared gap renders as a marker at its registry position and the trailing gap list is gone" — the interleave logic, the marker styling, and the removal of the F1 surface are one change to the route page's section region (a marker without the removal leaves the old list duplicated; a removal without the interleave leaves gaps invisible). ~135 counted lines. No further valid split exists.

**Out of scope:** The dashboard region, identity card changes (Commit 5), and any content change (gaps/frontmatter stay exactly as committed).

**Implementation packet:** The walk uses `REQUIRED_SECTIONS` then `OPTIONAL_SECTIONS` (exported by Commit 3 from `app/content/lint.ts`; the route view imports them), then the route's declared gaps whose title starts with `Transition → ` in declared order. For each registry slot: if the route has a section with that title, render it at that position; else if the title is in `gaps`, render the marker. Sections the lint already guarantees (all required present or declared) make "neither" unreachable. The committed all-gap content therefore renders exactly seven in-flow markers in registry order; a "Mixed" case (present sections interleaved with markers) is proven with a temp copy of committed content where route-1 keeps one H2 body and declares the rest as gaps (valid per lint). The marker copy keeps the F1 wording's meaning ("…is a declared gap — it has not been written yet.") repositioned in-flow; the pre-Delivery wording beyond the meaning is not contractual.

**Files and responsibilities:** `app/views/route.ts` — registry walk + marker component + removal of `gapList` and the empty-body fallback. `app/styles/app.css` — marker styling (dashed 1px `outline` border, 10px radius, stack-md padding, no fill) and the section region's eyebrow/panel framing; remove `.gap-list*` rules. `test/views.test.ts` — replace the trailing-list assertions with in-flow assertions.

**Tests and proof:** Observable: committed route-1 renders seven "CONTENT GAP" markers in registry order (assert relative positions in the flattened text), no "This route has no sections yet.", and no trailing-list copy; the mixed temp copy renders section + markers interleaved in registry order. Seam: zero-DOM VNode flatten over committed/temp content.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). Temp-copy test patterns follow the existing `inBrokenCopy` convention; no services.

**Stop conditions:** Registry order ambiguity for a present-but-unregistered section (report; the lint rules make it unreachable, don't invent a slot); a DESIGN copy requirement the F1 wording can't carry.

**Review mandate:** markers appear exactly where the DESIGN's registry positions are and only for declared gaps; the empty-body fallback and `.gap-list` CSS are deleted with their tests (no dead paths); no content files changed; all-gap route still renders identity + markers, never blank.

#### Package `dashboard-shell` — Commit 7: Five-tab dashboard region with empty states

**Status:** Planned

**Wave:** 6

**Depends on:** ["dataset-contracts"]

**Write scope:** ["app/components/dashboard.ts", "app/content/query.ts", "app/views/route.ts", "app/styles/app.css", "test/components.test.ts", "test/views.test.ts"]

**Provisional commit:** `feat(app): add the five-tab dashboard region`

**Work:** `app/components/dashboard.ts` renders the dashboard region as one block: a tab bar with the five fixed panels (ARMY TEMPLATES / SKILLS / RESEARCH / SETTLEMENTS / MECHANICS) and exactly one visible panel; selection is component-local `useState` (initial = first panel), keyboard (Left/Right/Home/End) mirrors the route strip pattern but changes the local selection (no hash change); the dashboard is keyed by route id so navigation resets selection; a per-panel explicit empty state (mono label + one proportional sentence — never blank space) renders when the panel's `panelOrder` list is empty or absent. `app/content/query.ts` gains the pure panel-order resolution (`getPanelEntries(lord, route)` returning, per group, the typed entries in `panelOrder` order); `app/views/route.ts` resolves it internally from the `lord`/`route` props Commit 4 already threads (main.tsx is not touched); the dashboard region mounts after the sections.

**Atomicity:** One outcome: "the dashboard region exists with five tabbed panels, component-local selection, and explicit empty states" — the tab bar, selection state, keyed reset, and empty states are one render surface; with the committed content (empty panel lists) this is a complete user-visible outcome per DESIGN acceptance (empty states, never blank), and item anatomy is an independent later outcome (Commit 8). ~205 counted lines. No further valid split exists.

**Out of scope:** Item anatomy, source links, and item badges (Commit 8); anything hash-driven (dashboard selection is NOT hash-derived — no URL persistence); F5 ledger surfaces.

**Implementation packet:** Five fixed tabs render from the group vocabulary in `app/content/types.ts`, in the DESIGN's panel order (armies, skills, research, buildings, mechanics → Army templates, Skills, Research, Settlements, Mechanics labels); each panel receives its group's resolved entries (empty from the committed content). The tab bar uses the same tablist roles/active styling pattern as the route strip, but the handler updates local state only. Reset: `app/views/route.ts` renders `<Dashboard key={route.id} … />` so a route change remounts and resets selection (section-anchor hashes within a route do not reset). Empty-state copy is explicit ("no content yet" meaning per DESIGN §6). CSS: tab bar with hairline bottom border + active `primary` underline on `surface-container`, panel at 24px padding / 10px radius / hairline border; token-only.

**Files and responsibilities:** `app/components/dashboard.ts` (new, h-based) — tab bar + visible panel + selection state + empty state. `app/content/query.ts` — `getPanelEntries` (pure; returns ordered typed entries per group, `[]` for empty/absent lists). `app/views/route.ts` — mount + keyed reset. `app/styles/app.css` — dashboard styling. `test/components.test.ts` + `test/views.test.ts` — tab order/labels, initial selection, empty-state text on the committed tree.

**Tests and proof:** Observable: over the committed tree the dashboard renders five tabs in fixed order with the first panel visible, and each panel's explicit empty state (assert per-panel empty copy and that no panel is blank); keyboard helper cases reuse the Commit 4 pattern for bounds/wrap. Seam: zero-DOM VNode flatten; the keyed-remount reset is visible in `route.ts`'s render code and covered by the manual HTTP boot (not provable without DOM).

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** A selection-reset requirement that needs DOM-only proof (the keyed-remount mechanism is the implementation; manual boot verifies — stop rather than add a DOM harness); an empty-state styling conflict with the badge/identity treatments.

**Review mandate:** selection is component-local and never persisted (no localStorage, no hash write for panels); exactly five fixed tabs in DESIGN order; the committed tree shows five explicit empty panels; `getPanelEntries` is pure and returns lists in `panelOrder` order only; no item anatomy leaks in early.

#### Package `panel-items` — Commit 8: Render dashboard panel items from the typed datasets

**Status:** Planned

**Wave:** 7

**Depends on:** ["dashboard-shell", "confidence-badge", "dataset-contracts"]

**Write scope:** ["app/components/dashboard.ts", "app/styles/app.css", "test/components.test.ts", "test/views.test.ts", "test/fixtures/content/als-rhyn-of-lorek/data/armies.json", "test/fixtures/content/als-rhyn-of-lorek/data/skills.json", "test/fixtures/content/als-rhyn-of-lorek/data/research.json", "test/fixtures/content/als-rhyn-of-lorek/data/buildings.json", "test/fixtures/content/als-rhyn-of-lorek/data/mechanics.json", "test/fixtures/content/als-rhyn-of-lorek/routes/route-1.md"]

**Provisional commit:** `feat(app): render dashboard panel items from the typed datasets`

**Work:** Render the `panelOrder`-listed entries with the DESIGN's atlas-mirroring anatomy: the armies panel shows each army's label, name, optional `supportName`, unit rows (`n`, `name`, `role`, `kind`) in a legendary-lord column and a generic-lord column (same unit-row shape), an explicit absent marker for an empty column, plus optional `context`, `notes[]`, `plan`, `size` and source links; the skills/research/buildings/mechanics panels show each item's label, title, intro, steps with optional gates (and optional `short`), optional `details`, sources as links; any item carrying a `state` renders the `ConfidenceBadge`; entries not listed in the route's `panelOrder` are not rendered (not an error). Fixture content (test-owned, lint-clean under Commit 3's rules) supplies real entries — armies per-route entries with populated and one empty generic column, flat item entries across the four datasets with steps/gates/sources/states, and `panelOrder` id lists in the fixture route referencing them (plus one unlisted entry) — so the anatomy is provable.

**Atomicity:** One outcome: "each dashboard panel lists exactly its route's `panelOrder` items in order with their full anatomy" — the two item families (army templates vs title/intro/steps items) share the resolution, source-link, badge, and fixture plumbing and fall under one DESIGN acceptance criterion; splitting by family would duplicate that plumbing across commits and leave either half unable to prove "each panel lists exactly its route's `panelOrder` items in order." ~285 counted lines; exceeds the 200 soft target as one outcome (the fixture content is test-owned and excluded from the count). No further valid split exists.

**Out of scope:** Any committed-content change (fixtures only — F4 owns real content); the tab/shell behavior (Commit 7); F3 source panels; transition cross-links (F7).

**Implementation packet:** Renderers dispatch on the group: armies → per-army table with two columns; the other four → item cards. `steps.gate` renders as a visible gate marker on its step. Sources resolve through `resolveSources(lord, ids)` (Commit 5) to links. State-bearing items render `<ConfidenceBadge>` exactly as the identity claims do. Fixtures: `armies.json` becomes `{"dark-conduits": { "early": {…army with units + both columns…}, "late": {…army with an empty generic column…} }}`; the four item datasets gain 1–3 valid entries each (one with a `gate` step, one with a `state`, one with `details`); `vco.json` stays as Commit 5 shaped it; the fixture route's `panelOrder` lists the ids; one dataset gains an entry deliberately NOT listed to prove non-rendering. All fixture content must pass the Commit 3 rules (the fixtures-lint-clean test is the guard).

**Files and responsibilities:** `app/components/dashboard.ts` — the per-group renderers + badge/source integration. `app/styles/app.css` — army table (hairline rows, column groups, tabular figures), item card, step/gate and absent-marker styles. The five fixture datasets + fixture route frontmatter — test-owned anatomy fixtures. `test/components.test.ts` + `test/views.test.ts` — anatomy assertions.

**Tests and proof:** Observable: over the fixture tree, the armies panel shows unit rows with `n`/`name`/`role`/`kind` in both columns, the empty-column absent marker, and source links; an item panel shows title/intro/steps with the gate marker, details, badge on the stated item, and its source link; the unlisted entry appears nowhere in the rendered panel text; committed content still renders the five explicit empty states (no regression). Seam: zero-DOM VNode flatten over the fixture and committed trees.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 on committed content — the fixtures are linted by the fixture-lint-clean test, not the CLI on `content/`). No services.

**Stop conditions:** A DESIGN anatomy field that the typed schema cannot express (contract gap — replan types, don't improvise); fixture content that fails the Commit 3 rules (evidence of a schema mismatch — report); a badge requirement beyond the Commit 2 contract (reuse, don't extend).

**Review mandate:** exactly the DESIGN anatomy (no invented fields/columns); unlisted entries never render; sources are links, states are badges (no new badge logic); only test-owned fixtures carry real entries; committed content unchanged and still lint-clean; no new dependencies.

## Discoveries and replanning

No material deviations yet. Record blockers, decisions that change remaining work, and replaced packages here during execution; preserve stable IDs and never reuse an ID for a different outcome.

## Final validation

Exact gates, in order, before final feature review:

1. `npm test` — full `node --test` suite green (all F1 suites unchanged plus the new dataset-schema, badge, tab-strip, identity, gap-marker, dashboard, and item tests).
2. `npx tsc --noEmit` — clean over `app/`, `tools/`, `test/`.
3. `node tools/content-lint.mjs` — exit 0 on the committed `content/`.
4. `npm run build` — static `dist/` produced; `package.json` diff empty (no new dependencies).
5. Manual HTTP boot (headless Chromium against `npm run serve`, or `npm run dev`): home → lord → the route tab strip sits under the sticky nav (Shared + I/II/III in manifest order); click and arrow/Home/End keyboard navigation move the active tab and the exact page/section survives a reload; the route page shows the identity card (mono eyebrow + primary dot, official title or the unresearched marker, dimmed subtitle, badged objective/reward with source links, interpretation/bottleneck/motto) followed by present sections and in-flow CONTENT GAP markers in registry order — no trailing list, an all-gap route is never blank; the dashboard shows five tabs with explicit empty states per panel on the committed content, selection resets when switching routes; unknown hashes still render not-found and a corrupted `content/` file still renders the boot error naming file and field.
6. The DESIGN §7 acceptance criteria checked item by item, including the desaturation check for badges (labels + icons remain distinguishable with colour removed) and the DESIGN.md Pre-Delivery Checklist for F2 surfaces (keyboard, `:focus-visible` rings, contrast pairings, 0.15–0.2s transitions under `prefers-reduced-motion`, z-index scale, no layout shift in the tab strip).

## Documentation impact

Complete during reconciliation at feature close-out. Expected owners, reconciled by the coordinator/steward — not planned package work:
- `.wiki/DESIGN.md` — Components section gains implemented-verified notes for Route Tab Strip, Route Identity Card, Content Panel, Confidence Badge, Content Gap Marker (already specified; reconcile only what implementation changed).
- `.wiki/ARCHITECTURE.md` — §1.1 module layout gains `app/components/` + `app/badges.ts` as implemented; §2 current-state tree updated for the F2 files and views; §1.2 status line dropped from "F2 dashboard not implemented".
- `.wiki/TODO.md` — feature-level status moved to `Completed` after verified final integration.
- The accepted ROUTE-FIRST-RENDERING-DESIGN.md and this ledger stay in place through completion; documented correction entries appended where the DESIGN's wording and implemented behavior resolve differently (e.g., canonical `panelOrder` group vocabulary), with the ledger as the record.
