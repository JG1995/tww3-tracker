# Feature: Verification Notes UI (F3 — Research & verification notes)

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** Make each guide's research trail first-class UI — a per-guide Version Banner (verified patch + VCO version and the count of open `verify-in-campaign` flags), Source panels next to the sections whose claims depend on external documentation, and a flagged-items list of every `verify-in-campaign` claim — so a game patch becomes a review pass over a short, concrete re-check list instead of a rewrite from memory (PRD F3, PRD Flow 3).

**Context:** F1 (site-foundation) delivered the content model — `guide.json` `version { patch, vco, checked }`, `data/sources.json` entries (`id/title/url/note`), and four-state claims in identity claims, `::claim` callouts, dataset items, and `vco` objective items. F2 (route-first rendering) delivered the Confidence Badge with source links (external URLs only) and explicitly deferred the fuller source panels and the version banner to this feature. F4 (Elspeth migration) populated all of it for the pilot guide. F5 (ledger) will render VCO objective items with campaign state; F6 (search, v1.1) will index the same content corpus. This feature is read-only rendering over the existing immutable `ContentTree`; it realizes PRD F3.

**Non-Goals:**

- No editing of confidence states, source notes, or version fields from the UI. Updating a claim after a live re-check is a content edit in `content/` (ADR-0002); the site displays the research trail, it never writes it.
- No write path and no new persistence: no localStorage, no store, no per-view fetching. F5 owns the site's only write path (ledger documents); F1's stateless UI policy is unchanged.
- No badge or confidence-state changes: the four states, labels, icons, and badge anatomy are F2's accepted contract and render identically here.
- No new hash routes: the router grammar (home / lord / route / route+section) is unchanged; the flagged list is reached by in-page anchor, the established navigation idiom.
- No cross-guide flag aggregation or search over flags (F6, v1.1); the list is per-guide.
- No separate all-sources directory page: sources surface where they are cited (source panels, flagged entries, badge links).
- No new project dependencies — the ADR-0001-pinned manifest stays frozen.

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Navigation:** the existing hash URLs only. The Version Banner's flags chip is an in-page anchor to the flagged-items section of the same lord page — no new route shape.
- **Content files (developer input):** unchanged file set; the committed Elspeth content is the exercised corpus. The only model-visible change is that route body callouts carry their section's identity (today `Route.claims` is a flat list without location), so the UI can name and link each flag's place.

### Displayed Data

- **Version Banner (lord page):** the guide's `version.patch` and `version.vco` in the fixed `patch <X> · VCO <version>` pairing, plus a count chip of the guide's open `verify-in-campaign` claims.
- **Flagged-items list (lord page):** every `verify-in-campaign` claim in the guide — route objective/reward claims, `::claim` callouts in route body sections, dashboard dataset items carrying the state, and VCO objective items — each with its claim text, badge, location, a link to that location, and the notes of its resolved sources (the recorded open questions).
- **Source panels (route body sections):** the distinct sources cited by the claims in that section — source title, URL, and note — in the DESIGN.md Source / Verification Note anatomy.
- **Everything else:** unchanged — home cards keep their plain version line, route pages keep their current anatomy, and F2's badge source links are retained everywhere.

### Persistent Data

- **Guide content:** `content/` in the repository — read-only for this feature; no content file's shape changes beyond the callout-location attribution noted above.
- **The system must NOT persist** anything: banner, list, and panels are synchronous in-memory reads over the boot-built tree; the hash remains the only restored state.

## 3. The User Journey (Step-by-Step)

### Journey A — Post-patch review pass (PRD Flow 3)

1. **Entry Point:** a game patch drops; the player opens the site (F1 reading path) and goes to the faction guide (lord page).
2. **System Response 1:** the Version Banner shows `VERIFIED AGAINST — patch <X> · VCO <version>` and a warning chip with the count of open flags (e.g. `N OPEN FLAGS`).
3. **Action 1:** the player clicks the chip (or follows focus to it and presses Enter).
4. **System Response 2:** the view scrolls to the flagged-items section of the same page: every `verify-in-campaign` claim, grouped by location, each showing the claim text, its badge, where it sits (route + section, or dashboard panel, or VCO objective id), and the source notes recording what is actually open.
5. **Action 2:** the player clicks a flag's location link.
6. **System Response 3:** the existing hash navigation takes the player to that claim in context (route page, section anchor where one exists, or the guide's dashboard surface).
7. **Action 3:** the live campaign confirms or refutes the claim; the player updates the content file's state and the guide's version context as a content edit (outside the site).
8. **Success State:** after the edit and a reload, the re-checked claims no longer appear in the list; when the last one is cleared the banner chip reads `ALL CLEARED` in the success role. No trigger is ever fabricated to look complete.

### Journey B — Reading a route with a research trail

1. **Entry Point:** a route page (F2 reading path).
2. **System Response 1:** section prose renders as in F2, with `::claim` callouts badged as before.
3. **System Response 2:** beneath each section whose claims cite sources, a Source panel lists the distinct cited sources — what was checked, against which patch/VCO version, and the open question if any. Sections whose claims cite nothing render no panel; the section never shows a blank source slot.
4. **Success State:** the player reads the claim, sees its confidence state, and can read the note of the evidence that supports it without leaving the section; the badge's existing source links remain the short path to the external reference.

## 4. Logical Constraints (The "Rules of the Road")

### Flagged set

- **IF** a claim in the guide carries the state `verify-in-campaign`, **THEN** it appears exactly once in the flagged-items list: identity objective/reward claims, route body `::claim` callouts, dashboard dataset items (`state`), and VCO objective items are all in scope; the other three states never appear in the list.
- **IF** the banner chip renders a count, **THEN** the count equals the number of entries in the flagged list for the same guide — one definition, one number, computed from the tree, not hand-maintained.
- **IF** the guide's flagged set is empty, **THEN** the banner chip renders the cleared state in the success role and the flagged section renders an explicit cleared state — never blank space.

### Flagged entry

- **IF** a flag renders, **THEN** it shows, in the entry: the claim text, the Confidence Badge for its state (F2 treatment — colour is never the sole indicator), a location label naming route + section (for callouts), route + dashboard panel (for dataset items), route + objective id (for VCO items), or "Shared" / identity (for shared and identity claims), the resolved source titles with their notes, and a link to the claim's location where the existing router reaches it.
- **IF** a flag's `src` ids resolve to no source (dangling id, dropped by the pure resolver), **THEN** the entry still renders its text, badge, and location; the source line is simply absent — the lint keeps dangling ids from reaching boot anyway.

### Version Banner

- **IF** the lord page renders, **THEN** the Version Banner shows the guide's `version.patch` and `version.vco` together, in the fixed `patch <X> · VCO <version>` pairing (DESIGN.md Value & Number Formatting — never one without the other), with the open-flags chip.
- **IF** the banner's chip renders a non-zero count, **THEN** it is an anchor link to the flagged section of the same page; **IF** the count is zero, **THEN** it is the cleared state and not a link.
- The home cards and route pages keep their current plain version line; the banner exists once, on the guide root.

### Source panels

- **IF** a route body section's claims cite one or more source ids, **THEN** the section renders a Source / Verification Note panel (DESIGN.md component anatomy: "SOURCE" mono eyebrow, `body-sm` notes) listing each distinct cited source once, with its title, URL, and note.
- **IF** a section's claims cite no sources, **THEN** no panel renders for it — a source panel is the trail for cited claims, not a placeholder for every section.
- **IF** the same source is cited by several claims in one section, **THEN** it lists once in that section's panel.
- Dashboard items and identity claims keep F2's badge source links; this feature adds the note text to the flagged entries and section panels, not new link mechanics.

### Rendering and model

- **IF** a route body callout is parsed, **THEN** it carries its section's identity (section title/id) in the tree — the flat locationless `Route.claims` form is superseded for callouts — so every flag can name and link its place.
- **IF** this feature renders, **THEN** every read is a synchronous in-memory lookup over the boot-built tree (ARCHITECTURE §1.1): no per-view fetching, no new loading states, no mutation of the frozen tree.
- **The site never writes `content/`:** no UI control in this feature edits a state, note, or version field; the content files remain the single source of truth (ADR-0002).

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- **Schema-invalid or dangling-source content:** unchanged F1/F2 contract — the lint catches it pre-commit and boot shows the boot-error state naming file and field if it slips through. This feature adds no new content vocabulary.
- **Flag whose location link target does not exist in the router's grammar** (e.g. a dashboard item with no dedicated anchor): the entry renders without the link and keeps its location label — a flag is never dropped or silently linkless-only; the label always carries the location.

### Empty States

- **No `verify-in-campaign` claims in the guide:** the banner chip shows the cleared state (success role) and the flagged section shows an explicit cleared message — the research trail is complete, and that is a positive, visible state.
- **Section with claims but no cited sources:** no Source panel; the section is unchanged from F2.
- **Flag with no sources resolved:** entry renders text, badge, and location without a source line (see §4).

### Boundary Cases

- **The same claim text appears in several places (identity vs. body):** each occurrence is its own flag with its own location — the list is a re-check list of claims, not a de-duplicated dictionary of texts.
- **A dataset item shared by several routes' `panelOrder`:** the item carries one state and appears once in the list, located to the panel it belongs to; per-route selection is F2's `panelOrder` behavior and is not duplicated here.
- **Very long source notes:** the note renders in full (`body-sm`); truncation is a layout matter owned by the design system, not by content.
- **A second guide (v1.1) with zero or many flags:** both extremes render — the cleared state and a long grouped list — without code changes per faction.

### Interruptions

- **Reload anywhere on the lord page:** stateless — the hash restores the page; the banner count, list, and panels rebuild from the tree. No state is lost because none is kept.
- **Content edited while the site is open:** unchanged F1 policy — manual reload picks it up.
- **Anchor navigation interrupted by a route change:** the flagged section belongs to the lord page; leaving it discards nothing.

## 6. Interface & Interaction (The "Look and Feel")

### Visual Style

The full `.wiki/DESIGN.md` system, token-only CSS as established by F1/F2: monochrome chrome, signal orange only for the flagged/live state, metric green for the cleared state, flat weight-400 Geist with Geist Mono instrument labels, no shadows. The three surfaces use components the design system already specifies: Version Banner (warning chip `n OPEN FLAGS` / success chip `ALL CLEARED`), Source / Verification Note panel ("SOURCE" mono eyebrow + `body-sm` notes, `surface-container-lowest` floor, 3px `info` left-border accent), and the Confidence Badge (F2).

### Layout

Single column, 1200px max. Lord page: under the sticky nav and the tab strip, the Version Banner strip sits at the top of the page (replacing the plain version line in the page header), then the shared fundamentals, then the Routes list, then the Flagged-items section at the end of the page — the trail closes the guide it documents. Each flag entry is a compact row: location label (mono), claim text, badge, source notes beneath, location link. Route pages: the Source panel sits at the bottom of its section, after the section's prose and callouts, at the section's spacing rhythm.

### Copywriting

- **Banner eyebrow:** "VERIFIED AGAINST" (DESIGN.md, fixed).
- **Flag chip:** `N OPEN FLAGS` / cleared state `ALL CLEARED` (DESIGN.md, fixed).
- **Flagged section:** a mono uppercase eyebrow naming the re-check list (e.g. "VERIFY IN CAMPAIGN" meaning); the cleared state's one proportional sentence explains that no claim is currently open.
- **Source panel eyebrow:** "SOURCE" (DESIGN.md, fixed).
- **Flag location labels:** route number/name plus section title, panel name, or objective id — descriptive, not contractual wording.
- Exact copy beyond these fixed DESIGN.md labels is not contractual.

### Accessibility

Inherited from the design system and F1/F2: the chip and every flag entry link are keyboard-reachable in logical order with the `:focus-visible` ring; badges pair colour with label + icon so the list reads fully when desaturated; source URLs are ordinary links with perceivable text; transitions stay in the 0.15–0.2s band and disable under `prefers-reduced-motion`. These inherit the established conventions and are not per-component decisions.

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] The lord page renders the Version Banner: "VERIFIED AGAINST" + `patch <X> · VCO <version>` from the guide's `version` fields, plus the open-flags chip; home cards and route pages keep their current plain version line.
- [ ] The chip counts exactly the guide's `verify-in-campaign` claims (identity, callouts, dataset items, VCO items combined) and anchors to the flagged section; at zero it renders `ALL CLEARED` in the success role and is not a link.
- [ ] The flagged-items list shows every `verify-in-campaign` claim exactly once, grouped by location; each entry shows claim text, badge, location label, resolved source titles with notes, and a working link to the location where the router reaches it; no other state appears in the list.
- [ ] The cleared empty state is explicit (banner + section), never blank; the committed Elspeth guide renders a populated list from its migrated content.
- [ ] Each route body section citing ≥ 1 source renders the Source panel with each distinct cited source's title, URL, and note; sections citing none render no panel; dashboard and identity badge source links are unchanged.
- [ ] Route body callouts carry section attribution in the content model; `content-lint` stays green on the committed Elspeth content and the full gate passes: `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs`, `npm run build`, and the `npm run serve` HTTP boot check.
- [ ] All F3 rendering is synchronous in-memory over the frozen tree: no new loading states, no persistence, no writes to `content/`, no new hash routes, and `package.json` unchanged.
