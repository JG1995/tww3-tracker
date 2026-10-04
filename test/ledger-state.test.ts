/**
 * Contract proof for the optimistic command state (package
 * `ledger-command-state`, commit 5).
 *
 * Pure node:test over direct function calls — no I/O, no DOM: the three
 * transitions (`beginWrite`/`finishWrite`/`failWrite`) apply an
 * ALREADY-COMPUTED next document from `logic.ts` (never re-derived here),
 * mark the row `saving` / settle it `idle`, and on failure restore the
 * byte-identical pre-write document — the DESIGN's "row rolls back to its
 * pre-write state" is the presentation of that whole-document restore,
 * so every OTHER row keeps its committed value because it is the same
 * document. Inputs are never mutated (the repo's immutable-tree
 * convention), and the one-in-flight protocol is enforced loudly rather
 * than building queueing machinery.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  beginWrite,
  createLedgerCommandState,
  failWrite,
  finishWrite,
  rowStatus,
} from "../app/ledger/state.ts";
import { setConfirmedStep, tickItem } from "../app/ledger/logic.ts";
import type { CampaignDoc, ItemState } from "../app/ledger/types.ts";

/** One item-state literal, so the expected shapes read without ceremony. */
function item(planned: boolean, confirmedStep: 0 | 1 | 2 | 3 | 4): ItemState {
  return { planned, confirmedStep };
}

/** A small well-formed campaign document (fresh timestamps, empty by default). */
function makeDoc(items: Readonly<Record<string, ItemState>> = {}): CampaignDoc {
  return {
    lordSlug: "test-lord",
    routeId: "route-1",
    status: "active",
    createdAt: "2026-10-03T00:00:00.000Z",
    updatedAt: "2026-10-03T00:00:00.000Z",
    items,
  };
}

test("beginWrite applies the optimistic next document and marks the row saving while other rows keep their committed values", () => {
  const doc = makeDoc({ alpha: item(true, 0), beta: item(false, 2), gamma: item(true, 4) });
  const state = createLedgerCommandState(doc);
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times
  const nextDoc = tickItem(doc, "beta", true, now);

  const next = beginWrite(state, "beta", nextDoc);

  assert.equal(next.doc, nextDoc); // the exact already-computed next document is applied as-is
  assert.deepEqual(next.doc.items.alpha, doc.items.alpha); // every other row byte-identical
  assert.deepEqual(next.doc.items.gamma, doc.items.gamma);
  assert.equal(next.doc.lordSlug, doc.lordSlug);
  assert.equal(next.doc.createdAt, doc.createdAt); // createdAt never moves
  assert.equal(next.doc.updatedAt, now); // the mutation stamps the injected clock
  assert.deepEqual(rowStatus(next, "beta"), { phase: "saving", message: null }); // target row in flight
  assert.deepEqual(rowStatus(next, "alpha"), { phase: "idle", message: null }); // untouched rows read idle
  assert.deepEqual(rowStatus(next, "gamma"), { phase: "idle", message: null });
});

test("finishWrite settles the in-flight row back to idle and keeps the optimistic document", () => {
  const doc = makeDoc({ alpha: item(true, 0), beta: item(false, 2) });
  const state = createLedgerCommandState(doc);
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times
  const begun = beginWrite(state, "beta", tickItem(doc, "beta", true, now));

  const next = finishWrite(begun, "beta");

  assert.deepEqual(rowStatus(next, "beta"), { phase: "idle", message: null });
  assert.deepEqual(next.doc, tickItem(doc, "beta", true, now)); // the confirmed write stays
  assert.equal(next.preWrite, null); // no rollback snapshot pending
  assert.deepEqual(next.doc.items.alpha, doc.items.alpha); // other rows untouched
});

test("failWrite restores the byte-identical pre-write document and marks the row error with the message", () => {
  const doc = makeDoc({ alpha: item(true, 0), beta: item(false, 2) });
  const state = createLedgerCommandState(doc);
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times
  const begun = beginWrite(state, "beta", setConfirmedStep(doc, "beta", 3, now));
  const message = "the server rejected the request (status 500)";

  const next = failWrite(begun, "beta", message);

  assert.equal(next.doc, doc); // the EXACT pre-write document object is restored
  assert.deepEqual(next.doc, doc); // byte-identical whole-document rollback
  assert.deepEqual(next.doc.items.beta, item(false, 2)); // the failed row is back to its committed value
  assert.deepEqual(next.doc.items.alpha, item(true, 0)); // every other row byte-identical
  assert.deepEqual(rowStatus(next, "beta"), { phase: "error", message }); // the row shows the message
  assert.equal(next.preWrite, null); // the rollback snapshot is consumed
});

test("a failing write rolls back only its own row and leaves a different row's earlier committed tick untouched", () => {
  const doc = makeDoc({ alpha: item(false, 0), beta: item(false, 0) });
  let state = createLedgerCommandState(doc);
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times

  // First mutation: tick alpha — committed successfully (the serialized UI's
  // earlier write; its state is now durable).
  state = finishWrite(beginWrite(state, "alpha", tickItem(state.doc, "alpha", true, now)), "alpha");
  assert.deepEqual(state.doc.items.alpha, item(true, 0));

  // Second mutation: tick beta — the write fails.
  const begun = beginWrite(state, "beta", tickItem(state.doc, "beta", true, now));
  const next = failWrite(begun, "beta", "could not reach the local server");

  assert.deepEqual(next.doc.items.alpha, item(true, 0)); // alpha's committed tick untouched
  assert.deepEqual(next.doc.items.beta, item(false, 0)); // only beta rolls back
  assert.deepEqual(rowStatus(next, "alpha"), { phase: "idle", message: null });
  assert.deepEqual(rowStatus(next, "beta"), { phase: "error", message: "could not reach the local server" });
});

test("the transitions never mutate their input state or document", () => {
  const doc = makeDoc({ alpha: item(true, 0), beta: item(false, 2) });
  const state = createLedgerCommandState(doc);
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times
  const docBefore = structuredClone(doc);
  const rowsBefore = structuredClone(state.rows);

  const begun = beginWrite(state, "beta", tickItem(doc, "beta", true, now));
  const finished = finishWrite(begun, "beta");
  const failed = failWrite(beginWrite(state, "gamma", setConfirmedStep(doc, "gamma", 1, now)), "gamma", "boom");

  assert.deepEqual(state.doc, docBefore); // the original state's document untouched
  assert.deepEqual(state.rows, rowsBefore); // the original status record untouched
  assert.deepEqual(state.doc, doc); // the original document untouched
  assert.equal(begun.preWrite, doc); // the snapshot is the shared original, never copied or rewritten
  assert.deepEqual(finished.doc, tickItem(doc, "beta", true, now));
  assert.deepEqual(failed.doc, doc); // the failed write restored the original byte-identical
});

test("beginWrite refuses a second write while another row is in flight", () => {
  const doc = makeDoc({ alpha: item(false, 0), beta: item(false, 0) });
  const state = createLedgerCommandState(doc);
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times
  const begun = beginWrite(state, "alpha", tickItem(doc, "alpha", true, now));

  assert.throws(() => beginWrite(begun, "beta", tickItem(doc, "beta", true, now)), /in flight/);
});

test("finishWrite and failWrite refuse without an in-flight write to confirm or roll back", () => {
  const state = createLedgerCommandState(makeDoc({ alpha: item(false, 0) }));

  assert.throws(() => finishWrite(state, "alpha"), /in flight/);
  assert.throws(() => failWrite(state, "alpha", "boom"), /in flight/);
});
