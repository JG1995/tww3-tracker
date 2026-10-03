/**
 * Contract proof for the data-driven views (package `home-real`, commit 6):
 * the home card list, the lord page, and the F1 route page rendered from the
 * REAL committed Elspeth tree; (package `route-tab-strip`, commit 4) the
 * route tab strip the lord/route views mount over the committed tree; and
 * (package `route-identity`, commit 5) the identity card's badged claims,
 * notes, distinct official-title/subtitle classes, and the optional VCO
 * undercard proven over the test fixtures; and (package `gap-markers`,
 * commit 6) the section region as the registry walk — in-flow Content Gap
 * Markers at registry positions and present sections interleaved, with the
 * F1 trailing gap list and the empty-body fallback gone.
 * Seam: zero-DOM. The committed `content/` loads through the same
 * `app/content/load.ts` pass the CLI and the site boot use (filesystem
 * `ContentReader`, one immutable tree), then each view function is called
 * directly with the data `main.tsx` passes it — `HomeView` gets the tree,
 * `LordView`/`RouteView` get query results — and the returned Preact VNode
 * tree is flattened to text with the small helper below. Views stay plain
 * `.ts` modules built from `h()`, so node:test can import them without a DOM
 * library (see the plan-revision discovery on `.tsx` under node:test). The
 * strip is asserted at the view seam (the `TabStrip` VNode's props) and then
 * expanded through the same pure `TabStripMarkup` builder with those props,
 * because the mounted wrapper's focus effect only runs under a real render.
 * The badge components (no hooks) expand through the pure `ConfidenceBadge`
 * function the same way, so the badge anatomy — label, state colour class,
 * resolved src links — is assertable without a DOM.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { cp, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { lintContent } from "../app/content/lint.ts";
import { loadContentTree } from "../app/content/load.ts";
import {
  getFlaggedEntries,
  getLord,
  getPanelEntries,
  getRoute,
  getVcoObjectives,
  resolveSources,
  type PanelEntries,
} from "../app/content/query.ts";
import { CLAIM_STATES, PANEL_GROUPS, type Army, type ClaimState, type ContentReader, type Item, type Lord, type Route, type Source } from "../app/content/types.ts";
import { ConfidenceBadge } from "../app/components/ConfidenceBadge.ts";
import { DashboardMarkup } from "../app/components/dashboard.ts";
import { TabStripMarkup, type TabStripProps } from "../app/components/TabStrip.ts";
import { HomeView } from "../app/views/home.ts";
import { LordView } from "../app/views/lord.ts";
import { RouteView } from "../app/views/route.ts";

/** The committed content root, resolved from this test file's own location. */
const CONTENT = fileURLToPath(new URL("../content", import.meta.url));

/** The test-owned fixture content root (holds the seeded VCO objectives). */
const FIXTURES = fileURLToPath(new URL("fixtures/content", import.meta.url));

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

/**
 * Copies the committed content into a fresh temp dir, runs `mutate`, then
 * `run` — the `inBrokenCopy` convention from content-model.test.ts applied
 * to the committed tree, so a mixed (present + gapped) route can be proven
 * without ever touching the committed content.
 */
async function inContentCopy(
  mutate: (root: string) => Promise<void>,
  run: (root: string) => Promise<void>,
): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "views-content-"));
  await cp(CONTENT, dir, { recursive: true });
  try {
    await mutate(dir);
    await run(dir);
    return dir;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Flattens a Preact VNode tree to a plain text string: text children in
 * document order, plus boot-time-rendered `dangerouslySetInnerHTML` HTML
 * literals, one space between sibling pieces so adjacent instrument labels
 * (route numbers, markers) stay distinct. `null`/`undefined`/booleans (the
 * views' conditional branches) produce nothing.
 */
function vnodeText(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((child) => vnodeText(child)).join(" ");
  if (typeof node === "object") {
    const props = (node as { props?: Record<string, unknown> }).props;
    if (props === undefined) return "";
    const pieces: string[] = [];
    const html = props.dangerouslySetInnerHTML;
    if (typeof html === "object" && html !== null) {
      pieces.push(String((html as { __html: string }).__html ?? ""));
    }
    const children = props.children;
    if (children !== null && children !== undefined && typeof children !== "boolean") {
      pieces.push(vnodeText(children));
    }
    return pieces.join(" ");
  }
  return "";
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let at = haystack.indexOf(needle);
  while (at !== -1) {
    count += 1;
    at = haystack.indexOf(needle, at + needle.length);
  }
  return count;
}

/** Records every VNode in a tree as a flat { tag, props, children } list for structural asserts. */
interface VNodeRecord {
  readonly tag: string;
  readonly props: Record<string, unknown>;
  readonly children: ReadonlyArray<unknown>;
  /** Preact extracts `key` out of `props` onto the VNode itself. */
  readonly key?: unknown;
}

function recordVNodes(node: unknown, into: VNodeRecord[] = []): VNodeRecord[] {
  if (node === null || node === undefined || typeof node === "boolean") return into;
  if (typeof node === "string" || typeof node === "number") return into;
  if (Array.isArray(node)) {
    for (const child of node) recordVNodes(child, into);
    return into;
  }
  const props = (node as { props?: Record<string, unknown> }).props ?? {};
  const children = props.children;
  const kids: unknown[] =
    Array.isArray(children)
      ? children
      : children === null || children === undefined || typeof children === "boolean"
        ? []
        : [children];
  into.push({
    tag: String((node as { type?: unknown }).type),
    props,
    children: kids,
    key: (node as { key?: unknown }).key,
  });
  for (const child of kids) recordVNodes(child, into);
  return into;
}

/**
 * The strip exactly as the view mounts it: the `TabStrip` VNode's props at
 * the view seam, then the same props expanded through the pure
 * `TabStripMarkup` builder at the component seam (the zero-DOM equivalent of
 * letting the view's child component render — the mounted wrapper's focus
 * effect only runs under a real preact render).
 */
function mountedTabStrip(view: unknown): { props: TabStripProps; tabs: VNodeRecord[]; text: string } {
  const nodes = recordVNodes(view);
  const strip = nodes.find((n) => typeof n.props.activeId === "string");
  assert.ok(strip !== undefined, "the view mounts the route tab strip");
  const props: TabStripProps = {
    lordSlug: String(strip.props.lordSlug),
    routes: strip.props.routes as readonly Route[],
    activeId: String(strip.props.activeId),
  };
  const tabs = recordVNodes(TabStripMarkup(props)).filter((n) => n.props.role === "tab");
  return { props, tabs, text: vnodeText(TabStripMarkup(props)) };
}

/**
 * The ConfidenceBadge VNodes at the view seam. The badge is a pure component
 * with no hooks, so — exactly like `TabStripMarkup` — it expands through the
 * component function with the recorded props, keeping the zero-DOM seam.
 */
function badgeVNodes(view: unknown): VNodeRecord[] {
  return recordVNodes(view).filter(
    (n) =>
      typeof n.props.state === "string" &&
      CLAIM_STATES.some((s) => s === n.props.state) &&
      Array.isArray(n.props.sources),
  );
}

/** One view badge expanded through the pure `ConfidenceBadge` component. */
function expandBadge(n: VNodeRecord): unknown {
  return ConfidenceBadge({ state: n.props.state as ClaimState, sources: n.props.sources as readonly Source[] });
}

/** The flattened text of every badge in a view, expanded at the component seam. */
function badgeText(view: unknown): string {
  return badgeVNodes(view)
    .map((n) => vnodeText(expandBadge(n)))
    .join(" ");
}

test("home renders one card per lord with faction and the patch · VCO version context", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const text = vnodeText(HomeView({ tree }));

  assert.ok(text.includes("Elspeth von Draken"), "the lord name is on the card");
  assert.ok(text.includes("Empire"), "the faction is on the card");
  assert.equal(
    countOccurrences(text, "patch 9.0 · VCO 2026.09.30.1"),
    1,
    "one committed lord ⇒ exactly one version-context label",
  );
  assert.ok(!text.includes("NO GUIDES YET"), "the empty state is not shown while a lord exists");
});

test("home keeps the explicit empty state when the tree holds no lords", () => {
  const text = vnodeText(HomeView({ tree: { lords: [] } }));

  assert.ok(text.includes("NO GUIDES YET"), "the empty state names that no guides exist yet");
});

test("lord page renders shared fundamentals and all three routes with the unresearched marker", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const text = vnodeText(LordView({ lord: lord.value }));

  // shared-fundamentals markdown, rendered once at boot and cached in the tree
  assert.ok(text.includes("Grey Lady of Nuln"), "shared fundamentals prose is rendered");

  // the four atlas shared blocks render as H2 sections on the committed lord
  // page, in atlas order (opening → smart → budget → equipment)
  const sharedSections = [
    "The common foundation",
    "Autoresolve the operation, not just the battle",
    "Build to a next operation",
    "Give equipment a job",
  ];
  for (let i = 0; i < sharedSections.length; i++) {
    const title = sharedSections[i] as string;
    assert.ok(text.includes(title), `the "${title}" shared section title renders`);
    if (i > 0) {
      assert.ok(
        text.indexOf(sharedSections[i - 1] as string) < text.indexOf(title),
        `the "${title}" shared section follows "${sharedSections[i - 1] as string}" in atlas order`,
      );
    }
  }

  // route list: numbers I/II/III, thematic subtitles, objective lines
  assert.ok(/\bI\b/.test(text) && /\bII\b/.test(text) && /\bIII\b/.test(text), "route numbers I, II and III are listed");
  assert.ok(text.includes("The Graveyard Watch"), "route I subtitle");
  assert.ok(text.includes("The Southern Charter"), "route II subtitle");
  assert.ok(text.includes("Fozzrik’s Legacy"), "route III subtitle");
  assert.ok(text.includes("Defeat the five listed factions and win 35 battles."), "route I objective line");
  assert.ok(
    text.includes("Control seven specified southern provinces, directly or through qualifying diplomacy."),
    "route II objective line",
  );
  assert.ok(
    text.includes("Search the published Badlands candidate settlements for Fozzrik’s Flying Fortress through conquest or diplomacy."),
    "route III objective line",
  );

  // every committed vcoTitle is null ⇒ exactly three explicit unresearched markers
  assert.equal(countOccurrences(text, "UNRESEARCHED"), 3, "one marker per unresearched route");

  // the lord page carries the same mono label style version context as the card
  assert.ok(text.includes("patch 9.0 · VCO 2026.09.30.1"), "version context on the lord page");
});

test("route page identity card: badged claims, notes, distinct title classes, and the committed VCO undercard", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);
  const view = RouteView({ lord: lord.value, route: route.value });
  const text = vnodeText(view);
  const nodes = recordVNodes(view);

  // identity card: number eyebrow, thematic subtitle, explicit unresearched marker
  assert.ok(text.includes("ROUTE I"), "route number eyebrow");
  assert.ok(text.includes("The Graveyard Watch"), "thematic subtitle");
  assert.ok(
    text.includes("UNRESEARCHED — no official VCO title recorded"),
    "the null vcoTitle slot is explicitly marked unresearched",
  );

  // objective and reward claims verbatim from the committed frontmatter, each
  // rendered as a Confidence Badge: mono uppercase label + state colour class
  // + the resolved source link
  assert.ok(text.includes("Defeat the five listed factions and win 35 battles."), "objective claim text");
  assert.ok(text.includes("give her army movement after battle"), "reward claim text");
  const claims = badgeVNodes(view);
  assert.equal(
    claims.length,
    8,
    "objective + reward claims and the six route-1 vco items are the Confidence Badged rows",
  );
  // The identity card renders its two claim badges before the undercard rows
  // (RouteView composes identityCard then vcoUndercard), so the first two badges
  // are exactly the objective/reward claims and keep their identity anatomy.
  for (const claim of claims.slice(0, 2)) {
    const badge = recordVNodes(expandBadge(claim));
    assert.ok(
      badge.some((n) => String(n.props.className).includes("confidence-badge--verify-in-campaign")),
      "each claim badge carries its state colour class",
    );
    const label = badge.find((n) => n.props.className === "confidence-badge__label");
    assert.equal(label?.children[0], "VERIFY", "the mono uppercase state label renders");
    const link = badge.find((n) => n.tag === "a" && n.props.className === "confidence-badge__src");
    assert.ok(link !== undefined, "the src-carrying claim trails a source link");
    assert.equal(
      link.props.href,
      "https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084",
      "the src id resolves to the committed source url",
    );
    assert.ok(String(link.children[0]).includes("VCO • author"), "…with the committed source title");
  }

  // official title and thematic subtitle stay distinct elements and classes —
  // never interchangeable (DESIGN §4)
  const official = nodes.find((n) => n.props.className === "route-identity__vco route-identity__vco--unresearched");
  const subtitle = nodes.find((n) => n.props.className === "route-identity__title");
  assert.ok(official !== undefined && official.tag === "p", "the official-title slot is its own element");
  assert.ok(subtitle !== undefined && subtitle.tag === "h1", "the thematic subtitle is its own headline element");
  assert.notEqual(official.props.className, subtitle.props.className, "official title and subtitle use distinct classes");

  // notes: interpretation, bottleneck and motto all render when present
  assert.ok(
    text.includes("Elspeth goes where the next dangerous enemy is"),
    "the interpretation note renders when present",
  );
  assert.ok(
    text.includes("Finishing the last surviving faction, not simply winning its first battle"),
    "the bottleneck note renders when present",
  );
  assert.ok(text.includes("Protect Nuln. Break the predators. Let the dead rest."), "the motto note renders when present");

  // the VCO undercard: the committed route-1 entry renders the mono eyebrow and
  // its six rows — the five atlas targets plus the 35-battle item — under the
  // identity card (per-item badge anatomy over all three committed routes is
  // asserted by the undercard test below)
  assert.ok(text.includes("VCO OBJECTIVES"), "the undercard's mono eyebrow renders on the committed tree");
  assert.ok(text.includes("battles-35"), "the 35-battle item's stable F5 id renders");
  assert.ok(text.includes("Win 35 battles"), "the 35-battle item's atlas-derived text renders");

  // body: the migrated Route I renders all eight registry sections in order —
  // the four required first, then the optionals and the two transitions —
  // with the atlas's wording and NO in-flow Content Gap markers anywhere
  assert.equal(countOccurrences(text, "CONTENT GAP"), 0, "no Content Gap marker remains on the migrated Route I");
  const sectionOrder = [
    "Opening",
    "Early → Mid",
    "Mid → Late",
    "Victory push",
    "Territory policy",
    "Diplomacy",
    "Transition → route-2",
    "Transition → route-3",
  ];
  for (let i = 0; i < sectionOrder.length; i++) {
    const title = sectionOrder[i] as string;
    assert.ok(text.includes(title), `the "${title}" section heading renders`);
    if (i > 0) {
      assert.ok(
        text.indexOf(sectionOrder[i - 1] as string) < text.indexOf(title),
        `the "${title}" section follows "${sectionOrder[i - 1] as string}" in registry order`,
      );
    }
  }
  assert.ok(text.indexOf("ROUTE I") < text.indexOf("Opening"), "the body runs in-flow after the identity card, not in a trailing list");
  // the atlas phase/transition wording is present — a real section, not a marker
  assert.ok(text.includes("Give Nuln breathing room"), "the Opening phase title renders as the bold-lead prose");
  assert.ok(
    text.includes("Win the starting war without creating three additional fronts."),
    "the Opening aim reads as the lead sentence",
  );
  assert.ok(
    text.includes("The finished hunt is not a reason to annex every search site."),
    "the Transition → route-3 prose renders",
  );
  assert.ok(!text.includes("This route has no sections yet."), "the F1 empty-body fallback is gone");
  assert.ok(!text.includes("Content gaps"), "the F1 trailing gap-list heading is gone");
  assert.ok(
    !nodes.some((n) => String(n.props.className ?? "").includes("gap-list")),
    "no gap-list container wraps the markers",
  );
});

test("a mixed route renders present sections interleaved with gap markers at registry positions", async () => {
  await inContentCopy(
    async (root) => {
      // every committed route is now fully migrated, so the "present or
      // declared" mix the lint treats as a valid route document is proven by
      // demanding a live gap from a migrated route: the copy removes one
      // committed section (Diplomacy) and declares it in gaps. The walk must
      // then render the lone marker at the Diplomacy registry slot while every
      // other section still renders its written atlas content.
      const routeThree = await readFile(join(root, "elspeth-von-draken/routes/route-3.md"), "utf8");
      const mixed = routeThree
        .replace("  - Transition → route-1\n", "  - Diplomacy\n  - Transition → route-1\n")
        .replace(/## Diplomacy\n\n[\s\S]*?(?=\n## Transition → route-1)/, "");
      await writeFile(join(root, "elspeth-von-draken/routes/route-3.md"), mixed);
    },
    async (root) => {
      assert.deepEqual(await lintContent(fsReader(root)), [], "the mixed copy is valid per the shared lint");

      const tree = await loadContentTree(fsReader(root));
      const lord = getLord(tree, "elspeth-von-draken");
      assert.ok(lord.found);
      const route = getRoute(tree, "elspeth-von-draken", "route-3");
      assert.ok(route.found);
      const view = RouteView({ lord: lord.value, route: route.value });
      const nodes = recordVNodes(view);
      const text = vnodeText(view);

      const markerFor = (title: string): string => `"${title}" is a declared gap — it has not been written yet.`;
      const marker = markerFor("Diplomacy");

      // the present sections render their written atlas bodies at their
      // registry positions and keep their scroll anchors
      assert.ok(
        text.includes("Secure the departure base and the research company."),
        "the present Opening section renders its written body",
      );
      assert.ok(
        text.includes("Stop searching when the mission says the search is finished."),
        "the present Mid → Late section renders its written body",
      );
      assert.ok(
        nodes.some((n) => typeof n.props["data-section-id"] === "string"),
        "the present sections keep their data-section-id anchors for the router",
      );

      // the declared gap renders exactly its marker at the Diplomacy registry
      // slot: after the Victory push section, before the Transition → route-1
      // section — the walk interleaves the marker with the present sections
      const victoryPush = "Route III victory confirmed; surviving armies and footholds have a deliberate next assignment.";
      assert.ok(
        text.indexOf(victoryPush) < text.indexOf(marker),
        "the Diplomacy marker follows the Victory push section in registry order",
      );
      assert.ok(
        text.indexOf(marker) < text.indexOf("Transition → route-1"),
        "the Diplomacy marker sits before the Transition → route-1 section in registry order",
      );
      assert.equal(
        countOccurrences(text, "CONTENT GAP"),
        1,
        "exactly the one declared gap renders its marker, interleaved with the present sections",
      );
      assert.ok(!text.includes("This route has no sections yet."), "no empty-body fallback when a section is present");
      assert.ok(!text.includes("Content gaps"), "no trailing gap-list heading on the mixed route");
    },
  );
});

test("the fixture route renders the VCO undercard beneath the identity with per-item badges and src links", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const lord = getLord(tree, "als-rhyn-of-lorek");
  assert.ok(lord.found);
  const route = getRoute(tree, "als-rhyn-of-lorek", "dark-conduits");
  assert.ok(route.found);
  const view = RouteView({ lord: lord.value, route: route.value });
  const text = vnodeText(view);

  // the fixture identity also renders its notes when present
  assert.ok(text.includes("Dust and bone are patient."), "motto renders when present");
  assert.ok(
    text.includes("Early growth stalls without the Book of the Dead economy."),
    "bottleneck renders when present",
  );
  assert.ok(
    text.includes("Conduit towns make the opener a race against the first doomstack."),
    "interpretation renders when present",
  );

  // the undercard: mono eyebrow + one row per item with the id, text and badge
  assert.ok(text.includes("VCO OBJECTIVES"), "the undercard's mono eyebrow");
  assert.ok(text.includes("obj-conduits"), "the first stable objective id");
  assert.ok(text.includes("Secure all three southeast dark conduit settlements."), "the first item's text");
  assert.ok(text.includes("obj-casket"), "the second stable objective id");
  assert.ok(text.includes("Unlock the Casket of Souls quest chain."), "the second item's text");

  // every vco item is a Confidence Badge-carrying row: the fixture's two items
  // render alongside the two identity claims, with per-item labels + state
  // colour classes + resolved source links
  const badges = badgeVNodes(view);
  assert.equal(badges.length, 4, "objective + reward claims and both vco items are Confidence Badged");
  const flat = badgeText(view);
  assert.ok(flat.includes("CONFIRMED"), "the confirmed item renders its mono uppercase label");
  assert.ok(flat.includes("HISTORICAL"), "the historical item renders its mono uppercase label");
  const stateClasses = badges.map((n) => String(n.props.state)).sort();
  assert.deepEqual(
    stateClasses,
    ["confirmed", "confirmed", "historical", "historical"],
    "each row's badge carries its own state colour class (claims + items)",
  );
  const srcLinks = badges.flatMap((n) =>
    recordVNodes(expandBadge(n)).filter((m) => m.tag === "a" && m.props.className === "confidence-badge__src"),
  );
  assert.equal(srcLinks.length, 4, "each src-carrying claim and item trails its resolved source link");
  assert.equal(
    srcLinks.filter((l) => l.props.href === "https://example.test/vco-guide").length,
    2,
    "vco-guide resolves for the objective claim and obj-conduits",
  );
  assert.equal(
    srcLinks.filter((l) => l.props.href === "https://example.test/casket").length,
    2,
    "ca resolves for the reward claim and obj-casket",
  );
});

test("every committed route renders the VCO undercard with its item counts and per-item badge anatomy", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);

  // DESIGN §7 acceptance numbers: route-1 6 (five targets + 35 battles), route-2
  // 7 provinces, route-3 20 candidates; every item badge carries its own state
  // colour class and every committed vco item resolves to the vco-guide source
  const expectations: Array<
    [routeId: string, itemCount: number, itemStates: string[], probeId: string, probeText: string]
  > = [
    [
      "route-1",
      6,
      ["confirmed", "confirmed", "confirmed", "verify-in-campaign", "verify-in-campaign", "verify-in-campaign"],
      "battles-35",
      "Win 35 battles",
    ],
    ["route-2", 7, Array(7).fill("confirmed"), "pirates-current", "Pirate’s Current"],
    ["route-3", 20, Array(20).fill("confirmed"), "valays-sorrow", "Valaya’s Sorrow"],
  ];
  for (const [routeId, itemCount, itemStates, probeId, probeText] of expectations) {
    const route = getRoute(tree, "elspeth-von-draken", routeId);
    assert.ok(route.found);
    const view = RouteView({ lord: lord.value, route: route.value });
    const text = vnodeText(view);

    // the undercard renders on every committed route: mono eyebrow plus one row
    // per item carrying the stable id and the atlas text
    assert.ok(text.includes("VCO OBJECTIVES"), `${routeId} renders the undercard's mono eyebrow`);
    assert.ok(text.includes(probeId), `${routeId} renders the "${probeId}" item id`);
    assert.ok(text.includes(probeText), `${routeId} renders the "${probeId}" item text verbatim`);

    // badge anatomy: objective + reward claims and every vco item are
    // Confidence Badged with their own state colour classes, mono uppercase
    // labels and one resolved source link each
    const badges = badgeVNodes(view);
    assert.equal(
      badges.length,
      2 + itemCount,
      `${routeId} the two identity claims plus its ${itemCount} vco items are Confidence Badged`,
    );
    const stateClasses = badges.map((n) => String(n.props.state)).sort();
    assert.deepEqual(
      stateClasses,
      [...itemStates, "verify-in-campaign", "verify-in-campaign"].sort(),
      `${routeId} each row's badge carries its own state colour class (claims + items)`,
    );
    const flat = badgeText(view);
    assert.ok(flat.includes("CONFIRMED"), `${routeId} the confirmed items render their mono uppercase label`);
    if (itemStates.includes("verify-in-campaign")) {
      assert.ok(flat.includes("VERIFY"), `${routeId} the verify-in-campaign items render their mono uppercase label`);
    }
    const srcLinks = badges.flatMap((n) =>
      recordVNodes(expandBadge(n)).filter((m) => m.tag === "a" && m.props.className === "confidence-badge__src"),
    );
    assert.equal(
      srcLinks.length,
      2 + itemCount,
      `${routeId} each src-carrying claim and item trails its resolved source link`,
    );
    assert.ok(
      srcLinks.every((l) => l.props.href === "https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084"),
      `${routeId} every committed claim and item resolves to the vco-guide url`,
    );
  }
});

test("the query helpers are pure lord-scoped reads: typed objectives, empty/absent results, unknown src ids dropped", async () => {
  const fixtures = await loadContentTree(fsReader(FIXTURES));
  const committed = await loadContentTree(fsReader(CONTENT));
  const als = getLord(fixtures, "als-rhyn-of-lorek");
  const second = getLord(fixtures, "second-lord");
  const elspeth = getLord(committed, "elspeth-von-draken");
  assert.ok(als.found && second.found && elspeth.found);

  // a present route entry returns the typed VcoItem[] in file order
  const objectives = getVcoObjectives(als.value, "dark-conduits");
  assert.deepEqual(
    objectives.map((o) => ({ id: o.id, text: o.text, state: o.state, src: o.src })),
    [
      { id: "obj-conduits", text: "Secure all three southeast dark conduit settlements.", state: "confirmed", src: ["vco-guide"] },
      { id: "obj-casket", text: "Unlock the Casket of Souls quest chain.", state: "historical", src: ["ca"] },
    ],
    "typed objective items with their state and src ids",
  );

  // absent entry / absent dataset are empty lists; the committed entry now
  // yields its typed items instead of the old empty {} form
  assert.deepEqual(getVcoObjectives(als.value, "ghost-route"), [], "unknown route id → empty list");
  assert.deepEqual(getVcoObjectives(second.value, "lone-route"), [], "a lord without a vco dataset → empty list");
  const routeOne = getVcoObjectives(elspeth.value, "route-1");
  assert.equal(routeOne.length, 6, "the committed route-1 vco entry yields its six typed items");
  assert.equal(routeOne[0]?.id, "sylvania", "…starting with the atlas's own first target id");
  assert.equal(routeOne[5]?.id, "battles-35", "…and ending with the 35-battle item");

  // resolveSources: known ids in order, unknown ids dropped, never throws
  assert.deepEqual(
    resolveSources(als.value, ["vco-guide", "ghost", "ca"]).map((s) => s.id),
    ["vco-guide", "ca"],
    "known src ids resolve in order; unknown ids are dropped",
  );
  assert.deepEqual(resolveSources(als.value, ["ghost"]), [], "all-unknown ids → empty, no throw");
  assert.deepEqual(resolveSources(als.value, []), [], "no ids → empty");
});

test("getPanelEntries resolves each panel group in panelOrder order, omitting unlisted and unknown ids", () => {
  const army = (id: string): Army => ({
    label: id,
    name: id,
    units: [],
    legendary: [],
    generic: [],
    notes: [],
    plan: [],
    size: 1,
    sources: [],
  });
  const item = (id: string): Item => ({
    label: id,
    title: id,
    intro: id,
    steps: [],
    sources: [],
  });
  const lord: Lord = {
    slug: "sample",
    guide: {
      id: "sample",
      lord: "Sample",
      faction: "Faction",
      version: { patch: "1", vco: "1", checked: "2026-01-01" },
      routes: [],
      shared: "shared.md",
      datasets: ["armies", "skills", "research", "buildings", "mechanics"],
    },
    sharedHtml: "",
    routes: [],
    datasets: [
      {
        name: "armies",
        value: { "route-a": { a1: army("a1"), a2: army("a2"), a3: army("a3"), a4: army("a4") } },
      },
      { name: "skills", value: { s1: item("s1"), s2: item("s2"), s3: item("s3") } },
      { name: "research", value: { r1: item("r1") } },
      { name: "buildings", value: { b1: item("b1") } },
      { name: "mechanics", value: {} },
    ],
  };
  const route: Route = {
    id: "route-a",
    number: "I",
    name: "Router",
    vcoTitle: null,
    objective: { text: "", state: "confirmed", src: [] },
    reward: { text: "", state: "confirmed", src: [] },
    gaps: [],
    sections: [],
    claims: [],
    panelOrder: {
      // re-ordered with an unknown id interleaved; a3 exists but is unlisted
      armies: ["a2", "ghost-army", "a4", "a1"],
      // s1 exists but is unlisted
      skills: ["s2", "s3"],
      // an empty list
      research: [],
      // every id unknown
      buildings: ["ghost-item"],
      // mechanics key absent
    },
  };

  const entries = getPanelEntries(lord, route);

  assert.deepEqual(
    entries.armies.map((a) => a.label),
    ["a2", "a4", "a1"],
    "armies resolve in panelOrder order against the route's own armies map; unknown ids omitted; unlisted entries not rendered",
  );
  assert.deepEqual(
    entries.skills.map((i) => i.label),
    ["s2", "s3"],
    "skills resolve in panelOrder order from the lord-wide item dataset",
  );
  assert.deepEqual(entries.research, [], "an empty panelOrder list stays empty");
  assert.deepEqual(entries.buildings, [], "all-unknown ids resolve to nothing, never a throw");
  assert.deepEqual(entries.mechanics, [], "an absent panelOrder group key resolves to the empty list");

  // pure and mutation-free: a second call yields the same result and leaves the route untouched
  assert.deepEqual(
    getPanelEntries(lord, route).armies.map((a) => a.label),
    ["a2", "a4", "a1"],
    "repeated calls return equal results",
  );
  assert.deepEqual(
    route.panelOrder?.armies,
    ["a2", "ghost-army", "a4", "a1"],
    "the route's panelOrder is not mutated",
  );
});

test("a route without notes renders the identity card without them and no undercard", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const second = getLord(tree, "second-lord");
  assert.ok(second.found);
  const route = getRoute(tree, "second-lord", "lone-route");
  assert.ok(route.found);
  const view = RouteView({ lord: second.value, route: route.value });
  const text = vnodeText(view);

  // the researched-title branch of the identity card, with no notes and no
  // vco dataset: the undercard leaves no trace
  assert.ok(text.includes("ROUTE II"), "the identity card still renders");
  assert.ok(text.includes("Sun-Priest of the Lost"), "a researched vcoTitle renders as the official title");
  assert.ok(!text.includes("Interpretation"), "no interpretation note when absent");
  assert.ok(!text.includes("Bottleneck"), "no bottleneck note when absent");
  assert.ok(!text.includes("Motto"), "no motto note when absent");
  assert.ok(!text.includes("VCO OBJECTIVES"), "second-lord has no vco dataset → no undercard");
});

test("the lord page mounts the route tab strip over the committed tree with Shared active", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const { props, tabs, text } = mountedTabStrip(LordView({ lord: lord.value }));

  assert.equal(props.activeId, "shared", "the lord page derives the Shared tab as active");
  assert.equal(props.lordSlug, "elspeth-von-draken");
  assert.deepEqual(
    tabs.map((t) => t.props.href),
    [
      "#/elspeth-von-draken",
      "#/elspeth-von-draken/route/route-1",
      "#/elspeth-von-draken/route/route-2",
      "#/elspeth-von-draken/route/route-3",
    ],
    "the strip links the existing hash routes in manifest order; Shared links the lord page",
  );
  assert.ok(text.includes("SHARED"), "the strip carries the Shared tab over the committed tree");
  assert.ok(text.includes("I The Graveyard Watch"), "…and route I");
  assert.ok(text.includes("II The Southern Charter"), "…and route II");
  assert.ok(text.includes("III Fozzrik’s Legacy"), "…and route III");
  assert.ok(text.indexOf("SHARED") < text.indexOf("I The Graveyard Watch"), "Shared first, then routes in manifest order");
  assert.equal(tabs[0].props.tabIndex, 0, "the Shared-derived active tab is tabbable");
  assert.equal(tabs[0].props["aria-selected"], true, "…and is the selected tab");
  assert.ok(tabs.slice(1).every((t) => t.props.tabIndex === -1), "route tabs rove at −1 on the lord page");
});

/**
 * The dashboard exactly as the view mounts it: the `Dashboard` VNode's props
 * and key at the view seam, then the same props expanded through the pure
 * `DashboardMarkup` builder at the component seam — the zero-DOM equivalent
 * of letting the view's child component render (the mounted wrapper's local
 * selection and focus effect only run under a real preact render).
 */
function mountedDashboard(view: unknown, activeIndex = 0): { key: unknown; markup: VNodeRecord[]; text: string } {
  const nodes = recordVNodes(view);
  const dashboard = nodes.find((n) => Array.isArray(n.props.armies));
  assert.ok(dashboard !== undefined, "the route view mounts the dashboard region");
  const lord = dashboard.props.lord as Lord;
  const props: PanelEntries = {
    armies: dashboard.props.armies as readonly Army[],
    skills: dashboard.props.skills as readonly Item[],
    research: dashboard.props.research as readonly Item[],
    buildings: dashboard.props.buildings as readonly Item[],
    mechanics: dashboard.props.mechanics as readonly Item[],
  };
  const markup = DashboardMarkup({ lord, ...props, activeIndex });
  return { key: dashboard.key, markup: recordVNodes(markup), text: vnodeText(markup) };
}

test("the route view mounts the dashboard after the sections with five tabs in DESIGN order and Route I's resolved panels", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const view = RouteView({ lord: lord.value, route: route.value });
  const { key, markup, text } = mountedDashboard(view);
  assert.equal(
    key,
    "route-1",
    "the dashboard is keyed by route id so navigating between routes remounts it and resets selection",
  );

  // five tabs in the DESIGN's panel order — the dashboard renders as one block after the sections
  const tabs = markup.filter((n) => n.props.role === "tab");
  assert.equal(tabs.length, PANEL_GROUPS.length, "exactly five fixed tabs over the committed tree");
  assert.deepEqual(
    tabs.map((t) => t.children[0]),
    ["ARMY TEMPLATES", "SKILLS", "RESEARCH", "SETTLEMENTS", "MECHANICS"],
    "tab labels follow the DESIGN's panel order",
  );

  // the route view text carries the migrated section content; the dashboard
  // markup (mounted after the sections, keyed by route id) opens with its tab
  // bar — and no Content Gap marker remains on Route I
  const fullText = vnodeText(view);
  assert.ok(fullText.includes("Give Nuln breathing room"), "the section region renders its Opening content in the route view");
  assert.equal(text.indexOf("ARMY TEMPLATES"), 0, "the dashboard markup opens with its tab bar, mounted after the sections");
  assert.equal(countOccurrences(fullText, "CONTENT GAP"), 0, "no gap marker anywhere on the migrated Route I");

  // the committed tree: each of the five panels renders its resolved Route I
  // entries — never the empty state, never blank space
  const panels = markup.filter((n) => n.props.role === "tabpanel");
  const emptyLabels = [
    "NO ARMY TEMPLATES YET",
    "NO SKILLS YET",
    "NO RESEARCH YET",
    "NO SETTLEMENTS YET",
    "NO MECHANICS YET",
  ];
  for (let index = 0; index < panels.length; index++) {
    const panelText = vnodeText(panels[index]);
    assert.ok(
      !panelText.includes(emptyLabels[index] as string),
      `panel ${index} is not in its empty state; got: "${panelText.slice(0, 80)}"`,
    );
    assert.ok(panelText.trim().length > 0, `panel ${index} is never blank space`);
  }
  // per-panel resolved entry counts (the atlas's Route I panel lists)
  const entryCount = (panelId: string): number =>
    recordVNodes(panels.filter((p) => p.props.id === panelId)[0]).filter(
      (n) => n.tag === "article" && String(n.props.className).includes("panel-entry"),
    ).length;
  const expectedCounts: Record<string, number> = { armies: 5, skills: 10, research: 4, buildings: 6, mechanics: 5 };
  for (const [group, count] of Object.entries(expectedCounts)) {
    assert.equal(entryCount(`dashboard-panel-${group}`), count, `the ${group} panel shows its ${count} resolved entries`);
  }
});

test("the route view renders Route II's eight sections, its override research and six settlement roles, with the seven-item undercard", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-2");
  assert.ok(route.found);

  const view = RouteView({ lord: lord.value, route: route.value });
  const { key, markup } = mountedDashboard(view);
  const fullText = vnodeText(view);
  assert.equal(key, "route-2", "the dashboard is keyed by route id so navigating between routes remounts it");

  // identity card unchanged by the body migration: numeric eyebrow, thematic
  // subtitle, the explicit unresearched marker, and the badged claims/notes
  assert.ok(fullText.includes("ROUTE II"), "route number eyebrow");
  assert.ok(fullText.includes("The Southern Charter"), "thematic subtitle");
  assert.ok(
    fullText.includes("UNRESEARCHED — no official VCO title recorded"),
    "the null vcoTitle slot is explicitly marked unresearched",
  );
  assert.ok(
    fullText.includes("Control seven specified southern provinces, directly or through qualifying diplomacy."),
    "objective claim text verbatim",
  );
  assert.ok(
    fullText.includes("Elspeth’s engineers and escorts build a durable southern sphere of influence"),
    "the interpretation note renders",
  );
  assert.ok(
    fullText.includes("Maintained control of every region in the required provinces"),
    "the bottleneck note renders",
  );
  assert.ok(fullText.includes("Fund the expedition. Secure the ports. Make the charter hold."), "the motto note renders");

  // the body renders the eight registry sections in order — the two
  // transition sections included — with the atlas's wording and NO Content
  // Gap markers anywhere on the migrated Route II
  assert.equal(countOccurrences(fullText, "CONTENT GAP"), 0, "no gap marker anywhere on the migrated Route II");
  const sectionOrder = [
    "Opening",
    "Early → Mid",
    "Mid → Late",
    "Victory push",
    "Territory policy",
    "Diplomacy",
    "Transition → route-1",
    "Transition → route-3",
  ];
  for (let i = 0; i < sectionOrder.length; i++) {
    const title = sectionOrder[i] as string;
    assert.ok(fullText.includes(title), `the "${title}" section heading renders`);
    if (i > 0) {
      assert.ok(
        fullText.indexOf(sectionOrder[i - 1] as string) < fullText.indexOf(title),
        `the "${title}" section follows "${sectionOrder[i - 1] as string}" in registry order`,
      );
    }
  }
  assert.ok(fullText.includes("Make the departure affordable"), "the Opening phase title renders as the bold-lead prose");
  assert.ok(
    fullText.includes("Build a homeland that survives Elspeth’s absence."),
    "the Opening aim reads as the lead sentence",
  );
  assert.ok(
    fullText.includes("Your earlier victories may already help the 35-battle requirement; trust the live count."),
    "the Transition → route-1 prose renders verbatim",
  );
  assert.ok(
    fullText.includes("Diplomatic provincial control and a successful search interaction are not automatically the same event."),
    "the Transition → route-3 prose renders verbatim",
  );
  assert.ok(!fullText.includes("This route has no sections yet."), "the F1 empty-body fallback is gone");

  // the VCO undercard renders its seven Route II items under the identity
  assert.ok(fullText.includes("VCO OBJECTIVES"), "the undercard's mono eyebrow renders");
  assert.ok(fullText.includes("pirates-current"), "the Route II item id renders");
  assert.ok(fullText.includes("Pirate’s Current"), "the Route II item text renders verbatim");

  // the five panels resolve Route II's atlas lists — never the empty state
  const panels = markup.filter((n) => n.props.role === "tabpanel");
  const emptyLabels = [
    "NO ARMY TEMPLATES YET",
    "NO SKILLS YET",
    "NO RESEARCH YET",
    "NO SETTLEMENTS YET",
    "NO MECHANICS YET",
  ];
  for (let index = 0; index < panels.length; index++) {
    const panelText = vnodeText(panels[index]);
    assert.ok(
      !panelText.includes(emptyLabels[index] as string),
      `panel ${index} is not in its empty state on Route II; got: "${panelText.slice(0, 80)}"`,
    );
    assert.ok(panelText.trim().length > 0, `panel ${index} is never blank space`);
  }
  const entryCount = (panelId: string): number =>
    recordVNodes(panels.filter((p) => p.props.id === panelId)[0]).filter(
      (n) => n.tag === "article" && String(n.props.className).includes("panel-entry"),
    ).length;
  const expectedCounts: Record<string, number> = { armies: 5, skills: 10, research: 4, buildings: 6, mechanics: 5 };
  for (const [group, count] of Object.entries(expectedCounts)) {
    assert.equal(entryCount(`dashboard-panel-${group}`), count, `the ${group} panel shows its ${count} resolved entries`);
  }

  // research resolves the two `route-2-*` override entries in the atlas's own
  // positions (the base `opening`/`economy` groups are Route I's and absent
  // here); buildings shows exactly Route II's six settlement roles
  const researchText = vnodeText(panels.filter((p) => p.props.id === "dashboard-panel-research")[0]);
  assert.ok(
    researchText.includes("Prepare a long southern campaign"),
    "research resolves the route-2-opening override first",
  );
  assert.ok(
    researchText.includes("Support a durable southern sphere"),
    "research resolves the route-2-economy override in the owning route",
  );
  assert.ok(!researchText.includes("A working army before luxury research"), "the base opening group is Route I's, not restated here");
  assert.ok(
    !researchText.includes("Build the next theatre, not empty infrastructure"),
    "the base economy group is Route I's, not restated here",
  );
  const researchEntries = recordVNodes(panels.filter((p) => p.props.id === "dashboard-panel-research")[0])
    .filter((n) => n.tag === "article" && String(n.props.className).includes("panel-entry"))
    .map((n) => vnodeText(n));
  assert.ok(
    researchEntries[0]?.includes("Prepare a long southern campaign") &&
      researchEntries[1]?.includes("Infantry, artillery and the escort") &&
      researchEntries[2]?.includes("Support a durable southern sphere") &&
      researchEntries[3]?.includes("Magic, machines and the Garden network"),
    "research entries render in the atlas's Route II order: override, firepower, override, arcane",
  );
  const buildingsText = vnodeText(panels.filter((p) => p.props.id === "dashboard-panel-buildings")[0]);
  for (const probe of [
    "Southern charter capital · a second production centre",
    "Resource or valuable landmark settlement",
    "Safe income town",
    "A settlement that guards a real approach",
    "Expedition capture / future handover",
  ]) {
    assert.ok(buildingsText.includes(probe), `buildings resolves the "${probe}" role on Route II`);
  }
});

test("the route view renders Route III's eight sections, its override research and six settlement roles, with the twenty-item undercard", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-3");
  assert.ok(route.found);

  const view = RouteView({ lord: lord.value, route: route.value });
  const { key, markup } = mountedDashboard(view);
  const fullText = vnodeText(view);
  assert.equal(key, "route-3", "the dashboard is keyed by route id so navigating between routes remounts it");

  // identity card unchanged by the body migration: numeric eyebrow, thematic
  // subtitle, the explicit unresearched marker, and the badged claims/notes
  assert.ok(fullText.includes("ROUTE III"), "route number eyebrow");
  assert.ok(fullText.includes("Fozzrik’s Legacy"), "thematic subtitle");
  assert.ok(
    fullText.includes("UNRESEARCHED — no official VCO title recorded"),
    "the null vcoTitle slot is explicitly marked unresearched",
  );
  assert.ok(
    fullText.includes("Search the published Badlands candidate settlements for Fozzrik’s Flying Fortress through conquest or diplomacy."),
    "objective claim text verbatim",
  );
  assert.ok(
    fullText.includes("A travelling field laboratory rather than a map-painting crusade"),
    "the interpretation note renders",
  );
  assert.ok(
    fullText.includes("Finding the mission’s actual search result while sustaining a distant army"),
    "the bottleneck note renders",
  );
  assert.ok(
    fullText.includes("Follow the clues. Protect the field laboratory. Find the fortress."),
    "the motto note renders",
  );

  // the body renders the eight registry sections in order — the two
  // transition sections included — with the atlas's wording and NO Content
  // Gap markers anywhere on the migrated Route III
  assert.equal(countOccurrences(fullText, "CONTENT GAP"), 0, "no gap marker anywhere on the migrated Route III");
  const sectionOrder = [
    "Opening",
    "Early → Mid",
    "Mid → Late",
    "Victory push",
    "Territory policy",
    "Diplomacy",
    "Transition → route-1",
    "Transition → route-2",
  ];
  for (let i = 0; i < sectionOrder.length; i++) {
    const title = sectionOrder[i] as string;
    assert.ok(fullText.includes(title), `the "${title}" section heading renders`);
    if (i > 0) {
      assert.ok(
        fullText.indexOf(sectionOrder[i - 1] as string) < fullText.indexOf(title),
        `the "${title}" section follows "${sectionOrder[i - 1] as string}" in registry order`,
      );
    }
  }
  assert.ok(
    fullText.includes("Prepare the expedition, not an entire Empire reconquest"),
    "the Opening phase title renders as the bold-lead prose",
  );
  assert.ok(
    fullText.includes("Secure the departure base and the research company."),
    "the Opening aim reads as the lead sentence",
  );
  assert.ok(
    fullText.includes("Do not dismantle the expedition before a safe return is arranged."),
    "the Transition → route-1 prose renders verbatim",
  );
  assert.ok(
    fullText.includes("Promote the best foothold to a permanent Charter hub"),
    "the Transition → route-2 prose renders verbatim",
  );
  assert.ok(!fullText.includes("This route has no sections yet."), "the F1 empty-body fallback is gone");

  // the VCO undercard renders its twenty Route III items under the identity
  // (the full per-item badge anatomy + count over every committed route is the
  // undercard test's contract)
  assert.ok(fullText.includes("VCO OBJECTIVES"), "the undercard's mono eyebrow renders");
  assert.ok(fullText.includes("valays-sorrow"), "the Route III item id renders");
  assert.ok(fullText.includes("Valaya’s Sorrow"), "the Route III item text renders verbatim");

  // the five panels resolve Route III's atlas lists — never the empty state
  const panels = markup.filter((n) => n.props.role === "tabpanel");
  const emptyLabels = [
    "NO ARMY TEMPLATES YET",
    "NO SKILLS YET",
    "NO RESEARCH YET",
    "NO SETTLEMENTS YET",
    "NO MECHANICS YET",
  ];
  for (let index = 0; index < panels.length; index++) {
    const panelText = vnodeText(panels[index]);
    assert.ok(
      !panelText.includes(emptyLabels[index] as string),
      `panel ${index} is not in its empty state on Route III; got: "${panelText.slice(0, 80)}"`,
    );
    assert.ok(panelText.trim().length > 0, `panel ${index} is never blank space`);
  }
  const entryCount = (panelId: string): number =>
    recordVNodes(panels.filter((p) => p.props.id === panelId)[0]).filter(
      (n) => n.tag === "article" && String(n.props.className).includes("panel-entry"),
    ).length;
  const expectedCounts: Record<string, number> = { armies: 5, skills: 10, research: 4, buildings: 6, mechanics: 5 };
  for (const [group, count] of Object.entries(expectedCounts)) {
    assert.equal(entryCount(`dashboard-panel-${group}`), count, `the ${group} panel shows its ${count} resolved entries`);
  }

  // research resolves the two `route-3-*` override entries in the atlas's own
  // positions (the base `opening`/`arcane` groups are Route I's and absent
  // here); buildings shows exactly Route III's six settlement roles
  const researchText = vnodeText(panels.filter((p) => p.props.id === "dashboard-panel-research")[0]);
  assert.ok(
    researchText.includes("A durable survey column"),
    "research resolves the route-3-opening override first",
  );
  assert.ok(
    researchText.includes("The expedition’s practical research"),
    "research resolves the route-3-arcane override in the owning route",
  );
  assert.ok(!researchText.includes("A working army before luxury research"), "the base opening group is Route I's, not restated here");
  assert.ok(!researchText.includes("Magic, machines and the Garden network"), "the base arcane group is Route I's, not restated here");
  const researchEntries = recordVNodes(panels.filter((p) => p.props.id === "dashboard-panel-research")[0])
    .filter((n) => n.tag === "article" && String(n.props.className).includes("panel-entry"))
    .map((n) => vnodeText(n));
  assert.ok(
    researchEntries[0]?.includes("A durable survey column") &&
      researchEntries[1]?.includes("Infantry, artillery and the escort") &&
      researchEntries[2]?.includes("Build the next theatre, not empty infrastructure") &&
      researchEntries[3]?.includes("The expedition’s practical research"),
    "research entries render in the atlas's Route III order: override, firepower, economy, override",
  );
  const buildingsText = vnodeText(panels.filter((p) => p.props.id === "dashboard-panel-buildings")[0]);
  for (const probe of [
    "Nuln · foundry and field-test centre",
    "Survey foothold · an expedition service station",
    "Military support town · the missing profession",
    "Safe income town",
    "Provincial recovery and support base",
    "Expedition capture / future handover",
  ]) {
    assert.ok(buildingsText.includes(probe), `buildings resolves the "${probe}" role on Route III`);
  }
});

test("the dashboard keeps each route's own id as its key across route views", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);

  for (const routeId of ["route-1", "route-2", "route-3"]) {
    const route = getRoute(tree, "elspeth-von-draken", routeId);
    assert.ok(route.found);
    const view = RouteView({ lord: lord.value, route: route.value });
    const { key } = mountedDashboard(view);
    assert.equal(key, routeId, `the ${routeId} view keys the dashboard by its own route id`);
  }
});
test("the route page mounts the route tab strip with its own route tab active", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-2");
  assert.ok(route.found);
  const { props, tabs, text } = mountedTabStrip(RouteView({ lord: lord.value, route: route.value }));

  assert.equal(props.activeId, "route-2", "a route page derives its own route id as the active tab");
  assert.equal(props.lordSlug, "elspeth-von-draken");
  assert.ok(text.includes("SHARED"), "the strip sits over the committed route page");
  assert.ok(text.includes("II The Southern Charter"), "…carrying the committed routes");
  const active = tabs.find((t) => t.props.tabIndex === 0);
  assert.equal(
    active?.props.href,
    "#/elspeth-von-draken/route/route-2",
    "only the route-2 tab is tabbable",
  );
  assert.equal(active?.props["aria-selected"], true, "…and is the selected tab");
  assert.ok(
    tabs
      .filter((t) => t.props.href !== "#/elspeth-von-draken/route/route-2")
      .every((t) => t.props.tabIndex === -1 && t.props["aria-selected"] === false),
    "the other tabs rove at −1 and are not selected",
  );
});

test("the fixture route's dashboard renders the DESIGN §4 atlas anatomy with badges and source links", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const lord = getLord(tree, "als-rhyn-of-lorek");
  assert.ok(lord.found);
  const route = getRoute(tree, "als-rhyn-of-lorek", "dark-conduits");
  assert.ok(route.found);

  const view = RouteView({ lord: lord.value, route: route.value });
  const { key, markup, text } = mountedDashboard(view);
  assert.equal(key, "dark-conduits", "the fixture route keys the dashboard by its own route id");

  // armies panel: the two army entries, each a two-column unit table with
  // count/name/role/kind rows; the late army's empty generic column shows its
  // explicit absent marker exactly once — never blank space
  assert.ok(text.includes("Early") && text.includes("The Toll of the Silver Sand"), "the early army label + name");
  assert.ok(text.includes("The Dust Wardens"), "the early army renders its supporting-army name");
  assert.ok(text.includes("Late") && text.includes("The River Line Watch"), "the late army label + name");
  assert.ok(text.includes("×1") && text.includes("Tomb King on Warsphinx") && text.includes("Battle-line general"), "legendary row: count, name, role");
  assert.ok(text.includes("×3") && text.includes("Spearmen") && text.includes("Holding line") && text.includes("line"), "generic row: count, name, role, kind");
  assert.equal(text.split("NO UNITS LISTED").length - 1, 1, "exactly one absent generic column");
  assert.ok(text.includes("Size 2200") && text.includes("Size 900"), "each army declares its size");

  // the early army carries a state, so it renders a Confidence Badge; the
  // late army carries none, so the optional badge branch stays absent (the
  // badge span itself is proven by the confidence-badge package's tests)
  const badges = markup.filter((n) => typeof n.props.state === "string" && Array.isArray(n.props.sources));
  assert.equal(badges.length, 2, "both state-carrying entries (early army + conduit-rites skill) render badges");
  assert.ok(badges.some((n) => n.props.state === "inferred"), "the inferred early army badge");
  assert.ok(badges.some((n) => n.props.state === "confirmed"), "the confirmed conduit-rites skill badge");

  // skills panel: the listed item renders title/intro/steps/gate/short/details
  assert.ok(text.includes("Conduit Rites") && text.includes("Raise the conduit towns"), "the listed skill label + title");
  assert.ok(text.includes("Construction discounts before the first levy."), "the skill intro");
  assert.ok(text.includes("Conduit Silos") && text.includes("Two silos a town before turn ten."), "first step title + note");
  assert.ok(text.includes("Opening option"), "the first step's gate label");
  assert.ok(text.includes("Sealed Depot") && text.includes("Town per turn"), "the short-labelled step and the details label");
  assert.ok(text.includes("One conduit town ripens every four turns."), "the details row body");

  // the unlisted casket-rites entry appears in no panel
  assert.ok(!text.includes("Prepare the twin casket fleet"), "the unlisted skill's title is absent");
  assert.ok(!text.includes("The fleet sails only once the port is raised."), "the unlisted skill's intro is absent");

  // source ids resolve exactly like the identity card: each entry's src
  // becomes a trailing link via resolveSources over the lord's sources.json
  const hrefs = markup.filter((n) => typeof n.props.href === "string").map((n) => n.props.href);
  assert.ok(hrefs.includes("https://example.test/casket"), "the early army's ca source resolves");
  assert.ok(hrefs.includes("https://example.test/vco-guide"), "the listed skill's vco-guide source resolves");
});

/** The recorded VNode subtree of one route section by its tree id (scoped panel asserts). */
function sectionSubtree(view: unknown, sectionId: string): VNodeRecord[] {
  const nodes = recordVNodes(view);
  const section = nodes.find((n) => n.props["data-section-id"] === sectionId);
  assert.ok(section !== undefined, `the ${sectionId} section renders`);
  return recordVNodes(section);
}

test("source panels render under citing route sections with the source as a title link and its note", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const routeOne = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(routeOne.found);
  const viewOne = RouteView({ lord: lord.value, route: routeOne.value });

  const vcoGuideTitle = "VCO • author’s route objectives";
  const vcoGuideUrl = "https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084";
  const vcoGuideNote = "Primary author reference, labelled 25 September 2026 and rechecked 30 September";

  // route-1's Opening cites vco-guide (its `::claim inferred src=vco-guide`):
  // the panel renders inside that section, after the prose, with the fixed
  // SOURCE eyebrow and one entry per distinct source
  const opening = sectionSubtree(viewOne, "opening");
  const openingPanel = opening.find((n) => n.props.className === "source-panel");
  assert.ok(openingPanel !== undefined, "the citing Opening section renders the source panel");
  assert.ok(
    opening.some(
      (n) => n.tag === "p" && n.props.className === "source-panel__eyebrow" && n.children[0] === "SOURCE",
    ),
    "the fixed SOURCE mono eyebrow renders in the panel",
  );
  assert.equal(
    opening.filter((n) => n.props.className === "source-panel__entry").length,
    1,
    "one distinct cited source ⇒ one panel entry",
  );
  const openingTitleLink = opening.find((n) => n.tag === "a" && n.props.className === "source-panel__title");
  assert.equal(openingTitleLink?.props.href, vcoGuideUrl, "the source title links to its url");
  assert.equal(String(openingTitleLink?.children[0]), vcoGuideTitle, "the link text is the source title itself");
  const openingUrl = opening.find((n) => n.tag === "p" && n.props.className === "source-panel__url");
  assert.equal(String(openingUrl?.children[0]), vcoGuideUrl, "the panel lists the source url");
  const openingNote = opening.find((n) => n.tag === "p" && n.props.className === "source-panel__note");
  assert.ok(
    openingNote !== undefined && String(openingNote.children[0]).startsWith(vcoGuideNote),
    "the source note renders in the panel",
  );

  // a section with no callouts keeps its plain F2 anatomy: no panel markup
  // and no SOURCE text anywhere in the section's subtree (never a blank slot)
  const earlyMid = sectionSubtree(viewOne, "early-mid");
  assert.ok(
    !earlyMid.some((n) => String(n.props.className ?? "").includes("source-panel")),
    "the no-callout Early → Mid section renders no source panel",
  );
  assert.ok(!vnodeText(earlyMid).includes("SOURCE"), "no SOURCE text appears for the non-citing section");

  // route-2's Mid → Late, Victory push and Diplomacy each cite vco-guide;
  // route-3's Mid → Late and Diplomacy too (their verify callouts) — one
  // panel per citing section, each listing its single cited source once
  const citingByRoute: Array<[routeId: string, sectionIds: string[]]> = [
    ["route-2", ["mid-late", "victory-push", "diplomacy"]],
    ["route-3", ["mid-late", "diplomacy"]],
  ];
  for (const [routeId, sectionIds] of citingByRoute) {
    const route = getRoute(tree, "elspeth-von-draken", routeId);
    assert.ok(route.found);
    const view = RouteView({ lord: lord.value, route: route.value });
    for (const sectionId of sectionIds) {
      const subtree = sectionSubtree(view, sectionId);
      assert.ok(
        subtree.some((n) => n.props.className === "source-panel"),
        `the ${routeId} "${sectionId}" section renders a source panel`,
      );
      assert.equal(
        subtree.filter((n) => n.props.className === "source-panel__entry").length,
        1,
        `the ${routeId} "${sectionId}" panel lists its single cited source once`,
      );
      const link = subtree.find((n) => n.tag === "a" && n.props.className === "source-panel__title");
      assert.equal(
        String(link?.children[0]),
        vcoGuideTitle,
        `the ${routeId} "${sectionId}" entry is the vco-guide title link`,
      );
    }
  }
});

test("a section citing the same source twice renders the source once in its panel (temp-copy dedupe)", async () => {
  await inContentCopy(
    async (root) => {
      // The dedupe contract needs a section whose callouts list the same
      // source twice: the committed copy's route-2 Mid → Late section gains a
      // second `::claim` also citing vco-guide (the same block shape, so the
      // lint and the loader see one more enclosed callout in that section).
      const routeTwo = await readFile(join(root, "elspeth-von-draken/routes/route-2.md"), "utf8");
      const duplicated = routeTwo.replace(
        "::claim verify-in-campaign src=vco-guide\nA transfer is acceptable only while the game still credits the control relationship.\n::",
        "::claim verify-in-campaign src=vco-guide\nA transfer is acceptable only while the game still credits the control relationship.\n::\n\n::claim verify-in-campaign src=vco-guide\nA second claim citing the same guide does not add a second panel entry.\n::",
      );
      await writeFile(join(root, "elspeth-von-draken/routes/route-2.md"), duplicated);
    },
    async (root) => {
      assert.deepEqual(await lintContent(fsReader(root)), [], "the duplicated-claim copy stays valid per the shared lint");

      const tree = await loadContentTree(fsReader(root));
      const lord = getLord(tree, "elspeth-von-draken");
      assert.ok(lord.found);
      const route = getRoute(tree, "elspeth-von-draken", "route-2");
      assert.ok(route.found);

      // the mutant really holds two Mid → Late callouts citing vco-guide
      const midLateClaims = route.value.claims.filter((c) => c.sectionId === "mid-late");
      assert.equal(midLateClaims.length, 2, "the mutant Mid → Late section holds two callouts");
      assert.deepEqual(
        midLateClaims.map((c) => c.src),
        [["vco-guide"], ["vco-guide"]],
        "…both citing vco-guide",
      );

      const view = RouteView({ lord: lord.value, route: route.value });
      const midLate = sectionSubtree(view, "mid-late");
      assert.ok(
        midLate.some((n) => n.props.className === "source-panel"),
        "the mutant Mid → Late section still renders its panel",
      );
      assert.equal(
        midLate.filter((n) => n.props.className === "source-panel__entry").length,
        1,
        "the two vco-guide claims dedupe to exactly one panel entry",
      );
      const link = midLate.find((n) => n.tag === "a" && n.props.className === "source-panel__title");
      assert.equal(
        String(link?.children[0]),
        "VCO • author’s route objectives",
        "the lone entry is the vco-guide title link",
      );
    },
  );
});

/* ─── The flagged-items section on the lord page (package flagged-list) ──────── */

/** The recorded subtree of the lord page's flagged section (the `flagged-items` anchor + rows). */
function flaggedSectionNodes(view: unknown): VNodeRecord[] {
  const nodes = recordVNodes(view);
  const section = nodes.find((n) => n.props.id === "flagged-items");
  assert.ok(section !== undefined, "the lord page renders the flagged-items section");
  return recordVNodes(section);
}

/** One flag row's assertions surface: kind (from the row class) + its mono location label. */
interface FlaggedRow {
  readonly kind: string;
  readonly location: string;
  readonly node: VNodeRecord;
}

/** The flagged entry rows in document order, each with its mono location label. */
function flaggedRows(section: VNodeRecord[]): FlaggedRow[] {
  const rows = section.filter((n) => String(n.props.className ?? "").startsWith("flagged-item "));
  return rows.map((node) => {
    const kind = String(node.props.className).replace("flagged-item flagged-item--", "");
    const location = recordVNodes(node).find((n) => n.props.className === "flagged-item__location");
    return {
      kind,
      location: location === undefined || location.children[0] === undefined ? "" : String(location.children[0]),
      node,
    };
  });
}

test("the lord page ends with the flagged section rendering all 36 committed entries in the selector's stable order", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const view = LordView({ lord: lord.value });
  const text = vnodeText(view);
  const sections = recordVNodes(view);

  // the flagged section closes the page, after the routes list
  const article = sections[0];
  const lastChild = article.children[article.children.length - 1] as { props?: { id?: string } };
  assert.equal(lastChild.props?.id, "flagged-items", "the flagged section is the last region of the lord page");
  assert.ok(text.indexOf("Routes") < text.indexOf("VERIFY IN CAMPAIGN"), "the flagged section follows the routes list");
  const section = flaggedSectionNodes(view);
  assert.ok(
    section.some((n) => n.props.className === "flagged-items__title"),
    "the mono uppercase eyebrow names the re-check list",
  );

  // every committed flagged claim renders as exactly one row: 6 identity + 5
  // callout + 22 dataset + 3 vco
  const rows = flaggedRows(section);
  assert.equal(rows.length, 36, "all 36 committed flagged entries render");
  const byKind = { identity: 0, callout: 0, dataset: 0, vco: 0 };
  for (const row of rows) byKind[row.kind as keyof typeof byKind] += 1;
  assert.deepEqual(byKind, { identity: 6, callout: 5, dataset: 22, vco: 3 }, "family counts over the committed tree");

  // the view renders the single selector's output once and unchanged — the row
  // kinds reproduce the selector's exact kind sequence, so no re-sorting can
  // hide behind the grouping (routes in manifest order; within a route:
  // identity, then callouts, then panels in PANEL_GROUPS order, then vco)
  const expectedKinds = getFlaggedEntries(lord.value).map((e) => e.kind);
  assert.deepEqual(
    rows.map((r) => r.kind),
    expectedKinds,
    "rows follow the selector's stable order — one definition rendered once",
  );

  // claim texts render per family (one representative committed entry each)
  assert.ok(text.includes("Defeat the five listed factions and win 35 battles."), "route-1 objective identity claim text");
  assert.ok(
    text.includes("A transfer is acceptable only while the game still credits the control relationship."),
    "route-2 Mid → Late callout claim text",
  );
  assert.ok(text.includes("The Countess’s field company"), "route-1 armies mid dataset claim text");
  assert.ok(
    text.includes(
      "The Deceivers — The Changeling: Use the actual destruction/wounded wording in your installed mission. Investigate remaining cults if the faction persists.",
    ),
    "route-1 deceivers vco claim text",
  );

  // every row is the VERIFY badge — the only badge vocabulary on the page, so
  // the other three confidence states never render (colour is never the sole
  // indicator: label + icon anatomy comes from the F2 component itself)
  const badges = badgeVNodes(view);
  assert.equal(badges.length, 36, "one Confidence Badge per flagged row");
  assert.ok(
    badges.every((n) => n.props.state === "verify-in-campaign"),
    "no non-verify state ever renders in the list",
  );
  assert.equal(
    countOccurrences(vnodeText(badges.map(expandBadge)), "VERIFY"),
    36,
    "every expanded badge carries the VERIFY label",
  );

  // each compact row carries the resolved source notes beneath the badge
  for (const row of rows) {
    assert.ok(
      recordVNodes(row.node).some((n) => n.props.className === "flagged-item__note"),
      `the ${row.kind} row at "${row.location}" renders its source note`,
    );
  }
  assert.ok(
    text.includes("Primary author reference, labelled 25 September 2026 and rechecked 30 September."),
    "the vco-guide source note text renders",
  );

  // the DESIGN §6 compact row anatomy on a linked row: location label, claim
  // text, badge, source notes beneath, then the location link
  const firstRow = recordVNodes(rows[0].node);
  const at = (pred: (n: VNodeRecord) => boolean): number => firstRow.findIndex(pred);
  assert.ok(
    at((n) => n.props.className === "flagged-item__location") < at((n) => n.props.className === "flagged-item__claim"),
    "location label precedes the claim text",
  );
  const badgeAt = at((n) => typeof n.props.state === "string" && Array.isArray(n.props.sources));
  const notesAt = at((n) => n.props.className === "flagged-item__notes");
  const linkAt = at((n) => n.props.className === "flagged-item__link");
  assert.ok(badgeAt < notesAt && notesAt < linkAt, "badge, then source notes, then the location link");

  // location links use the existing hash grammar verbatim: callouts anchor
  // their section, identity and vco items point at the route page — and
  // dataset rows render no link element at all (their label carries the
  // location)
  const links = section.filter((n) => n.tag === "a" && n.props.className === "flagged-item__link");
  assert.equal(links.length, 14, "5 callout + 6 identity + 3 vco location links");
  assert.deepEqual(
    links.map((n) => n.props.href),
    [
      "#/elspeth-von-draken/route/route-1",
      "#/elspeth-von-draken/route/route-1",
      "#/elspeth-von-draken/route/route-1",
      "#/elspeth-von-draken/route/route-1",
      "#/elspeth-von-draken/route/route-1",
      "#/elspeth-von-draken/route/route-2",
      "#/elspeth-von-draken/route/route-2",
      "#/elspeth-von-draken/route/route-2/mid-late",
      "#/elspeth-von-draken/route/route-2/victory-push",
      "#/elspeth-von-draken/route/route-2/diplomacy",
      "#/elspeth-von-draken/route/route-3",
      "#/elspeth-von-draken/route/route-3",
      "#/elspeth-von-draken/route/route-3/mid-late",
      "#/elspeth-von-draken/route/route-3/diplomacy",
    ],
    "callouts link their section anchor; identity and vco items link the route page",
  );
  for (const row of rows.filter((r) => r.kind === "dataset")) {
    assert.ok(
      !recordVNodes(row.node).some((n) => n.tag === "a"),
      "dataset rows render no link element — the mono panel label carries the location",
    );
  }

  // mono location labels: route + section for callouts in body order, route +
  // objective/reward for identity claims, panel display names for dataset rows
  // in PANEL_GROUPS order, route + objective id for vco items in list order
  assert.deepEqual(
    rows.filter((r) => r.kind === "callout").map((r) => r.location),
    [
      "ROUTE II · Mid → Late",
      "ROUTE II · Victory push",
      "ROUTE II · Diplomacy",
      "ROUTE III · Mid → Late",
      "ROUTE III · Diplomacy",
    ],
    "callout labels name route + section in body order",
  );
  assert.deepEqual(
    rows.filter((r) => r.kind === "identity").map((r) => r.location),
    [
      "ROUTE I · OBJECTIVE",
      "ROUTE I · REWARD",
      "ROUTE II · OBJECTIVE",
      "ROUTE II · REWARD",
      "ROUTE III · OBJECTIVE",
      "ROUTE III · REWARD",
    ],
    "identity labels name route + objective/reward claim",
  );
  assert.deepEqual(
    rows.filter((r) => r.kind === "vco").map((r) => r.location),
    ["ROUTE I · deceivers", "ROUTE I · drycha", "ROUTE I · khazrak"],
    "vco labels name route + objective id in list order",
  );
  assert.deepEqual(
    rows.filter((r) => r.kind === "dataset").map((r) => r.location),
    [
      "ARMY TEMPLATES", "SKILLS", "SKILLS", "SKILLS", "SKILLS", "SKILLS", "SKILLS",
      "RESEARCH", "SETTLEMENTS", "SETTLEMENTS", "MECHANICS", "MECHANICS", "MECHANICS", "MECHANICS", "MECHANICS",
      "ARMY TEMPLATES", "RESEARCH", "SETTLEMENTS",
      "ARMY TEMPLATES", "RESEARCH", "RESEARCH", "SETTLEMENTS",
    ],
    "dataset labels are the panel display names in PANEL_GROUPS order",
  );

  // one mono group heading per route, in manifest order
  assert.deepEqual(
    section
      .filter((n) => n.props.className === "flagged-items__group-heading")
      .map((n) => String(n.children[0])),
    ["ROUTE I", "ROUTE II", "ROUTE III"],
    "group headings name each route in manifest order",
  );
});

test("a lord with zero flags renders the explicit cleared flagged section — never blank", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const lord = getLord(tree, "als-rhyn-of-lorek");
  assert.ok(lord.found);
  assert.deepEqual(getFlaggedEntries(lord.value), [], "the fixture guide carries no verify-in-campaign claims");
  const view = LordView({ lord: lord.value });
  const text = vnodeText(view);
  const section = flaggedSectionNodes(view);

  // the section still renders its eyebrow, then the explicit cleared statement
  assert.ok(section.some((n) => n.props.className === "flagged-items__title"), "the re-check list eyebrow stays");
  const clearedLabel = section.find((n) => n.props.className === "flagged-items__cleared-label");
  assert.ok(
    clearedLabel !== undefined && String(clearedLabel.children[0]) === "ALL CLEARED",
    "the explicit cleared mono label",
  );
  assert.ok(
    text.includes("No claim is currently open — the research trail is complete."),
    "the proportional cleared sentence explains the positive state",
  );
  assert.ok(
    !section.some((n) => n.props.className === "flagged-items__groups"),
    "no group containers render when there is nothing to group",
  );
  assert.equal(flaggedRows(section).length, 0, "no flag rows render");
  assert.equal(badgeVNodes(view).length, 0, "no badge vocabulary leaks into the cleared state");
  assert.ok(section.length > 1, "the cleared statement fills the section — never blank space");
});
