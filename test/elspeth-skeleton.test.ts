/**
 * Contract proof for the committed Elspeth skeleton (package `elspeth-skeleton`,
 * commit 5).
 *
 * Loads the real committed `content/` through the same loader the site boots
 * (`app/content/load.ts`) with a filesystem `ContentReader` — the same shape
 * the content-lint CLI provides. This proves the loader (not just the lint)
 * accepts the skeleton: one lord, three routes with typed claims, all seven
 * datasets present — `skills` as the atlas's ten typed entries (package
 * `skills-dataset`), the other five still the typed empty objects — canonical
 * `panelOrder` blocks with empty lists, and all seven declared gaps per route.
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

test("all seven datasets are present and the five non-source datasets are still the typed empty objects", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));

  const datasets = tree.lords[0].datasets;
  assert.equal(datasets.length, 7);
  assert.deepEqual(
    datasets.map((d) => d.name),
    ["armies", "skills", "research", "buildings", "mechanics", "vco", "sources"],
  );
  for (const dataset of datasets) {
    if (dataset.name === "sources") continue; // proven above
    if (dataset.name === "skills") continue; // migrated — asserted by the next test
    assert.deepEqual(dataset.value, {}, `${dataset.name} is the typed empty object`);
  }
});

test("the committed skills dataset is the atlas's ten typed item entries", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = tree.lords[0].datasets;

  const sources = datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  const sourceIds = new Set(sources.value.map((s) => s.id));

  const skills = datasets.find((d) => d.name === "skills");
  assert.ok(skills !== undefined && skills.name === "skills");
  const entries = skills.value;
  assert.deepEqual(
    Object.keys(entries),
    ["elspeth", "master", "engineer", "theodore", "captain", "priest", "light", "life", "death", "hunter"],
    "skills holds exactly the atlas's ten entry ids in atlas order",
  );
  const states = new Set(["confirmed", "historical", "inferred", "verify-in-campaign"]);
  for (const [id, item] of Object.entries(entries)) {
    for (const key of ["label", "title", "intro"] as const) {
      assert.equal(typeof item[key], "string", `${id}.${key} is a string`);
      assert.ok(item[key].length > 0, `${id}.${key} is non-empty`);
    }
    assert.ok(Array.isArray(item.steps) && item.steps.length > 0, `${id} carries at least one step`);
    for (const step of item.steps) {
      assert.equal(typeof step.title, "string", `${id} step title is a string`);
      assert.equal(typeof step.note, "string", `${id} step note is a string`);
      assert.ok(step.title !== "" && step.note !== "", `${id} step title and note are non-empty`);
      if (step.gate !== undefined) assert.ok(step.gate !== "", `${id} step gate is non-empty when present`);
      if (step.short !== undefined) assert.ok(step.short !== "", `${id} step short is non-empty when present`);
    }
    if (item.details !== undefined) {
      assert.ok(Array.isArray(item.details), `${id} details is a list of [title, body] pairs`);
      for (const pair of item.details) {
        assert.ok(Array.isArray(pair) && pair.length === 2, `${id} details entries are [title, body] pairs`);
        assert.equal(typeof pair[0], "string");
        assert.equal(typeof pair[1], "string");
      }
    }
    assert.ok(Array.isArray(item.sources) && item.sources.length > 0, `${id} lists its sources`);
    for (const src of item.sources) {
      assert.equal(typeof src, "string", `${id} source ids are strings`);
      assert.ok(sourceIds.has(src), `${id} source id "${src}" resolves against data/sources.json`);
    }
    if (item.state !== undefined) {
      assert.ok(states.has(item.state), `${id} state is one of the four confidence states`);
      assert.ok(Array.isArray(item.src) && item.src.length > 0, `${id} state/src travel together`);
      for (const src of item.src ?? []) {
        assert.ok(sourceIds.has(src), `${id} src id "${src}" resolves against data/sources.json`);
      }
    }
  }
});

test("every route's panelOrder has exactly the five canonical group keys with empty lists", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const routes = tree.lords[0].routes;

  const canonicalGroups = ["armies", "skills", "research", "buildings", "mechanics"];
  for (const route of routes) {
    assert.ok(route.panelOrder, `${route.id} declares a panelOrder block`);
    assert.deepEqual(
      Object.keys(route.panelOrder).sort(),
      [...canonicalGroups].sort(),
      `${route.id} panelOrder keys are exactly the five canonical group keys`,
    );
    for (const group of canonicalGroups) {
      assert.deepEqual(route.panelOrder[group], [], `${route.id} panelOrder.${group} is an empty list`);
    }
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
