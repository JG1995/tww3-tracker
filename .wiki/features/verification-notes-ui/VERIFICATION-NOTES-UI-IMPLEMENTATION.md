# Verification Notes UI (F3 — Research & verification notes)

**Design:** [Verification Notes UI design](VERIFICATION-NOTES-UI-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Make each guide's research trail first-class UI: a per-guide Version Banner (verified patch + VCO version and the open `verify-in-campaign` flag count), a flagged-items review list of every `verify-in-campaign` claim on the lord page, and Source / Verification Note panels under route body sections that cite sources — so a game patch becomes a review pass over a short re-check list instead of a rewrite from memory (PRD F3, PRD Flow 3). Read-only rendering over the immutable `ContentTree`; the only model-visible change is that route body callout claims carry their section's identity.

## User-visible behavior

- The lord page renders the Version Banner under the header: the fixed "VERIFIED AGAINST" eyebrow, `patch <X> · VCO <version>` from the guide's `version` fields (DESIGN.md Value & Number Formatting — always both together), and the open-flags chip — `N OPEN FLAGS` in the warning role when the guide has flags (an anchor to the flagged section of the same page), or the non-link `ALL CLEARED` chip in the success role at zero. The banner replaces the lord page header's plain version line; home cards keep their plain version line.
- The lord page ends with the flagged-items section (reached by the banner chip's in-page scroll): every `verify-in-campaign` claim in the guide — route objective/reward identity claims, route body `::claim` callouts (each named and linked to its section), dashboard dataset items carrying the state, and VCO objective items — grouped by location, each entry showing claim text, the Confidence Badge, a location label, the notes of its resolved sources, and a link to the location where the existing hash-router grammar reaches it (callouts to their section anchor; identity and VCO items to the route page; dashboard items carry no link because no grammar target exists). The three other states never appear.
- A route body section whose claims cite one or more sources renders a Source / Verification Note panel after its prose (SOURCE eyebrow + each distinct source's title, URL, and note); a section citing nothing renders no panel.
- Everything else is unchanged: home cards, route page anatomy, the route tab strip, and F2's badge source links (external URLs) are all retained; the banner count and the flagged list are computed from the same single selector over the frozen tree — one definition, one number.
- Detailed behavior, rules, edge cases, and acceptance criteria: the accepted DESIGN (Open Questions: None), which the ledger links and does not restate as a competing specification.

## Invariants

- Content under `content/` is the single source of truth; the site never writes to it (ADR-0002) and no committed content file changes in this feature (fixtures and temp copies in `test/` are test-owned).
- Boot performs exactly one parallel fetch pass and builds the immutable `ContentTree`; all F3 rendering is synchronous in-memory reads over that tree — no per-view fetching, no new loading states, no localStorage, no store.
- No new hash routes: the router grammar (home / lord / route / route + section anchor) is unchanged; the banner chip scrolls to the flagged section without a hash change (the grammar cannot address a lord-page section anchor and the DESIGN forbids a new route shape), using the existing skip-link-style click idiom in `app/main.tsx`.
- The flagged set has exactly one definition: the pure selector's output over the tree. The banner chip count and the flagged list both derive from it, so they cannot disagree. At zero flags the chip renders the non-link cleared state and the flagged section renders an explicit cleared message — never blank space.
- No badge or confidence-state changes: the four states, labels, icons, and badge anatomy are F2's accepted contract and render identically here (colour is never the sole indicator).
- Views stay presentational `.ts` modules built with Preact's `h()` (no `.tsx` under node:test); side effects live only in `app/content/load.ts`; `package.json` and the ADR-0001-pinned dependency set stay unchanged.
- Route body callouts carry section attribution in the tree (`Route.claims` gains `sectionId`/`sectionTitle` per callout); the lint rule set is unchanged — the loader's line join relies on the existing lint guarantee that a route body starts with a section heading.

## Non-goals

- No editing of confidence states, source notes, or version fields from the UI; no write path or persistence of any kind (F5 owns the write path).
- No badge or confidence-state changes; no new hash routes; no cross-guide flag aggregation (F6); no all-sources directory page.
- No dashboard or identity-badge change: those badge source links stay exactly as F2 rendered them; this feature adds source *notes* to flagged entries and section panels, not new link mechanics.
- No new project dependencies; no `.tsx` views; content files keep their shape except the callout-location attribution noted above.
- No second faction, no ledger surfaces, no search.

## Current-state map

- Relevant components: `app/content/types.ts` (`RouteCallout` is `{ state, src, text }` — flat, locationless; the DESIGN supersedes this form for callouts), `app/content/lint.ts` (`extractSections` yields `RawSection { title, level, headingLine, body }`; `extractClaimMarkers` yields `ClaimMarker { state, src, line, text, terminated }`; `assertRouteDocument` enforces that a route body starts with a section heading — line 1165 — so every callout opening line falls inside exactly one section; `REQUIRED_SECTIONS`/`OPTIONAL_SECTIONS` registry constants), `app/content/load.ts` (`buildRoute` builds `Section { id: slugify(title), title, html }` and the flat `claims` array; `slugify` is module-local), `app/content/query.ts` (pure reads incl. `getPanelEntries` with its resolution scopes — armies ids resolve in the route's own `armies[route.id]` map, flat item ids in the lord-wide dataset map; `resolveSources(lord, ids)` returns `Source[]` with `note`; `getVcoObjectives`), `app/views/lord.ts` (TabStrip + header with the plain `version-context` paragraph that the banner replaces + shared fundamentals + route list), `app/views/route.ts` (`routeBody` registry walk; `slotAt` renders each present section or gap marker), `app/badges.ts` + `app/components/ConfidenceBadge.ts` (F2 badge contract), `app/styles/app.css` (token-only; `.lord-page .version-context` exists at line ~512; `.claim-block`/`.vco-undercard` styles exist), `app/main.tsx` (sole JSX entry; the skip-link click idiom and the section-anchor scroll effect are the in-page navigation precedents).
- Data model: the committed `content/elspeth-von-draken/` carries `guide.json` `version { patch: "9.0", vco: "2026.09.30.1", checked }`, 35 `data/sources.json` entries (id/title/url/note), 33 VCO items (6 + 7 + 20 per route; 3 `verify-in-campaign`), 22 panelOrder-listed dataset items with `state: verify-in-campaign` (verified: every state-bearing item is listed in at least one route's `panelOrder`), six frontmatter objective/reward identity claims (all six `verify-in-campaign`), and seven `::claim` callouts (route-1: inferred in Opening, confirmed in Victory push; route-2: three verify flags in Mid → Late / Victory push / Diplomacy; route-3: two verify flags in Mid → Late / Diplomacy). **The committed flagged set is exactly 36 entries** (6 identity + 5 callouts + 22 dataset + 3 VCO). No `app/` module reads `Route.claims` today (grep-verified) — the additive attribution fields have no consumer to break.
- Test fixtures: `test/fixtures/content/als-rhyn-of-lorek/` (one route `dark-conduits`, four sections, one `::claim confirmed src=vco-guide,ca` callout in "Early → Mid", populated datasets with `inferred`/`confirmed`/`historical` states only — **zero verify flags**, usable as the cleared-state proof) and `test/fixtures/content/second-lord/` (one route with a single `verify-in-campaign` reward identity claim — **exactly one flag**). Tests: `test/content-model.test.ts` (loader/lint/query contract over fixtures; asserts `route.claims.length === 1` and the callout's state/src/text at lines ~120-123; frozen claims at ~412), `test/elspeth-skeleton.test.ts` (committed tree through the real loader), `test/views.test.ts` (view VNode flatten over committed and fixture trees; the lord-page version-line assertion at ~287), `test/components.test.ts` (badge + callout HTML anatomy, no F3 surface yet).
- Persistence and migrations: none at runtime; the callout-attribution change is a content-contract change expressed in committed code (types + loader). No migrations.
- Existing behavioral assumptions: boot-once immutable tree with `deepFreeze`; post-boot reads are synchronous; the lint is the single rule set for boot and CLI; the hash router restores the exact page/section on reload; `resolveSources` drops dangling ids (pure) and the lint keeps dangling ids from reaching boot; the section-anchor scroll in `main.tsx` targets `document.getElementById(sectionId)`.
- Architectural seams: `query.ts` is the pure read surface views may extend — F3's flagged selector and per-section source reads land here; `route.ts`'s `routeBody`/`slotAt` is where per-section Source panels mount; `lord.ts` owns the banner + flagged section regions; `app/styles/app.css` remains the single token-only stylesheet (shared by every rendering package — waves serialize on it, the accepted F2/F4 pattern).
- Project validation commands: `npm test` (node:test), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 clean on committed `content/`), `npm run build`, `npm run serve` (HTTP boot; see the F2 ledger's final-validation wording for the manual step).
- Primary risks: `app.css` and `test/views.test.ts` are shared by the two rendering packages (source panels, lord surface) — waves serialize on them (accepted precedent, not a defect); the lord-page chip's scroll/focus behavior is only partially provable in the zero-DOM seam and needs the manual HTTP boot; `route.claims` shape gains two required fields — every loader consumer and the content-model claims assertions must land in the same commit as the shape change; the defined commit count (36) depends on the "panelOrder-listed items only" reading of the DESIGN's dataset-flag rule (recorded in Decisions).

## Feature architecture

- **Callout location contract:** `RouteCallout` (in `app/content/types.ts`) gains `sectionId` (the existing `slugify(title)` anchor — identical to `Section.id`, so the router's section hash and the flag's location link agree) and `sectionTitle`; `app/content/load.ts` `buildRoute` computes each callout's enclosing section by joining the existing `extractSections` + `extractClaimMarkers` scans by 1-based line (a callout's opening `line` belongs to the section whose `headingLine` is the largest heading line ≤ it; the lint's "body starts with a section heading" rule makes every callout enclosed). `lint.ts` is untouched: no rule change, no new violations.
- **Flagged set (single definition):** `app/content/query.ts` gains the pure `getFlaggedEntries(lord)` selector returning the complete flagged list — identity claims (objective/reward), callouts (`route.claims` with `verify-in-campaign`), dataset items (same `panelOrder`-resolution scopes as `getPanelEntries`; flat item entries deduplicated by id across the routes that list them per the DESIGN's shared-panel boundary; armies per `(route, entry)` since army entries are route-specific maps), and VCO items (`getVcoObjectives`) — each entry carrying text, state, resolved sources (via `resolveSources`, notes included), and the navigation structure (route id; section id/title for callouts; panel group for dataset items; vco item id). The banner chip and the flagged list consume the same output, so the count and the list cannot diverge.
- **Flagged-items section (lord page):** `app/views/lord.ts` renders the flagged section at the end of the page (`id="flagged-items"`) from `getFlaggedEntries(lord)` — entries grouped by location in the selector's stable order, with the explicit cleared state when the set is empty (Commit 4).
- **Version Banner (lord page):** `app/views/lord.ts` replaces the header's plain version line with the Version Banner — the fixed "VERIFIED AGAINST" eyebrow, `patch <X> · VCO <version>`, and the open-flags chip (`N OPEN FLAGS` warning anchor, or the non-link `ALL CLEARED` success chip at zero) — the chip a same-hash anchor whose click handler scrolls to (and focuses) the flagged section without changing the hash; the skip-link idiom in `main.tsx`, not a new route shape (Commit 5).
- **Source panels (route pages):** `app/views/route.ts` `slotAt` renders a Source / Verification Note panel after a present section's prose when the section's callout claims resolve ≥ 1 distinct source (DESIGN.md component anatomy: SOURCE eyebrow, `body-sm` notes, `surface-container-lowest` floor, 3px `info` left-border accent); sections citing nothing render no panel.
- **Boundaries:** views compute nothing beyond pure `query.ts` reads; components (ConfidenceBadge, TabStrip, dashboard) are untouched; no new components are introduced for F3's page regions — the banner, flagged section, and source panel are view-level regions following how F2 keeps the identity card and VCO undercard in `route.ts` (Architecture §1.1's dumb-panel list is a target sketch, not a per-region mandate).

## Uncertainty register

### Known

- The router grammar cannot address a lord-page section anchor (`parseHash` accepts only home / lord / route / route+section), and the DESIGN explicitly forbids a new hash route — so the banner chip must not change the hash; the same-hash anchor + scroll/focus click idiom is the only consistent mechanic.
- The banner replaces the lord page header's plain `version-context` line (DESIGN §6); home cards keep theirs (`home.ts` untouched).
- The committed Elspeth flagged set is exactly 36 entries (6 identity + 5 callouts + 22 panelOrder-listed dataset items + 3 VCO) — the DESIGN's "populated list" acceptance anchor.
- `Route.claims` has no production consumer today; only `test/content-model.test.ts` asserts its shape (one fixture callout, state/src/text, frozen).
- Section attribution is computable without a lint change because the lint already requires route bodies to start with a section heading and accepts only H2 section headings — every callout opening line falls inside exactly one section.
- The fixture lord `als-rhyn-of-lorek` carries zero `verify-in-campaign` claims (populated datasets use inferred/confirmed/historical) — the cleared-state proof; `second-lord` carries exactly one (a reward identity claim) — the one-flag proof.

### Assumptions

- Dataset flags are the **panelOrder-listed** items only: an item not listed in any route's `panelOrder` renders nowhere in the app, so it has no location and never surfaces as a flag (verified: no committed state-bearing item is unlisted; recorded as a decision, not a lint rule).
- A flat item shared by several routes' `panelOrder` appears **once** in the flagged list, located by its panel, per the DESIGN's boundary case ("the item carries one state and appears once in the list"); armies flags are per `(route, entry)` because the armies dataset is a per-route map whose same id holds different content per route.
- Flag display text: identity and VCO claims use their claim text verbatim; callouts use the callout's inner text; dataset items use their most identifiable text (item `title`, or army `name`/`label`) — the exact per-item text choice is display copy, not contractual (DESIGN §6).
- Flag group order in the list is presentation; the plan pins a stable order (routes in manifest order; within a route: identity, then callouts in body/section order, then dataset items in `PANEL_GROUPS` order, then VCO items in list order) so entries are assertable without re-sorting in the view.
- VCO flag location links point at the route page (`#/<lord>/route/<routeId>`): the grammar reaches the route page, and the VCO undercard has no dedicated anchor — matching the DESIGN's "link where the existing router reaches it".

### Decisions

- **Minimal callout-location shape:** `RouteCallout` gains exactly `sectionId` (the existing slugified anchor, identical to `Section.id`) and `sectionTitle`, computed in `buildRoute` by a line join of the existing section and callout scans. No new lint rule, no section-owned claims array, no removal of the flat `Route.claims` list. The DESIGN owns the behavior (each flag can name and link its place); this is the smallest type shape that delivers it.
- **One definition, one number:** the flagged set exists once as `getFlaggedEntries(lord)` in `query.ts`; the banner chip count and the flagged list both read it. The count is never recomputed by hand.
- **Single PR, Local ff-only boundary** (provider `Local`, `PR ref: Not applicable`, `PR template: Not applicable`, `Merge method: ff-only`, base `main`): mirrors the accepted F1/F2/F4 publication convention exactly, and the delivery classifier requires a PR template for the GitHub automated path, which this repository does not have (no `.github/`). Required checks are the real local gate (no CI exists). No intermediate seam justifies a second merge boundary.
- **Callout section attribution precedes its consumers:** the model change lands alone (Commit 1), then the flagged selector (Commit 2) and the source panels (Commit 3) consume it, then the lord-page flagged list (Commit 4) and the version banner (Commit 5). Each committed prefix stays green.
- **Flagged list and version banner are two packages (Commits 4-5), list first:** plan review established that the dead-anchor coupling rules out a banner-first split only — the flagged section is a complete, reviewable, trunk-safe outcome without the banner (its count and entries render green while the header version line stays as today), and the banner then anchors to an *existing* section and reads the *same* single selector. The list lands as Commit 4 (Wave 3) with its grouped-entry and cleared-state proofs; the banner lands as Commit 5 (Wave 4) with its chip/version proofs — each under the 200-line target with its own coupled outcome.
- **Page regions stay in views** (no new components): the banner, flagged section, and source panel are single-page regions; F2's precedent keeps such regions inline in views (identity card, VCO undercard in `route.ts`). New components would add files without a second consumer.
- **Fixture/temp-copy proofs stay out of `content/`:** the cleared/one-flag states are proven over the existing fixture lords; in-section source dedupe is proven on a temp copy of committed content (the established views-test temp-copy convention), so no fixture or committed content change is needed.

### Unknowns

- None gating the plan. Exact copy for the flagged-section eyebrow, group headings, location labels, and cleared-state sentence is not contractual beyond the DESIGN-fixed labels (VERIFIED AGAINST, `N OPEN FLAGS`, `ALL CLEARED`, SOURCE); the implementing packages choose it within the DESIGN's meanings.
- The manual HTTP boot is the completing proof for the chip's scroll/focus and the section-anchor landing; the zero-DOM seam proves the markup contracts.

### Risks

- `app.css` and `test/views.test.ts` are shared by Commits 3-5: the source panels, the flagged list, and the version banner sit in distinct waves that serialize on the shared files (mirrors F2/F4's accepted serialization); same-wave packages never share a file.
- `Route.claims` gains two required fields: any loader consumer or assertion not updated in Commit 1 fails the type gate — the commit is scoped so `buildRoute`, the types, and the content-model assertions land together.
- The defined count (36) rests on the panelOrder-listed-only reading of the DESIGN's dataset rule; if review prefers to flag *every* state-bearing item regardless of listing, the count is still single-sourced (one selector) and the committed content has no unlisted state-bearing item, so neither reading changes the committed number — only the selector's rule comment and edge proof.
- The chip's scroll/focus behavior is DOM-only; the plan names the manual HTTP boot as the completing proof rather than adding a DOM test dependency (F2's precedent).
- `main.tsx`'s scroll effect and the skip-link idiom are the only in-page-navigation precedents; the chip must not accidentally trigger the router's not-found view (a `#flagged` style hash would) — the same-hash anchor + preventDefault contract is stated in the packet.

## Walking skeleton

Commit 1 (callout section attribution) → Commit 2 (flagged selector) → Commit 3 (source panels): after Commit 3 the tree names every flag's place, `getFlaggedEntries` returns the complete set, and route pages already show the research trail under citing sections — the data and one rendering surface of the DESIGN land on trunk green. Commit 4 renders the flagged-items list on the lord page (the review surface's data, cleared state included); Commit 5 completes the Version Banner + open-flags chip anchored to it — the DESIGN's Journey A end to end. The thinnest complete path through the feature is all five commits on one branch.

## Delivery plan

**Commit packages:** 5

### PR `verification-notes-ui` — Render the verification notes UI

**Status:** Planned

**Depends on:** []

**PR ref:** Not applicable

**Merge ref:** Not merged

**Branch:** `feat/verification-notes-ui`

**Base branch:** `main`

**Publication provider:** Local

**PR template:** Not applicable

**Merge method:** ff-only

**Required checks:** `npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds

**Feature close-out:** Not run

**Provisional PR title:** `feat(app): render the verification notes UI`

**Purpose:** F3 is additive, read-only rendering of one accepted contract — callout section attribution, the single flagged-set selector, per-section Source panels, and the lord-page Version Banner + flagged-items surface. One Local ff-only boundary mirrors the accepted F1/F2/F4 convention: `main` stays green at every commit (the attribution model change lands before its consumers; `package.json` never changes), the five ordered atomic commits stay individually reviewable, and no intermediate seam justifies a second merge boundary.

#### Package `callout-section-attribution` — Commit 1: Attribute route callouts to their sections

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** ["app/content/types.ts", "app/content/load.ts", "test/content-model.test.ts"]

**Provisional commit:** `feat(content): attribute route callouts to their sections`

**Work:** Extend `RouteCallout` (in `app/content/types.ts`) with two readonly fields: `sectionId: string` — the existing slugified section anchor, byte-identical to the `Section.id` `buildRoute` already computes — and `sectionTitle: string` (the H2 title). In `app/content/load.ts` `buildRoute`, join the existing `extractSections` and `extractClaimMarkers` scans by 1-based line: a callout's opening `line` belongs to the section whose `headingLine` is the greatest heading line ≤ it (the lint's "route body content must start with a section heading" rule — `lint.ts` line 1165 — guarantees every callout is enclosed by exactly one section; only H2 headings are legal, so headings do not nest). No `lint.ts` rule change, no section-HTML change, no change to the flat `Route.claims` list shape beyond the two new fields. The join consumes the section scan's raw titles; `slugify` stays module-local in `load.ts` and is reused for `sectionId` so the flag link and the route page's H2 anchor resolve to the same id.

**Atomicity:** One outcome: "every route body callout in the tree carries the identity of the section that encloses it, proven through the loader" — the type fields, the line-join computation, and the loader-based assertions that pin them are one coupled contract (a types-only change has no observable proof; a loader-only change breaks the type gate). ~35 counted lines. No further valid split exists.

**Out of scope:** The flagged selector (Commit 2), the source panels (Commit 3), any rendering, any lint rule change, and any content change (committed or fixture).

**Implementation packet:** In `buildRoute`, after `extractClaimMarkers(scan.body)`, map each marker to its section: walk the `sectionScan.sections` list (each `RawSection` carries `headingLine`), assign the callout to the section with the greatest `headingLine ≤ m.line`; a marker line before the first heading is unreachable by the lint's contract — if it ever occurs, report it as a stop condition rather than inventing a "before" section. Use `slugify(section.title)` for `sectionId` (the same call `Section.id` uses) and `section.title` for `sectionTitle`. `Route.claims` stays a flat array — the DESIGN's supersession note concerns the location-less *form*, not the list itself; identity, dataset, and VCO claim kinds are untouched. The loader's section HTML (`md.render` of each section body) is unchanged, so `test/components.test.ts`'s callout-HTML anatomy assertions (line ~288 and on) keep passing untouched.

**Files and responsibilities:** `app/content/types.ts` — `RouteCallout` gains `sectionId` and `sectionTitle` (documented as the router-anchor id and the registry H2 title). `app/content/load.ts` — `buildRoute` computes the enclosing section per callout and sets the two fields. `test/content-model.test.ts` — the claims block (lines ~120-123) gains `assert.equal(route.claims[0].sectionId, "early-mid")` and `assert.equal(route.claims[0].sectionTitle, "Early → Mid")` (the fixture callout lives in the "Early → Mid" section); the state/src/text and frozen assertions stay verbatim.

**Tests and proof:** Observable: the fixture route loads with the single callout attributed to `early-mid` / "Early → Mid" (state, src, text unchanged); the committed tree loads with every callout attributed (a loader-based spot check over the committed tree may live here or in Commit 2's suite — Commit 2's count proof covers it). Seam: loader-based tree assertions in `test/content-model.test.ts`; no view or DOM.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 on committed `content/`). No services.

**Stop conditions:** A callout line that maps to no section (the lint contract says it is unreachable — report and replan rather than introducing a fallback location); a section id collision between `slugify` outputs that would break the router anchor join (report); any lint-rule or section-HTML change forced by the join (report — the join must be pure and additive).

**Review mandate:** exactly two new fields on `RouteCallout`, both populated for every fixture/committed callout; `sectionId` equals the existing `Section.id` for the same title (spot-check one committed section); `lint.ts` and `load.ts`'s markdown/HTML rendering are byte-unchanged; no new rules, no new violation vocabulary; only the claims block of `test/content-model.test.ts` changes; no `.tsx`, no `package.json` change.

#### Package `flagged-query` — Commit 2: The single flagged-set selector

**Status:** Integrated

**Wave:** 2

**Depends on:** ["callout-section-attribution"]

**Write scope:** ["app/content/query.ts", "test/content-model.test.ts", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): add the verify-in-campaign flagged set query`

**Work:** Add to `app/content/query.ts` the exported discriminated-union type `FlaggedEntry` and the pure `getFlaggedEntries(lord): readonly FlaggedEntry[]` selector — the ONE definition of the guide's flagged set. Members: `identity` (each route's `objective` and `reward` claims with state `verify-in-campaign`; carries routeId and the claim kind), `callout` (`route.claims` with state `verify-in-campaign`; carries routeId, sectionId, sectionTitle — the Commit 1 fields), `dataset` (each state-bearing entry listed in some route's `panelOrder`, resolved with the same scopes as `getPanelEntries` — armies ids against the route's own `armies[route.id]` map, flat item ids against the lord-wide item datasets; carries routeId, the `PanelGroup`, and the entry id; a flat item shared by several routes' lists appears once), and `vco` (`getVcoObjectives` items with `verify-in-campaign`; carries routeId and the item id). Every member carries `text` (claim text verbatim / callout inner text / item title / VCO item text), `state` (always `verify-in-campaign`, narrowing the union), and `sources: readonly Source[]` resolved through the existing `resolveSources` so the notes are available at the view. Order is stable: routes in manifest order; within a route identity, then callouts in document order, then dataset entries in `PANEL_GROUPS` order, then VCO items in list order. The banner count is simply `getFlaggedEntries(lord).length` — never recomputed elsewhere.

**Atomicity:** One outcome: "the tree answers the complete flagged set with per-flag location and sources, from one pure function" — the entry type, the four member families, the resolution scopes, the flat dedupe, and the stable order are one query-contract (a selector returning only one or two families has no complete contract to prove, and the DESIGN's acceptance counts every family with one number). ~135 counted lines. No further valid split exists.

**Out of scope:** All rendering (banner/list — Commit 4; source panels — Commit 3), `getPanelEntries`/`resolveSources`/`getVcoObjectives` changes (they are reused as-is), and any content change.

**Implementation packet:** Reuse `getPanelEntries`'s resolution logic only by reading the same scopes — do not call it from the selector (its per-route shape loses the panel group); iterate the route's `panelOrder` groups and resolve like `resolveItemEntries` does. Flat-items dedupe: collect each state-bearing flat item by entry id once (the DESIGN's shared-panel boundary); armies entries are distinct per `(route, entry)`. Text conventions per the Assumptions. Sources resolve through the existing `resolveSources` (dangling ids are dropped — the lint keeps them out of committed content anyway). The order above is the selector's documented contract so the view can group without re-sorting; keep the member payloads semantic (no hrefs, no label strings — those are the view's presentation, per the view/query boundary).

**Files and responsibilities:** `app/content/query.ts` — `FlaggedEntry` type + `getFlaggedEntries` (pure, no I/O; exports both for the views and the tests). `test/content-model.test.ts` — fixture-level selector proofs: `als-rhyn-of-lorek` returns `[]` (its populated datasets use inferred/confirmed/historical; its objective/reward are confirmed/historical) and `second-lord` returns exactly one identity entry (its reward claim) with resolved `vco-guide` note; a fixture mutant (temp copy) with a `verify-in-campaign` dataset item listed in `panelOrder` yields a dataset entry located to its panel. `test/elspeth-skeleton.test.ts` — committed-tree proof: `getFlaggedEntries` over the real loaded tree returns exactly **36** entries — 6 identity, 5 callout, 22 dataset, 3 vco — every entry `state === "verify-in-campaign"`, each callout entry carries its committed sectionId/sectionTitle, and a flat item listed in several routes' `panelOrder` (e.g. a skills entry) appears once.

**Tests and proof:** Observable: the selector's output over the committed tree equals the DESIGN's defined set (36, one per family, one definition), over the fixture lords returns the cleared and one-flag cases, and over a mutant fixture locates a dataset flag to its panel. Seam: pure node:test over the loader-built trees; no DOM.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). Fixture mutants follow the `inBrokenCopy` temp-copy convention; no services.

**Stop conditions:** A state-bearing item that is unlisted in every `panelOrder` in committed content (contradicts the verified current state — report and revisit the Assumption with the reviewer); a DESIGN boundary case (shared item, armies, VCO) the union cannot express without a new member kind (report for replanning the type); the 36-entry count disagreeing with the verified family counts (6/5/22/3 — evidence of drift; report, never hard-code).

**Review mandate:** exactly four member kinds matching the DESIGN's flag scope; `state` is always `verify-in-campaign` (the other three states never appear); flat dedupe and armies per-route scopes match the Packet; the selector computes nothing else (no hrefs/labels — presentation stays in views); `resolveSources` is the only source resolution; `getPanelEntries`/`resolveSources`/`getVcoObjectives` are unchanged; both fixture lords and the committed count are asserted; no `package.json` change.

#### Package `source-panels` — Commit 3: Source panels under citing route sections

**Status:** Integrated

**Wave:** 2

**Depends on:** ["callout-section-attribution"]

**Write scope:** ["app/views/route.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render source panels under route body sections`

**Work:** In `app/views/route.ts`, `slotAt`'s present-section branch renders, after the section's prose, a Source / Verification Note panel (DESIGN.md component anatomy) listing each distinct source cited by that section's callout claims — SOURCE mono eyebrow; per source: the title as a link to its URL and the note in `body-sm`. The section's claims are `route.claims` where `sectionId === section.id` (Commit 1 fields); distinct sources dedupe by source id across the section (the shared source lists once); a section with no callouts, or whose callouts resolve no source, renders no panel. `app/styles/app.css` gains the token-only panel treatment: `surface-container-lowest` floor, 1px `outline-variant` border with the 3px `info` left-border accent, 10px radius, `stack-sm` padding, `body-sm` notes, transitions in the 0.15-0.2s band under `prefers-reduced-motion`.

**Atomicity:** One outcome: "every route body section that cites one or more sources renders the Source panel with each distinct source once, and sections citing nothing render none" — the per-section claim filter, the distinct-source resolution, the panel markup, and its styling are one render surface (a filter without the panel has no observable outcome; a panel without the filter has no data). ~100 counted lines. No further valid split exists.

**Out of scope:** The lord-page flag/banner surface (Commit 4), the flagged selector (Commit 2 — source panels show sources for claims of ANY state), badge or link changes (F2's badge source links are untouched), and any content change.

**Implementation packet:** Keep `slotAt`'s structure (section → gap marker); the panel mounts inside the present-section branch after the `prose` div. `sectionInnerHtml` is unchanged. Sources resolve via the existing `resolveSources(lord, ids)` with ids gathered from the section's callouts (`route.claims.filter(c => c.sectionId === section.id).flatMap(c => c.src)`); dedupe by source id preserving first-seen order. A `::claim` with no `src` contributes nothing. Panel copy is the DESIGN-fixed "SOURCE" eyebrow plus per-source title-link/URL/note; the source title is the link text (ordinary link with perceivable text, exactly as the badge links do). The section anchor scroll treatment (the existing route-section H2 ids) is unaffected. Token-only CSS per the standing rule (the known DESIGN exceptions stay); no raw colours/radii beyond the token values.

**Files and responsibilities:** `app/views/route.ts` — the per-section panel region (`slotAt` present-section branch; a small pure helper for the distinct-source read is fine in this module or `query.ts` if it earns reuse — prefer inline here per simplicity until a second consumer exists). `app/styles/app.css` — the Source panel treatment (single class set, e.g. `source-panel*`). `test/views.test.ts` — committed-tree view assertions.

**Tests and proof:** Observable over the committed tree (view VNode flatten): route-1's Opening section renders a panel with the `vco-guide` source title (link) and note; route-2's Mid → Late, Victory push, and Diplomacy sections each render one panel (their verify callouts cite `vco-guide`); sections with no callouts (e.g. route-1's Early → Mid) render no panel markup at all; a panel lists each distinct source once — proven on a temp copy of committed route-2 where the Mid → Late section gains a second `::claim` citing `vco-guide` (mutant rendering, the established temp-copy convention), asserting one `vco-guide` entry in that panel. Assert no "SOURCE" text appears for non-citing sections; the no-panel case is never blank space (the section simply keeps its F2 anatomy).

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). Temp-copy mutants follow the views-test temp-copy convention; no services.

**Stop conditions:** A section whose callouts' `sectionId` join disagrees with the rendered section (evidence the Commit 1 attribution drifted — report); a source-panel anatomy requirement the DESIGN.md anatomy cannot carry (report); the mutant route failing the lint (evidence the joint grammar changed — report).

**Review mandate:** panels appear only under sections whose callouts cite ≥ 1 resolvable source; each distinct source listed exactly once per panel; no panel for non-citing sections and no blank slot (the section keeps its F2 anatomy); badge/link behavior unchanged; formula `sectionId === section.id` reused verbatim (no second slugify); token-only CSS; no content file changed; `package.json` unchanged.

#### Package `flagged-list` — Commit 4: Flagged-items section on the lord page

**Status:** Integrated

**Wave:** 3

**Depends on:** ["flagged-query"]

**Write scope:** ["app/views/lord.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render the flagged-items section on the lord page`

**Work:** `app/views/lord.ts` gains the flagged-items section at the end of the page (`id="flagged-items"`): a mono uppercase eyebrow naming the re-check list (the DESIGN's meaning, e.g. "VERIFY IN CAMPAIGN"), then `getFlaggedEntries(lord)` rendered in the selector's stable order, grouped by location — each entry the compact row from DESIGN §6: claim text, the ConfidenceBadge (state label + icon + colour, never colour alone), the mono location label (route + section for callouts, panel name for dataset items, route + objective id for VCO items, route + identity for objective/reward), the resolved source titles with their notes beneath, and a location link where the router grammar reaches it (callouts → `#/<lord>/route/<routeId>/<sectionId>`; identity and VCO items → `#/<lord>/route/<routeId>`; dataset items render no link — the label carries the location). The empty case renders the explicit cleared statement (mono label + one proportional sentence) — never blank space. The header's plain version line stays exactly as today in this commit. `app/styles/app.css` gains the list treatments (hairline-divided rows, mono location labels, source-note styling, cleared-state treatment; token-only).

**Atomicity:** One outcome: "the lord page renders the complete grouped flagged-items list from the single selector, with an explicit cleared state" — the section markup, the entry-row anatomy, the list CSS, and the list-side VNode proofs are one render surface, and the selector's stable order is its data contract. The banner is absent at this commit (the version line stays as today) yet the section is complete and reviewable on its own: the count and every entry render on trunk green, with no dead target on either side (the chip that will anchor to this section is a later commit, and this section needs no predecessor). ~160 counted lines. No further valid split exists.

**Out of scope:** The Version Banner and open-flags chip (Commit 5), the selector itself (Commit 2), route-page source panels (Commit 3), TabStrip and other components, home cards, and any content change.

**Implementation packet:** The section reads `getFlaggedEntries(lord)` once and renders that same array — the array is the shared definition the Commit 5 chip's count will read; no second computation. Grouping follows the selector's stable order exactly (routes in manifest order; within a route: identity, then callouts in body/section order, then dataset entries in `PANEL_GROUPS` order, then VCO items in list order), so the view needs no re-sort; group headings are mono display labels (copy not contractual beyond the DESIGN's meaning). Entry rows reuse the existing `ConfidenceBadge` (F2 contract) and ordinary `<a>` location links (perceivable text, `:focus-visible` rings, keyboard-reachable in logical order). Location links use the existing hash grammar verbatim — callouts `#/<lord>/route/<routeId>/<sectionId>` (the section H2 anchor the route view already emits), identity/VCO `#/<lord>/route/<routeId>`; dataset rows have no link element at all (the DESIGN's linkless-located rule). The cleared state is the explicit DESIGN empty state (mono label + proportional sentence), never blank, and reads as a positive state (the trail is complete). The `flagged-items` id is the Commit 5 chip's scroll target; give it the established section-anchor scroll treatment so the target is not hidden under the sticky nav + tab strip. CSS: rows separated by 1px `outline-variant` hairlines, `stack-sm` rhythm, `body-sm` source notes, cleared state in the success palette — all token values only, transitions in the 0.15–0.2s band under `prefers-reduced-motion`.

**Files and responsibilities:** `app/views/lord.ts` — the flagged-items region (eyebrow + grouped entries + cleared state); the header and its version line are untouched. `app/styles/app.css` — the list + cleared treatments only; banner/chip CSS is NOT added here. `test/views.test.ts` — the list-side proofs.

**Tests and proof:** Observable (zero-DOM VNode flatten over the committed tree): the lord page ends with the flagged section (after the routes list) rendering all 36 entries — 6 identity + 5 callout (each with a `#/elspeth-von-draken/route/<id>/<sectionId>` link and a route + section label) + 22 dataset (panel labels, no link element) + 3 vco — each entry's claim text, VERIFY badge anatomy, and source-note text present, in the stable order (assert relative positions: identity before callouts; callout sections in body order; panels in `PANEL_GROUPS` order); no non-verify state ever renders. Over `als-rhyn-of-lorek` (zero flags): the section renders the explicit cleared copy — never blank. The lord header still shows today's plain version line (the banner has not landed); the home-card version-line assertion is retained unchanged. Seam: view VNode flatten; no DOM.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** A location link shape the router grammar cannot reach for a member we planned to link (identity/VCO to the route page are legal; dataset rows stay linkless — if review wants a dashboard link, that is a route-shape change and a replan); a count over the committed tree differing from the verified 36 (selector drift — report, never hand-edit); `getFlaggedEntries` re-sorting or mutating the stable order (report).

**Review mandate:** the section renders exactly `getFlaggedEntries(lord)` once (one definition, no recomputation, no filtering); only `verify-in-campaign` members appear; location labels and links match the Packet rules (dataset rows have NO link); badge reuse only (F2 contract untouched); the cleared state is explicit over the zero-flag fixture; the banner, chip, and header version line are untouched at this commit; no content change; token-only CSS; `package.json` unchanged.

#### Package `version-banner` — Commit 5: Version Banner and open-flags chip

**Status:** Planned

**Wave:** 4

**Depends on:** ["flagged-list"]

**Write scope:** ["app/views/lord.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render the version banner and open-flags chip on the lord page`

**Work:** The lord page header's plain `version-context` paragraph is replaced by the Version Banner (DESIGN.md component anatomy): the fixed "VERIFIED AGAINST" mono eyebrow, `mono-md` `patch <X> · VCO <version>` from the guide's `version` fields, and the open-flags chip — `N OPEN FLAGS` in the warning role, rendered as a same-hash anchor (href = the current lord hash, no new route) whose click handler `preventDefault`s the hash change and scrolls to (and focuses) the `flagged-items` section Commit 4 created — mirroring `main.tsx`'s skip-link idiom — or the non-link "ALL CLEARED" chip in the success role at zero. Home cards and route pages keep their current version lines. `app/styles/app.css` gains the banner strip + chip treatments (both roles) and removes the superseded `.lord-page .version-context` rule with the markup it styled.

**Atomicity:** One outcome: "the lord page header carries the survey-proof Version Banner — the version pairing and the alert/cleared chip duality — anchored to the already-rendered flagged section" — the banner markup, the chip's two states and same-hash scroll contract, the banner/chip CSS, and the chip/count proofs are one surface whose anchor target already exists on trunk (Commit 4), so there is no dead-link coupling in either direction. ~95 counted lines. No further valid split exists.

**Out of scope:** The flagged list (Commit 4 — the chip's target and count source already exist), the selector (Commit 2), source panels (Commit 3), home cards (their version line stays), TabStrip and other components, and any content change.

**Implementation packet:** The count comes from `getFlaggedEntries(lord).length` — the same array the Commit 4 list renders, so the count and the list cannot disagree. The chip anchor: an `<a>` element whose `href` is the current lord hash (a same-lord href string, e.g. `"#/" + lord.slug`) with an `onClick` handler calling `preventDefault()` then `getElementById("flagged-items")?.scrollIntoView()` and moving focus to the section (visible `:focus-visible` ring), only when flags > 0; at zero, a `span` with the success chip treatment, no `href`, no handler. Never emit a literal `#flagged`-style hash — `parseHash` would send the router to not-found. CSS: banner strip (`surface-container-low`, 1px `outline-variant` border, 10px radius, `stack-sm` padding), chip (`rounded.full`, warning role = warning palette, success role = success palette, mono uppercase label); the old `.lord-page .version-context` usage is removed with the markup it styled; all values token-only; transitions 0.15–0.2s under `prefers-reduced-motion`.

**Files and responsibilities:** `app/views/lord.ts` — the banner region replacing the version paragraph; the Commit 4 flagged section is untouched. `app/styles/app.css` — banner + chip treatments; deletion of the superseded `.lord-page .version-context` rule. `test/views.test.ts` — banner/chip proofs.

**Tests and proof:** Observable (zero-DOM VNode flatten): over the committed tree the banner renders "VERIFIED AGAINST", `patch 9.0 · VCO 2026.09.30.1`, and the `36 OPEN FLAGS` chip as an `<a>` with the same-lord href and warning-role class, and the plain header version line is gone; over `second-lord` the chip reads `1 OPEN FLAGS`; over `als-rhyn-of-lorek` (zero flags) it renders the `ALL CLEARED` success-role chip with no `href` and no handler; the home-card version-line assertion is retained unchanged; the Commit 4 flagged-section assertions remain green. The chip's scroll/focus DOM behavior is covered by the manual HTTP boot, not inventable in the zero-DOM seam. Seam: view VNode flatten; no DOM.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** The chip's same-hash anchor proving unusable under manual boot (report; the skip-link precedent is the fallback, not a new route shape); the count disagreeing with the committed 36 (selector drift — report, never hand-edit); a DESIGN copy conflict for the fixed labels (VERIFIED AGAINST / `N OPEN FLAGS` / `ALL CLEARED` are fixed — report, don't reword).

**Review mandate:** the count comes from the one selector (no second computation); the chip is a same-hash anchor with `preventDefault` and never emits a new hash shape — the router grammar is byte-unchanged; `ALL CLEARED` is a non-link success chip; the Commit 4 flagged section and its tests are untouched by this commit; home cards/route pages unchanged; no content change; the superseded `.lord-page .version-context` rule is removed with its markup; token-only CSS; `package.json` and `main.tsx` untouched.

## Discoveries and replanning

None recorded before acceptance. During execution, the coordinator records material deviations here while preserving stable package IDs; a substantive plan change requires fresh plan review and renewed acceptance.

## Final validation

Exact gates, in order, before final feature review:

1. `npm test` — full `node --test` suite green (all F1/F2/F4 suites unchanged plus the attribution, flagged-set, source-panel, flagged-list, and version-banner tests).
2. `npx tsc --noEmit` — clean over `app/`, `tools/`, `test/`.
3. `node tools/content-lint.mjs` — exit 0 on the committed `content/`.
4. `npm run build` — static `dist/` produced; `package.json` diff empty (no new dependencies).
5. Manual HTTP boot (headless Chromium against `npm run serve`, or `npm run dev`): the lord page shows the Version Banner under the header — "VERIFIED AGAINST", `patch 9.0 · VCO 2026.09.30.1`, the `36 OPEN FLAGS` chip — and clicking (or Entering) the chip scrolls to the flagged-items section without changing the hash; the section lists the 36 entries grouped by location with working location links (a callout link lands on the exact route section anchor under the sticky chrome); route pages show the Source panel beneath each citing section (route-1 Opening; route-2 Mid → Late / Victory push / Diplomacy; route-3 Mid → Late / Diplomacy) and none beneath non-citing sections; unknown hashes still render not-found and a corrupted `content/` file still renders the boot error naming file and field. The cleared (`ALL CLEARED`) state exists only on fixture trees and is proven at the view seam (the committed Elspeth guide has 36 flags, so the cleared state is a fixture-only proof — an honest gap for manual boot, not a defect).
6. The DESIGN §7 acceptance criteria checked item by item, including the desaturation check (badges and chips remain distinguishable with colour removed — labels + icons) and the DESIGN.md Pre-Delivery Checklist for the new surfaces (keyboard reachability of the chip and all location links, `:focus-visible` rings, contrast pairings, 0.15-0.2s transitions under `prefers-reduced-motion`, z-index scale, no layout shift).

## Documentation impact

Complete during reconciliation at feature close-out. Expected owners, reconciled by the coordinator/steward — not planned package work:
- `.wiki/DESIGN.md` — Components section gains implemented-verified notes for Version Banner and Source / Verification Note (both already specified; reconcile only what implementation changed).
- `.wiki/ARCHITECTURE.md` — §1.1 current-state notes (the query layer gains the flagged-set selector; the current-state tree gains the F3 surfaces); §1.2 status line updated from "F3 remains approved-but-unbuilt".
- `.wiki/TODO.md` — feature-level status moved to `Completed` after verified final integration (the Active entry created at plan acceptance is moved there).
- The accepted VERIFICATION-NOTES-UI-DESIGN.md and this ledger stay in place through completion; documented correction entries appended where the DESIGN's wording and implemented behavior resolve differently, with the ledger as the record.
