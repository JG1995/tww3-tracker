# Feature: Elspeth Migration (F4 — Seed content migration)

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** Restructure the pilot atlas (`.work/references/Elspeth_VCO_Expedition_Atlas.html`) into the committed content model so every Elspeth route renders all registry sections with real content and all five dashboard panels render populated items — a content-only migration, with the model corrected once where the atlas genuinely fights the schema.

**Context:** F1 (site-foundation) delivered the content model, loader, lint, and the committed Elspeth skeleton: route frontmatter already matching the atlas's identity fields, all 35 sources, six empty typed datasets, and each route declaring seven body-section gaps. F2 (route-first rendering) delivered the fixed registry sections, the typed dataset schemas, `::claim` callouts, `panelOrder` id resolution, and the dashboard panels. F4 fills that structure with the atlas's actual content. F5 (VCO ledger) consumes the stable objective-item ids this feature writes to `data/vco.json`; F3 (verification notes UI) and F7 (route transitions) build on the claims and transition sections this feature fills. The development sequence approves F4 as the model's first real stress test: "model corrected once, before any second faction copies it."

**Non-Goals:**

- No ledger of any kind: no campaign state, no ticks, no write path (F5). `data/vco.json` carries the researched objective items only.
- The atlas's browser-local interactive state — its per-user field notes, checklist ticks, and saved view preferences (localStorage in the original file) — is not seed content; it is an F5-class feature and is excluded as such, not migrated.
- No new components, new routes, or changed rendering behavior. F1/F2 own the shell; this feature changes committed content files, and only that.
- No change to `.work/references/` — the raw archive stays untouched (it is gitignored and remains the dispute reference).
- No other faction (v1.1 work), no new project dependencies, no new content files beyond `content/elspeth-von-draken/` and `content/index.json` when its shape requires it.

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Content files (developer input):** the migration edits exactly the files the skeleton already committed — `content/elspeth-von-draken/guide.json` (only when a dataset/manifest field must change), the three `routes/route-N.md` documents, `shared.md`, and the seven `data/*.json` files. No new file names are invented unless the recorded model adjustment requires one; any such file follows the established `content/<lord-slug>/` layout.

### Displayed Data

- **Route identity card:** unchanged shape from F2 — number, official VCO title, thematic subtitle, objective and reward claims, interpretation, bottleneck, motto. The content behind it comes from the atlas's per-route fields (`name`, `motto`, `objective`, `reward`, `summary`, `bottleneck`).
- **Route body sections:** the fixed registry H2 sections — `Opening`, `Early → Mid`, `Mid → Late`, `Victory push`, `Territory policy`, `Diplomacy`, and two `Transition → route-<x>` sections — now carrying the atlas's phase, territory, diplomacy, and transition prose instead of gap markers.
- **Dashboard panels:** all five panels (Army templates, Skills, Research, Settlements, Mechanics) render this route's `panelOrder` items from the filled datasets; each panel is populated, never in the empty state, after migration.
- **VCO objective items:** the per-route objective list under the route identity, rendered from `data/vco.json` (items only — no progress of any kind).
- **Confidence badges:** on objective/reward claims, on `::claim` callouts in section prose, and on any dataset item carrying a `state`.
- **Shared page (lord page):** the faction introduction plus the atlas's four shared blocks (common foundation, Smart Autoresolve boundary, economy budget, equipment guidance) as H2 sections in `shared.md`.

### Persistent Data

- **Guide content:** `content/` in the repository — the migration's output is committed plain-text Markdown and JSON, editable without running the site (PRD technical constraint).
- **Raw archive:** `.work/references/` is gitignored, read-only reference. The migration reads it and never writes it.
- **The system must NOT persist** any campaign or user state: the atlas's localStorage notes/checklist/view state is deliberately not reproduced in the site; the only persistent documents after this feature are the guide content files.

## 3. The User Journey (Step-by-Step)

### Journey A — Reading the migrated guide (the player)

1. **Entry Point:** `npm run serve` (F1 reading path); home → Elspeth lord page.
2. **Action 1:** open any route tab.
3. **System Response:** the route page renders the identity card (motto, objective and reward with badges, interpretation, bottleneck), then every registry section in order — Opening through Victory push, Territory policy, Diplomacy, both transitions — each with the atlas's content and in-flow `::claim` callouts where a VCO/patch-dependent claim appears.
4. **Action 2:** open the dashboard region; switch panels.
5. **System Response:** Army templates shows this route's five templates (early/mid/late/amethyst/home) with unit counts, roles, kind, and legendary vs generic columns; Skills, Research, Settlements, and Mechanics each show this route's `panelOrder` items with steps, gates, and source links; the VCO objective list sits under the identity.
6. **Success State:** the whole guide is usable end-to-end without opening the raw HTML: every section that the skeleton declared as a gap now has content, and no panel shows the empty state.

### Journey B — Executing the migration (the content developer)

1. **Entry Point:** the atlas file, read as its embedded `guide-data` JSON plus its rendered prose; the committed skeleton.
2. **Action 1:** build a content inventory of the atlas — every route field, phase, dataset entry, shared block, evidence note, and standalone prose block, each named.
3. **Action 2:** map every inventory block to a target: route frontmatter, route body section, dataset entry (with the panel id and the route's `panelOrder` entry), `shared.md` section, or an explicit exclusion with reason (the only permitted exclusion: browser-local interactive state).
4. **Action 3:** write the content files, assigning exactly one confidence state to every VCO/patch-dependent claim and `src` ids to every claim that carries evidence; fill `data/vco.json` with stable per-route objective item ids.
5. **Action 4:** run `node tools/content-lint.mjs` until clean, then the full gate.
6. **System Response:** lint exit 0; every mismatch between atlas and restructured content was resolved in favor of the atlas and noted; the inventory has no unmapped, unexcluded block.
7. **Success State:** the committed content renders the complete guide through the existing F1/F2 code, lint-clean, with the archive byte-for-byte untouched.

## 4. Logical Constraints (The "Rules of the Road")

### Source authority and completeness

- **IF** the atlas and the committed skeleton disagree on any identity field or claim text, **THEN** the atlas wins (PRD F4); the discrepancy is noted in the implementation ledger's discoveries.
- **IF** an atlas content block is not present in the migrated content, **THEN** it appears in an explicit exclusion list with a reason in the ledger — the only accepted reason is "browser-local interactive state (F5-class feature)"; any other absence is a violation of this contract.
- **The atlas file itself is never edited**: `.work/references/` is a gitignored read-only archive; the migrated content is its structured copy, and the diff between archive and `content/` stays inspectable (ADR-0002).

### Route documents

- **IF** a route document is written, **THEN** it keeps the fixed frontmatter contract (id, number, name, `vcoTitle: null`, motto, objective/reward as `{text, state, src}` claims, interpretation, bottleneck, transitions, `panelOrder`) and its body is only registry H2 sections in registry order.
- **Phase mapping:** the atlas's five phases map onto the registry as: `Opening` → `Opening`; `Early` → `Early → Mid`; `Mid-game` + `Late` → `Mid → Late`; `Victory` → `Victory push`. `territory` → `Territory policy`; `diplomacy` → `Diplomacy`; each `transitions` entry → its `Transition → route-<x>` section.
- **IF** a section receives atlas content, **THEN** its entry is removed from the route's `gaps` list; **IF** the atlas has no content for a registry section, **THEN** the gap stays declared and renders its marker — gaps are never deleted to look complete.
- **Route-level prose** (`type`, `armyIdentity`, `avoid`, `recommended`, the army/economy/mechanics priorities, and the per-item `use` notes) is woven into the most relevant registry section body or the referenced dataset item's `intro`/`details` — kept as recognizable prose, never dropped and never restated in more than one home.
- **`vcoTitle` stays `null` for all three routes:** the public VCO guide publishes route numbers, not Elspeth's in-game route names, and the atlas research deliberately left them unknown. The identity card's explicit unresearched marker is the honest state; a known official title is a later content edit, not a migration assumption.

### Datasets

- **Armies:** `data/armies.json` holds three route maps with the atlas's five entries each (`early`, `mid`, `late`, `amethyst`, `home`), mapped field-for-field to the F2 army schema (`units[]`, the legendary-lord column from the atlas's Elspeth column, the generic-lord column, `notes`, `plan`, `size`, `sources`).
- **Skills:** the atlas's ten skill entries map one-to-one to `data/skills.json` (`label`, `title`, `intro`, `steps` with gates, `details`, `sources`).
- **Research:** the four shared groups map to `data/research.json`; a route's `researchOverrides` entry is a distinct entry id (the F2 per-route-variant rule) and is listed only in that route's `panelOrder`; the 15 named techs fold into their research entries as steps/details rather than a seventh dataset.
- **Settlements:** the atlas's nine build roles map one-to-one to `data/buildings.json`.
- **Mechanics:** the atlas's five mechanic entries map one-to-one to `data/mechanics.json`; the 4 field tests become gated steps of the Field Testing entry, the 8 upgrades and 4 Amethyst paths become steps/details of their mechanic entries or the referencing army's notes — each keeps its atlas text and `src`.
- **Panel order:** each route's `panelOrder` names exactly the entries the atlas's route panel listed, in the atlas's order; every id resolves (the lint enforces this).
- **VCO items:** `data/vco.json` is a map of route id → ordered objective items with stable ids — Route I: the five named faction targets plus the 35-battle item; Route II: the seven named provinces; Route III: the twenty published candidate settlements — matching the atlas's own tracker item set. Each item carries a confidence state and `src` like any VCO claim. These ids are the stable ids the F5 ledger will tick; they are never renumbered later.
- **Sources:** `data/sources.json` keeps the committed 35 entries; an atlas claim references an existing source id, and a genuinely new source is added to the same file with the same shape.

### Confidence states

- **IF** a claim depends on VCO behavior or current patch data, **THEN** it carries exactly one of the four states; claims that do not depend on either (thematic strategy reasoning stated as such) carry `inferred`, and nothing is left unattributed (PRD F3 acceptance).
- **State assignment policy:** atlas hedges about live behavior ("check the live…", "check the exact active requirement") → `verify-in-campaign`; facts taken from the extracted game data or primary references the atlas verified (skill trees, tech names and prerequisites, building chains, Elspeth/Empire mechanics) → `confirmed`, keeping the source's in-game-precedence note; strategic reasoning → `inferred`; statements about superseded implementations → `historical`.
- **IF** a VCO/patch-dependent claim sits in route body prose, **THEN** it is a `::claim <state> [src=…]` callout; dataset items and objective/reward carry the typed `state`/`src` fields. The atlas's seven evidence notes fold into the claims and items they support with their `src` ids.

### Model adjustment allowance

- **IF** an atlas content block cannot be expressed by the fixed schemas, **THEN** the migration makes the minimal schema/lint adjustment that expresses it — recorded as a material discovery in the ledger with the atlas block that forced it — instead of dropping or distorting the content. This is the sequence's one approved "model corrected once" step, and it must not change rendering behavior for content that already fits.
- **The model is never forked per faction:** no Elspeth-only schema branch (PRD Flow 4).

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- **Lint violation after migration (dangling `src`, unresolvable `panelOrder` id, schema break, bad state):** the commit gate refuses it — fix the content file, not the lint; the lint's vocabulary and schemas are accepted contracts, and a change to them is a recorded model adjustment, not a workaround.
- **Ambiguous atlas block (two plausible target sections):** the migration chooses the section that owns the decision the block guides, keeps the full text, and notes the choice; the atlas wording wins over any skeleton wording in the same place.

### Empty States

- **No empty states may remain after migration:** every one of the five panels on every route renders populated items, and every previously declared gap either has content or a live gap marker for a section the atlas genuinely lacks. A panel still showing its empty state is an unmapped content block, i.e. a contract violation.

### Boundary Cases

- **Route variants of shared items (research overrides):** both routes render their own entry independently from the same dataset file; the shared entry and the override coexist under distinct ids (F2 behavior, content-only here).
- **Long unit lists and long steps:** rendering is F2's; the migration supplies counts, roles, and kind per the schema and does not truncate atlas content to fit — if a list is long, the list is long.
- **A claim that is both strategy and VCO-dependent:** the stricter state wins — `verify-in-campaign` when live VCO behavior is in doubt, even if the surrounding advice is inference.

### Interruptions

- **Migration interrupted between files:** the content tree must stay lint-clean at every committed prefix — files are committed in an order where each commit's content set passes `content-lint` (a partially filled dataset with a `panelOrder` already pointing at it would not; the mapping keeps commits whole).
- **Site reloaded mid-edit:** unchanged F1 policy — manual reload picks up content; there is no write path to interrupt.

## 6. Interface & Interaction (The "Look and Feel")

### Visual Style

Unchanged. The migration inherits the F1/F2 rendering of the `.wiki/DESIGN.md` system wholesale — identity card, section rhythm, badges, gap markers, dashboard panels. Nothing visual is a migration decision.

### Layout

Unchanged. The only layout-visible effect is the intended one: gap markers disappear where content lands, panels fill, and the VCO objective list appears under each route identity.

### Copywriting

The atlas's own copy is the content. No new UI copy is introduced by this feature; section headings use the fixed registry titles (already contractual from F1/F2), and dataset labels/entries keep the atlas's wording except where the atlas and skeleton conflict, in which case the atlas wins.

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] Every atlas content block is present in `content/elspeth-von-draken/` or listed in an explicit, reasoned exclusion; the only accepted exclusion is the atlas's browser-local interactive state. The inventory and mapping are recorded in the implementation ledger.
- [ ] `.work/references/` is byte-for-byte unchanged; the migration commits no file outside `content/` (plus any recorded model adjustment's schema/lint files).
- [ ] All three route documents carry full bodies: every registry section has atlas content, the `gaps` lists contain only sections the atlas genuinely lacks (expected: none), and objective/reward claims, interpretation, bottleneck, and transitions match the atlas.
- [ ] `vcoTitle` is `null` on all three routes; the identity card renders the explicit unresearched marker, never an invented title.
- [ ] All five dashboard panels on every route render populated items: 15 army entries with unit rows, legendary vs generic columns, notes, and plans; 10 skills; the research groups plus per-route overrides as distinct entries under the right `panelOrder`; 9 settlement roles; 5 mechanics including the field tests, upgrades, and Amethyst paths.
- [ ] `data/vco.json` holds the per-route objective item lists with stable ids (5 targets + 35-battle item / 7 provinces / 20 candidates), each item carrying a state and `src`.
- [ ] Every VCO/patch-dependent claim carries exactly one of the four confidence states per the assignment policy; in-prose claims are `::claim` callouts; the seven evidence notes are folded in with their `src` ids; no fabricated trigger or completion claim exists.
- [ ] `shared.md` carries the faction introduction plus the four shared blocks.
- [ ] `node tools/content-lint.mjs` exits 0, `npm test` passes, `npx tsc --noEmit` is clean, `npm run build` succeeds, and the `npm run serve` HTTP boot check shows the fully rendered guide (no gap markers where content landed, no empty panels).
- [ ] `package.json` is unchanged (no new dependencies); no rendering component was modified for content that fit the existing schemas; any model adjustment is minimal, recorded in the ledger with the forcing atlas block, and fork-free.
