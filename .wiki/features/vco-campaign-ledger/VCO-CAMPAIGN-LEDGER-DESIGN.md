# Feature: F5 — VCO Campaign Ledger

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** Track one live VCO campaign — the active route's objective items with a planning checkbox and a separate game-confirmed step track — persisted as plain JSON outside Git, surviving site reloads, without ever letting the planning checklist imply the game's completion state.

**Context:** F5 (PRD order 6) is the last v1.0 feature and the only one on the write path. It consumes the per-route VCO objective items already committed in `content/<lord>/data/vco.json` (read via the existing `getVcoObjectives` selector; rendered on the route page as the VCO objectives undercard) and the Ledger Table contract fixed in `.wiki/DESIGN.md` §Ledger Table. Storage is JSON files in gitignored `.local/state/ledgers/` written through a `PUT` endpoint added to the existing dependency-free local server (`tools/server.mjs`, currently GET-only), per ADR-0001 and ARCHITECTURE §1.1. Side effects are confined to `app/ledger/io.ts`; tick/step/create/complete/delete transitions are pure functions in `app/ledger/logic.ts`. F8 (local database) will later replace the file store behind the same document-level surface.

**Non-Goals:**

- Browsing, listing, or comparing finished campaigns (explicit v2.0 candidate: multi-campaign history).
- Live game or save-file integration — every game-confirmed entry is typed by the player.
- Multiple simultaneous active campaigns.
- Free-form per-turn notes or journal fields on ledger items.
- Any content-model, lint, or content change: the ledger never writes into `content/` and never modifies VCO items.
- Ledger database storage (F8); the file store's data shape may not yet be final.

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Planning tick (per item):** one boolean per VCO objective item — "I believe this is planned/handled." No other planning input.
- **Game-confirmed step (per item):** a 0–4 position on the fixed 4-step track: (0) none → (1) appears complete → (2) mission marked complete → (3) victory registered → (4) reward received. The player moves the step forward, or back to correct a wrong entry.
- **Campaign lifecycle actions:** start (from a route page), mark complete, delete. Campaign identity is derived from the chosen lord + route; the player does not name campaigns.

### Displayed Data

- **Ledger rows:** one row per objective item of the active campaign's route, in the committed `vco.json` order: objective label, planning state (checkbox + text label), game-confirmed step (state dot + text label per the DESIGN system).
- **Progress:** explicit `n / m` counts beside each track's progress indication — the numbers are the data, per the DESIGN system.
- **Campaign context:** the campaign's lord, route, and the guide's patch/VCO version context inherited from `guide.json`.
- **Ledger index state (site-wide):** whether one campaign is active, so route pages can offer "start" vs "open ledger" and the ledger view can show its empty state.

### Persistent Data

Persistence location and mechanism: one plain-text JSON file per campaign at `.local/state/ledgers/<lord-slug>/<route-id>.json`, gitignored; the local server is the only writer (single `PUT` surface with the same path-safety discipline as its existing static routes).

- **Campaign document:** campaign identity (lord slug, route id), status (`active` or `completed`), created/updated timestamps, and per-item state keyed by VCO dataset item id: `planned` (boolean) and `confirmedStep` (0–4). Stored because it must survive browser resets and site reloads.
- **The system must NOT persist** in-memory optimistic write state (it is discarded on rollback), any derived totals (always recomputed from items), or anything under `content/` (the committed content root is read-only to the site).

## 3. The User Journey (Step-by-Step)

### Start a campaign

1. **Entry Point:** a route page for a route with at least one committed VCO objective item.
2. **Action 1:** with no active campaign, the route page offers a start-ledger action; the player triggers it.
3. **System Response 1:** a campaign document is created (status `active`, all items unplanned, all steps 0) and persisted via the server write path; the ledger view for that campaign is shown with loading → success feedback.
4. **Success State:** the route page and ledger view reflect the active campaign; the ledger survives a site reload.

### Track a live campaign

1. **Entry Point:** the route page of the active campaign's route (or the ledger view directly).
2. **Action 1:** the player toggles a planning checkbox, or advances/retreats a row's game-confirmed step.
3. **System Response 1:** optimistic in-memory update with loading → success feedback; the new document is PUT to the server.
4. **Action 2 (on failure):** —
5. **System Response 2:** the row rolls back to its pre-write state with a visible row-level error (`error` border + text); the other rows keep their committed state.
6. **Success State:** every mutation is either durably persisted or visibly rolled back — no silent writes.

### Complete a campaign

1. **Entry Point:** the ledger view of the active campaign.
2. **Action 1:** the player marks the campaign complete (explicit action — the site never auto-detects completion).
3. **System Response 1:** the document is persisted with status `completed`; the campaign stops being the active one.
4. **Success State:** the campaign's JSON file remains in place as the archived plain file; the route page offers "start" again; the completed campaign is not listed anywhere (browsing is a v2.0 non-goal).

### Delete a campaign

1. **Entry Point:** the ledger view of an active or archived campaign.
2. **Action 1:** the player initiates delete; an explicit confirmation is required (DESIGN system: destructive actions confirm).
3. **System Response 1:** after confirmation, the campaign file is removed; the ledger index is refreshed.
4. **Success State:** the site reflects the remaining state (active campaign gone or archived file removed) and the reading path is unaffected.

## 4. Logical Constraints (The "Rules of the Road")

### Track separation

- **IF** the player toggles a planning checkbox, **THEN** only that item's `planned` field changes; its `confirmedStep` is untouched.
- **IF** the player moves a game-confirmed step, **THEN** only that item's `confirmedStep` changes; `planned` is untouched.
- **THEN (invariant)** the planning track and the game-confirmed track are always stored as separate fields and rendered as separate column groups with distinct mono group headers — on every view that shows both.

### Single active campaign

- **IF** a campaign is active, **THEN** starting a second campaign is blocked with a message that links to the active campaign; the existing campaign is never silently replaced.
- **IF** the active campaign is completed or deleted, **THEN** any route with committed VCO items becomes startable again.

### Items follow committed content

- **IF** a route's `vco.json` items change between sessions, **THEN** the ledger renders the current committed item set: item ids missing from the campaign file render as unplanned/step 0, and item ids removed from content do not appear as rows.
- **IF** a route has no committed VCO items, **THEN** no ledger can be started for it (start action is not offered); the absence is the existing VCO content-gap treatment, not a new error state.

### Persistence

- **IF** a write is attempted, **THEN** it goes exclusively through the local server's ledger write surface; the site never writes to `content/` and never bypasses the server.
- **IF** a write fails, **THEN** the pre-write document state is restored in the UI and the failure is shown per row; the in-memory state never diverges silently from the persisted file.

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- **Ledger write failure (PUT rejected, server down, malformed path):** row-level `error`-bordered state with descriptive inline text and rollback to the pre-write state, plus a retry affordance per the DESIGN system's error panel.
- **Ledger file unreadable or invalid JSON (corrupted manually):** the affected campaign renders as a load error (icon + message + retry); other state and the reading path are unaffected; the site never repairs or overwrites the file silently.
- **Stale in-memory document (file edited on disk while the site is open):** single-user, single-writer site — no conflict handling is required; the next successful write of the current in-memory document wins.

### Empty States

- **No campaign exists:** the ledger view shows the DESIGN system's explicit empty state — mono "NO ACTIVE CAMPAIGN" label with one proportional sentence directing the player to start one from a route page. Never blank.
- **Route with no VCO items:** no start action; the route's existing VCO content-gap treatment applies.

### Boundary Cases

- **Full 4-step track:** a row at step 4 (reward received) offers no forward advance; moving back is still possible (correction).
- **Retreat before step 1:** a row at step 0 offers no backward move.
- **Reload mid-campaign:** the ledger reloads on demand from its file and restores every planning tick and step position exactly.
- **All items ticked, none confirmed:** the planning track may show `n / m` complete while the game-confirmed track remains at zero — both facts stay visibly separate; no completion is implied.

### Interruptions

- **Page closed or server stopped after an optimistic update that has not been confirmed:** the UI state is ephemeral; the persisted file holds the last successful write, and the next load restores it. Nothing is partially applied: each mutation is one whole-document write.
- **Delete confirmation dismissed:** the campaign is untouched.

## 6. Interface & Interaction (The "Look and Feel")

Follows the DESIGN system exactly — the Ledger Table, Buttons, Version Banner, and Empty/Error contracts in `.wiki/DESIGN.md` are the fixed visual and interaction specification (row anatomy, 40px rows with hairline dividers, mono uppercase group headers, state dots with text labels, `n / m` progress pairs, ghost "Retry" buttons, `:focus-visible` rings, keyboard-operable checkboxes and step controls, optimistic update feedback). No deliberate deviations.

### Visual Style

Inherits the token-based system (carbon `surface-container` ledger table, metric green only for confirmed-step states, orange only for flagged/active state, red exclusively for failed writes). Ledger planning and game-confirmed tracks are separate column groups — visually unmistakable that they are different facts.

### Layout

- **Ledger view:** campaign context header (lord, route, version context inherited from the guide), the Ledger Table with the two column groups, and the lifecycle actions (mark complete, delete) as the established primary/ghost buttons.
- **Route page integration:** where the route is the active campaign's route, the VCO objectives undercard links to the ledger; otherwise, when no campaign is active, it offers the start action. The ledger is reachable by its own hash route so a reload lands on it.

### Copywriting

- **Empty state:** the DESIGN system's fixed copy — "NO ACTIVE CAMPAIGN" mono label plus one proportional sentence pointing to starting from a route page.
- **Start-blocked message:** states that a campaign is already active and links to it; tone matches the instrument voice (factual, no decoration).
- **Complete / delete confirmations:** confirmation wording must make deletion irreversible in plain language ("the campaign file is removed") while completion is described as keeping the archived file.
- **All other labels:** established DESIGN system labels (group headers, step names, state labels); no new wording contract.

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] Starting a ledger from an Elspeth route page creates a plain-text JSON campaign file under the gitignored local storage directory, outside Git.
- [ ] Every planning tick and step change survives a full site reload with the exact committed state restored.
- [ ] `planned` and `confirmedStep` are stored as separate fields and rendered as separate column groups; ticking every planning checkbox leaves every `confirmedStep` at 0, and advancing a step never flips `planned`.
- [ ] At most one campaign is active at a time; a second start attempt is blocked with a link to the active campaign and does not modify it.
- [ ] A failed write rolls back the affected row to its pre-write state with visible row-level error text; no mutation is silent.
- [ ] Marking a campaign complete stops it being active while its JSON file remains on disk; the route page becomes startable again.
- [ ] Deleting a campaign removes its file only after explicit confirmation; dismissing the confirmation leaves it untouched.
- [ ] A route with no committed VCO items offers no start action and shows no broken ledger UI.
- [ ] Ledger loading is on demand (never at boot); the boot path and reading path of the site are unchanged.
- [ ] All ledger logic (tick, step, create, complete, delete, validation) is pure and unit-tested; all file/network side effects are confined to the one ledger I/O module.
