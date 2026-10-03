/**
 * Contract proof for the committed Elspeth skeleton (package `elspeth-skeleton`,
 * commit 5).
 *
 * Loads the real committed `content/` through the same loader the site boots
 * (`app/content/load.ts`) with a filesystem `ContentReader` — the same shape
 * the content-lint CLI provides. This proves the loader (not just the lint)
 * accepts the skeleton: one lord, three routes with typed claims, all seven
 * datasets present — `skills` as the atlas's ten typed entries (package
 * `skills-dataset`), `research` as the atlas's four typed research groups (package
 * `research-dataset`), `buildings` as the atlas's nine typed settlement-role
 * entries (package `buildings-dataset`), `mechanics` as the atlas's five
 * typed mechanic entries with the folded field tests, upgrades and Amethyst
 * paths (package `mechanics-dataset`), and `armies` as the atlas's fifteen
 * typed army templates with the `elspeth` column renamed to `legendary`
 * (package `armies-dataset`), the remaining one (`vco`) still the typed empty
 * object — canonical `panelOrder` blocks with empty lists, and all seven
 * declared gaps per route.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentTree } from "../app/content/load.ts";
import type { ContentReader, TitleBody } from "../app/content/types.ts";

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

test("all seven datasets are present and the one non-source dataset is still the typed empty object", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));

  const datasets = tree.lords[0].datasets;
  assert.equal(datasets.length, 7);
  assert.deepEqual(
    datasets.map((d) => d.name),
    ["armies", "skills", "research", "buildings", "mechanics", "vco", "sources"],
  );
  for (const dataset of datasets) {
    if (dataset.name === "sources") continue; // proven above
    if (dataset.name === "skills") continue; // migrated — asserted by its own test below
    if (dataset.name === "research") continue; // migrated — asserted by its own test below
    if (dataset.name === "buildings") continue; // migrated — asserted by its own test below
    if (dataset.name === "mechanics") continue; // migrated — asserted by its own test below
    if (dataset.name === "armies") continue; // migrated — asserted by its own test below
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

test("the committed research dataset is the atlas's four typed item entries with the 15 folded techs", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = tree.lords[0].datasets;

  const sources = datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  const sourceIds = new Set(sources.value.map((s) => s.id));

  const research = datasets.find((d) => d.name === "research");
  assert.ok(research !== undefined && research.name === "research");
  const entries = research.value;
  assert.deepEqual(
    Object.keys(entries),
    ["opening", "firepower", "economy", "arcane"],
    "research holds exactly the atlas's four group ids in atlas order",
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
  // the atlas short-id indexes (`techs`/`legacyResearch`) are excluded.
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
    Object.values(entries).flatMap((item) => item.steps.map((step) => step.title)),
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
});

test("the committed buildings dataset is the atlas's nine typed settlement-role entries", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const datasets = tree.lords[0].datasets;

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
  const datasets = tree.lords[0].datasets;

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
  const datasets = tree.lords[0].datasets;

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
