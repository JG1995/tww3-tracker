# Elspeth Migration (F4 — Seed content migration)

**Design:** [Elspeth Migration design](ELSPETH-MIGRATION-DESIGN.md)

## Status

Completed

**Ledger schema:** 4

**Feature complete:** merged to `main` as `cafe6a66` on 2026-10-03 after developer approval at the Local integration gate (all eleven packages Integrated; close-out reviewed in feature mode — Accept, no blocking findings, one advisory MEDIUM retained).

## Intent

Restructure the pilot atlas (`.work/references/Elspeth_VCO_Expedition_Atlas.html`, gitignored, read-only) into the committed content model so every Elspeth route renders all registry sections with real content and all five dashboard panels render populated items — a content-only migration through the existing F1/F2 code, with the model corrected once, before any second faction copies it. The accepted DESIGN (Open Questions: None) owns the requirements, the atlas-vs-skeleton authority rule, the confidence-state policy, and the acceptance criteria; this ledger owns the delivery graph and execution contracts and must not restate the DESIGN as a competing specification.

## User-visible behavior

- The three route pages render eight registry sections each — `Opening`, `Early → Mid`, `Mid → Late`, `Victory push`, `Territory policy`, `Diplomacy`, and the two `Transition → route-<x>` sections — carrying the atlas's phase/territory/diplomacy/transition prose instead of gap markers; no CONTENT GAP marker renders where content landed.
- The five dashboard panels on every route render the atlas's items in the atlas's `panelOrder` order: Army templates (five per route with unit counts, roles, kinds, legendary vs generic columns, notes, plans), Skills, Research, Settlements, Mechanics — none in the empty state.
- The VCO objective-item undercard under each route identity renders the per-route objective list from `data/vco.json` (Route I: five targets + the 35-battle item; Route II: seven provinces; Route III: twenty candidates), each item badged with a confidence state and resolved source link; no progress or tick surface of any kind (F5 owns that).
- The lord (shared) page shows the faction introduction plus the atlas's four shared blocks as H2 sections in `shared.md` (common foundation, Smart Autoresolve boundary, economy budget, equipment guidance).
- Every VCO/patch-dependent claim renders the Confidence Badge in its exact state: frontmatter objective/reward claims (unchanged from the committed skeleton's F1-seeded values), `::claim` callouts in section prose, and dataset items carrying `state`.
- The identity card is unchanged in shape: official VCO title stays the explicit unresearched marker (`vcoTitle: null` on all three routes), thematic subtitle, badged objective/reward, interpretation, bottleneck, motto.
- Detailed behavior, rules, edge cases, and acceptance criteria: the accepted DESIGN (Open Questions: None), which the ledger links and does not restate.

## Invariants

- Content under `content/` is the single source of truth; the site never writes to it (ADR-0002). The atlas in `.work/references/` is a gitignored, read-only reference; the migration reads it, never writes it, and no file outside `content/` (plus nothing else at all — the model-adjustment verdict is "not needed") changes.
- The atlas wins on any identity field or claim disagreement with the committed skeleton; the discrepancy is recorded in this ledger's Discoveries.
- Every atlas content block is present in `content/elspeth-von-draken/` or explicitly excluded with the only accepted reason — browser-local interactive state (localStorage notes, checklist ticks, view prefs, tracker-link indexes; all F5-class). No block may silently disappear.
- `vcoTitle` stays `null` on all three routes; no invented official title.
- The committed content tree stays lint-clean (`node tools/content-lint.mjs` exit 0) at every committed prefix — the lint-gate ordering forces datasets to land before the `panelOrder` ids that reference them.
- Dataset `panelOrder` group keys stay exactly the five canonical names; the atlas's `builds` group maps to the `buildings` dataset (the rename is already canonical since F2's `stub-reshape`).
- Confidence states use exactly the four-state vocabulary; every VCO/patch-dependent claim carries exactly one state per the DESIGN §4 assignment policy; nothing is left unattributed.
- The route frontmatter contract (verified against `app/content/lint.ts` `assertRouteDocument`) does not gain fields: `type`, `avoid`, `armyIdentity`, `recommended`, the three priority fields, and per-item `use` notes have no frontmatter home and weave into body sections or dataset item fields (DESIGN §4).
- Route bodies allow only registry H2 sections (any H3/H1 is a violation, verified in `lint.ts` `assertRouteDocument`), in registry order for the four required sections, starting with a section heading.
- No new dependencies; `package.json` unchanged; no rendering component or schema file touched (content-only verdict; a recorded model adjustment would have been the exception — it is not needed).
- The committed `sources` dataset (35 entries, matching the atlas's 35 ids one-for-one) stays as-is; new claims reference existing ids.

## Non-goals

- No ledger of any kind: no campaign state, no ticks, no write path (F5). `data/vco.json` carries only the researched objective items — the stable ids F5 will tick.
- No change to `.work/references/` — the archive stays byte-for-byte untouched.
- No new components, no new routes, no changed rendering behavior; F1/F2 own the shell.
- No other faction, no new dependencies, no new content files beyond the committed `content/elspeth-von-draken/` and `content/index.json` (which is already correct and unchanged).
- No schema or lint change (verdict: content-only) and no model fork per faction.
- No browser-local interactive state migration: the atlas's per-user notes, checklist ticks, saved view preferences, and its `defaults` initial-view map are excluded, not reproduced.

## Current-state map

- Relevant components: the committed skeleton under `content/elspeth-von-draken/` (`guide.json` manifest naming 3 routes, `shared.md`, and the seven `data/*.json` files); `app/content/types.ts` (F2 typed dataset schemas — `Army` with `units`/`legendary`/`generic` unit-row columns, `notes`/`plan` as `[title, body]` pairs, `size`; `Item`/`ItemStep` with optional `gate`/`short`; `VcoItem` with `id`/`text`/`state`/`src?`; `PanelOrder` = map of the five canonical group keys to id lists), `app/content/lint.ts` (the single rule set for the lint CLI and boot: dataset shape validators, `panelOrder` group vocabulary + id resolution, route frontmatter/claims/sections/gaps/callout rules, `REQUIRED_SECTIONS`/`OPTIONAL_SECTIONS` registry constants), `app/content/load.ts` (the domain's only I/O; builds and freezes the tree after validation; renders section HTML and `::claim` callouts once at boot), `app/content/query.ts` (pure reads: `getPanelEntries`, `getVcoObjectives`, `resolveSources`), `app/views/route.ts` (identity card, VCO undercard, registry-slot walk that renders present sections and CONTENT GAP markers; the walk's slots are required + optional registry titles + the route's declared `gaps` entries starting with `Transition → `), `app/views/lord.ts` (renders `lord.sharedHtml`).
- Data model: the committed skeleton is the F2 typed empty form — the six datasets are `{}`; the three route files carry full identity frontmatter (claims, interpretation, bottleneck, motto, `transitions` string, `panelOrder` with the five canonical keys and empty lists, `gaps` with the seven registry/gap titles including exactly one `Transition → route-<x>` each) and empty bodies. The fixture tree (`test/fixtures/content/als-rhyn-of-lorek/`) carries populated example entries for the same schemas and must stay valid and lint-clean alongside the changed committed content.
- Persistence and migrations: none at runtime; the migration is a content-contract change expressed in committed files under `content/`; no migrations.
- Existing behavioral assumptions: boot-once immutable tree with `deepFreeze`; post-boot reads are synchronous; the lint is the single rule set for both boot and CLI; `panelOrder` resolution scopes — armies ids resolve in the route's own `armies[route.id]` map, flat-item ids in the lord-wide dataset map — with unknown/unresolvable ids failing the lint; a dataset item that is not listed in any `panelOrder` simply never renders (not an error); the dashboard's component-local selection resets on route navigation; section anchors are slugified from the section titles.
- Architectural seams: `routeBody` in `app/views/route.ts` walks `[...REQUIRED_SECTIONS, ...OPTIONAL_SECTIONS, ...route.gaps.filter(Transition → )]` — a transition *section* renders only when its title is declared in the route's `gaps` (the gaps field doubles as the transition-slot registry); `getPanelEntries` renders only `panelOrder`-listed ids; `getVcoObjectives` renders the undercard only when the route's `vco.json` entry exists.
- Project validation commands: `npm test` (node:test, zero-DOM suites), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 on the committed `content/`), `npm run build`, `npm run serve` (manual HTTP boot evidence for final validation).
- Primary risks: the shared committed-content tests (`test/elspeth-skeleton.test.ts`, `test/views.test.ts`, `test/components.test.ts`) assert the empty-skeleton state and must be updated by every content commit, which serializes the waves on shared test-file ownership (mirrors F2's `app.css` serialization); the atlas's prose volume makes each data commit large (pure data — excluded from the counted-code target but still the review surface); the F2 transition-slot mechanism is easy to get wrong (a route with `gaps` emptied loses its transition sections silently); the `npm run serve` HTTP boot is the only completing proof for the fully rendered guide (no DOM test harness, per the F2 precedent).

## Feature architecture

- **Atlas → model mapping layer (content authorship):** every atlas block resolves to exactly one home in the committed model — route frontmatter fields the frontmatter contract already owns (verified against `assertRouteDocument`: `id`, `number`, `name`, `vcoTitle`, `motto`, `objective`/`reward` claims, `interpretation`/`bottleneck` (already seeded), `gaps`, `panelOrder`), route registry H2 body sections (phases, territory, diplomacy, transitions), the six typed datasets (`armies`, `skills`, `research`, `buildings`, `mechanics`, `vco`), `shared.md` H2 sections, or an explicit exclusion with reason (browser-local interactive state only).
- **Datasets:** `data/armies.json` holds the per-route maps (three routes × five entries) with the atlas's `elspeth` column renamed to the F2 `legendary` column (verify-only rename; the atlas's `generic` column and all other fields map field-for-field); the four flat item datasets hold lord-wide entry maps with the atlas's entry ids (`skills` 10, `research` 4 base groups + 4 per-route override entries under distinct ids, `buildings` 9 — the atlas `builds` block, `mechanics` 5); `data/vco.json` holds per-route ordered objective items.
- **Folding (no new datasets):** the 15 techs fold into the research entries as step titles/notes/gates (their content is already the steps); the 4 field tests fold into the `testing` mechanic entry as gated steps; the 8 upgrades and 4 Amethyst paths fold into the `armoury` mechanic entry (steps/details) or, where the design says, the referencing army's notes; the 7 evidence notes fold into the claims/items they support via their `src` ids.
- **Route documents:** each route body carries the four phase sections (design phase mapping: `Opening` → `Opening`, `Early` → `Early → Mid`, `Mid-game` + `Late` → `Mid → Late`, `Victory` → `Victory push`), the two optional sections, and the two `Transition → route-<x>` sections (from the atlas `transitions` map, one section per target route); the six content-gap entries leave `gaps`; the two transition titles stay declared in `gaps` because the F2 `routeBody` walk uses declared transition gaps as its slot registry — that is the only way the sections render.
- **Route-level prose weave:** `type`, `avoid`, `armyIdentity`, `recommended`, the army/economy/mechanics priorities, and the per-item `use` notes weave into the most relevant registry section body — kept as recognizable prose, one home, never dropped and never restated; per-item `use` notes are route-specific and cannot live in the lord-wide item entries, so they land in the owning route's section prose.
- **VCO items:** `data/vco.json` route entries hold stable ids (see Decisions), each item carrying a confidence state and `src`.
- **Proof seams:** the shared committed-content tests evolve from "empty skeleton" to "migrated guide" contracts; the lint CLI is the gate on every committed prefix; `getPanelEntries`/`getVcoObjectives`/`resolveSources` over the committed tree are the render proof; the manual HTTP boot completes the visual proof.

## Uncertainty register

### Known

- The committed route documents declare seven `gaps` entries each (the six content sections plus exactly one `Transition → route-<x>`), while the atlas `transitions` map carries prose for both other routes. `app/views/route.ts`'s `routeBody` builds its slots as required + optional registry titles + declared `Transition → ` gaps, and `slotAt` renders a section when it exists at that slot. A transition section therefore renders **only when its title stays declared in `gaps`**. The migrated routes keep both transition titles in `gaps` (slot declarations, not content lacks), remove the six content entries, and therefore carry **eight** body sections per route (four required + two optional + two transitions) — the DESIGN's mapping of both `transitions` entries governs over the dispatch's "seven" shorthand (which counts today's declared gaps); the DESIGN's "gaps lists contain only sections the atlas genuinely lacks (expected: none)" is satisfied for content-gap entries, with the transition declarations retained as the F2 render mechanism. A route with `gaps: []` loses its transition sections (verified by reading `routeBody`).
- Route bodies accept only H2 registry sections: `extractSections`/`assertRouteDocument` reject any H3/H1 ("only H2 section headings are allowed in route bodies"), require the four required sections once each in registry order, allow optional and transition sections in any order, and require the body to start with a section heading. Phase titles/aims/action titles therefore render as bold-lead paragraphs and bullet lists in Markdown, never as subheadings.
- The frontmatter contract permits exactly `id`, `number`, `name`, `vcoTitle`, `objective`, `reward`, `interpretation`, `bottleneck`, `motto`, `transitions`, `panelOrder`, `gaps` (all optional-when-typed except the id/number/name/vcoTitle/claims set). The atlas's `type`, `avoid`, `armyIdentity`, `recommended`, `armyPriority`, `economyPriority`, `mechanicsPriority`, and the `use` maps have no frontmatter home (DESIGN §4 weaves them into sections/dataset items).
- Research steps in the atlas carry `checkId: "tech:<short-id>"`; `techs` is a 15-entry short-id index and `legacyResearch` is the same 15 entries keyed by display name. `ItemStep` (F2) is `{ title, note, gate?, short? }` and the lint tolerates extra keys but the typed contract does not include `checkId`. The tech *content* (name/why/prereq) is already the research step title/note/gate; `checkId` and both index blocks are the atlas's tick-tracker linkage (which checkbox matched which tech, for its localStorage checklist) — the interactive-state class, not guide content.
- Every route's atlas `defaults` map is exactly the first `panelOrder` entry of each group; the F2 dashboard renders lists in order with no per-group default selection, so excluding `defaults` loses nothing observable.
- The atlas `panelOrder.builds` group is the F2 `buildings` dataset (rename already canonical since F2's `stub-reshape`). The committed route `panelOrder` lists are empty (F2's `stub-reshape` emptied every id list and `test/elspeth-skeleton.test.ts` asserts the empty lists); the atlas's route panel lists are the authority, and Commits 9–11 fill the committed lists from them (Route II/III `research` lists carry the override ids — see Discoveries, `researchOverrides`).
- Army `kind` values are open strings (`line`, `ranged`, `artillery`, `cavalry`, `character`, …); the lint enforces only a non-empty string — no closed vocabulary to adjust.
- Phase blocks carry an optional `checkpoint` string; registry section bodies accept prose, so a checkpoint folds in as a paragraph of its section — no schema field needed.
- Route-level prose weave placements are migration authorship; the weave-to-section and state/src assignments per block follow the DESIGN policy and are recorded in Discoveries (see Decisions).
- The F1-seeded frontmatter identity text matches the atlas verbatim for `name`, `motto`, `objective`, `reward`, `summary`→`interpretation`, and `bottleneck` (verified route-by-route); the migration preserves it. The atlas `routeType`/`type` and `armyIdentity` are distinct from `summary` — both keep their own wording in their one home.
- The committed `data/sources.json` ids are exactly the atlas's 35 source ids in the same order; `src` references resolve without adding or editing sources.
- The migrations of F1 (content skeleton) and F2 (stub reshape, typed contracts) already committed: `guide.json` names the three routes, `shared.md`, and all seven datasets — no manifest change is required.

### Assumptions

- The F1-seeded frontmatter identity text is the atlas's text (verified above); if a worker observes drift, the atlas wins per the DESIGN and the change is recorded in Discoveries.
- The invisible frontmatter `transitions` field: the DESIGN route-document bullet lists `transitions` in the fixed frontmatter contract, but no F2 view renders it, and the DESIGN §4 rule weaves route-level prose into one home. The atlas transition prose's one rendered home is the two `Transition → route-<x>` body sections; this plan **drops the seeded frontmatter `transitions` string** (the field is optional in both the `Route` type and the lint) so prose is not restated in a second, invisible home. Recorded as a decision; the developer may veto it at acceptance as a bounded copy/field choice, not a replan.
- Each per-item `use` note is route-specific (the three routes carry different text for the same shared entry ids), so `use` notes weave into the owning route's section prose; they never join the lord-wide item entries, which would restate or mix routes.
- Section bodies keep the atlas wording, including internal bold/lists; only the registry H2 titles are fixed.
- The review of this plan may question the retained transition-gap declarations or the frontmatter `transitions` drop; both are decisions with the evidence recorded above.

### Decisions

- **Content-only verdict — no schema or lint adjustment.** The listed model-adjustment candidates were checked against the F2 schemas and the atlas (default expectation per the approved intent; evidence recorded under Known): `steps[].checkId` — expressible without adjustment: the tech content is present as step title/note/gate; `checkId` and the `techs`/`legacyResearch` index blocks are tick-tracker linkage (interactive-state class, excluded with reason). Phase `checkpoint` — expressible as section prose. Atlas `builds` vs committed `buildings` — a naming rename already canonical in the committed skeleton. Army `kind` vocabulary — free string, no rule to change. `defaults` — view-preference class, excluded, and equal to `panelOrder`-first entries. **Result: no atlas block forces a model change; every package is content-only** with an empty `app/content/*.ts` write scope. If execution proves a block genuinely inexpressible, that is a stop condition: report the forcing block and replan with the adjustment as its own package — do not improvise a field.
- **One PR, Local ff-only boundary** (provider `Local`, `PR ref: Not applicable`, `PR template: Not applicable`, `Merge method: ff-only`) mirroring F1/F2's accepted publication convention, base `main`, required checks `npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds. No intermediate seam justifies a second merge.
- **Package wave shape:** W1 pairs `shared-content` and `skills-dataset` (disjoint write scopes, independent behavior, no coupling) — an honest pair mirroring F2's W1 pair; every later content commit is a singleton wave because the committed-content tests (`test/elspeth-skeleton.test.ts`, `test/views.test.ts`, `test/components.test.ts`) are shared ownership for every content commit (serialization on shared test files, same honest reasoning as F2's `app.css` serialization). Never enlarge a wave for the appearance of parallelism.
- **Lint-gate ordering (dataset-first):** each dataset lands with its complete entry set and a valid standalone shape (an unlisted dataset passes the lint); routes fill `panelOrder` only in the route packages that land after the datasets they reference, so each committed prefix resolves every listed id. This is the lint-gate ordering's dataset-first alternative: datasets first, `panelOrder` filled only once ids exist.
- **vco stable ids (F5's future tick surface, never renumbered):** Route I — the atlas's five target ids (`sylvania`, `deceivers`, `drycha`, `festus`, `khazrak`) plus one new stable id for the 35-battle item (e.g. `battles-35`); Route II — kebab-case slugs of the seven province names (e.g. `eastern-border-princes`, `western-border-princes`, `tilea`, `pirates-current`, `the-blighted-marshes`, `estalia`, `irrana-mountains`); Route III — kebab-case slugs of the twenty candidate settlement names (e.g. `doz-karaz`). Unique within each route, lowercase kebab-case, matching the atlas item text verbatim (Route I items compose their text from the target records' `name`/`leader`/`note` atoms — verbatim applies to those atoms). Exact ids are assigned by the owning package and recorded in Discoveries; they become the F5 tick surface and are never renumbered.
- **VCO item states:** default `confirmed` with `src: ["vco-guide"]` — the targets/provinces/candidates are fact lists from the author's primary VCO reference (evidence note "Verified author objectives"). Where an item's wording hedges live VCO behavior (e.g. a province's treaty test or a candidate's search status), the stricter state wins per the DESIGN policy (`verify-in-campaign`). Frontmatter objective/reward claims keep their committed `verify-in-campaign` states.
- **Transitions and gaps (render mechanism):** migrated routes keep `gaps` = the two `Transition → route-<x>` titles (slot declarations) and remove the six content-section entries; the two sections render in body order. See Known.
- **Frontmatter `transitions` drop:** see Assumptions above.
- **Route-level prose weave placement:** `type`, `armyIdentity`, `recommended`, priorities, and `avoid` each weave into the section that owns the decision the block guides (type/armyIdentity/recommended/priorities → the phase sections they characterize; `avoid` → the sections it constrains, e.g. territory/diplomacy/phase prose); per-item `use` notes weave into the owning route's section discussing the item. One home each; the atlas wording wins; the exact placement per block is migration authorship recorded in Discoveries.

### Unknowns

- None gating the plan. Exact per-block weave placement and per-item state/src assignment follow the DESIGN policy and the atlas text; execution records them in Discoveries.
- An atlas `use` note for a shared entry appears in only one route's `panelOrder` list (e.g. the `recovery` build role appears in Route I's and Route III's lists but only Route I carries a `use` note); the note's home is the route that owns it, and the other route simply does not restate it.

### Risks

- **Shared-test churn serializes waves:** every content commit updates `test/elspeth-skeleton.test.ts` (and route/vco commits also `test/views.test.ts`, plus `test/components.test.ts` for Route I). Accepted, mirrors F2; the wave graph is already serial after W1 to keep ownership collision-free.
- **The transition slot mechanism is easy to get wrong** (see Known): a worker that empties `gaps` would silently unrender the transition sections while the lint stays green. The route packages' Implementation packets and Review mandates call this out explicitly; the route-view test assertions include both transition headings.
- **Large review surfaces per data commit:** each dataset package lands hundreds of lines of pure data (excluded from the counted-code target but the actual review surface). Mitigated by one-dataset-per-commit decomposition and the ledger's seeded inventory/mapping table as the traceability artifact.
- **The `npm run serve` HTTP boot is the completing proof** for the fully rendered guide (no DOM test harness, per the accepted F2 precedent); the final validation names the exact boot walk.
- **Review reading of the DESIGN's "gaps expected: none"** could flag the retained transition declarations; the mechanism decision is the rationale (see Known/Decisions).
- **Conditional per-route panel subsets:** the `buildings` dataset holds all nine roles but each route's `panelOrder` lists six; a panel shows only the listed entries (F2). No route may list a role whose entry does not exist; the lint catches it.
- A `::claim` callout inside a migrated section whose `src` id is not in the committed 35 would fail the lint — all migrated claims reference existing ids (the atlas's own 35).

## Walking skeleton

Commits 1–9 (the W1 pair, the five remaining datasets, the research overrides, then Route I): once `shared-content`, all five panel datasets, `vco-dataset`, `research-overrides`, and `route-1-content` land, one route renders the complete migrated guide through the existing F1/F2 code — identity card unchanged with the unresearched marker, eight registry sections with atlas content and no gap markers, the VCO undercard, and five populated dashboard panels. Commits 10–11 complete the other two routes; the last commit also completes the committed-content test reconciliation. Intermediate commits keep every committed prefix lint-clean with the not-yet-migrated routes still rendering their explicit gap markers and empty panels — correct, DESIGN-valid intermediate states, not regressions.

## Delivery plan

**Commit packages:** 11

### PR `elspeth-migration` — Migrate the Elspeth atlas content into the committed guide

**Status:** Planned

**Depends on:** []

**PR ref:** Not applicable

**Merge ref:** cafe6a66ceda2ceb06f41328982b30b9bd8c89f2

**Branch:** `feat/elspeth-migration`

**Base branch:** `main`

**Publication provider:** Local

**PR template:** Not applicable

**Merge method:** ff-only

**Required checks:** `npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds

**Feature close-out:** Current

**Provisional PR title:** `feat(content): migrate the Elspeth atlas into the committed guide`

**Purpose:** This PR fills the F1/F2 Elspeth skeleton with the atlas's actual content — the shared blocks, the six typed datasets, the three route bodies, and the per-route VCO objective items — so every route renders all registry sections and all five dashboard panels populated, lint-clean, with the atlas archive byte-for-byte untouched. One PR matches the F1/F2 accepted convention (Local ff-only, no PR template): the content lands in a single reviewable unit, `main` stays green at every commit by the dataset-first lint-gate ordering, and no intermediate seam justifies a second merge boundary. It is the final PR of the feature, so `Feature close-out: Not run`.

#### Package `shared-content` — Commit 1: Add the four atlas shared blocks to shared.md

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** ["content/elspeth-von-draken/shared.md", "test/views.test.ts"]

**Provisional commit:** `feat(content): add the four atlas shared blocks to shared.md`

**Work:** `shared.md` keeps its committed intro paragraph verbatim and gains the atlas's four `shared` blocks (`opening`, `smart`, `budget`, `equipment`) as H2 sections, each carrying the block's `title` as the H2 and its `intro` + `steps` (titles and notes) as prose (bold-lead paragraphs/bullets), with the step `short` lines folded into the notes and the block's `sources` recorded as `src=`-style references where the DESIGN's confidence policy requires them (the DESIGN requires attribution via claim callouts only in route bodies; in `shared.md` prose, VCO/patch-dependent statements are noted the same way route callouts are, but the committed lint does not scan non-route files — the worker keeps the atlas wording and adds explicit attribution only where the DESIGN's state policy demands it, recording placement in the ledger). The section headings use the atlas titles ("The common foundation", "Autoresolve the operation, not just the battle", "Build to a next operation", "Give equipment a job").

**Atomicity:** One outcome: "the lord page's shared fundamentals carry the atlas's four shared blocks as H2 sections while the committed intro stays" — one file's content, one user-visible surface, and one test update; splitting by block would fragment a single document with no independent outcome per block. ~0 counted code lines (pure Markdown content data, excluded from the code count); content volume ~110 lines + ~15 test lines.

**Out of scope:** The six datasets, the route documents, the VCO undercard, and any change to `guide.json` (its `shared` manifest line already points at `shared.md`).

**Implementation packet:** The committed intro paragraph stays first, verbatim. The four blocks follow as `## <atlas title>` sections in atlas order (`opening`, `smart`, `budget`, `equipment`; the DESIGN names them common foundation / Smart Autoresolve boundary / economy budget / equipment guidance). `shared.md` is not a route document — the lint only checks that it is readable — so H2 structure and any internal bold/lists are free Markdown; keep the atlas wording intact (never paraphrased), fold `short` lines and `steps[].note` into the prose, and record each block's `sources` as its attribution basis. No `::claim` callouts are required in `shared.md` (the DESIGN requires them in route body prose); attribution follows the DESIGN's policy and is recorded in Discoveries.

**Files and responsibilities:** `content/elspeth-von-draken/shared.md` — the intro plus the four H2 sections. `test/views.test.ts` — the committed-tree lord-page test gains assertions that the four section headings render (the existing "Grey Lady of Nuln" assertion stays and still passes).

**Tests and proof:** Observable: the committed lord page renders the intro paragraph plus the four `##` section titles in order, with the atlas's step notes' key wording present. Seam: zero-DOM VNode flatten over the committed tree (`LordView` renders `lord.sharedHtml`).

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 on committed `content/`). No services.

**Stop conditions:** An atlas shared-block step whose wording the schema/house rules cannot carry (report — the file is free Markdown, so this should not happen); a DESIGN copy conflict for an H2 title (the atlas title wins per DESIGN).

**Review mandate:** the intro paragraph is byte-identical; the four blocks are in atlas order with the atlas's wording (no paraphrase, no invented claims); `shared.md` is the only content file changed; the test change is additive; nothing else on the tree changed.

#### Package `skills-dataset` — Commit 2: Migrate the atlas skills dataset

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** ["content/elspeth-von-draken/data/skills.json", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): migrate the atlas skills dataset`

**Work:** `data/skills.json` becomes the lord-wide entry map of the atlas's ten skill entries (`elspeth`, `master`, `engineer`, `theodore`, `captain`, `priest`, `light`, `life`, `death`, `hunter`), each mapping field-for-field to the F2 `Item` schema: `label`, `title`, `intro`, `steps[]` (`title`, `note`, `gate?`, `short?`), `details` as `[title, body]` pairs, `sources` (the atlas's `[title, short, note, gate]` step objects map to F2's `[title, note, gate, short]` — the atlas's `short` and `note` fields both exist on every skill step, so F2's `note` carries the atlas's `note` and F2's `short` carries the atlas's `short`). State-bearing entries keep the DESIGN's four-state policy where the entry itself is VCO/patch-dependent; otherwise the optional `state`/`src` are absent.

**Atomicity:** One outcome: "the skills dataset is fully migrated from the atlas's ten entries with the F2 item shape" — one dataset file, one schema, one atlas block; a smaller split (some entries) has no independent outcome, and splitting the migration into anything coarser would combine unrelated atlas blocks (subject needs "and"). ~0 counted code lines (pure JSON data); content volume ~600 lines + ~30 test lines.

**Out of scope:** The other five datasets, all route documents, shared.md, and any `app/*.ts` change (the no-adjustment verdict holds).

**Implementation packet:** The F2 `Item` schema and the lint's `lintItemDataset` validate `label`/`title`/`intro` non-empty, `steps` as `{title, note, gate?, short?}`, `details` as `[title, body]` pairs, and `sources` as non-empty id strings; the generic `state`/`src` vocabulary check runs on every nested object. The entry ids are the atlas's own ids (`elspeth`, `master`, …) — the exact ids the atlas's route `panelOrder.skills` lists name (identical across all three routes) — so the later route packages fill their lists from the atlas and resolve them exactly. Omit empty-string `gate`/`short` values from atlas steps: the atlas emits `""` on many steps for an absent gate/short, and the lint rejects an empty string when the key is present. The atlas skill entries' `steps` contain all four fields — no mapping loss. Skill entries with VCO-dependent or patch-dependent statements (e.g. an in-game tree behavior the atlas hedges) get the DESIGN policy's state — primarily `confirmed` for tree facts (sources `skills-*`), `verify-in-campaign` for hedges — per the DESIGN §4 state rules (exact states are authorship per entry, recorded in Discoveries).

**Files and responsibilities:** `content/elspeth-von-draken/data/skills.json` — the ten-entry map. `test/elspeth-skeleton.test.ts` — the "six non-source datasets are the typed empty objects" loop stops asserting `skills` equals `{}` and instead asserts the migrated shape contract (ten entries, each a typed `Item` via the loader, `sources` id-valid); the remaining five datasets stay asserted as `{}` until their own packages land.

**Tests and proof:** Observable: the committed tree loads ten typed skill entries through the real loader; the committed `data/skills.json` is lint-clean (shape + state/src vocabulary + `src` ids resolve against the 35 committed sources). Seam: loader-based skeleton test + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** An atlas skill block the F2 `Item` shape genuinely cannot carry (contrary to the verdict — report the forcing block for replanning; do not add a field); a state assignment the DESIGN policy cannot justify (report).

**Review mandate:** exactly the atlas's ten entries and wording; entry ids match the ids in all three routes' atlas `panelOrder.skills` lists; every `steps`/`details`/`sources` field maps one-for-one; the fixture-less committed content stays lint-clean; no `app/*.ts` change; the skeleton-test edit narrows only the `skills` assertion.

#### Package `research-dataset` — Commit 3: Migrate the atlas research dataset

**Status:** Integrated

**Wave:** 2

**Depends on:** []

**Write scope:** ["content/elspeth-von-draken/data/research.json", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): migrate the atlas research dataset`

**Work:** `data/research.json` becomes the lord-wide map of the four atlas research groups (`opening`, `firepower`, `economy`, `arcane`), each a typed `Item`: `label`, `title`, `intro`, `steps[]` with `title`/`note`/`gate` (and `short` when present), `details`, `sources`. The 15 named techs fold into these steps as their content — each tech's `name` is already a step `title`, its `why` the step `note`, and its `prereq` the step `gate`. The atlas's `checkId: "tech:<id>"` fields and the `techs`/`legacyResearch` index blocks are tick-tracker linkage (browser-local checklist state, F5-class) and are **excluded**, recorded in Discoveries as such; the tech content itself is fully present in the steps.

**Atomicity:** One outcome: "the research dataset is fully migrated from the four atlas groups with the 15 named techs folded into their steps" — one dataset file with one atlas block set (`research` + the `techs`/`legacyResearch` content, which the DESIGN folds into it); a split between groups or between groups-and-techs has no independent outcome. ~0 counted code lines (pure JSON data); content volume ~450 lines + ~30 test lines.

**Out of scope:** The other five datasets, route documents (their `panelOrder.research` fills later), and any `app/*.ts` change.

**Implementation packet:** `lintItemDataset` accepts any number of steps per entry (the DESIGN's "long lists are long"); every step must carry non-empty `title`/`note`, optional `gate`/`short`. The techs' `prereq` text ("Opening option", "Grain Silos", …) becomes the step `gate` — the atlas's own gate wording, preserved. Research facts (tech names, prerequisites, sources `tech`/`school`) are `confirmed`-state content per the DESIGN policy where the entries carry states; otherwise the optional state is absent. The F2 per-route-variant rule is fixture-proven. **Corrected by the 2026-10-03 replan (see Discoveries):** the atlas declares four per-route `researchOverrides` (route2: `opening`, `economy`; route3: `opening`, `arcane`); they are carried by the separate `research-overrides` package as distinct entries, and this packet's base-group scope stands as integrated.

**Files and responsibilities:** `content/elspeth-von-draken/data/research.json` — the four-entry map with folded tech steps. `test/elspeth-skeleton.test.ts` — the empty-form loop stops asserting `research` is `{}` and asserts the migrated contract (four entries, steps-with-gates load as typed items); the other still-empty datasets keep their `{}` assertions.

**Tests and proof:** Observable: the committed tree loads four typed research entries; each folded tech's name appears as a step title (spot-check the atlas's 15 names); lint-clean shape, state vocabulary, and `src` resolution. Seam: loader-based skeleton test + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** A tech whose name/why/prereq text is not already fully present in a research step (the verdict depends on it — report the block for replanning rather than inventing a seventh dataset); a step the `ItemStep` shape cannot carry.

**Review mandate:** the four groups carry the atlas wording with the 15 techs folded and none dropped; `checkId` and the `techs`/`legacyResearch` indexes appear nowhere in committed content and are recorded as excluded interactive-state in Discoveries; entries stay lord-wide; no override entry invented; no `app/*.ts` change.

#### Package `buildings-dataset` — Commit 4: Migrate the atlas settlement roles dataset

**Status:** Integrated

**Wave:** 3

**Depends on:** []

**Write scope:** ["content/elspeth-von-draken/data/buildings.json", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): migrate the atlas settlement roles dataset`

**Work:** `data/buildings.json` becomes the lord-wide map of the atlas's nine settlement-role entries (the `builds` block: `income`, `resource`, `recovery`, `frontier`, `temporary`, `nuln`, `military`, `charter`, `survey`), each a typed `Item` (`label`, `title`, `intro`, `steps[]`, optional `details`, `sources`) with the atlas wording. The dataset holds all nine roles regardless of per-route listing (each route's `panelOrder.buildings` lists six of the nine — the DESIGN's per-route panel subsets).

**Atomicity:** One outcome: "the buildings dataset is fully migrated from the atlas's nine settlement roles" — one dataset file, one atlas block (after the `builds`→`buildings` rename already canonicalized in `stub-reshape`); splitting roles or merging with another dataset fails the single-outcome test. ~0 counted code lines (pure JSON data); content volume ~400 lines + ~25 test lines.

**Out of scope:** The other datasets, the route documents (the per-route six-entry `panelOrder.buildings` lists fill in the route packages), and any `app/*.ts` change.

**Implementation packet:** Entry ids are the atlas's `builds` ids — the exact ids the atlas's three route panel `builds` lists name (Route I `nuln, military, income, recovery, frontier, temporary`; Route II `nuln, charter, resource, income, frontier, temporary`; Route III `nuln, survey, military, income, recovery, temporary`; see the panel lists at the end of Discoveries), so the route packages fill their lists from the atlas and resolve without renaming. Building-chain facts (chains, tiers, `b-*` sources) are `confirmed`-state content; hedges about live settlement behavior get the DESIGN policy state. The atlas `label`/`title` fields differ (e.g. `label: "Income"`, `title: "Safe income town"`) — the F2 item card renders both; map both verbatim.

**Files and responsibilities:** `content/elspeth-von-draken/data/buildings.json` — the nine-entry map. `test/elspeth-skeleton.test.ts` — the empty-form loop stops asserting `buildings` is `{}` and asserts the migrated contract (nine entries load as typed items); the still-empty datasets keep their assertions.

**Tests and proof:** Observable: the committed tree loads nine typed building entries; the loader accepts them and the lint resolves their `sources`; the nine ids are exactly the union of the three routes' atlas `panelOrder.builds` lists. Seam: loader-based skeleton test + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** A role the F2 `Item` shape cannot carry (report — contrary to the verdict); a route whose atlas `panelOrder.builds` id is not among the nine (evidence of atlas/ledger drift — report and record). 

**Review mandate:** exactly nine entries with the atlas ids and wording; the ids equal the union of the atlas's three route `builds` panel lists; per-route subsetting left to the route packages (no partial lists invented here); no `app/*.ts` change; skeleton-test edit narrows only `buildings`.

#### Package `mechanics-dataset` — Commit 5: Migrate the atlas mechanics dataset

**Status:** Integrated

**Wave:** 4

**Depends on:** []

**Write scope:** ["content/elspeth-von-draken/data/mechanics.json", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): migrate the atlas mechanics dataset`

**Work:** `data/mechanics.json` becomes the lord-wide map of the five atlas mechanic entries (`testing`, `armoury`, `gardens`, `theodore`, `authority`), each a typed `Item`, with the 4 field tests folded into the `testing` entry's steps as gated steps (their reqs/rewards carry the atlas text and `src`), the 8 upgrades folded into the `armoury` entry as steps/details (names, summaries, tiers), and the 4 Amethyst paths folded into the `armoury` entry's details or, where the DESIGN permits, the referencing army's notes (`amethystPaths` name/path/note triples keep their atlas text).

**Atomicity:** One outcome: "the mechanics dataset is fully migrated from the atlas's five entries with the field tests, upgrades, and Amethyst paths folded into their entries" — one dataset file, one atlas block family whose DESIGN-mandated folding is a single coherent unit (a split would leave half the folds unlanded without an independent outcome); the DESIGN acceptance line "5 mechanics including the field tests, upgrades, and Amethyst paths" reads as one item family. ~0 counted code lines (pure JSON data); content volume ~550 lines + ~25 test lines.

**Out of scope:** The other datasets, route documents, and any `app/*.ts` change.

**Implementation packet:** The `testing` entry's six existing steps (Handgunners, school upgrades, Foundry checklists, Amethyst Ironsides, Bjuna Bombard, T5 Nuln + Spirit Barrage) align with the four field-test records (`I · Gunnery Training Grounds` … `IV · Academy of Excellence`) — the atlas already cross-references them; fold the field-test req/reward wording into the matching steps' notes/gates and keep each record's `src` (evidence=mechanics baseline, `school`). Upgrades fold into `armoury` steps/details with their tier text; `amethystPaths` fold into `armoury` details or the relevant army's notes per the DESIGN's either-home rule (record the actual home per path in Discoveries). Members' VCO/patch-dependent statements (live field-test counts, "check the exact active requirement") get `verify-in-campaign`; school/mechanics facts get `confirmed`; strategy stays `inferred` — the DESIGN state policy decides per item.

**Files and responsibilities:** `content/elspeth-von-draken/data/mechanics.json` — the five-entry map with folded content. `test/elspeth-skeleton.test.ts` — the empty-form loop stops asserting `mechanics` is `{}` and asserts the migrated contract (five entries load; spot-check the folded field-test reward text present inside `testing`).

**Tests and proof:** Observable: the committed tree loads five typed mechanic entries; the folded field tests, upgrades, and Amethyst paths appear within their entries; lint-clean shape, state vocabulary, and `src` resolution. Seam: loader-based skeleton test + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** A field-test/upgrade/path record whose text cannot fold into the F2 step/details shape without loss or distortion (report the block for replanning; the DESIGN's fold rule is binding); a state the policy cannot justify.

**Review mandate:** five entries with the atlas ids and wording; all 4 field tests, 8 upgrades, and 4 Amethyst paths present exactly once across the entries (inventory cross-check against the ledger); no seventh dataset; no `app/*.ts` change; skeleton-test edit narrows only `mechanics`.

#### Package `armies-dataset` — Commit 6: Migrate the atlas armies dataset

**Status:** Integrated

**Wave:** 5

**Depends on:** []

**Write scope:** ["content/elspeth-von-draken/data/armies.json", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): migrate the atlas armies dataset`

**Work:** `data/armies.json` becomes the per-route map (route id → entry id → army) of the atlas's fifteen army templates (three routes × five: `early`, `mid`, `late`, `amethyst`, `home`), each mapping field-for-field to the F2 `Army` schema — `label`, `name`, `supportName`, `units[]` (`n`, `name`, `role`, `kind`), the atlas's `elspeth` column renamed to the F2 `legendary` column (same unit-row shape), `generic` column, `context`, `notes` and `plan` as `[title, body]` pairs, `size`, `sources` — with the atlas wording verbatim (including long unit lists: "if a list is long, the list is long" — the DESIGN forbids truncation).

**Atomicity:** One outcome: "the armies dataset is fully migrated from the atlas's fifteen templates" — one dataset file, one schema, one atlas block; splitting by route-per-asset or by-army has no independent outcome (a partial route map is not a coherent migration unit) and merging it with another dataset fails the single-outcome test. ~0 counted code lines (pure JSON data); content volume ~950 lines + ~30 test lines — the largest data commit, deliberately the armies family alone so the atlas-to-schema correspondence stays one review surface.

**Out of scope:** The other datasets, route documents (the per-route `panelOrder.armies` lists — filled from the atlas's five ids in the route packages), and any `app/*.ts` change.

**Implementation packet:** `lintArmiesDataset`/`lintUnitRows`/`lintTitleBodyList` enforce the exact shapes; `legendary` and `generic` columns are always present as lists (an empty column is valid and renders an explicit absent marker — the atlas fills both columns on all fifteen). The atlas army kinds (`line`, `ranged`, `artillery`, `cavalry`, `character`) are open strings — no vocabulary rule. Army entries carry per-route content (each route's five templates are route-specific — the F2 armies schema's per-route map already isolates them). Any army-level `state`/`src` follows the DESIGN policy (e.g. an Elspeth-only mechanic the atlas hedges gets `verify-in-campaign`); most armies carry none. The atlas `elspeth` column contents move to `legendary` verbatim.

**Files and responsibilities:** `content/elspeth-von-draken/data/armies.json` — the three-route map of five armies each. `test/elspeth-skeleton.test.ts` — the empty-form loop stops asserting `armies` is `{}` and asserts the migrated contract (three routes, five entries each, loading as typed armies with `legendary`/`generic` columns and `size`).

**Tests and proof:** Observable: the committed tree loads fifteen typed armies; each route's map has exactly the five atlas ids; unit rows carry `n`/`name`/`role`/`kind`; `elspeth` appears nowhere (renamed to `legendary`); lint-clean shape, state vocabulary, and `src` resolution. Seam: loader-based skeleton test + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** An army template the F2 `Army` shape cannot carry without loss (report the forcing block for replanning — contrary to the verdict); a route id/key mismatch with `guide.json` (report).

**Review mandate:** fifteen templates, atlas ids and wording intact (spot-check role/kind/notes/plan against the atlas); `elspeth`→`legendary` rename field-for-field; `size` numeric; long lists untruncated; no invented army; no `app/*.ts` change; skeleton-test edit narrows only `armies`.

#### Package `vco-dataset` — Commit 7: Seed the per-route VCO objective items

**Status:** Integrated

**Wave:** 6

**Depends on:** []

**Write scope:** ["content/elspeth-von-draken/data/vco.json", "test/elspeth-skeleton.test.ts", "test/views.test.ts"]

**Provisional commit:** `feat(content): seed the per-route VCO objective items`

**Work:** `data/vco.json` becomes the per-route ordered objective-item map with stable ids: Route I — the atlas's five target records (`sylvania`, `deceivers`, `drycha`, `festus`, `khazrak`; items carry `id`/`text`/`state`/`src` with the `name`/`leader`/`note` atoms folded into the text) plus one additional item for the 35-battle requirement (new stable id, e.g. `battles-35`); Route II — the seven province names as items (kebab-slug ids); Route III — the twenty candidate settlement names as items (kebab-slug ids). Every item carries a confidence state and `src` per the DESIGN policy (default `confirmed` + `["vco-guide"]`; hedges get the stricter state).

**Atomicity:** One outcome: "the vco dataset carries the atlas's objective-item set with the stable ids F5 will tick" — one dataset file, one atlas block family (`targets` + `provinces` + `candidates` + the 35-battle requirement), one user-visible surface (the undercard); splitting by route row would fragment a single tick-surface contract, and merging into another dataset fails the single-outcome test. ~0 counted code lines (pure JSON data); content volume ~160 lines + ~30 test lines.

**Out of scope:** The other five datasets, route documents, the F5 ledger (no progress fields, no write path), and any `app/*.ts` change.

**Implementation packet:** `lintVcoDataset` requires every item to carry `id`, `text`, and a valid `state`; `src` is optional-when-present but the DESIGN acceptance requires it, so every item carries `src: ["vco-guide"]` (or the stricter-state source). The item `id`s are the F5 tick surface: lowercase kebab-case, unique per route, matching the atlas item text verbatim (Route I items compose their text from the target records' `name`/`leader`/`note` atoms — verbatim applies to those atoms), **never renumbered later**. Route I's five ids are the atlas's own (`sylvania`, `deceivers`, `drycha`, `festus`, `khazrak`) — the atlas's tracker used them; the 35-battle item gets a new stable id. The F1-seeded frontmatter `objective`/`reward` claims are untouched (they already state the five targets + 35 battles / seven provinces / twenty candidates in their claim text — no duplication of items into the claims). States: author-verified objective lists → `confirmed`; an item whose wording hedges live VCO behavior (e.g. a treaty test or search status) → `verify-in-campaign` per the DESIGN's stricter-state rule, recorded in Discoveries.

**Files and responsibilities:** `content/elspeth-von-draken/data/vco.json` — the three-route item map. `test/elspeth-skeleton.test.ts` — the empty-form loop stops asserting `vco` is `{}` and asserts the migrated contract (six/seven/twenty items per route with the required fields). `test/views.test.ts` — the "no VCO undercard on the committed tree" assertion flips to assert the undercard renders on every committed route with the item counts and badge anatomy (the DESIGN §7 acceptance numbers are asserted here: 5+1 / 7 / 20).

**Tests and proof:** Observable: the committed route views render the VCO undercard with the item counts (6/7/20) and each item's id/text/state badge; the loader yields typed `VcoItem[]` per route; lint-clean. Seam: zero-DOM VNode flatten over the committed tree + the loader.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** An atlas target/province/candidate text a stable id cannot represent losslessly (report the record + proposed id for a decision — the id scheme is a recorded decision); a state the policy cannot justify.

**Review mandate:** exact item counts and atlas texts; stable id scheme applied and recorded in Discoveries (never renumbered); every item has a state and `src`; the F5 tick surface is the ids F5 will import — flag any provisional id; no progress fields of any kind; `views.test.ts` update is the undercard flip only.

#### Package `research-overrides` — Commit 8: Add the four per-route research override entries

**Status:** Integrated

**Wave:** 7

**Depends on:** ["research-dataset"]

**Write scope:** ["content/elspeth-von-draken/data/research.json", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): add the four per-route research override entries`

**Work:** `data/research.json` (the four base groups, landed by `research-dataset`) gains four additional lord-wide entries — the atlas's per-route `researchOverrides` as distinct entry ids per DESIGN §4's per-route-variant rule: `route-2-opening` (atlas `routes.route2.researchOverrides.opening`, label "Opening", title "Prepare a long southern campaign"), `route-2-economy` (label "Economy", title "Support a durable southern sphere"), `route-3-opening` (atlas `routes.route3.researchOverrides.opening`, label "Opening", title "A durable survey column"), `route-3-arcane` (label "Special", title "The expedition's practical research"). Each maps field-for-field exactly as the base groups did: `label`/`title`/`intro` verbatim, `steps[]` `title`/`note`/`gate`/`short` verbatim with empty strings omitted and the atlas `checkId` key dropped (tick-tracker linkage — the same exclusion as `research-dataset`; the referenced tech atoms are already folded into the base groups), `details` pairs verbatim, `sources` verbatim. The four base-group entries stay byte-identical. `state`/`src` per the DESIGN §4 policy (route-3 `arcane`'s "Check the active technology tree"/"follow the live gate" hedges are `verify-in-campaign`; pure tech facts `confirmed`), recorded in the report.

**Atomicity:** One outcome: "the four per-route research variants exist as distinct entries so the owning routes' `panelOrder` lists can name them" — one file, one atlas block family (`researchOverrides`), one user-visible consequence (Route II/III research panels showing the variant content); splitting by route would fragment the same dataset's contract on shared test files without an independent outcome. ~0 counted code lines (pure JSON data); content volume ~230 lines + ~35 test lines.

**Out of scope:** The other datasets, all route documents (the `panelOrder.research` lists that name the new ids land in `route-2-content`/`route-3-content`), the four base-group entries, and any `app/*.ts` change.

**Implementation packet:** The F2 per-route-variant rule is fixture-proven (a distinct research id listed only in one route's `panelOrder`); the lint resolves every listed id in the lord-wide research map, so the four ids need no rendering change. The skeleton test's existing 15-tech fold assertion is scoped to the four base groups' steps — keep it exactly so (the override steps reuse the same tech atoms in a different selection; asserting them into the base set would corrupt the fold contract) and add the override assertions (four ids present, exact id set of all eight entries, typed items via the loader, sources resolution, the route-3 arcane hedge wording preserved). `checkId` stays absent from committed content.

**Files and responsibilities:** `content/elspeth-von-draken/data/research.json` — the four base entries plus the four override entries. `test/elspeth-skeleton.test.ts` — the research contract extends to eight entries with the base fold assertion untouched.

**Tests and proof:** Observable: the committed tree loads eight typed research entries; the four override ids exist with their atlas wording; the base four are unchanged. Seam: loader-based skeleton test + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** An override entry the F2 `Item` shape cannot carry without loss (report the forcing field); an override step whose tech atom is not present in the base groups (evidence of drift — report).

**Review mandate:** exactly four new entries with the ledger's ids and the atlas's wording verbatim; the four base-group entries byte-identical; `checkId` nowhere; the base 15-tech fold assertion uncorrupted; no `app/*.ts` change; skeleton-test edit extends research only.

#### Package `route-1-content` — Commit 9: Fill Route I body sections and panel order

**Status:** Integrated

**Wave:** 8

**Depends on:** ["skills-dataset", "research-dataset", "buildings-dataset", "mechanics-dataset", "armies-dataset"]

**Write scope:** ["content/elspeth-von-draken/routes/route-1.md", "test/elspeth-skeleton.test.ts", "test/views.test.ts", "test/components.test.ts"]

**Provisional commit:** `feat(content): fill Route I body sections and panel order`

**Work:** `route-1.md` keeps its frontmatter identity block verbatim (`id`, `number`, `name`, `vcoTitle: null`, motto, objective/reward claims, interpretation, bottleneck) and carries: the six content body sections per the design phase mapping — `Opening` (atlas phase `Opening`), `Early → Mid` (phase `Early`), `Mid → Late` (phases `Mid-game` + `Late`), `Victory push` (phase `Victory`), `Territory policy` (atlas `territory`), `Diplomacy` (atlas `diplomacy`) — plus the two `Transition → route-2` and `Transition → route-3` sections from the atlas `transitions` map; `gaps` keeps exactly those two transition titles and drops the six content entries; `panelOrder` fills the five canonical id lists with the atlas's Route I lists (skills 10, research 4, mechanics 5, buildings 6, armies 5). Route-level prose (`type` "Empire threat hunt", `armyIdentity`, `recommended`, `armyPriority`, `economyPriority`, `mechanicsPriority`, `avoid`, and the per-item `use` notes) weaves into the sections each block guides, one home each. VCO/patch-dependent prose becomes `::claim` callouts with states and `src`; the seven atlas evidence notes fold into the claims/items they support. The invisible frontmatter `transitions` string is dropped (decided; the sections own the prose).

**Atomicity:** One outcome: "Route I's route page renders its full migrated body, both transitions, and the resolved atlas panel content" — the body sections, the `gaps` slot declarations, and the `panelOrder` lists are one document's contract and one user-visible page (empty `panelOrder` or missing sections would leave that page incomplete, and the `panelOrder` ids must resolve — they can only land now that the datasets exist); splitting body-from-panelOrder within the same document has no coherent outcome. ~0 counted code lines (pure Markdown/YAML content); content volume ~380 lines + ~70 test lines.

**Out of scope:** Routes II and III (their own packages), the datasets (already landed), shared.md, and any `app/*.ts` change.

**Implementation packet:** Body constraints (verified in `lint.ts`): only H2 registry headings — no H3/H1 subheadings, phase titles render as bold-lead paragraphs; the four required sections each appear once in registry order; optional and transition sections any order; the body starts with `## Opening`. Every body H2 must also be a slot: required/optional titles are slots by registry, and the two transition sections must stay declared in `gaps` (the F2 `routeBody` slot mechanism — a route with emptied `gaps` silently loses them). `panelOrder.buildings` uses the `buildings` group key with Route I's six ids. The seeded frontmatter claims stay byte-identical; `::claim` callouts follow the DESIGN's `state src=` syntax with ids resolving against the committed 35 sources. Do not restate any woven block in a second home. Record each weave/home and evidence-note placement in Discoveries.

**Files and responsibilities:** `content/elspeth-von-draken/routes/route-1.md` — identity block preserved, eight sections, two transition-gap declarations, filled `panelOrder`. `test/elspeth-skeleton.test.ts` — the route contract assertions flip from "seven gaps, zero sections, empty panelOrder" to "eight sections in registry order, gaps = the two transitions, panelOrder lists resolve through the loader". `test/views.test.ts` — the committed Route I view assertions flip from gap-marker and empty-panel expectations to populated-section/panel expectations (markers absent, panels show the atlas items, both transition headings present, VCO undercard kept). `test/components.test.ts` — the "committed route files carry no callouts" assertion flips to assert Route I's migrated callouts render with badge anatomy (the fixture callout assertions stay untouched).

**Tests and proof:** Observable: the committed Route I view renders the eight sections in order with atlas wording, no CONTENT GAP marker, resolved five-panel content (skills 10, research 4, mechanics 5, buildings 6, armies 5 entries), the undercard (with `vco-dataset`), and badge anatomy for callouts and claims; `node tools/content-lint.mjs` exits 0 with every `panelOrder` id resolving. Seam: zero-DOM VNode flatten over the committed tree + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 — the resolution checks make this package the gate-sensitive one). No services.

**Stop conditions:** A section title the registry walk cannot render (report — the mechanism is fixed); an atlas block that cannot weave without duplication or loss (report the block + proposed home for a decision); a `panelOrder` id that does not resolve (evidence of dataset drift — report, do not rename ids).

**Review mandate:** frontmatter identity byte-identical; exactly eight sections; six content-gap entries removed and the two transition titles retained in `gaps` (the mechanism rationale); `panelOrder` uses the atlas's Route I lists under the canonical group keys; woven prose one-home (cross-check the atlas `use`/`type`/priority blocks appear recognizably once); callout states and `src` per policy; no H3; `transitions` frontmatter field dropped with the decision recorded; tests updated with the route.

#### Package `route-2-content` — Commit 10: Fill Route II body sections and panel order

**Status:** Integrated

**Wave:** 9

**Depends on:** ["skills-dataset", "research-dataset", "research-overrides", "buildings-dataset", "mechanics-dataset", "armies-dataset"]

**Write scope:** ["content/elspeth-von-draken/routes/route-2.md", "test/elspeth-skeleton.test.ts", "test/views.test.ts", "test/components.test.ts"]

**Provisional commit:** `feat(content): fill Route II body sections and panel order`

**Work:** The same outcome as Commit 9 applied to `route-2.md`: eight body sections from the atlas's `route2` phases/territory/diplomacy/`transitions` (to `route-1` and `route-3`), the six content gaps removed with the two transition titles retained in `gaps`, the atlas's Route II `panelOrder` lists (skills 10, research 4 as `[route-2-opening, firepower, route-2-economy, arcane]` — the two override ids in the owning route's positions, mechanics 5, buildings: `nuln, charter, resource, income, frontier, temporary`, armies 5), and the route-level prose weave (its own `type` "Territorial coalition", `armyIdentity`, priorities, `avoid`, `recommended`, and its own `use` notes — e.g. skills `elspeth` "Prioritise recovery and the rank-12 economic support…") with `::claim` callouts per policy.

**Atomicity:** One outcome: "Route II's route page renders its full migrated body and resolved panel content" — same single-document reasoning as Commit 9; independent of Commit 9 (different file, panels already resolvable), but serialized on the shared committed-content tests rather than paired. ~0 counted code lines; content volume ~360 lines + ~45 test lines.

**Out of scope:** Routes I and III, datasets, shared.md, and any `app/*.ts` change.

**Implementation packet:** Same constraints as Commit 9 (H2-only, registry order, transitions-in-gaps, one-home weave, `buildings` panel subset per Route II's list, `vco` undercard untouched — the `route-3` transition target is the atlas's own). The seeded frontmatter claims stay byte-identical; Route II's `transitions` prose split into `Transition → route-1` and `Transition → route-3` sections. The `panelOrder.research` list carries the two `route-2-*` override ids (they exist since `research-overrides`; the base `opening`/`economy` entries are Route I's and stay unlisted here). Record weave homes in Discoveries.

**Files and responsibilities:** `content/elspeth-von-draken/routes/route-2.md` — as Commit 9. `test/elspeth-skeleton.test.ts`, `test/views.test.ts` — Route II's committed-tree assertions flip to the migrated state (route-1's already flipped ones stay).

**Tests and proof:** Observable: the committed Route II view renders the eight sections, no CONTENT GAP markers, resolved panels (buildings showing Route II's six roles), undercard with seven items, badge anatomy; lint exit 0 with resolved `panelOrder`. Seam: zero-DOM VNode flatten + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** As Commit 9.

**Review mandate:** As Commit 9 for Route II; the buildings subset is Route II's atlas list; the research list carries exactly the two `route-2-*` override ids in the atlas's positions; the shared entry `use` notes differ from Route I's and each lives once in Route II's prose.

#### Package `route-3-content` — Commit 11: Fill Route III body sections and panel order

**Status:** Integrated

**Wave:** 10

**Depends on:** ["skills-dataset", "research-dataset", "research-overrides", "buildings-dataset", "mechanics-dataset", "armies-dataset"]

**Write scope:** ["content/elspeth-von-draken/routes/route-3.md", "test/elspeth-skeleton.test.ts", "test/views.test.ts", "test/components.test.ts"]

**Provisional commit:** `feat(content): fill Route III body sections and panel order`

**Work:** The same outcome as Commits 9–10 applied to `route-3.md` — the atlas's `route3` phases/territory/diplomacy/`transitions` (to `route-1` and `route-2`), `gaps` keeping the two transition titles, the atlas's Route III `panelOrder` lists (skills 10, research 4 as `[route-3-opening, firepower, economy, route-3-arcane]` — the two override ids in the owning route's positions, mechanics 5, buildings: `nuln, survey, military, income, recovery, temporary`, armies 5), the route-level prose weave (its own `type` "Arcane expedition", priorities, `avoid` — "not every candidate is a settlement to annex", `recommended`, `use` notes), `::claim` callouts per policy, and the committed-content test reconciliation that completes the migration (this package empties the last empty-dataset/no-section assertions — the skeleton test's remaining "typed empty objects" contract becomes the "fully migrated committed tree" contract with the DESIGN §7 counts asserted explicitly).

**Atomicity:** One outcome: "Route III's route page renders its full migrated body and resolved panel content, completing the migrated committed tree" — the single-document reasoning of the prior route packages plus the end-of-migration reconciliation that no committed-content test still asserts the empty skeleton (an intermediate assertion removed now would have made an earlier package non-reviewable, and keeping it here makes the final committed prefix the complete DESIGN §7 state). ~0 counted code lines; content volume ~360 lines + ~50 test lines.

**Out of scope:** Any remaining datasets (all landed), `app/*.ts` (never in scope), and any non-committed-content feature (F3/F5/F7).

**Implementation packet:** Same constraints as Commits 9–10; the `panelOrder.research` list carries the two `route-3-*` override ids (the base `opening`/`arcane` entries are Route I's and stay unlisted here); Route III's `_candidates_`-specific weave (search trigger integrity — the atlas deliberately leaves the search result unexposed) renders as `verify-in-campaign`/`inferred` policy states with `vco-guide` src; the undercard's twenty items come from `vco-dataset`. The final committed prefix must satisfy each DESIGN §7 acceptance item verifiable from the committed tree and tests (counts 15 armies / 10 skills / 4 research groups + 4 overrides / 9 building roles in per-route subsets / 5 mechanics, vco 6/7/20 items with states and src, `gaps` = transitions only, `vcoTitle` null, no gap markers, panels populated).

**Files and responsibilities:** `content/elspeth-von-draken/routes/route-3.md` — as Commits 9–10. `test/elspeth-skeleton.test.ts`, `test/views.test.ts` — Route III's committed-tree assertions flip; the skeleton test's residual `{}` loop assertions are deleted (its migration-contract assertions now fully replace them).

**Tests and proof:** Observable: the committed Route III view renders eight sections, no markers, resolved panels (buildings showing its six roles), undercard with twenty items; the full committed tree satisfies the DESIGN §7 counts; lint exit 0 with every `panelOrder` id resolving. Seam: zero-DOM VNode flatten over the committed tree + the lint CLI.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** As Commits 9–10; a DESIGN §7 count the committed tree cannot satisfy from the atlas (report — evidence of a dropped block or drift).

**Review mandate:** As Commits 9–10 for Route III; the research list carries exactly the two `route-3-*` override ids in the atlas's positions; the residual empty-skeleton assertions are gone; the DESIGN §7 acceptance counts are asserted by tests; the migration's committed-tree contract is complete and lint-clean.

## Discoveries and replanning

Record material deviations, blockers, and decisions that change remaining work. State what was planned, what changed, and why. Preserve unchanged IDs. Mark replaced packages or PRs `Removed — <reason>` and add new stable IDs; never reuse an old ID for a different outcome.

### Discovery (2026-10-03, during Commit 3 integration review): the atlas declares four per-route `researchOverrides`

- **What was planned:** the accepted plan asserted "the atlas declares no research overrides — all three routes share the same four groups", so `research-dataset` landed the four base groups only and no override entry was created (recorded at the time as a Known/Decision).
- **What changed:** the Commit 3 independent reviewer found, against the atlas `guide-data` bytes, that `routes.route2.researchOverrides` carries `opening` and `economy` and `routes.route3.researchOverrides` carries `opening` and `arcane`, and the atlas's own `lookup()` substitutes them (`g==='research'?(R().researchOverrides?.[k]||D.research[k])`) — the research panel visibly differs per route tab. The DESIGN already prescribes exactly this case (§4: "a route's `researchOverrides` entry is a distinct entry id (the F2 per-route-variant rule) and is listed only in that route's `panelOrder`"; §7 acceptance: "the research groups plus per-route overrides as distinct entries under the right `panelOrder`"), and the per-route-variant rule is fixture-proven — so the correction stays inside the unchanged DESIGN requirements and feature scope (bounded in-scope replan, no developer decision required).
- **Plan change:** new package `research-overrides` (Commit 8, wave 7) adds the four override entries under the distinct ids `route-2-opening`, `route-2-economy`, `route-3-opening`, `route-3-arcane`; `route-2-content`/`route-3-content` (renumbered Commits 10/11, waves 9/10) depend on it and fill their `panelOrder.research` lists with the override ids in the atlas's positions; `route-1-content` is Commit 9, wave 8 (its `panelOrder.research` stays the four base ids). The integrated `research-dataset` commit (four base groups) remains correct and untouched; the seeded inventory gains a `researchOverrides` row. No requirement, outcome, trust boundary, public contract, or feature-scope change.

### Correction (2026-10-03, during Commit 10 execution): the route-2/route-3 write scopes omit `test/components.test.ts`

The route-1 worker flipped the committed-tree assertion "the rest of the committed content stays callout-free" to filter `r.id !== "route-1"` and assert the remaining routes are still skeleton (`sections.length === 0`). Migrating Route II's sections necessarily breaks that loop — but the route-2 packet's write scope named only the two other test files, so the flip had no home. Bounded correction: `test/components.test.ts` is added to the `route-2-content` and `route-3-content` write scopes (the route-1 precedent packet already lists it). No outcome, ordering, dependency, or design change — only the test-flip seam follows the mandated content, keeping every integrated prefix green at its gate. Route-3 owns the final residual removal (after it, no committed route is callout-free/skeleton).

### Discovery (2026-10-03, during Commit 6 execution): the atlas armies maps key routes `route1/2/3`; the committed model keys them `route-1/-2/-3`

The atlas keys its per-route armies maps `route1`/`route2`/`route3`, but the committed model resolves `armies[route.id]` with the guide.json route ids `route-1/-2/-3` (`app/content/query.ts`, `app/content/lint.ts` `panels.armies[ref.id]`, the committed fixture). The migration therefore uses the canonical committed route ids for the armies map keys — the same rename class as `builds`→`buildings`; the atlas entry ids (`early`…`home`) and all army content are unchanged. Not a plan change: the ledger's armies packet already requires the per-route map keyed by the committed route ids (its stop condition names a "route id/key mismatch with `guide.json`").

The DESIGN acceptance criterion 1 requires the atlas→model content inventory and mapping table in this ledger. Seeded at planning from the raw archive (extracted read-only from the embedded `guide-data` JSON island); workers append per-entry placement records (weave homes, folded-item homes, per-item states, vco id assignments) during execution. Any atlas block absent from this table or from an exclusion is a violation of the migration contract.

### Seeded atlas → model inventory (acceptance criterion 1)

Every top-level atlas block, its count, and its committed target or explicit exclusion. Route-entry granularity and per-item mapping are carried by the owning packages' Files-and-responsibilities and by execution Discoveries.

| Atlas block (in `guide-data`) | Count | Committed target | Kind |
| --- | --- | --- | --- |
| `routes.route1` | 1 | `routes/route-1.md` (package `route-1-content`) | migrate |
| `routes.route2` | 1 | `routes/route-2.md` (package `route-2-content`) | migrate |
| `routes.route3` | 1 | `routes/route-3.md` (package `route-3-content`) | migrate |
|  · `number` / `name` / `label` / `motto` | 4/route | frontmatter `number` / `name` / `motto` (already seeded verbatim; `label` is a duplicate of `name`) | verify & preserve |
|  · `objective` / `reward` | 1/route | frontmatter `objective` / `reward` claims (already seeded verbatim, `verify-in-campaign`) | verify & preserve |
|  · `summary` | 1/route | frontmatter `interpretation` (already seeded verbatim) | verify & preserve |
|  · `bottleneck` | 1/route | frontmatter `bottleneck` (already seeded verbatim) | verify & preserve |
|  · `type` / `armyIdentity` / `recommended` / `armyPriority` / `economyPriority` / `mechanicsPriority` / `avoid` | 1/route each | woven into the registry section body each guides (one home per block) | weave |
|  · `phases` (5/route: Opening, Early, Mid-game, Late, Victory) | 5/route | `Opening` / `Early → Mid` / `Mid → Late` (Mid-game + Late) / `Victory push` sections; per-phase `aim`/`actions`/`checkpoint` as section prose; no H3 headings (lint) | migrate |
|  · `territory` | 1/route | `Territory policy` section | migrate |
|  · `diplomacy` | 1/route | `Diplomacy` section | migrate |
|  · `transitions` (map to 2 other routes/route) | 2/route | `Transition → route-<x>` section per map entry (rendered because the title stays declared in `gaps`) | migrate |
|  · `armies` (5/route: early, mid, late, amethyst, home) | 15 | `data/armies.json` per-route maps (package `armies-dataset`; `elspeth` column → `legendary`) | migrate |
|  · `panelOrder` | 1/route | frontmatter `panelOrder` (group `builds` → `buildings`; committed lists are empty — Commits 9–11 fill them from the atlas route panel lists) | migrate |
|  · `defaults` | 1/route | — | **excluded**: browser-local initial view preference (F5-class); equals `panelOrder`-first entry on every route; no F2 rendering surface |
|  · `use` (skill/build/mechanic notes) | 3 maps/route | woven into the owning route's section prose (route-specific text; never into the lord-wide entries) | weave |
|  · `sources` | 2/route | references only; the committed `data/sources.json` already covers them | preserve |
| `skills` | 10 | `data/skills.json` (package `skills-dataset`; ids are the atlas's own, as named by the atlas route panel lists) | migrate |
| `research` | 4 | `data/research.json` (package `research-dataset`) | migrate |
| `researchOverrides` (route2: `opening`, `economy`; route3: `opening`, `arcane`) | 4 | `data/research.json` as distinct entries `route-2-opening`, `route-2-economy`, `route-3-opening`, `route-3-arcane`, listed only in the owning route's `panelOrder.research` (package `research-overrides`) | migrate |
| `techs` | 15 | folded into research steps as title/note/gate (content present; short-ids are tick keys) | fold |
| `legacyResearch` | 15 | reverse index of the same techs (name → short-id) | **excluded**: index linkage of the same interactive tick surface; content already present in research steps |
| `builds` | 9 | `data/buildings.json` (package `buildings-dataset`; group rename `builds`→`buildings` already canonical) | migrate |
| `mechanics` | 5 | `data/mechanics.json` (package `mechanics-dataset`) | migrate |
| `shared` (opening, smart, budget, equipment) | 4 | `shared.md` H2 sections (package `shared-content`) | migrate |
| `targets` | 5 | `data/vco.json` route-1 items (+ 1 new 35-battle item) (package `vco-dataset`) | migrate |
| `provinces` | 7 | `data/vco.json` route-2 items | migrate |
| `candidates` | 20 | `data/vco.json` route-3 items | migrate |
| `fieldtests` | 4 | folded into `mechanics.testing` gated steps | fold |
| `upgrades` | 8 | folded into `mechanics.armoury` steps/details | fold |
| `amethystPaths` | 4 | folded into `mechanics.armoury` details or referencing army notes | fold |
| `evidence` | 7 | folded into the claims/items they support with their `src` ids | fold |
| `sources` | 35 | `data/sources.json` — already committed, ids match the atlas one-for-one | preserve (no change) |
| `date` / `version` | 1 | `guide.json` version block — already committed (`2026.09.30.1` / checked `2026-09-30`) | preserve (no change) |
| localStorage state (page notes, checklist ticks, view prefs) | n/a | — | **excluded**: browser-local interactive state (F5-class), per the DESIGN's sole accepted exclusion |

Route `panelOrder` id lists (the atlas's route panel lists, verified from the raw archive — the committed route `panelOrder` blocks are empty and Commits 9–11 fill them from these lists): skills all routes `[elspeth, master, engineer, theodore, priest, captain, death, light, life, hunter]`; research Route I `[opening, firepower, economy, arcane]`, Route II `[route-2-opening, firepower, route-2-economy, arcane]`, Route III `[route-3-opening, firepower, economy, route-3-arcane]` (the atlas applies its `researchOverrides` through `lookup()`; the committed model lists the override ids in the owning route's positions per DESIGN §4); mechanics all routes `[testing, armoury, gardens, theodore, authority]`; armies all routes `[early, mid, late, amethyst, home]`; buildings Route I `[nuln, military, income, recovery, frontier, temporary]`, Route II `[nuln, charter, resource, income, frontier, temporary]`, Route III `[nuln, survey, military, income, recovery, temporary]`.

## Final validation

Exact gates, in order, before final feature review:

1. `npm test` — the full `node --test` suite green: the committed-content contract tests (`test/elspeth-skeleton.test.ts` asserting the migrated tree — entry counts, `panelOrder` resolution, eight sections per route, gaps = the two transitions, vco 6/7/20), the route-view tests (`test/views.test.ts` — populated panels, no CONTENT GAP markers, both transition headings per route, undercards, identity card unchanged with the unresearched marker), the callout/badge tests (`test/components.test.ts` — migrated callouts render badge anatomy), and every unchanged F1/F2 suite (fixture-tree and CLI seams stay valid).
2. `npx tsc --noEmit` — clean over `app/`, `tools/`, `test/`.
3. `node tools/content-lint.mjs` — exit 0 on the committed `content/` (every `panelOrder` id resolves; every `src` id resolves; every dataset matches its schema; four required sections per route in order; no H3; callout states valid).
4. `npm run build` — static `dist/` produced; `package.json` diff empty (no new dependencies); the `app/` and `tools/` trees show no diff (content-only verdict — any diff is evidence of an unapproved code change).
5. Manual HTTP boot (`npm run serve`; headless Chromium or a real browser against the local server): home → Elspeth lord page shows the intro plus the four shared H2 blocks; each route tab renders the identity card (with the explicit unresearched marker, never an invented title), the eight registry sections in order with the atlas's content — no CONTENT GAP marker where content landed — the VCO undercard with 6/7/20 badged items, and five populated panels (15 armies with unit rows, roles, kinds, legendary vs generic columns, notes, plans; 10 skills; 4 research entries per route (the base groups on Route I, the owning overrides on Routes II/III); the route's 6 settlement roles; 5 mechanics with the gated field-test steps), each item with its source links; badge labels + icons remain distinguishable; a deliberately corrupted `content/` file still boots into the F1 boot-error state naming file and field.
6. The DESIGN §7 acceptance criteria checked item by item: every atlas block present or excluded with the accepted reason (inventory above + execution Discoveries); `.work/references/` byte-for-byte unchanged (the archive remains gitignored and untouched; `git status` shows no path outside the committed `content/` + this feature's planning documents); all three route bodies carry the eight sections with `gaps` = transitions only; `vcoTitle` null ×3; panel counts 15/10/4 (four base research groups plus four per-route overrides as distinct entries under the owning route's `panelOrder`)/9-in-subsets/5; `data/vco.json` 5+1/7/20 with states and `src`; every VCO/patch-dependent claim carries one of the four states per the DESIGN policy; the seven evidence notes folded with their `src` ids; no fabricated trigger or completion claim; `shared.md` carries the intro + four blocks; `package.json` unchanged; no rendering component or schema file modified.

Report any skipped or unsupported validation step as a gap, never as a pass.

## Documentation impact

Reconciled during this pre-merge close-out; no design or code change was needed:
- `.wiki/TODO.md` — updated the Active item to implementation complete, review cleared, and awaiting local ff-only integration; it remains Active pending verified final publication.
- `.wiki/ARCHITECTURE.md` — updated implemented-layer status and the committed-content description; placeholder sections remain noted.
- The accepted ELSPETH-MIGRATION-DESIGN.md and this ledger remain in place. The existing discoveries record the `gaps` transition-slot declarations and dropped frontmatter `transitions` field.

## Close-out

Feature review: Accept, no blocking findings. One advisory MEDIUM is retained: the Helstorm middle-tier test assertion substring collision in `test/elspeth-skeleton.test.ts`; content is verified complete, and the advisory is retained for a delegated close-out bundle.

Final validation: all six ledger gates are green, including the headless-Chromium HTTP boot walk and deliberate-corruption boot-error check. The verdict is content-only; no implementation code changed.

Documentation reconciliation: `.wiki/TODO.md` and `.wiki/ARCHITECTURE.md` were reconciled as recorded above. No other approved documentation owner required a change.

Integration: the developer approved the exact source/base pair (source `cafe6a66`, base `main` @ `07f39e43`); `git merge --ff-only` to `main` on 2026-10-03 (merge ref `cafe6a66ceda2ceb06f41328982b30b9bd8c89f2`), re-verified green on `main` (85/85 tests, tsc clean, content-lint exit 0, build exit 0, worktree clean, atlas byte-for-byte untouched) and pushed to `origin/main`. Feature is `Completed`; the `Completed` status reconciliation and the retained advisory MEDIUM (Helstorm test assertion) are the follow-up items recorded in the post-merge documentation update.
