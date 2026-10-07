/**
 * Contract proof for the tokenized cross-guide search (package
 * `search-query-layer`, commit 1 of the cross-guide-search feature).
 *
 * Uses the established reader/fixture conventions of test/content-model.test.ts:
 * a local `fsReader` + `loadContentTree` pass over the committed `content/`
 * root and over `test/fixtures/content` — both corpora are read-only, no temp
 * copies are needed (the committed term "the" matches far more than 31 indexed
 * entries, proving the 30-cap without the seeded-variant fallback).
 *
 * Corpus facts verified at authoring time against the committed/fixture
 * corpus and re-verified at execution: `garrison` occurs in the indexed text
 * of all three committed guides; the fixture term `lord` occurs in both
 * fixture guides' indexed text; the prefix `gar` is strictly broader than
 * `garrison` and the non-prefix `garzon` matches nothing; `income` and
 * `deceivers` each hit entries while no single entry carries both tokens.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentTree } from "../app/content/load.ts";
import {
  buildSearchIndex,
  searchContent,
  type SearchHit,
  type SearchIndexEntry,
  type SearchIndexEntryKind,
} from "../app/content/query.ts";
import type { ContentTree, ContentReader } from "../app/content/types.ts";

const CONTENT_ROOT = fileURLToPath(new URL("../content", import.meta.url));
const FIXTURES = fileURLToPath(new URL("fixtures/content", import.meta.url));

/** A filesystem `ContentReader` — the same shape test/content-model.test.ts uses. */
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

let committedTreePromise: Promise<ContentTree> | null = null;
function committedTree(): Promise<ContentTree> {
  committedTreePromise ??= loadContentTree(fsReader(CONTENT_ROOT));
  return committedTreePromise;
}

let fixtureTreePromise: Promise<ContentTree> | null = null;
function fixtureTree(): Promise<ContentTree> {
  fixtureTreePromise ??= loadContentTree(fsReader(FIXTURES));
  return fixtureTreePromise;
}

/**
 * The documented tokenizer rule (DESIGN/plan): case-folded whole tokens split
 * on non-alphanumerics, empty tokens dropped. Shared by the per-hit
 * re-derivations below so they observe the public index, not internals.
 */
function toTokens(text: string): readonly string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

function entryKey(parts: { kind: SearchIndexEntryKind; lordSlug: string; routeId: string | null; title: string }): string {
  return `${parts.kind}\u0000${parts.lordSlug}\u0000${parts.routeId ?? ""}\u0000${parts.title}`;
}

/**
 * The index grouped by composite key (kind/lord/route/title). A key can hold
 * several entries when distinct dataset ids share a title (e.g. zhao-ming
 * research), so the per-hit checks below accept any candidate whose joined
 * text proves the asserted property — the corpus walk emits the true entry
 * among them.
 */
function indexByEntry(index: readonly SearchIndexEntry[]): Map<string, readonly SearchIndexEntry[]> {
  const map = new Map<string, SearchIndexEntry[]>();
  for (const entry of index) {
    const key = entryKey(entry);
    const list = map.get(key);
    if (list === undefined) map.set(key, [entry]);
    else list.push(entry);
  }
  return map;
}

/** The first hit of one kind in a result list, or undefined. */
function firstHitOf(results: ReturnType<typeof searchContent>, kind: SearchIndexEntryKind): SearchHit | undefined {
  return results.hits.find((hit) => hit.kind === kind);
}

const isLordWide = (kind: SearchIndexEntryKind): boolean => kind === "shared" || kind === "source";

// ─── 1. Cross-guide coverage and ordering ───────────────────────────────────

test("cross-guide: garrison surfaces hits from ≥ 2 committed guides in manifest order, lord-wide entries last per faction", async () => {
  const tree = await committedTree();
  const results = searchContent(tree, "garrison");

  // The corpus fact: garrison is present in the indexed text of all three
  // committed guides (the ≥ 2-guide return requirement is a lower bound).
  const garrisonGuides = new Set(
    buildSearchIndex(tree)
      .filter((entry) => toTokens(`${entry.title} ${entry.text}`).some((t) => t.startsWith("garrison")))
      .map((entry) => entry.lordSlug),
  );
  assert.ok(garrisonGuides.size >= 2, `garrison must be indexed in ≥ 2 committed guides; got ${[...garrisonGuides]}`);

  const hitGuides = new Set(results.hits.map((hit) => hit.lordSlug));
  assert.ok(hitGuides.size >= 2, "the returned hits must cover ≥ 2 of the committed guides");

  // Every hit's faction is its lord's manifest faction (breadcrumb truth).
  for (const hit of results.hits) {
    const lord = tree.lords.find((l) => l.slug === hit.lordSlug);
    assert.ok(lord !== undefined, `hit names an unknown lord ${hit.lordSlug}`);
    assert.equal(hit.faction, lord.guide.faction);
  }

  // Hits keep manifest (hit) order: the lordSlug sequence never re-sorts.
  const orderIndex = new Map(tree.lords.map((lord, i) => [lord.slug, i]));
  const slugs = results.hits.map((hit) => hit.lordSlug);
  for (let i = 1; i < slugs.length; i++) {
    assert.ok(
      (orderIndex.get(slugs[i - 1]) ?? 0) <= (orderIndex.get(slugs[i]) ?? 0),
      "hits keep manifest faction order",
    );
  }

  // Within each faction's group, lord-wide entries (shared/source) come last.
  for (const lord of tree.lords) {
    const group = results.hits.filter((hit) => hit.lordSlug === lord.slug);
    const firstWide = group.findIndex((hit) => isLordWide(hit.kind));
    if (firstWide !== -1) {
      assert.ok(
        group.slice(firstWide).every((hit) => isLordWide(hit.kind)),
        `lord-wide entries must trail route-scoped entries within ${lord.slug}`,
      );
    }
  }
});

test("cross-guide: the fixture term lord hits both fixture guides, manifest order, route-scoped before lord-wide", async () => {
  const tree = await fixtureTree();
  const results = searchContent(tree, "lord");

  // Verified: both fixture guides' indexed text contains `lord`.
  assert.deepEqual(
    [...new Set(results.hits.map((hit) => hit.lordSlug))],
    ["als-rhyn-of-lorek", "second-lord"],
  );

  // Verified concrete shape: the first fixture lord's route-scoped mechanic
  // hit, then its shared fundamentals, then second-lord's shared fundamentals
  // — manifest order with lord-wide entries last within each faction.
  assert.deepEqual(
    results.hits.map((hit) => [hit.lordSlug, hit.kind, hit.routeLabel]),
    [
      ["als-rhyn-of-lorek", "mechanic", "I · The Dark Conduits"],
      ["als-rhyn-of-lorek", "shared", null],
      ["second-lord", "shared", null],
    ],
  );
});

// ─── 2. Breadcrumb data per kind ────────────────────────────────────────────

/** A sampled hit per kind, verified against the committed corpus at authoring time. */
const KIND_SAMPLES = [
  { kind: "section", query: "diplomacy", title: "Diplomacy", category: "Route plan", faction: "Empire", routeLabel: "I · The Graveyard Watch" },
  { kind: "shared", query: "fundamentals", title: "Shared fundamentals", category: "Shared fundamentals", faction: "Empire", routeLabel: null },
  { kind: "army", query: "spearmen", title: "The first Nuln column", category: "Army templates", faction: "Empire", routeLabel: "I · The Graveyard Watch" },
  { kind: "skill", query: "radiance", title: "Elspeth", category: "Lord & hero skills", faction: "Empire", routeLabel: "I · The Graveyard Watch" },
  { kind: "research", query: "firepower", title: "Infantry, artillery and the escort", category: "Research priorities", faction: "Empire", routeLabel: "I · The Graveyard Watch" },
  { kind: "building", query: "income", title: "Safe income town", category: "Settlement builds", faction: "Empire", routeLabel: "I · The Graveyard Watch" },
  { kind: "mechanic", query: "armoury", title: "Field Testing · unlock what the army will use", category: "Unique mechanics", faction: "Empire", routeLabel: "I · The Graveyard Watch" },
  { kind: "vco", query: "deceivers", title: "deceivers · The Deceivers — The Changeling: Use the actual destruction/wounded wordi…", category: "VCO objective", faction: "Empire", routeLabel: "I · The Graveyard Watch" },
  { kind: "source", query: "trials", title: "Theodore • Trials by Combat", category: "Sources", faction: "Empire", routeLabel: null },
] as const;

test("breadcrumb data: a sampled hit per kind carries the right faction, routeLabel, category and title", async () => {
  const tree = await committedTree();
  for (const sample of KIND_SAMPLES) {
    const results = searchContent(tree, sample.query);
    const hit = firstHitOf(results, sample.kind);
    assert.ok(hit !== undefined, `expected a ${sample.kind} hit for query "${sample.query}"`);

    assert.equal(hit.faction, sample.faction, `${sample.kind} faction`);
    assert.equal(hit.routeLabel, sample.routeLabel, `${sample.kind} routeLabel`);
    assert.equal(hit.category, sample.category, `${sample.kind} category`);
    assert.equal(hit.title, sample.title, `${sample.kind} title`);

    // routeId is present exactly for route-scoped kinds; lord-wide kinds have
    // routeId null and routeLabel null.
    assert.equal(hit.routeId === null, isLordWide(sample.kind), `${sample.kind} routeId null-ness`);
    if (isLordWide(sample.kind)) assert.equal(hit.routeLabel, null);
  }
});

// ─── 3. Landing-target hrefs (DESIGN §4) ────────────────────────────────────

test("hrefs: every kind lands on its DESIGN §4 shape, including a real section anchor", async () => {
  const tree = await committedTree();
  const samples = [
    { kind: "section", query: "diplomacy", href: "#/elspeth-von-draken/plan/route-1/diplomacy" },
    { kind: "shared", query: "fundamentals", href: "#/elspeth-von-draken" },
    { kind: "army", query: "spearmen", href: "#/elspeth-von-draken/armies/route-1" },
    { kind: "skill", query: "radiance", href: "#/elspeth-von-draken/armies/route-1" },
    { kind: "research", query: "firepower", href: "#/elspeth-von-draken/armies/route-1" },
    { kind: "building", query: "income", href: "#/elspeth-von-draken/settlements/route-1" },
    { kind: "mechanic", query: "armoury", href: "#/elspeth-von-draken/workshop/route-1" },
    { kind: "vco", query: "deceivers", href: "#/elspeth-von-draken/plan/route-1" },
    { kind: "source", query: "trials", href: "#/elspeth-von-draken/sources" },
  ] as const;
  for (const sample of samples) {
    const results = searchContent(tree, sample.query);
    const hit = firstHitOf(results, sample.kind);
    assert.ok(hit !== undefined, `expected a ${sample.kind} hit for query "${sample.query}"`);
    assert.equal(hit.href, sample.href, `${sample.kind} href`);
  }

  // The section anchor is a real anchor id on that route's plan (DESIGN §4:
  // `#/<lord>/plan/<route>/<section-id>`), not a fabricated fragment.
  const elspeth = tree.lords.find((lord) => lord.slug === "elspeth-von-draken");
  assert.ok(elspeth !== undefined);
  const route1 = elspeth.routes.find((route) => route.id === "route-1");
  assert.ok(route1 !== undefined);
  assert.ok(route1.sections.some((section) => section.id === "diplomacy"), "route-1 carries a section anchored `diplomacy`");
});

// ─── 4. The 30-result cap with the explicit total ───────────────────────────

test("30-cap: the committed term `the` matches far more than 30 entries; hits cap at 30 with the total explicit", async () => {
  const tree = await committedTree();
  const results = searchContent(tree, "the");
  console.log(`[search-query-layer] committed corpus: term "the" → total=${results.total}, hits=${results.hits.length}`);
  assert.ok(results.total > 30, `"the" must match ≥ 31 entries to prove the cap; measured ${results.total}`);
  assert.equal(results.hits.length, 30);
});

// ─── 5. Empty / whitespace / punctuation-only queries ───────────────────────

test("empty, whitespace and punctuation-only queries return zero hits", async () => {
  const tree = await committedTree();
  const emptyQueries = ["", "   ", "\t\n ", "...", "!!!", " - — · ", "…/→", "¡¿"] as const;
  for (const query of emptyQueries) {
    assert.deepEqual(searchContent(tree, query), { total: 0, hits: [] }, `query ${JSON.stringify(query)}`);
  }
});

// ─── 6. Match semantics: AND, left-boundary prefixes, case-folding ──────────

test("match semantics: every query token must match (AND), prefix is left-boundary, folding is case-insensitive", async () => {
  const tree = await committedTree();
  const index = buildSearchIndex(tree);
  const byEntry = indexByEntry(index);

  // Each token alone hits; no entry carries both (AND rejection).
  const income = searchContent(tree, "income");
  const deceivers = searchContent(tree, "deceivers");
  assert.ok(income.total > 0, "`income` is verified present in the committed corpus");
  assert.ok(deceivers.total > 0, "`deceivers` is verified present in the committed corpus");
  assert.equal(searchContent(tree, "income deceivers").total, 0, "a two-token query must require both tokens");

  // Positive AND: entries carrying both `nuln` and `garrison`.
  const nuln = searchContent(tree, "nuln");
  const both = searchContent(tree, "nuln garrison");
  assert.ok(nuln.total > 0, "`nuln` is verified present in the committed corpus");
  assert.ok(both.total > 0, "some entry carries both nuln and garrison");
  assert.ok(
    both.total <= Math.min(nuln.total, searchContent(tree, "garrison").total),
    "AND results can never exceed either single-token count",
  );

  // Every both-hit's indexed entry really carries both tokens (re-derived
  // from the public index, so the hit and its corpus entry agree).
  for (const hit of both.hits) {
    const candidates = byEntry.get(entryKey(hit)) ?? [];
    assert.ok(
      candidates.some((candidate) => {
        const tokens = toTokens(`${candidate.title} ${candidate.text}`);
        return tokens.some((t) => t.startsWith("nuln")) && tokens.some((t) => t.startsWith("garrison"));
      }),
      `hit ${hit.kind}:${hit.title} is not backed by an entry carrying both tokens`,
    );
  }

  // Left-boundary prefixes: `gar` is strictly broader than `garrison`; the
  // non-prefix `garzon` matches nothing (no such token in the corpus).
  const prefix = searchContent(tree, "gar");
  const exact = searchContent(tree, "garrison");
  assert.ok(prefix.total > exact.total, "a prefix query is strictly broader than its whole token");
  assert.equal(searchContent(tree, "garzon").total, 0, "a non-prefix token must match nothing");

  // Case-folding: casing never changes the result.
  assert.equal(searchContent(tree, "GARRISON").total, exact.total);
});

// ─── 7. Snippet invariants ──────────────────────────────────────────────────

test("snippets: substring of the entry's joined text, in-bounds non-overlapping occurrences that re-slice to the query tokens, no raw markup", async () => {
  const tree = await committedTree();
  const byEntry = indexByEntry(buildSearchIndex(tree));
  const queries = ["the", "garrison", "diplomacy", "income", "deceivers", "armoury", "spearmen"];

  for (const query of queries) {
    const results = searchContent(tree, query);
    const queryTokens = toTokens(query);
    assert.ok(results.total > 0, `"${query}" is verified present in the committed corpus`);

    for (const hit of results.hits) {
      const candidates = byEntry.get(entryKey(hit)) ?? [];
      assert.ok(
        candidates.some((candidate) => `${candidate.title} ${candidate.text}`.includes(hit.snippet)),
        `${hit.kind}:${hit.title} — snippet must be a substring of the entry's joined text`,
      );

      assert.ok(!hit.snippet.includes("<"), `${hit.kind}:${hit.title} — snippet must contain no raw markup`);

      let previousEnd = 0;
      for (const occurrence of hit.occurrences) {
        assert.ok(occurrence.start >= previousEnd, "occurrences are non-overlapping and ascending");
        assert.ok(occurrence.end <= hit.snippet.length, "occurrence ranges stay inside the snippet");
        const matched = hit.snippet.slice(occurrence.start, occurrence.end).toLowerCase();
        assert.ok(
          queryTokens.includes(matched),
          `occurrence must re-slice to a case-insensitive match of a query token; got ${JSON.stringify(matched)}`,
        );
        previousEnd = occurrence.end;
      }
    }
  }
});

// ─── 8. Performance tripwire ────────────────────────────────────────────────

test("performance: one searchContent pass over the committed corpus clears the 500 ms tripwire", async () => {
  const tree = await committedTree();
  const start = performance.now();
  const results = searchContent(tree, "the");
  const elapsedMs = performance.now() - start;
  console.log(`[search-query-layer] searchContent("the") over committed corpus: ${elapsedMs.toFixed(1)} ms (total=${results.total})`);
  assert.ok(results.total > 30, "the tripwire query actually exercises a full scan");
  assert.ok(elapsedMs < 500, `one searchContent pass took ${elapsedMs.toFixed(1)} ms — above the 500 ms tripwire`);
});
