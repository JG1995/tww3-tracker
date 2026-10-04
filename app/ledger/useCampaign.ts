/**
 * The ledger page's in-memory state hook (ARCHITECTURE §1.1's ledger-page
 * state home; the `useHashRoute` precedent — browser-boot-proven, no
 * node:test seam): hosts the campaign document load lifecycle, the per-row
 * command statuses, the ledger index read for the active hash (fetched here
 * so Commit 9's route-page consumer gets the same source without a second
 * network contract), and the mutation handlers — row actions AND the
 * lifecycle close-out commands (commit 10: complete / delete).
 *
 * The hook SEQUENCES the already-tested primitives and never re-derives
 * them: `logic` computes the optimistic next document, `state` applies /
 * confirms / rolls back the write, and `io` performs the I/O.
 *
 * Row writes AND lifecycle operations are serialized (the command state's
 * one-in-flight contract) by a FIFO queue: the complete write and the
 * delete removal take the SAME `preWrite` snapshot as a row write, so while
 * `state.preWrite` is set, further actions wait in the queue instead of
 * calling the transitions' loud "in flight" throws (which stay unreachable
 * — the queue gate starts a drain only when `preWrite` is null, and the
 * next drain starts only after the in-flight operation settled). The
 * confirmation handshake itself (open / dismiss) is UI-only: it touches
 * only the lifecycle stage, so it runs synchronously on the click, while
 * the confirm action queues like every write. Dropping a second mutation
 * was rejected: a drop after a checkbox/step click would silently lose
 * input whose DOM state has already changed (the DESIGN's no-silent-writes
 * spirit), while the queue settles every action in click order. The SAME
 * itemId is threaded through a row action's begin/finish/fail, so a settled
 * write always clears exactly the row it began; the lifecycle confirm
 * action resolves its own stage (a superseded confirmation is dropped, not
 * applied).
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
import { deleteLedger, listLedgers, loadLedger, saveLedger } from "./io.ts";
import { completeCampaign, setConfirmedStep, tickItem } from "./logic.ts";
import {
  type LedgerCommandState,
  type LifecycleStage,
  type RowStatus,
  beginComplete,
  beginDelete,
  beginWrite,
  createLedgerCommandState,
  dismissLifecycle,
  failComplete,
  failDelete,
  failWrite,
  finishComplete,
  finishWrite,
  requestComplete,
  requestDelete,
} from "./state.ts";
import type { ItemState, LedgerIndexEntry } from "./types.ts";

/** The ledger index read for the active hash (Commit 9's route-page consumer). */
export type LedgerIndexState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly entries: readonly LedgerIndexEntry[] }
  | { readonly kind: "error"; readonly message: string };

/** One queued command: a row mutation (tick/step) or the confirm of an open lifecycle confirmation. */
type CommandAction =
  | { readonly kind: "tick"; readonly itemId: string; readonly planned: boolean }
  | { readonly kind: "step"; readonly itemId: string; readonly step: ItemState["confirmedStep"] }
  | { readonly kind: "confirm"; readonly action: "complete" | "delete" };

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
  /**
   * The lifecycle stage (null = no confirmation open and no operation in
   * flight): the open confirmation, the in-flight removal, or a failed
   * operation's message.
   */
  readonly lifecycle: LifecycleStage | null;
  /** Opens the mark-complete confirmation (queued via the confirmation's own confirm action). */
  readonly onComplete: () => void;
  /** Opens the delete confirmation (available on the active and archived views). */
  readonly onDelete: () => void;
  /**
   * Confirms the open confirmation: queues the lifecycle operation behind
   * the current write, so complete/delete serialize with row writes through
   * the same `preWrite` gate (no concurrent in-flight operations).
   */
  readonly onConfirmLifecycle: () => void;
  /** Dismisses the open confirmation — the campaign stays untouched. */
  readonly onDismissLifecycle: () => void;
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
  // The FIFO queue of command actions waiting while one operation is in flight.
  const queueRef = useRef<CommandAction[]>([]);
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
   * Begins the next command for the queue head and settles it: pure next
   * document via `logic` → optimistic apply via `state` → persist via `io`
   * → confirm, or roll back to the exact pre-write document on rejection
   * (the lifecycle fail transitions surface the message on the error
   * stage). The SAME itemId runs through a row action's begin/finish/fail;
   * the lifecycle confirm action (a confirmed complete or delete) takes the
   * snapshot and performs its I/O exactly like a row write, and both update
   * the in-memory index as soon as their write settles (the index is the
   * single active-campaign fact — after complete/delete a route page sees
   * no active campaign, so `start` reappears). The transitions' "in flight"
   * throws are unreachable here: the queue gate (below) starts a drain only
   * when `preWrite` is null, and the next drain starts only after the
   * in-flight operation settled back to idle.
   */
  async function drainQueue(): Promise<void> {
    const action = queueRef.current.shift();
    if (action === undefined) return;
    const start = commandRef.current;
    if (start === null) return; // no document loaded — nothing to mutate (unreachable from the table)
    const session = sessionRef.current;

    if (action.kind === "tick" || action.kind === "step") {
      // The C2 model contract's caller-injected-clock pattern: the browser
      // event site is where a wall clock is legitimate, and the optimistic
      // and persisted documents share the same stamp (`tickItem`/
      // `setConfirmedStep` advance `updatedAt` from this `now`).
      const now = new Date().toISOString();
      const nextDoc =
        action.kind === "tick"
          ? tickItem(start.doc, action.itemId, action.planned, now)
          : setConfirmedStep(start.doc, action.itemId, action.step, now);
      // The optimistic apply; `begun` is both the state the UI renders during
      // the write and the one the settle transitions finish/fail operate on
      // (the same `itemId` throughout, and no other command mutation can
      // interleave: writes are strictly serial and the session guard below
      // drops a stale continuation).
      const begun = beginWrite(start, action.itemId, nextDoc);
      updateCommand(begun);
      try {
        await saveLedger(nextDoc);
        if (sessionRef.current !== session) return;
        updateCommand(finishWrite(begun, action.itemId));
      } catch (cause) {
        if (sessionRef.current !== session) return;
        updateCommand(failWrite(begun, action.itemId, failureMessage(cause)));
      } finally {
        afterSettle(session);
      }
      return;
    }

    // The lifecycle confirm action: the user confirmed the open confirmation
    // (the open/dismiss handshake is UI-only and runs synchronously on the
    // click); the operation itself queues behind any in-flight write and
    // takes the same preWrite snapshot.
    if (start.lifecycle?.kind !== "confirm" || start.lifecycle.action !== action.action) {
      afterSettle(session); // dismissed or superseded — the queued confirm is stale
      return;
    }
    if (action.action === "complete") {
      const now = new Date().toISOString(); // the same caller-injected-clock pattern
      const nextDoc = completeCampaign(start.doc, now);
      const begun = beginComplete(start, nextDoc);
      updateCommand(begun);
      try {
        await saveLedger(nextDoc);
        if (sessionRef.current !== session) return;
        updateCommand(finishComplete(begun));
        void refreshIndex(session);
      } catch (cause) {
        if (sessionRef.current !== session) return;
        updateCommand(failComplete(begun, failureMessage(cause)));
      } finally {
        afterSettle(session);
      }
      return;
    }
    const begun = beginDelete(start);
    updateCommand(begun);
    try {
      await deleteLedger(start.doc.lordSlug, start.doc.routeId);
      if (sessionRef.current !== session) return;
      updateCommand(null); // the file is gone — no document remains (the ledger view renders its empty state)
      void refreshIndex(session);
    } catch (cause) {
      if (sessionRef.current !== session) return;
      updateCommand(failDelete(begun, failureMessage(cause)));
    } finally {
      afterSettle(session);
    }
  }

  /** The single settle rule for every queued operation: stale sessions drop the whole queue, live ones drain the next action. */
  function afterSettle(session: number): void {
    if (sessionRef.current !== session) {
      queueRef.current = []; // actions queued for the old (lordSlug, routeId) are stale
      return;
    }
    void drainQueue();
  }

  /** Refreshes the in-memory index after a lifecycle write settles (the index is the single active-campaign fact). */
  async function refreshIndex(session: number): Promise<void> {
    try {
      const entries = await listLedgers();
      if (sessionRef.current !== session) return;
      setIndex({ kind: "ready", entries });
    } catch (cause) {
      if (sessionRef.current !== session) return;
      setIndex({ kind: "error", message: failureMessage(cause) });
    }
  }

  /** Queues one command action and starts the write loop only from an idle command state. */
  function queueAction(action: CommandAction): void {
    const current = commandRef.current;
    if (current === null) return; // no document loaded (loading / error / empty) — nothing to mutate
    queueRef.current.push(action);
    // The one-in-flight contract: while `preWrite` is set, the action waits
    // in the queue; it drains serially when the in-flight operation settles.
    if (current.preWrite === null) void drainQueue();
  }

  const onRetry = (): void => setAttempt((n) => n + 1);

  const onTick = (itemId: string, planned: boolean): void => queueAction({ kind: "tick", itemId, planned });

  const onStep = (itemId: string, step: ItemState["confirmedStep"]): void => queueAction({ kind: "step", itemId, step });

  /** Opens the mark-complete confirmation — a no-op on a double-click (the second click sees the open stage). */
  const onComplete = (): void => {
    const current = commandRef.current;
    if (current === null) return;
    if (current.lifecycle !== null && current.lifecycle.kind !== "error") return;
    updateCommand(requestComplete(current));
  };

  /** Opens the delete confirmation — a no-op on a double-click (the second click sees the open stage). */
  const onDelete = (): void => {
    const current = commandRef.current;
    if (current === null) return;
    if (current.lifecycle !== null && current.lifecycle.kind !== "error") return;
    updateCommand(requestDelete(current));
  };

  /** Confirms the open confirmation: the operation queues behind any in-flight write (no concurrent operations). */
  const onConfirmLifecycle = (): void => {
    const current = commandRef.current;
    if (current === null) return;
    if (current.lifecycle?.kind !== "confirm") return; // nothing pending to confirm (dismissed or superseded)
    queueRef.current.push({ kind: "confirm", action: current.lifecycle.action });
    if (current.preWrite === null) void drainQueue();
  };

  /** Dismisses the open confirmation — the campaign stays untouched (the pure transition's guard is pre-checked here). */
  const onDismissLifecycle = (): void => {
    const current = commandRef.current;
    if (current === null) return;
    if (current.lifecycle?.kind !== "confirm") return;
    updateCommand(dismissLifecycle(current));
  };

  /** The view's load lifecycle: `ready` carries the CURRENT document (the optimistic write while one is in flight). */
  const phase: LedgerPhase = phaseOf(stage, command);

  return {
    phase,
    statuses: command === null ? EMPTY_STATUSES : command.rows,
    index,
    onRetry,
    onTick,
    onStep,
    lifecycle: command === null ? null : command.lifecycle,
    onComplete,
    onDelete,
    onConfirmLifecycle,
    onDismissLifecycle,
  };
}
