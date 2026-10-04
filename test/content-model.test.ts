/**
 * Contract proof for the content model (package `content-model`, commit 2).
 *
 * The filesystem reader mirrors what the content-lint CLI will provide later
 * (commit 3); the loader and the lint only see the injected `ContentReader`
 * interface, the same one the browser `fetch` reader satisfies. Broken
 * variants are always made on a COPY of the committed fixtures in a temp
 * directory — the committed fixtures are never mutated.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, writeFile, cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { ContentBootError, createFetchReader, loadContentTree } from "../app/content/load.ts";
import { lintContent, type ContentViolation } from "../app/content/lint.ts";
import { getFlaggedEntries, getLord, getRoute, getSection, getSource, listLords } from "../app/content/query.ts";
import type { ContentReader, Section } from "../app/content/types.ts";

const FIXTURES = fileURLToPath(new URL("fixtures/content", import.meta.url));

/** A filesystem `ContentReader` — the shape the content-lint CLI will use. */
function fsReader(root: string): ContentReader {
  return {
    async readFile(path: string): Promise<string> {
      const full = join(root, path);
      if (full !== root && !full.startsWith(`${root}${join("") ? "/" : ""}`)) {
        throw new Error(`path escapes the content root: ${path}`);
      }
      return await readFile(full, "utf8");
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

/** Copies the committed fixtures into a fresh temp dir, runs `mutate`, returns the dir. */
async function inBrokenCopy(mutate: (root: string) => Promise<void>, run: (root: string) => Promise<void>): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "content-model-"));
  await cp(FIXTURES, dir, { recursive: true });
  try {
    await mutate(dir);
    await run(dir);
    return dir;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Lints a broken copy of the fixtures and returns its violations. */
async function lintBroken(mutate: (root: string) => Promise<void>): Promise<ContentViolation[]> {
  let violations: ContentViolation[] = [];
  await inBrokenCopy(mutate, async (root) => {
    violations = await lintContent(fsReader(root));
  });
  return violations;
}

async function rewrite(root: string, rel: string, data: string): Promise<void> {
  await writeFile(join(root, rel), data);
}

// ─── 1. The valid two-lord fixture loads into a complete immutable tree ─────

test("valid fixture loads into a complete tree: lords, routes, sections, claims, gaps", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));

  assert.equal(tree.lords.length, 2);
  assert.deepEqual(listLords(tree).map((l) => l.slug), ["als-rhyn-of-lorek", "second-lord"]);

  // als-rhyn-of-lorek: fully valid
  const als = tree.lords[0];
  assert.equal(als.guide.faction, "Tomb Kings");
  assert.deepEqual(als.guide.version, { patch: "Warhammer 9.0", vco: "2026.09.30.1", checked: "2026-09-30" });
  assert.ok(als.sharedHtml.includes("<p>"), "shared fundamentals rendered to HTML");
  assert.equal(als.datasets.length, 7, "all seven datasets loaded");
  assert.equal(als.routes.length, 1);

  // The fixture item/army datasets are populated by the panel-items fixtures
  // and proven through the anatomy tests (test/components.test.ts,
  // test/views.test.ts). No dataset value is asserted in this block; the
  // committed-tree typed empty forms (all seven datasets) stay proven by
  // test/elspeth-skeleton.test.ts.

  const route = als.routes[0];
  assert.equal(route.id, "dark-conduits");
  assert.equal(route.number, "I");
  assert.equal(route.vcoTitle, null);
  assert.deepEqual(route.gaps, []);
  assert.equal(route.sections.length, 4);
  assert.deepEqual(
    route.sections.map((s) => s.id),
    ["opening", "early-mid", "mid-late", "victory-push"],
    "section anchor ids slugified from the registry headings",
  );
  assert.equal(route.sections[0].title, "Opening");
  assert.ok(route.sections[0].html.includes("<p>"));

  // objective/reward carry typed confidence states
  assert.equal(route.objective.state, "confirmed");
  assert.deepEqual(route.objective.src, ["vco-guide"]);
  assert.equal(route.reward.state, "historical");
  assert.deepEqual(route.reward.src, ["ca"]);

  // the one ::claim callout is parsed with state + src and rendered as a labelled block
  assert.equal(route.claims.length, 1);
  assert.equal(route.claims[0].state, "confirmed");
  assert.deepEqual(route.claims[0].src, ["vco-guide", "ca"]);
  assert.ok(route.claims[0].text.includes("conduit network"));
  // the callout is attributed to the section that encloses it (Early → Mid)
  assert.equal(route.claims[0].sectionId, "early-mid");
  assert.equal(route.claims[0].sectionTitle, "Early → Mid");
  const calloutHtml = route.sections[1].html; // Early → Mid holds the callout
  assert.ok(calloutHtml.includes('class="claim claim--confirmed"'));
  assert.ok(calloutHtml.includes('data-state="confirmed"'));
  assert.ok(calloutHtml.includes('data-src="vco-guide,ca"'));

  // second-lord: minimal valid — every required H2 declared as a gap
  const second = tree.lords[1];
  assert.equal(second.routes.length, 1);
  const lone = second.routes[0];
  assert.equal(lone.sections.length, 0);
  assert.deepEqual(lone.gaps, ["Opening", "Early → Mid", "Mid → Late", "Victory push"]);
  assert.equal(lone.objective.state, "inferred");
  assert.equal(lone.reward.state, "verify-in-campaign");
});

test("sources dataset is typed and reachable per lord", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const als = tree.lords[0];
  const sources = als.datasets.find((d) => d.name === "sources");
  assert.ok(sources !== undefined && sources.name === "sources");
  assert.deepEqual(
    sources.value.map((s) => s.id),
    ["vco-guide", "ca"],
  );
});

// ─── 2. Empty state (DESIGN §5) ─────────────────────────────────────────────

test("missing index with no content files is the valid empty state, not an error", async () => {
  const empty = await mkdtemp(join(tmpdir(), "content-model-empty-"));
  try {
    const tree = await loadContentTree(fsReader(empty));
    assert.deepEqual(listLords(tree), []);
    assert.deepEqual(await lintContent(fsReader(empty)), []);
  } finally {
    await rm(empty, { recursive: true, force: true });
  }
});

// ─── 3. Every broken variant yields a violation naming file and field ───────

test("dangling route file: manifest names a file that does not exist", async () => {
  const violations = await lintBroken(async (root) => {
    const guide = JSON.parse(await readFile(join(root, "als-rhyn-of-lorek/guide.json"), "utf8"));
    guide.routes[0].file = "routes/missing.md";
    await rewrite(root, "als-rhyn-of-lorek/guide.json", JSON.stringify(guide));
  });
  const hit = violations.find((v) => v.file === "als-rhyn-of-lorek/routes/missing.md");
  assert.ok(hit !== undefined, `expected a violation for the missing route file; got ${JSON.stringify(violations)}`);
  assert.equal(hit.field, "routes");
});

test("index names a lord directory that does not exist", async () => {
  const violations = await lintBroken(async (root) => {
    await rewrite(root, "index.json", JSON.stringify({ lords: ["als-rhyn-of-lorek", "second-lord", "ghost-lord"] }));
  });
  const hit = violations.find((v) => v.file === "ghost-lord/guide.json");
  assert.ok(hit !== undefined, `expected a violation for the ghost lord; got ${JSON.stringify(violations)}`);
  assert.equal(hit.field, "lords");
});

test("orphan file present on disk but named by no manifest", async () => {
  const violations = await lintBroken(async (root) => {
    await rewrite(root, "als-rhyn-of-lorek/stray.md", "not named anywhere\n");
  });
  const hit = violations.find((v) => v.file === "als-rhyn-of-lorek/stray.md");
  assert.ok(hit !== undefined, `expected an orphan violation; got ${JSON.stringify(violations)}`);
  assert.equal(hit.field, "orphan");
});

test("missing required H2 without a gaps entry", async () => {
  const violations = await lintBroken(async (root) => {
    const text = await readFile(join(root, "als-rhyn-of-lorek/routes/route-1.md"), "utf8");
    const withoutMidLate = text.replace(
      "## Mid → Late\n\nThe books surplus turns into a second casket battery on every front.\n\n",
      "",
    );
    assert.ok(withoutMidLate !== text, "fixture must contain the Mid → Late section to remove");
    await rewrite(root, "als-rhyn-of-lorek/routes/route-1.md", withoutMidLate);
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/routes/route-1.md" && v.message.includes("Mid → Late"),
  );
  assert.ok(hit !== undefined, `expected a missing Mid → Late violation; got ${JSON.stringify(violations)}`);
  assert.equal(hit.field, "sections");
});

test("invalid claim state word names the marker", async () => {
  const violations = await lintBroken(async (root) => {
    const text = await readFile(join(root, "als-rhyn-of-lorek/routes/route-1.md"), "utf8");
    await rewrite(root, "als-rhyn-of-lorek/routes/route-1.md", text.replace("::claim confirmed", "::claim shure"));
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/routes/route-1.md" && v.message.includes("shure"),
  );
  assert.ok(hit !== undefined, `expected an invalid-state violation; got ${JSON.stringify(violations)}`);
});

test("src id that does not resolve in data/sources.json names file and id", async () => {
  const violations = await lintBroken(async (root) => {
    const text = await readFile(join(root, "als-rhyn-of-lorek/routes/route-1.md"), "utf8");
    await rewrite(root, "als-rhyn-of-lorek/routes/route-1.md", text.replace("src=vco-guide,ca", "src=ghost-id"));
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/routes/route-1.md" && v.message.includes("ghost-id"),
  );
  assert.ok(hit !== undefined, `expected a dangling-src violation; got ${JSON.stringify(violations)}`);
});

test("unparseable JSON in a named dataset", async () => {
  const violations = await lintBroken(async (root) => {
    await rewrite(root, "als-rhyn-of-lorek/data/armies.json", "not json{");
  });
  const hit = violations.find((v) => v.file === "als-rhyn-of-lorek/data/armies.json" && v.field === "datasets");
  assert.ok(hit !== undefined, `expected a parse violation; got ${JSON.stringify(violations)}`);
});

test("bad army unit row: a units row with a non-numeric n violates the armies schema", async () => {
  const violations = await lintBroken(async (root) => {
    await rewrite(
      root,
      "als-rhyn-of-lorek/data/armies.json",
      JSON.stringify({
        "dark-conduits": {
          early: {
            label: "Early",
            name: "The first column",
            units: [{ n: "8", name: "Spearmen", role: "Holding line", kind: "line" }],
            legendary: [],
            generic: [],
            notes: [],
            plan: [],
            size: 20,
            sources: [],
          },
        },
      }),
    );
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/data/armies.json" && v.field === "datasets" && v.message.includes("units[0].n"),
  );
  assert.ok(hit !== undefined, `expected an army unit-row violation; got ${JSON.stringify(violations)}`);
});

test("malformed item: a step missing its note violates the item schema", async () => {
  const violations = await lintBroken(async (root) => {
    await rewrite(
      root,
      "als-rhyn-of-lorek/data/skills.json",
      JSON.stringify({
        early: {
          label: "Early",
          title: "Raise the conduit towns",
          intro: "Construction savings arrive before the programme.",
          steps: [{ title: "Conduit Silos", gate: "Opening option" }],
          sources: [],
        },
      }),
    );
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/data/skills.json" && v.field === "datasets" && v.message.includes("steps[0].note"),
  );
  assert.ok(hit !== undefined, `expected a step violation; got ${JSON.stringify(violations)}`);
});

test("malformed vco item: an objective item without a state violates the vco schema", async () => {
  const violations = await lintBroken(async (root) => {
    await rewrite(
      root,
      "als-rhyn-of-lorek/data/vco.json",
      JSON.stringify({ "dark-conduits": [{ id: "obj-1", text: "Secure the conduits." }] }),
    );
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/data/vco.json" && v.field === "datasets" && v.message.includes("state is required"),
  );
  assert.ok(hit !== undefined, `expected a vco item violation; got ${JSON.stringify(violations)}`);
});

test("unknown panel-order group key fails the panel group vocabulary", async () => {
  const violations = await lintBroken(async (root) => {
    const text = await readFile(join(root, "als-rhyn-of-lorek/routes/route-1.md"), "utf8");
    await rewrite(root, "als-rhyn-of-lorek/routes/route-1.md", text.replace("  mechanics: [undead-tithe]", "  mechanics: [undead-tithe]\n  souls: []"));
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/routes/route-1.md" && v.field === "panelOrder" && v.message.includes('"souls"'),
  );
  assert.ok(hit !== undefined, `expected a group-key violation; got ${JSON.stringify(violations)}`);
});

test("unresolvable panel-order id fails id resolution in the route's own armies map", async () => {
  const violations = await lintBroken(async (root) => {
    const text = await readFile(join(root, "als-rhyn-of-lorek/routes/route-1.md"), "utf8");
    await rewrite(root, "als-rhyn-of-lorek/routes/route-1.md", text.replace("  armies: [early, late]", "  armies: [ghost-column]"));
  });
  const hit = violations.find(
    (v) =>
      v.file === "als-rhyn-of-lorek/routes/route-1.md" &&
      v.field === "panelOrder" &&
      v.message.includes("ghost-column") &&
      v.message.includes('"armies"'),
  );
  assert.ok(hit !== undefined, `expected an unresolvable-id violation; got ${JSON.stringify(violations)}`);
});

// ─── 4. Boot: structured error naming file + field, never a partial tree ────

test("boot rejects broken content with ContentBootError naming file and field", async () => {
  let err: unknown;
  await inBrokenCopy(
    async (root) => {
      await rewrite(root, "als-rhyn-of-lorek/data/armies.json", "not json{");
    },
    async (root) => {
      try {
        await loadContentTree(fsReader(root));
        assert.fail("expected boot to reject");
      } catch (e) {
        err = e;
      }
    },
  );
  assert.ok(err instanceof ContentBootError, `expected ContentBootError, got ${String(err)}`);
  assert.equal(err.file, "als-rhyn-of-lorek/data/armies.json");
  assert.equal(err.field, "datasets");
  assert.ok(err.message.includes("armies.json"));
});

test("boot rejects a schema-invalid dataset with ContentBootError naming file and field", async () => {
  let err: unknown;
  await inBrokenCopy(
    async (root) => {
      await rewrite(
        root,
        "als-rhyn-of-lorek/data/vco.json",
        JSON.stringify({ "dark-conduits": [{ id: "obj-1", text: "Secure the conduits." }] }),
      );
    },
    async (root) => {
      try {
        await loadContentTree(fsReader(root));
        assert.fail("expected boot to reject");
      } catch (e) {
        err = e;
      }
    },
  );
  assert.ok(err instanceof ContentBootError, `expected ContentBootError, got ${String(err)}`);
  assert.equal(err.file, "als-rhyn-of-lorek/data/vco.json");
  assert.equal(err.field, "datasets");
  assert.ok(err.message.includes("state is required"));
});

test("boot rejects a manifest-named missing file with its path and manifest field", async () => {
  let err: unknown;
  await inBrokenCopy(
    async (root) => {
      await rm(join(root, "als-rhyn-of-lorek/routes/route-1.md"));
    },
    async (root) => {
      try {
        await loadContentTree(fsReader(root));
        assert.fail("expected boot to reject");
      } catch (e) {
        err = e;
      }
    },
  );
  assert.ok(err instanceof ContentBootError, `expected ContentBootError, got ${String(err)}`);
  assert.equal(err.file, "als-rhyn-of-lorek/routes/route-1.md");
  assert.equal(err.field, "routes");
});

// ─── 5. Immutability: the built tree is deeply frozen ───────────────────────

test("mutating the loaded tree throws: the tree is deeply frozen", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const route = tree.lords[0].routes[0];

  assert.ok(Object.isFrozen(tree));
  assert.ok(Object.isFrozen(tree.lords));
  assert.ok(Object.isFrozen(tree.lords[0]));
  assert.ok(Object.isFrozen(route));
  assert.ok(Object.isFrozen(route.sections));
  assert.ok(Object.isFrozen(route.sections[0]));
  assert.ok(Object.isFrozen(route.objective));
  assert.ok(Object.isFrozen(route.claims));

  assert.throws(() => {
    (tree as { lords: unknown[] }).lords = [];
  }, TypeError);
  assert.throws(() => {
    (route.sections as Section[]).push({ id: "x", title: "x", html: "" } as Section);
  }, TypeError);
  assert.throws(() => {
    (route.objective as { text: string }).text = "rewritten";
  }, TypeError);

  // dataset values (typed by the loader) are deeply frozen too
  for (const dataset of tree.lords[0].datasets) {
    assert.ok(Object.isFrozen(dataset.value), `dataset ${dataset.name} value is frozen`);
  }
});

// ─── 6. Query layer: typed not-found results, never throws ──────────────────

test("query layer returns typed not-found results for unknown ids", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));

  const missingLord = getLord(tree, "ghost-lord");
  assert.deepEqual(missingLord, { found: false, kind: "not-found" });

  const als = getLord(tree, "als-rhyn-of-lorek");
  assert.ok(als.found);
  assert.equal(als.found && als.value.slug, "als-rhyn-of-lorek");

  const missingRoute = getRoute(tree, "als-rhyn-of-lorek", "ghost-route");
  assert.equal(missingRoute.found, false);
  const knownRoute = getRoute(tree, "als-rhyn-of-lorek", "dark-conduits");
  assert.ok(knownRoute.found);

  const missingSection = getSection(tree, "als-rhyn-of-lorek", "dark-conduits", "no-such-section");
  assert.equal(missingSection.found, false);
  const knownSection = getSection(tree, "als-rhyn-of-lorek", "dark-conduits", "victory-push");
  assert.ok(knownSection.found);
  assert.equal(knownSection.found && knownSection.value.title, "Victory push");

  const missingSource = getSource(tree, "als-rhyn-of-lorek", "ghost-id");
  assert.equal(missingSource.found, false);
  const knownSource = getSource(tree, "als-rhyn-of-lorek", "ca");
  assert.ok(knownSource.found);
  assert.ok(knownSource.found && knownSource.value.url.length > 0);

  // sources are lord-scoped; the second lord resolves its own ids with zero code
  const secondSource = getSource(tree, "second-lord", "ca");
  assert.ok(secondSource.found);
  const secondRoute = getRoute(tree, "second-lord", "lone-route");
  assert.ok(secondRoute.found);
});

// ─── 7. Fixtures are lint-clean through the same rule set the CLI will use ──

test("committed fixtures are lint-clean through lintContent", async () => {
  assert.deepEqual(await lintContent(fsReader(FIXTURES)), []);
});

// ─── 8. The production reader shape satisfies the contract (browser fetch) ──

test("createFetchReader is a ContentReader and cannot list files", async () => {
  const reader = createFetchReader("https://example.test/content/");
  assert.deepEqual(await reader.listFiles(), null);
  await assert.rejects(reader.readFile("index.json")); // no server in tests — rejects like a missing file
});

// ─── 9. The flagged-set selector over the fixture lords (package flagged-query) ──

// als-rhyn-of-lorek's populated datasets use inferred/confirmed/historical
// states only and its objective/reward are confirmed/historical: the cleared
// state — the selector returns no entry.
test("getFlaggedEntries: als-rhyn-of-lorek carries no verify-in-campaign claims", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  assert.deepEqual(getFlaggedEntries(tree.lords[0]), []);
});

test("getFlaggedEntries: second-lord returns exactly its one verify-in-campaign reward claim with the resolved source note", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const flagged = getFlaggedEntries(tree.lords[1]);

  assert.equal(flagged.length, 1);
  assert.deepEqual(flagged[0], {
    kind: "identity",
    routeId: "lone-route",
    claimKind: "reward",
    text: "Unlock the Slann temple rites.",
    state: "verify-in-campaign",
    sources: [
      {
        id: "vco-guide",
        title: "VCO Campaign Guide",
        url: "https://example.test/vco-guide",
        note: "Official victory-conditions overview.",
      },
    ],
  });
});

// A valid-content mutant (the `inBrokenCopy` temp-copy convention): flipping
// the fixture's listed skills item to `verify-in-campaign` on the copy surfaces
// exactly one dataset entry located to its panel — nothing else in the fixture
// carries the state.
test("getFlaggedEntries: a verify-in-campaign dataset item listed in panelOrder yields a dataset entry located to its panel", async () => {
  await inBrokenCopy(
    async (root) => {
      const skills = JSON.parse(await readFile(join(root, "als-rhyn-of-lorek/data/skills.json"), "utf8"));
      skills["conduit-rites"].state = "verify-in-campaign";
      await rewrite(root, "als-rhyn-of-lorek/data/skills.json", JSON.stringify(skills));
    },
    async (root) => {
      const tree = await loadContentTree(fsReader(root));
      const flagged = getFlaggedEntries(tree.lords[0]);

      assert.equal(flagged.length, 1, "exactly the one mutated dataset item is flagged");
      const entry = flagged[0];
      if (entry.kind !== "dataset") assert.fail(`expected a dataset entry, got ${entry.kind}`);
      assert.equal(entry.group, "skills");
      assert.equal(entry.entryId, "conduit-rites");
      assert.equal(entry.routeId, "dark-conduits");
      assert.equal(entry.state, "verify-in-campaign");
      assert.equal(entry.text, "Raise the conduit towns");
      assert.deepEqual(
        entry.sources.map((s) => s.id),
        ["vco-guide"],
      );
    },
  );
});

// ─── 10. Chrome fields: crest, environment, phases (package chrome-content-model) ──

/** A validated copy of the fixture's als-rhyn guide carrying the chrome fields. */
const VALID_CREST_SVG =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">\n' +
  '<path d="M0 0h120v120H0z"/>\n' +
  "</svg>\n";

/** Adds valid optional chrome fields to the fixture copy (crest, environment, phases). */
async function addValidChrome(root: string): Promise<void> {
  const guide = JSON.parse(await readFile(join(root, "als-rhyn-of-lorek/guide.json"), "utf8"));
  guide.crest = "crest.svg";
  guide.environment = "Normal / Normal · Smart Autoresolve · VCO · Immortal Empires";
  await rewrite(root, "als-rhyn-of-lorek/guide.json", JSON.stringify(guide));
  await rewrite(root, "als-rhyn-of-lorek/crest.svg", VALID_CREST_SVG);
  await addFrontmatterLine(
    root,
    'phases:\n  - { title: "Give Nuln breathing room", note: "Win the starting war without creating three additional fronts." }\n  - { title: "Secure the eastern road", note: "Push to the river before turn 15; guard the supply line." }',
  );
}

/** Appends a frontmatter line (or block) after the fixture route's `gaps: []` line. */
async function addFrontmatterLine(root: string, line: string): Promise<void> {
  const path = join(root, "als-rhyn-of-lorek/routes/route-1.md");
  const text = await readFile(path, "utf8");
  const withLine = text.replace("gaps: []\n", `gaps: []\n${line}\n`);
  assert.ok(withLine !== text, "fixture frontmatter must still contain the gaps line");
  await rewrite(root, "als-rhyn-of-lorek/routes/route-1.md", withLine);
}

/** Mutates the fixture copy's guide.json manifest chrome fields. */
async function rewriteChromeManifest(root: string, mutate: (guide: Record<string, unknown>) => void): Promise<void> {
  const path = join(root, "als-rhyn-of-lorek/guide.json");
  const guide = JSON.parse(await readFile(path, "utf8"));
  mutate(guide);
  await rewrite(root, "als-rhyn-of-lorek/guide.json", JSON.stringify(guide));
}

test("chrome fields: a valid crest/environment/phases guide lints clean", async () => {
  const violations = await lintBroken(addValidChrome);
  assert.deepEqual(violations, []);
});

test("crest path containing a .. segment violates the field", async () => {
  const violations = await lintBroken(async (root) => {
    await rewriteChromeManifest(root, (g) => {
      g.crest = "../escape.svg";
    });
  });
  const hit = violations.find((v) => v.file === "als-rhyn-of-lorek/guide.json" && v.field === "crest");
  assert.ok(hit !== undefined, `expected a crest path violation; got ${JSON.stringify(violations)}`);
  assert.ok(hit.message.includes("../escape.svg"), `expected the offending path in the message; got ${hit.message}`);
});

test("crest path with a leading slash violates the field", async () => {
  const violations = await lintBroken(async (root) => {
    await rewriteChromeManifest(root, (g) => {
      g.crest = "/crest.svg";
    });
  });
  const hit = violations.find((v) => v.file === "als-rhyn-of-lorek/guide.json" && v.field === "crest");
  assert.ok(hit !== undefined, `expected a crest path violation; got ${JSON.stringify(violations)}`);
});

test("empty environment value violates the field", async () => {
  const violations = await lintBroken(async (root) => {
    await rewriteChromeManifest(root, (g) => {
      g.environment = "";
    });
  });
  const hit = violations.find((v) => v.file === "als-rhyn-of-lorek/guide.json" && v.field === "environment");
  assert.ok(hit !== undefined, `expected an environment violation; got ${JSON.stringify(violations)}`);
});

test("phases as a scalar violates the field", async () => {
  const violations = await lintBroken(async (root) => {
    await addFrontmatterLine(root, "phases: nope");
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/routes/route-1.md" && v.field === "phases",
  );
  assert.ok(hit !== undefined, `expected a phases violation; got ${JSON.stringify(violations)}`);
});

test("phases as an empty list violates the field", async () => {
  const violations = await lintBroken(async (root) => {
    await addFrontmatterLine(root, "phases: []");
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/routes/route-1.md" && v.field === "phases" && v.message.includes("non-empty"),
  );
  assert.ok(hit !== undefined, `expected an empty-phases violation; got ${JSON.stringify(violations)}`);
});

test("phases entry missing its title violates phases[0].title", async () => {
  const violations = await lintBroken(async (root) => {
    await addFrontmatterLine(root, 'phases:\n  - { note: "Win the starting war without creating three additional fronts." }');
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/routes/route-1.md" && v.field === "phases" && v.message.includes("phases[0].title"),
  );
  assert.ok(hit !== undefined, `expected a missing-title violation; got ${JSON.stringify(violations)}`);
});

test("phases entry with an empty note violates phases[0].note", async () => {
  const violations = await lintBroken(async (root) => {
    await addFrontmatterLine(root, 'phases:\n  - { title: "Give Nuln breathing room", note: "" }');
  });
  const hit = violations.find(
    (v) => v.file === "als-rhyn-of-lorek/routes/route-1.md" && v.field === "phases" && v.message.includes("phases[0].note"),
  );
  assert.ok(hit !== undefined, `expected an empty-note violation; got ${JSON.stringify(violations)}`);
});

test("a valid chrome guide loads with crestSvg and phases parsed in order", async () => {
  await inBrokenCopy(
    addValidChrome,
    async (root) => {
      const tree = await loadContentTree(fsReader(root));
      const lord = tree.lords[0];
      assert.equal(lord.crestSvg, VALID_CREST_SVG, "crestSvg holds exactly the served SVG text");
      assert.ok((lord.crestSvg ?? "").includes("<svg"), "the served crest text carries an <svg start tag");
      assert.equal(lord.guide.environment, "Normal / Normal · Smart Autoresolve · VCO · Immortal Empires");
      const route = lord.routes[0];
      assert.deepEqual(
        route.phases,
        [
          { title: "Give Nuln breathing room", note: "Win the starting war without creating three additional fronts." },
          { title: "Secure the eastern road", note: "Push to the river before turn 15; guard the supply line." },
        ],
        "phases parsed in frontmatter order with both fields",
      );
      assert.ok(Object.isFrozen(route.phases as readonly unknown[]), "the parsed phases list is frozen");
    },
  );
});

test("boot rejects a missing crest file with ContentBootError naming file and field", async () => {
  let err: unknown;
  await inBrokenCopy(
    async (root) => {
      await rewriteChromeManifest(root, (g) => {
        g.crest = "missing.svg";
      });
    },
    async (root) => {
      try {
        await loadContentTree(fsReader(root));
        assert.fail("expected boot to reject");
      } catch (e) {
        err = e;
      }
    },
  );
  assert.ok(err instanceof ContentBootError, `expected ContentBootError, got ${String(err)}`);
  assert.equal(err.file, "als-rhyn-of-lorek/missing.svg");
  assert.equal(err.field, "crest");
});

test("boot rejects a crest file without an <svg start tag with ContentBootError naming file and field", async () => {
  let err: unknown;
  await inBrokenCopy(
    async (root) => {
      await rewriteChromeManifest(root, (g) => {
        g.crest = "crest.svg";
      });
      await rewrite(root, "als-rhyn-of-lorek/crest.svg", "plain text, not an svg\n");
    },
    async (root) => {
      try {
        await loadContentTree(fsReader(root));
        assert.fail("expected boot to reject");
      } catch (e) {
        err = e;
      }
    },
  );
  assert.ok(err instanceof ContentBootError, `expected ContentBootError, got ${String(err)}`);
  assert.equal(err.file, "als-rhyn-of-lorek/crest.svg");
  assert.equal(err.field, "crest");
});
