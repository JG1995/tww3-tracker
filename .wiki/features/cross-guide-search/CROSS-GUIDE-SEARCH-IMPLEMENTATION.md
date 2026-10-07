# Cross-Guide Search (F6)

**Design:** [Cross-guide search design](CROSS-GUIDE-SEARCH-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Add the PRD F6 capability: one site-wide search over every migrated guide's rendered content, opened from the reserved header toolbar slot, the slim home header, or the `/` shortcut, returning grouped, keyboard-navigable, deep-linking hits over the immutable boot tree. The sibling DESIGN owns requirements and acceptance criteria (§§2–7). Execution requires independent plan review, developer acceptance of the delivery graph, committed tracked authority, and explicit delivery authorization. Planning grants no execution or Git authority. `Accepted` denotes the accepted feature intent, not acceptance of this provisional delivery graph.

## User-visible behavior

- A search trigger renders in the full header's reserved toolbar slot on every lord- and route-scoped page and in the slim home header; `/` opens the same dialog from any of those pages while not typing.
- The dialog is a focus-trapped modal: field at top, count line, then hits grouped by faction (manifest order) and route within a faction — each hit carrying its mono breadcrumb, category eyebrow, and the matched text highlighted in a plain-text snippet; lord-wide hits (shared fundamentals, sources) follow that faction's route hits.
- ArrowUp/ArrowDown (wrapping) move the selection, Enter navigates to the hit's existing landing target (plan section anchor, `armies`/`settlements`/`workshop` detail pages, `plan` undercard, reference desk, or `sources`), Escape or backdrop closes and restores focus to the opener.
- Empty/whitespace queries show the hint line, non-matching queries the explicit no-match text, zero-lord trees render no search control anywhere.
- No search state persists; the hash changes only when a result is chosen.

## Invariants

- Matching is a pure, DOM-free, I/O-free function over the immutable `ContentTree` in `app/content/query.ts` (the ARCHITECTURE's named home; MiniSearch remains the future upgrade inside the same file) — no new dependency in `package.json`, no `node_modules` change.
- The router grammar, the eight-page IA, the content schema, the lint, the datasets, and ledger behaviour do not change; every hit lands on an existing hash shape and no navigation 404s.
- Search text, selection, and dialog state are component-local and ephemeral (ARCHITECTURE rule 2); no localStorage, no server writes, no hash change on open.
- Matched text renders as plain text nodes (the corpus text is tag-stripped at index time) — guide markdown/HTML is never re-parsed or injected through a hit.
- The zero-DOM test seam holds: every new view/component logic ships as a plain `.ts` module with a pure exported builder/decision function that `node --test` flattens or calls directly; `app/main.tsx` stays the only JSX module and stays out of `node --test`.
- Every integrated prefix passes the four local gates: `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs`, `npm run build`.
- During delivery only the coordinator writes DESIGN, IMPLEMENTATION, TODO, BACKLOG, ADRs, and recovery records. Workers report discoveries rather than editing those owners.

## Non-goals

No fuzzy/typo-tolerant matching, no per-faction/route/group filters, no search history or persisted queries, no ledger/campaign data in the corpus, no new page or hash shape, no content-schema/lint/dataset change, no state export or other toolbar tenant, no ADR (the feature follows the pre-allocated architecture).

## Current-state map

- Planning checkout: `main` at `52a8617` (post-alith-zhao-migration), empty Git index. `.wiki` is tracked in Git; the cross-guide-search DESIGN is present but untracked and must be committed with this ledger by an authorized actor after acceptance. Publication provider: GitHub, origin `git@github.com:JG1995/tww3-tracker.git`, default branch `main`; PR #1 (`alith-zhao-migration`) merged via merge commit `9f3a539`. No CI workflow exists; `.github/pull_request_template.md` exists and is tracked.
- Relevant components: `app/content/types.ts` (immutable `ContentTree`/`Lord`/`Route`/`Section`/dataset types), `app/content/load.ts` (boot build; sections and `shared.md` render to HTML once via markdown-it, including `::claim` callouts rendered into `Section.html` as `<aside class="claim …">`), `app/content/query.ts` (pure query functions — the search's named home), `app/components/atlasHeader.ts` (slim + full three-tier header; `topline__tools` is an empty reserved slot, line 235; slim form = wordmark + lord links), `app/main.tsx` (shell: boot, `AtlasHeader` mount, section-anchor scroll effect, `#main` region with `tabIndex={-1}` — the only JSX file), views in `app/views/` (plain `h()` modules), all styling in `app/styles/app.css` with the token set in `app/styles/tokens.css` (`--surface`, `--line`, `--accent`, `--brass`, `--ink`, `--text-*`, `--gap-*`, `--kbd-*` …).
- Data model: the search indexes the existing immutable tree only — `Section.html` and `Lord.sharedHtml` (the only two HTML-stored families, tag-stripped at index time) plus the plain-string dataset fields (armies, the four item datasets, VCO items, sources). Landing targets all exist: plan H2s carry `id={section.id}` and the shell scrolls `route.sectionId` into view; `#/<lord>/armies|settlements|workshop/<route>`, `#/<lord>/plan/<route>` (VCO undercard), `#/<lord>` (desk, shared-fundamentals zone), `#/<lord>/sources`.
- Persistence and migrations: none — no localStorage (the ARCHITECTURE policy), no server writes, no schema or data migration; search state is component-local and transient.
- Existing behavioral assumptions: `autoresolve`, `garrison`, `income` each occur in all three committed guides (verified by case-insensitive content grep — cross-guide proof candidates); the reserved toolbar slot and the `kbd` chip treatment already exist; no `dialog` usage exists in `app/` yet (this feature introduces the site's first modal, governed by DESIGN.md's "modals trap focus and dismiss on Escape"); the zero-lord header renders the empty slot and the wordmark/lord-link slim form exactly as today.
- Architectural seams: the pure-function query layer (`node --test` calls it directly over `content/` and `test/fixtures/content` — two fixture guides, `als-rhyn-of-lorek` and `second-lord` — through the same `loadContentTree` fs-reader pass, with broken variants made on temp copies); the zero-DOM view seam (`test/views.test.ts`/`test/components.test.ts` flatten VNodes via a local helper); the `tabNav`/`panelTabNav` pure decision-function pattern; the `AtlasHeaderMarkup`/`ArmiesMarkup` pure-builder + mounted-wrapper seam; the reference atlases' native-`<dialog>` search (30-cap + `30+` count convention, `lastFocus` restore on `close` with an `isConnected` guard, `/` guarded by `input,textarea,[contenteditable]` + no open dialog); DESIGN.md "Search Field & Results" (carbon well field, hairline rows, `label-sm` mono breadcrumb, `/`-arrows-Enter-Escape, debounced input, explicit empty states).
- Project validation commands: `npm test` (`node --test`), `npx tsc --noEmit`, `npm run lint:content` (`node tools/content-lint.mjs`), `npm run build` (`vite build`); manual evidence via `npm run build` + `npm run serve` with a rendered capture (the F10 convention).
- Primary risks: no committed single term is yet verified to match ≥ 31 entries for the 30-cap test (fallback: seeded temp fixture copy); tag-stripped snippets may show HTML entities (e.g. `&amp;`) verbatim — accepted naivety; the native-dialog focus trap and the input debounce live in browser-only wrapper effects, so their proof is manual-boot evidence, not `node --test`.

## Feature architecture

- **Query layer (`app/content/query.ts`):** owns the whole search contract — index construction, matching, snippet/occurrence extraction, hit assembly, and the per-kind landing-target href. Pure over `ContentTree`; no new module (the MiniSearch upgrade must stay possible inside this file).
- **Dialog component (`app/components/search.ts`, new):** owns the dialog surface and its component-local state (query text, selection, debounce, `/` shortcut, focus save/restore) with the zero-DOM seam: pure `SearchDialogMarkup` builder + pure `searchHitNav` decision + mounted `SearchDialog` wrapper (the only part touching `document`/`<dialog>`).
- **Header (`app/components/atlasHeader.ts`):** gains one optional `onOpenSearch` callback prop; both header forms render the trigger only when the prop is supplied (absence = zero-lord/hidden states, and the shell's page-scoping decision).
- **Shell (`app/main.tsx`):** owns the dialog's `open` boolean (the shell renders both trigger and dialog), decides availability (`boot ready` + ≥ 1 lord), scopes which header form shows the control (home + full-form members), and performs the result navigation (close + `window.location.hash = hit.href`).
- **Styles (`app/styles/app.css`):** dialog/field/list/highlight styles ship with the dialog commit; trigger styles ship with the header commit; existing tokens only.

## Uncertainty register

### Known

- `autoresolve`, `garrison`, `income` each occur in all three committed guides (verified by case-insensitive content grep).
- The reserved toolbar slot (`topline__tools`) and the `kbd` chip treatment already exist; the slim header is wordmark + lord links.
- `Section.html` includes rendered callout text (markdown-it block rule), so section hits cover callouts without a separate corpus family; `sharedHtml` is the only other HTML-stored family.
- No `dialog` usage exists in `app/` yet — this feature introduces the site's first modal; DESIGN.md's accessibility checklist ("modals trap focus and dismiss on Escape") is the governing contract.

### Assumptions

- Left-word-boundary prefix token matching satisfies the DESIGN's "word-boundary, case-folded" contract (the DESIGN defers exact match mechanics to the plan): a query token matches an entry token when the case-folded entry token starts with the query token; every query token must match at least one entry token (AND). "draf" finds "Dragonsdrum"; "auto" finds "autoresolve".
- The browser's native `<dialog>` modal (showModal/close) provides the focus trap, backdrop, and Escape behaviour; the wrapper adds focus save/restore around it (the reference atlases' `lastFocus` pattern with an `isConnected` guard).
- A ~150 ms debounce over the sub-100 ms synchronous search is the DESIGN's "debounced input" without user-visible lag; the exact value is an implementation detail.
- Snippets are tag-stripped text; HTML entities may render verbatim (`&amp;` for `&`) — accepted naivety for v1.1, never a correctness or injection issue because hits are plain text nodes.

### Decisions

- One PR, four serial packages: the query layer is independently mergeable but does not justify a second boundary (solo workflow, long commit lists preferred); all packages are serial because the dialog and header commits share `app.css`/`test/components.test.ts` scope (no same-wave overlap) and the shell commit integrates both.
- The shell owns the dialog `open` boolean: both trigger sites and the `/` shortcut must open one dialog, and the shell renders all three surfaces; this is component-local to the shell, not a state library or a global store.
- The dialog mounts (and `/` works) on every page while boot is ready with ≥ 1 lord, including not-found; the visible control scopes to the home slim header and the full header per the DESIGN.
- Within a faction, route-scoped entries precede lord-wide entries (shared fundamentals, then sources); groups and routes keep manifest order; no re-sorting.
- Category labels reuse the strings the pages already render: "Route plan" (sections), "Shared fundamentals", "Army templates", "Lord & hero skills", "Research priorities", "Settlement builds", "Unique mechanics", "VCO objective", "Sources"; the breadcrumb is `faction / route / section-or-category` with route omitted for lord-wide hits, per DESIGN §2.
- `app.css` regions split per commit (dialog styles with the dialog commit, trigger styles with the header commit) — serial waves make the shared file safe.
- The header trigger is a ghost-style button labelled "Search" with a `<kbd>/</kbd>` chip (the existing kbd treatment), the quietest form consistent with the topline.
- The corpus retains dataset entries even when a route's `panelOrder` excludes them (the DESIGN §4 "planner decides" option, resolved): a hit may land on a route page that renders the entry's explicit empty state instead of the entry itself — the honest outcome, and the navigation never 404s.

### Unknowns

- Whether a single committed-corpus term matches ≥ 31 entries (needed to prove the 30-cap without fabricating data). The worker verifies at execution; the fallback is a seeded temp copy of the fixture corpus (the established temp-variant pattern).

### Risks

- Focus-restore and focus-trap edges (opener unmounted; nested focus moves) are browser-only: the `isConnected` guard and the manual-boot evidence are the protections.
- Debounce timing is untestable under `node --test` (hook effect): the markup contract tests cover every observable the debounce feeds, and manual boot covers the timing feel.
- The zero-lord path has no committed corpus to boot: it is proven by the header suite (prop absent → no control), the shell condition, and code reading, not a live zero-guide boot.

## Walking skeleton

The four packages in order; after Commit 4 the thinnest path is live end-to-end: on home, press `/`, type `garrison`, read grouped cross-guide hits (three factions), ArrowDown into another guide, Enter, and land on that guide's plan section with the H2 in view.

## Delivery plan

**Commit packages:** 4

### PR `cross-guide-search` — Add cross-guide search

**Status:** Planned

**Depends on:** []

**PR ref:** Not published

**Merge ref:** Not merged

**Branch:** `feat/cross-guide-search`

**Base branch:** `main`

**Publication provider:** GitHub

**PR template:** .github/pull_request_template.md

**Merge method:** merge

**Required checks:** Local gates `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs`, `npm run build`, plus the Final validation HTTP/rendered-capture evidence. No CI workflow or provider-required check names exist; verify live checks, review rules, and exact-head approval through the publication skill before merge (PR #1 precedent: merge commit to `main`).

**Feature close-out:** Not run

**Provisional PR title:** `feat(search): add cross-guide search`

**Purpose:** The whole feature lands through one boundary: the pure query-layer search, the dialog component, the header triggers, and the shell wiring. `main` stays green at every ordered atomic prefix — Commits 1–3 are dead-but-compiling seams a reviewer can test and revert independently, and Commit 4 turns the feature on. No intermediate seam (no consumer of the query layer exists until the dialog; no dialog until the wiring) justifies a second merge boundary.

#### Package `search-query-layer` — Commit 1: The tokenized cross-guide search contract in the query layer

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** ["app/content/query.ts", "test/search.test.ts"]

**Provisional commit:** `feat(content): add tokenized cross-guide search to the query layer`

**Work:** The complete pure search contract in the query layer: index construction over the `ContentTree`, tokenized matching, snippet/occurrence extraction, and hit assembly with landing-target hrefs — plus the contract test suite.

**Atomicity:** One coupled outcome: the searchable corpus, the match rule, and the hit shape are one contract — the tests exercise all three through the public function, and splitting index from matcher would leave two fragments of a single unverifiable interface. The coupled proof is the new `test/search.test.ts` over the committed three-guide corpus and the fixture corpus. Estimated 230–280 changed non-test lines in `query.ts` (index builder, match + snippet, hit/href assembly, types) — slightly over the soft 200 target because the corpus walk and the matching/snippet logic are one reviewable contract; no second coherent split exists.

**Out of scope:** The dialog component, header triggers, shell wiring, styles, and every consumer of the new exports; no router, lint, content, or dataset change. The exports compile unused until Commit 2 (trunk-safe by the dead-seam precedent of the F10 landed-dormant views).

**Implementation packet:**

Corpus and order. `buildSearchIndex(tree): readonly SearchIndexEntry[]` walks lords in manifest (`index.json`) order; within a lord, routes in manifest order, each contributing in family order: route plan sections (text = tag-stripped `Section.html` — callouts render into that HTML, so they are covered; title = section title), army templates of `armies[route.id]` (ALL plain-string rendered fields of the entry — label, name, supportName, the unit/legendary/generic rows' names, roles, and kinds, size, context, notes + plan TitleBodies; title = army name), the lord-wide flat item datasets `skills`/`research`/`buildings`/`mechanics` in dataset order (label, title, intro, step title/note/gate/short, details TitleBodies; title = item title), and VCO items of `vco[route.id]` (id + text; title = item id + text lead-in). After the routes, lord-wide entries: shared fundamentals (tag-stripped `sharedHtml`, title = "Shared fundamentals") and source entries (title + note; title = source title). `panelOrder`-excluded entries stay in the corpus (recorded decision). Index order is hit order: stable, never re-sorted. The index entry type (exported) is `{ kind, lordSlug, routeId: string | null, title, text }` where `kind` is the nine-value closed union `"section" | "shared" | "army" | "skill" | "research" | "building" | "mechanic" | "vco" | "source"`.

Matching. `searchContent(tree, query): SearchResults` with `SearchResults = { readonly total: number; readonly hits: readonly SearchHit[] }`. Case-fold with `toLowerCase()`; tokenize query and the entry's `title + " " + text` (joined — a title-only query hits) on non-alphanumerics; drop empties. A query with no tokens (empty, whitespace, punctuation-only) returns `{ total: 0, hits: [] }`. An entry matches when every query token matches at least one entry token by left-word-boundary prefix (case-folded entry token `startsWith` query token). No ranking: hits keep index order. `total` counts all matches; `hits` is the first 30.

Hits. `SearchHit` (exported): `{ kind, lordSlug, faction, routeId: string | null, routeLabel: string | null, category, title, snippet, occurrences, href }`. `faction` is `lord.guide.faction`; `routeLabel` is `` `${route.number} · ${route.name}` `` for route-scoped kinds and `null` otherwise. `category` is the fixed label per kind: "Route plan" / "Shared fundamentals" / "Army templates" / "Lord & hero skills" / "Research priorities" / "Settlement builds" / "Unique mechanics" / "VCO objective" / "Sources". `snippet` is plain text (≤ ~200 chars) windowed around the first case-insensitive occurrence of the first query token in the entry text, widened to token boundaries and clamped at the text edges; for structured entries the window comes from the same joined text. `occurrences` is every non-overlapping left-boundary match range of any query token inside the snippet, as `{ start, end }` pairs relative to `snippet` — the view renders text nodes around them, never HTML. `href` is the DESIGN §4 landing target per kind: section → `#/<lord>/plan/<route>/<section-id>`; shared → `#/<lord>`; army/skill/research → `#/<lord>/armies/<route>`; building → `#/<lord>/settlements/<route>`; mechanic → `#/<lord>/workshop/<route>`; vco → `#/<lord>/plan/<route>`; source → `#/<lord>/sources`. Tag stripping is `text.replace(/<[^>]*>/g, " ")` — no entity decoding (recorded naivety).

**Files and responsibilities:** `app/content/query.ts` — the exports above alongside the existing query functions (module doc comment updated to name the search); `test/search.test.ts` (new) — the contract suite using the established `fsReader` + `loadContentTree` pass over the committed `content/` and over `test/fixtures/content`.

**Tests and proof:** `test/search.test.ts` proves, observably: (1) cross-guide — `garrison` (or `income`/`autoresolve`) returns hits from ≥ 2 of the 3 committed guides and from both fixture guides, in manifest faction order with routes within each faction and lord-wide entries last per faction; (2) breadcrumb data — a sampled hit per kind carries the right `faction`, `routeLabel` (null exactly for shared/source), `category`, and `title`; (3) hrefs — one asserted hit per landing shape, including a real section-id anchor; (4) the 30-cap — a term matching ≥ 31 entries yields `hits.length === 30` with `total > 30` (worker first checks a committed-corpus term; otherwise a seeded temp fixture copy, the established pattern); (5) empty/whitespace/punctuation-only queries → `total === 0, hits: []`; (6) AND semantics (a two-token query requires both) and left-prefix semantics (prefix hits, non-prefix does not), using terms verified in the corpus at execution; (7) snippet invariants — `snippet` is a substring of the entry text, `occurrences` ranges lie inside it and re-slice to the matched text, and no `<` appears; (8) a performance tripwire — one `searchContent` pass over the committed corpus asserted under a generous 500 ms ceiling (guards against accidental O(n²)-per-key regressions); the DESIGN bound is sub-100 ms, and the measured value must be recorded in the integration evidence and be under 100 ms for acceptance — a recorded value ≥ 100 ms is a finding that forces a matching-implementation replan.

**Validation:** `npm test` (the new suite plus the unchanged suites), `npx tsc --noEmit`, `npm run lint:content`, `npm run build`. No test-resource isolation concerns (read-only corpus reads).

**Stop conditions:** A committed/fixture term proves the match rule wrong as specced (e.g. the prefix semantics misclassifies real content) — replan the match rule; the 30-cap is unprovable by committed corpus or temp copy; `Section.html`/`sharedHtml` turn out to carry markup the tag-strip leaves as visible garbage (e.g. unclosed tags) at a scale that breaks snippets.

**Review mandate:** The corpus walk covers exactly the DESIGN §2 families and nothing else (no ledger data, no gaps/marker text); order is stable and manifest-derived; the match rule implements the recorded prefix semantics with AND across tokens; snippets and occurrences are range-correct and HTML-free; hrefs are the seven DESIGN §4 shapes verbatim; no export mutates the tree or performs I/O; the new test file follows the existing reader/fixture conventions and adds no fixture mutation.

#### Package `search-dialog-component` — Commit 2: The keyboard-first search dialog component

**Status:** Integrated

**Wave:** 2

**Depends on:** ["search-query-layer"]

**Write scope:** ["app/components/search.ts", "app/styles/app.css", "test/components.test.ts"]

**Provisional commit:** `feat(search): add the keyboard-first search dialog component`

**Work:** The new `app/components/search.ts` module — pure `SearchDialogMarkup` builder, pure `searchHitNav` decision, mounted `SearchDialog` wrapper (native `<dialog>`: open/focus/restore, ~150 ms debounce, global `/` shortcut) — its app.css styles, and the markup contract tests. Not yet mounted by the shell.

**Atomicity:** One coupled outcome: the dialog surface and its local state machine are a single reviewable component; the pure builder/decision exports and the browser-only wrapper are one seam pair (the `AtlasHeaderMarkup`/`AtlasHeader`, `ArmiesMarkup`/`ArmiesAndSkillsView` precedent), and splitting markup from wrapper would ship a builder with no state contract or a wrapper with no surface. Coupled proof: the `SearchDialogMarkup` flattening suite plus the `searchHitNav` table in `test/components.test.ts`. Estimated 260–320 changed non-test lines (`search.ts`) plus ~100–130 CSS lines — above the soft target because the markup (dialog head, count line, grouped list, highlight spans, empty states) and the wrapper (dialog element control, debounce effect, keydown effect, focus save/restore) are one component; no second coherent seam exists without inventing a file split.

**Out of scope:** The header trigger (Commit 3), shell wiring (Commit 4), and any change to the query layer — this commit imports `searchContent` and the hit types from Commit 1 and consumes them read-only.

**Implementation packet:**

Markup seam. `SearchDialogMarkup(props)` is a plain `h()`-based VNode builder (exported, zero-DOM): props carry `{ open, query, results, selectedIndex, onQueryChange, onOpenSelected, onClose, inputRef?, dialogKeyProps? }` (the wrapper hands down handlers, refs, and the keydown binding; tests omit them). It renders the native `<dialog class="search-dialog">` (labelled by its title): a head with the mono eyebrow "ALL GUIDES", the serif title "Search the guides", and a ghost Close button carrying the existing `<kbd>Esc</kbd>` chip; a labelled `<input type="search">` (label/placeholder "Unit, skill, building, mechanic or objective"); the count line; and the list area. List area rules (DESIGN §2/§5): empty or whitespace-only `query` → the hint line "Search a unit, named skill, building, mechanic or objective."; non-empty query with `results.total === 0` → the explicit "No match in any guide. Try a shorter phrase."; otherwise the count line (`N matching references.`, rendered `30+ matching references.` when `total > 30`) above the grouped list. Grouping: consecutive hits of the same `lordSlug` under one faction header (the `faction` name, mono label); route-scoped hits carry the `routeLabel` in the breadcrumb, lord-wide hits omit it. Each hit row: the `label-sm` mono breadcrumb (`faction / route / section-or-category`), the category eyebrow, then the hit title plus snippet — the snippet rendered as plain text nodes with each `occurrences` range wrapped in a `search-hit__match` span (matched text in `on-surface` against `on-surface-variant` surroundings). The selected row carries the `--selected` treatment (positionally identifiable — colour is never the sole indicator); every row is a real control (button) so focus rings work. Exact copy is not contractual (DESIGN §6): the worker keeps this voice and may adjust wording within it.

Decision helper. `export function searchHitNav(direction: "up" | "down", index: number, count: number): number` — wrap-around selection over the flat hit list (the `tabNav`/`panelTabNav` pattern, a local pure copy), exported for the `node --test` table (including `count === 0` → 0 and single-element wrap).

Wrapper. `SearchDialog(props: { tree, open, onOpen, onClose, onNavigate })` (mounted, hooks): local `query` and `selectedIndex` state; `results` derived from `searchContent(tree, query)` inside a ~150 ms debounced effect (setTimeout, cleared on change/unmount — the DESIGN's "debounced input"; sub-100 ms synchronous search underneath). Open effect: on `open` becoming true, save `document.activeElement`, `dialogRef.current.showModal()`, focus the field; on `open` false, `close()`. Focus restore: the dialog's `close` event restores the saved element when `isConnected` (the reference-atlas `lastFocus` guard — covers Enter-navigation, where the opener page is replaced). Field keydown: ArrowUp/ArrowDown → `preventDefault()` + `searchHitNav` (selection clamps when the result set shrinks), Enter → `onNavigate` of the selected hit's `href` (no selection or empty list: inert). Global `/`: a `window` keydown listener — `event.key === "/"` with no `dialog[open]` in the document and the target not matching `input, textarea, [contenteditable="true"]` → `preventDefault()` + `onOpen()` (the reference-atlas guard, plus the modal-open check); the listener exists only while this component is mounted, so the zero-lord shell (dialog unmounted) has no shortcut.

Styles. `app/styles/app.css` dialog region (new classes, existing tokens only, per DESIGN.md "Search Field & Results"): the `<dialog>` surface (panel-like: `--surface`-family floor, 1px `--line` border, card radius, full-bleed backdrop via `::backdrop`), the carbon-well field (1px `--line`, 3px radius, mono placeholder), the count/hint/no-match lines (`body-sm`/mono as the design specifies), the hairline-divided result list with `stack-sm`-equivalent row padding, the `label-sm` mono breadcrumb, the `search-hit__match` highlight (foreground shift only — no fill), the selected-row treatment, the Close button (ghost `.button` variant), and `:focus-visible` rings on field, close, and rows. The dialog sits above the sticky header on the existing z-index scale. The global `prefers-reduced-motion` rule already nulls transitions.

**Files and responsibilities:** `app/components/search.ts` (new module — the three exports plus private rendering helpers, module doc comment in the file's seam-annotation voice); `app/styles/app.css` (the dialog region appended in the file's sectioned style with a provenance comment citing DESIGN.md "Search Field & Results"); `test/components.test.ts` (new `SearchDialogMarkup` + `searchHitNav` blocks over constructed `SearchResults` — two factions, two routes, lord-wide entries, a 30+ count, the empty and no-match states — using the file's existing flatten/record helpers and the committed/fixture tree for real `SearchHit` shapes where useful).

**Tests and proof:** Zero-DOM markup contract in `test/components.test.ts`: empty-query hint and no hits; grouped rendering (faction headers in hit order, route breadcrumb present for route-scoped hits and absent for shared/source, category eyebrows, match spans exactly around the occurrence ranges, no raw HTML in flattened text); the count line at N and at `30+`; the explicit no-match line; the Close button + `Esc` kbd chip; `searchHitNav` wrap table (up/down at both ends, single element, zero elements). Observable behavior proven: every list/empty/count rendering rule of DESIGN §2/§5 that the wrapper's state feeds.

**Validation:** `npm test`, `npx tsc --noEmit`, `npm run lint:content`, `npm run build`. Read-only corpus; no serialization concerns.

**Stop conditions:** The native `<dialog>` + Preact ref interplay resists the zero-DOM seam (e.g. the builder must branch on browser APIs — it must not; the wrapper owns all `document` access); the grouped-markup contract cannot express the DESIGN's breadcrumb/highlight anatomy with existing tokens without new tokens (DESIGN forbids new tokens — replan the visual contract, not the tokens); `searchContent` proves wrong-shape from Commit 1 (replan back through the query package).

**Review mandate:** The builder is pure (no `document`/`window`/`showModal` outside the wrapper, no hooks outside the wrapper); snippet text is rendered as text nodes with match spans only (no `dangerouslySetInnerHTML` anywhere in the module); the `/` guard is complete (typing targets, open dialog, unmounted = no listener); focus save/restore carries the `isConnected` guard; the debounce cancels on unmount; styles reuse existing tokens and the z-index scale with no new tokens; the tests assert the DESIGN's observable list rules, not class-name trivia.

#### Package `search-header-controls` — Commit 3: The search trigger in both atlas header forms

**Status:** Integrated

**Wave:** 3

**Depends on:** []

**Write scope:** ["app/components/atlasHeader.ts", "app/styles/app.css", "test/components.test.ts"]

**Provisional commit:** `feat(search): add the search trigger to the atlas header`

**Work:** The optional `onOpenSearch` callback prop threaded through `AtlasHeader`/`AtlasHeaderMarkup`, the trigger button rendered in the full header's reserved `topline__tools` slot and in the slim home header (only when the prop is supplied), its styles, and the header-suite additions.

**Atomicity:** One coupled outcome: the trigger affordance in both header forms plus its presence/absence contract. The prop threading, the two render sites, and the button styling are one reviewable chrome change; the coupled proof is the header suite's prop-present/absent assertions in both forms. Estimated 40–70 changed non-test lines plus ~30–45 CSS lines.

**Out of scope:** Opening/closing behaviour and the dialog itself (the component only fires the callback; the shell and Commit 2 own the rest), and any change to the tabstrip, selection, or route-resolution logic. The trigger imports nothing from `search.ts` and depends on no package; it sits in wave 3 (after `search-dialog-component`) purely because both commits own regions of `app.css` and `test/components.test.ts`, which same-wave scopes must not share.

**Implementation packet:**

Prop threading. `AtlasHeaderProps` and `AtlasHeaderMarkupProps` gain `readonly onOpenSearch?: () => void`; the mounted wrapper passes it straight through (it carries no state of its own for search). Trigger rendering: a `type="button"` ghost button, label "Search" with the existing `<kbd>/</kbd>` chip treatment, `aria-label="Open search ( / )"`, calling `onOpenSearch` — rendered in `topline__tools` (the slot stays an empty `div` exactly as today when the prop is absent, preserving the F10 contract for zero-lord states) and, in the slim form, after the lord links (wordmark and lord links keep their positions — the recorded slim-header deviation from the DESIGN §6 Availability rule). The trigger never appears for boot/not-found slim headers because the shell (Commit 4) omits the prop there; the component's only rule is prop-present → render.

Styles. `app/styles/app.css` header region: the topline trigger sizing (fits the 58 px topline height; compact ghost button + kbd chip, no layout shift on hover — colour/border only), the slim-header placement (right-aligned in the slim wrap), and the shared `:focus-visible` ring (the global rule covers it; no new tokens).

**Files and responsibilities:** `app/components/atlasHeader.ts` (the prop, the two render sites, and the module doc comment updated for the trigger); `app/styles/app.css` (the trigger region, sectioned with a provenance comment); `test/components.test.ts` (header-suite additions: full form with `onOpenSearch` → trigger present inside `topline__tools`; full form without → slot content-free as today; slim with the prop → trigger after the lord links; slim without → absent; the trigger carries the kbd chip and the aria-label).

**Tests and proof:** The header flattening suite already records both forms' VNodes; the additions assert the trigger's presence/absence per prop and form, its label/kbd/aria anatomy, and that no other header output changes when the prop is present (the existing full-form assertions stay green untouched).

**Validation:** `npm test`, `npx tsc --noEmit`, `npm run lint:content`, `npm run build`. Read-only; no serialization concerns.

**Stop conditions:** The topline's remaining height cannot host the trigger without disturbing the crest/brand/env layout (replan the trigger form — e.g. icon-only — and record it); the slim header's wrap cannot right-align the trigger without breaking the wordmark/lord-link order (replan placement, keep the DESIGN's "wordmark and lord links keep their positions" rule).

**Review mandate:** The prop is optional and its absence renders byte-identical header output to today (the F10 zero-lord contract survives); no selection/route logic touched; the button is a real focusable control with the kbd hint (DESIGN keyboard-first contract); styles add no tokens and no hover layout shift.

#### Package `search-shell-wiring` — Commit 4: Wire the search dialog into the app shell

**Status:** Planned

**Wave:** 4

**Depends on:** ["search-dialog-component", "search-header-controls"]

**Write scope:** ["app/main.tsx"]

**Provisional commit:** `feat(search): wire the search dialog into the app shell`

**Work:** The shell integration that turns the feature on: the `searchOpen` state, the availability and trigger-scoping conditions, the `SearchDialog` mount, and the result navigation (close + hash write).

**Atomicity:** One coupled outcome: the feature becomes live — every acceptance criterion in DESIGN §7 that involves page-level availability, the `/` shortcut, and landing navigation is provable only with this wiring present, and the wiring is coherent only with both predecessors integrated (it mounts the Commit 2 component and passes the Commit 3 prop). Splitting state from mount or navigation would leave a half-wired shell whose only "proof" is that it compiles. Estimated 30–50 changed non-test lines.

**Out of scope:** Any change to boot, the section-anchor effect, the view dispatch, or the header internals (those ship in their packages); no new shell state beyond the one `searchOpen` boolean.

**Implementation packet:**

In `App`: `const [searchOpen, setSearchOpen] = useState(false)`. Availability: `const searchAvailable = boot.kind === "ready" && lords.length > 0`. Header trigger scoping (the shell's page decision, recorded in the DESIGN Availability rule) is derived from the RESOLVED header context, not the raw parsed route: `const headerOnOpenSearch = searchAvailable && (route.name === "home" || headerLord !== null) ? () => setSearchOpen(true) : undefined`, reusing the `headerLord`/`headerRoute` values `App` already computes from `headerContext(boot, route)`. `headerContext` is null exactly for home, boot, not-found, and — crucially — for an unresolvable lord or route slug (e.g. `#/unknown-lord`, `#/<lord>/plan/<bad-route>`), which the router parses as a well-formed member (`desk`/`lord-page`/`route-page`) but renders as the slim not-found header. The condition therefore shows the control on home (slim) and on every resolvable full-form member, and on no error state: the slim form is the not-found/boot form only in the unresolvable cases, and those get no prop. A condition built from `route.name` alone would leak the trigger onto those slim not-found headers. Mount: render `<SearchDialog tree={…} open={searchOpen} onOpen={() => setSearchOpen(true)} onClose={() => setSearchOpen(false)} onNavigate={(href) => { setSearchOpen(false); window.location.hash = href; }} />` as a sibling of `AtlasHeader`/`main` (inside the returned fragment), and only while `searchAvailable` — zero lords mounts nothing, so there is no dialog and no `/` listener; while ready with ≥ 1 lord the dialog mounts on every route, including not-found, so `/` works there (DESIGN §4: the shortcut works on every page regardless of which control is visible). `tree` is the boot tree (the same immutable value the views consume). `onNavigate` writes the hit's `href` (Commit 1 already produced the exact landing hash) after closing — the existing hash router and section-anchor effect do the rest; no new hash shapes, no scroll code. Focus handover (DESIGN §7 "Enter → land with focus in the page"): after the hash write, `requestAnimationFrame(() => document.getElementById("main")?.focus({ preventScroll: true }))` — the same `#main` region the skip link focuses (`tabIndex={-1}` already on the element); `preventScroll` keeps the plan section-anchor effect's `scrollIntoView` authoritative on section landings. The `requestAnimationFrame` deferral runs after the dialog's close effect settles, so the native close's own focus behaviour cannot steal it back; the `#main` element persists across route changes, so the focused node is always the page region. When the dialog closes without a navigation (Escape/backdrop), Commit 2's opener-restore path owns focus instead and the shell focuses nothing. The `searchOpen` state resets nothing else; a page navigation with the dialog closed is the only steady state (the dialog is never open across a route change it did not cause, because Enter closes it before the hash write).

**Files and responsibilities:** `app/main.tsx` only — the `searchOpen` state, the `searchAvailable`/`headerOnOpenSearch` conditions, the `SearchDialog` mount and callback wiring, and the shell doc-comment note recording the shell-owned open state and the trigger-scoping decision; no other file changes.

**Tests and proof:** `app/main.tsx` is the JSX-only module outside `node --test` (established seam — the shell's existing anchor effect and header context are likewise untested in node); the commit's node-level proof is that the unchanged suites still pass over the now-wired imports (`npm test`), `npx tsc --noEmit` proves the prop/mount types, and the behavioural proof is the Final validation manual boot: the control on home and on resolvable full-form pages and absent on every not-found rendering — the explicit not-found route AND the unresolvable-hash renders `#/unknown-lord` and `#/<lord>/plan/<bad-route>`; `/` opens on home and a plan page and types normally inside the field; the keyboard loop (arrows, Enter landing per kind with focus in the page `#main` region, Escape restoring focus); and a reload with the dialog open landing on the hash page with the dialog closed.

**Validation:** `npm test`, `npx tsc --noEmit`, `npm run lint:content`, `npm run build`, then `npm run serve` over the fresh build for the manual boot evidence above (recorded under Final validation).

**Stop conditions:** The dialog's presence changes any existing page's rendered output or focus order at first Tab (it must not — the skip link and page content keep their order; the dialog is closed by default); the `onNavigate` hash write interacts badly with the section-anchor effect on initial-load deep links (it must not — the effect is hash-driven and already handles plan section ids); any of Commit 2/3's seams proves wrong under real mount (replan back through the owning package).

**Review mandate:** Exactly one new shell state; the availability/scoping conditions match the DESIGN (home + resolvable full-form members show the control; zero lords show nothing; not-found shows none — including the unresolvable lord/route hashes that render the slim not-found header, which the resolved-context condition excludes by construction); the dialog mounts as a sibling without altering the existing fragment structure or the skip link; `onNavigate` is close-then-navigate with the hit's own href, followed by the `#main` focus handover with `preventScroll`, and no other side effect; the boot section-anchor effect and view dispatch are byte-identical.

## Discoveries and replanning

- Commit 2 commit review (fresh reviewer, Mode: commit): verdict Accept, no CRITICAL/HIGH. One MEDIUM retained for the close-out bundle (advisory until delegated per policy): the wrapper has no backdrop-click dismissal — DESIGN §2/§6 names backdrop click as a closing means; the fix is wrapper-owned in `app/components/search.ts` (a click listener closing when `event.target` is the dialog element), with the strongest-available-seam proof. Same bundle: the reviewer's suggested one-line assertion that the builder never renders the native `open` attribute (controlled-dialog invariant). No scope, architecture, delivery-boundary, or package-order change.

- Plan review, round 1 (fresh reviewer, Mode: plan, 2026-10-07): one MEDIUM — Commit 4's trigger scoping condition was built on the raw `route.name` and would have rendered the search control on the slim not-found header for unresolvable lord/route hashes (`#/unknown-lord`, `#/<lord>/plan/<bad-route>` — well-formed to the parser, unresolvable in `headerContext`). Corrected: the condition now derives from the resolved header context (`headerLord !== null`), with the unresolvable hashes named in the Commit 4 review mandate and Final validation. Adopted in the same round (reviewer validation-gap and investigation notes): the measured sub-100 ms `searchContent` timing must be recorded in integration evidence and be under 100 ms for acceptance; the corpus indexes ALL plain-string rendered fields (army `label`, unit `role`/`kind`, `size`, item `label`); matching runs over `title + " " + text`; and the retain-all `panelOrder` decision is recorded (Uncertainty register → Decisions). No scope, architecture, delivery-boundary, or package-order change.

## Final validation

Exact gates, in order, on the integrated HEAD before final feature review:

1. `npm test` — full `node --test` suite green: the new search contract suite (cross-guide coverage, grouping order, breadcrumb/category/href per kind, the 30-cap + explicit total, empty/AND/prefix match semantics, snippet invariants, the 500 ms tripwire), the extended `SearchDialogMarkup`/`searchHitNav` blocks, the extended header trigger suite, and all unchanged suites (content model, lint, router, views, ledger, tokens, server); the measured sub-100 ms `searchContent` timing over the committed corpus is recorded in the integration evidence (a recorded ≥ 100 ms value blocks acceptance).
2. `npx tsc --noEmit` — clean over `app/`, `tools/`, `test/`.
3. `node tools/content-lint.mjs` — exit 0 on the committed `content/` (no content change; guards against accidental corpus edits during test-authoring).
4. `npm run build` — static `dist/` produced; `package.json` and the lockfile diff empty (no new dependencies).
5. Manual HTTP boot (`npm run build` + `npm run serve`), rendered capture as evidence: the trigger renders on home (slim) and on every resolvable full-form page (topline slot), and renders not on not-found — neither the explicit not-found route nor the unresolvable-hash renders `#/unknown-lord` and `#/<lord>/plan/<bad-route>`; `/` opens the dialog on home and on a plan page and types normally in the field; typing `garrison` (or another verified cross-guide term) shows grouped hits from multiple factions in manifest order with breadcrumbs, categories, and highlighted matches, and the count line; ArrowUp/ArrowDown wrap across the grouped list, Enter lands each kind on its DESIGN §4 target with focus in the page (a section hit scrolls the plan H2 into view; the panel kinds land on the right detail page; VCO on the undercard; shared on the desk; sources on `sources`); Escape and backdrop close restore focus to the opener; a non-matching query shows the no-match text; a reload with the dialog open restores the page with the dialog closed.
6. The DESIGN §7 acceptance criteria checked item by item, plus the DESIGN.md pre-delivery checklist on the new surfaces (keyboard-operable, `:focus-visible`, no colour-only meaning, z-index scale, no new tokens).

## Documentation impact

Complete during reconciliation.

## Abandonment record

Include this section only after explicit developer abandonment.
