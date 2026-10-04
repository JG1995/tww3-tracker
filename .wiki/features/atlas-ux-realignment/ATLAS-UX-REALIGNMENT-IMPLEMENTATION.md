# Atlas UX Re-alignment

**Design:** [Atlas UX Re-alignment design](ATLAS-UX-REALIGNMENT-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Bring the site's chrome, information architecture, and look in line with the reference atlases: a fresh page/route/section hash grammar (old shapes deliberately broken), the three-tier sticky header, the full 8-page per-lord IA, and the atlas slate/brass visual system replacing the Factory system. Three optional content fields (`crest`, `environment`, route `phases`) are added to the lint-covered content model, and Elspeth's chrome content is extracted verbatim from the gitignored reference atlas. This realizes PRD F10 (the PRD amendment lands at close-out). Full requirements, scope, non-goals, hash grammar, visual system, and acceptance criteria live in the accepted DESIGN (Open Questions: None); the ledger links them and does not restate them as a competing specification.

## User-visible behavior

- The hash grammar routes exactly per DESIGN §2: home, `#/<lord>` (reference desk for the first manifest route), `#/<lord>/sources|notes`, and `#/<lord>/<route-page>/<route-id>[/<section-id>]` for `desk`/`plan`/`armies`/`settlements`/`workshop`/`ledger`; every other shape (including every old shape) renders not-found.
- Every lord-scoped or route-scoped page renders the three-tier header (crest + brand + environment line + empty toolbar, routebar with three hash-selected route tabs, pagenav with eight page tabs + the static "Saved locally · offline" line); home, not-found, and boot states render the slim header.
- The reference desk is the five numbered panel cards (I–V) in the atlas desk-grid composition with `panelOrder`-ordered flat rows, a component-local "Compare routes" toggle, and — below the grid — the version banner, shared fundamentals, and flagged-items zone; the route plan carries the page head, the PURPOSE / WHAT ACTUALLY WINS / LIKELY BOTTLENECK fact row, the registry sections, and the "The operation in five moves" aside from `phases`.
- The three detail pages render the full item anatomy in the desk-panel anatomy; the F2 five-tab dashboard components are deleted from the codebase.
- The whole surface renders in the atlas visual system (slate/brass, Georgia serif headings, full-bleed `.wrap`, no webfonts), and the F5 ledger keeps its full behaviour with its hash shape unchanged, restyled.

## Invariants

- The hash is the only restored state; every header selection is derived from hash + content tree — no component state for route/page selection, nothing persisted beyond the F5 ledger.
- The site never guesses: any hash shape outside the DESIGN §2 grammar is not-found; no old shape is mapped, redirected, or preserved.
- No new dependencies, no server changes, no localStorage; the save-state line is honest static text and must not claim autosave.
- The five datasets, `panelOrder`, and the section registry are untouched; the detail-page split (armies+skills+research | buildings | mechanics) is a rendering decision that changes no data.
- The F5 ledger model, server contract, optimistic writes, lifecycle, and on-demand loading are retained unchanged; only the restyle and the empty-state copy (whose named start location moves to the route plan) change.
- `crest`/`environment`/`phases` are optional: absence renders the reduced forms (brand without crest, environment line without it, plan without the aside), never a placeholder.
- Confidence-badge anatomy is unchanged (state label + icon, recoloured per the DESIGN §4 remap; never colour alone).
- Token-first CSS: components reference `--…` custom properties with the documented exceptions only; `tokens.css` is regenerated verbatim from the rewritten `.wiki/DESIGN.md` frontmatter.
- Views stay presentational `h()`-based `.ts` modules (only `app/main.tsx` uses JSX); I/O stays confined to `content/load.ts` and `ledger/io.ts`; the crest read joins the boot pass in `load.ts`.
- No test is weakened: tests asserting replaced behaviour are rewritten or deleted in the same commit as the change, and surviving behaviour keeps an equivalent proof.

## Non-goals

- Cross-guide search (F6), reader dialog, notes/ticks content, calculators, localStorage, export/import, text-size cycle, fit-desk toggle — the toolbar is an empty reserved slot.
- Ledger model changes (F5 retained as-is), content authoring beyond extracting Elspeth's crest/environment/per-route `phases`, desk panel sub-tab grouping, the route plan's phase sub-tab strip, any backwards compatibility, new dependencies, server changes. (Full list: DESIGN §1.)

## Current-state map

- Relevant components: `app/router.ts` — pure `parseHash` + `useHashRoute` over the current grammar (`#/`, `#/<lord>`, `#/<lord>/route/<id>[/<section>]`, `#/<lord>/ledger/<route-id>`; `SEGMENT` slug discipline; `test/router.test.ts` pins the table). `app/main.tsx` — sole JSX file: one boot pass, the sticky `top-nav` (wordmark slot moved in by effect, `SEARCH` well reserved for F6), section-anchor effect for the `route` case, the `routeView` exhaustive dispatch, `LedgerPage` + `useRouteCampaign` (F5 wiring; start navigates to `#/<lord>/ledger/<route-id>` — a shape the new grammar keeps). Views: `home.ts` (lord cards + `versionContext`), `lord.ts` (TabStrip "shared" tab, header + version banner with open-flags chip, shared fundamentals, route list, flagged-items section), `route.ts` (TabStrip, bone identity card, VCO undercard + campaign action region, registry-walk body with F7 transition cross-links — `transitionTarget` exported — F3 source panels, gap markers, F2 `Dashboard` keyed by route id), `ledger.ts` (F5 view; empty-state copy "NO ACTIVE CAMPAIGN — start one from a route page"; no hash links), `not-found.ts`, `boot-error.ts`. Components: `TabStrip.ts` (role=tablist, roving tabindex, pure `tabNav`, keyboard→hash), `ConfidenceBadge.ts` + `app/badges.ts` (four-state vocabulary), `dashboard.ts` (five-tab local selection, army/item anatomy, `DashboardMarkup` zero-DOM seam), `LedgerTable.ts`.
- Data model: `app/content/types.ts` — `GuideManifest` (no `crest`/`environment` yet), `Route` (no `phases` yet), `PANEL_GROUPS` fixed order, `panelOrder`; `lint.ts` — pure rule set + a hand-rolled frontmatter subset parser that supports **flow lists of flow maps** (and block lists of scalars / single-key maps) but **not** block lists of two-key maps (the natural `- title: …` + indented `note: …` shape throws `FrontmatterError("unexpected indentation")`); the `phases` contract is met by the flow form — a flow list of double-quoted flow maps (probed clean against all 15 committed pairs) — and needs **no parser change**; `load.ts` — the only content I/O: one parallel fetch pass, markdown-it render, `ContentBootError` naming file + field; `query.ts` — `getPanelEntries`, `getFlaggedEntries`, `getVcoObjectives`, `resolveSources`, `getLord`/`getRoute`.
- Persistence: `.local/state/ledgers/` via `tools/server.mjs` (untouched by this feature); no localStorage.
- Existing behavioral assumptions: boot-once frozen `ContentTree`; post-boot reads synchronous; the hash is the only external state; F3's flagged count = `getFlaggedEntries(lord).length` rendered exactly once (36 entries on the committed Elspeth guide); F7's transition cross-link targets the real `Opening` section id or the target route page top; hooks/`main.tsx` glue have no node:test seam (browser-boot-proven precedent).
- Styles: `.wiki/DESIGN.md` frontmatter = Factory oklch tokens (Geist appears only here — **no webfont is loaded anywhere**; `index.html` links `tokens.css` only, `app.css` is imported by `main.tsx`); `app/styles/tokens.css` (148 lines, `--color-<key>`/`--font-<role>` naming, values verbatim from frontmatter, pinned by `test/tokens.test.ts`); `app/styles/app.css` (2156 lines, token-first); `index.html` carries the `#wordmark` slot the shell effect moves into the nav.
- Content: `content/elspeth-von-draken/guide.json` (no `crest`/`environment`), three route docs (no `phases`), six populated datasets, `data/sources.json`; `test/elspeth-skeleton.test.ts` pins the committed content (incl. "vco 6-7-20"). The read-only reference `.work/references/Elspeth_VCO_Expedition_Atlas.html` (gitignored, never modified) carries `<symbol id="crest" viewBox="0 0 120 120">`, the topline string "Normal / Normal · Smart Autoresolve · VCO · Immortal Empires", and **15 phases — five `{label, title, aim, …}` entries per route** (verified).
- Architectural seams: presentational views over pure queries; zero-DOM VNode-flatten test seam (`recordVNodes`/`vnodeText`) for every view and dumb component; hook-carrying components export a plain markup builder (`TabStripMarkup`/`DashboardMarkup` precedent) so node:test reaches them; the F5 `LedgerIndexState`/`useCampaign` hooks are the only page state.
- Project validation commands: `npm test` (node:test over `test/*.test.ts`), `npx tsc --noEmit` (strict over `app/`, `tools/`, `test/`), `node tools/content-lint.mjs` (exit 0 on committed `content/`), `npm run build` (vite → `dist/`); `npm run serve` for the manual HTTP boot.
- Publication: `.wiki/` is tracked (DESIGN + ledger must be committed before execution, outside this dispatch); no `.github/`; every accepted precedent (F1–F5, F7) used provider `Local`, `PR ref: Not applicable`, `PR template: Not applicable`, `Merge method: ff-only`, base `main`, branch `feat/<feature-slug>`.
- Visual reconciliation (planner inspected the five rendered screenshots in `.pi/work/ui-inspection/`): (1) the rendered desk grid is **three columns wide** (3 + 2 cards) — DESIGN §2's "two-column" prose is superseded by the rendered composition (3-column wide, stacked on narrow); (2) the desk page is **grid-first**: desk toolbar → panel grid → lord-level zone (version banner, shared fundamentals, flagged items) — DESIGN §6's one-line "version banner block → route comparison → shared fundamentals → flagged items" order conflicts with §2 and the rendering, and is superseded; (3) the save-state line reads **"Saved locally · offline"** (rendered atlas string, matching DESIGN §6) — DESIGN §2's "Offline · local progress" is superseded; (4) the plan page's phase sections render **numbered** — each registry section heading carries its phase-order numeral as a prefix (1 Opening, 2 Early → Mid, 3 Mid → Late, 4 Victory push, 5 Territory policy, 6 Diplomacy; the transition sections render unnumbered) — literal to the DESIGN §2/§7 "phase-numbered sections" acceptance (developer decision: the rendered atlas's unnumbered headings do not govern — screenshots own appearance, the accepted DESIGN owns the acceptance checklist, and the developer resolved the conflict toward the DESIGN); (5) the atlas's desk panels II–V carry checkboxes and "Read notes" buttons — both are deferred scope per the DESIGN and are omitted (flat label-only rows; the footer carries the detail-page link instead); (6) the atlas toolbar's Search/Fit desk/A+/Export buttons are omitted (the DESIGN's empty reserved slot). Scope, grammar, and non-goals follow the DESIGN wherever it conflicts.
- Primary risks: `app/styles/app.css` (full token rename + restyle), `app/main.tsx`, `test/views.test.ts` (2685 lines), and `test/components.test.ts` (973 lines) are shared by most packages — waves serialize on them (the accepted F2–F5 pattern); the section-body move out of `route.ts` and the anatomy move out of `dashboard.ts` must preserve F7/F3 behaviour exactly; visual regressions have no command gate (the manual boot + capture is the completing evidence).

## Feature architecture

- **Routing (Commit 9):** `parseHash` rewritten wholesale to the DESIGN §2 grammar — `home`; `desk` (with `routeId: string | null`, null = first manifest route resolved at render); `lord-page` (`sources`/`notes`); `route-page` (`desk`/`plan`/`armies`/`settlements`/`workshop`/`ledger` + `routeId`, section id on `plan` only); `not-found` for everything else, including `#/<lord>/desk` (no route id) and every old shape. `useHashRoute` is unchanged.
- **Shell (Commit 10):** `app/components/atlasHeader.ts` — pure markup builder + thin hook wrapper (focus-follow, the `TabStripMarkup` seam pattern), two forms derived from the route: slim (home/not-found/boot: wordmark + lord links) and full (topline crest+brand+environment line+empty toolbar; routebar; pagenav with the static save-state line). Selection and every href are hash- + content-derived. The `#wordmark` slot and the move effect leave `index.html`/`main.tsx`.
- **Views:** `app/views/desk.ts` (toolbar + compare toggle + five-card grid + lord-level zone — the version banner and flagged section live here from this commit, with new-grammar links; the `lord.ts` copies are deleted in Commit 9), `app/views/plan.ts` (page head, fact row, two-track body — the registry-walk machinery **moved** from `route.ts` — phases aside, VCO undercard + campaign action region **moved** from `route.ts`, panel-navigation strip), `app/views/panels.ts` (three detail views; the armies page carries component-local panel tabs), `app/views/sources.ts`, `app/views/notes.ts`. `app/components/deskPanel.ts` — the shared desk-panel anatomy (full item anatomy **moved** from `dashboard.ts`).
- **Content model (Commit 1):** `GuideManifest` gains optional `crest`/`environment`; `Lord` gains `crestSvg?: string` (fetched + `<svg`-validated in the boot pass; boot-error names the file and field); `Route` gains `phases?: readonly { title: string; note: string }[]`; `lint.ts` gains the pure shape rules; `tools/content-lint.mjs` gains the crest file check (exists, contains an `<svg` start tag) so the pre-run lint and the boot check agree.
- **Visual system (Commit 2):** `.wiki/DESIGN.md` frontmatter rewritten to the atlas palette (hex, verbatim) and component/layout token set per DESIGN §4; `tokens.css` regenerated under the DESIGN's literal names (`--bg`, `--surface`, …, `--accent`, `--brass`, `--good`, `--danger`); `app.css` retokened and restyled — surviving surfaces get the full atlas language, doomed F2-era blocks get token-reference updates only (deleted in Commit 11).
- **Content (Commit 3):** Elspeth's `crest.svg` (the reference symbol's contents verbatim in a standalone `<svg viewBox="0 0 120 120">`), `guide.json` `crest` + `environment`, per-route `phases` (`title` ← atlas `title`, `note` ← atlas `aim`, atlas order).
- **Boundaries:** no server change; no new dependencies; the `app/ledger/` module is untouched; new files are exactly `desk.ts`, `plan.ts`, `panels.ts`, `sources.ts`, `notes.ts`, `atlasHeader.ts`, `deskPanel.ts`, and `content/elspeth-von-draken/crest.svg`.

## Uncertainty register

### Known

- The frontmatter parser subset expresses the `phases` list-of-`{title, note}` shape **only in the flow form** (a flow list of double-quoted flow maps). Probed directly against all fifteen committed phase pairs: the quoted flow shape round-trips exactly; the natural block list of two-key maps (`- title: …` + indented `note: …`) throws `FrontmatterError("unexpected indentation")`; an *unquoted* flow map breaks on the commas inside several `aim` values. The mandated content shape is therefore the quoted flow form, and **no parser change is needed** (probed in `parseFrontmatter`/`parseList`/`parseFlowValue` in `lint.ts`).
- The reference atlas carries the crest symbol, the environment topline string, and exactly 15 phases (five per route, verified).
- `.wiki/` is tracked; no `.github/`; the Local/ff-only publication precedent is unanimous across F1–F5 and F7.
- No webfont is loaded today (Geist exists only in `.wiki/DESIGN.md` frontmatter) — "Geist is dropped entirely" is satisfied by the frontmatter + CSS font-stack rewrite; `index.html` gains no font link.
- `test/views.test.ts` and `test/components.test.ts` are the churn surface for the whole feature; `test/elspeth-skeleton.test.ts` pins the content extraction.

### Assumptions

- The plan page's VCO undercard + campaign action region is the direct successor of the route page's (the start flow keeps its single-active-campaign derivation and its `#/<lord>/ledger/<route-id>` navigation).
- The version banner, shared fundamentals, and flagged-items zone move from the lord page to the desk page unchanged in behaviour (same single selector, same chip idiom), only relinked to the plan grammar.
- The desk cards II (Lord & hero skills) and III (Research priorities) both link to the Armies & skills page; the armies page's panel tab is component-local with the armies tab first (the hash grammar has no tab segment — nothing is guessed).

### Decisions

- **One PR, provider `Local`**, mirroring the F1–F7 precedent exactly: `PR ref: Not applicable`, `PR template: Not applicable`, `Merge method: ff-only`, base `main`, branch `feat/atlas-ux-realignment`, Required checks = the real local gate. Eleven ordered atomic commits keep `main` green at every prefix; no intermediate seam justifies a second merge boundary. **Feature close-out: `Not run`** (sole/final PR).
- **Dormant-surface strategy for the coordinated replacement.** New views land as unreachable files (Commits 4–8) before the grammar swap (Commit 9) makes them routable — the F5 stub precedent in reverse: every dormant page's own links already use the new grammar, and no reachable page carries a new-grammar link before the swap. Old surfaces die with the outcome that replaces them: `lord.ts` is deleted by Commit 9 (the dispatch no longer reaches it), and `route.ts`/`TabStrip.ts`/`dashboard.ts` are deleted by Commit 11 (dead once the header and plan pages own their surfaces).
- **The start flow moves to the route plan page.** The F5 start action lived on the route page's VCO undercard; the route page no longer exists, and the plan page is its successor (the only route-scoped deep content page). The DESIGN pins the behaviour ("full F5 behaviour … start flow pointing at the new `ledger` hash") without naming the host; the IA forces this placement. Alternative considered: offering start on the ledger page's empty state itself (still viable; would change the F5 view's entry-point contract) — rejected as the less natural successor. Consequence: the ledger empty-state copy is reconciled in Commit 9 (the moment the plan page becomes reachable).
- **`#/<lord>` (the default-route desk) is route-scoped for the route tabs:** switching routes from it targets `desk/<new-route>` (the desk is a route-page type; the hash merely omits the default route, and the routebar renders the resolved selection — never a hidden guess).
- **The crest is fetched and validated in the boot pass** (`load.ts`): `guide.crest` names a file inside the lord directory; a missing file or one without an `<svg` start tag is a `ContentBootError` naming the file and the `crest` field (the DESIGN's boot contract); the validated SVG text is stored on `Lord` and inlined `aria-hidden` in the header. The pre-run lint CLI performs the same file check so both surfaces agree.
- **`tokens.css` adopts the DESIGN §4 literal names** (`--bg`, `--surface`, `--surface2`, `--surface3`, `--ink`, `--muted`, `--faint`, `--line`, `--accent`, `--brass`, `--good`, `--danger`, plus the component/layout tokens DESIGN §4 fixes verbatim); the old `--color-*` names are gone in the same commit as the `app.css` retokening (a token rename without the stylesheet update would ship an unstyled site — one atomic visual swap).
- **Plan section headings render numbered** — each of the six registry sections carries its phase-order numeral (1 Opening, 2 Early → Mid, 3 Mid → Late, 4 Victory push, 5 Territory policy, 6 Diplomacy) as a rendered prefix to the H2, in registry-walk order; the transition sections (inter-route gap markers, not phases) render unnumbered; the H2 `id` attributes are unchanged so the plan section anchors and F7 cross-links are unaffected. This is literal to the DESIGN §2/§7 "phase-numbered sections" acceptance — **developer decision** (recorded in Current-state map): the rendered atlas's unnumbered headings were the only conflict, and the developer resolved it toward the accepted DESIGN (screenshots own appearance, the DESIGN owns the acceptance checklist).
- **Detail-page split is rendering-only:** the armies page renders armies+skills+research, settlements renders buildings, workshop renders mechanics — all over the same `getPanelEntries` data.

### Unknowns

- None gating the plan. Exact class names, cell copy beyond DESIGN-fixed strings, and the comparison-card/toolbar presentation details are implementation detail owned by the packages within the DESIGN contract.
- A fresh reviewer should confirm the two IA placements against the DESIGN: the start flow on the plan page and the default-route desk counting as route-scoped (both recorded above with their consequences; neither changes an accepted invariant).

### Risks

- `app.css`'s full retokening + restyle is the largest single change and has no command-level visual gate — the manual `npm run serve` boot and a rendered capture are its completing evidence (honest gap, reported, not papered over).
- The section-body move (`route.ts` → `plan.ts`) and the anatomy move (`dashboard.ts` → `deskPanel.ts`) must preserve F7's transition cross-links and F3's source-panel/flagged behaviour exactly; the old suites guard them until their owner is deleted.
- `test/views.test.ts` churn across eleven commits: green at every prefix is the contract; the removal commit (11) must verify each pruned assertion has a surviving equivalent before deleting it.
- The Elspeth extraction is verbatim-by-contract; a shape mismatch in the reference (e.g., a route without five phases) is a stop condition, not an improvisation.
- Hooks/`main.tsx` glue (header forms, plan-case campaign wiring) has no node:test seam — the manual HTTP boot is its completing proof, matching the `useHashRoute` precedent.

## Walking skeleton

Commit 1 (content model) → Commit 2 (visual system) → Commit 3 (Elspeth content) → Commit 4 (desk) → Commit 5 (plan) → Commit 9 (grammar swap): after the swap, `#/elspeth-von-draken` renders the reference desk with route I selected and `#/elspeth-von-draken/plan/route-1` renders the campaign plan with the fact row and the five-moves aside — the atlas IA and look work end to end on trunk, before the detail pages' routing polish, the aux pages, the header, and the removals land.

## Delivery plan

**Commit packages:** 11

### PR `atlas-ux-realignment` — Re-align the site's UX with the reference atlases

**Status:** Planned

**Depends on:** []

**PR ref:** Not applicable

**Merge ref:** Not merged

**Branch:** `feat/atlas-ux-realignment`

**Base branch:** `main`

**Publication provider:** Local

**PR template:** Not applicable

**Merge method:** ff-only

**Required checks:** `npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds (the real local gate; the manual `npm run serve` HTTP boot plus a rendered capture is the completing evidence in Final validation)

**Feature close-out:** Not run

**Provisional PR title:** `feat(app): re-align the site UX with the atlas atlases`

**Purpose:** The whole feature lands through one Local ff-only boundary mirroring F1–F7: the content-model additions and Elspeth extraction, the Factory→atlas visual swap, the new views (landed dormant), the wholesale grammar swap, the three-tier header, and the removal of the replaced surfaces. `main` stays green at every ordered atomic prefix; `package.json` and the server never change; no intermediate seam justifies a second merge boundary.

#### Package `chrome-content-model` — Commit 1: The crest, environment, and phases content-model contract

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** ["app/content/types.ts", "app/content/lint.ts", "app/content/load.ts", "tools/content-lint.mjs", "test/content-model.test.ts", "test/lint-cli.test.ts"]

**Provisional commit:** `feat(content): add crest, environment, and phases to the content model`

**Work:** The content model gains the three optional chrome fields per DESIGN §4. `types.ts`: `GuideManifest` gains `crest?: string` (path to an SVG file inside the lord directory) and `environment?: string`; `Lord` gains `crestSvg?: string`; `Route` gains `phases?: readonly { readonly title: string; readonly note: string }[]` (an exported `PhaseSummary` type). `lint.ts` (pure, no I/O): a guide with `crest` must carry a non-empty string that is a lord-directory-relative path (no leading slash, no `..`); `environment`, when present, must be a non-empty string; a route's `phases`, when present, must be a non-empty ordered list of `{title, note}` objects with both fields non-empty strings — each as a `{ file, field, message }` violation in the existing shape. `tools/content-lint.mjs`: when a guide names `crest`, read the file and add a violation when it is missing or lacks an `<svg` start tag (the pre-run check that agrees with boot). `load.ts`: accept the optional fields in the guide parse; when `crest` is present, fetch the crest file in the existing parallel boot pass and reject the boot with a `ContentBootError` naming the file and the `crest` field when it is missing or lacks an `<svg` start tag (the DESIGN's boot contract — never a white page); store the validated SVG text as `Lord.crestSvg` (absent `crest` ⇒ `undefined`); parse `phases` into the typed list (absent ⇒ `undefined`). No other manifest/route field, dataset, `panelOrder`, or section-registry behaviour changes.

**Atomicity:** One outcome: "the three optional chrome fields are expressible in the content model, lint-checked pre-run, and boot-loaded with the boot-error contract" — the types, the lint rules, the CLI file check, and the load/parse are one schema contract (types without lint are dead surface; lint without load is unenforced; the CLI and the boot check must agree on the same `<svg` rule, so they land together). Counted estimate: ~220 non-test implementation lines (types ~30, lint rules ~60, load ~45, CLI ~15, the rest small glue). No further valid split exists.

**Out of scope:** The Elspeth content data (Commit 3), any rendering (Commits 4–10), any dataset/`panelOrder`/section-registry change, any server change.

**Implementation packet:** The frontmatter subset parser already handles the `phases` shape **in the flow form only** — a flow list of double-quoted flow maps (`- { title: "…", note: "…" }`, one per line; probed clean against all fifteen committed pairs. The natural block list of two-key maps throws `FrontmatterError("unexpected indentation")`, and an unquoted flow map breaks on the commas inside several `aim` values — so the values are double-quoted); do not extend the parser — the flow form is sufficient. Keep `lint.ts` I/O-free: the crest *file* check belongs to the CLI (which reads content) and the `<svg` content check belongs to `load.ts`; both must produce the same verdict for the same file (the DESIGN: "the lint catches the same condition pre-run"). The crest read joins the existing parallel fetch pass — it is one more named file, not a new I/O module or a new side-effect site. Absence is invisible: every currently committed guide and fixture (including `test/fixtures/content/`) lints and loads exactly as today.

**Files and responsibilities:** `app/content/types.ts` — the three optional fields + `PhaseSummary`. `app/content/lint.ts` — the pure shape rules + the typed `phases` parse helper. `app/content/load.ts` — the optional-field parse, the crest fetch/validation, the boot-error naming. `tools/content-lint.mjs` — the crest file check in the CLI pass. `test/content-model.test.ts` — loader/lint proofs over in-memory readers. `test/lint-cli.test.ts` — the CLI crest-file violations.

**Tests and proof:** Observable: lint violations for each bad shape (crest path with `..` or leading slash; empty `environment`; `phases` as a scalar, an empty list, or a list with a missing/empty `title` or `note`) and a clean pass for a valid optional-fields guide; a valid guide loads with `crestSvg` set (the in-memory reader serves the SVG text) and `phases` parsed in order; a missing or non-SVG crest file rejects the boot with a `ContentBootError` naming the file and the `crest` field; every existing fixture (no new fields) lints and loads byte-identically in behaviour; the CLI flags a missing crest file and a crest file without an `<svg` start tag. Proof seam: the existing in-memory-reader + temp-content CLI seams in the two test files (no new infrastructure).

**Validation:** `node --test test/content-model.test.ts test/lint-cli.test.ts`, then `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 on the unchanged committed content), `npm run build`. No services.

**Stop conditions:** The frontmatter subset cannot express a committed `phases` shape without a parser change (report — the double-quoted flow form is probed to suffice, so this is not expected); the DESIGN boot contract cannot be met through the existing `ContentBootError` path; a need for a new I/O module (replan — the boot pass is the home).

**Review mandate:** optionality is exact (absence changes nothing for existing content — all committed fixtures pass untouched); no I/O in `lint.ts`; the CLI and boot crest checks agree; the boot error names the file and the `crest` field; no dataset/registry change; no new dependency; no rendering.

#### Package `atlas-visual-system` — Commit 2: Replace the Factory system with the atlas visual system

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** [".wiki/DESIGN.md", "app/styles/tokens.css", "app/styles/app.css", "test/tokens.test.ts"]

**Provisional commit:** `feat(styles): replace the Factory system with the atlas visual system`

**Work:** The visual system swap per DESIGN §4 (appearance authority: the rendered atlases). `.wiki/DESIGN.md`: the YAML frontmatter's palette is rewritten to the atlas `:root` values **ported verbatim as hex** under the DESIGN's literal token names (`--bg #10171c`, `--surface #172129`, `--surface2 #1d2a33`, `--surface3 #23333e`, `--ink #eeeae2`, `--muted #b4c0c6`, `--faint #859aa7`, `--line #354651`, `--accent #ddc485`, `--brass #ccaa72`, `--good #adcead`, `--danger #f0aaa0`), the palette-source comment changes from the Factory reference to the atlases, the typography block becomes Georgia serif (system, 400) for h1–h4/brand/numerals + "Segoe UI"/Arial/system sans for body and chrome + the eyebrow spec (0.66rem uppercase, 1.8px tracking, weight 650, `--accent`), and the component/layout values DESIGN §4 fixes verbatim (card gradient `linear-gradient(130deg,#1b2831,#172129)` + 1px `--line` border + 2px `#536472` top border + 5px radius + 22px padding; `.btn` surface3 fill + 1px `#546775` border + 4px radius; links `--accent`; kbd chips; `.wrap` 100%/`max-width: 3360px`/24px side padding; sticky header ≈170px with backdrop blur; `two-track` 1.65fr/0.8gr; 16px base gap) join the token set; the visual-system prose sections (tokens, typography, components, layout, the semantic remap table: background=`--bg`, surface ladder=`--surface`/`--surface2`/`--surface3`, on-surface=`--ink`, muted=`--muted`/`--faint`, outline=`--line`, primary/warning=`--accent`, success=`--good`, error=`--danger`; badge states verified→`--good`, verify-in-campaign→`--accent`, inferred/historical→`--muted`/`--faint`) are rewritten — Geist is dropped entirely (it existed only in this frontmatter; no font link is added anywhere). `app/styles/tokens.css`: regenerated from the new frontmatter, values verbatim, under the DESIGN's literal names (the `--color-*` naming scheme is retired). `app/styles/app.css`: every token reference retokened to the new names; base typography (serif h1–h4 at 400, sans body, accent eyebrows); the card/button/link/kbd treatments; the `.wrap` full-bleed layout replacing the old container measure; the surviving surfaces (home cards, version banner + chips, flagged items, source panels, prose, ledger table, gap markers, empty/not-found/boot states, skip link) restyled into the atlas language **with their class names unchanged** (markup stays untouched in this commit); the doomed F2-era blocks (`top-nav`, `search-well`, `route-tab-strip`, `route-identity`, `dashboard`, the old route/lord page blocks) get token-reference updates only — a full restyle of markup that Commit 11 deletes would be duplicated work.

**Atomicity:** One outcome: "the Factory visual system is replaced by the atlas token set, typography, and component language" — the frontmatter, the regenerated tokens file, and the retokened/restyled stylesheet are one visual contract (a token rename without the `app.css` update ships an unstyled site; a palette-only swap contradicts the DESIGN's verbatim values *and* new names; a per-surface restyle leaves a half-swapped system with no coherent standalone meaning). Counted estimate: ~1900 changed non-test lines (tokens.css ~60 new + app.css ~1800 changed); the DESIGN.md frontmatter/sections are documentation and excluded. Far above the soft target — justified: no split produces two coherent, independently reviewable, revertible halves with meaningful proof (the proof is the token pin + the build + a rendered look, and all of it attaches to the swap as a whole).

**Out of scope:** Any markup change; the new-page class families (Commits 4–10 append them); the deletion of the doomed blocks (Commit 11); content; the `.wiki/DESIGN.md` close-out reconciliation of the component-surface prose beyond the visual-system sections.

**Implementation packet:** Port DESIGN §4's values verbatim — no re-tuning (the tokens.css provenance rule: values are copied, the provenance source is now the atlases). Keep the token-first rule and the documented exceptions; the new component/layout values become tokens (card fill/borders/radii/padding, button fill/border/radius, wrap measure/padding, header height, two-track split, base gap, eyebrow metrics) so `app.css` stays exception-free. ConfidenceBadge and LedgerTable recolour purely through the retokened semantic roles (badge anatomy untouched). The `test/tokens.test.ts` seam keeps pinning the file (names + hex values verbatim) and additionally asserts no Factory remnant survives: no `oklch(`, no `Geist`, and no `--color-`/`--font-` custom property referenced anywhere in `app.css`.

**Files and responsibilities:** `.wiki/DESIGN.md` — the new frontmatter token set + rewritten visual-system sections (the source `tokens.css` is regenerated from). `app/styles/tokens.css` — the regenerated token file. `app/styles/app.css` — the retokening + restyle. `test/tokens.test.ts` — the re-pinned token assertions + the Factory-absence assertions.

**Tests and proof:** Observable: the token file pins the exact atlas names/hex verbatim; no Factory remnant (oklch, Geist, old custom-property names) in `tokens.css` or `app.css`; every existing suite stays green (no markup changed in this commit — the whole VNode test surface is unaffected by CSS); `npm run build` proves the pipeline. The rendered look (slate canvas, brass accent, serif headings, full-bleed measure) is the honest manual gap: a `npm run serve` capture completes this proof and is reported as evidence, not assumed.

**Validation:** `npm test` (full — the markup-invariance check), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`, then a manual `npm run serve` look (named completing evidence; any skipped capture is reported as a gap).

**Stop conditions:** A DESIGN §4 value that cannot be expressed without a token name the DESIGN does not fix (report the naming question — do not invent a competing token vocabulary); a surviving surface whose class family cannot be restyled without a markup change (report — markup belongs to the view packages, not this one).

**Review mandate:** every value verbatim from DESIGN §4; the semantic remap is exact (primary/warning → `--accent`, success → `--good`, error → `--danger`, badge-state recolor); no oklch/Geist/`--color-*` remnant; token-first discipline preserved (new component values land as tokens, not magic values); zero markup change; the doomed blocks are retokened, not restyled or deleted.

#### Package `elspeth-chrome-content` — Commit 3: Elspeth's crest, environment, and per-route phases

**Status:** Integrated

**Wave:** 2

**Depends on:** ["chrome-content-model"]

**Write scope:** ["content/elspeth-von-draken/crest.svg", "content/elspeth-von-draken/guide.json", "content/elspeth-von-draken/routes/route-1.md", "content/elspeth-von-draken/routes/route-2.md", "content/elspeth-von-draken/routes/route-3.md", "test/elspeth-skeleton.test.ts"]

**Provisional commit:** `feat(content): add Elspeth crest, environment, and route phases`

**Work:** The Elspeth chrome content, extracted from the read-only reference `.work/references/Elspeth_VCO_Expedition_Atlas.html` (never modified): `content/elspeth-von-draken/crest.svg` — the reference `<symbol id="crest" viewBox="0 0 120 120">`'s path data verbatim, wrapped in a standalone `<svg viewBox="0 0 120 120">` root; `guide.json` gains `"crest": "crest.svg"` and `"environment": "Normal / Normal · Smart Autoresolve · VCO · Immortal Empires"` (the atlas topline, verbatim); each of the three route frontmatters gains a `phases:` list of five `{title, note}` entries extracted from that route's atlas `phases` (atlas order preserved; `title` ← the atlas `title`, `note` ← the atlas `aim` — e.g. route 1: "Give Nuln breathing room" / "Win the starting war without creating three additional fronts."). No other content file, dataset, `panelOrder`, section, or gap changes.

**Atomicity:** One outcome: "Elspeth carries its atlas chrome content — crest, environment, and all fifteen phase summaries — lint-clean against the Commit 1 contract" — the crest, the manifest fields, and the three frontmatter lists are one adopted guide (splitting by field would ship a half-adopted guide in some prefix, and each half is unprovable without the others: the crest needs the `crest` field, the phases need the lint rule). Counted estimate: ~40 non-test lines (two manifest fields, three five-entry frontmatter lists, one extracted SVG treated as verbatim data). No further valid split exists.

**Out of scope:** Any rendering (the header/plan packages consume these fields); the other lords (the fields stay optional and unadopted for them); any `.work/references/` modification.

**Implementation packet:** Extraction is verbatim-by-contract: the crest paths are copied character-for-character from the symbol (only the `<symbol>` wrapper becomes the `<svg>` root); the environment string is copied exactly; each phase pair is copied from the matching route's data object in the reference (the reference carries five phases per route — fifteen total, verified). If a route's phases were ever absent or short in the reference, omit the `phases` field for that route (clean absence) and record the actual counts — do not pad or paraphrase. The frontmatter `phases` block uses the **flow list of double-quoted flow maps** — one item per line, `- { title: "…", note: "…" }` (e.g. route 1's first: `- { title: "Give Nuln breathing room", note: "Win the starting war without creating three additional fronts." }`) — because the block list-of-maps shape is not expressible in the current parser (it throws `unexpected indentation`); the values are double-quoted because several `aim` values contain commas. This is the exact shape the Commit 1 lint rule accepts; no parser change.

**Files and responsibilities:** `content/elspeth-von-draken/crest.svg` — the extracted standalone SVG (new file). `guide.json` — the two optional fields. The three `routes/route-*.md` — the `phases:` frontmatter blocks. `test/elspeth-skeleton.test.ts` — the pins for the new content.

**Tests and proof:** Observable: the committed Elspeth guide lints clean with the new fields (`node tools/content-lint.mjs` exit 0); the skeleton suite pins the crest path and the exact environment string, the five phases per route (count, first/last `title` + `note`), and the phase order; the committed tree loads with `crestSvg` containing an `<svg` start tag and three five-entry `phases` lists; every pre-existing assertion (vco 6-7-20, sections, panelOrder, callouts) stays green untouched.

**Validation:** `node tools/content-lint.mjs` (the primary gate for this commit), `node --test test/elspeth-skeleton.test.ts`, then `npm test`, `npx tsc --noEmit`, `npm run build`. No services.

**Stop conditions:** A reference shape that contradicts the extraction rule (a route without five phases, a crest symbol that cannot be wrapped without editing its path data, a topline string that differs from the recorded one) — report the exact mismatch rather than improvising; a lint violation on the committed guide after the edit (the extraction broke a rule — fix the extraction, not the rule).

**Review mandate:** exactly three fields added, verbatim extraction (diff the crest paths and phase text against the reference); no dataset/`panelOrder`/section/gap edit anywhere; `.work/references/` untouched; the other lords and all fixtures untouched.

#### Package `reference-desk-view` — Commit 4: The reference desk view

**Status:** Integrated

**Wave:** 2

**Depends on:** ["atlas-visual-system"]

**Write scope:** ["app/views/desk.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render the reference desk view`

**Work:** `app/views/desk.ts` — the presentational reference desk over `{ lord, route }` (the desk is route-scoped; the resolved route is always supplied by the caller). The desk toolbar: the serif "Reference desk" title + the caption "essentials here, full detail one page away" + the "Compare routes" action — a component-local toggle (the `Dashboard` hook-wrapper + `DeskMarkup` plain-builder seam, so node:test reaches the markup without a DOM). The desk grid: the five numbered panel cards (I Army templates, II Lord & hero skills, III Research priorities, IV Settlement builds, V Unique mechanics — `PANEL_GROUPS` order) in the rendered atlas composition (three columns wide, stacked below ~900px), each card in the desk-panel anatomy: Roman-numeral panel index + serif title, flat numbered item rows in `panelOrder` order (armies: the army `name`; the four item panels: the item `title` — label lines only: no checkbox, no "Read notes", those are deferred scope), and a footer with the item count and a link to the detail page (I→`armies`, II→`armies`, III→`armies`, IV→`settlements`, V→`workshop`, all for this route). The toggle swaps the grid for the route comparison cards — one per manifest route: number, official VCO title or the UNRESEARCHED marker, thematic subtitle, objective, reward, interpretation. Below the grid, the lord-level zone (identical across routes): the Version Banner (VERIFIED AGAINST eyebrow, `patch <X> · VCO <version>`, the open-flags chip with the skip-link scroll/focus idiom or the ALL CLEARED chip), the shared-fundamentals markdown, and the flagged-items section — the F3 implementation's behaviour (the single `getFlaggedEntries` selector rendered exactly once, stable group order, cleared state) with the VIEW links on the new grammar (callouts → `#/<lord>/plan/<routeId>/<sectionId>`, identity/VCO → `#/<lord>/plan/<routeId>`). The view owns this zone from this commit; `lord.ts` keeps its own old-grammar copies until Commit 9 deletes that file. `app/styles/app.css` gains the desk class family (token-only).

**Atomicity:** One outcome: "the reference desk renders its complete surface — toolbar with compare state, the five-card grid, and the lord-level zone" — the compare toggle and the grid share one stateful toolbar, the cards share one anatomy over one `getPanelEntries` read, and the zone is the page's closing contract (a grid without its toolbar/toggle has no compare behaviour; a zone without the page has no home — the page is one render surface with one proof set). Counted estimate: ~330 non-test lines (view ~230, CSS ~100). No further valid split exists.

**Out of scope:** Routing to the desk (Commit 9), the header (Commit 10), any change to `lord.ts` (its deletion lands in Commit 9 with the dispatch), any new query surface.

**Implementation packet:** Panel data comes from the existing `getPanelEntries(lord, route)` — the same `panelOrder` selection the dashboard uses; an empty/absent panel list renders the explicit empty state (mono label + one proportional sentence — the dashboard's `PANEL_EMPTY_COPY` precedent), never a blank card. The comparison cards read `lord.routes` directly (number, `vcoTitle ?? UNRESEARCHED`, `name`, `objective`, `reward`, `interpretation` — an absent `interpretation` renders no line, not a placeholder). The flagged zone imports nothing from `lord.ts`: it re-uses `getFlaggedEntries`, `ConfidenceBadge`, and `resolveSources` directly (the `lord.ts` module is being deleted; no import dependency on a doomed file). The chip keeps the exact F3 idiom (`preventDefault`, scroll + focus `#flagged-items`). Keying: `main.tsx` will key the desk by resolved route id at Commit 9 (the compare toggle resets on a route switch, like the dashboard).

**Files and responsibilities:** `app/views/desk.ts` — the desk view + `DeskMarkup` seam + the zone renderers. `app/styles/app.css` — the desk class family (token-only). `test/views.test.ts` — the desk suite.

**Tests and proof:** Observable (zero-DOM flatten over the real committed tree, the `fsReader`/`inContentCopy` precedent): the toolbar title + caption + toggle; the grid's five cards in I–V order with the Roman indices, the serif-title classes, and the `panelOrder`-ordered flat rows (Elspeth route 1: 5 armies, 10 skills, 4 research, 6 buildings, 5 mechanics rows — assert the committed counts and the first row of each card); the footer count + detail-page href per card; the compare toggle swapping in the three route comparison cards with objective/reward/interpretation (and the UNRESEARCHED marker on `vcoTitle === null`); the lord-level zone: the banner pairing + the 36-flag chip anchor idiom, the shared-fundamentals HTML, and the flagged section with the new-grammar VIEW links (callout rows carry the `plan/<route>/<section>` href, identity/VCO rows the `plan/<route>` href).

**Validation:** `node --test test/views.test.ts`, then `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** A DESIGN card-anatomy requirement the `getPanelEntries` data cannot express (report — no new query surface is invented); a compare-toggle requirement implying persisted state (replan — the DESIGN forbids it).

**Review mandate:** presentational (no I/O; hrefs use the new grammar — the page is dormant until Commit 9, so nothing reachable carries an unverifiable link yet); the flat rows carry no checkbox and no "Read notes"; the compare state is component-local only; the flagged/banner behaviour matches the F3 contract exactly (single selector, one rendering, same count and chip idiom); empty panels get explicit states; CSS is token-only.

#### Package `route-plan-view` — Commit 5: The route plan view

**Status:** Integrated

**Wave:** 3

**Depends on:** []

**Write scope:** ["app/views/plan.ts", "app/views/route.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render the route plan view`

**Work:** `app/views/plan.ts` — the presentational route plan over `{ lord, route, campaign? }` (the atlas's rendered composition): the page head (mono eyebrow "ROUTE <n> · <name>", serif "The campaign plan" title, the one-line intro, and the route badge — official VCO title or the UNRESEARCHED marker); the three-card fact row — PURPOSE (`interpretation`), WHAT ACTUALLY WINS (`objective` + `reward` as Confidence-Badged claims with resolved sources), LIKELY BOTTLENECK (`bottleneck`) — a card is omitted when its field is absent, never an empty card; the two-track body (1.65fr/0.8fr, collapsing to full width when the aside is absent): the left track is the registry-walk section body — `transitionTarget`, `slotAt`, `sectionHeading`, `sectionInnerHtml`, `sectionSources`, `sourcePanel`, `contentGapMarker`, and `TRANSITION_PREFIX` **moved** from `route.ts` behaviour-identically (F7 cross-links to the target `Opening` id or the target route page top — but now with new-grammar hrefs `#/<lord>/plan/<…>`; F3 source panels; gap markers; the H2 section ids that the router anchor targets) — the six registry sections render **phase-numbered**, each carrying its registry-walk-order numeral (1 Opening, 2 Early → Mid, 3 Mid → Late, 4 Victory push, 5 Territory policy, 6 Diplomacy) as a rendered prefix to the H2, and the transition sections render unnumbered (inter-route gap markers, not phases), with the H2 `id` attributes unchanged (anchors still target the section title); the right track is "The operation in five moves" — one numbered card per `route.phases` entry (serif numeral, `title`, `note`), absent when `phases` is (the left track then takes full width, never an empty card). Below the body: the VCO objectives undercard + the campaign action region **moved** from `route.ts` unchanged in behaviour (`RouteCampaignProps`, the start/open/blocked/none derivation over the caller-supplied index — the start flow now lives on the plan page, per the recorded decision; its navigation stays `#/<lord>/ledger/<route-id>`), and the slim panel-navigation strip — four links for this route: the three detail pages + the VCO ledger. `app/views/route.ts` — the moved machinery is removed and imported from `plan.ts` (the old route page keeps rendering identically under the old grammar until Commit 9 retires it). `app/styles/app.css` gains the plan class family (token-only).

**Atomicity:** One outcome: "the route plan renders its complete atlas composition, owning the section-body and campaign machinery that now lives here" — the move and the consumer are one outcome (moving without the consumer strands two copies; building on a copy leaves transient duplication that only this commit can resolve), and the head, fact row, two-track body, undercard, and strip are one page with one proof set. Counted estimate: ~420 non-test lines (plan.ts ~300, CSS ~120; `route.ts` is net negative). No further valid split exists.

**Out of scope:** Routing to the plan (Commit 9), the header (Commit 10), the ledger empty-state copy reconciliation (Commit 9), the `dashboard.ts` removal (Commit 11), any F5 model/I/O change.

**Implementation packet:** The section-body move is behaviour-identical except the href grammar and the heading numeral (the old `route.ts` keeps its old-grammar links until its deletion — so `sectionHeading`'s href builder takes the page segment as a parameter, or `route.ts` keeps a one-line wrapper; the reviewer should see no F7/F3 behaviour drift). `sectionHeading` gains the phase numeral: the six registry sections render their walk-order numeral (1–6) as a prefix to the title, the transition sections render without a numeral, and the heading's `id` stays the section title (so the plan section anchors and F7 cross-links are unaffected — only the rendered text gains the prefix). `transitionTarget` stays exported (the plan owns it now); the `RouteCampaignProps` shape is unchanged so Commit 9 retargets `useRouteCampaign` without touching the view. The fact-row claims reuse `claimBlock`-style rendering with `ConfidenceBadge` + `resolveSources` (one resolution path). The aside is pure data: `route.phases ?? []`; the two-track collapse is a class switch, not a conditional DOM hole.

**Files and responsibilities:** `app/views/plan.ts` — the plan view + the moved machinery + the moved undercard/campaign region. `app/views/route.ts` — imports the moved machinery; renders as before. `app/styles/app.css` — the plan class family (token-only). `test/views.test.ts` — the plan suite (and the route suite, kept green).

**Tests and proof:** Observable (zero-DOM flatten over the committed tree): the head eyebrow/title/badge; the fact row's three cards with the badged objective/reward claims (route 1's `verify-in-campaign` states) and the omitted-card case (a synthetic route without `bottleneck` renders two cards); the section walk over committed route 1 — the registry slots, the two transition-gap cross-links with new-grammar `plan/` hrefs (and the `Opening`-id target where present), the source panels on claim-citing sections, the H2 ids preserved, and the phase numerals — route 1's first section heading renders numeral 1 + "Opening", each of the six registry sections carries its walk-order numeral, and the transition sections render unnumbered with their H2 ids unchanged; the aside with the five phase cards (titles/notes from the Commit 3 content) and the absent-`phases` collapse (synthetic route — left track full width, no empty card); the undercard rows + the campaign action-region states (reusing the existing campaign-index seams against the plan view — start, open, blocked, none); the panel-navigation strip's four hrefs for the current route. The existing `route.ts` suite stays green (its body now comes from `plan.ts` — same rendering, old-grammar links).

**Validation:** `node --test test/views.test.ts`, then `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** Any F7/F3 behaviour drift surfacing during the move (stop — the move must be behaviour-identical; report before restructuring); a DESIGN fact-row mapping that reads a field the `Route` type does not carry (report); a requirement for phase-sub-tab switching (replan — the DESIGN defers it).

**Review mandate:** the section walk is unchanged in behaviour (same slots, ids, gaps, source panels; only the href grammar differs on the plan); the aside is data-driven with a clean absence; the undercard/campaign derivation is moved, not re-derived; `route.ts` renders identically to before; no new query surface; token-only CSS.

#### Package `detail-pages-view` — Commit 6: The three detail pages in the desk-panel anatomy

**Status:** Planned

**Wave:** 4

**Depends on:** []

**Write scope:** ["app/components/deskPanel.ts", "app/components/dashboard.ts", "app/views/panels.ts", "app/styles/app.css", "test/views.test.ts", "test/components.test.ts"]

**Provisional commit:** `feat(app): render the army, settlement, and workshop detail pages`

**Work:** `app/components/deskPanel.ts` — the shared desk-panel anatomy component: the panel head (Roman-numeral index + serif title) and the **full item anatomy moved from `dashboard.ts` behaviour-identically** — army entries (label/name, optional support name, Confidence Badge when the entry carries a state, the LEGENDARY LORD / GENERIC LORD unit columns with the explicit absent marker, optional `context`, `notes[]` and `plan` rows, `size`, resolved source links) and item entries (label, badge when present, title, intro, steps with optional gate/short, optional `details` rows, source links), plus the per-panel explicit empty state. `dashboard.ts` keeps its tab wrapper and imports the anatomy from `deskPanel.ts` (no duplication; the F2 page keeps rendering until Commit 11). `app/views/panels.ts` — three presentational views over `{ lord, route }`, each opening with the desk toolbar (serif page title + the context line "ROUTE <n> · <name>"): `ArmiesAndSkillsView` — "Armies & skills", with the panel tab strip (Armies | Skills | Research — component-local selection, the F2 Dashboard keyboard contract: role=tablist, roving tabindex, Left/Right wrap, Home/End, focus follows, first mount never steals focus; the hook-wrapper + markup-seam pattern) and one tabpanel per panel in the full anatomy; `SettlementsView` — "Settlements & economy", the buildings panel; `WorkshopView` — "Faction workshop", the mechanics panel. `app/styles/app.css` gains the detail-page class family (token-only).

**Atomicity:** One outcome: "the three detail pages render exactly their DESIGN panel sets in the atlas desk-panel anatomy, from the moved full anatomy" — the shared anatomy component has no observable context without its pages, and the three pages share one toolbar + one anatomy (splitting by page would ship three half-anatomy commits; the anatomy-without-pages half has no proof). Counted estimate: ~480 non-test lines (deskPanel.ts ~200, panels.ts ~120, CSS ~160). No further valid split exists.

**Out of scope:** Routing (Commit 9), the header (Commit 10), the `dashboard.ts` deletion (Commit 11), any data-model change (the armies+skills+research | buildings | mechanics split is rendering-only over `getPanelEntries`).

**Implementation packet:** The anatomy move is behaviour-identical (same field order, same absent markers, same `resolveSources` path — `dashboard.ts` imports it, so the F2 page and the anatomy must agree in this commit). The armies-page tabs are the F2 selection contract relocated: no hash segment, no persistence, first tab selected on mount; the desk cards II/III both link to this page and the tab lands on the first panel (the recorded consequence — the grammar has no tab segment). Panel data: `getPanelEntries(lord, route)` per group; empty lists render the explicit empty state (never a blank panel).

**Files and responsibilities:** `app/components/deskPanel.ts` — the panel head + full anatomy + empty state (dumb: props in, UI out). `app/components/dashboard.ts` — imports the moved anatomy (rendering unchanged). `app/views/panels.ts` — the three views + the armies tab wrapper/seam. `app/styles/app.css` — the detail-page class family (token-only). `test/views.test.ts` — the three page suites. `test/components.test.ts` — the `deskPanel` anatomy suite.

**Tests and proof:** Observable: `deskPanel` anatomy (an army entry with both unit columns and the absent-marker case; an item entry with a gated/short step and `details`; the badge rendered only when `state` is present; source links resolved); the three views (toolbar title + "ROUTE <n> · <name>" context line; the armies view's three tabs in order with exactly one visible tabpanel; each panel's rows over the committed Elspeth data in `panelOrder` order; the explicit empty state for a synthetic empty panel); the existing dashboard suite stays green (same anatomy via import).

**Validation:** `node --test test/views.test.ts test/components.test.ts`, then `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** An anatomy field the dataset types do not carry (report); a requirement for tab deep-linking or persistence (replan — the grammar and state policy are fixed).

**Review mandate:** the anatomy is moved, not re-derived (diff against the `dashboard.ts` rendering it replaces); the tabs are component-local only, with the F2 keyboard contract intact; the three pages render exactly the armies+skills+research | buildings | mechanics split over `getPanelEntries`; `dashboard.ts` renders unchanged; token-only CSS; no new dependencies.

#### Package `sources-page-view` — Commit 7: The Sources & settings page

**Status:** Planned

**Wave:** 5

**Depends on:** []

**Write scope:** ["app/views/sources.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render the sources page`

**Work:** `app/views/sources.ts` — the presentational Sources & settings view over `{ lord }`: the desk toolbar (serif "Sources & settings" title + context line), the lord's `data/sources.json` list — one row per entry: number, title as a link to its `url`, and the note — and the explicit deferred settings stand-in (one line: "Appearance settings arrive with a later feature" — the DESIGN's fixed deferred-surface rule; never a blank region). A lord with an absent/empty sources dataset renders the explicit empty state. `app/styles/app.css` gains the page's class family (token-only).

**Atomicity:** One small outcome: "the Sources & settings page lists the committed sources and states what is deferred" — one page, one surface, one proof set (~70 non-test lines counted). No further valid split exists (the list and its deferred line are the page).

**Out of scope:** The settings block itself (a later feature), routing (Commit 9), the header (Commit 10).

**Implementation packet:** The sources come from the lord's `sources` dataset (the existing typed read — no new query). Row copy is descriptive, not contractual; the deferred line is the one DESIGN-fixed string.

**Files and responsibilities:** `app/views/sources.ts` — the view. `app/styles/app.css` — the class family (token-only). `test/views.test.ts` — the page suite.

**Tests and proof:** Observable (zero-DOM flatten over the committed tree): the title + context line; one row per committed Elspeth source (count, link href = the entry `url`, the note text); the deferred line present; the empty state for a synthetic sources-less lord.

**Validation:** `node --test test/views.test.ts`, then `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** A DESIGN requirement for the deferred block beyond the one-line state (report).

**Review mandate:** presentational, no I/O; the source rows mirror `data/sources.json` exactly; the deferred line is explicit copy, never blank; token-only CSS.

#### Package `notes-page-view` — Commit 8: The Field notes page

**Status:** Planned

**Wave:** 6

**Depends on:** []

**Write scope:** ["app/views/notes.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render the field notes page`

**Work:** `app/views/notes.ts` — the presentational Field notes view over `{ lord }`: the desk toolbar (serif "Field notes" title + context line) and the explicit deferred empty state — the label + one sentence ("Notes arrive with a later feature", the DESIGN's fixed deferred-surface rule; the project's empty-state policy: never blank space). `app/styles/app.css` gains the page's class family (token-only).

**Atomicity:** One outcome: "the Field notes page is the explicit deferred state" — one page, one state (~40 non-test lines counted). No further valid split exists.

**Out of scope:** The notes content itself (a later feature), routing (Commit 9), the header (Commit 10).

**Implementation packet:** The view is presentational over `{ lord }` (the lord is received for the toolbar's consistency with the sibling pages); the state is the fixed label + sentence.

**Files and responsibilities:** `app/views/notes.ts` — the view. `app/styles/app.css` — the class family (token-only). `test/views.test.ts` — the page suite.

**Tests and proof:** Observable (zero-DOM flatten): the title + context line; the deferred label + sentence rendered (never a blank region).

**Validation:** `node --test test/views.test.ts`, then `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** A DESIGN requirement for the deferred state beyond the label + sentence (report).

**Review mandate:** presentational; the deferred state is explicit copy, never blank; token-only CSS.

#### Package `atlas-router-grammar` — Commit 9: The atlas hash grammar and app dispatch

**Status:** Planned

**Wave:** 7

**Depends on:** ["reference-desk-view", "route-plan-view", "detail-pages-view", "sources-page-view", "notes-page-view"]

**Write scope:** ["app/router.ts", "app/main.tsx", "app/views/lord.ts", "app/views/ledger.ts", "README.md", "test/router.test.ts", "test/views.test.ts"]

**Provisional commit:** `feat(app): replace the hash grammar with the atlas IA`

**Work:** `app/router.ts` — `parseHash` rewritten wholesale to the DESIGN §2 grammar (the `useHashRoute` hook and the `SEGMENT` slug discipline are unchanged): `#/` or empty → `home`; `#/<lord>` → `{ name: "desk", lordSlug, routeId: null }` (null = the first manifest route, resolved at render); `#/<lord>/sources` / `#/<lord>/notes` → the lord-page member; `#/<lord>/<page>/<route-id>[/<section-id>]` with `<page>` ∈ `desk`/`plan`/`armies`/`settlements`/`workshop`/`ledger` → the route-page member — a fourth segment is valid on `plan` only (a section id under any other route page is not-found); `#/<lord>/<page>` without a route id, any unknown page id, any unknown-but-well-formed shape, and every old shape (`route/<id>`, section anchors under `route/`, the 2-segment `#/lord/ledger`, garbage) → `not-found`. Nothing is mapped for legacy — the old grammar breaks deliberately. `app/main.tsx` — `routeView`'s dispatch becomes the new exhaustive switch: the `desk` case resolves `getLord` + `routeId ?? the first manifest route` (either missing → not-found) and renders the desk keyed by the resolved route id; the lord-page case renders the sources/notes views; the route-page case resolves `getLord` + `getRoute` (not-found otherwise) — `ledger` keeps the existing `LedgerPage` untouched, `plan` renders the plan page with `useRouteCampaign` retargeted from the route case (the hook, its index read, and the start handler are unchanged — the navigation stays `#/<lord>/ledger/<route-id>`), and `armies`/`settlements`/`workshop` render the detail views; the section-anchor effect retargets from the `route` member to the `plan` member (the H2 ids are unchanged). The old `lord` and `route` dispatch cases are gone. `app/views/lord.ts` — **deleted** (its banner/flagged surfaces live on the desk view with new-grammar links from Commit 4; the dispatch no longer reaches it — the removal lands with the outcome that enables it). `app/views/ledger.ts` — the empty-state copy reconciles to the new start location ("NO ACTIVE CAMPAIGN — start one from the route plan"). `README.md` — the run instructions, the hash-grammar table, and the example URLs rewritten to the new grammar.

**Atomicity:** One outcome: "the site's grammar IS the atlas IA — every new shape routes, every old shape deliberately breaks, and the reachable surface set is exactly home + the eight pages + not-found" — the grammar, the exhaustive dispatch, the start-location copy that names where the plan page now lives, and the documented URLs are one contract (the grammar without its dispatch is dead type surface; the dispatch without the grammar is unreachable; the README documenting the old grammar would ship a lie about the same behaviour in the same commit, and the `lord.ts` deletion is enabled by — and only coherent with — the dispatch change). Counted estimate: ~260 counted lines (router ~110, main.tsx ~90, copy 1; `lord.ts` −258 and the README are net deletions/rewrites). No further valid split exists.

**Out of scope:** The header (Commit 10), the remaining obsolete-surface removals (Commit 11), any F5 model/I/O/lifecycle change, any view behaviour change beyond the named copy line.

**Implementation packet:** The parse table is the DESIGN §2 table plus its rules 1–4 verbatim — in particular `#/<lord>/desk` (no route id) is not-found, and a section id under a non-plan route page is not-found. First-route resolution is one small helper at the dispatch site (deterministic; the routebar will render the selection from Commit 10 — never a hidden guess). The `useRouteCampaign` retarget is a move of the existing hook invocation to the `plan` case — no logic change. Before deleting `lord.ts`: verify each of its surviving-behaviour test assertions (banner pairing, chip idiom, flagged grouping, cleared state) has an equivalent in the Commit 4 desk suite; port any missing equivalent into the desk suite in this commit rather than dropping it. The `router.test.ts` rewrite re-labels the old table: every old `route/<id>` entry now expects not-found; the `ledger/<route-id>` entry keeps parsing (as the route-page `ledger` member) so the F5 flows stay green.

**Files and responsibilities:** `app/router.ts` — the new grammar (pure, exported). `app/main.tsx` — the new exhaustive dispatch, the retargeted campaign hook + anchor effect. `app/views/lord.ts` — deleted. `app/views/ledger.ts` — the one-line copy reconciliation. `README.md` — the grammar table + URLs. `test/router.test.ts` — the new table. `test/views.test.ts` — the lord suite pruned (with any ported equivalents), the ledger copy assertion updated.

**Tests and proof:** Observable: the full `parseHash` table — each new shape parses (all eight page forms, the section anchor on `plan`, the `ledger` 3-segment shape unchanged), and the not-found set is pinned: every old shape, `#/<lord>/desk`, a section under `armies`, unknown page ids, traversal/punctuation garbage; the F5 flows' hashes still parse; the pruned lord suite's surviving-behaviour equivalents pass on the desk suite; the ledger empty-state assertion carries the new copy. The manual `npm run serve` smoke (deep-link one new shape, one old shape → not-found, reload restores) completes the proof.

**Validation:** `npm test` (full — the F5 suites, the ledger I/O spawned-server suite, and every new-page suite must be green on this prefix), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`, then the manual `npm run serve` smoke (named completing evidence).

**Stop conditions:** A committed flow (e.g., a ledger start/link) whose hash the new grammar misparses (report — the grammar is DESIGN-fixed); a referenced view module missing (replan — the dependency list above is the contract); a surviving `lord.ts` behaviour without any equivalent desk-suite proof (stop and port it — no weakened test).

**Review mandate:** the grammar matches DESIGN §2 exactly (including the `#/<lord>/desk` not-found, the plan-only anchors, and the unchanged `ledger` 3-segment shape); no legacy mapping exists anywhere (grep for `route/` href builders outside the pruned history); the dispatch is exhaustive with an explicit not-found, never a fallthrough; the F5 behaviour is untouched apart from the copy line; the README matches the shipped grammar; first-route resolution is explicit and deterministic.

#### Package `atlas-header-shell` — Commit 10: The three-tier atlas header

**Status:** Planned

**Wave:** 8

**Depends on:** ["atlas-router-grammar"]

**Write scope:** ["app/components/atlasHeader.ts", "app/main.tsx", "app/styles/app.css", "index.html", "test/components.test.ts"]

**Provisional commit:** `feat(app): add the three-tier atlas header`

**Work:** `app/components/atlasHeader.ts` — the shell header: a plain markup builder + thin hook wrapper (focus-follow after a keyboard selection — the `TabStripMarkup` seam pattern), rendering one of two forms derived from the route — **slim** (home, not-found, boot loading/error: the wordmark + one link per lord to `#/<lord>`) or **full** (every lord-scoped page, three tiers): (1) the topline — the crest (the `Lord.crestSvg` inlined `aria-hidden`; absent crest ⇒ the brand without it, no placeholder box) + the brand (faction uppercase / "EXPEDITION ATLAS · <lord>") linking to `#/<lord>`, the environment line (the status dot + `guide.environment` when present) plus the existing `patch <X> · VCO <version>` pairing, and the empty toolbar slot (no buttons — reserved for F6/search and state export); (2) the routebar — the "YOUR CAMPAIGN / Victory route" eyebrow pair + the three route tabs (serif numeral, route name, official VCO title dimmed or the UNRESEARCHED marker; the SELECTED indicator derived from the hash), following the existing TabStrip keyboard contract (role=tablist, roving tabindex, arrow/Home/End, focus follows, first mount never steals focus) — the tab hrefs per DESIGN rule 3: from a route-scoped page the tab targets the *same page* under the new route (the `#/<lord>` default-route desk counts as route-scoped: it targets `desk/<new-route>` — the recorded decision), and from home/lord-scoped pages it targets `plan/<new-route>`; (3) the pagenav — the eight page tabs (Reference desk, Route plan, Armies & skills, Settlements & economy, Faction workshop, VCO ledger, Field notes, Sources & settings) with the hash-derived selection (page tabs from a lord-scoped page resolve to the first manifest route — rule 3), plus the static save-state line "Saved locally · offline" (the rendered atlas string; it claims nothing about autosave). `app/main.tsx` — renders the header (form chosen by the route; the boot states use the slim form) and the old `top-nav` + wordmark-move effect are deleted. `index.html` — the `#wordmark` slot is removed (the header owns the wordmark). `app/styles/app.css` — the sticky three-tier header treatments (≈170px, backdrop blur, the two tablists scrolling horizontally below ~900px) replacing the `top-nav` styles in place (the old class blocks themselves stay until Commit 11's orphan purge).

**Atomicity:** One outcome: "every lord-scoped page renders the persistent three-tier context — who, what environment, which route, which page — derived entirely from hash + content, with the slim form on the unscoped states" — the slim/full forms share the brand/crest derivation, and the routebar/pagenav selection is one hash-derived rule with one keyboard contract (splitting the tiers would ship a header whose selection semantics are half-built; the slim form is the same component's other branch, not a separate surface). Counted estimate: ~380 non-test lines (component ~260, main.tsx ~80, CSS ~180 minus the deleted top-nav styles). No further valid split exists.

**Out of scope:** Any view change; the obsolete view/component deletions (Commit 11); the toolbar's future buttons (F6); any persistence.

**Implementation packet:** The href-derivation table is DESIGN rule 3 made mechanical: a pure helper mapping (current route member, target route) → href, covered by the table test below — this is the review surface for the "same page under the new route" and first-manifest-route resolution rules. The brand's reduced forms: no `crestSvg` ⇒ no crest element; no `environment` ⇒ the line without it (the patch/VCO pairing always renders). The pagenav labels are the DESIGN's generic eight (not the atlas's faction-specific "Gunny & Morr"); the VCO ledger tab targets `ledger/<route>` like the others (first manifest route from a lord-scoped page). Selection is read from the route member only — no `useState`. The keyboard helper is a small pure function local to this module (the 8-line `tabNav` pattern; `TabStrip.ts` is deleted in Commit 11, so the helper does not import from a doomed file — the temporary duplication is recorded and dies with Commit 11).

**Files and responsibilities:** `app/components/atlasHeader.ts` — the header markup builder, the two forms, the href-derivation helper, the keyboard contract. `app/main.tsx` — the header render + the top-nav/wordmark-effect removal. `index.html` — the `#wordmark` slot removed. `app/styles/app.css` — the header class family (token-only). `test/components.test.ts` — the header suite.

**Tests and proof:** Observable (zero-DOM markup-builder tests over constructed route members + the committed tree): the slim form on home/not-found (wordmark + one lord link each, `#/<slug>`); the full form's three tiers on every lord/route shape; the crest rendered `aria-hidden` from `crestSvg` and absent for a crest-less synthetic lord; the environment line present/absent reduced forms; the three route tabs with the hash-derived SELECTED (including `#/<lord>` selecting the first manifest route); the route-tab href table (route-scoped keeps the page — incl. the desk-at-`#/<lord>` case; lord-scoped targets `plan/<route>`); the eight pagenav hrefs per current page with the first-manifest-route resolution from `sources`/`notes`; the save-state line's exact static text. The `main.tsx` glue (form choice across boot states, focus behaviour, reload persistence) is the named manual gap: the `npm run serve` boot proves the header on every page, keyboard tab navigation, and reload restoring the hash-derived selection (the `useHashRoute` precedent).

**Validation:** `node --test test/components.test.ts`, then `npm test`, `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`, then the manual `npm run serve` boot (named completing evidence; keyboard + focus-visible + reduced-motion checked against the DESIGN pre-delivery checklist).

**Stop conditions:** A selection case DESIGN rule 3 does not determine (record it as a decision with its consequence — do not invent a new behaviour); a keyboard contract the TabStrip idiom cannot carry (report).

**Review mandate:** every visible state is hash- + content-derived (no component state for selection); the keyboard contract matches the F2 TabStrip idiom on both tablists; the brand/environment reduced forms never render placeholders; the toolbar is an empty slot (no buttons); the `#wordmark` slot and its effect are gone; the old `top-nav` markup is gone from `main.tsx` (its CSS orphans wait for Commit 11); token-only CSS; no other `main.tsx` change.

#### Package `obsolete-surfaces-removed` — Commit 11: Remove the replaced Factory-era surfaces

**Status:** Planned

**Wave:** 9

**Depends on:** ["atlas-header-shell"]

**Write scope:** ["app/views/route.ts", "app/components/TabStrip.ts", "app/components/dashboard.ts", "app/styles/app.css", "test/views.test.ts", "test/components.test.ts"]

**Provisional commit:** `refactor(app): remove the replaced factory-era surfaces`

**Work:** The DESIGN's deliberate-breakage close-out: "the F2 dashboard-tab components and the old header/lord/route DOM are replaced; tests asserting them are rewritten, not preserved." Delete `app/views/route.ts` (its body and campaign machinery moved to `plan.ts` in Commit 5; the old `route/<id>` grammar no longer exists), `app/components/TabStrip.ts` (the routebar/pagenav own the keyboard contract from Commit 10), and `app/components/dashboard.ts` (the F2 five-tab dashboard is retired — its anatomy lives in `deskPanel.ts` from Commit 6). Prune `test/views.test.ts`'s route-page suite and `test/components.test.ts`'s TabStrip + dashboard suites — the removed behaviours' obsolete assertions are deleted, **not weakened**: before any assertion is deleted, verify it has a surviving equivalent (the plan suite owns the section-walk/anchor/transition/source-panel/gap-marker proofs from Commit 5; the detail-page and desk suites own the anatomy proofs from Commits 4/6; the header suite owns the tablist proofs from Commit 10) and port any missing equivalent into its surviving suite in this commit. `app/styles/app.css` — delete the now-orphan class blocks (`top-nav*`, `search-well*`, `route-tab*`, `route-identity*`, `dashboard*`, and any other block with zero remaining references); the purge rule is reference-verified at implementation: a block is deleted only when no surviving file references its class names — the section-walk classes (`route-section*`, `source-panel*`, `gap-marker*`), the version banner, flagged items, the undercard (as renamed/reused by `plan.ts`), the ledger, and the home card families are retained (still referenced). The `tsc --noEmit` gate proves no dangling import survives.

**Atomicity:** One outcome: "the replaced Factory-era surfaces are gone from the codebase" — the three file deletions, the pruned suites, and the orphan-CSS purge are one removal contract (deleting a component while its suite remains leaves a red tree; deleting the suite while the file remains is exactly the weakening the project forbids; the CSS blocks are orphan-safe only once their markup is gone). Counted estimate: net ~0 added lines (a deletion-dominant commit: three source files, their suites, and the orphan CSS blocks; the ported equivalents are small additions). No further valid split exists.

**Out of scope:** Any new behaviour; any retained class block or view; the `.wiki` reconciliation (close-out).

**Implementation packet:** Work the purge by grep: for each class family in `app.css`, count references across the surviving `app/` set and delete the block only at zero. `plan.ts` reuses the section-walk classes deliberately (the F7 anchors land on the same H2 ids) — those stay. The dashboard's `PANEL_EMPTY_COPY`-style empty states live in `deskPanel.ts` now (Commit 6) — the dashboard block itself goes. After the deletions, `npm test` must discover and run the pruned files (no dead test files left behind), and the F5 suites, content suites, and server suite are untouched.

**Files and responsibilities:** `app/views/route.ts` — deleted. `app/components/TabStrip.ts` — deleted. `app/components/dashboard.ts` — deleted. `app/styles/app.css` — the orphan block purge. `test/views.test.ts` — the route suite pruned (+ ported equivalents). `test/components.test.ts` — the TabStrip/dashboard suites pruned (+ ported equivalents).

**Tests and proof:** Observable: the full suite green after pruning, with each pruned assertion's surviving equivalent named (the section-walk proofs on the plan suite, the anatomy proofs on the desk/detail suites, the tablist proofs on the header suite); no test file left importing a deleted module (the `tsc --noEmit` gate proves it); the orphan-CSS rule holds (grep-verified zero references for every deleted block; every retained block still referenced).

**Validation:** `npm test` (full — suite discovery over the pruned files), `npx tsc --noEmit` (the dangling-import proof), `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** A class block whose ownership between `plan.ts` and the old `route.ts` is ambiguous (retain it and record it — do not delete on a guess); a pruned assertion with no surviving equivalent that cannot be ported (stop — that is a weakened test).

**Review mandate:** exactly the three files gone; the F2 dashboard components are gone from the codebase (the DESIGN acceptance item); the retention rule held (nothing still referenced is deleted — the section/anchor/source-panel/gap-marker classes survive with the plan page); no test weakened (every surviving behaviour keeps an equivalent proof); no behaviour change of any kind.

## Discoveries and replanning

Record material deviations, blockers, and decisions that change remaining work. State what was planned, what changed, and why. Preserve unchanged IDs. Mark replaced packages or PRs `Removed — <reason>` and add new stable IDs; never reuse an old ID for a different outcome.

* (Empty at plan acceptance; the coordinator appends execution discoveries here.)
- Commit 2 (atlas-visual-system): the Jev overengineering gate could not evaluate the staged candidate (168,859-char diff) — the Jev API returned HTTP 400 `max_tokens_exceeded` (model input limit; a 57KB subset evaluates fine). The developer explicitly accepted the gate gap for this candidate (2026-10-04); the mandatory independent commit review still runs (Jev review routing is unavailable at this size for the same reason).

## Final validation

Exact gates, in order, before final feature review:

1. `npm test` — the full `node --test` suite green: the content-model/lint/CLI suites with the three optional fields, the re-pinned token suite, the Elspeth extraction pins, the desk/plan/detail/sources/notes VNode suites, the rewritten router table, the header suite, the F5 suites (logic/state/io/server) unchanged, and the pruned route/TabStrip/dashboard suites gone.
2. `npx tsc --noEmit` — clean over `app/`, `tools/`, `test/` (no dangling import to a deleted module; the new `HashRoute` union compiles across the dispatch and the header).
3. `node tools/content-lint.mjs` — exit 0 on the committed `content/` (the crest file, the environment string, and the fifteen `phases` entries all pass the new contracts).
4. `npm run build` — static `dist/` produced; `package.json` diff empty (no new dependencies; `preact` + `markdown-it` only).
5. Manual HTTP boot (`npm run serve` after a fresh `npm run build`): `#/elspeth-von-draken` renders the reference desk with route I SELECTED in the routebar; the route tabs keep the current route-page when switching routes and target `plan/<route>` from `sources`/`notes`; the pagenav resolves first-manifest-route from lord-scoped pages and survives a full reload (hash-derived); the compare toggle swaps the grid for the three comparison cards; the plan page renders the head, the fact row, the phase-numbered section headings (numeral prefix on the six registry sections 1–6, transition sections unnumbered) and the section anchors (a `plan/<route>/<section>` deep link scrolls to the H2), the five-moves aside, the undercard start flow (start from the plan lands on `#/<lord>/ledger/<route-id>`; F5 lifecycle end-to-end unchanged), and the four-link panel strip; the detail pages render their panel sets with the armies-page tab keyboard contract; Sources lists the committed entries with the deferred line; Field notes shows the deferred state; an old hash (`#/elspeth-von-draken/route/route-1`) renders not-found; keyboard tab navigation (arrows, Home/End, `:focus-visible`) works on both header tablists; the rendered look matches the atlases (slate/brass, serif headings, full-bleed measure, sticky three-tier header) — a rendered capture is the evidence.
6. The DESIGN §7 acceptance criteria checked item by item (every item maps to the packages above), including the "F2 dashboard-tab components are gone from the codebase" check, the no-Factory-remnant check, and the DESIGN pre-delivery checklist (keyboard-operable controls, `:focus-visible`, no colour-only meaning) on the new surfaces.

Report any skipped or unsupported validation step as a gap, never as a pass (known honest gaps: the header/`main.tsx` glue and all CSS have no node:test seam — the manual boot + capture is their completing proof, the `useHashRoute` precedent).

## Documentation impact

Complete during reconciliation at feature close-out (coordinator/steward, not package work):

- `.wiki/TODO.md` — already updated to `Active` with the ledger link (this planning dispatch); moved to `Completed` only after verified final integration.
- `.wiki/PRD.md` — the F10 entry lands with the feature's acceptance (per the accepted DESIGN §7).
- `.wiki/DESIGN.md` — the visual-system sections and frontmatter are rewritten in Commit 2 (the token provenance flips to the atlases); the remaining component-surface prose (the fixed surfaces' new homes, the recoloured badge table, the pre-delivery checklist) is reconciled at close-out against the implemented state.
- `.wiki/ARCHITECTURE.md` — §1.2 current state and the module layout gain the implemented facts: the new grammar, the `atlasHeader`/`deskPanel` components, the new view set, the deleted surfaces, and `load.ts`'s crest-read role; the "partially implemented" F-list note updates.
- The accepted ATLAS-UX-REALIGNMENT-DESIGN.md and this ledger stay in place through completion; the ledger's Discoveries section is the record for any wording-vs-implementation differences.
- The accepted planning artifacts (DESIGN + this ledger) are committed to the tracked `.wiki/` in a separate authorized Git operation before execution — never as part of an implementation package.
