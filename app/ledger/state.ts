/**
 * The optimistic command lifecycle for ledger row mutations (package
 * `ledger-command-state`, commit 5) plus the lifecycle close-out commands
 * (package `ledger-complete-delete`, commit 10; VCO-CAMPAIGN-LEDGER-DESIGN
 * Journeys 3 and 4 — "mark the campaign complete" / "delete a campaign").
 *
 * Pure transitions with no I/O, timers, or DOM. `beginWrite` applies an
 * ALREADY-COMPUTED next document — `logic.ts` produced it, `state.ts`
 * never re-derives a transition — and marks the row `saving`;
 * `finishWrite` confirms the write (row back to `idle`); `failWrite`
 * restores the EXACT pre-write document (byte-identical whole-document
 * rollback — the DESIGN's per-row rollback is the presentation of that
 * restore: every other row keeps its committed value because it is the
 * same document) and marks the row `error` with the message.
 *
 * The lifecycle commands share the same snapshot contract: `requestComplete`
 * / `requestDelete` open the confirmation stage (UI-only — the document,
 * rows, and snapshot stay byte-identical until the user decides, and
 * `dismissLifecycle` returns the state exactly untouched); `beginComplete`
 * applies the ALREADY-COMPUTED completed document optimistically (the
 * archived doc is the "next doc" — the row-write optimism pattern) and
 * `beginDelete` marks the removal in flight (the file removal itself is
 * `io.deleteLedger`, outside these transitions); the finish/fail variants
 * settle or roll back exactly like the row-write ones, with `finishDelete`
 * dissolving the command state entirely — a removed campaign has no
 * document left to command over (the hook then renders the empty state).
 *
 * The ledger is single-writer whole-document, so exactly ONE operation (a
 * row write, a complete write, or a delete removal) may be in flight at a
 * time; the hook queues actions rather than the transitions here. The
 * transitions enforce that protocol loudly ("in flight" guards) instead of
 * building queueing machinery — a second concurrent write would silently
 * corrupt the rollback snapshot, the DESIGN's "in-memory state never
 * diverges silently from the persisted file" invariant. Inputs are never
 * mutated (the repo's immutable-tree convention); a document is the shared
 * value of no more than one state.
 */

import type { CampaignDoc } from "./types.ts";

/** One row's UI-visible mutation state: idle, saving, or error (+ message). */
export type RowPhase = "idle" | "saving" | "error";

/**
 * One row's command bookkeeping: the phase the Ledger Table renders, and
 * the row-level message shown on `error` (null in every other phase).
 */
export interface RowStatus {
  readonly phase: RowPhase;
  readonly message: string | null;
}

/** The two lifecycle commands a campaign can perform (DESIGN Journeys 3 and 4). */
export type LifecycleAction = "complete" | "delete";

/**
 * The lifecycle stage the page renders below the table: the open
 * confirmation (the copy varies by action), the in-flight operation (the
 * complete write or the delete removal), or the message of a failed
 * operation — the no-silent-writes surfacing at the page level.
 */
export type LifecycleStage =
  /** The confirmation is open; the document/rows/snapshot are untouched until the user decides. */
  | { readonly kind: "confirm"; readonly action: LifecycleAction }
  /** The operation is in flight: the complete write (optimistic doc applied) or the delete removal (`io.deleteLedger`). */
  | { readonly kind: "removing"; readonly action: LifecycleAction }
  /** The operation failed: `doc` was restored to its pre-write value; the message renders with the actions (the retry affordance). */
  | { readonly kind: "error"; readonly message: string };

/**
 * The pure optimistic command state. `doc` is the current document — the
 * optimistic next document while a write is in flight (a completed doc
 * while the complete write is in flight, the unchanged doc during a
 * delete); `rows` carries per-row status keyed by item id (an absent key
 * reads as idle via `rowStatus`); `preWrite` is the exact pre-write
 * document snapshot needed for rollback — for the lifecycle commands too
 * (null while nothing is in flight); `lifecycle` is the page-level
 * lifecycle stage (null while no confirmation is open and no lifecycle
 * operation is in flight).
 */
export interface LedgerCommandState {
  readonly doc: CampaignDoc;
  readonly rows: Readonly<Record<string, RowStatus>>;
  readonly preWrite: CampaignDoc | null;
  readonly lifecycle: LifecycleStage | null;
}

/** The idle default shared by every row without an entry (see `FRESH_ITEM` in `logic.ts`). */
const IDLE: RowStatus = { phase: "idle", message: null };

/** The initial state of a freshly loaded document: no in-flight write, no marked rows, no lifecycle stage. */
export function createLedgerCommandState(doc: CampaignDoc): LedgerCommandState {
  return { doc, rows: {}, preWrite: null, lifecycle: null };
}

/** The row's status, defaulting to idle when the record has no entry for it. */
export function rowStatus(state: LedgerCommandState, itemId: string): RowStatus {
  return state.rows[itemId] ?? IDLE;
}

/**
 * Applies the already-computed optimistic next document and marks the row
 * `saving`. The pre-write document becomes the rollback snapshot. Refuses
 * a second write while one is in flight: the ledger is whole-document
 * single-writer, so only one mutation may be pending at a time (the hook
 * serializes row actions).
 */
export function beginWrite(
  state: LedgerCommandState,
  itemId: string,
  nextDoc: CampaignDoc,
): LedgerCommandState {
  if (state.preWrite !== null) {
    throw new Error(
      "beginWrite: a write is already in flight — row mutations must be serialized (one whole-document write at a time; the hook queues row actions)",
    );
  }
  return {
    doc: nextDoc,
    rows: { ...state.rows, [itemId]: { phase: "saving", message: null } },
    preWrite: state.doc,
    lifecycle: state.lifecycle,
  };
}

/**
 * Confirms the write: the optimistic document is now the committed one and
 * the row settles back to `idle`. The rollback snapshot is consumed. Pure:
 * returns a new state sharing the current document, never mutates inputs.
 */
export function finishWrite(state: LedgerCommandState, itemId: string): LedgerCommandState {
  if (state.preWrite === null) {
    throw new Error("finishWrite: no write is in flight for the row — beginWrite must precede it");
  }
  return {
    doc: state.doc,
    rows: { ...state.rows, [itemId]: { phase: "idle", message: null } },
    preWrite: null,
    lifecycle: state.lifecycle,
  };
}

/**
 * Rolls the write back: restores the exact pre-write document (byte-
 * identical, whole-document — every other row keeps its committed value
 * because it is the same document) and marks the row `error` with the
 * message. The rollback snapshot is consumed. Pure: never mutates inputs.
 */
export function failWrite(state: LedgerCommandState, itemId: string, message: string): LedgerCommandState {
  if (state.preWrite === null) {
    throw new Error("failWrite: no write is in flight to roll back — beginWrite must precede it");
  }
  return {
    doc: state.preWrite,
    rows: { ...state.rows, [itemId]: { phase: "error", message } },
    preWrite: null,
    lifecycle: state.lifecycle,
  };
}

/** Opens a lifecycle confirmation (the shared request — the document, rows, and snapshot stay untouched). */
function requestLifecycle(state: LedgerCommandState, action: LifecycleAction): LedgerCommandState {
  if (state.lifecycle !== null && state.lifecycle.kind !== "error") {
    throw new Error(
      "requestLifecycle: a confirmation or removal is already in progress — dismiss it or let the operation settle first",
    );
  }
  // A failed stage is replaceable: the retry affordance reopens the confirmation.
  return { ...state, lifecycle: { kind: "confirm", action } };
}

/** Opens the mark-complete confirmation (the active campaign's primary action). */
export function requestComplete(state: LedgerCommandState): LedgerCommandState {
  return requestLifecycle(state, "complete");
}

/** Opens the delete confirmation (available on the active and archived views). */
export function requestDelete(state: LedgerCommandState): LedgerCommandState {
  return requestLifecycle(state, "delete");
}

/**
 * Dismisses the open confirmation: `doc`, `rows`, and `preWrite` stay
 * byte-identical — the campaign is exactly untouched (DESIGN "Delete
 * confirmation dismissed: the campaign is untouched"). Only the confirm
 * stage is dismissible; an in-flight operation must settle first.
 */
export function dismissLifecycle(state: LedgerCommandState): LedgerCommandState {
  if (state.lifecycle?.kind !== "confirm") {
    throw new Error("dismissLifecycle: no confirmation to dismiss — the lifecycle must be in its confirm stage");
  }
  return { ...state, lifecycle: null };
}

/**
 * Confirms the complete: the ALREADY-COMPUTED completed document applies
 * optimistically (the optimistic-document pattern — the archived doc is the
 * "next doc" every field the completion wrote) and the confirmation becomes
 * the in-flight removal state, taking the exact pre-write snapshot for
 * rollback. Refuses while any write is in flight: the ledger is
 * whole-document single-writer, so the hook serializes through the same
 * `preWrite` gate as row writes.
 */
export function beginComplete(state: LedgerCommandState, nextDoc: CampaignDoc): LedgerCommandState {
  if (state.preWrite !== null) {
    throw new Error(
      "beginComplete: a write is already in flight — complete must wait for it to settle (one whole-document operation at a time; the hook queues it)",
    );
  }
  if (state.lifecycle?.kind !== "confirm" || state.lifecycle.action !== "complete") {
    throw new Error("beginComplete: no pending complete confirmation — requestComplete must precede it");
  }
  return {
    doc: nextDoc,
    rows: state.rows,
    preWrite: state.doc,
    lifecycle: { kind: "removing", action: "complete" },
  };
}

/**
 * Confirms the delete: the confirmation becomes the in-flight removal
 * state, taking the exact pre-write snapshot (`io.deleteLedger` performs
 * the file removal). The document stays unchanged until the removal
 * settles. Refuses while any write is in flight (same serialization gate as
 * `beginComplete`).
 */
export function beginDelete(state: LedgerCommandState): LedgerCommandState {
  if (state.preWrite !== null) {
    throw new Error(
      "beginDelete: a write is already in flight — delete must wait for it to settle (one whole-document operation at a time; the hook queues it)",
    );
  }
  if (state.lifecycle?.kind !== "confirm" || state.lifecycle.action !== "delete") {
    throw new Error("beginDelete: no pending delete confirmation — requestDelete must precede it");
  }
  return {
    doc: state.doc,
    rows: state.rows,
    preWrite: state.doc,
    lifecycle: { kind: "removing", action: "delete" },
  };
}

/**
 * Settles the complete write: the archived document is now the committed
 * one (the file is kept with status `completed`) and the lifecycle returns
 * to idle. The rollback snapshot is consumed. Pure: never mutates inputs.
 */
export function finishComplete(state: LedgerCommandState): LedgerCommandState {
  if (state.preWrite === null || state.lifecycle?.kind !== "removing" || state.lifecycle.action !== "complete") {
    throw new Error("finishComplete: no complete write is in flight — beginComplete must precede it");
  }
  return { doc: state.doc, rows: state.rows, preWrite: null, lifecycle: null };
}

/**
 * Rolls the complete write back: restores the exact pre-write document
 * (byte-identical — the campaign returns to being active) and surfaces the
 * failed operation's message on the lifecycle error stage (the DESIGN's
 * no-silent-writes rule at the page level). Pure: never mutates inputs.
 */
export function failComplete(state: LedgerCommandState, message: string): LedgerCommandState {
  if (state.preWrite === null || state.lifecycle?.kind !== "removing" || state.lifecycle.action !== "complete") {
    throw new Error("failComplete: no complete write is in flight to roll back — beginComplete must precede it");
  }
  return {
    doc: state.preWrite,
    rows: state.rows,
    preWrite: null,
    lifecycle: { kind: "error", message },
  };
}

/**
 * Settles the delete removal: the campaign file is gone, so no command
 * state remains — the hook dissolves it (`null`) and the ledger view
 * renders its empty state. Pure: never mutates inputs.
 */
export function finishDelete(state: LedgerCommandState): null {
  if (state.preWrite === null || state.lifecycle?.kind !== "removing" || state.lifecycle.action !== "delete") {
    throw new Error("finishDelete: no delete removal is in flight — beginDelete must precede it");
  }
  return null;
}

/**
 * Rolls the delete removal back: restores the exact pre-write document
 * (the file was not removed, so the campaign still commands) and surfaces
 * the failed removal's message on the lifecycle error stage (no silent
 * writes). The rollback snapshot is consumed. Pure: never mutates inputs.
 */
export function failDelete(state: LedgerCommandState, message: string): LedgerCommandState {
  if (state.preWrite === null || state.lifecycle?.kind !== "removing" || state.lifecycle.action !== "delete") {
    throw new Error("failDelete: no delete removal is in flight to roll back — beginDelete must precede it");
  }
  return {
    doc: state.preWrite,
    rows: state.rows,
    preWrite: null,
    lifecycle: { kind: "error", message },
  };
}
