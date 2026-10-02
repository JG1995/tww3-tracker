# Feature: Route-first Rendering (F2 — Route-first content rendering)

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** Render the full route-first content model — route tab strip, upgraded route pages (identity card, registry-ordered sections, in-flow content gap markers), the dashboard region with tabbed panels, and the Confidence Badge — and define the typed dataset schemas for the six structured datasets so the F4 Elspeth migration is content-only.

**Context:** F1 (site-foundation, completed 2026-10-02) delivered the shell, hash routing, the content model (`app/content/types.ts`, `load.ts`, `lint.ts`, `query.ts`), the Elspeth skeleton with empty dataset stubs, and the local server. F2 consumes that tree and replaces F1's plain route form with the design-system rendering from `.wiki/DESIGN.md`. It realizes PRD F2. F3 (verification notes UI) builds on F2's badges and identity surfaces; F4 (Elspeth migration) fills the F2 dataset schemas with real content; F5 (ledger) consumes F2's `vco` objective-item ids; F7 (route transitions) adds cross-links into F2's transition sections. F2 depends on nothing beyond the accepted F1 code and the design system.

**Non-Goals:**

- No version banner, source panels, or flagged-items view (F3).
- No actual Elspeth content — this feature reshapes the stubs to the new typed form and renders them; F4 fills them.
- No ledger of any kind: no campaign state, no ticks, no write path (F5). The `vco` dataset carries the researched objective list only, never progress.
- No cross-guide search (F6) and no route-transition cross-links (F7); F2 renders the transition *sections* as prose and adds no links between routes.
- No new project dependencies — the ADR-0001-pinned manifest (`preact`, `markdown-it` runtime) stays frozen; all icons are hand-authored inline SVG.
- No persistence of UI state: no localStorage, no panel-selection memory, no "last route".
- No second faction's content (v1.1).

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Navigation:** hash URLs only — the existing `#/`, `#/<lord-slug>`, `#/<lord-slug>/route/<route-id>`, optional `#/<lord-slug>/route/<route-id>/<section-id>`. The lord page is the "Shared" surface; no new route shape is added.
- **Route tab strip:** mouse or arrow keys (Left/Right move the active route tab when the strip has focus; Home/End jump to first/last).
- **Dashboard panel tabs:** click or keyboard; selection is component-local and resets on navigation.
- **Content files (developer input):** the six dataset JSON files under `content/<lord-slug>/data/` gain fixed schemas; `panelOrder` frontmatter (already parsed by F1) controls panel item selection and order.

### Displayed Data

- **Route tab strip:** on lord and route pages — a "Shared" tab plus one tab per route (mono uppercase route code, proportional route title, official VCO title dimmed beneath, or an unresearched marker).
- **Route identity card:** number, official VCO title (or explicit unresearched marker), thematic subtitle, objective and reward as Confidence Badged claims, interpretation/bottleneck/motto when present.
- **Route sections:** the F1 registry H2 sections in fixed order, each rendered from boot-time markdown; declared gaps render a Content Gap Marker in the section's position.
- **Dashboard panels:** five tabs — Army templates, Skills, Research, Settlements, Mechanics — each rendering its `panelOrder`-listed items from the typed datasets; an optional `vco` objective-item list under the route identity (exact current VCO objectives per route).
- **Confidence Badges:** on route `objective`/`reward`, on `::claim` callouts inside section prose, and on any dataset item carrying a `state`.
- **Version context:** unchanged from F1 (lord card and lord page); the per-guide version banner is F3.

### Persistent Data

- **Guide content:** `content/` in the repository — the F2 dataset schema change is a content-contract change expressed in committed files; the committed Elspeth stubs are reshaped from `[]` to the new typed empty form and must stay lint-clean.
- **The system must NOT persist** any UI state: panel selection, tab focus, and scroll position are rebuilt on every load; the hash is the only restored state (F1 policy, unchanged).

## 3. The User Journey (Step-by-Step)

### Journey A — Reading a route plan

1. **Entry Point:** home or lord page, server running (F1 reading path).
2. **Action 1:** on the lord page, the tab strip sits directly under the sticky nav: Shared (active) + Routes I–III.
3. **System Response 1:** arrow keys or a click moves to a route tab → `#/<lord-slug>/route/<id>`; the exact page survives a reload via the hash.
4. **Action 2:** the route page renders top to bottom — identity card (bone card: official VCO title or UNRESEARCHED marker, dimmed thematic subtitle, objective and reward with badges), then the registry sections in order.
5. **System Response 2:** every declared gap appears as a Content Gap Marker where the section would sit — the page never shows a silently empty section.
6. **Action 3:** in the dashboard region, the player switches panel tabs (Army templates / Skills / Research / Settlements / Mechanics) to pull the mid-campaign reference: a template, a skill order, a research priority, a settlement role, a mechanic step.
7. **System Response 3:** each panel lists the items named by this route's `panelOrder`, each item with its structured content; items carrying a confidence state show a badge; `src` ids render as source links.
8. **Success State:** the whole route plan — identity, exact objectives, opening through victory push, and all five dashboard surfaces — reads as one coherent flow, present or explicitly gapped, with every claim's confidence state visible.

### Journey B — Content developer filling the datasets

1. **Entry Point:** edits `content/<lord-slug>/data/*.json` or route frontmatter `panelOrder`.
2. **Action 1:** fills dataset entries following the fixed schemas (§4); references sources by id from `data/sources.json`.
3. **Action 2:** runs `node tools/content-lint.mjs`.
4. **System Response:** exit 0, or `file:field — message` violations for schema breaks, dangling `src`, or `panelOrder` ids that resolve to nothing.
5. **Action 3:** reloads the site.
6. **Success State:** the new content renders in the route page's dashboard without any code change.

## 4. Logical Constraints (The "Rules of the Road")

### Dataset schemas (F1's `JsonValue` stubs become typed contracts)

- **IF** a dataset is named in `datasets[]`, **THEN** it parses against its fixed schema in `app/content/types.ts` and the lint validates it — no per-faction forks (PRD Flow 4).
- **IF** a dataset file is empty, **THEN** the empty form is a well-typed no-content document (an empty map/object per schema), renders an explicit empty state in its panel, and passes the lint.
- **Armies:** `data/armies.json` is a map of route id → map of entry id → army. An army carries: `label`, `name`, optional `supportName` (the same template expressed as the supporting army), `units[]` (`n`, `name`, `role`, `kind`), a legendary-lord column and a generic-lord column (each the same unit-row shape), optional `context`, `notes[]`, `plan` (narrative), `size`, `sources[]`, and optional `state`/`src`.
- **Skills, research, buildings, mechanics:** each `data/<name>.json` is a flat per-lord map of entry id → item. An item carries: `label`, `title`, `intro`, `steps[]` (`title`, `note`, optional `gate`, optional `short`), optional `details`, `sources[]`, and optional `state`/`src`. Per-route variants are content, not schema: a route with a different item uses a distinct entry id and lists it in its own `panelOrder`.
- **VCO objective items:** `data/vco.json` is a map of route id → ordered list of items (`id`, `text`, `state`, optional `src`). The item `id` is stable and is the id the F5 ledger will tick. Items carry a confidence state by the same rule as objective/reward claims — they are VCO claims by definition.
- **IF** a dataset item carries `state`/`src`, **THEN** the state is one of the four and every `src` id exists in that lord's `data/sources.json` (F1 rule, extended to all six datasets).

### Panel selection and order

- **IF** a route's `panelOrder` lists ids for a group, **THEN** its dashboard panel shows exactly those entries, in that order; entries in the dataset not listed are not rendered (not an error).
- **IF** a `panelOrder` id resolves to no dataset entry, **THEN** the lint fails (`file:field — message`).
- **IF** a dataset is present but its panel list is empty or absent, **THEN** the panel shows the explicit empty state, never blank space.

### Route tab strip

- **IF** the lord page or a route page renders, **THEN** the tab strip sits directly under the sticky nav and shows the Shared tab plus one tab per manifest route, in manifest order.
- **IF** a route tab is activated, **THEN** navigation is the existing hash route; the strip's active state is derived from the current hash — the hash is the single source of truth.
- **IF** the strip has focus, **THEN** Left/Right move between tabs (roving tabindex, tablist pattern) and Home/End jump to the first/last tab.
- **IF** a route has no body content, **THEN** it still gets its tab and its page renders identity + Content Gap Markers.

### Route page structure

- **IF** a route page renders, **THEN** it shows, in order: the identity card, the registry sections in their fixed registry order (present sections and gap markers interleaved at each section's position), then the dashboard region.
- **IF** a section title is declared in `gaps`, **THEN** the page renders a Content Gap Marker at that section's registry position; F1's trailing gap list is replaced by these in-flow markers.
- **IF** the identity shows a title, **THEN** the official VCO title and the guide-created subtitle remain visually distinct (official: mono uppercase eyebrow with primary dot; subtitle: dimmed proportional headline) — never interchangeable.

### Confidence Badges

- **IF** a claim renders, **THEN** its state renders as the badge: icon + mono uppercase label + state colour, with the state's container tint as the only background; colour is never the sole indicator (PRD accessibility baseline).
- **IF** the claim carries `src`, **THEN** the badge shows a source link (F3 owns the fuller source panels; F2 owns the link).
- **IF** a `::claim` callout renders inside boot-rendered section HTML, **THEN** it carries the same badge treatment as data-driven claims (same labels, colours, icons) via its existing classed markup.
- **The badge is presentational:** it renders a state value; it computes nothing.

### Icons and dependencies

- **IF** an icon is needed (check, clock, branch, flag for the four states; chevron/dot as required), **THEN** it is a hand-authored inline SVG in the design system's 1px-stroke round-join style, inheriting `currentColor`; no icon library is added and `package.json` is unchanged.

### Loading and validation

- **IF** a dataset file violates its schema, **THEN** boot fails with the F1 boot-error state naming file and field (the lint catches it pre-commit) — no partial dashboard.
- **IF** content is valid, **THEN** all F2 rendering is synchronous in-memory reads over the F1 tree (ARCHITECTURE §1.1: no per-view fetching, no new loading states).

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- **Schema-invalid dataset (bad unit row, invalid `state`, dangling `src`, unparseable JSON):** F1 boot-error state — file, field, violation; fix the file, reload. Same rules the lint enforces.
- **`panelOrder` referencing a missing entry id:** lint violation pre-commit; if it reaches boot (unlinted edit), the F1 boot-error state names the file and the offending id.
- **Unknown hash route:** unchanged F1 not-found view.

### Empty States

- **Empty dataset stub (the current committed Elspeth form):** the panel shows an explicit mono-label empty state ("no content yet" meaning), never a blank panel.
- **Route with all body sections declared gaps:** identity card + in-flow gap markers + empty-state dashboard — a meaningful page, not an empty one.
- **`vcoTitle: null`:** the identity card's official-title slot shows the explicit unresearched marker (F1 behaviour, retained).
- **Dataset present, `panelOrder` list empty/absent for that group:** explicit panel empty state.

### Boundary Cases

- **Two lords of the same faction:** unaffected — datasets are per-lord; nothing shared across lord directories.
- **A route listing a shared-dataset entry another route also lists:** both panels render it independently; the dataset is read-only.
- **An army template whose generic column is empty:** the template still renders; the generic column shows its explicit absent marker rather than a blank column.
- **A route with more than the four standard optional sections (e.g. two transitions):** unchanged F1 registry behaviour — per-section-type registry, no global cap.
- **Many `src` ids on one claim:** the badge trails them all; wrapping is a layout matter, not a content one.

### Interruptions

- **Reload or tab strip re-activation mid-reading:** stateless; the hash restores the exact page/section; dashboard panel selection resets to the first panel — nothing is stored, nothing is rolled back (no write path exists in F2).
- **Content edited while the site is open:** unchanged F1 policy — manual reload picks it up.

## 6. Interface & Interaction (The "Look and Feel")

### Visual Style

The full `.wiki/DESIGN.md` system, token-only CSS as established by F1 (`app/styles/tokens.css` + token-referencing `app.css`): monochrome chrome, orange/green as data voices only, flat weight 400 Geist with Geist Mono instrument labels, no shadows, 3/10/20px radii. F2 adds the components DESIGN.md already specifies: Route Tab Strip, Route Identity Card, Content Panel, Confidence Badge, Content Gap Marker.

### Layout

Single column, 1200px max. Under the sticky 64px nav: the route tab strip (carbon, hairline bottom border, top radius, no layout shift on state change). Route page: identity card (bone — the one bright object), sections at `stack-lg` rhythm with mono eyebrows, then the dashboard region as one block of tabbed panels (tab bar + one visible panel), panels at 24px padding, 10px radius, hairline border. The lord page keeps its shared-fundamentals prose and route list, with the tab strip added above.

### Copywriting

- **Tab labels:** "SHARED" plus the route codes I/II/III with their route titles; official VCO title dimmed beneath per DESIGN.md.
- **Unresearched marker:** explicit "unresearched" meaning (F1 copy may be retained).
- **Gap marker:** "CONTENT GAP" eyebrow + one line naming the missing section (F1 gap-list copy is the starting point, repositioned in-flow).
- **Panel empty states:** explicit mono label + one proportional sentence.
- Exact copy beyond these meanings is not contractual.

### Accessibility

Keyboard-reachable tab strip with roving tabindex and arrow/Home/End navigation; `:focus-visible` rings (2px primary, 3px offset); every badge pairs colour with label + icon; all transitions within the 0.15–0.2s band and disabled under `prefers-reduced-motion`; contrast per the DESIGN.md verified pairings. These inherit the design system and are not per-component decisions.

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] The tab strip renders on lord and route pages (Shared + I/II/III in manifest order), is hash-derived, supports click + arrow/Home/End navigation, and the exact page/section survives a reload.
- [ ] Each route page shows the Route Identity Card (official title or explicit unresearched marker, distinct dimmed subtitle, objective and reward with badges, interpretation/bottleneck/motto when present) above registry-ordered sections.
- [ ] Every declared gap renders a Content Gap Marker at its registry position; F1's trailing gap list is gone; an all-gap route renders identity + markers, never a blank page.
- [ ] The dashboard region shows five tabbed panels (Army templates, Skills, Research, Settlements, Mechanics); each panel lists exactly its route's `panelOrder` items in order, with the atlas-mirroring item anatomy (army unit rows with counts/roles/kind and legendary vs generic columns; `title`/`intro`/`steps` items with optional gates); panel selection is component-local.
- [ ] The committed Elspeth stubs are reshaped to the new typed empty form and render explicit empty states per panel, never blank space.
- [ ] Confidence Badges render all four states with icon + mono uppercase label + state colour (identical treatment for identity claims, `::claim` callouts in section prose, and dataset items); a `src`-carrying claim shows source links; badges are distinguishable with colour removed.
- [ ] `data/vco.json` follows the per-route objective-item schema (`id`, `text`, `state`, optional `src`) and renders under the route identity; no progress or campaign state of any kind is rendered.
- [ ] `content-lint` validates all six dataset schemas, `panelOrder` id resolution, and `state`/`src` vocabulary; each seeded-violation fixture (bad unit row, invalid state, dangling src, unresolvable panelOrder id, unparseable JSON) exits non-zero with a `file:field — message` line; the committed Elspeth content stays lint-clean.
- [ ] No new dependencies: `package.json` runtime/dev sets unchanged; icons are inline SVG.
- [ ] `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs`, `npm run build`, and the `npm run serve` HTTP boot check all pass, including the existing not-found and boot-error behaviours.
