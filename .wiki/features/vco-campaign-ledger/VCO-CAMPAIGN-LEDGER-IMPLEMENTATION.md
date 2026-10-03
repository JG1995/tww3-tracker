# VCO Campaign Ledger (F5 — VCO campaign ledger)

**Design:** [VCO Campaign Ledger design](VCO-CAMPAIGN-LEDGER-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Track one live VCO campaign — the active route's objective items with a planning checkbox and a separate game-confirmed step track — persisted as plain JSON outside Git, surviving site reloads, without ever letting the planning checklist imply the game's completion state. F5 is the last v1.0 feature and the only feature on the write path: the committed `content/<lord>/data/vco.json` items stay read-only; the campaign document lives at gitignored `.local/state/ledgers/<lord-slug>/<route-id>.json` and is written only through a new `PUT` surface on the existing dependency-free local server (`tools/server.mjs`, currently GET-only), per ADR-0001 and ARCHITECTURE §1.1. F8 will later replace the file store behind the same document-level get/put surface; nothing above `app/ledger/io.ts` changes then.

## User-visible behavior

- Starting a ledger from an Elspeth route page (only routes with ≥ 1 committed VCO item) creates one campaign document (status `active`, every item `planned: false` / `confirmedStep: 0`) in the gitignored store and shows the ledger view with loading → success feedback; the ledger survives a full reload.
- The ledger view renders one row per committed VCO item of the campaign's route, in committed `vco.json` order: the objective label, the planning state (checkbox + mono label), and the game-confirmed 4-step track (step 0 none → 1 appears complete → 2 mission marked complete → 3 victory registered → 4 reward received, movable forward and back) — the two tracks as separate column groups with mono uppercase group headers, 40px rows with hairline dividers, state dot + text label per DESIGN.md §Ledger Table, and explicit `n / m` progress pairs (planning ticked / rows and game-confirmed reached / rows). The planning track and the confirmed track never affect each other.
- Row mutations are optimistic: the row shows in-flight feedback, the document is PUT to the server, and on failure the row rolls back to its pre-write state with a visible row-level `error` border + inline text — no silent writes. A successful write has no staleness handling (single user, whole-document writes).
- While no campaign is active, any route page with committed VCO items offers the start action; the active campaign's route page links to the ledger instead; starting while a different campaign is active is blocked with a message that links to the active campaign. A route with no committed VCO items offers no start action (the existing VCO content-gap treatment).
- Marking the campaign complete (explicit action from the ledger view) persists `status: "completed"` and stops it being active; the archived file stays on disk, the route page becomes startable again, and the completed campaign is not listed anywhere (browsing is a v2.0 non-goal).
- Delete (only after an explicit confirmation whose copy states the file is removed) removes the campaign file; dismissing the confirmation leaves it untouched.
- Items follow committed content: an item id missing from the campaign file renders fresh (unplanned, step 0), and an id removed from content drops out of the rows.
- The ledger loads on demand (never at boot): the boot path and the content reading path of the site are unchanged.
- Detailed behavior, rules, edge cases, and acceptance criteria: the accepted DESIGN (Open Questions: None), which the ledger links and does not restate as a competing specification.

## Invariants

- The planning track and the game-confirmed track are always stored as separate fields (`planned`, `confirmedStep`) and rendered as separate column groups with distinct mono group headers on every view that shows both; ticking never touches `confirmedStep`, stepping never touches `planned` (DESIGN §4 track separation, AC "ticking every planning checkbox leaves every confirmedStep at 0").
- At most one campaign is `active` at a time; a second start is blocked and never silently replaces the existing campaign.
- Every write goes exclusively through the local server's ledger write surface; the site never writes to `content/`, never uses localStorage, and never bypasses the server. Mutations are one whole-document write each; in-memory state never diverges silently from the persisted file (failed writes restore the pre-write document and show row-level error text).
- The store root `.local/state/ledgers/` is excluded from Git (`.gitignore` gains `.local/`); the store's data shape may change under F8, so it is not part of the committed contract.
- Ledger loading is on demand, never at boot; the content boot pass and the pure reading path are unchanged.
- The ledger never repairs or overwrites a corrupted on-disk document silently: an unreadable/invalid campaign file renders the ledger view's load-error state (icon + message + retry) and is never overwritten by a side-effect (start is not offered while a file exists at that path).
- All ledger logic (tick, step, create, complete, delete, validation) is pure and unit-tested; all file/network side effects are confined to `app/ledger/io.ts`. Views stay presentational `.ts` modules; `package.json` and the ADR-pinned dependency set stay unchanged; no new dependencies, no state library.

## Non-goals

- Browsing, listing, or comparing finished campaigns (v2.0 candidate), multiple simultaneous active campaigns, free-form per-turn notes, ledger database storage (F8), and any content-model, lint, or committed-content change — the ledger never writes into `content/` and never modifies VCO items.
- No auth, no multi-user, no migration, no localStorage, no service worker, no new dependencies.
- The 4-step track labels and the fixed row anatomy are the DESIGN-system contract; the F3/F7 surfaces are untouched.

## Current-state map

- Relevant components: `tools/server.mjs` — dependency-free Node `http` server, **GET-only** (`405 Method Not Allowed` for everything else), serving `dist/` at `/` and `content/` under `/content/` with `safeResolve` containment, a raw-request-target `..` rejection before URL parsing, decode-before-path-handling, and the SPA-shell fallback for unknown non-content paths; binds `127.0.0.1:8123` (`PORT` overrides; `PORT=0` prints the bound port); refuses to boot without `dist/index.html`. `test/server.test.ts` spawns the CLI with `PORT=0`, discovers the port from its stdout line, and asserts the four GET shapes (root shell bytes, `/content/index.json`, unknown-path fallback, encoded traversal 404) — the established spawned-server seam, currently the only server test file. `.gitignore` (93 bytes) ignores `.work/`, `scripts/`, `.pi/work/`, the template dirs, `node_modules/`, `dist/` — **`.local/` is not yet ignored** (verified `git check-ignore` exit 1); `.local/` does not exist yet.
- Data model: the committed `content/elspeth-von-draken/data/vco.json` maps `routeId → [{id, text, state, src}]`; the committed Elspeth guide has **33 VCO items: route-1 = 6 (3 `verify-in-campaign`, 3 `confirmed`), route-2 = 7 (all `confirmed`), route-3 = 20 (all `confirmed`)** — verified against the committed file and consistent with `test/elspeth-skeleton.test.ts` ("vco 6-7-20") and the F3 ledger (33 items). Every committed route has ≥ 1 item, so all three routes are startable. `app/content/types.ts` defines `VcoItem`/`VcoDataset` (types.ts lines 132/151); `app/content/query.ts` exposes the pure `getVcoObjectives(lord, routeId)` (returns `[]` for a missing entry); `app/views/route.ts` renders the VCO objectives undercard (`vcoUndercard` at route.ts line 147) with one Confidence Badge-carrying row per item; `app/main.tsx` was F3-verified as the only boot I/O site via the `ContentReader`/`contentRootUrl()` seam.
- Routing: `app/router.ts` is a pure `parseHash` + `useHashRoute` over the grammar `#/` home, `#/<lord>`, `#/<lord>/route/<id>`, `#/<lord>/route/<id>/<section-id>`; every other shape (empty segments, extra depth, punctuation, traversal dots, wrong shapes) maps to the explicit `not-found`; `test/router.test.ts` pins the table. The 4th segment is a content section slug, so piggybacking a ledger shape onto `#/<lord>/route/<id>/<something>` would collide with section anchors — the ledger gets a **dedicated 3-segment shape `#/<lord-slug>/ledger/<route-id>`** (second segment `ledger`, never `route`; the DESIGN requires its own hash route so a reload lands on it).
- App structure: views are zero-DOM `.ts` modules built with Preact `h()` (Node cannot execute `.tsx` under `node --test`, so only `app/main.tsx` may use JSX); `test/views.test.ts` proves views via `recordVNodes`/`vnodeText` VNode flattening over the real committed tree and `inContentCopy`/`fsReader` temp copies; `test/components.test.ts` proves the dumb components (ConfidenceBadge, TabStrip, dashboard) the same way. The Preact hook precedent is `useHashRoute` (hooks are browser-boot-proven, not node-testable in this seam). `app/styles/tokens.css` pins the DESIGN oklch tokens (`surface-container`, `outline-variant`, `success`/`warning`/`error`, radius/space stacks, mono voices — `test/tokens.test.ts`); `app/styles/app.css` may only reference `--…` custom properties with the documented exceptions (1px/2px hairlines, 3px radius offsets, the 0.15s transition, font fallbacks).
- Test seams: `test/server.test.ts` (spawned CLI, HTTP shapes), `test/router.test.ts` (pure table), `test/content-model.test.ts` + `test/elspeth-skeleton.test.ts` (loader/lint/query over fixtures and committed tree), `test/views.test.ts` (VNode flatten), `test/components.test.ts` (component anatomy), `test/tokens.test.ts`. New: ledger logic/state unit tests, ledger I/O tests over the spawned-server seam. Node ≥ 22 type stripping runs `test/*.test.ts` directly.
- Persistence and migrations: none exist today; F5 creates the first runtime persistence (JSON files outside Git, single-user, no auth, no migration). ADR-0001's correction (2026-10-02) already makes the local server the reading path; ARCHITECTURE §1.1 approves the F5 ledger-write role in the same script and reserves `app/ledger/{types,logic,io}.ts`, `app/views/ledger.ts`, `app/components/LedgerTable.ts`.
- Existing behavioral assumptions: boot-once immutable frozen `ContentTree`; post-boot content reads are synchronous; the hash is the only external state; ledger state is deliberately F5 scope ("No store, no localStorage" in ARCHITECTURE §2.2); views never fetch or write — F5's ledger I/O joins `content/load.ts` as the second, isolated side-effect module; the DESIGN-system fixed surfaces (Boot loading, Empty, Error, Ledger Table, Buttons, pre-delivery checklist) are the UI contract with no deviations.
- Project validation commands: `npm test` (node:test over `test/*.test.ts` — green at planning: 101 pass), `npx tsc --noEmit` (strict over `app/`, `tools/`, `test/` — clean), `node tools/content-lint.mjs` (exit 0 on committed `content/` — verified), `npm run build` (vite → `dist/`, `base: "./"` — verified), `npm run serve` (manual HTTP boot; precedent ledgers name it as the completing manual evidence).
- Primary risks: the server write surface and the persistence/rollback path are new trust/corruption seams (deepest packets below); `app/styles/app.css`, `app/main.tsx`, and `test/views.test.ts` are shared with most packages — waves serialize on them (the accepted F2/F3/F4/F7 pattern); the optimistic rollback flow is only partially provable in the zero-DOM seam (the pure command transitions and I/O are unit-tested; the end-to-end glue is manual-HTTP-boot-proven); hooks and `main.tsx` wiring have no node:test seam.

## Feature architecture

- **Ledger store root (server):** `tools/server.mjs` gains a third served root: `LEDGER_ROOT` (env override; default `<repo-root>/.local/state/ledgers`), mounted under the URL prefix `/ledgers/` with the exact path-safety discipline of the existing roots (`safeResolve` containment, raw-request-target `..` rejection, decode-before-path-handling; a path that escapes the ledger root 404s). Method surface: `GET /ledgers` (bare root) → the derived index (one entry per existing `<lord>/<route-id>.json` file: `{lordSlug, routeId, status, updatedAt}`, `status: "corrupt"` for a file that fails to parse — the DESIGN's "never silently repair" rule); `GET /ledgers/<lord>/<route-id>.json` → the document or 404; `PUT` → validates the body is JSON, writes the whole document (`mkdir -p` the lord subdirectory), returns 2xx; `DELETE` → removes the file (404 when absent). Methods other than GET/PUT/DELETE on the ledger root, and PUT/DELETE anywhere else, keep the 405 convention. The ledger root is never SPA-fallback (unknown ledger paths 404); unknown non-ledger paths keep today's fallback.
- **Pure campaign model (`app/ledger/`):** `types.ts` owns `ItemState { planned, confirmedStep: 0|1|2|3|4 }`, `CampaignStatus` (`active` | `completed`), `CampaignDoc { lordSlug, routeId, status, createdAt, updatedAt, items }`, and the index entry type; `logic.ts` owns the pure transitions and validation — `createCampaign`, `tickItem`, `setConfirmedStep`, the committed-items reconciliation (missing ids default fresh, removed ids drop out), step-bounds and document validation — all pure, returning new immutable documents and never touching I/O; `state.ts` owns the optimistic command lifecycle (begin/finish/fail transitions with row-level pending and error statuses and rollback of the document to its pre-write value), also pure and unit-tested; `io.ts` is the **only** ledger I/O module — on-demand `listLedgers()` (index), `loadLedger(lordSlug, routeId)` (document, null on 404, typed error on unreadable/invalid JSON), `saveLedger(doc)` (PUT), `deleteLedger(lordSlug, routeId)` (DELETE) over relative `/ledgers/…` URLs resolved against the origin like `contentRootUrl()` does; `useCampaign.ts` (added in the wiring package, documented as a deliberate extension of the §1.1 target layout) hosts the ledger page's in-memory state — index, document load phase, row command states — and the command handlers that sequence pure transitions + `io` calls.
- **View/composition:** `app/components/LedgerTable.ts` is the dumb DESIGN-system panel — two mono-uppercase column groups, 40px hairline-divided rows, planning checkbox + mono label, 4-step track cells (state dot + label; current step per the DESIGN § states), `n / m` progress pairs, per-row idle/saving/error states, keyboard-operable controls, `:focus-visible`; it knows nothing about routing or I/O. `app/views/ledger.ts` composes the campaign context header (lord, route, guide version context), the table or the DESIGN empty state ("NO ACTIVE CAMPAIGN — start one from a route page") or the error panel (icon + `body-md` message + ghost Retry), plus the lifecycle actions (complete, delete) that the wiring package wires. `app/views/route.ts` gains the start / open-ledger / blocked action region at the VCO objectives undercard.
- **Data flow:** boot is unchanged. On a ledger hash, `main.tsx` resolves lord/route (not-found otherwise) and mounts the ledger flow: load phase → `io.listLedgers()` + `io.loadLedger(...)` on demand → the view renders loading, empty, table, or error. Row actions: handler → pure next document → `state.beginWrite` (optimistic apply) → `io.saveLedger` → `state.finishWrite`, or `state.failWrite` on rejection (document restored to the pre-write value, row marked error). Lifecycle: start (route page) → `logic.createCampaign` → `io.saveLedger` → navigate to the ledger hash; complete → `logic.completeCampaign` → save; delete → confirmation → `io.deleteLedger` → refreshed state. Index consumers recompute from `listLedgers` on demand; after lifecycle actions the in-memory index is updated locally and refreshed.
- **Boundaries:** no new dependencies (preact only); no `.local`/persistence anywhere except `io.ts` and the server; no `content/` writes; `package.json` unchanged; views stay presentational; the router grammar grows exactly one new member.

## Uncertainty register

### Known

- The committed Elspeth VCO dataset is **6 / 7 / 20 = 33 items** (route-1: 3 `verify-in-campaign` + 3 `confirmed`; route-2 and route-3 all `confirmed`) — the orchestrator brief's "6 + 7 + 9" does not match repository evidence; the committed `vco.json` and `test/elspeth-skeleton.test.ts` (line ~40, "vco 6-7-20") and the F3/F4 ledgers (33 items) all agree, so the plan uses 33 (all three routes startable).
- The server is GET-only today; `test/server.test.ts` is the only server seam; `.local/` is not gitignored; `.wiki/` is tracked; no `.github/`, so the GitHub automated path is unavailable and every accepted precedent (F1–F4, F7) used provider `Local` with `PR ref: Not applicable`, `PR template: Not applicable`, `Merge method: ff-only`, base `main`, and the real local gate as Required checks.
- The router treats the 4th hash segment as a content section slug; a ledger shape must not reuse it — the dedicated `#/<lord>/ledger/<route-id>` grammar is the DESIGN-compliant shape.
- Under node:test there is no DOM: hooks and `main.tsx` wiring are proven by the browser-boot seam (the `useHashRoute` precedent), while the pure command transitions, I/O, and view VNodes are unit-provable.
- The DESIGN's empty-state copy ("NO ACTIVE CAMPAIGN — start one from a route page"), the Boot-loading treatment, the Buttons contract, and the pre-delivery checklist are fixed; the exact ledger group-header words and per-step cell copy are presentation beyond the DESIGN-fixed step names (DESIGN §2/DESIGN.md §Ledger Table).

### Assumptions

- The ledger document stays single-writer and whole-document; no conflict handling is required (DESIGN "Stale in-memory document" boundary — the next successful write wins).
- Archived (completed) campaigns open read-only from their hash (the only path to them is the delete journey — browsing is a v2.0 non-goal): the archived ledger view renders the rows' committed states without row mutation controls, plus the delete action. Recorded as a decision because the DESIGN specifies the delete entry point but not whether archived rows stay mutable.
- The game-confirmed progress `n / m` counts items whose `confirmedStep` is 1–4 (any reached step) as "confirmed"; an all-ticked/all-zero campaign shows the planning pair at `n / m` and the confirmed pair at `0 / m` (DESIGN §4/§7 "the game-confirmed track remains at zero").
- The ledger page's index needs are limited to the route-page surfaces; the ledger view derives its own state from the document load (missing document → the DESIGN empty state).

### Decisions

- **One PR, provider `Local`.** The whole feature lands through one Local ff-only boundary mirroring F1–F4/F7 exactly: `PR ref: Not applicable`, `PR template: Not applicable` (no `.github/`; the delivery classifier requires a PR template only for the GitHub automated path), `Merge method: ff-only`, base `main`, Required checks = the real local gate (`npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds). The ten ordered atomic commits keep `main` green at every prefix; no intermediate seam justifies a second merge boundary. **Feature close-out: `Not run`** (sole/final PR), per the current ledger template and jay-pi-plan guidance — the F3/F7 ledgers used the older "Current" spelling; the classifier accepts both.
- **Dedicated ledger hash shape.** `#/<lord-slug>/ledger/<route-id>` (3 segments, second segment `ledger`) — parseable, reachable, and collision-free: the 4th segment stays a content section slug and `#/<lord>/ledger/<route>/<extra>` is garbage→not-found. Alternative rejected: reusing the 4-segment route form would collide with section anchors (the brief's noted risk).
- **Server surface = one ledger root with GET list/doc + PUT + DELETE.** The store is served and mutatable under `/ledgers/` with the existing three path guards; the index is derived server-side from the store files (the DESIGN's "index derived from the documents"); `DELETE` is the smallest honest way to make "the campaign file is removed" true over HTTP (the DESIGN's "written only through a new PUT surface" governs writes; removal is a separate method). Alternative rejected: PUT-with-empty-body-as-delete (worse contract). The env override `LEDGER_ROOT` (default `<repo-root>/.local/state/ledgers`) gives server/io tests an isolated store (the `PORT` env precedent) without touching the real `.local/`.
- **Corrupt-file semantics.** The index entry for an unparseable file carries `status: "corrupt"`; opening that campaign's hash renders the ledger load-error panel (icon + message + retry); route pages offer neither start nor open for it, so a corrupt file is never overwritten silently (DESIGN "never repairs or overwrites the file silently"; consequence: a human removes the file to recover — recorded, not auto-repaired).
- **Archived campaigns are read-only** (see Assumptions): no row mutation controls on a completed campaign's ledger; delete remains available. Consequence: the DESIGN's mutation rules apply to the active campaign; the archived view is the delete entry point and the persisted record.
- **`useCampaign.ts`** hosts the ledger page's in-memory state and command orchestration next to the ledger modules (a document-level extension of the ARCHITECTURE §1.1 target layout, mirroring the `useHashRoute` precedent); its pure transitions live in `state.ts` so the optimistic/rollback path is unit-tested; the thin hook glue is browser-boot-proven.
- **Confirmed progress counts any reached step** (`confirmedStep ≥ 1`), so an all-planned/zebra campaign can show `n/m` planning vs `0/m` confirmed (the DESIGN's explicit separate-facts case).
- **Feature close-out wiring order** (page surface before route-page start): the ledger table panel (W3) → the ledger view page (W4) → the app wiring of the ledger page (W5) → the route-page start surface (W6) → complete/delete (W7). The router grammar and the server surface land earlier (W1–W2) as independently proven foundations; the routed ledger shape is a truthful not-found until the view lands (explicit out-of-scope note, no broken href).

### Unknowns

- None gating the plan. Exact cell copy, class names, group-header wording, and per-row loading treatments beyond the DESIGN-fixed labels and anatomy are implementation detail owned by the implementing packages within the DESIGN contract.
- The corrupt-file index entry and the archived-page read-only state are the two edges that a fresh reviewer should confirm against the DESIGN before delivery starts (both recorded above with their consequences; neither changes an accepted invariant).

### Risks

- The server write surface (path safety, JSON validation, atomicity of writes) and the rollback path are new persistence/trust seams — the deepest packets in this ledger; the server HTTP shapes and the pure rollback transitions are machine-proved, and the whole-document-write no-partial-observable guarantee is a server test.
- `test/server.test.ts`, `test/views.test.ts`, `app/styles/app.css`, and `app/main.tsx` are shared by several packages — waves serialize on them (accepted precedent; same-wave scopes stay disjoint).
- `main.tsx` wiring and the hooks have no node:test seam — their completing proof is the manual HTTP boot; the plan names it and reports any gap honestly rather than inventing a DOM test dependency.
- The corrupt file and the archived view depend on the index/list contract working end to end; the packets pin the server index derivation and the view states so no package guesses.
- A second faction later is content-only (per F4 precedent); nothing here forks on lords or routes.

## Walking skeleton

Commit 1 (server ledger root + gitignore) → Commit 2 (pure model) → Commit 4 (io client): after W1–W2 the store is served, mutable, and ignored, the pure transitions exist, and the client can list/load/save/delete documents over HTTP — the write path is proven on trunk green without any UI. Commit 5 (optimistic command state) and Commit 6 (Ledger Table panel) prove the rollback machine and the fixed row/column anatomy. Commit 7 (ledger view page) composes the empty/table/error surface; Commit 8 (page wiring) makes the ledger page reachable and mutatable end to end; Commit 9 (route-page start) completes the MVP spine — start from a route page, tick one item, reload, state survives (TODO.md's F5 spine); Commit 10 (complete/delete) closes the lifecycle. The thinnest complete path through the feature is all ten commits on one branch.

## Delivery plan

**Commit packages:** 10

### PR `vco-campaign-ledger` — Add the VCO campaign ledger

**Status:** Planned

**Depends on:** []

**PR ref:** Not applicable

**Merge ref:** Not merged

**Branch:** `feat/vco-campaign-ledger`

**Base branch:** `main`

**Publication provider:** Local

**PR template:** Not applicable

**Merge method:** ff-only

**Required checks:** `npm test` green, `npx tsc --noEmit` clean, `node tools/content-lint.mjs` exits 0, `npm run build` succeeds (the real local gate; the manual `npm run serve` HTTP boot is the completing evidence in Final validation)

**Feature close-out:** Not run

**Provisional PR title:** `feat(app): add the VCO campaign ledger`

**Purpose:** F5 is the last v1.0 feature and the only write-path work: a gitignored JSON campaign store served and mutated through the local server's new ledger root (GET index/doc, PUT, DELETE with the existing path-safety discipline), a pure optimistic campaign model, a dedicated `#/<lord>/ledger/<route-id>` hash, the fixed Ledger Table surface, and the start/track/complete/delete lifecycle. One Local ff-only boundary mirrors F1–F4/F7: `main` stays green at every ordered atomic prefix (server and model foundations land and prove before any view), `package.json` never changes, and no intermediate seam justifies a second merge boundary.

#### Package `server-ledger-surface` — Commit 1: The ledger store root on the local server

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** ["tools/server.mjs", ".gitignore", "test/server.test.ts"]

**Provisional commit:** `feat(tools): serve and mutate ledger documents over HTTP`

**Work:** `tools/server.mjs` gains the ledger store root: `LEDGER_ROOT` (env override, default `<repoRoot>/.local/state/ledgers`), mounted under the `/ledgers/` URL prefix with the exact guards the static roots use (`safeResolve` containment against `LEDGER_ROOT`, the raw-request-target `..` rejection, decode-before-path-handling; a target escaping the root 404s). Method surface: `GET /ledgers` (bare root) returns a JSON index array derived by scanning the store — one entry `{lordSlug, routeId, status, updatedAt}` per existing `<lord>/<route-id>.json`, `status: "corrupt"` when the file fails to parse (the DESIGN's never-silently-repair rule); `GET /ledgers/<lord>/<route-id>.json` serves the document or 404; `PUT` on the same shape validates the request body parses as JSON, creates the lord subdirectory, and writes the whole document (a single complete write — the DESIGN's "each mutation is one whole-document write"), returning 2xx; `DELETE` removes the file (404 when absent). The ledger root never falls back to the SPA shell (unknown ledger paths 404); unknown non-ledger paths keep today's fallback. Methods other than GET/PUT/DELETE on the ledger root, and PUT/DELETE anywhere else, keep the 405 convention. `.gitignore` gains `.local/` so the real store can never be committed.

**Atomicity:** One outcome: "the store root is excluded from Git and readable, writable, and removable over HTTP with the same path-safety discipline as the existing static roots, with the derived index" — the served root, the index derivation, the three methods, the guards, the gitignore line, and the server HTTP proofs are one persistence contract (a served store without the write or the gitignore has no storage; a gitignore line alone has no server behavior; splitting DELETE from the root would ship a store surface that can create files it cannot remove). Counted estimate: ~120 non-test implementation lines (server.mjs ledger branch; one `.gitignore` line); tests excluded. No further valid split exists.

**Out of scope:** All client code (`app/ledger/`), the router, any view, and the `LEDGER_ROOT` env override's interaction with anything but the server (the io client is Commit 4).

**Implementation packet:** Mirror the existing structure: compute `ledgerRoot` from `LEDGER_ROOT` or `join(repoRoot, ".local/state/ledgers")`; classify `/ledgers` and `/ledgers/...` like the `/content/` branch (but method-aware); keep guards global (they already run before root selection). `safeResolve(LEDGER_ROOT, rel)` returns null for escapes → 404. The index derivation reads the store recursively? No — exactly two levels: `<lord-slug>/<route-id>.json` (the store layout; ignore anything else, e.g. stray files in the root). Parse each file's top-level JSON for `status`/`updatedAt`; unparseable → `"corrupt"` with `updatedAt: null`. `PUT`: read the body (bound the size with a sane ceiling so a runaway body cannot OOM the dev server), `JSON.parse` (400 on failure), `mkdir(join(lordDir), recursive: true)` then `writeFile(target, JSON.stringify(doc))` — keep the write whole (a single `writeFile` call; small JSON documents). `DELETE`: `unlink`, mapping `ENOENT` to 404. All new tests must write only under an OS temp store (mkdtemp) via `LEDGER_ROOT` — never the real (absent) `.local/`; the existing static-shape tests keep passing with the same spawned server.

**Files and responsibilities:** `tools/server.mjs` — the ledger root constant, the `/ledgers/` classification, the `GET index`/`GET doc`/`PUT`/`DELETE` handling, guard reuse; the static paths and SPA fallback stay byte-identical for non-ledger requests. `.gitignore` — one line adding `.local/`. `test/server.test.ts` — the new ledger HTTP shapes (below) plus the retained four static shapes.

**Tests and proof:** Observable (spawned server, `PORT=0`, `LEDGER_ROOT` = mkdtemp): `GET /ledgers` on an empty store → 200 `[]`; after a `PUT` of a valid document → the index lists one entry with the parsed status/updatedAt, `GET /ledgers/<lord>/<route>.json` round-trips the exact bytes, a second `PUT` overwrites; `DELETE` removes it and a repeat `DELETE` → 404; `PUT` with non-JSON body → 400 and no file; `GET` of a missing document → 404; an encoded traversal under `/ledgers/` (e.g. `/ledgers/..%2fpackage.json`) → 404 without leaking; a hand-written unparseable file → index entry `status: "corrupt"` and its `GET` still returns the raw bytes (the client's parse failure is surfaced later, never on the server side); `PUT`/`DELETE` outside `/ledgers/` and unknown methods → 405; unknown `/ledgers/` paths → 404, never the SPA shell. Seam: the existing spawned-CLI seam in `test/server.test.ts` (extend it — one spawned server with the temp `LEDGER_ROOT` also covers the retained static shapes).

**Validation:** `npm test` (targeted: `node --test test/server.test.ts` first, then the suite), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build` when `dist/` is absent for the spawn. Temp stores under `os.tmpdir()` — no services, no port conflicts (`PORT=0`), no shared state.

**Stop conditions:** Any need to change the static serving branches, the SPA fallback, or the three guards for the ledger root (report — the design reuses them verbatim); a store shape that cannot be expressed as two-level `<lord>/<route>.json` files; an atomicity or whole-write requirement the worker cannot meet with the repo's tools.

**Review mandate:** the three guards apply to the ledger root unchanged (containment to `LEDGER_ROOT`, raw `..`, decode-first); `GET`/`PUT`/`DELETE` shapes and 400/404/405 statuses match the packet; the index derivation is two-level and reports `corrupt` instead of throwing; no SPA-fallback regression; `.gitignore` gains exactly `.local/`; no new dependency; the four static server tests pass untouched; tests never touch a real `.local/`.

#### Package `ledger-logic-model` — Commit 2: The pure campaign model

**Status:** Integrated

**Wave:** 1

**Depends on:** []

**Write scope:** ["app/ledger/types.ts", "app/ledger/logic.ts", "test/ledger-logic.test.ts"]

**Provisional commit:** `feat(app): add the pure vco campaign ledger model`

**Work:** New `app/ledger/types.ts` and `app/ledger/logic.ts` (the ARCHITECTURE §1.1 reserved layout). Types: `ItemState { planned: boolean; confirmedStep: 0|1|2|3|4 }`, `CampaignStatus = "active" | "completed"`, `CampaignDoc { lordSlug, routeId, status, createdAt, updatedAt, items: Readonly<Record<string, ItemState>> }`, `LedgerIndexEntry { lordSlug, routeId, status: CampaignStatus | "corrupt", updatedAt: string | null }`. Pure logic: `createCampaign(lordSlug, routeId, committedIds, now?)` → a new `active` document with every committed id at `{ planned: false, confirmedStep: 0 }`; `tickItem(doc, itemId, planned)` → a new document with only that item's `planned` changed; `setConfirmedStep(doc, itemId, step)` → only that item's `confirmedStep` changed; `itemsFor(doc, committedIds)` → the ordered per-row reconcilation (committed order in, an id missing from the document defaults fresh, an id removed from content is absent from the result); validation helpers for the step bounds and the document shape. All functions are pure (no I/O), never mutate their inputs (the repo's immutable-tree convention), and return whole new documents.

**Atomicity:** One outcome: "the pure campaign model computes every transition, validates its bounds, and reconciles committed content against the stored document — with the track separation invariant" — the types, the transitions, the reconciliation, and the unit proofs are one contract (a types-only commit has no observable behavior; transitions without the types cannot type-check; splitting create from tick/step would ship a model that cannot start a campaign). Counted estimate: ~170 non-test implementation lines. No further valid split exists.

**Out of scope:** Complete and delete transitions (land with the lifecycle package — Commit 10), all I/O (`io.ts`), the optimistic command lifecycle (`state.ts`), routing, views, and any content change (the committed VCO items are read-only inputs).

**Implementation packet:** Follow the `query.ts`/types conventions: `readonly` fields and frozen-style output (the tree is `deepFreeze`d at boot; campaign documents are the second immutable-ish domain — return new objects, never mutate). `confirmedStep` is a closed union `0|1|2|3|4`, so a step out of bounds is a type error at the call site and the runtime validation helper guards any external input (e.g. a hand-edited file parsed by `io`). `updatedAt`/`createdAt` use a caller-injected `now` (ISO string) for testability. The reconciliation (`itemsFor`) is the single definition of "rows = committed content order"; the ledger view and the table read it, never their own intersection logic. Step semantics: advancing past 4 and retreating below 0 are invalid transitions (the view disables them; the model validates). Keep the module dependency-free (types only from the same folder).

**Files and responsibilities:** `app/ledger/types.ts` — the four types above (exported for `logic`, `state`, `io`, the views, and the tests). `app/ledger/logic.ts` — the pure transitions + validation. `test/ledger-logic.test.ts` — the new unit suite.

**Tests and proof:** Observable (pure node:test, no I/O, no DOM): `createCampaign` yields `active` with all committed ids fresh and `updatedAt` from the injected clock; `tickItem` flips only `planned` (the item's `confirmedStep` is byte-identical, and every other item is byte-identical — the track-separation invariant); `setConfirmedStep` moves a step forward and back within 0–4 and leaves `planned` untouched; step 4 refuses forward / step 0 refuses backward via validation; `itemsFor` returns rows in committed order, defaults a stored-missing id to fresh, and drops a content-removed id; transitions never mutate their input document. Proof seam: direct function calls; the committed Elspeth item ids (6/7/20) are only examples here — the reconciliation is proven with small synthetic id sets plus one committed-id case.

**Validation:** `npm test` (targeted `node --test test/ledger-logic.test.ts`, then the suite), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0 — no content change). No services.

**Stop conditions:** A transition the DESIGN's field-separation invariant cannot express as a pure document transform; a `confirmedStep` bound that contradicts the closed 0–4 union; evidence that the committed content order is not what the view should render.

**Review mandate:** exactly the four types + transitions described; track separation enforced in both directions (tick never touches `confirmedStep`, step never touches `planned`); `itemsFor` owns reconciliation (no second definition anywhere); immutable outputs; no I/O, no `Date.now()` default that hides testability, no dependency additions.

#### Package `ledger-hash-route` — Commit 3: The ledger hash route

**Status:** Integrated

**Wave:** 2

**Depends on:** []

**Write scope:** ["app/router.ts", "app/main.tsx", "test/router.test.ts"]

**Provisional commit:** `feat(app): add the ledger hash route`

**Work:** `app/router.ts`'s `HashRoute` union gains `{ name: "ledger"; lordSlug: string; routeId: string }`, parsed from the dedicated 3-segment shape `#/<lord-slug>/ledger/<route-id>` (second segment exactly `ledger`, never `route`); every other shape keeps today's classification — `#/<lord>/ledger/<route>/<extra>` (4 segments), `#/<lord>/ledger` (2 segments), empty/traversal/punctuation segments → `not-found`, and the existing route/section grammar is byte-unchanged (the 4th segment stays a content section slug — the collision risk the dedicated shape avoids). `app/main.tsx`'s `routeView` gains the exhaustive `case "ledger"` returning the not-found view until the ledger view lands (Commit 8 replaces it) — the routed shape is truthful and trunk-safe today and its dispatch is explicit, never a fallthrough.

**Atomicity:** One outcome: "the hash grammar names, parses, and reaches exactly one new 3-segment ledger shape, with every other shape still not-found — proven by the router table" — the union member, the parse branch, the exhaustive dispatch, and the table proofs are one grammar contract (a member without the parse is dead type surface; a parse without the dispatch breaks the type gate; the not-found stub is the honest trunk-safe completion of this commit, explicitly superseded by Commit 8). Counted estimate: ~20 non-test lines (router + dispatch). No further valid split exists.

**Out of scope:** The ledger view, all ledger modules, and any change to the route/section grammar or the home/lord shapes.

**Implementation packet:** Place the parse branch beside the existing `parts[1] !== "route"` check — a `ledger` shape is exactly 3 segments with `parts[1] === "ledger"`; keep the segment regex enforcement (`SEGMENT`) so `#/<lord>/ledger/<route-id>` only matches well-formed slugslint; a 4-segment `ledger` path is not-found (no ledger section anchor exists). In `main.tsx`, the new case returns `<NotFoundView />` with an explicit comment "ledger view lands in the ledger feature wiring" so a later reviewer sees the intentional stub, not a bug. The `hashchange` hook needs no change.

**Files and responsibilities:** `app/router.ts` — the `HashRoute` union + `parseHash` branch (pure, exported). `app/main.tsx` — the exhaustive `routeView` case (stub). `test/router.test.ts` — the table additions.

**Tests and proof:** Observable (pure `parseHash` table): `#/elspeth-von-draken/ledger/route-1` → `{ name: "ledger", lordSlug: "elspeth-von-draken", routeId: "route-1" }` (with and without `#`); garbage that must stay not-found: `#/lord/ledger`, `#/lord/ledger/`, `#/lord/ledger/route-1/opening` (4 segments), `#//ledger/route-1`, `#/lord/ledger/../x`; every existing route/lord/home entry keeps its current expected mapping; the existing garbage list stays green. Seam: the existing `test/router.test.ts` table.

**Validation:** `npm test` (targeted `node --test test/router.test.ts`, then the suite), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** A committed hash that today parses as a route/section that would now parse as a ledger (evidence the shape collides — report and replan the grammar); a Dispatch requirement that forces a non-NotFound stub.

**Review mandate:** exactly one new member and one parse branch; the route/section grammar is byte-unchanged (the 4th segment remains a section slug); the stub dispatch is the explicit `NotFoundView` with the out-of-scope note; the table proves new shapes parse and every pre-existing garbage entry still lands not-found; no view or ledger module changes.

#### Package `ledger-io-client` — Commit 4: The ledger I/O client

**Status:** Integrated

**Wave:** 2

**Depends on:** ["server-ledger-surface"]

**Write scope:** ["app/ledger/io.ts", "test/ledger-io.test.ts"]

**Provisional commit:** `feat(app): add the ledger io client`

**Work:** `app/ledger/io.ts` — the only ledger I/O module: `listLedgers()` (GET the bare `/ledgers` index, typed parse), `loadLedger(lordSlug, routeId)` (GET `/ledgers/<lord>/<route-id>.json`; null on 404; a typed error on network failure or unreadable/invalid JSON — the corrupt-file path), `saveLedger(doc)` (PUT the serialized whole document), `deleteLedger(lordSlug, routeId)` (DELETE; a 404 reads as already-absent). URLs resolve against the origin exactly like `contentRootUrl()` does (`new URL("ledgers/", location.href)` + the relative store path), so the SPA served by the local server reads and writes the same origin. Every function returns a typed result and surfaces failures as a small typed error set the view state can render (retry + message), never a silent catch.

**Atomicity:** One outcome: "the client's only ledger I/O surface — on-demand index, document loads, writes, and deletions against the server's ledger root with typed failures" — the URL seam, the four operations, the parse/error contract, and the spawned-server proofs are one module contract (operations without the typed parse/error boundary would leak raw fetch results upward; a URL seam without operations has no behavior). Counted estimate: ~85 non-test implementation lines. No further valid split exists.

**Out of scope:** The pure model (`logic.ts`), the command state, any view, routing, and the DESIGN's load-on-demand policy enforcement (the hook that decides *when* to call is Commit 8).

**Implementation packet:** Use relative-origin resolution (`new URL("ledgers/", window.location.href).href + \`${lordSlug}/${routeId}.json\``) so `node --test` can drive it against a spawned server by injecting a base origin — the file must import nothing DOM-y at module scope (like `query.ts`), and the tests pass a base argument (or construct via a small exported helper) so the module stays importable under node:test. `loadLedger` distinguishes 404 (null) from parse failure (throw the typed error) — that distinction is the corrupt-file contract. `saveLedger` sends the exact serialized document; reject non-2xx with the typed error including the status text for the row-level message. `deleteLedger` treats 404 as already-absent (the desired end-state). No retry loops, no caching, no localStorage, no state.

**Files and responsibilities:** `app/ledger/io.ts` — the four functions + the typed error type. `test/ledger-io.test.ts` — the new suite over the spawned-server seam.

**Tests and proof:** Observable (spawned server like `test/server.test.ts` — `PORT=0`, `LEDGER_ROOT` = mkdtemp): `saveLedger` then `listLedgers` returns the entry and `loadLedger` round-trips the document fields; `loadLedger` on an absent path → null; a hand-written invalid-JSON file → `loadLedger` throws the typed error while `listLedgers` returns its `corrupt` entry; `deleteLedger` removes it and a repeat delete resolves; a non-2xx (e.g. PUT to a path the server rejects) → the typed error. Proof seam: one spawned server in `before`, build-on-demand for `dist/index.html` exactly like the server test file's guard (order-independent).

**Validation:** `npm test` (targeted `node --test test/ledger-io.test.ts` first, then the suite — two spawned-server files, each on `PORT=0` and its own temp store, run concurrently: isolated), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No shared services.

**Stop conditions:** A server response shape the client cannot express (report — the Commit 1 contract and this client must agree exactly); a need for fetch mocking (the repo supports the spawned-server seam — do not invent tooling).

**Review mandate:** io.ts is the only module with `fetch` for ledger data; the 404-vs-corrupt distinction is exactly as specified; no retry/cache/state; error objects carry the message/status the views render; the URL seam matches `contentRootUrl()`'s pattern; tests hit only the temp store.

#### Package `ledger-command-state` — Commit 5: The optimistic command state

**Status:** Planned

**Wave:** 3

**Depends on:** ["ledger-logic-model"]

**Write scope:** ["app/ledger/state.ts", "test/ledger-state.test.ts"]

**Provisional commit:** `feat(app): add optimistic ledger command state`

**Work:** `app/ledger/state.ts` — the pure optimistic command lifecycle for row mutations (the DESIGN's "optimistic in-memory update with loading → success feedback; on failure the row rolls back"): `beginWrite(state, itemId)` applies a pure transition's next document optimistically and marks that row `saving`; `finishWrite(state, itemId)` confirms the write (row back to committed/idle); `failWrite(state, itemId, message)` restores the exact pre-write document and marks that row `error` with the message. The state shape carries the current document, the per-row status (`idle` | `saving` | `error` + message), and the pre-write document snapshot needed for rollback; transitions are pure functions returning new state (no I/O, no DOM).

**Atomicity:** One outcome: "the rollback path — begin/finish/fail transitions that never let the in-memory document diverge from the persisted file — is pure and unit-proven" — the state shape, the three transitions, and their proofs are one contract; this is the riskiest UI seam and its whole behavior must be provable without a DOM (a transition that restored only part of the document, or a state shape without the pre-write snapshot, would have no meaningful proof at all). Counted estimate: ~100 non-test implementation lines. No further valid split exists (begin without finish/fail has no failure contract; the three transitions share one state shape).

**Out of scope:** The I/O calls (the hook sequences this state with `io.ts` in Commit 8), create/complete/delete transitions (lifecycle, Commit 10), the view, and the pure model itself (Commit 2).

**Implementation packet:** The transitions consume the pure next-document from `logic.ts` (the worker must not re-derive transitions here — `beginWrite` takes the already-computed next document as a parameter, keeping `state.ts` independent of the model API surface beyond the types). Rollback restores the *previous whole document* — the DESIGN's per-row rollback is the presentation of that restore (the failed row shows its pre-write value + error text; every other row keeps its committed value because they are the same document). Row bookkeeping is `Record<itemId, { phase: "idle" | "saving" | "error"; message: string | null }>` with helpers to read/mark. Multiple in-flight rows: the DESIGN is single-user and whole-document — keep the model honest: one in-flight mutation at a time is the simplest correct contract (the packet names that the UI serializes row actions; a second mutation while one is in flight is queued by the hook, not by the transitions).

**Files and responsibilities:** `app/ledger/state.ts` — the state shape + `beginWrite`/`finishWrite`/`failWrite` (+ tiny read helpers). `test/ledger-state.test.ts` — the new unit suite.

**Tests and proof:** Observable (pure node:test): `beginWrite` applies the optimistic document and marks the row saving while other rows keep their committed values; `finishWrite` settles the row idle; `failWrite` restores the byte-identical pre-write document (deepEqual) and marks the row error with the message; a tick that fails leaves a *different* row's earlier committed tick untouched (the whole-document rollback is correct for any interleaving the serialized UI can produce); input documents are never mutated. Proof seam: direct function calls over constructed documents; no DOM, no I/O.

**Validation:** `npm test` (targeted `node --test test/ledger-state.test.ts`, then the suite), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0). No services.

**Stop conditions:** A DESIGN-required feedback state the pure shape cannot express; evidence that the whole-document rollback contradicts the DESIGN's row-level wording (the packet reads it as presentation — report rather than redesign).

**Review mandate:** every transition is pure and dependency-light (only the ledger types); rollback is the exact pre-write document (deepEqual-proven); row statuses and messages are the only UI-visible mutation state; no I/O, no timers, no DOM, no new dependencies.

#### Package `ledger-table-panel` — Commit 6: The Ledger Table panel

**Status:** Planned

**Wave:** 3

**Depends on:** ["ledger-logic-model"]

**Write scope:** ["app/components/LedgerTable.ts", "app/styles/app.css", "test/components.test.ts"]

**Provisional commit:** `feat(app): render the ledger table panel`

**Work:** `app/components/LedgerTable.ts` — the dumb DESIGN-system panel (ARCHITECTURE §1.1's reserved `LedgerTable`): receives the reconciled rows (committed ordered items + their `ItemState`s from `logic.itemsFor`), the per-row command statuses, and change handlers; renders two column groups with mono uppercase body group headers (planning track ≡ the checkbox group; game-confirmed track ≡ the 4-step group), 40px hairline-divided rows, per row: the objective label, the planning checkbox + mono label (checked → `on-surface` check per DESIGN.md), and the four step cells (0 none → 1 appears complete → 2 mission marked complete → 3 victory registered → 4 reward received as mono `label-sm` cells with state dot + label: `success` green reached steps, `warning` treatment for the appears-complete-but-unconfirmed edge per the DESIGN states), disabled controls at the boundaries (no forward past 4, no back before 0), and the explicit `n / m` progress pairs (planning ticked / rows; confirmed reached / rows) beside the group headers. Per-row states from the command state: `saving` (in-flight feedback), `error` (row border `error` + inline text + pre-write value visible — the rollback is the parent's document, the panel renders the state). Keyboard-operable checkbox and step controls, `:focus-visible` rings, no colour-only meaning (dot + label + icon per the DESIGN). `app/styles/app.css` gains the token-only table treatments (carbon `surface-container` floor, 1px `outline-variant` border + hairlines, radius-md, mono group headers, state dot/error row treatments — tokens only, transitions in the 0.15–0.2s band under `prefers-reduced-motion`).

**Atomicity:** One outcome: "the Ledger Table renders the fixed DESIGN contract — two visually separate column groups, 40px hairline rows, checkbox + 4-step cells with dot/label states, n/m progress, per-row saving/error feedback — from data and handlers alone" — the row/group anatomy, the styles, and the anatomy proofs are one render surface (rows without the group headers or the states would not satisfy the Ledger Table contract; the panel without the view is complete-by-design — dumb components land standalone in this repo, the F2 `ConfidenceBadge` precedent). Counted estimate: ~185 non-test implementation lines (component ~135, token-only CSS ~50). No further valid split exists (rows, headers, and states are one anatomy; the CSS has no observable context without the markup).

**Out of scope:** The ledger page view (Commit 7), lifecycle buttons, all I/O/routing, and any change to existing components or tokens (`test/tokens.test.ts` stays green).

**Implementation packet:** The panel is stateless: props carry the ordered rows (label + id + `ItemState`), the per-row `{ phase, message }` map, the progress numbers (computed by the caller from the reconciled rows — one computation), and `onTick(itemId, planned)`/`onStep(itemId, step)` callbacks; it renders no fetch, no state, no routing decisions (the repository's "components do not decide" rule). Step cells: the four labels are the DESIGN-fixed steps; the current step renders the reached state dot + label, earlier steps render their labels with the neutral dot treatment, later steps render dimmed — the exact cell copy beyond the fixed step names is presentation. Controls: forward/back buttons per row (or per-cell activation, the DESIGN's "keyboard-operable checkboxes and step advance buttons") — keyboard-reachable, `:focus-visible`, disabled at the bounds. The group headers are mono uppercase (the DESIGN's separate-groups requirement); their copy conveys "planning" vs "game confirmed" (presentation, recorded in the ledger). CSS: token-only (`surface-container`, `outline-variant`, `success`/`warning`/`error`/`on-surface`, radius-md, space stack, mono voices); the fixed exceptions (1px hairlines, 3px offsets, 0.15s transition) only.

**Files and responsibilities:** `app/components/LedgerTable.ts` — the dumb panel + its props/types. `app/styles/app.css` — the table treatments (single class family, token-only). `test/components.test.ts` — the anatomy proofs (extend the existing component test file).

**Tests and proof:** Observable (zero-DOM VNode flatten over constructed docs): the panel renders the two group headers, one 40px-classed row per reconciled item in committed order with the label, the checkbox checked state (`on-surface`-classed) and unchecked, the four step cells with the DESIGN step labels, the reached step's success-classed dot + label, the appears-complete (step 1) warning treatment, the `n / m` progress pairs (planned `k / m`, confirmed `0 / m` for an all-ticked/all-unconfirmed doc), the disabled controls at step 0/4, the saving row feedback, and the error row (error class + message + the row's pre-write value). Keyboard/`:focus-visible` reachability and contrast are asserted structurally at the seam where expressible; the manual HTTP boot completes them. Proof seam: `test/components.test.ts`'s existing zero-DOM helpers over hand-built props (no content tree needed — the panel is data-driven).

**Validation:** `npm test` (targeted `node --test test/components.test.ts`, then the suite), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build` (light CSS/bundle change). No services.

**Stop conditions:** A Ledger Table anatomy requirement (row height, hairline dividers, group headers, dot+label states, `n / m`) that the token set cannot express without a DESIGN change; a state (saving/error) that the fixed DESIGN states do not carry.

**Review mandate:** the panel decides nothing (no fetch, no routing, no state); the two column groups are structurally separate with mono group headers; rows are 40px/hairline-divided per the contract; reached steps pair the dot with a text label (no colour-only meaning); bounds disabled at 0/4; per-row statuses render saving/error feedback with the error text; CSS is token-only with no new tokens; existing components and `test/components.test.ts` suites stay green; no new dependencies.

#### Package `ledger-view-page` — Commit 7: The ledger page view

**Status:** Planned

**Wave:** 4

**Depends on:** ["ledger-table-panel"]

**Write scope:** ["app/views/ledger.ts", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): render the ledger page view`

**Work:** `app/views/ledger.ts` — `LedgerView`, the DESIGN §6 ledger page over props: the campaign context header (lord, route, and the guide's patch/VCO version context inherited from `guide.json`), then one of: the in-flight treatment while the document loads ("loading → success" per the DESIGN Journey), the DESIGN error panel (icon + `body-md` message + ghost Retry button) for load failures, the DESIGN empty state for a missing/absent document ("NO ACTIVE CAMPAIGN — start one from a route page" — never blank), or the `LedgerTable` composed with the reconciled rows, the per-row command statuses, and the tick/step handlers. The page renders nothing else; lifecycle actions land with their handlers in Commit 10. `app/styles/app.css` gains the token-only ledger-page treatments (context header, page states).

**Atomicity:** One outcome: "the ledger page composes the table with its context header and the DESIGN empty/loading/error states — the complete read-and-mutate surface for an active campaign" — the header, the three page states, the table composition, and the page proofs are one render surface (a page with only the table would blank on every load; page states without the table have no data). Counted estimate: ~165 non-test implementation lines (view ~115, token-only CSS ~50). No further valid split exists.

**Out of scope:** The app wiring (Commit 8), the route-page start surface (Commit 9), and the complete/delete lifecycle actions (Commit 10 — the view's `onComplete`/`onDelete` props land there).

**Implementation packet:** `LedgerView` receives everything it renders: `lord` + `route` (the resolved query values `main.tsx` will pass), `phase: { kind: "loading" } | { kind: "ready"; doc: CampaignDoc } | { kind: "error"; message: string }`, the reconciled rows (`logic.itemsFor` — one computation at the caller), the per-row protocol, `onRetry`, `onTick`, `onStep`. The empty-state copy is the DESIGN-fixed sentence; the loading treatment is the minimal mono treatment matching the DESIGN's in-flight feedback vocabulary (the boot loading bar itself is boot-only); the error panel follows the fixed Error state (ghost Retry wires `onRetry`). Version context reads `lord.guide.version` (patch / VCO — the F3 banner showed the exact pairing). The page must render the committed item set — rows come from `itemsFor`, never from a stored list.

**Files and responsibilities:** `app/views/ledger.ts` — the `LedgerView` (plain `h()`-built `.ts` module, like every view). `app/styles/app.css` — the page treatments (token-only). `test/views.test.ts` — the new proofs (extend the existing view test file with the ledger page's VNode flatten).

**Tests and proof:** Observable (zero-DOM VNode flatten over constructed props, no server): phase loading renders the in-flight treatment; phase ready with a doc renders the context header (route name, patch/VCO), the table with reconciled rows from a synthetic doc + committed-style ids (unordered stored ids render in committed order; missing ids fresh; extra stored ids absent), the per-row statuses, and progress; an absent document renders the exact "NO ACTIVE CAMPAIGN — start one from a route page" empty state (never blank); phase error renders the error panel with message + Retry wired to `onRetry`. Proof seam: `test/views.test.ts`'s existing helpers — the view is data-driven, so constructed props cover every state without a DOM.

**Validation:** `npm test` (targeted `node --test test/views.test.ts`, then the suite), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`. No services.

**Stop conditions:** A page state the DESIGN's fixed Empty/Error/Loading contracts cannot express; the table needing a prop that commits 5/6 do not define (the sections' contracts agree — the reconciliation and status types are the interface; report any drift).

**Review mandate:** the view is presentational (no fetch, no state beyond props, no routing); the empty state is the fixed copy, never blank; the error panel follows the fixed Error anatomy with Retry; rows come from the single reconciliation; the header carries lord/route/version context; lifecycle actions are absent (Commit 10 owns them); token-only CSS; existing view tests stay green.

#### Package `ledger-page-wiring` — Commit 8: Wire the ledger page into the app

**Status:** Planned

**Wave:** 5

**Depends on:** ["ledger-hash-route", "ledger-io-client", "ledger-command-state", "ledger-view-page"]

**Write scope:** ["app/main.tsx", "app/ledger/useCampaign.ts"]

**Provisional commit:** `feat(app): wire the ledger page into the app`

**Work:** `app/ledger/useCampaign.ts` — the ledger page state hook (the in-memory ledger state ARCHITECTURE §1.1 describes): on a ledger hash it loads the index and the campaign document on demand (never at boot), tracks the load phase, and exposes `onTick(itemId, planned)`/`onStep(itemId, step)` handlers that sequence the pure command state (Commit 5) and the I/O (Commit 4): compute the optimistic next document via `logic`, `beginWrite`, `io.saveLedger`, then `finishWrite`, or `failWrite` on rejection (rollback). `app/main.tsx`'s ledger case replaces the Commit 3 stub: resolve `getLord`/`getRoute` (not-found otherwise), mount `useCampaign`, and render `LedgerView` with the hook's data and handlers; the boot pass and the content reading path stay untouched.

**Atomicity:** One outcome: "the ledger page is reachable by its hash and every row mutation is durably persisted or visibly rolled back, with loading on demand and reload restoring the exact document" — the hook's state, its sequencing of the tested transitions and I/O, and the `main.tsx` dispatch are one wiring outcome; back ends (the pure transitions, the I/O, the view) are already proven, so this commit's change is the thin glue that ties them. Counted estimate: ~135 non-test implementation lines (hook ~95, `main.tsx` ~40). No further valid split exists: the hook and its dispatch are one composition (a hook nothing mounts is dead code; a dispatch without the hook cannot render).

**Out of scope:** The route-page start surface (Commit 9 — this commit wires only the ledger page; starting a campaign from a route page lands there), complete/delete (Commit 10), and any change to the boot path, the content tree, or the other views.

**Implementation packet:** Keep `main.tsx`'s structure: the ledger case resolves lord/route like the route case and renders `<LedgerView lord={lord} route={route} …/>` with the hook's values. The hook mounts effects keyed by `(lordSlug, routeId)`: load phase → `listLedgers` + `loadLedger` on demand (the index is fetched here so Commit 9's route page can consume it from the same source without a second network contract; nothing loads at boot). Row handlers run serially (one in-flight mutation — the command-state contract); success keeps the confirmed document, failure marks the row and restores the pre-write document. Reload lands on the ledger hash (the Commit 3 grammar) and the effects reload the document — the DESIGN's reload-persistence acceptance item. No caching, no localStorage, no new dependencies.

**Files and responsibilities:** `app/ledger/useCampaign.ts` — the hook (imports preact/hooks, `types`, `logic`, `state`, `io`; documented as the §1.1 layout's ledger-page state home). `app/main.tsx` — the ledger dispatch replacing the stub. (No test file: `main.tsx` is the sole JSX entry and hooks are browser-boot-proven in this seam — the persistent-reload and rollback end-to-end are the manual HTTP boot's proof, with the pure pieces already unit-tested.)

**Tests and proof:** Observable: the end-to-end flows this commit enables — deep-linking `#/elspeth-von-draken/ledger/route-1` loads the document on demand (no boot-time ledger fetch), ticks and steps persist across a full reload with the exact committed state, and a failed write (server stopped mid-session) rolls the row back with visible row-level error text. Proof seam: the manual HTTP boot (`npm run serve`) — the zero-DOM suites prove the pure transitions (Commit 5), the I/O (Commit 4), and the view states (Commit 7); the wiring itself is the thin glue those suites cannot reach. This is the honest named gap, matching the `useHashRoute` precedent.

**Validation:** `npm test` (full suite — all prior proofs stay green), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`, then the manual `npm run serve` boot: build once, serve, deep-link a ledger hash for a manually created campaign document in the temp/default store, tick + step, reload, verify restored state; stop the server, mutate a row, restore the server, verify rollback + error text. No services beyond the local server.

**Stop conditions:** A reload/rollback behavior that the tested primitives cannot deliver (evidence of a contract mismatch — report before changing state/io logic); a boot-time ledger fetch leaking in (the DESIGN forbids it); the hook needing state the pure model cannot express.

**Review mandate:** nothing loads at boot; the hook sequences the already-tested transitions and I/O without re-deriving them (no second mutation logic — workers must not copy `logic`/`state` behavior here); one in-flight mutation; the stub dispatch is replaced (Commit 3's out-of-scope note resolves); rollback and reload flows correspond exactly to the DESIGN's acceptance items; `main.tsx` diff is limited to the ledger case; no dependency/config/content change.

#### Package `ledger-route-start` — Commit 9: Start a campaign from route pages

**Status:** Planned

**Wave:** 6

**Depends on:** ["ledger-page-wiring"]

**Write scope:** ["app/views/route.ts", "app/main.tsx", "app/styles/app.css", "test/views.test.ts"]

**Provisional commit:** `feat(app): start a campaign from route pages`

**Work:** The VCO objectives undercard area in `app/views/route.ts` gains the campaign action region, driven by a prop: no campaign active + route has ≥ 1 committed VCO item → the start action (primary/ghost button per the Buttons contract); the active campaign is this route's → a link to the ledger (`#/<lord-slug>/ledger/<route-id>`); another campaign active → the start-blocked message naming that a campaign is already active and linking to it (DESIGN's single-active-campaign rule); a route with no VCO items → no action at all (existing VCO content-gap treatment). `app/main.tsx` passes the index state + an `onStart` handler into the route case: on start, `logic.createCampaign` → `io.saveLedger` → navigate to the ledger hash (loading → success per the DESIGN Journey). `app/styles/app.css` gains the token-only action-region treatments. No other route-page surface changes.

**Atomicity:** One outcome: "route pages offer start / open / blocked exactly per the active-campaign index, and starting creates the campaign document and lands on the ledger page" — the action region, its three states, the index plumbing, the start handler, and their proofs are one lifecycle-journey slice (the DESIGN's Journey 1: the start entry point, the persisted creation, and the navigation are one user-visible outcome; splitting the handler from the action region would ship a button that does nothing or a handler no button reaches). Counted estimate: ~110 non-test implementation lines (route view ~65, `main.tsx` ~25, CSS ~20). No further valid split exists.

**Out of scope:** Row mutations on the ledger page (Commit 8), and complete/delete (Commit 10). The start-blocked link and the open-ledger link both use the Commit 3 grammar.

**Implementation packet:** The route view receives `campaign: { phase, index, onStart }`-shaped props from `main.tsx`; the action region derives its state by pure rules at the caller (one small helper: active campaign lookup by `lordSlug`/`routeId` from the index; present-campaign-for-this-route handling — a `completed` document for this route does not block start, a `corrupt` one blocks it per the recorded decision). The ledger page is reachable only when the campaign document exists and is the route's own — the open-ledger state is the active one. Start: `createCampaign(lordSlug, routeId, getVcoObjectives(...).map(i => i.id))` (the committed ids are the row set — empty route ⇒ no action offered anyway), `io.saveLedger`, then `location.hash = \`#/${lordSlug}/ledger/${routeId}\``. The in-flight index load on the route page is a minimal neutral state (the DESIGN's "no silent writes" governs mutations; the index read resolves before the action renders). Completion/delete refresh the index (Commit 10) so `start` reappears — the DESIGN's "startable again".

**Files and responsibilities:** `app/views/route.ts` — the action region in the undercard area (presentational; receives the campaign props). `app/main.tsx` — the route-case props + the index state + `onStart` handler. `app/styles/app.css` — the action-region treatments (token-only). `test/views.test.ts` — the action-region proofs.

**Tests and proof:** Observable (zero-DOM VNode flatten over constructed index states): a constructed route view with no active campaign and items offers the start action; with an active campaign for this route renders the open-ledger link with the exact `#/<lord>/ledger/<route-id>` href; with a different route's campaign active renders the blocked message linking to that campaign's hash; a route with zero VCO items renders no action. Start's persistence + navigation are the manual boot proof (the pure `createCampaign` and the PUT are already unit/server-proven). Proof seam: `test/views.test.ts`'s existing flatten helpers over the committed tree + constructed index props.

**Validation:** `npm test` (targeted `node --test test/views.test.ts`, then the suite), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`, and the manual HTTP boot: start from a route page creates the file in the store and lands on the ledger page; reload the route page → open-ledger; second route page → blocked message.

**Stop conditions:** The single-active-campaign rule needing state the index cannot express (report — the index is the one definition); a "start" edge (no items, corrupt file, completed file) resolving differently from the recorded decisions.

**Review mandate:** the action region is presentational over the props (no direct I/O in `route.ts`); the three states + no-action case match the DESIGN Journey rules exactly; start builds the document from the committed ids via the pure model and navigates with the Commit 3 grammar; the index is the single source of the active-campaign fact; no other route-page behavior changes; token-only CSS; existing route tests stay green.

#### Package `ledger-complete-delete` — Commit 10: Complete and delete campaigns

**Status:** Planned

**Wave:** 7

**Depends on:** ["ledger-route-start"]

**Write scope:** ["app/main.tsx", "app/ledger/useCampaign.ts", "app/ledger/logic.ts", "app/ledger/state.ts", "app/views/ledger.ts", "app/styles/app.css", "test/views.test.ts", "test/ledger-logic.test.ts", "test/ledger-state.test.ts"]

**Provisional commit:** `feat(app): complete and delete campaigns`

**Work:** The lifecycle close-out per the DESIGN Journeys 3 and 4. `logic.ts` gains the pure `completeCampaign(doc)` transition (status → `completed`, updated timestamp; every field else untouched); `state.ts` gains the begin/finish/fail transitions for the complete and delete commands (delete's "pure part" is the confirmation→removing state transition — the file removal is `io`). `app/views/ledger.ts` gains the lifecycle region: the mark-complete action (primary button — only on an `active` campaign) and the delete action (destructive: explicit confirmation whose copy states "the campaign file is removed" in plain language; completion's confirmation states the archived file is kept); the archived view of a completed campaign renders the rows read-only (no mutation controls — the recorded decision) with the delete action available; dismissing the confirmation leaves the campaign untouched. `useCampaign.ts` gains `onComplete`/`onDelete`: complete → `completeCampaign` → save → settled archived state (route pages then see the campaign as non-active — index refreshed); delete → `io.deleteLedger` → refreshed state (the ledger hash now renders the empty state). `app/main.tsx` passes the handlers; CSS gains the lifecycle treatments (token-only).

**Atomicity:** One outcome: "marking complete archives the campaign (file kept, not active, route pages startable again) and delete removes the file only after explicit confirmation, with the archived view read-only" — the pure complete transition, the confirmation/delete command states, the lifecycle region, the handler wiring, and their proofs are one lifecycle slice (Journeys 3+4 share the confirmation surface and the post-lifecycle index refresh; splitting them would ship two actions sharing a half-built confirmation region in the same file set). Counted estimate: ~170 non-test implementation lines across the six source paths (the shared lifecycle region and its states cannot be split into two complete, independently reviewable render outcomes). No further valid split exists.

**Out of scope:** Browsing/listing completed campaigns (v2.0 non-goal), any behavior change to the active campaign's mutations (Commit 8), and the route-page surfaces beyond their startability refresh.

**Implementation packet:** Complete and delete both update the in-memory index immediately after their I/O settles (the index is the single active-campaign fact; route pages refresh from it on next mount/hash change so "start again" appears — per the DESIGN "startable again" acceptance). The delete confirmation follows the DESIGN pre-delivery checklist (destructive-action confirmation, keyboard-operable, dismiss leaves everything untouched); its copy must state the file is removed (irreversible in plain language) while completion's states the archived file is kept. The archived ledger view (opened by its hash) renders the committed rows without checkbox/step controls — mutations belong to the live campaign (recorded decision); the delete action remains. A `corrupt` file's hash keeps the Commit 7 load-error panel; delete is still reachable there (the error panel carries the delete action for that campaign? — no: per the recorded decision, the corrupt-file path renders the load error with Retry, and deletion of a corrupt file is the human's manual step; report any review objection as a decision change rather than wiring a delete into the error panel unilaterally).

**Files and responsibilities:** `app/main.tsx` + `app/ledger/useCampaign.ts` — the lifecycle handlers and index refresh. `app/ledger/logic.ts` — `completeCampaign`. `app/ledger/state.ts` — the complete/delete command transitions. `app/views/ledger.ts` — the lifecycle region + archived read-only rendering. `app/styles/app.css` — the lifecycle treatments. `test/views.test.ts`, `test/ledger-logic.test.ts`, `test/ledger-state.test.ts` — the new proofs.

**Tests and proof:** Observable: pure — `completeCampaign` flips only status/updatedAt; the state transitions cover confirm→removing→settled and dismissal leaves state untouched; view — an active campaign's ledger renders the complete + delete actions, a completed campaign's renders the read-only rows (no mutation controls) with delete, the confirmation copy names the file removal/keep, dismissal renders no removal; the delete flow's file removal + index refresh are the manual boot proof (the io DELETE and the transitions are already proven). Seam: the existing unit + VNode suites; manual boot: complete → route page offers start again, reload shows archived state; delete → file gone, ledger hash shows the empty state.

**Validation:** `npm test` (targeted suites, then the full suite), `npx tsc --noEmit`, `node tools/content-lint.mjs` (exit 0), `npm run build`, then the manual `npm run serve` boot verifying Journeys 3–4 end to end (complete → startable again; delete with confirmation → file removed on disk in the store; dismiss → untouched).

**Stop conditions:** A lifecycle rule the DESIGN's invariants cannot carry (single-active, archived-file-kept, irreversible-delete copy) — report and stop rather than improvise; the corrupt-file delete question surfacing as a genuine requirement change (recorded above as the pending review point).

**Review mandate:** complete keeps the file with status `completed` and stops the active-campaign fact everywhere (single source: the index); delete removes the file only after the explicit confirmation and never on dismiss; the archived view is read-only; the index refresh makes route pages startable again; pure/logic/state/io boundaries hold (no I/O in views or logic; no transition logic re-derived in the hook); confirmation copy matches the DESIGN's plain-language requirements; token-only CSS; no new dependencies.

## Discoveries and replanning

Record material deviations, blockers, and decisions that change remaining work. State what was planned, what changed, and why. Preserve unchanged IDs. Mark replaced packages or PRs `Removed — <reason>` and add new stable IDs; never reuse an old ID for a different outcome.

- (Empty at plan acceptance; the coordinator appends execution discoveries here.)
- C2 deviation (accepted at review): `createCampaign`'s `now` is a required parameter (packet showed `now?`); an optional without a `Date.now()` fallback is untypeable and the review mandate forbids the fallback. Later wiring packages inject the clock at the event site.
- C4 discovery → bounded C1 correction (accepted, first and only correction round for `server-ledger-surface`): the Commit-1 index derivation stitched `status`/`updatedAt` verbatim from any parseable file, so a hand-edited parseable-but-not-a-document file produced an out-of-contract index entry that the strict `listLedgers()` client rejects as a whole-index typed error. Correction: the derivation now shape-validates the parsed top level (non-null object, `status` exactly `active`/`completed`, string `updatedAt`) and classifies anything else per-file `corrupt` with `updatedAt: null` — the DESIGN corrupt-file contract extended to parseable-but-shape-invalid files; the client's strictness is retained as fail-closed defense. New server regression test proves per-file classification.

## Final validation

Exact gates, in order, before final feature review:

1. `npm test` — the full `node --test` suite green: every F1–F4/F7 suite unchanged, plus the new server ledger-HTTP shapes, the ledger logic/state unit suites, the ledger I/O spawned-server suite, the router ledger-shape table, the Ledger Table anatomy proofs, and the ledger-page/route-action VNode proofs.
2. `npx tsc --noEmit` — clean over `app/`, `tools/`, `test/` (the closed 0–4 `confirmedStep` union and the `HashRoute` ledger member compile across the views, the hook, and the tests).
3. `node tools/content-lint.mjs` — exit 0 on the committed `content/` (no content change; the gate re-verifies the VCO item ids the ledger ticks).
4. `npm run build` — static `dist/` produced; `package.json` diff empty (no new dependencies; `preact` only).
5. Manual HTTP boot (`npm run serve` after a fresh `npm run build`): the route page start action creates `.local/state/ledgers/elspeth-von-draken/route-<n>.json` (outside Git — `.gitignore` covers `.local/`); the ledger page loads on demand (no boot-time ledger fetch — verify a fresh load issues no ledger request until a ledger hash is opened), renders the two column groups with `n / m` progress, ticks and steps persist across a full reload, a failed write (server stopped) rolls the row back with visible row-level error text, starting is blocked while another campaign is active, complete keeps the archived file and makes the route page startable again, and delete removes the file only after the explicit confirmation (dismiss leaves it untouched); keyboard operation and `:focus-visible` rings on the checkbox and step controls; the Ledger Table matches the DESIGN.md contract (40px rows, hairlines, mono group headers, state dots + labels, error border + rollback).
6. The DESIGN §7 acceptance criteria checked item by item (every item above maps to one), including the separate-column-groups check, the never-silently-repair corrupt-file rule, the no-VCO-route no-action rule, and the pre-delivery checklist (keyboard-operable controls, `:focus-visible`, destructive-action confirmation, no colour-only meaning).

Report any skipped or unsupported validation step as a gap, never as a pass (known honest gaps: the hook/`main.tsx` glue has no node:test seam — the manual boot is its completing proof, the `useHashRoute` precedent; DOM-level focus/scroll behaviors are manual-boot-only).

## Documentation impact

Complete during reconciliation at feature close-out (coordinator/steward, not package work):
- `.wiki/TODO.md` — already updated to `Active` with the ledger link (this planning dispatch); moved to `Completed` only after verified final integration.
- `.wiki/ARCHITECTURE.md` — §1.1/§1.2: F5 flips from approved-but-unbuilt to implemented; the server line gains the ledger root; the module layout gains the implemented `app/ledger/{types,logic,state,io,useCampaign}.ts`, `app/views/ledger.ts`, and `app/components/LedgerTable.ts` facts; the data-flow notes gain the ledger write/rollback path.
- `.wiki/DESIGN.md` — the Ledger Table, Buttons, Empty/Error, and pre-delivery checklist sections gain implemented-verified notes where implementation lands (all already specified; reconcile only differences).
- The accepted VCO-CAMPAIGN-LEDGER-DESIGN.md and this ledger stay in place through completion; the ledger's Discoveries section is the record for any wording-vs-implementation differences.
- The accepted planning artifacts (DESIGN + this ledger) are committed to the tracked `.wiki/` in a separate authorized Git operation before execution — never as part of an implementation package.
