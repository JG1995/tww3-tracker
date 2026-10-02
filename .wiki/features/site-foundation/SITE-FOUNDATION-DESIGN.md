# Feature: Site Foundation (F1 — Guide site with shared structure)

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** Ship the site foundation in one feature — the Preact + Vite + TypeScript app shell, the complete content model (file layout, manifests, route document schema, confidence-marker syntax, content-gap policy), the content loader and query layer, the content lint, a dependency-free local static server, and a lint-clean Elspeth content skeleton — so that every later feature is either content or rendering of this model.

**Context:** This is the first application code in the repository (ARCHITECTURE §1.2: none exists). It implements the approved target direction in ARCHITECTURE §1.1 and ADR-0001 (Vite + Preact SPA, runtime-loaded content, no SSG) and ADR-0002 (Markdown + frontmatter for prose, JSON for structured data, confidence states as explicit markers). It realizes PRD F1 and owns the content-model IA that the roadmap names as its core output (`.wiki/DESIGN.md`'s content-model section is filled from this DESIGN at the milestone reconciliation, per the PRD's document-ownership split). F2 (route-first rendering), F3 (verification notes), F4 (Elspeth migration), F5 (ledger), F6 (search), and F7 (transitions) all depend on it; it depends on nothing but the accepted documentation.

**Non-Goals:**

- No route content rendering beyond the F1 route view (structured sections, route tabs, dashboard panels, confidence badges — F2).
- No verification-notes UI beyond what the schema carries (version banner, source panels, flagged-items view — F3).
- No full Elspeth migration (this feature ships the skeleton; F4 fills it).
- No ledger of any kind (F5, including the server's write path).
- No cross-guide search (F6), no route-transition cross-links (F7).
- No second faction's content (v1.1).
- No SSG, no state library, no service worker, no code splitting (ARCHITECTURE §1.1 "Deliberately absent").

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Navigation:** hash URLs — `#/` (home), `#/<lord-slug>` (lord page), `#/<lord-slug>/route/<route-id>` (route page), optional `#/<lord-slug>/route/<route-id>/<section-id>` (section anchor). Keyboard-operable; no free-text input in F1 (search is F6).
- **Content files (developer input):** everything under `content/` — plain text, edited with no tool running, validated by `content-lint`.

### Displayed Data

- **Lord card list (home):** one card per lord in `content/index.json` — lord name, faction, patch + VCO version context — visible on home; depends on the committed manifests.
- **Lord page:** shared fundamentals prose (`shared.md`) and the list of routes (number, official VCO title or "unresearched" marker, thematic subtitle, objective line); depends on `guide.json` + route frontmatter.
- **Route page (F1 form):** identity block from frontmatter (number, titles, objective, reward, interpretation, bottleneck), body rendered as plain markdown via markdown-it, and the declared content-gap list. F2 replaces the body with structured sections.
- **Version context:** `version.patch`, `version.vco`, `version.checked` from `guide.json`, shown on the lord card and lord page.

### Persistent Data

- **Guide content:** `content/` in the repository — git-versioned plain text, the single source of truth (ADR-0002). Committed; never written by the site.
- **Raw archive:** `.work/references/*.html` — untouched, gitignored (already the case).
- **The system must NOT persist** any read state: no browsing history, no "last opened route", no localStorage of content — the app state is fully rebuilt from `content/` on every boot.

## 3. The User Journey (Step-by-Step)

### Journey A — Reader (no server)

1. **Entry Point:** opens `dist/index.html` directly in a desktop browser (`file://`), no server, no build step to read.
2. **Action 1:** boot runs — fetch `content/index.json`, then each named `guide.json`, then all referenced content files in one parallel pass; parse and validate.
3. **System Response 1:** immutable `ContentTree` in memory; home renders one card per lord with lord name, faction, and patch + VCO version context.
4. **Action 2:** clicks a lord card → `#/<lord-slug>`.
5. **System Response 2:** lord page — shared fundamentals + route list, all synchronous in-memory reads.
6. **Action 3:** clicks a route → `#/<lord-slug>/route/<route-id>`.
7. **System Response 3:** route page — identity block, markdown body, declared-gap list.
8. **Success State:** any guide section reachable as home → lord → route → section without a running server or build step.

### Journey B — Content developer

1. **Entry Point:** wants to add content (new faction in v1.1, or F4 filling the Elspeth skeleton).
2. **Action 1:** edits or adds files under `content/` following the file layout (§4).
3. **Action 2:** runs `node tools/content-lint.mjs`.
4. **System Response:** exit 0, or a list of `file:field — message` violations; nothing is auto-fixed.
5. **Action 3:** reloads the site (or `npm run dev` with HMR for code).
6. **Success State:** the new content is visible; the read loop never involved a build.

### Journey C — Developer with the local server

1. **Entry Point:** needs the HTTP origin for development (or later, ledger writes — F5).
2. **Action 1:** `node tools/server.mjs` → serves `dist/` and `content/` statically at a fixed local port.
3. **System Response:** same app, HTTP-backed; no other server code exists.
4. **Success State:** the server is optional for reading; required only for the ledger write path that F5 adds to the same script.

## 4. Logical Constraints (The "Rules of the Road")

### Content layout (one guide = one Legendary Lord)

- **IF** a guide exists, **THEN** it lives at `content/<lord-slug>/` exactly, and is listed in `content/index.json` (`{ "lords": [...] }`).
- **IF** a lord directory exists, **THEN** it contains a `guide.json` manifest naming everything the loader must fetch: identity (id, lord, faction), `version { patch, vco, checked }`, `routes[]` (id, file, display number), `shared` (file), `datasets[]` (names under `data/`).
- **IF** a file exists under `content/` **AND** no manifest names it, **THEN** it is an orphan and the lint fails. Manifests are hand-written and committed because `file://` has no directory listing.
- One guide is lord-grained, not faction-grained: no `faction/` hierarchy level exists in F1. Home cards display "Lord — Faction". (Revisit only if a second lord of the same faction joins with genuinely shared routes — the seed atlases, VCO routes, and the PRD's own pilot decision are all lord-grained.)

### Route documents

- **IF** a route file exists, **THEN** its frontmatter carries: `id`, `number` (I/II/III), `name` (guide-created thematic subtitle), `vcoTitle` (official VCO title, or `null` until researched), `objective` and `reward` each typed as a claim `{ text, state, src }`, plus optional `interpretation`, `bottleneck`, `motto`, `transitions`, `panelOrder`, `gaps`.
- **IF** `vcoTitle` is `null`, **THEN** the route still renders, with the official-title slot visibly marked as unresearched — the seed atlases deliberately carry no official titles (their own source note records this), and F4's research fills them.
- **IF** a route body exists, **THEN** its H2 sections come from the fixed registry, in order: `Opening`, `Early → Mid`, `Mid → Late`, `Victory push` (required), then `Territory policy`, `Diplomacy`, `Transition → <other route>` (optional, one per other route).
- **IF** a required section is absent, **THEN** it may be omitted only when declared in frontmatter `gaps: [...]`; undeclared absence fails the lint. F2 renders declared gaps as Content Gap Markers — "present or explicitly marked" is mechanically checkable, never a silent blank.

### Confidence states (ADR-0002, in the schema from day one)

- **IF** a prose claim needs a confidence state, **THEN** it is wrapped in a fenced callout: `::claim <state> [src=<id,id,…>] … ::`, where `<state>` is exactly one of `confirmed | historical | inferred | verify-in-campaign`. No inline markers in F1 (block-level only; pre-F4 this is cheap to extend).
- **IF** structured data carries a claim (any item in `data/*.json`), **THEN** the item may carry optional `"state"` and `"src"` fields with the same vocabulary.
- **IF** a `src` reference is used, **THEN** every referenced id exists in that lord's `data/sources.json`.
- Route `objective` and `reward` **must** carry a state — they are VCO claims by definition; there is no "unmarked" objective.
- Color is never the sole state indicator (PRD accessibility baseline): every rendered state always pairs its colour with a text label. F1 renders callouts as plainly styled blocks with the state label; F2 upgrades them to the Confidence Badge component.

### Structured data

- **IF** a dataset is named in `datasets[]`, **THEN** it lives at `data/<name>.json` and parses as JSON. F1's committed set: `sources` (id/title/url/note), plus empty stubs for `armies`, `skills`, `research`, `buildings`, `mechanics`, `vco`.
- **IF** the corpus grows a new dataset kind, **THEN** the type registry in `app/content/types.ts` gains it and the lint validates against it — a designed extension, never a per-faction fork (PRD Flow 4).

### Loading and validation

- **IF** boot parsing fails on any file, **THEN** the app shows the boot error state naming the file and field — never a white page, never a partial tree silently missing content.
- **IF** content is valid, **THEN** every post-boot read (page, tab, anchor) is a synchronous in-memory read — no per-view fetching, no loading states after boot (ARCHITECTURE §1.1).
- **IF** a hash route names an unknown lord or route, **THEN** the app shows an explicit not-found view, not a blank page.

### Tooling placement

- **IF** a committed script is part of the product's workflow (content lint, local server), **THEN** it lives in `tools/` (committed). `scripts/` stays gitignored and reserved for jay-pi workflow scripts.
- **IF** a command is needed for install/dev/build/test/lint, **THEN** it is a `package.json` script; ARCHITECTURE §3 is filled from the implementation.

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- **Boot: unparseable/invalid content (bad frontmatter, invalid state, bad `src`, JSON parse error):** boot error state — the file path, the field, and the violation; the user can fix the file and reload. This is the developer-facing surface of the same rules the lint enforces.
- **Boot: a manifest names a file that does not exist:** same boot error state, naming the missing file (lint also catches this pre-commit).
- **Unknown hash route:** not-found view with a link home. Exact copy is not contractual.
- **`content/index.json` missing or empty:** home renders the explicit empty state ("no guides yet" meaning), not an error — a fresh checkout before any content is a valid state.

### Empty States

- **Zero lords:** home shows an explicit "no content yet" state with the content-layout instructions, never a blank page.
- **Route with all body sections declared as gaps:** route page shows the identity block plus the declared-gap list; the page is meaningful, not empty.
- **`vcoTitle: null`:** the official-title slot shows an explicit "unresearched" marker.

### Boundary Cases

- **Two lords with the same faction:** two independent cards and directories; nothing is shared between them at the layout level.
- **Markdown body with no callouts at all:** renders as plain prose; confidence markers are where the author places them (lint only validates markers that exist, plus the mandatory objective/reward claims).
- **A route with more than three per-route optional sections (e.g. two transitions):** allowed — the registry is per-section-type, not a global cap.

### Interruptions

- **Reload mid-campaign reading:** stateless app; reload rebuilds the tree from `content/` and the hash restores the exact page/section. Nothing to lose, nothing to roll back — F1 has no write path.
- **Content edited while the site is open:** nothing auto-detects it; a manual reload picks it up (the PRD's read loop). No stale-cache invalidation machinery exists on purpose.

## 6. Interface & Interaction (The "Look and Feel")

### Visual Style

The full design system in `.wiki/DESIGN.md` applies from day one: tokens as CSS custom properties in `app/styles/tokens.css`, the Factory-derived palette (monochrome chrome, orange/green as data voices), Geist/Geist Mono self-hosted, no shadows, 3/10/20px radii. F1 renders the shell, home, lord, and route views with that language; the Confidence Badge, Route Tab Strip, and dashboard components are F2.

### Layout

Single column, 1200px max on full-bleed canvas, sticky 64px top nav (wordmark + lord links once content exists + search slot reserved for F6), per DESIGN.md "Layout & Spacing". Home = card list; lord = shared prose + route list; route = identity block, body, gap list.

### Copywriting

- **Wordmark:** "VCO COMPANION" (mono uppercase, per DESIGN.md Top Navigation Bar).
- **Boot error / not-found / empty states:** explicit, plain, developer-readable (e.g. meaning "no guides yet — add one under content/", "unknown route", "content invalid at `file`: `field`"). Exact copy beyond this meaning is not contractual.
- **Gap list:** each entry names the missing section and that it is declared, not accidentally empty.
- **Version context:** always `patch <X> · VCO <version>` together (DESIGN.md Value & Number Formatting).

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] `npm run build` produces a static `dist/` that opens via `file://` with no server; reading requires no build step.
- [ ] Home shows one card per lord in `content/index.json` with lord, faction, and `patch · VCO version` context; zero lords shows the explicit empty state.
- [ ] Hash routes `#/`, `#/<lord-slug>`, `#/<lord-slug>/route/<route-id>` resolve to home, lord page, and route page; section anchors scroll; unknown routes show the not-found view.
- [ ] Boot fetches the index, each manifest, and all referenced files in one parallel pass and builds the immutable `ContentTree`; a corrupted fixture fails to boot with the file and field named (covered by `node:test` fixtures).
- [ ] The committed Elspeth skeleton (`content/elspeth-von-draken/`) is lint-clean: `guide.json` with version `2026.09.30.1` / checked 30 Sep 2026, three route files with identity frontmatter extracted from the seed (objectives and rewards as typed claims, `vcoTitle: null`), `data/sources.json` from the seed's sources, empty dataset stubs, all body sections declared as gaps.
- [ ] `node tools/content-lint.mjs` exits 0 on the committed skeleton; each seeded-violation fixture (dangling manifest reference, orphan file, missing required section without a `gaps` declaration, invalid confidence state, bad `src` id, unparseable JSON) exits non-zero with a `file:field — message` line.
- [ ] `node tools/server.mjs` serves `dist/` and `content/` statically with no dependencies; no write path exists yet.
- [ ] A second lord added as pure content (fixture-level proof: files + index entry only) appears on home and navigates fully without any code change.
- [ ] `tsc --noEmit` passes; the readability rules of ARCHITECTURE §1.1 hold (side effects only in `content/load.ts` and — for F5, later — `ledger/io.ts`; views compose, components don't decide).
- [ ] All DESIGN.md Pre-Delivery Checklist items applicable to F1's surfaces pass (keyboard navigation, focus-visible, contrast, no layout-shifting hover, reduced-motion).
