/**
 * Contract proof for the committed Elspeth skeleton (package `elspeth-skeleton`,
 * commit 5).
 *
 * Loads the real committed `content/` through the same loader the site boots
 * (`app/content/load.ts`) with a filesystem `ContentReader` — the same shape
 * the content-lint CLI provides. This proves the loader (not just the lint)
 * accepts the skeleton: one lord, three routes with typed claims, all seven
 * datasets present — `skills` as the atlas's ten typed entries (package
 * `skills-dataset`), `research` as the atlas's eight typed research entries — the
 * four shared groups (package `research-dataset`) plus the four per-route
 * overrides (package `research-overrides`) — `buildings` as the atlas's nine typed
 * settlement-role entries (package `buildings-dataset`), `mechanics` as the
 * atlas's five typed mechanic entries with the folded field tests, upgrades and
 * Amethyst paths (package `mechanics-dataset`), and `armies` as the atlas's
 * fifteen typed army templates with the `elspeth` column renamed to `legendary`
 * (package `armies-dataset`), and `vco` as the per-route objective-item map
 * carrying the stable ids the F5 ledger will tick (package `vco-dataset`) —
 * canonical `panelOrder` blocks with empty lists, and all seven declared gaps
 * per route. With `vco` migrated, no dataset remains in the typed empty `{}`
 * form: the empty-form loop is removed as a contract removal — each migrated
 * dataset's contract is owned by its own test below, as the established
 * pattern does each wave.
 *
 * Route I (package `route-1-content`) flips from the skeleton state to the
 * migrated state: `gaps` = exactly the two `Transition → route-<x>` titles
 * (the slot declarations the `routeBody` registry walk renders — a route with
 * emptied gaps silently loses its transition sections), its body carries the
 * eight registry sections in order, and its `panelOrder` lists the atlas's
 * Route I entries, every id resolving through the loader against the
 * committed datasets. Route II (package `route-2-content`) flips the same
 * way — eight registry sections, `gaps` = the two transition titles, and the
 * atlas's Route II `panelOrder` lists, including the two `route-2-*`
 * research override ids in the owning route's positions. Route III (package
 * `route-3-content`) flips the same way — its panelOrder carries the two
 * `route-3-*` override ids — and with it the migration reconciliation
 * completes: no committed dataset is the typed empty `{}` form anymore and no
 * route is a skeleton, so the assertions below carry the full DESIGN §7
 * counts (15 armies / 10 skills / 8 research entries / 9 building roles in
 * per-route subsets / 5 mechanics / vco 6-7-20) against the migrated tree
 * instead of any empty-form loop.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentTree } from "../app/content/load.ts";
import { getFlaggedEntries } from "../app/content/query.ts";
import type { ContentReader, ContentTree, Lord, TitleBody } from "../app/content/types.ts";

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

function committedElspeth(tree: ContentTree): Lord {
  const elspeth = tree.lords.find((lord) => lord.slug === "elspeth-von-draken");
  assert.ok(elspeth, "the committed tree retains Elspeth");
  return elspeth;
}

test("the committed tree retains Elspeth and her three routes in order", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));

  const elspeth = committedElspeth(tree);
  assert.equal(elspeth.slug, "elspeth-von-draken");
  assert.equal(elspeth.guide.faction, "Empire");
  assert.deepEqual(elspeth.guide.version, { patch: "9.0", vco: "2026.09.30.1", checked: "2026-09-30" });
  assert.equal(elspeth.routes.length, 3);
  assert.deepEqual(elspeth.routes.map((r) => r.id), ["route-1", "route-2", "route-3"]);
  assert.deepEqual(elspeth.routes.map((r) => r.number), ["I", "II", "III"]);
});

test("every route carries typed objective/reward claims and a null vcoTitle", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const routes = committedElspeth(tree).routes;

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
  const datasets = committedElspeth(tree).datasets;

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

test("all seven datasets are present in the committed tree in canonical order", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));

  const datasets = committedElspeth(tree).datasets;
  assert.equal(datasets.length, 7);
  assert.deepEqual(
    datasets.map((d) => d.name),
    ["armies", "skills", "research", "buildings", "mechanics", "vco", "sources"],
  );
});

test("the committed skills dataset is the atlas's ten typed item entries", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = committedElspeth(tree).datasets;

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

test("the committed research dataset is the atlas's eight typed item entries with the 15 folded techs", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = committedElspeth(tree).datasets;

  const sources = datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  const sourceIds = new Set(sources.value.map((s) => s.id));

  const research = datasets.find((d) => d.name === "research");
  assert.ok(research !== undefined && research.name === "research");
  const entries = research.value;
  assert.deepEqual(
    Object.keys(entries),
    [
      "opening",
      "firepower",
      "economy",
      "arcane",
      "route-2-opening",
      "route-2-economy",
      "route-3-opening",
      "route-3-arcane",
    ],
    "research holds the atlas's four group ids followed by the four per-route override ids",
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

  // The atlas's 15 named techs fold into the groups' steps as their titles:
  // names, prereq gates and why-notes live in the step fields (the fold), and
  // the atlas short-id indexes (`techs`/`legacyResearch`) are excluded. The
  // fold assertion below stays scoped to the four base groups' steps: the
  // override entries reuse the same tech atoms (the override block at the end
  // of this test asserts their reuse explicitly).
  const baseEntries = {
    opening: entries.opening,
    firepower: entries.firepower,
    economy: entries.economy,
    arcane: entries.arcane,
  };
  const techNames = [
    "Grain Silos",
    "State Troop Standards",
    "State-Issued Infantry Armour",
    "Mass-Produced Small Ammunition",
    "Ordnance Canisters",
    "Refined Schematics",
    "Continuous Production",
    "Assembly Line",
    "Imperial Architects",
    "Improved Cavalry Armour",
    "Endurance Training",
    "Improved Piston Technology",
    "Teachings of Teclis",
    "The Amethyst Armourer",
    "Seeker of Knowledge",
  ];
  const stepTitles = new Set(
    Object.values(baseEntries).flatMap((item) => item.steps.map((step) => step.title)),
  );
  for (const name of techNames) {
    assert.ok(stepTitles.has(name), `tech "${name}" appears as a step title in the research groups`);
  }
  assert.deepEqual(
    [...stepTitles].sort(),
    [...techNames].sort(),
    "the research step titles are exactly the 15 folded tech names — none dropped, none added",
  );

  // Spot-check the prereq/why fold verbatim on one step.
  const opening = entries.opening;
  assert.ok(opening.steps.length > 0);
  assert.deepEqual(
    [opening.steps[0].title, opening.steps[0].gate, opening.steps[0].note],
    [
      "Grain Silos",
      "Opening option",
      "Replenishment and growth: keep the first army moving while opening useful settlement tiers.",
    ],
    "the Grain Silos step carries the atlas's prereq gate and why-note verbatim",
  );

  // The atlas's four per-route `researchOverrides` land as distinct lord-wide
  // entries (DESIGN §4 per-route-variant rule), each keeping its atlas
  // label/title/sources verbatim. Their step atoms must be a reuse of the base
  // techs — a step the base groups cannot supply is evidence of drift.
  const overrides: Record<string, readonly [label: string, title: string]> = {
    "route-2-opening": ["Opening", "Prepare a long southern campaign"],
    "route-2-economy": ["Economy", "Support a durable southern sphere"],
    "route-3-opening": ["Opening", "A durable survey column"],
    "route-3-arcane": ["Special", "The expedition’s practical research"],
  };
  const baseAtoms = new Set(
    Object.values(baseEntries).flatMap((item) =>
      item.steps.map((step) => [step.title, step.note, step.gate ?? ""].join("\u0000")),
    ),
  );
  for (const [id, [label, title]] of Object.entries(overrides)) {
    const item = entries[id];
    assert.equal(item.label, label, `${id} keeps the atlas label verbatim`);
    assert.equal(item.title, title, `${id} keeps the atlas title verbatim`);
    assert.deepEqual(item.sources, ["tech", "school"], `${id} keeps the atlas source ids`);
    for (const step of item.steps) {
      assert.ok(
        baseAtoms.has([step.title, step.note, step.gate ?? ""].join("\u0000")),
        `override ${id} step "${step.title}" reuses a base group tech atom — no new tech content invented`,
      );
    }
  }
  assert.ok(
    entries["route-3-arcane"].steps.some((step) => step.gate === "Check the active technology tree"),
    "route-3-arcane carries the atlas hedge gate 'Check the active technology tree' verbatim",
  );
});

test("the committed buildings dataset is the atlas's nine typed settlement-role entries", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = committedElspeth(tree).datasets;

  const sources = datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  const sourceIds = new Set(sources.value.map((s) => s.id));

  const buildings = datasets.find((d) => d.name === "buildings");
  assert.ok(buildings !== undefined && buildings.name === "buildings");
  const entries = buildings.value;
  assert.deepEqual(
    Object.keys(entries),
    ["income", "resource", "recovery", "frontier", "temporary", "nuln", "military", "charter", "survey"],
    "buildings holds exactly the atlas's nine settlement-role ids in atlas order",
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

  // The nine ids are exactly the union of the three routes' atlas
  // `panelOrder.builds` lists: the dataset holds all nine regardless of per-route
  // listing, and the per-route six-entry subsets fill in the route packages.
  const routeI = ["nuln", "military", "income", "recovery", "frontier", "temporary"];
  const routeII = ["nuln", "charter", "resource", "income", "frontier", "temporary"];
  const routeIII = ["nuln", "survey", "military", "income", "recovery", "temporary"];
  assert.deepEqual(
    [...new Set([...routeI, ...routeII, ...routeIII])].sort(),
    Object.keys(entries).sort(),
    "the nine building ids are exactly the union of the three routes' atlas panel builds lists",
  );

  // The atlas keeps `label` and `title` distinct per role and the item card
  // renders both; spot-check the mapping verbatim on one entry.
  assert.deepEqual(
    [entries.income.label, entries.income.title, entries.income.intro],
    ["Income", "Safe income town", "Interior settlement with no unique recruiting or strategic job."],
    "the income entry carries the atlas label/title/intro verbatim",
  );
});

test("the committed mechanics dataset is the atlas's five typed item entries with the folded field tests", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = committedElspeth(tree).datasets;

  const sources = datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  const sourceIds = new Set(sources.value.map((s) => s.id));

  const mechanics = datasets.find((d) => d.name === "mechanics");
  assert.ok(mechanics !== undefined && mechanics.name === "mechanics");
  const entries = mechanics.value;
  assert.deepEqual(
    Object.keys(entries),
    ["testing", "armoury", "gardens", "theodore", "authority"],
    "mechanics holds exactly the atlas's five entry ids in atlas order",
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

  // The atlas's four field-test records fold into the `testing` entry's steps as
  // their gated requirements: each test name, every req display text and each
  // reward appears exactly once there (never dropped, never duplicated). Only the
  // display texts fold in — the atlas short-id keys (`handguns3`, `academy`, …)
  // are tick-tracker linkage and stay excluded from committed content.
  const fieldTests = [
    {
      name: "I · Gunnery Training Grounds",
      reqs: ["Maintain 3 Handgunners", "Construct Firearms Academy", "Perform 3 Gunnery School upgrades"],
      reward: "Tier-two ordinary upgrades; Experimental Explosive and recruitment support.",
    },
    {
      name: "II · Engineering Workshops",
      reqs: ["1,500 kills with Gunnery School units", "Construct Foundry", "Perform 5 Gunnery School upgrades"],
      reward: "Amethyst Ironsides and Outriders; Bjuna Bombard; Enhanced Scope.",
    },
    {
      name: "III · Laboratorium Magi",
      reqs: ["1,000 kills with Amethyst units", "Maintain 3 Amethyst Ironsides", "Use Bjuna Bombard"],
      reward: "Amethyst Helstorm, Spirit Barrage, tier-three ordinary upgrades and Ominous Powder.",
    },
    {
      name: "IV · Academy of Excellence",
      reqs: ["Construct the Nuln Gunnery School landmark", "Perform 7 Gunnery School upgrades", "Use Spirit Barrage"],
      reward: "Amethyst Land Ship and The Purple Eclipse; additional upkeep support.",
    },
  ];
  const countOccurrences = (haystack: string, needle: string): number => haystack.split(needle).length - 1;
  const testingText = entries.testing.steps
    .flatMap((step) => [step.title, step.note, step.short ?? "", step.gate ?? ""])
    .join("\n");
  for (const fieldTest of fieldTests) {
    assert.equal(
      countOccurrences(testingText, fieldTest.name),
      1,
      `field test "${fieldTest.name}" appears exactly once in the testing entry`,
    );
    for (const req of fieldTest.reqs) {
      assert.equal(
        countOccurrences(testingText, req),
        1,
        `field test "${fieldTest.name}" req "${req}" appears exactly once in the testing entry`,
      );
    }
    assert.equal(
      countOccurrences(testingText, fieldTest.reward),
      1,
      `field test "${fieldTest.name}" reward appears exactly once in the testing entry`,
    );
  }
  assert.ok(!testingText.includes("handguns3"), "no field-test short-id tick keys in the testing entry");

  // Spot-check the fold homes: each test record sits in the step the atlas
  // cross-references it through, so a count-only check cannot miss a record
  // folded into the wrong step.
  const foldHomes = [
    "Keep three ordinary Handgunners",
    "Foundry + gunnery kills + upgrades",
    "Field three Amethyst Ironsides",
    "T5 Nuln landmark + Spirit Barrage",
  ];
  for (const [index, fieldTest] of fieldTests.entries()) {
    const home = entries.testing.steps.find((step) => step.title === foldHomes[index]);
    assert.ok(home !== undefined, `field test "${fieldTest.name}" has a fold home step`);
    assert.ok(
      home!.note.includes(fieldTest.name) && home!.note.includes(fieldTest.reward),
      `field test "${fieldTest.name}" folds into the "${foldHomes[index]}" step note`,
    );
  }

  // The 8 upgrades fold into the `armoury` entry as steps appended after its six
  // base steps, in atlas order; each keeps its summary and tier text verbatim.
  const upgrades: Array<[name: string, summary: string, tiers: string[]]> = [
    [
      "Gunnery Infantry",
      "The first priority in every route: it benefits several units in your regular and elite gunline.",
      ["More missile damage", "More ammunition and reload support", "Explosive ammunition"],
    ],
    [
      "Mortars",
      "Invest while two Mortars remain useful. The public reference table mixes a Mortar label with Helblaster effects, so these are purchase priorities, not claimed exact modifier names. Check each live tooltip.",
      ["First tier: an opening field-test investment", "Second tier: only for a persistent mortar battery", "Final tier: usually behind your later artillery"],
    ],
    [
      "Great Cannons",
      "A useful anti-large and counter-battery family, especially in the Badlands. Exact current tier modifiers were not confirmed in the available table; the sequence below is purchasing advice. Use the live panel for effects.",
      ["First tier: support the cannon you actually field", "Second tier: after the main infantry upgrade", "Final tier: when sustained cannon use justifies it"],
    ],
    [
      "Helstorm Rocket Battery",
      "Bring forward once tier-four recruitment or a useful starting battery makes it relevant. Includes the Amethyst counterpart.",
      ["Additional projectile", "Further projectile", "Further projectile and ammunition"],
    ],
    [
      "Land Ships",
      "Route II/III signature investment only once a ship is actually fielded. Not an opening requirement.",
      ["Spearports", "Missile-block support", "Land Mine"],
    ],
    [
      "Steam Tanks",
      "Late expedition support, not a reason to delay victory. Do not confuse the Lord’s mount with buying a whole extra unit.",
      ["More Power!", "Explosive ammunition", "Emergency Repairs"],
    ],
    [
      "Gunnery Cavalry",
      "Optional mobile-shooter branch. Black Rose melee knights are not gunnery cavalry and do not justify this purchase.",
      ["Mobility and Strider", "Restock!", "Disorientating attacks"],
    ],
    [
      "Helblaster Volley Guns",
      "A situational replacement for a matching damage job, not automatically superior to the planned cannon or rockets.",
      ["Better mobility", "Suppression", "More piercing"],
    ],
  ];
  assert.deepEqual(
    entries.armoury.steps.map((step) => step.title),
    [
      "Permanent family upgrades first",
      "Three Amethyst Ironsides for the test",
      "Add the route’s signature artillery",
      "Protect the expensive purchases",
      "Five per army; eight for Elspeth later",
      "Buy ability charges with a purpose",
      ...upgrades.map(([name]) => name),
    ],
    "armoury steps are the six base steps followed by the eight upgrades in atlas order",
  );
  for (const [name, summary, tiers] of upgrades) {
    const step = entries.armoury.steps.find((s) => s.title === name);
    assert.ok(step !== undefined, `upgrade "${name}" is an armoury step`);
    assert.ok(step!.note.includes(summary), `upgrade "${name}" note carries its atlas summary verbatim`);
    for (const tier of tiers) {
      assert.ok(step!.note.includes(tier), `upgrade "${name}" note carries tier "${tier}" verbatim`);
    }
  }

  // The 4 Amethyst paths fold into the `armoury` entry's details (their home here
  // while the referencing armies still land later); each keeps its name, path
  // chain and note text from the atlas.
  const amethystPaths: Array<[name: string, chain: string, note: string]> = [
    [
      "Ironsides",
      "Frontline Training → Ballistics Plating → Debilitating Shots → Iron Resolve",
      "With three in the army, their survivability and Soulblight shots can be worthwhile. Do not mistake the special Armoury improvements for the ordinary Gunnery Infantry upgrade track.",
    ],
    [
      "Helstorm",
      "Improved Trajectories → Extended Training Drills → Greater Infusions → Last Rites",
      "For the main battery, buy enough range/ammunition and damage support to make repeated use worthwhile. Preserve a large-target answer elsewhere in the stack.",
    ],
    [
      "Land Ship",
      "Sails of Shyish → Catacomb Cannon → Amethyst Admiral → Cremation Engines",
      "The late signature for the southern or survey column. Expensive optional bound spells should not displace basic line/recovery upgrades.",
    ],
    [
      "Outriders",
      "Cycle Charge Drills → Guerrilla Warfare → Dreadknight → Flared Muzzles",
      "Optional mobile theme: swap one Black Rose slot for an Amethyst Outrider only when the extra missile-cavalry management is enjoyable. It is not required in the default low-micro templates.",
    ],
  ];
  const armouryDetails = entries.armoury.details;
  assert.ok(armouryDetails !== undefined, "armoury carries its details rows");
  assert.deepEqual(
    armouryDetails.map(([title]) => title),
    ["Why no Amethyst doomstack", "The optional eighth-slot allowance", ...amethystPaths.map(([name]) => name)],
    "armoury details are the two base rows plus the four Amethyst paths in atlas order",
  );
  for (const [name, chain, note] of amethystPaths) {
    const pair: TitleBody | undefined = armouryDetails.find((entry) => entry[0] === name);
    assert.ok(pair !== undefined, `amethyst path "${name}" has an armoury detail row`);
    assert.ok(pair[1].includes(chain), `amethyst path "${name}" keeps its atlas path chain verbatim`);
    assert.ok(pair[1].includes(note), `amethyst path "${name}" keeps its atlas note verbatim`);
  }
});

test("the committed armies dataset is the atlas's fifteen typed army templates with the legendary column", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = committedElspeth(tree).datasets;

  const sources = datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  const sourceIds = new Set(sources.value.map((s) => s.id));

  const armies = datasets.find((d) => d.name === "armies");
  assert.ok(armies !== undefined && armies.name === "armies");
  const routes = armies.value;
  assert.deepEqual(
    Object.keys(routes),
    ["route-1", "route-2", "route-3"],
    "armies holds exactly the three guide.json route ids, in guide order",
  );
  const entryIds = ["early", "mid", "late", "amethyst", "home"];
  const states = new Set(["confirmed", "historical", "inferred", "verify-in-campaign"]);
  for (const [routeId, map] of Object.entries(routes)) {
    assert.deepEqual(
      Object.keys(map),
      entryIds,
      `${routeId} holds exactly the atlas's five army ids in atlas order`,
    );
    for (const [id, army] of Object.entries(map)) {
      for (const key of ["label", "name"] as const) {
        assert.equal(typeof army[key], "string", `${routeId}.${id}.${key} is a string`);
        assert.ok(army[key].length > 0, `${routeId}.${id}.${key} is non-empty`);
      }
      for (const column of ["units", "legendary", "generic"] as const) {
        assert.ok(Array.isArray(army[column]), `${routeId}.${id}.${column} is a column list`);
        for (const row of army[column]) {
          assert.equal(typeof row.n, "number", `${routeId}.${id}.${column} row n is numeric`);
          for (const key of ["name", "role", "kind"] as const) {
            assert.equal(typeof row[key], "string", `${routeId}.${id}.${column} row ${key} is a string`);
            assert.ok(row[key] !== "", `${routeId}.${id}.${column} row ${key} is non-empty`);
          }
        }
      }
      assert.ok(
        !("elspeth" in army),
        `${routeId}.${id} has no "elspeth" key — the atlas column committed as "legendary"`,
      );
      for (const key of ["notes", "plan"] as const) {
        assert.ok(Array.isArray(army[key]), `${routeId}.${id}.${key} is a list of [title, body] pairs`);
        for (const pair of army[key]) {
          assert.ok(Array.isArray(pair) && pair.length === 2, `${routeId}.${id}.${key} entries are [title, body] pairs`);
          assert.equal(typeof pair[0], "string");
          assert.equal(typeof pair[1], "string");
        }
      }
      assert.equal(typeof army.size, "number", `${routeId}.${id}.size is numeric`);
      assert.ok(Array.isArray(army.sources) && army.sources.length > 0, `${routeId}.${id} lists its sources`);
      for (const src of army.sources) {
        assert.equal(typeof src, "string", `${routeId}.${id} source ids are strings`);
        assert.ok(sourceIds.has(src), `${routeId}.${id} source id "${src}" resolves against data/sources.json`);
      }
      if (army.state !== undefined) {
        assert.ok(states.has(army.state), `${routeId}.${id} state is one of the four confidence states`);
        assert.ok(Array.isArray(army.src) && army.src.length > 0, `${routeId}.${id} state/src travel together`);
        for (const src of army.src ?? []) {
          assert.ok(sourceIds.has(src), `${routeId}.${id} src id "${src}" resolves against data/sources.json`);
        }
      }
    }
  }

  // The atlas's `elspeth` column is committed under the F2 `legendary` name —
  // the same unit-row shape with its contents verbatim. Spot-check the
  // rename on route-1 early and one long unit list on route-2 late (long
  // lists are untruncated: "if a list is long, the list is long").
  const routeOneEarly = routes["route-1"].early;
  assert.deepEqual(
    routeOneEarly.legendary.map((row) => row.name),
    ["Elspeth von Draken", "Engineer"],
    "route-1 early's legendary column carries the atlas's Elspeth column verbatim",
  );
  assert.deepEqual(
    routes["route-2"].late.units.map((row) => row.name),
    [
      "Halberdiers",
      "Greatswords",
      "Nuln Ironsides",
      "Hochland Long Rifles",
      "Helstorm Rocket Battery",
      "Great Cannons",
      "Land Ship",
      "Knights of the Black Rose",
    ],
    "route-2 late keeps its full eight-row unit list, untruncated",
  );
  assert.equal(
    routes["route-2"].late.units[0].n,
    4,
    "route-2 late unit rows carry the atlas's numeric n counts verbatim",
  );
  assert.equal(routes["route-3"].home.size, 12, "the home guard army carries its atlas size verbatim");
});

test("the committed vco dataset is the three-route objective items with the stable F5 id surface", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = committedElspeth(tree).datasets;

  const sources = datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  const sourceIds = new Set(sources.value.map((s) => s.id));

  const vco = datasets.find((d) => d.name === "vco");
  assert.ok(vco !== undefined && vco.name === "vco");
  const routes = vco.value;
  assert.deepEqual(
    Object.keys(routes),
    ["route-1", "route-2", "route-3"],
    "vco holds exactly the three guide.json route ids, in guide order",
  );

  // The per-route order and the exact id set are the F5 tick surface — never
  // renumbered — so the test pins them exactly (DESIGN §4 stable ids).
  const expectedIds: Record<string, string[]> = {
    "route-1": ["sylvania", "deceivers", "drycha", "festus", "khazrak", "battles-35"],
    "route-2": [
      "eastern-border-princes",
      "western-border-princes",
      "tilea",
      "pirates-current",
      "the-blighted-marshes",
      "estalia",
      "irrana-mountains",
    ],
    "route-3": [
      "doz-karaz",
      "barag-dawazbag",
      "varenka-hills",
      "iron-rock",
      "valays-sorrow",
      "crooked-fang-fort",
      "karak-azgal",
      "deff-gorge",
      "morgheim",
      "floating-village",
      "sunken-khernarch",
      "agrul-migdhal",
      "gor-gazan",
      "stormhenge",
      "galbaraz",
      "gronti-mingol",
      "dragonhorn-mines",
      "ekrund",
      "stonemine-tower",
      "bitterstone-mine",
    ],
  };
  const states = new Set(["confirmed", "historical", "inferred", "verify-in-campaign"]);
  for (const [routeId, items] of Object.entries(routes)) {
    const expected = expectedIds[routeId];
    assert.ok(expected !== undefined, `${routeId} is a planned route row`);
    assert.ok(Array.isArray(items), `${routeId} is an ordered objective-item list`);
    assert.equal(items.length, expected.length, `${routeId} carries its DESIGN objective-item count`);
    assert.deepEqual(
      items.map((item) => item.id),
      expected,
      `${routeId} item ids are the exact stable F5 surface, in atlas order`,
    );
    const seen = new Set<string>();
    for (const item of items) {
      assert.ok(!seen.has(item.id), `${routeId} item ids are unique within the route`);
      seen.add(item.id);
      assert.match(
        item.id,
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        `${routeId} item id "${item.id}" is lowercase kebab-case`,
      );
      assert.ok(item.text.length > 0, `${routeId} item "${item.id}" text is non-empty`);
      assert.ok(states.has(item.state), `${routeId} item "${item.id}" state is one of the four confidence states`);
      assert.ok(Array.isArray(item.src) && item.src.length > 0, `${routeId} item "${item.id}" carries its src`);
      for (const src of item.src ?? []) {
        assert.ok(
          sourceIds.has(src),
          `${routeId} item "${item.id}" src id "${src}" resolves against data/sources.json`,
        );
      }
    }
  }
});

test("every route's panelOrder has the five canonical keys; each route's atlas lists resolve through the loader", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const elspeth = committedElspeth(tree);
  const routes = elspeth.routes;
  const datasets = elspeth.datasets;

  const canonicalGroups = ["armies", "skills", "research", "buildings", "mechanics"];
  const routeOne = routes.find((r) => r.id === "route-1");
  assert.ok(routeOne !== undefined, "route-1 loads");
  const po = routeOne.panelOrder;
  assert.ok(po !== undefined, "route-1 declares a panelOrder block");
  assert.deepEqual(
    po,
    {
      armies: ["early", "mid", "late", "amethyst", "home"],
      skills: ["elspeth", "master", "engineer", "theodore", "priest", "captain", "death", "light", "life", "hunter"],
      research: ["opening", "firepower", "economy", "arcane"],
      buildings: ["nuln", "military", "income", "recovery", "frontier", "temporary"],
      mechanics: ["testing", "armoury", "gardens", "theodore", "authority"],
    },
    "Route I panelOrder holds exactly the atlas's Route I lists under the five canonical group keys",
  );
  assert.equal(po.armies.length, 5, "Route I lists five armies");
  assert.equal(po.skills.length, 10, "Route I lists ten skills");
  assert.equal(po.research.length, 4, "Route I lists four research groups");
  assert.equal(po.buildings.length, 6, "Route I lists six settlement roles");
  assert.equal(po.mechanics.length, 5, "Route I lists five mechanics");

  // every listed id resolves through the loader against the committed
  // datasets: armies ids in the route's own armies map, item ids in the
  // lord-wide item maps (the lint-enforced resolution contract).
  const armies = datasets.find((d) => d.name === "armies")?.value;
  assert.ok(armies !== undefined, "the armies dataset is present");
  for (const id of po.armies) {
    assert.ok(
      armies["route-1"] !== undefined && id in armies["route-1"],
      `armies panelOrder id "${id}" resolves in route-1's armies map`,
    );
  }
  for (const group of ["skills", "research", "buildings", "mechanics"] as const) {
    const map = datasets.find((d) => d.name === group)?.value;
    assert.ok(map !== undefined, `the ${group} dataset is present`);
    for (const id of po[group]) {
      assert.ok(id in map, `${group} panelOrder id "${id}" resolves in the lord's "${group}" dataset`);
    }
  }

  // Route II's atlas lists resolve through the loader too, including the two
  // `route-2-*` research override ids (package `research-overrides`) in the
  // owning route's positions: the base `opening`/`economy` groups are Route
  // I's and stay unlisted here.
  const routeTwo = routes.find((r) => r.id === "route-2");
  assert.ok(routeTwo !== undefined, "route-2 loads");
  const po2 = routeTwo.panelOrder;
  assert.ok(po2 !== undefined, "route-2 declares a panelOrder block");
  assert.deepEqual(
    po2,
    {
      armies: ["early", "mid", "late", "amethyst", "home"],
      skills: ["elspeth", "master", "engineer", "theodore", "priest", "captain", "death", "light", "life", "hunter"],
      research: ["route-2-opening", "firepower", "route-2-economy", "arcane"],
      buildings: ["nuln", "charter", "resource", "income", "frontier", "temporary"],
      mechanics: ["testing", "armoury", "gardens", "theodore", "authority"],
    },
    "Route II panelOrder holds exactly the atlas's Route II lists under the five canonical group keys",
  );
  assert.equal(po2.armies.length, 5, "Route II lists five armies");
  assert.equal(po2.skills.length, 10, "Route II lists ten skills");
  assert.equal(po2.research.length, 4, "Route II lists four research entries");
  assert.equal(po2.buildings.length, 6, "Route II lists six settlement roles");
  assert.equal(po2.mechanics.length, 5, "Route II lists five mechanics");

  // every Route II listed id also resolves through the loader against the
  // committed datasets: armies ids in the route's own armies map, item ids
  // (override ids included) in the lord-wide item datasets.
  for (const id of po2.armies) {
    assert.ok(
      armies["route-2"] !== undefined && id in armies["route-2"],
      `armies panelOrder id "${id}" resolves in route-2's armies map`,
    );
  }
  for (const group of ["skills", "research", "buildings", "mechanics"] as const) {
    const map = datasets.find((d) => d.name === group)?.value;
    assert.ok(map !== undefined, `the ${group} dataset is present`);
    for (const id of po2[group]) {
      assert.ok(id in map, `${group} panelOrder id "${id}" resolves in the lord's "${group}" dataset`);
    }
  }

  // Route III's atlas lists resolve through the loader too, including the two
  // `route-3-*` research override ids (package `research-overrides`) in the
  // owning route's positions: the base `opening`/`arcane` groups are Route I's
  // and stay unlisted here.
  const routeThree = routes.find((r) => r.id === "route-3");
  assert.ok(routeThree !== undefined, "route-3 loads");
  const po3 = routeThree.panelOrder;
  assert.ok(po3 !== undefined, "route-3 declares a panelOrder block");
  assert.deepEqual(
    Object.keys(po3).sort(),
    [...canonicalGroups].sort(),
    "route-3 panelOrder keys are exactly the five canonical group keys",
  );
  assert.deepEqual(
    po3,
    {
      armies: ["early", "mid", "late", "amethyst", "home"],
      skills: ["elspeth", "master", "engineer", "theodore", "priest", "captain", "death", "light", "life", "hunter"],
      research: ["route-3-opening", "firepower", "economy", "route-3-arcane"],
      buildings: ["nuln", "survey", "military", "income", "recovery", "temporary"],
      mechanics: ["testing", "armoury", "gardens", "theodore", "authority"],
    },
    "Route III panelOrder holds exactly the atlas's Route III lists under the five canonical group keys",
  );
  assert.equal(po3.armies.length, 5, "Route III lists five armies");
  assert.equal(po3.skills.length, 10, "Route III lists ten skills");
  assert.equal(po3.research.length, 4, "Route III lists four research entries");
  assert.equal(po3.buildings.length, 6, "Route III lists six settlement roles");
  assert.equal(po3.mechanics.length, 5, "Route III lists five mechanics");

  // every Route III listed id also resolves through the loader against the
  // committed datasets: armies ids in the route's own armies map, item ids
  // (override ids included) in the lord-wide item datasets.
  for (const id of po3.armies) {
    assert.ok(
      armies["route-3"] !== undefined && id in armies["route-3"],
      `armies panelOrder id "${id}" resolves in route-3's armies map`,
    );
  }
  for (const group of ["skills", "research", "buildings", "mechanics"] as const) {
    const map = datasets.find((d) => d.name === group)?.value;
    assert.ok(map !== undefined, `the ${group} dataset is present`);
    for (const id of po3[group]) {
      assert.ok(id in map, `${group} panelOrder id "${id}" resolves in the lord's "${group}" dataset`);
    }
  }
});

test("every route keeps exactly its two transition gaps and its eight registry sections in order", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const routes = committedElspeth(tree).routes;

  const routeOne = routes.find((r) => r.id === "route-1");
  assert.ok(routeOne !== undefined, "route-1 loads");
  assert.deepEqual(
    routeOne.gaps,
    ["Transition → route-2", "Transition → route-3"],
    "Route I keeps exactly the two transition titles in gaps — the slot declarations the routeBody registry walk renders",
  );
  assert.deepEqual(
    routeOne.sections.map((s) => s.title),
    [
      "Opening",
      "Early → Mid",
      "Mid → Late",
      "Victory push",
      "Territory policy",
      "Diplomacy",
      "Transition → route-2",
      "Transition → route-3",
    ],
    "Route I body is exactly the eight registry sections, the four required first in registry order",
  );

  // Route II flips exactly as Route I did: the two transition titles stay in
  // gaps as the slot declarations the `routeBody` registry walk renders, and
  // the eight registry sections render in order.
  const routeTwo = routes.find((r) => r.id === "route-2");
  assert.ok(routeTwo !== undefined, "route-2 loads");
  assert.deepEqual(
    routeTwo.gaps,
    ["Transition → route-1", "Transition → route-3"],
    "Route II keeps exactly the two transition titles in gaps — the slot declarations the routeBody registry walk renders",
  );
  assert.deepEqual(
    routeTwo.sections.map((s) => s.title),
    [
      "Opening",
      "Early → Mid",
      "Mid → Late",
      "Victory push",
      "Territory policy",
      "Diplomacy",
      "Transition → route-1",
      "Transition → route-3",
    ],
    "Route II body is exactly the eight registry sections, the four required first in registry order",
  );

  // Route III flips exactly as Routes I and II did: the two transition titles
  // stay in gaps as the slot declarations the `routeBody` registry walk
  // renders, and the eight registry sections render in order.
  const routeThree = routes.find((r) => r.id === "route-3");
  assert.ok(routeThree !== undefined, "route-3 loads");
  assert.deepEqual(
    routeThree.gaps,
    ["Transition → route-1", "Transition → route-2"],
    "Route III keeps exactly the two transition titles in gaps — the slot declarations the routeBody registry walk renders",
  );
  assert.deepEqual(
    routeThree.sections.map((s) => s.title),
    [
      "Opening",
      "Early → Mid",
      "Mid → Late",
      "Victory push",
      "Territory policy",
      "Diplomacy",
      "Transition → route-1",
      "Transition → route-2",
    ],
    "Route III body is exactly the eight registry sections, the four required first in registry order",
  );

  // The end-of-migration reconciliation: every committed route now carries the
  // full eight-section migrated body — no skeleton assertion survives, and the
  // residual empty-form loop is gone (the per-route migrated assertions above
  // and the dataset counts below fully replace it).
  const allTitles = routes.flatMap((r) => r.sections.map((s) => s.title));
  assert.equal(allTitles.length, 24, "all three committed routes carry their eight sections each");
  assert.ok(
    routes.every((r) => r.gaps.length === 2 && r.gaps.every((g) => g.startsWith("Transition → "))),
    "every committed route declares exactly the two transition gaps and no content gap",
  );
});

test("getFlaggedEntries returns the committed 36-entry flagged set: family counts, sections, and flat dedupe", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const elspeth = committedElspeth(tree);
  const flagged = getFlaggedEntries(elspeth);

  assert.equal(flagged.length, 36);
  assert.ok(flagged.every((e) => e.state === "verify-in-campaign"), "only the flagged state ever appears");
  assert.ok(flagged.every((e) => e.text.length > 0 && e.sources.length > 0), "every entry carries text and resolved sources");

  const byKind: Record<string, number> = { identity: 0, callout: 0, dataset: 0, vco: 0 };
  for (const entry of flagged) byKind[entry.kind] += 1;
  assert.deepEqual(byKind, { identity: 6, callout: 5, dataset: 22, vco: 3 });

  // routes contribute their flagged sets in manifest order (each route's
  // entries form one contiguous block), matching the committed counts
  const perRoute: Record<string, Record<string, number>> = {};
  for (const entry of flagged) {
    const kinds = (perRoute[entry.routeId] ??= {});
    kinds[entry.kind] = (kinds[entry.kind] ?? 0) + 1;
  }
  assert.deepEqual(perRoute, {
    "route-1": { identity: 2, dataset: 15, vco: 3 },
    "route-2": { identity: 2, callout: 3, dataset: 3 },
    "route-3": { identity: 2, callout: 2, dataset: 4 },
  });

  // Each callout entry carries its committed section attribution (the Commit 1
  // fields), in body/section order, and the attributed section is one the route
  // actually renders.
  const callouts = flagged.filter((e) => e.kind === "callout");
  assert.equal(callouts.length, 5);
  assert.deepEqual(
    callouts.map((e) => [e.routeId, e.sectionId, e.sectionTitle]),
    [
      ["route-2", "mid-late", "Mid → Late"],
      ["route-2", "victory-push", "Victory push"],
      ["route-2", "diplomacy", "Diplomacy"],
      ["route-3", "mid-late", "Mid → Late"],
      ["route-3", "diplomacy", "Diplomacy"],
    ],
  );
  for (const callout of callouts) {
    const route = elspeth.routes.find((r) => r.id === callout.routeId);
    assert.ok(route !== undefined, `route ${callout.routeId} loads`);
    const section = route.sections.find((s) => s.id === callout.sectionId);
    assert.ok(section !== undefined, `section ${callout.sectionId} loads`);
    assert.equal(section.title, callout.sectionTitle);
  }

  // Dataset family: 19 flat lord-wide entries in the four item groups plus 3
  // per-route armies entries; flat entry ids are unique across all routes'
  // panelOrder lists; armies entries stay distinct per (route, entry).
  const datasetEntries = flagged.filter((e) => e.kind === "dataset");
  assert.equal(datasetEntries.length, 22);
  const byGroup: Record<string, number> = {};
  for (const entry of datasetEntries) byGroup[entry.group] = (byGroup[entry.group] ?? 0) + 1;
  assert.deepEqual(byGroup, { armies: 3, skills: 6, research: 4, buildings: 4, mechanics: 5 });
  const flatKeys = datasetEntries.filter((e) => e.group !== "armies").map((e) => `${e.group}:${e.entryId}`);
  assert.equal(
    new Set(flatKeys).size,
    flatKeys.length,
    "no flat dataset entry is repeated across the routes that list it",
  );
  assert.deepEqual(
    datasetEntries.filter((e) => e.group === "skills").map((e) => `${e.routeId}/${e.entryId}`),
    [
      "route-1/elspeth",
      "route-1/master",
      "route-1/theodore",
      "route-1/death",
      "route-1/light",
      "route-1/life",
    ],
    "the six verify-in-campaign skills each appear once although every route's panelOrder lists them",
  );
  assert.deepEqual(
    datasetEntries.filter((e) => e.group === "armies").map((e) => `${e.routeId}/${e.entryId}`),
    ["route-1/mid", "route-2/mid", "route-3/mid"],
    "armies entries are distinct per (route, entry)",
  );

  // Stable order: routes in manifest order; within a route identity, then
  // callouts, then dataset entries in PANEL_GROUPS order, then VCO in list order.
  assert.deepEqual([...new Set(flagged.map((e) => e.routeId))], ["route-1", "route-2", "route-3"]);
  assert.deepEqual(
    datasetEntries.filter((e) => e.routeId === "route-1").map((e) => e.group),
    [
      "armies",
      "skills",
      "skills",
      "skills",
      "skills",
      "skills",
      "skills",
      "research",
      "buildings",
      "buildings",
      "mechanics",
      "mechanics",
      "mechanics",
      "mechanics",
      "mechanics",
    ],
    "dataset entries run in PANEL_GROUPS order",
  );
  assert.deepEqual(
    flagged.filter((e) => e.kind === "vco").map((e) => [e.routeId, e.itemId]),
    [
      ["route-1", "deceivers"],
      ["route-1", "drycha"],
      ["route-1", "khazrak"],
    ],
    "VCO entries run in list order",
  );
});

test("the committed guide names the crest path and the atlas environment topline verbatim", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const elspeth = committedElspeth(tree);

  assert.equal(elspeth.guide.crest, "crest.svg", "the guide names the crest file inside the lord directory");
  assert.equal(
    elspeth.guide.environment,
    "Normal / Normal · Smart Autoresolve · VCO · Immortal Empires",
    "the guide carries the atlas environment topline verbatim",
  );
  assert.ok(elspeth.crestSvg !== undefined, "the crest file loads through the boot pass");
  assert.ok(elspeth.crestSvg!.includes("<svg"), "the loaded crest carries an <svg start tag");
  assert.ok(elspeth.crestSvg!.includes("<path d=\"M25 18h70v49c0 23-35 40-35 40S25 90 25 67Z M32 25h56v40c0 17-28 33-28 33S32 82 32 65Z\"></path>"), "the loaded crest keeps the atlas path 1 verbatim");
  assert.ok(elspeth.crestSvg!.includes("<path d=\"M60 31v48M48 78h24M57 31l20-10M76 20c11 1 20 9 22 20-7-7-16-8-23-5 M39 68l41-23M34 66l8 8M77 42l7 8\"></path>"), "the loaded crest keeps the atlas path 2 verbatim");
  assert.ok(elspeth.crestSvg!.includes("<path d=\"M60 42c-10-11-20 1-9 9-13 2-10 18 3 14-3 13 13 16 15 3 11 8 21-4 9-11 12-10 0-20-8-10-2-13-15-14-10-5 M56 54l4 8 4-8M13 24l-5-6m9 21-9-2m100-11 5-7m-10 21 10-3M13 74l8 2m79 0 8-3\"></path>"), "the loaded crest keeps the atlas path 3 verbatim");
  assert.ok(elspeth.crestSvg!.includes("<circle cx=\"60\" cy=\"55\" r=\"10\"></circle>"), "the loaded crest keeps the atlas circle verbatim");
});

test("the committed crest file exists with the atlas crest symbol verbatim in an <svg> root", async () => {
  const crestFile = await fsReader(CONTENT).readFile("elspeth-von-draken/crest.svg");
  assert.ok(crestFile.includes("<svg"), "the crest file carries an <svg start tag");
  assert.ok(crestFile.includes("<path d=\"M25 18h70v49c0 23-35 40-35 40S25 90 25 67Z M32 25h56v40c0 17-28 33-28 33S32 82 32 65Z\"></path>"), "the crest file keeps the atlas path 1 verbatim");
  assert.ok(crestFile.includes("<path d=\"M60 31v48M48 78h24M57 31l20-10M76 20c11 1 20 9 22 20-7-7-16-8-23-5 M39 68l41-23M34 66l8 8M77 42l7 8\"></path>"), "the crest file keeps the atlas path 2 verbatim");
  assert.ok(crestFile.includes("<path d=\"M60 42c-10-11-20 1-9 9-13 2-10 18 3 14-3 13 13 16 15 3 11 8 21-4 9-11 12-10 0-20-8-10-2-13-15-14-10-5 M56 54l4 8 4-8M13 24l-5-6m9 21-9-2m100-11 5-7m-10 21 10-3M13 74l8 2m79 0 8-3\"></path>"), "the crest file keeps the atlas path 3 verbatim");
  assert.ok(crestFile.includes("<circle cx=\"60\" cy=\"55\" r=\"10\"></circle>"), "the crest file keeps the atlas circle verbatim");
});

test("each route carries exactly its five atlas phases in order, title and note verbatim", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const routes = committedElspeth(tree).routes;

  const expected: Record<string, Array<[string, string]>> = {
    "route-1": [
      ["Give Nuln breathing room", "Win the starting war without creating three additional fronts."],
      ["Break Sylvania’s momentum", "Make the eastern campaign an elimination, not repeated duels with Vlad."],
      ["Link the relief operations", "Choose the next enemy by danger and travel, not the guide’s printed order."],
      ["Close the ledger deliberately", "Every expensive purchase should remove the actual last obstacle."],
      ["Claim the victory, then defend the city", "Separate campaign success from its thematic epilogue."],
    ],
    "route-2": [
      ["Make the departure affordable", "Build a homeland that survives Elspeth’s absence."],
      ["Establish the charter’s first foothold", "Choose a connected southern theatre instead of opening both extremes at once."],
      ["Turn a foothold into a functioning region", "Pay for a local replacement pipeline when the journey from Nuln becomes the bottleneck."],
      ["Secure the outer provinces", "Finish Estalia, the mountains and Pirate’s Current without losing earlier gains."],
      ["Make the charter permanent—or go home", "Conclude the control objective without inventing a final ritual."],
    ],
    "route-3": [
      ["Prepare the expedition, not an entire Empire reconquest", "Secure the departure base and the research company."],
      ["Open the northern search corridor", "Start close enough that one setback does not require sailing around the world."],
      ["Keep the field laboratory moving", "Combine cooperation with a selective campaign against hostile candidate owners."],
      ["Follow the evidence to the final search result", "Stop searching when the mission says the search is finished."],
      ["Bring the research home", "Preserve the expedition and choose what its footholds become."],
    ],
  };
  for (const route of routes) {
    const pairs = expected[route.id];
    assert.ok(pairs !== undefined, `${route.id} is a planned route row`);
    assert.equal(route.phases?.length, 5, `${route.id} carries exactly five phases`);
    assert.deepEqual(
      route.phases!.map((p) => [p.title, p.note]),
      pairs,
      `${route.id} phases are the atlas's five title/note pairs in order`,
    );
  }
});
