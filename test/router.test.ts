/**
 * Contract proof for the hash router (package `app-shell`, commit 4).
 *
 * `parseHash` is the pure hash → route-model mapping: `#/` (or empty hash) →
 * home, `#/<lord-slug>` → lord, `#/<lord-slug>/route/<route-id>` → route,
 * `#/<lord-slug>/route/<route-id>/<section-id>` → route with a section
 * anchor, `#/<lord-slug>/ledger/<route-id>` → ledger; EVERY other shape is
 * garbage and maps to `not-found` (DESIGN §5 — the site never guesses). The
 * hook (`useHashRoute`) is covered indirectly by the browser boot in final
 * validation; node:test cannot host a DOM.
 *
 * Garbage categories exercised below: empty segments, unknown extra depth,
 * punctuation, whitespace, single segment, double slashes, traversal dots,
 * and the wrong shapes around a route or ledger hash.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { parseHash } from "../app/router.ts";

test("empty hash and the bare root hash resolve to home", () => {
  assert.deepEqual(parseHash(""), { name: "home" });
  assert.deepEqual(parseHash("#"), { name: "home" });
  assert.deepEqual(parseHash("/"), { name: "home" });
  assert.deepEqual(parseHash("#/"), { name: "home" });
});

test("a lord hash resolves to the lord route", () => {
  assert.deepEqual(parseHash("#/als-rhyn-of-lorek"), { name: "lord", lordSlug: "als-rhyn-of-lorek" });
});

test("a route hash resolves to the route without an anchor", () => {
  assert.deepEqual(parseHash("#/als-rhyn-of-lorek/route/dark-conduits"), {
    name: "route",
    lordSlug: "als-rhyn-of-lorek",
    routeId: "dark-conduits",
    sectionId: null,
  });
});

test("a route hash with a section id resolves to the route with an anchor", () => {
  assert.deepEqual(parseHash("#/als-rhyn-of-lorek/route/dark-conduits/early-mid"), {
    name: "route",
    lordSlug: "als-rhyn-of-lorek",
    routeId: "dark-conduits",
    sectionId: "early-mid",
  });
});

test("a ledger hash resolves to the ledger route with and without the leading hash", () => {
  assert.deepEqual(parseHash("#/elspeth-von-draken/ledger/route-1"), {
    name: "ledger",
    lordSlug: "elspeth-von-draken",
    routeId: "route-1",
  });
  assert.deepEqual(parseHash("/elspeth-von-draken/ledger/route-1"), {
    name: "ledger",
    lordSlug: "elspeth-von-draken",
    routeId: "route-1",
  });
});

test("the ledger shape stays not-found when its dedicated 3-segment grammar is violated", () => {
  const garbage: readonly string[] = [
    // 2 segments — the ledger route needs a route id
    "#/lord/ledger",
    // empty trailing segment
    "#/lord/ledger/",
    // 4 segments — the ledger has no section anchor (the section grammar belongs to routes)
    "#/lord/ledger/route-1/opening",
    // empty first segment
    "#//ledger/route-1",
    // traversal dots
    "#/lord/ledger/../x",
  ];
  for (const hash of garbage) {
    assert.deepEqual(parseHash(hash), { name: "not-found" }, `hash ${JSON.stringify(hash)} must be not-found`);
  }
});

test("every garbage shape resolves to not-found", () => {
  const garbage: readonly string[] = [
    // single segment without the `#/` prefix
    "#lord-slug",
    // double slashes and other empty segments
    "#//",
    "#/lord-slug//route/some-route",
    "#/lord-slug/route/some-route/",
    "#//route/some-route",
    // unknown extra depth
    "#/lord-slug/route/some-route/opening/extra",
    // wrong shapes around a route hash
    "#/lord-slug/route",
    "#/lord-slug/route/",
    "#/lord-slug/someth-ing/route-id",
    "#/lord-slug/route/some-route/opening/",
    // punctuation is not part of the slug grammar
    "#/lord-slug?x=1",
    "#/lord-slug/route/some-route!",
    "#/!",
    "#/lord-slug/réoute/some-route",
    // whitespace is not part of the slug grammar
    "#/lord-slug ",
    "#/ lord-slug/route/some-route",
    "#/lord-slug/route/some-route/",
    // traversal dots are rejected at the boundary
    "#/.",
    "#/..",
    "#/lord-slug/../route/some-route",
  ];
  for (const hash of garbage) {
    assert.deepEqual(parseHash(hash), { name: "not-found" }, `hash ${JSON.stringify(hash)} must be not-found`);
  }
});
