# Feature: Atlas UX Re-alignment

## Open Questions

None. (Q1 — the settings-surface naming — was resolved on 2026-10-04 by its stated default when the developer accepted the design for planning: the page keeps the name "Sources & settings" with an explicit deferred line for the settings block.)

## 1. Executive Summary

**High-Level Goal:** Bring the site's layout and UX in line with the reference atlases: the three-tier sticky header (crest + brand + environment line, header-level route tabs, eight page tabs), the full 8-page per-lord information architecture, and the atlas visual system (slate/brass palette, Georgia serif headings, full-bleed wide layout) — replacing the "Factory" system the site was built against.

**Context:** The original plans deliberately treated the atlases in `.work/references/` as a content source only (PRD F4 "raw archive"; elspeth-migration excluded all atlas interactive/layout material). The delivered MVP therefore diverges completely from the atlas layout/UX, which is a product decision being reversed now by explicit request. The audit and side-by-side live in `.work/atlas-ux/ATLAS-UX-COMPARISON.md`; the decisions fixed by that review are: **scope = chrome + IA + look**, **visual system = atlas slate + brass**, **IA = full 8 pages**. This design was additionally verified against *rendered* atlases (headless-Chromium captures of the reference-desk and route-plan pages in `.pi/work/ui-inspection/`), which corrected the page-composition assumptions in the text-only audit — most importantly that the **Reference desk is the five-panel quick-reference grid itself** (route-scoped), and that the route plan carries a PURPOSE / WHAT ACTUALLY WINS / LIKELY BOTTLENECK fact row plus the "The operation in five moves" sidebar. It realizes PRD F10 (PRD amendment lands with this feature's acceptance). It depends on the delivered F1–F5, F7 code.

**Non-Goals (deferred to follow-up features):**

- Cross-guide search (F6 remains v1.1; the toolbar carries no search button until it lands).
- Reader dialog, per-block notes/ticks, the Field notes *content* (the page exists as an explicit deferred empty state).
- Interactive calculators (income/schematics/garden/faction meters) and any localStorage state — the no-localStorage policy in `main.tsx` stands; the ledger remains the only persisted state.
- Export/import of state, text-size cycle, fit-desk toggle.
- Ledger model changes: the F5 ledger (planning vs game-confirmed tracks, server persistence, optimistic writes) is retained as-is and is strictly richer than the atlas's built-in checklist.
- **Content authoring beyond extracting Elspeth's crest, environment line, and per-route `phases` summaries from the atlas (the datasets, `panelOrder`, and section registry are untouched; only the optional route-frontmatter `phases` field is added — see §4).
- Desk panel sub-tab grouping (the atlas's Early/Mid/Late/… in-panel tabs): the desk renders flat numbered lists for now; grouping is a follow-up only if the committed data carries a group field.
- The route plan's phase sub-tab strip (Overview | Opening | Early | …): sections stay a linear, anchorable list (the hash-anchor and F3/F7 surfaces depend on that); in-place phase switching is not adopted.
- **Backwards compatibility of any kind:** old hashes, old component surfaces, old README URLs. Nothing is preserved; see §4 Breaking changes.
- No new dependencies; no server changes.

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Navigation:** hash URLs only. Grammar below; every other shape stays not-found (the site never guesses).
- **Route tabs / page tabs:** mouse or arrow keys (the existing TabStrip keyboard model applies to the header route tabs).

### Hash grammar (fresh — old shapes are deliberately broken)

No user exists, so nothing is preserved. One uniform grammar: **page, optional route, optional section**.

| Hash | Page |
| --- | --- |
| `#/` | Home (multi-lord entry; slim header) |
| `#/<lord>` | Reference desk for the lord's first route in manifest order — the atlas's own default (route I pre-selected); the routebar shows the selection |
| `#/<lord>/<lord-page>` | Lord-scoped page: `sources`, `notes` |
| `#/<lord>/<route-page>/<route-id>[/<section-id>]` | Route-scoped page: `desk`, `plan`, `armies`, `settlements`, `workshop`, `ledger` — the VCO ledger's 3-segment shape fits unchanged |

Rules:

1. A `<lord-page>` segment that is not one of `sources`/`notes`, or a `<route-page>` segment that is not one of `desk`/`plan`/`armies`/`settlements`/`workshop`/`ledger`, is not-found. A route-page segment without a route id (e.g. `#/<lord>/desk`) is not-found — route pages are only meaningful with a route. Old shapes (`route/<id>`, section anchors under `route/`) are not mapped anywhere; the README's URLs are rewritten with this feature.
2. Route-scoped pages require a well-formed route id; an unknown route id renders the not-found view.
3. **Route tabs are route switches that keep the page:** from a route-scoped page the route tabs target the same page under the new route; from home, `sources`, or `notes` they target `plan/<route>`. **Page tabs from a lord-scoped page** (no route in the hash) resolve to the lord's first route in manifest order. The routebar renders the selection immediately, so the resolved route is always visible — deterministic, never a hidden guess.
4. Section anchors are valid on the `plan` page only; they scroll to the matching section H2.

### Displayed Data

- **Header (lord pages), three tiers:**
  - *Topline:* crest SVG + brand (faction uppercase / "EXPEDITION ATLAS · <lord>") linking to the reference desk; environment line with status dot (new optional `environment` string from `guide.json`) plus the existing `patch <X> · VCO <version>` pairing; toolbar (no buttons this feature — empty slot, reserved for F6/search and state export).
  - *Routebar:* "YOUR CAMPAIGN / Victory route" eyebrow pair + three route tabs (serif numeral, route name, official VCO title dimmed or UNRESEARCHED marker; SELECTED indicator from the hash).
  - *Pagenav:* the eight page tabs (Reference desk, Route plan, Armies & skills, Settlements & economy, Faction workshop, VCO ledger, Field notes, Sources & settings) + save-state line ("Offline · local progress" — accurate: the only writes go to local files via the local server).
- **Home:** unchanged card list (lord, faction, version context), restyled.
- **Reference desk (route-scoped, the atlas's landing surface):** desk toolbar — serif "Reference desk" title + caption ("essentials here, full detail one page away") + a "Compare routes" action (component-local toggle); a two-column **desk grid of all five numbered panel cards** (I Army templates, II Lord & hero skills, III Research priorities, IV Settlement builds, V Unique mechanics) in the atlas's desk-panel anatomy: Roman-numeral panel index + serif title, sub-tab row omitted (flat lists per Non-Goals), numbered item rows in `panelOrder` order (title/label line only — no checkbox, no "Read notes" — those are deferred), footer with the item count and a link to the detail page. The "Compare routes" toggle swaps the grid for the route comparison cards (number, VCO title/subtitle, objective, reward, interpretation). **Below the grid, a lord-level zone (identical across routes):** version banner (F3 surfaces, recoloured, including the open-flags chip), shared-fundamentals markdown, and the flagged-items section (anchor + chip behaviour preserved).
- **Route plan (route-scoped):** the atlas's rendered composition — page head (mono eyebrow "ROUTE <n> · <name>", serif "The campaign plan" title, one-line intro), a three-card fact row (**Purpose** = interpretation, **What actually wins** = objective + reward as badged claims, **Likely bottleneck** = bottleneck), then the two-track body: the registry sections as phase-numbered sections with transition cross-links on the left, and the **"The operation in five moves"** aside on the right (numbered cards from the new `phases` frontmatter; the aside is absent for a route without `phases`). The five-tab dashboard region leaves this page; a slim panel-navigation strip links the three detail pages and the ledger.
- **Detail pages (armies / settlements / workshop):** NEW components in the atlas's desk-panel anatomy (panel heads with Roman-numeral indices, roster rows with legendary vs generic columns, two-track layouts) — the F2 five-tab dashboard components are retired, not re-skinned. They render the full item anatomy (unit rows, steps, gates, details) per the fixed split (armies/skills/research | buildings | mechanics), fed by the same datasets and `panelOrder` selection, with Confidence Badges and explicit empty states. These are the deep views behind the desk's compact cards.
- **Sources & settings:** the lord's `data/sources.json` list (number, title, url, note); a one-line explicit "appearance settings arrive with a later feature" state stands in for the settings block.
- **Field notes:** explicit deferred empty state (label + one sentence; the project's empty-state policy, never blank space).
- **VCO ledger:** the F5 model and server contract (planning vs game-confirmed tracks, optimistic writes, lifecycle) are retained unchanged; the page is restyled to the atlas look.

### Persistent Data

- **Content model additions** (lint-covered): `guide.json` gains two optional fields — `crest` (path to an SVG file inside the lord directory) and `environment` (string, e.g. `"Normal / Normal · Smart Autoresolve · VCO · Immortal Empires"`). Both optional so other lords are not forced to adopt them; a missing crest renders the brand without one, a missing environment renders the line without it. Route frontmatter gains one optional field — `phases` (ordered list of `{title, note}` — the "operation in five moves" summary); absent ⇒ no aside.
- **Elspeth migration of chrome content:** `content/elspeth-von-draken/crest.svg` (extracted verbatim from the atlas's crest symbol), the environment string in `guide.json`, and each route's `phases` summary extracted from the atlas `phases` data.
- **Ledger, UI state:** unchanged (server-persisted ledgers; no localStorage).

## 3. The User Journey (Step-by-Step)

### Journey A — Mid-campaign reference (the atlas's core loop)

1. **Entry Point:** the player opens `#/elspeth-von-draken` (or any deep link). The reference desk renders for the first route in manifest order, route I marked SELECTED in the routebar — the atlas's own default.
2. **Action 2:** the player clicks route II in the routebar → `#/elspeth-von-draken/desk/route-2` (same page, new route — the desk is route-scoped); the routebar marks SELECTED, and every route-scoped pagenav tab targets route II.
3. **Action 3:** "Route plan" → `plan/route-2` (fact row, phase sections, five-moves aside); "Armies & skills" → `armies/route-2`; "Settlements & economy" → `settlements/route-2`; "Faction workshop" → `workshop/route-2`; "VCO ledger" → the F5 ledger page (start a campaign if none is active — existing flow).
4. **Success State:** the eight pages behave like the atlas companion — the header is the persistent context (who, what environment, which route, which page) and nothing is lost by moving between surfaces.

### Journey B — Returning to a claim to check

1. **Entry Point:** the desk's open-flags chip (existing F3 surface).
2. **Action:** click → scrolls to the flagged-items section on the desk; a "VIEW" link jumps to `plan/<id>/<section>` and the anchor scrolls.
3. **Success State:** F3's verification surfaces keep working at their new home.

## 4. Logical Constraints (The "Rules of the Road")

### Header and routing

- The shell renders **two header forms**: slim (home, not-found, boot states: wordmark + lord links) and full (every lord-scoped page: the three tiers). The full header derives every visible state from the hash + content tree — no component state.
- Route tabs and pagenav tabs follow the existing TabStrip keyboard contract (role=tablist, arrow-key navigation, Home/End) with selection derived from the hash; lord-scoped pages render no route selection.
- The save-state line is static text this feature (there is no new save signal); it must not claim autosave.

### Visual system (replaces the Factory system in `.wiki/DESIGN.md`)

- **Palette:** the atlas `:root` values, ported verbatim as hex (the token provenance rule changes: palette source is now the atlases, not the Factory reference):
  `--bg #10171c`, `--surface #172129`, `--surface2 #1d2a33`, `--surface3 #23333e`, `--ink #eeeae2`, `--muted #b4c0c6`, `--faint #859aa7`, `--line #354651`, `--accent #ddc485` (brass), `--brass #ccaa72`, `--good #adcead`, `--danger #f0aaa0`.
- **Semantic remap (existing roles → atlas values):** background = `--bg`; surface ladder = `--surface`/`--surface2`/`--surface3`; on-surface = `--ink`; muted text = `--muted`/`--faint`; outline = `--line`; **primary/warning = `--accent`** (the signal orange is gone); success = `--good`; error = `--danger`. Confidence-badge states: verified → `--good`, verify-in-campaign → `--accent`, inferred/historical → `--muted`/`--faint` (unchanged badge anatomy, recoloured).
- **Typography:** Georgia serif (system) for headings h1–h4 (400 weight), the brand, and numerals (route numerals, phase numbers, counts); "Segoe UI", Arial, system sans for body and chrome; eyebrows = 0.66rem uppercase, 1.8px tracking, weight 650, `--accent`. **No webfonts** — Geist is dropped entirely, which also removes its loading dependency.
- **Components:** cards = `linear-gradient(130deg,#1b2831,#172129)` fill, 1px `--line` border + 2px `#536472` top border, 5px radius, 22px padding; buttons per the atlas `.btn` (surface3 fill, 1px `#546775` border, 4px radius); links = `--accent`; kbd chips per the atlas.
- **Layout:** full-bleed dark canvas; `.wrap` = 100% / `max-width: 3360px` / 24px side padding (the atlas's ultrawide-friendly measure); sticky header ≈170px with backdrop blur; content grids = the atlas's `two-track` (1.65fr / 0.8fr) and 2-column `grid` where the existing pages use side-by-side composition; 16px base gap.
- `tokens.css` is regenerated from the new `DESIGN.md` frontmatter (values verbatim; the frontmatter's palette source comment is updated).

### Content model

- **Content model:** `guide.json` schema gains optional `crest` (string path, resolved inside the lord directory, must contain an `<svg` start tag) and `environment` (non-empty string when present); route frontmatter gains optional `phases` (ordered non-empty list of `{title, note}` objects). The content lint enforces all three; `content/elspeth-von-draken/` is updated in the same feature and stays lint-clean.
- The five datasets, `panelOrder`, and the section registry are untouched. The desk renders all five panels; the detail-page split (armies+skills+research / buildings / mechanics) is a **rendering** decision; it changes no data.

### Breaking changes (accepted — no user exists)

- All old hash shapes are broken on purpose; nothing is mapped for legacy. The router is rewritten to the §2 grammar in one go, not extended.
- The F2 dashboard-tab components and the old header/lord/route DOM are replaced; tests asserting them are rewritten, not preserved.
- The README's run instructions and URLs are updated in this feature.
- No test is weakened (the project's test policy): rewritten tests cover the new grammar and pages at least as strictly as the old ones covered theirs.

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- Unknown page id, unknown route id, or a malformed path → the not-found view (unchanged).
- `crest` file missing or non-SVG at boot → boot-error view naming the file and field (the existing boot contract), not a white page; the lint catches the same condition pre-run.

### Empty States

- Zero lords: home's existing empty state, restyled.
- Lord without `crest`/`environment`: brand and environment line render their reduced forms (no blank box, no placeholder art).
- Field notes page: the deferred empty state (see §2).
- A panel page for a route whose `panelOrder` lists no items in that panel: the dashboard's existing explicit empty state.

### Boundary Cases

- Deep link to a route-scoped page whose route id exists but belongs to another lord: not-found (lord resolution is unchanged).
- `desk` and the other route pages share one segment position: the page id decides the view, never the segment count; `#/<lord>/desk` (no route id) is not-found.
- A section id under a non-plan page (e.g. `#/lord/armies/route-1/anything`): not-found — anchors are a plan-page concept.
- A route without `phases` renders the plan's two-track with an empty aside column collapsed (the left track takes full width) — never an empty card.
- Arrow-key tab navigation across the pagenav never leaves the tablist (existing TabStrip behaviour).

### Interruptions

- Mid-navigation reload: the hash fully restores the page (every visible state is hash-derived).

## 6. Interface & Interaction (The "Look and Feel")

### Visual Style

The atlas look, per §4: dark slate canvas, brass as the single chromatic accent, serif authority in headings and numerals, 1px hairlines + 2px card top borders, 5px radii, no shadow dependency. The site keeps only the Factory system's structural discipline (token-first CSS, no magic values in components).

### Layout

- Header: sticky, three tiers (topline 58px / routebar / pagenav 44px), `.wrap` content.
- Reference desk: version banner block → route comparison (3-column on wide, stacked on narrow) → shared fundamentals (prose) → flagged items.
- Route plan: identity card → sections → panel-navigation strip (four links: the three panel pages + VCO ledger).
- Panel pages: desk-toolbar (page title + context line "ROUTE <n> · <name>") → panel tabs (armies page only) → panel body.
- Responsive: below ~900px the route tabs and pagenav tabs scroll horizontally; grids stack. (The atlas targets wide desktops; the site keeps the delivered responsive policy.)

### Copywriting

Page names mirror the atlases: Reference desk, Route plan, Armies & skills, Settlements & economy, Faction workshop, VCO ledger, Field notes, Sources & settings. The save-state line reads "Saved locally · offline" (the atlas's rendered string). Deferred surfaces say what they are ("Notes arrive with a later feature") — never a blank region.

### Accessibility

Route/page tablists keep the F2 keyboard contract; the crest is decorative (aria-hidden); the environment line is plain text; the open-flags chip keeps its skip-link focus idiom; contrast checked against the new palette (brass-on-slate ≥ 4.5:1 for text uses; `--faint` used only for non-essential dimming as today).

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] The hash grammar in §2 routes exactly as specified; unknown page ids, unknown route ids, route pages without a route id, and old shapes (including the former `route/<id>` grammar) all render not-found.
- [ ] Every lord-scoped or route-scoped page renders the full three-tier header with crest, brand, environment line, three route tabs, and eight page tabs; route and page selection are hash-derived and survive reload.
- [ ] `#/<lord>` renders the reference desk for the first manifest route with that route selected in the routebar; route tabs keep the current route-page when switching routes; page tabs from a lord-scoped page resolve to the first manifest route.
- [ ] The reference desk renders the desk toolbar with a working "Compare routes" toggle, the five numbered panel cards (I–V) with `panelOrder`-ordered flat item lists and count footers, and below the grid the version banner (with working flags chip/anchor), shared fundamentals, and the flagged-items section.
- [ ] The route plan renders the page head, the PURPOSE / WHAT ACTUALLY WINS / LIKELY BOTTLENECK fact row, phase-numbered sections + transitions, and the "operation in five moves" aside from `phases` (absent for a route without `phases`); its panel-navigation strip links the three detail pages and the ledger; section anchors and F3 badges/callouts work.
- [ ] The three detail pages render exactly their §2 panel sets in the atlas's desk-panel anatomy with full item anatomy, `panelOrder` selection, badges, and explicit empty states; the F2 dashboard-tab components are gone from the codebase.
- [ ] Sources & settings lists every `sources.json` entry; Field notes shows the deferred empty state; the VCO ledger keeps its full F5 behaviour (tracks, optimistic writes, lifecycle, start flow pointing at the new `ledger` hash) and is restyled to the atlas look.
- [ ] `guide.json` `crest`/`environment` and route `phases` are optional, lint-validated, and rendered (or cleanly absent) per §4; Elspeth carries its crest, environment, and per-route `phases` extracted from the atlas.
- [ ] The visual system matches §4: tokens regenerated from the updated `DESIGN.md` frontmatter, no Factory palette/typography remnants in `app.css`, no webfont loads.
- [ ] Keyboard navigation, focus-visible states, reduced-motion, and the pre-delivery checklist items in `DESIGN.md` pass on the new surfaces.
- [ ] `npx tsc --noEmit`, `npm test`, `npm run lint:content`, and `npm run build` all pass; the README documents the new hash grammar and URLs.
- [ ] PRD carries the F10 entry and the `DESIGN.md` rewrite are committed with the feature's acceptance (governance docs updated at close-out, per the project's reconciliation process).
