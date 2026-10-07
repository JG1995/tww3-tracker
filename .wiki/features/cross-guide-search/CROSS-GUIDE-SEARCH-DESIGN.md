# Feature: Cross-Guide Search (F6)

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** One site-wide search over all migrated guides, opened from any page, returning grouped, keyboard-navigable hits that deep-link into each guide's content — so a topic can be compared across factions without scrolling whole atlases.

**Context:** PRD F6 (Should, v1.1): search over all guide content (sections, units, tech, buildings, mechanics) with results grouped by faction/route, usable by keyboard; meaningful only with ≥ 2 migrated guides, and three are committed (Elspeth von Draken, Alith Anar, Zhao Ming). It consumes the immutable `ContentTree` built once at boot (`app/content/load.ts`) and the pure query layer (`app/content/query.ts`), where ARCHITECTURE.md pre-allocates the search ("naive tokenized matching in `query.ts`; MiniSearch is the named upgrade inside the same file"). It lands in the atlas header's reserved toolbar slot (F10 left it empty "until F6/search and state export") and adds a search control to the slim home header. Every landing target already exists: plan section anchors, the `armies`/`settlements`/`workshop` detail pages, the `sources` lord page, the reference desk's shared-fundamentals zone, and the plan's VCO-objective undercard. The design-system contract is the "Search Field & Results" section of `.wiki/DESIGN.md` (fixed in v1.0 precisely so this feature could fill the slot).

**Non-Goals:**

- Fuzzy or typo-tolerant matching; matching is naive tokenized case-insensitive search (MiniSearch remains the named future upgrade inside `query.ts`, not part of this feature).
- Per-faction, per-route, or per-group filters, search history, saved queries, or any persisted search state — the no-localStorage policy stands; search text is component-local and ephemeral.
- Searching ledger/campaign data: ledgers are user state, not guide content, and stay out of the corpus.
- Any new page or hash-grammar change — the eight-page IA and router grammar are untouched; search is a dialog, not a destination.
- Any content-schema, dataset, or content-lint change; search indexes the existing rendered corpus only.
- State export and any other toolbar tenant; the reserved slot gains exactly the search control.

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Search query:** free text, case-insensitive. Empty (or whitespace-only) renders the hint line, never a blank list. Match semantics: naive tokenized matching — the query's tokens must each occur in the indexed text of an entry (word-boundary, case-folded); exact-phrase behaviour is an implementation detail owned by the plan, not a contractual promise.
- **Opening the dialog:** the search control in the full header toolbar, the search control in the slim home header, or the global `/` shortcut (inactive while the user is typing in any input/textarea/contenteditable, and while another modal is open).
- **Navigating results:** ArrowUp/ArrowDown move the selection through the (grouped) result list; Enter opens the selected hit; Escape closes the dialog.
- **Closing the dialog:** Escape, clicking the dialog backdrop outside its panel, or the established dialog close mechanics. Closing always restores focus to the element that opened the dialog.

### Displayed Data

- **Result hit:** matched content from one guide — for prose (route sections, shared fundamentals) a short context snippet with the matched text in `on-surface` against `on-surface-variant` surroundings; for structured entries (army, skill, research, building, mechanic, VCO objective, source) the entry's title. Above each hit: the mono breadcrumb `faction / route / section` (or the panel/source equivalent). Route is omitted from the breadcrumb where the entry is lord-wide (shared fundamentals, sources).
- **Grouping and count:** results are grouped by faction, then by route within a faction (PRD F6), in manifest order; a count line reports the number of matches, and the list is capped at 30 results with the count made explicit (the `30+` convention from the reference atlases).
- **Corpus (what is searched, per guide):** all rendered guide content — route plan sections (including their in-section callout text), shared fundamentals (`shared.md`), army templates per route (name, unit rows, notes), skills, research, buildings, mechanics, VCO objective items, and source entries (title, note). Content-gap markers and confidence-state labels are not separate entries; the confidence states themselves are data on indexed entries, not a searchable field.

### Persistent Data

- **None.** The system must NOT persist the query, selection, or any search state: search text and dialog state are component-local and die with the dialog (ARCHITECTURE readability rule 2 names "search text" as component-local state). No localStorage, no server writes, no hash change on open. The only URL effect is choosing a result, which performs an ordinary hash navigation to the landing target.

## 3. The User Journey (Step-by-Step)

### Journey A — Compare a topic across factions

1. **Entry Point:** the player is on any page — home, the reference desk, or any lord/route page.
2. **Action 1:** press `/` (outside an input) or click the search control (full header toolbar, or the slim home header control).
3. **System Response 1:** the search dialog opens above the page, focus moved to the empty search field, the page beneath unchanged; the field shows its placeholder, and the hint line states what can be searched (a unit, skill, building, mechanic, or objective).
4. **Action 2:** type a term that occurs in more than one guide (e.g. a shared concept or a named unit that appears in several armies).
5. **System Response 2:** matching hits render live as a grouped list — factions in manifest order, routes within each faction — each hit carrying its faction/route/section breadcrumb, its category, and the match highlighted in its context; the count line shows how many matches were found (capped at 30).
6. **Action 3:** ArrowDown to a hit in another faction, Enter.
7. **System Response 3:** the dialog closes and the site navigates to that hit's landing target (§4), the page renders with the relevant content in view, focus lands in the page content — the player is now inside the other guide at the exact place.
8. **Success State:** the same topic has been compared across guides in a few keystrokes, and the player can search again from the new guide without losing their place in the hash history.

### Journey B — No match, then a shorter query

1. **Entry Point:** the dialog is open on any page.
2. **Action 1:** type a phrase that matches nothing.
3. **System Response 1:** the list shows the explicit no-match text with a hint to try a shorter phrase — never a blank region.
4. **Action 2:** shorten the query until matches appear; Escape at any point.
5. **Success State:** hits re-render live as the query changes; Escape closes the dialog, restores focus to the opener, and leaves the hash exactly as it was.

## 4. Logical Constraints (The "Rules of the Road")

### Corpus and matching

- **IF** the query is empty or whitespace-only, **THEN** the list area shows the hint line and no hits.
- **IF** a query token set matches an entry's indexed text, **THEN** that entry is a hit — case-folded, word-token matching over all corpus families in §2; no ranking guarantees beyond group/manifest order, and the list caps at 30 with the total count made explicit.
- **IF** zero lords exist in the tree, **THEN** no search control renders anywhere (home's existing zero-guide empty state governs).
- **IF** a search occurs while standing inside one lord's pages, **THEN** hits from every migrated guide are returned, each labelled with its own faction breadcrumb — search is cross-guide from everywhere, never implicitly scoped to the current guide.

### Results and landing targets

- **IF** a result is chosen, **THEN** the dialog closes and the hash navigates to exactly one existing landing target — no new hash shapes are introduced:
  - route plan section → `#/<lord>/plan/<route>/<section-id>` (the existing anchor-scroll behaviour);
  - shared fundamentals → `#/<lord>` (reference desk, shared-fundamentals zone);
  - army template / skill / research entry → `#/<lord>/armies/<route>`;
  - building entry → `#/<lord>/settlements/<route>`;
  - mechanic entry → `#/<lord>/workshop/<route>`;
  - VCO objective item → `#/<lord>/plan/<route>` (the VCO-objective undercard);
  - source entry → `#/<lord>/sources`.
- **IF** a hit's landing surface does not render the hit's own entry (e.g. a dataset item whose `panelOrder` excludes it on that route), **THEN** the navigation still lands on that route's page — the page's explicit empty state is the honest outcome, and the planner decides whether such entries stay in the corpus; either way the navigation never 404s.
- Matched text is rendered as plain text in the result list — guide markdown is never re-parsed as HTML inside a hit, so content cannot inject markup through search results.

### Keyboard and focus (contractual — the DESIGN.md accessibility checklist)

- **IF** `/` is pressed while no input/textarea/contenteditable is focused and no modal is open, **THEN** the search dialog opens with focus in the field; **IF** the same key is pressed while typing, **THEN** it types.
- **IF** the dialog is open, **THEN** focus is trapped inside it; ArrowUp/ArrowDown move the selection across the grouped list (wrapping at the ends), Enter opens the selected hit, and Escape closes it.
- **IF** the dialog closes by any means, **THEN** focus returns to the element that opened it.
- Every control in the dialog is keyboard-reachable with a visible `:focus-visible` ring; no state is conveyed by colour alone.

### Availability

- The search control renders in the full header's reserved toolbar slot on every lord- and route-scoped page, and as a control in the slim home header (a deliberate, recorded deviation from the slim header's "wordmark and lord links" spec — home is the natural cross-faction entry point). The `/` shortcut works on every page regardless of which control is visible.

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- Search has no I/O and no server path: there is no per-query failure mode. A corrupt content file fails at boot under the existing boot-error contract (search is unreachable while the boot error is showing), never mid-query.

### Empty States

- **Zero lords:** no search control on any page; home renders its existing "NO GUIDES YET" empty state.
- **Empty query:** the hint line — what can be searched (a unit, named skill, building, mechanic, or objective) — in the list area; never blank space.
- **No matches:** explicit no-match text with the shorten-the-phrase hint (meaning per the reference-atlas voice; exact copy not contractual).
- **Over-cap match count:** the list shows at most 30 hits and the count line makes the truncation explicit (e.g. the `30+` convention).

### Boundary Cases

- A hit that spans a section's callout text lands on the enclosing section's anchor — callouts do not produce separate results.
- The same title appearing in several families (army, skill, mechanic, …) or several routes yields one hit per distinct entry, each with its own breadcrumb — grouping, not the hit's styling, disambiguates.
- Querying while the dialog is open over a not-found or boot page: the dialog opens from `/` on home and all lord/route pages per §4; on not-found/boot pages the page itself governs and no search control is required.
- Whitespace and punctuation-only queries behave as empty (hint line).

### Interruptions

- **Closing the dialog:** the hash is untouched until a result is chosen; the underlying page renders exactly as before; focus returns to the opener.
- **Reload with the dialog open:** the dialog is transient — reload restores the page from the hash exactly as today, with an empty (closed) search state.
- **Opening the dialog from a link or tab and closing it:** the opener retains focus and its selection state; the TabStrip roving tabindex is undisturbed.

## 6. Interface & Interaction (The "Look and Feel")

### Visual Style

The atlas system, per the "Search Field & Results" component spec in `.wiki/DESIGN.md` (fixed in v1.0 for this feature): the field is the nav variant — carbon well, 1px `outline` border, 3px radius, mono placeholder; the result list is a panel list with 1px hairline row dividers and `stack-sm` row padding; hit text `body-md` with the matched text in `on-surface` against `on-surface-variant` surroundings; breadcrumbs `label-sm` mono. All values come from the existing token set — no new tokens, no new radii, no chromatic fills.

### Layout

- **Dialog:** a modal dialog (focus-trapped, Escape-dismissing, backdrop-click-closing) centred above the page, holding the field at top, the count line, and the grouped result list (faction headers, then route-labelled hits within). The dialog follows the design system's modal behaviour and z-index scale.
- **Full header:** the reserved toolbar slot (`topline__tools`) gains the search control — a compact field or field-opening affordance that fits the topline's remaining height; the slot's other reserved tenant (state export) stays absent.
- **Slim home header:** gains the same search control; the wordmark and lord links keep their positions.
- **Result row:** breadcrumb line above, category label, hit title/snippet with the highlighted match — the reference-atlas `category eyebrow + title` anatomy, restyled to this site's tokens.

### Copywriting

- **Placeholder / hint:** semantic intent — say what can be searched ("a unit, named skill, building, mechanic or objective"); the reference atlas's rendered strings are the voice reference, exact copy not contractual.
- **Count line:** state how many references matched and that the list is capped when truncated.
- **No-match:** state that nothing matched and suggest a shorter phrase.
- Breadcrumbs use the guide's rendered faction name, the route's number/name, and the section or panel name — the same strings the pages already render, not new labels.

### Accessibility

Contractual, per the DESIGN.md pre-delivery checklist: open with `/`, navigate with arrows, open with Enter, close with Escape; focus trapped while open and restored on close; visible `:focus-visible` rings; colour never the sole indicator (matched text is positionally identifiable, not only coloured); `prefers-reduced-motion: reduce` disables any dialog open/close transition.

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [x] The search control is visible and opens the dialog on home (slim header) and on every lord- and route-scoped page (full header toolbar); `/` opens the dialog on any of those pages while not typing.
- [x] A query matching content in two or more migrated guides returns hits from all of them, grouped by faction then route with a faction/route/section breadcrumb per hit and the matched text highlighted in context; the count line reports the total and caps the list at 30 with the truncation made explicit.
- [x] Every result kind lands on its §4 target: section hits scroll to the plan section anchor; army/skill/research hits open `armies/<route>`; buildings open `settlements/<route>`; mechanics open `workshop/<route>`; VCO objectives open `plan/<route>`; shared hits open the reference desk; source hits open `sources`; no new hash shape is introduced and no navigation 404s.
- [x] The full keyboard loop works: `/` → type → ArrowUp/ArrowDown (wrapping, grouped) → Enter → land with focus in the page; Escape closes at any point and restores focus to the opener; focus is trapped while the dialog is open; every control shows a visible focus ring.
- [x] Empty/whitespace queries show the hint line; non-matching queries show the explicit no-match text; a tree with zero lords renders no search control and home's existing empty state.
- [x] Matching runs as pure function(s) in `app/content/query.ts` over the loaded `ContentTree` — no I/O, no mutation, DOM-free — covered by `node --test` against the committed three-guide corpus and the test fixtures (hits across guides, breadcrumb data, grouping order, the 30-cap), completing in well under 100 ms over the committed corpus.
- [x] No new dependency appears in `package.json`; no content schema, dataset, lint rule, router grammar, or ledger behaviour changes; search text and dialog state persist nowhere.
- [x] `npx tsc --noEmit`, `npm test`, `npm run lint:content`, and `npm run build` all pass, and the search dialog meets the DESIGN.md pre-delivery checklist (visual quality, interaction, accessibility, z-index scale).
