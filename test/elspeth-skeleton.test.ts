/**
 * Contract proof for the committed Elspeth skeleton (package `elspeth-skeleton`,
 * commit 5).
 *
 * Loads the real committed `content/` through the same loader the site boots
 * (`app/content/load.ts`) with a filesystem `ContentReader` — the same shape
 * the content-lint CLI provides. This proves the loader (not just the lint)
 * accepts the skeleton: one lord, three routes with typed claims, all seven
 * datasets present and empty-valid, and all seven declared gaps per route.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentTree } from "../app/content/load.ts";
import type { ContentReader } from "../app/content/types.ts";

/** The committed content root, resolved from this test file's own location. */
const CONTENT = fileURLToPath(new URL("../content", import.meta.url));

/** A filesystem `ContentReader` over the committed content root — the CLI's shape. */
function fsReader(root: string): ContentReader {
  return {
    async readFile(path: string): Promise<string> {
      return await readFile(join(root, path), "utf8");
    },
    async listFiles(): Promise<string[]> {
      const files: string[] = [];
      const walk = async (dir: string): Promise<void> => {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const inner = join(dir, entry.name);
          if (entry.isDirectory()) await walk(inner);
          else files.push(relative(root, inner).replaceAll("\\", "/"));
        }
      };
      await walk(root);
      return files.sort();
    },
  };
}

test("the committed tree loads as one Elspeth lord with the three routes in order", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));

  assert.equal(tree.lords.length, 1);
  const elspeth = tree.lords[0];
  assert.equal(elspeth.slug, "elspeth-von-draken");
  assert.equal(elspeth.guide.faction, "Empire");
  assert.deepEqual(elspeth.guide.version, { patch: "9.0", vco: "2026.09.30.1", checked: "2026-09-30" });
  assert.equal(elspeth.routes.length, 3);
  assert.deepEqual(elspeth.routes.map((r) => r.id), ["route-1", "route-2", "route-3"]);
  assert.deepEqual(elspeth.routes.map((r) => r.number), ["I", "II", "III"]);
});

test("every route carries typed objective/reward claims and a null vcoTitle", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const routes = tree.lords[0].routes;

  for (const route of routes) {
    assert.equal(route.vcoTitle, null, `${route.id} official title is unresearched`);
    for (const claim of [route.objective, route.reward]) {
      assert.equal(claim.state, "verify-in-campaign", `${route.id} ${claim.text.slice(0, 32)}…`);
      assert.deepEqual(claim.src, ["vco-guide"]);
      assert.ok(claim.text.length > 0);
    }
  }
});

test("the sources dataset round-trips the extract's 35 sources including vco-guide and ca", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = tree.lords[0].datasets;

  const sources = datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  assert.equal(sources.value.length, 35);
  const ids = sources.value.map((s) => s.id);
  assert.ok(ids.includes("vco-guide"), "vco-guide source present");
  assert.ok(ids.includes("ca"), "ca source present");
  for (const s of sources.value) {
    for (const key of ["id", "title", "url", "note"] as const) {
      assert.equal(typeof s[key], "string", `${s.id} has a ${key}`);
    }
  }
});

test("all seven datasets are present and the six non-source datasets are empty stubs", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));

  const datasets = tree.lords[0].datasets;
  assert.equal(datasets.length, 7);
  assert.deepEqual(
    datasets.map((d) => d.name),
    ["armies", "skills", "research", "buildings", "mechanics", "vco", "sources"],
  );
  for (const dataset of datasets) {
    if (dataset.name === "sources") continue; // proven above
    assert.deepEqual(dataset.value, [], `${dataset.name} is an empty stub`);
  }
});

test("every route declares all seven registry sections as gaps", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const routes = tree.lords[0].routes;

  const expected = ["Opening", "Early → Mid", "Mid → Late", "Victory push", "Territory policy", "Diplomacy"];
  for (const route of routes) {
    assert.equal(route.gaps.length, 7, `${route.id} records exactly seven declared gaps`);
    for (const title of expected) {
      assert.ok(route.gaps.includes(title), `${route.id} declares "${title}"`);
    }
    assert.ok(route.gaps.some((g) => g.startsWith("Transition → ")), `${route.id} declares its transition section`);
    assert.equal(route.sections.length, 0, `${route.id} bodies are empty in the skeleton`);
  }
});
