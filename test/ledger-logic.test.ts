/**
 * Contract proof for the pure campaign model (package `ledger-logic-model`,
 * commit 2).
 *
 * Everything here is pure node:test over direct function calls — no I/O, no
 * DOM, no wall clock: `createCampaign` pins both timestamps from the
 * injected `now`, every transition stamps `updatedAt` from its injected
 * `now` (same clock pattern — no Date.now default), and every transition
 * returns a whole new document without mutating its input (the repo's
 * immutable-tree convention). Ids come in two flavors: small synthetic sets,
 * plus one committed Elspeth VCO id
 * (`content/elspeth-von-draken/data/vco.json` — route-1's "sylvania") to
 * prove the reconciliation against the real committed shape.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  completeCampaign,
  createCampaign,
  isValidCampaignDoc,
  isValidConfirmedStep,
  itemsFor,
  setConfirmedStep,
  tickItem,
} from "../app/ledger/logic.ts";
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

test("createCampaign starts an active campaign with every committed id fresh and both timestamps from the injected clock", () => {
  const now = "2026-10-03T12:00:00.000Z";
  const committed = ["alpha", "beta", "gamma", "delta", "sylvania"];
  const doc = createCampaign("elspeth-von-draken", "route-1", committed, now);

  assert.equal(doc.lordSlug, "elspeth-von-draken");
  assert.equal(doc.routeId, "route-1");
  assert.equal(doc.status, "active");
  assert.equal(doc.createdAt, now);
  assert.equal(doc.updatedAt, now);
  assert.deepEqual(doc.items, {
    alpha: item(false, 0),
    beta: item(false, 0),
    gamma: item(false, 0),
    delta: item(false, 0),
    sylvania: item(false, 0),
  });
});

test("tickItem flips only that item's planned — its confirmedStep and every other item byte-identical", () => {
  const items = { alpha: item(true, 0), beta: item(false, 2), gamma: item(true, 4) };
  const doc = makeDoc(items);
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times

  const next = tickItem(doc, "beta", true, now);

  assert.deepEqual(next.items.beta, item(true, 2)); // planned flipped, step preserved (track separation)
  assert.deepEqual(next.items.alpha, doc.items.alpha); // every other item byte-identical
  assert.deepEqual(next.items.gamma, doc.items.gamma);
  assert.equal(next.lordSlug, doc.lordSlug);
  assert.equal(next.routeId, doc.routeId);
  assert.equal(next.status, doc.status);
  assert.equal(next.createdAt, doc.createdAt); // createdAt never moves
  assert.equal(next.updatedAt, now); // the mutation stamps the injected clock
  assert.deepEqual(doc.items, items); // the input document was never mutated
});

test("setConfirmedStep moves forward and back within 0–4 and leaves planned untouched", () => {
  const items = { alpha: item(true, 1), beta: item(false, 4) };
  const doc = makeDoc(items);
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times

  const forward = setConfirmedStep(doc, "alpha", 3, now);
  assert.deepEqual(forward.items.alpha, item(true, 3)); // step forward, planned untouched

  const back = setConfirmedStep(doc, "beta", 1, now);
  assert.deepEqual(back.items.beta, item(false, 1)); // step back, planned untouched

  assert.deepEqual(forward.items.beta, doc.items.beta); // other rows byte-identical
  assert.deepEqual(back.items.alpha, doc.items.alpha);
  assert.equal(forward.createdAt, doc.createdAt); // createdAt never moves
  assert.equal(forward.lordSlug, doc.lordSlug); // every other field byte-identical
  assert.equal(forward.routeId, doc.routeId);
  assert.equal(forward.status, doc.status);
  assert.equal(forward.updatedAt, now); // the mutation stamps the injected clock
  assert.equal(back.updatedAt, now); // a step back is a new write, so it stamps the clock too
  assert.deepEqual(doc.items, items); // the input document was never mutated
});

test("a stored-missing item starts from the fresh default on tick or step, so the row's change persists", () => {
  const doc = makeDoc({ alpha: item(true, 0) }); // beta and gamma are not stored
  const now = "2026-10-04T09:30:00.000Z";

  const ticked = tickItem(doc, "beta", true, now);
  assert.deepEqual(ticked.items.beta, item(true, 0)); // committed-order fresh row, now ticked
  assert.deepEqual(itemsFor(ticked, ["alpha", "beta"]).at(1)?.state, item(true, 0));

  const stepped = setConfirmedStep(doc, "gamma", 2, now);
  assert.deepEqual(stepped.items.gamma, item(false, 2)); // fresh row, stepped, still unplanned

  assert.deepEqual(doc.items, { alpha: item(true, 0) }); // inputs never mutated
});

test("completeCampaign archives a campaign — ONLY status and updatedAt change, every other field byte-identical", () => {
  const items = { alpha: item(true, 2), beta: item(false, 4) };
  const doc = makeDoc(items); // a well-formed ACTIVE campaign with real committed states
  const now = "2026-10-04T09:30:00.000Z"; // a clock distinct from the document's stamped times

  const next = completeCampaign(doc, now);

  assert.equal(next.status, "completed"); // the single lifecycle flip
  assert.equal(next.updatedAt, now); // completion is a write, so it stamps the injected clock
  assert.equal(next.createdAt, doc.createdAt); // createdAt never moves
  assert.equal(next.lordSlug, doc.lordSlug); // every other field byte-identical
  assert.equal(next.routeId, doc.routeId);
  assert.deepEqual(next.items, items); // every item byte-identical — the archived record is the whole document
  assert.deepEqual(doc.items, items); // the input document was never mutated
  assert.equal(doc.status, "active"); // the input stays the live campaign
  assert.equal(isValidCampaignDoc(next), true); // a completed document is a valid campaign document
});

test("itemsFor returns rows in committed order, defaults a stored-missing id fresh, and drops a content-removed id", () => {
  const doc = makeDoc({
    alpha: item(true, 2), // stored: ticked and at step 2
    sylvania: item(false, 4), // stored: a committed Elspeth id (route-1's first item)
    zeta: item(false, 3), // stored but removed from content
  });

  // gamma and beta are missing from the stored document (committed order in).
  const committed = ["sylvania", "gamma", "alpha", "beta"];
  const rows = itemsFor(doc, committed);

  assert.deepEqual(rows.map((r) => r.id), ["sylvania", "gamma", "alpha", "beta"]);
  assert.deepEqual(rows[0].state, item(false, 4)); // stored state, first committed position
  assert.deepEqual(rows[1].state, item(false, 0)); // stored-missing id defaults fresh
  assert.deepEqual(rows[2].state, item(true, 2)); // stored state, later committed position
  assert.deepEqual(rows[3].state, item(false, 0)); // stored-missing id defaults fresh
  assert.ok(!rows.some((r) => r.id === "zeta")); // content-removed id absent
});

test("the step bounds guard rejects advancing past 4 and retreating below 0 (and non-integers)", () => {
  assert.equal(isValidConfirmedStep(0), true);
  assert.equal(isValidConfirmedStep(4), true);
  assert.equal(isValidConfirmedStep(5), false); // advancing past the fixed 4-step track
  assert.equal(isValidConfirmedStep(-1), false); // retreating below the track start
  assert.equal(isValidConfirmedStep(2.5), false); // not a member of the closed union

  // The closed 0–4 union makes an out-of-bounds step a compile-time error at
  // the call site; the directive below is the tsc pin for that contract (the
  // clock argument stays valid — only the step is out of the union).
  const doc = makeDoc();
  // @ts-expect-error — step 5 is not assignable to the closed 0|1|2|3|4 union
  void setConfirmedStep(doc, "alpha", 5, "2026-10-03T00:00:00.000Z");
});

test("isValidCampaignDoc accepts a well-formed document and rejects hand-edited shapes", () => {
  const good = makeDoc({ alpha: item(true, 2) });
  assert.equal(isValidCampaignDoc(good), true);

  assert.equal(isValidCampaignDoc(null), false);
  assert.equal(isValidCampaignDoc("ledger"), false);
  assert.equal(isValidCampaignDoc({ ...good, status: "corrupt" }), false); // corrupt is an index status, never a document status
  assert.equal(isValidCampaignDoc({ ...good, status: "archived" }), false);
  assert.equal(isValidCampaignDoc({ ...good, updatedAt: undefined }), false); // missing timestamp
  assert.equal(isValidCampaignDoc({ ...good, items: [] }), false); // items is a record, not a list
  assert.equal(isValidCampaignDoc({ ...good, items: { alpha: null } }), false);
  assert.equal(isValidCampaignDoc({ ...good, items: { alpha: { planned: "yes", confirmedStep: 2 } } }), false);
  assert.equal(isValidCampaignDoc({ ...good, items: { alpha: { planned: false, confirmedStep: 9 } } }), false);
  assert.equal(isValidCampaignDoc({ ...good, items: { alpha: { planned: false, confirmedStep: 2.5 } } }), false);
});
