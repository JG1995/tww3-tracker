/**
 * The optimistic command lifecycle for ledger row mutations (package
 * `ledger-command-state`, commit 5; VCO-CAMPAIGN-LEDGER-DESIGN §3 "Track a
 * live campaign" — "optimistic in-memory update with loading → success
 * feedback; … the row rolls back to its pre-write state with a visible
 * row-level error").
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
 * The ledger is single-writer whole-document, so exactly one mutation may
 * be in flight at a time; the hook queues row actions rather than the
 * transitions here. The transitions enforce that protocol loudly
 * ("in flight" guards) instead of building queueing machinery — a second
 * concurrent write would silently corrupt the rollback snapshot, the
 * DESIGN's "in-memory state never diverges silently from the persisted
 * file" invariant. Inputs are never mutated (the repo's immutable-tree
 * convention); a document is the shared value of no more than one state.
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

/**
 * The pure optimistic command state. `doc` is the current document — the
 * optimistic next document while a write is in flight; `rows` carries
 * per-row status keyed by item id (an absent key reads as idle via
 * `rowStatus`); `preWrite` is the exact pre-write document snapshot
 * needed for rollback (null while nothing is in flight).
 */
export interface LedgerCommandState {
  readonly doc: CampaignDoc;
  readonly rows: Readonly<Record<string, RowStatus>>;
  readonly preWrite: CampaignDoc | null;
}

/** The idle default shared by every row without an entry (see `FRESH_ITEM` in `logic.ts`). */
const IDLE: RowStatus = { phase: "idle", message: null };

/** The initial state of a freshly loaded document: no in-flight write, no marked rows. */
export function createLedgerCommandState(doc: CampaignDoc): LedgerCommandState {
  return { doc, rows: {}, preWrite: null };
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
  };
}
