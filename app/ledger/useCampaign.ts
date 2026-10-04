/**
 * The ledger page's in-memory state hook (ARCHITECTURE §1.1's ledger-page
 * state home; the `useHashRoute` precedent — browser-boot-proven, no
 * node:test seam): hosts the campaign document load lifecycle, the per-row
 * command statuses, the ledger index read for the active hash (fetched here
 * so Commit 9's route-page consumer gets the same source without a second
 * network contract), and the row mutation handlers.
 *
 * The hook SEQUENCES the already-tested primitives and never re-derives
 * them: `logic` computes the optimistic next document, `state` applies /
 * confirms / rolls back the write (`beginWrite` → `io.saveLedger` →
 * `finishWrite`, or `failWrite` on rejection), and `io` performs the I/O.
 * Row writes are serialized (the command state's one-in-flight contract) by
 * a FIFO queue: while `state.preWrite` is set, further row actions wait in
 * the queue instead of calling `beginWrite`, so the transitions' loud
 * "in flight" throw stays unreachable. Dropping the second mutation was
 * rejected: a drop after a checkbox/step click would silently lose input
 * whose DOM state has already changed (the DESIGN's no-silent-writes
 * spirit), while the queue settles every action in click order. The SAME
 * itemId is threaded through begin/finish/fail, so a settled write always
 * clears exactly the row it began (a mismatch would leave stale `saving`
 * entries — the C5 review obligation).
 *
 * Loading is on demand and never part of the boot pass: the hook is mounted
 * only while a ledger hash is active (the `main.tsx` ledger case), and both
 * reads (`io.listLedgers` + `io.loadLedger`) fire from an effect keyed by
 * `(lordSlug, routeId)` — a boot hash that is not a ledger hash never mounts
 * it and never issues a ledger request. No caching, no localStorage, no new
 * dependencies.
 */

import { useEffect, useRef, useState } from "preact/hooks";
import type { LedgerPhase } from "../views/ledger.ts";
import { listLedgers, loadLedger, saveLedger } from "./io.ts";
import { setConfirmedStep, tickItem } from "./logic.ts";
import { type LedgerCommandState, type RowStatus, beginWrite, createLedgerCommandState, failWrite, finishWrite } from "./state.ts";
import type { ItemState, LedgerIndexEntry } from "./types.ts";

/** The ledger index read for the active hash (Commit 9's route-page consumer). */
export type LedgerIndexState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly entries: readonly LedgerIndexEntry[] }
  | { readonly kind: "error"; readonly message: string };

/** One queued row mutation: a planning tick or a confirmed-step change. */
type RowAction =
  | { readonly kind: "tick"; readonly itemId: string; readonly planned: boolean }
  | { readonly kind: "step"; readonly itemId: string; readonly step: ItemState["confirmedStep"] };

/** The empty plan: a loaded document's command state is null for loading / error / empty. */
const EMPTY_STATUSES: Readonly<Record<string, RowStatus>> = {};

/** The document-load stage; `phase` derives the view's `LedgerPhase` from it plus the command doc. */
type LoadStage =
  | { readonly kind: "loading" }
  | { readonly kind: "ready" }
  | { readonly kind: "error"; readonly message: string };

/** The hook's return: everything the ledger case of `main.tsx` renders with. */
export interface UseCampaignResult {
  /** The page's load lifecycle: `loading`, `ready` with the current document (or null for the empty state), `error` with the message. */
  readonly phase: LedgerPhase;
  /** The per-row command statuses keyed by item id (`idle` / `saving` / `error` + message). */
  readonly statuses: Readonly<Record<string, RowStatus>>;
  /** The ledger index read for the active hash — fetched here for Commit 9's route-page consumer. */
  readonly index: LedgerIndexState;
  /** Re-runs the on-demand load (the error panel's ghost Retry). */
  readonly onRetry: () => void;
  /** The planning-checkbox toggle for one item (queued when a write is in flight). */
  readonly onTick: (itemId: string, planned: boolean) => void;
  /** The step advance/retreat for one item (queued when a write is in flight). */
  readonly onStep: (itemId: string, step: ItemState["confirmedStep"]) => void;
}

/** The failure message the view can render (the typed `LedgerError` message, or any other error's message). */
function failureMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** Derives the view's load lifecycle from the load stage + the current command state (same shape as the view's `pageState`). */
function phaseOf(stage: LoadStage, command: LedgerCommandState | null): LedgerPhase {
  switch (stage.kind) {
    case "loading":
      return { kind: "loading" };
    case "error":
      return { kind: "error", message: stage.message };
    case "ready":
      return { kind: "ready", doc: command === null ? null : command.doc };
  }
}

/** The ledger page's state hook; see the module docblock for the sequencing and serialization contract. */
export function useCampaign(lordSlug: string, routeId: string): UseCampaignResult {
  // The document load stage (the `phase` derives from it + the command doc),
  // the optimistic command state (`null` while no document is loaded), and
  // the index read for Commit 9.
  const [stage, setStage] = useState<LoadStage>({ kind: "loading" });
  const [command, setCommand] = useState<LedgerCommandState | null>(null);
  const [index, setIndex] = useState<LedgerIndexState>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  // Mirrors that async continuations (the write resolution) and the queue
  // gate can read the LATEST command synchronously — React state alone would
  // leave them reading the render that started the write.
  const commandRef = useRef<LedgerCommandState | null>(null);
  // The FIFO queue of row actions waiting while one write is in flight.
  const queueRef = useRef<RowAction[]>([]);
  // Bumped on every load-effect run: a write continuation whose session no
  // longer matches has been superseded by a fresh load and must not touch
  // state (the write itself is durable; the fresh load restores it).
  const sessionRef = useRef(0);

  /** Sets the command state and mirrors it in the ref synchronously. */
  function updateCommand(next: LedgerCommandState | null): void {
    commandRef.current = next;
    setCommand(next);
  }

  // The on-demand load, keyed by (lordSlug, routeId): the document (the
  // page's own state) and the index (Commit 9's source) are two independent
  // reads — a failing index never blocks the page's own document. This is
  // the ONLY ledger I/O in the app: the hook mounts only while a ledger hash
  // is active, so the boot pass and the content reading path are untouched.
  useEffect(() => {
    let cancelled = false;
    sessionRef.current += 1; // invalidates any pending write continuation of the previous session
    setStage({ kind: "loading" });
    updateCommand(null);
    setIndex({ kind: "loading" });

    void (async () => {
      try {
        const entries = await listLedgers();
        if (cancelled) return;
        setIndex({ kind: "ready", entries });
      } catch (cause) {
        if (cancelled) return;
        setIndex({ kind: "error", message: failureMessage(cause) });
      }
    })();

    void (async () => {
      try {
        const doc = await loadLedger(lordSlug, routeId);
        if (cancelled) return;
        updateCommand(doc === null ? null : createLedgerCommandState(doc));
        setStage({ kind: "ready" });
      } catch (cause) {
        if (cancelled) return;
        setStage({ kind: "error", message: failureMessage(cause) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lordSlug, routeId, attempt]);

  /**
   * Begins the next write for the queue head and settles it: pure next
   * document via `logic` → optimistic apply via `state.beginWrite` →
   * persist via `io.saveLedger` → confirm via `state.finishWrite`, or roll
   * back via `state.failWrite` (restores the exact pre-write document and
   * marks the row `error` with the message). The SAME itemId runs through
   * begin/finish/fail. `beginWrite`'s "in flight" throw is unreachable here:
   * the queue gate (below) starts a drain only when `preWrite` is null, and
   * the next drain starts only after this write settled back to idle.
   */
  async function drainQueue(): Promise<void> {
    const action = queueRef.current.shift();
    if (action === undefined) return;
    const start = commandRef.current;
    if (start === null) return; // no document loaded — nothing to mutate (unreachable from the table)
    const session = sessionRef.current;
    const nextDoc =
      action.kind === "tick"
        ? tickItem(start.doc, action.itemId, action.planned)
        : setConfirmedStep(start.doc, action.itemId, action.step);
    // The optimistic apply; `begun` is both the state the UI renders during
    // the write and the one the settle transitions finish/fail operate on
    // (the same `itemId` throughout, and no other command mutation can
    // interleave: writes are strictly serial and the session guard below
    // drops a stale continuation).
    const begun = beginWrite(start, action.itemId, nextDoc);
    updateCommand(begun);
    try {
      await saveLedger(nextDoc);
      if (sessionRef.current !== session) return; // the hash changed mid-write — the fresh load owns state
      updateCommand(finishWrite(begun, action.itemId));
    } catch (cause) {
      if (sessionRef.current !== session) return;
      updateCommand(failWrite(begun, action.itemId, failureMessage(cause)));
    } finally {
      if (sessionRef.current !== session) {
        queueRef.current = []; // actions queued for the old (lordSlug, routeId) are stale
        return;
      }
      void drainQueue();
    }
  }

  /** Queues one row action and starts the write loop only from an idle command state. */
  function queueAction(action: RowAction): void {
    const current = commandRef.current;
    if (current === null) return; // no document loaded (loading / error / empty) — nothing to mutate
    queueRef.current.push(action);
    // The one-in-flight contract: while `preWrite` is set, the action waits
    // in the queue; it drains serially when the in-flight write settles.
    if (current.preWrite === null) void drainQueue();
  }

  const onRetry = (): void => setAttempt((n) => n + 1);

  const onTick = (itemId: string, planned: boolean): void => queueAction({ kind: "tick", itemId, planned });

  const onStep = (itemId: string, step: ItemState["confirmedStep"]): void => queueAction({ kind: "step", itemId, step });

  /** The view's load lifecycle: `ready` carries the CURRENT document (the optimistic write while one is in flight). */
  const phase: LedgerPhase = phaseOf(stage, command);

  return {
    phase,
    statuses: command === null ? EMPTY_STATUSES : command.rows,
    index,
    onRetry,
    onTick,
    onStep,
  };
}
