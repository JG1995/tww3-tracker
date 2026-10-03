# Route Transitions (F7 — Route transition views)

**Design:** [Route Transitions design](ROUTE-TRANSITIONS-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Make each `Transition → <route>` body section a live cross-link into the destination route's opening guidance, so a player finishing one route continues into another instead of restarting (PRD F7, "Should v1.0"). The six committed Elspeth transition sections — two per route, three routes — become same-lord anchors into the target route's `Opening`, with the route page top as the fallback when that `Opening` is a declared gap. Pure read over the immutable content tree: no state, no persistence, no new content-model fields, no lint rules, no hash routes, no components.

## User-visible behavior

- The H2 of a present `Transition → <route>` section renders as an anchor whose label is the authored heading text, verbatim (e.g. `Transition → route-2`). Activating it changes the hash to `#/<lord>/route/<target-id>/<target-opening-section-id>`; the existing section-anchor effect in `app/main.tsx` scrolls the target `Opening` H2 into view (route view remounts, tab strip and dashboard reset as with any route switch).
- A transition whose target route's `Opening` is a declared gap links to the route page top instead: `#/<lord>/route/<target-id>`.
- A transition title whose target does not resolve — unreachable for lint-passed content — renders as a plain, non-link H2; no broken href is ever emitted.
- A `Transition → <route>` title that appears only in frontmatter `gaps` (no body section) keeps F2's inert in-flow Content Gap Marker with no anchor.
- Nothing else changes: route page anatomy, tab strip, identity card, dashboard, source panels, badge links, and the router grammar are untouched; a route with no transition sections renders exactly as today.
- Detailed behavior, rules, edge cases, and acceptance criteria: the accepted DESIGN (Open Questions: None), which the ledger links and does not restate as a competing specification.

## Invariants

- Content under `content/` stays the single source of truth and is **unchanged** by this feature (ADR-0002); fixtures and temp copies in `test/` are test-owned.
- No new content-model fields, no new lint rules, no new hash routes, no new components, no new dependencies, no `.tsx` views: the anchor is derived at render from the already-validated transition title grammar plus the lord's manifest route list (DESIGN §4 "Link derivation").
- No cross-lord links: the target resolves only among the current lord's manifest routes, mirroring the lint's `isKnownSectionTitle` id-or-name match.
- The hash remains the single source of truth; this feature holds no state and persists nothing.
- Views stay presentational `.ts` modules built with Preact's `h()`; side effects live only in `app/content/load.ts`; `app/styles/app.css` stays the single token-only stylesheet.
- A gap-declared transition title without a body section renders F2's inert marker; a present transition section renders at its registry position with its H2 as the anchor — never both.

## Non-goals

- No bidirectionality enforcement in the content contract (no new lint rules); the back-link exists only through the destination's own transition section, exactly as the committed content has it.
- No cross-lord links, no per-faction code, no "continue" component, no new UI copy beyond the existing heading text.
- No changes to the tab strip, identity card, dashboard, source panels, or any other F2/F3 surface; no router changes (`main.tsx`'s existing section-anchor scroll effect already handles the landing hash).
- No persistence, no write path (F5 owns that), no second faction's content.

## Current-state map

- Relevant components: `app/views/route.ts` — `routeBody` walks the fixed registry order (`REQUIRED_SECTIONS` then `OPTIONAL_SECTIONS` from `app/content/lint.ts`, then the route's transition titles from `route.gaps` filtered by the view-local `TRANSITION_PREFIX` = `"Transition → "`); `slotAt` renders each slot as the present section (H2 re-rendered in JSX carrying the tree `section.id` as the anchor id — `sectionInnerHtml` strips the boot-rendered `<h2>` so only the inner HTML stays boot-time HTML) or the in-flow Content Gap Marker for a declared gap; the Source panel mounts inside the present-section branch. `app/content/query.ts` — the pure lord-scoped read surface (`getLord`, `getRoute`, `getSection`, `resolveSources`, `getPanelEntries`, `getVcoObjectives`, `getFlaggedEntries`); F7 adds no read here unless one earns reuse. `app/content/lint.ts` — `isKnownSectionTitle` already guarantees a transition title names another same-lord route by id or name; the registry constants define slot order. `app/content/types.ts` — `Section` is `{ id, title, html }` with `id` = the slugified title (view-local `slugify` in `app/content/load.ts`; `"Opening"` → `"opening"`); `Route.gaps` is the declared-gap titles list. `app/router.ts` — the grammar already parses `#/<lord>/route/<id>/<section-id>`. `app/main.tsx` — the section-anchor effect scrolls the hash's section id into view after route changes and boot. `app/styles/app.css` — single token-only stylesheet; ordinary-link precedents `.flagged-item__link` and `.source-panel__title` (underline + `text-underline-offset: var(--space-stack-xs)`, `on-surface` color, `:hover` shifts toward `primary`, `transition: var(--transition-standard)`, disabled by the `prefers-reduced-motion` block; the global `:focus-visible` rule is 2px `primary` at 3px offset).
- Data model: the committed Elspeth guide holds three routes; each body carries the eight registry sections in order, including exactly two `## Transition → route-<n>` H2 sections with authored prose. The six transition titles are **also** still declared in frontmatter `gaps` (the F4 migration retained the skeleton's gap declarations); `slotAt` prefers the present section, so they render as sections, and a body-less declared transition would render the marker. All three targets have a present `Opening` section, so the direct-href case is the committed path and the gap-`Opening` case is fixture-only.
- Persistence and migrations: none — the hash remains the only restored state (F1/F2).
- Existing behavioral assumptions: boot-once immutable frozen tree; views presentational and assertable by the zero-DOM VNode flatten seam (`test/views.test.ts` `recordVNodes`/`vnodeText` over the real committed tree and `inContentCopy` temp copies); the lint is the single rule set for boot and CLI; the committed route pages render the transition sections today as plain H2 headings (F2 explicitly deferred the links).
- Architectural seams: `slotAt`'s present-section branch is the exact render point; `app/content/query.ts` is the pure read surface views may extend; token-only CSS additions follow the `.flagged-item__link`/`.source-panel__title` precedents.
- Project validation commands: `npm test` (node:test), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 on committed `content/`), `npm run build`; `npm run serve` serves the manual HTTP boot (precedent ledgers name it as the completing manual evidence).
- Primary risks: the required-section ordering rule constrains the gap-`Opening` fixture (removing `Opening` from a copy requires declaring **all four** required sections in gaps or the lint reports "expected Opening first"); the three committed-route heading-order test blocks churn in this package (obsolete plain-heading assertions are replaced, not left dead).

## Feature architecture

- The link derivation lives at the view in `app/views/route.ts`, where `slotAt` already re-renders each present section's H2: when the section title starts with the view-local `TRANSITION_PREFIX`, a small pure resolution helper (module-local, exported for direct test — the F2 `tabNav` precedent) matches the suffix against the lord's manifest routes by id or name (the exact `isKnownSectionTitle` scoping, `r.id === target || r.name === target`), and renders the H2 as `<a class="route-section__heading-link" href="#/<lord-slug>/route/<target-id>[/<opening-section-id>]">` wrapping the authored title text verbatim; the H2 keeps its tree `section.id` as the anchor target. The `Opening` section id is the target route's real tree id (`target.sections.find(s => s.title === "Opening")?.id`); when the target's `Opening` is absent — declared in `gaps` — the href drops the section segment (route page top). An unmatched suffix renders the plain H2 (view-invariant branch; content that passes the lint never reaches it).
- Boundaries: no `query.ts` change (no second consumer exists; the F3 `sectionSources` precedent keeps a single-consumer pure read in the view), no `types.ts`/`lint.ts`/`load.ts`/`router.ts`/`main.tsx` change, no new component, and one token-only CSS class. `app/main.tsx`'s existing section-anchor effect performs the landing scroll; keyboard reachability comes from the native anchor plus the existing global `:focus-visible` ring.

## Uncertainty register

### Known

- The six committed transition sections are present body H2s whose titles are also declared in frontmatter `gaps`; `slotAt` prefers the present section, so the direct-href path is the committed case and the inert-marker path is a fixture case.
- The unresolvable-target branch cannot be built through `loadContentTree` (the lint rejects any non-matching transition title as an unknown section heading); its proof needs a constructed-Lord render or the exported pure helper at the view seam.
- The gap-`Opening` fixture must stay lint-valid: removing `Opening` from a copied route body requires declaring all four required sections in gaps (the required-order rule checks present sections against the registry position).
- The three committed-route tests (`route page identity card…` at test/views.test.ts line 291, Route II at 868, Route III at 1011) assert the transition titles as plain headings (section-order loops around lines 379/913/1059 and the "prose renders verbatim" lines 401/933/1084) and must be updated in the same commit that changes the rendering.

### Assumptions

- The `Opening` section id is the same `slugify` output every committed tree already carries (`opening`); the helper reads the target section's tree id rather than re-slugifying.
- The anchor wraps the authored heading text inside the H2 (the H2 keeps `id` for the router grammar); CSS `text-transform: uppercase` on `.route-section__heading` affects only the visual, never the authored label.

### Decisions

- **One PR, one package.** The feature is one user-visible outcome — the transition H2 becomes an anchor with a two-branch target rule and a view-invariant guard. Splitting the direct case from the gap fallback would ship a transiently incorrect anchor rule (a gap-`Opening` target would get an href pointing at a non-rendered H2 id) with no independent trunk value; the CSS, the view branch, and the proofs share one file set. Mirror the F1–F4 boundary: provider `Local`, `PR ref: Not applicable`, `Merge method: ff-only`, base `main`, the four-command local gate, one short-lived branch. **Feature close-out: Not run** (sole/final PR).
- **Resolution helper stays in `app/views/route.ts`** next to the view-local `TRANSITION_PREFIX` and `slotAt`, mirroring F3's single-consumer `sectionSources`; a `query.ts` home earns consideration only when a second consumer appears. **Package ID:** `transition-links`.
- **Proof seams:** the committed-tree anchor set (all six hrefs, each resolving to a rendered H2 in the same tree), the `inContentCopy` temp copies for the gap-`Opening` and inert-marker cases, and a constructed-Lord render for the lint-impossible unresolvable case — all at the zero-DOM VNode flatten seam; the manual HTTP boot proves scroll landing and the `:focus-visible` ring.

### Unknowns

- None gating the plan. Exact link CSS details beyond the DESIGN-bound treatment (underline, `:focus-visible` ring, 0.15–0.2s colour-only hover under `prefers-reduced-motion`) are implementation detail.

### Risks

- Test churn in the three committed-route heading blocks is owned by this package (the testing contract: replace assertions with the ones that protect the new behavior; obsolete ones are deleted, not left dead).
- The gap-`Opening` temp copy must declare all four required sections in gaps to stay lint-clean; the packet names the exact mutation and the `lintContent` assertion guards it.
- No new dependencies, no `.tsx`, no `package.json` change must sneak in (ADR-0001).

## Walking skeleton

The whole feature is one atomic commit on the sole Local PR: after integration, each committed Elspeth route page renders its two transition H2s as underlined anchors; clicking "Transition → route-2" from Route I changes the hash to `#/elspeth-von-draken/route/route-2/opening`, and the existing anchor effect scrolls Route II's Opening into view — the complete DESIGN Journey A end to end. The thinnest complete path through the feature is that single commit.

## Delivery plan

**Commit packages:** 1

### PR `route-transitions` — Render transition sections as same-lord cross-links

**Status:** Planned

**Depends on:** []

**PR ref:** Not applicable

**Merge ref:** Not merged

**Branch:** `feat/route-transitions`

**Base branch:** `main`

**Publication provider:** Local

**PR template:** Not applicable

**Merge method:** ff-only

**Required checks:** `npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds

**Feature close-out:** Not run

**Provisional PR title:** `feat(app): render transition sections as same-lord cross-links`

**Purpose:** F7 is a small, additive rendering change on the accepted F2 contract — the six committed transition sections become same-lord cross-links into each target route's `Opening` (route page top when the `Opening` is a declared gap). One Local ff-only boundary mirrors the accepted F1/F2/F3/F4 convention: the single atomic commit keeps `main` green, stays individually reviewable, and no intermediate seam justifies a second merge boundary; `package.json` and the content tree stay untouched.

#### Package `transition-links` — Commit 1: Render transition sections as same-lord cross-links

**Status:** Planned

**Wave:** 1

**Depends on:** []

**Write scope:** ["app/views/route.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render transition sections as same-lord cross-links`

**Work:** In `app/views/route.ts`, the present-section branch of `slotAt` turns a `Transition → `-prefixed H2 into an anchor: a small pure helper (module-local, exported for direct test like `tabNav`) matches the suffix against the lord's manifest routes by id or name, then the H2 renders as `<a class="route-section__heading-link" href="#/<lord-slug>/route/<target-id>[/<opening-section-id>]">` around the authored heading text verbatim, keeping the H2's tree `section.id` as the router anchor. The `Opening` target uses the target route's real section tree id (`target.sections.find(s => s.title === "Opening")?.id`); when the target's `Opening` is absent (declared in `gaps`), the href is the route page top `#/<lord-slug>/route/<target-id>`; an unmatched suffix renders the plain H2 with no href. `app/styles/app.css` gains one token-only link class following the `.flagged-item__link`/`.source-panel__title` ordinary-link precedents (underline + `text-underline-offset`, `on-surface` → `primary` colour-only hover, `transition: var(--transition-standard)` under the existing `prefers-reduced-motion` block; the global `:focus-visible` ring applies unchanged). Update `test/views.test.ts`: replace the plain-heading transition assertions in the three committed-route blocks with anchor assertions, and add the new proofs below, all in this commit.

**Atomicity:** One outcome: "transition sections become cross-links, with every branch of the DESIGN target rule correct" — the link derivation, the `Opening`-vs-page-top fallback, the plain-H2 view-invariant guard, the anchor styling, and their proofs are one user-visible contract (DESIGN acceptance items 1–6 read as one surface). Splitting the direct case from the fallback branches would land a transiently incorrect anchor rule for gap-`Opening` targets (an href to a section id that does not render) that is not independently reviewable or revertible as a complete outcome, and the two halves would edit the same `slotAt` branch, the same CSS class, and the same `test/views.test.ts` blocks; splitting the CSS into its own commit has no observable context without the view. Counted estimate: ~55 lines of non-test implementation (`transitionTarget` helper + `slotAt` branch + one CSS class); the test updates and new proofs are excluded from the count. No further valid split exists.

**Out of scope:** Committed content (the six transition sections and their `gaps` declarations stay verbatim), `query.ts`/`types.ts`/`lint.ts`/`load.ts`/`router.ts`/`main.tsx`, any other F2/F3 surface, F5/F6 work, and the manual boot evidence (final validation, not a package proof).

**Implementation packet:** Resolution scoping must mirror the lint's `isKnownSectionTitle` exactly — match the suffix against `lord.routes` by `r.id === target || r.name === target`; never synthesize an id (read the target route's `Opening` section's tree `id`). The committed Elspeth tree is the direct-href case: all six targets resolve, each `Opening` is present, so the hrefs are `#/elspeth-von-draken/route/route-2/opening`, `#/elspeth-von-draken/route/route-3/opening`, and so on — the section ids every committed route already carries. Because the six transition titles are also declared in `gaps`, keep `slotAt`'s preference order (present section first, marker only for a body-less declared gap) — the anchor logic must not be disturbed by the gap declaration. The anchored H2 keeps `id: section.id`, `className: "route-section__heading"`, and the `data-section-id`/prose/source-panel anatomy of the present-section branch unchanged; only the heading child of a matching transition section becomes the anchor element. CSS: one class on the anchor (`inherit` the heading's mono voice, add underline + offset + color/hover/transition over tokens only; no raw colours or new tokens without a DESIGN change — `test/tokens.test.ts` is untouched).

**Files and responsibilities:** `app/views/route.ts` — the pure `transitionTarget`-style helper (id-or-name resolution + `Opening` tree-id lookup, returning the href pieces or null) and the `slotAt` present-section branch rendering the anchored H2 for matching titles, the plain H2 otherwise. `app/styles/app.css` — the token-only `.route-section__heading-link` treatment (no new tokens, no raw values beyond the established DESIGN-fixed exceptions). `test/views.test.ts` — the three committed-route heading-order blocks gain per-anchor assertions (anchor element present with the exact href and the authored label as its text); a dedicated committed-tree test asserts the full six-anchor set and that every href target resolves to a rendered H2 in the same loaded tree (`getRoute`/`getSection`); a temp copy (gap-`Opening` case) renders the route-page-top href; a temp copy (transition title removed from a body, staying declared in gaps) renders the inert CONTENT GAP marker with no anchor; a constructed-Lord render (unresolvable title) renders the plain H2 with no anchor.

**Tests and proof:** Observable: over the committed tree, each of the six transition H2s renders as an anchor with href `#/elspeth-von-draken/route/route-<n>/opening` (relative-position order unchanged), the anchor text equals the authored heading verbatim, and every href's target exists when the same tree queried via `getRoute`/`getSection` (DESIGN AC "every href resolves to a rendered H2 id"). Temp copy with the target route's `Opening` removed and all four required sections declared in gaps (lint-validated by `lintContent` first, the mixed-route precedent): the source route's transition anchor drops the section segment — `#/elspeth-von-draken/route/route-2` (AC 4). Temp copy with one transition body removed while its title stays in `gaps`: the registry slot renders the inert marker (existing F2 marker copy) with no anchor markup (AC 5). Constructed-Lord render of a `Transition → <unknown>` heading: plain H2, no `a` element (AC 6; the case is unreachable through the loader, so the proof bypasses `loadContentTree` like the exported pure-helper precedents). The updated committed-route blocks keep their section-order and prose assertions (the anchor text still satisfies `text.includes(title)` and order checks). Seam: zero-DOM VNode flatten (`recordVNodes`/`vnodeText`), `inContentCopy` temp copies, and one hand-built Lord/Route pair from the loaded committed values.

**Validation:** `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 on committed `content/` — unchanged), `npm run build` (no `package.json` diff). Temp-copy mutations and the constructed Lord follow the existing in-test fixture conventions; no services; the keyboard `:focus-visible` ring and the anchor-effect landing scroll are the manual HTTP boot's completing evidence.

**Stop conditions:** A resolution need beyond id-or-name matching (`Transition → <faction>` or cross-lord targets are outside the DESIGN and the lint — report, don't extend); a required-section ordering constraint that makes the gap-`Opening` fixture unexpressible while lint-clean (report — the packet's all-four-gaps mutation is the expected shape); a committed-content fact that contradicts the verified six-anchor direct case (report, never hard-code hrefs); anchor behavior that needs DOM-only proof beyond the manual boot (stop rather than add a DOM test dependency).

**Review mandate:** hrefs are derived from the tree only (no invented ids, no hard-coded `#/…` strings beyond the grammar shape); the authored heading text stays verbatim as the anchor label; the plain-H2 guard emits no href; the marker branch stays inert (F2 contract, no regression); only `test/views.test.ts` changes among tests and only the three package paths change overall; CSS is token-only with no new tokens; no `query.ts`/`types.ts`/`lint.ts`/`load.ts`/`router.ts`/`main.tsx`/content change; commit gate green.

## Discoveries and replanning

Record material deviations, blockers, and decisions that change remaining work. State what was planned, what changed, and why. Preserve unchanged IDs. Mark replaced packages or PRs `Removed — <reason>` and add new stable IDs; never reuse an old ID for a different outcome.

- None so far. (No committed content change, no contract change, no seam collapse expected for this bounded rendering feature.)

## Final validation

Exact gates, in order, before final feature review:

1. `npm test` — the full `node --test` suite green: every F1–F3 suite unchanged, the committed-content contract suites unchanged (`test/elspeth-skeleton.test.ts`, `test/content-model.test.ts` — no content or model change), and `test/views.test.ts` green with the three committed-route anchor assertions plus the six-anchor, gap-`Opening`, inert-marker, and unresolvable proofs.
2. `npx tsc --noEmit` — clean over `app/`, `tools/`, `test/`.
3. `node tools/content-lint.mjs` — exit 0 on the committed `content/` (unchanged content; the gate re-verifies the transition title grammar the links rely on).
4. `npm run build` — static `dist/` produced; `package.json` diff empty (no new dependencies).
5. Manual HTTP boot (`npm run serve`; headless Chromium or a real browser against the local server): each committed Elspeth route page shows its two transition H2s as underlined anchors with the authored labels; activating "Transition → route-2" on Route I changes the hash to `#/elspeth-von-draken/route/route-2/opening` and Route II's Opening H2 scrolls into view under the sticky nav (tab strip active tab moves, dashboard resets); Tab reaches every transition link and the `:focus-visible` ring shows (2px `primary`, 3px offset); a reload restores the exact page/section; unknown hashes still render not-found.
6. The DESIGN §7 acceptance criteria checked item by item: six committed anchors, every href resolving to a rendered H2 id; link landing via the existing anchor effect; keyboard reachability and `:focus-visible`; gap-`Opening` → page top (fixture); gap-declared transition keeps the inert marker (regression); unresolvable title renders plain H2 (fixture); the commit gate green with the changed views suite discovered and executed.

Report any skipped or unsupported validation step as a gap, never as a pass.

## Documentation impact

Complete during reconciliation at feature close-out (coordinator/steward, not package work):
- `.wiki/TODO.md` — already updated to `Active` with the ledger link; moved to `Completed` after verified final integration.
- `.wiki/ARCHITECTURE.md` — the approved-but-unbuilt note (F7 remains) flips to implemented; the route-view responsibilities line gains "transition sections render as same-lord cross-links" under the F7 implementation fact.
- `.wiki/DESIGN.md` — no component addition is expected (no new component; the link treatment is the existing ordinary-link precedent), reconcile only if implementation reveals a difference.
- The accepted ROUTE-TRANSITIONS-DESIGN.md and this ledger stay in place through completion; the ledger's Discoveries section is the record for any wording-vs-implementation differences.
- The accepted planning artifacts (DESIGN + this ledger) are committed to the tracked `.wiki/` in a separate authorized Git operation before execution — never as part of an implementation package.
