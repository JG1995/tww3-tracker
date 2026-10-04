/**
 * Contract proof for the hash router (package `atlas-router-grammar`, commit 9).
 *
 * `parseHash` is the pure hash → route-model mapping under the DESIGN §2
 * grammar (the atlas IA): `#/` (or empty hash) → home; `#/<lord>` → the
 * default-route desk (routeId null — the first manifest route, resolved at
 * render); `#/<lord>/sources|notes` → the lord pages; `#/<lord>/<route-page>/
 * <route-id>[/<section-id>]` for the six route pages (desk/plan/armies/
 * settlements/workshop/ledger) — a section id is valid on `plan` only. EVERY
 * other shape maps to the explicit `not-found` route (DESIGN §2 rules 1–3,
 * §4 Breaking changes — the site never guesses, and nothing is mapped for
 * legacy): every old shape (`route/<id>`, section anchors under `route/`,
 * the 2-segment `#/lord/ledger`), a route-page without a route id (including
 * `#/<lord>/desk`), a section id under any non-`plan` route page, unknown
 * page ids, and traversal/punctuation garbage. The hook (`useHashRoute`) is
 * unchanged and covered indirectly by the browser boot in final validation;
 * node:test cannot host a DOM.
 *
 * Garbage categories exercised below: the old route/ledger shapes, unknown
 * extra depth, empty segments, punctuation, whitespace, single segment,
 * double slashes, traversal dots, and unknown-but-well-formed page ids.
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

test("a lord hash resolves to the default-route desk with no route id, with and without the leading hash", () => {
  assert.deepEqual(parseHash("#/als-rhyn-of-lorek"), {
    name: "desk",
    lordSlug: "als-rhyn-of-lorek",
    routeId: null,
  });
  assert.deepEqual(parseHash("/als-rhyn-of-lorek"), {
    name: "desk",
    lordSlug: "als-rhyn-of-lorek",
    routeId: null,
  });
});

test("the two lord pages resolve: sources and notes", () => {
  assert.deepEqual(parseHash("#/elspeth-von-draken/sources"), {
    name: "lord-page",
    lordSlug: "elspeth-von-draken",
    page: "sources",
  });
  assert.deepEqual(parseHash("#/elspeth-von-draken/notes"), {
    name: "lord-page",
    lordSlug: "elspeth-von-draken",
    page: "notes",
  });
});

test("each of the six route pages parses under `#/<lord>/<page>/<route-id>` — the ledger 3-segment shape unchanged", () => {
  for (const page of ["desk", "plan", "armies", "settlements", "workshop", "ledger"] as const) {
    assert.deepEqual(
      parseHash(`#/elspeth-von-draken/${page}/route-1`),
      { name: "route-page", lordSlug: "elspeth-von-draken", page, routeId: "route-1", sectionId: null },
      `the route-page member for ${page}`,
    );
  }
});

test("the ledger hash keeps parsing with and without the leading hash — the F5 flow's shape", () => {
  assert.deepEqual(parseHash("#/elspeth-von-draken/ledger/route-1"), {
    name: "route-page",
    lordSlug: "elspeth-von-draken",
    page: "ledger",
    routeId: "route-1",
    sectionId: null,
  });
  assert.deepEqual(parseHash("/elspeth-von-draken/ledger/route-1"), {
    name: "route-page",
    lordSlug: "elspeth-von-draken",
    page: "ledger",
    routeId: "route-1",
    sectionId: null,
  });
});

test("a section id is valid on plan only — the route-page member carries it", () => {
  assert.deepEqual(parseHash("#/elspeth-von-draken/plan/route-2/early-mid"), {
    name: "route-page",
    lordSlug: "elspeth-von-draken",
    page: "plan",
    routeId: "route-2",
    sectionId: "early-mid",
  });
});

test("every old shape and every non-grammar shape resolves to not-found", () => {
  const garbage: readonly string[] = [
    // every old route grammar — deliberately broken (DESIGN §4), nothing mapped for legacy
    "#/elspeth-von-draken/route/route-1",
    "#/elspeth-von-draken/route/route-1/opening",
    "#/lord/route",
    "#/lord/route/",
    "#/lord/route/route-1/opening/extra",
    // the 2-segment ledger shape — a route page needs a route id
    "#/lord/ledger",
    // route pages without a route id (rule 1 — including the desk)
    "#/lord/desk",
    "#/lord/plan",
    "#/lord/armies",
    "#/lord/settlements",
    "#/lord/workshop",
    // a section id under a non-plan route page (rule 4 — anchors are a plan concept)
    "#/lord/armies/route-1/anything",
    "#/lord/desk/route-1/opening",
    "#/lord/ledger/route-1/opening",
    // unknown-but-well-formed page ids
    "#/lord/whatever",
    "#/lord/overview/route-1",
    "#/lord/sources/route-1",
    // single segment without the `#/` prefix
    "#lord-slug",
    // double slashes and other empty segments
    "#//",
    "#/lord-slug//route/some-route",
    "#/lord-slug/route/some-route/",
    "#//route/some-route",
    // unknown extra depth
    "#/lord-slug/plan/route-1/opening/extra",
    // punctuation is not part of the slug grammar
    "#/lord-slug?x=1",
    "#/lord-slug/plan/some-route!",
    "#/!",
    "#/lord-slug/réoute/some-route",
    // whitespace is not part of the slug grammar
    "#/lord-slug ",
    "#/ lord-slug/plan/some-route",
    // traversal dots are rejected at the boundary
    "#/.",
    "#/..",
    "#/lord-slug/../plan/some-route",
  ];
  for (const hash of garbage) {
    assert.deepEqual(parseHash(hash), { name: "not-found" }, `hash ${JSON.stringify(hash)} must be not-found`);
  }
});
