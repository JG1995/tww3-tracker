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

  // body: the all-gap skeleton renders exactly seven in-flow Content Gap
  // Markers at their registry positions (required, then optional, then the
  // declared transition) — never the F1 empty-body fallback, and never F1's
  // trailing gap list
  const markerCopy = (title: string): string => `"${title}" is a declared gap — it has not been written yet.`;
  const registryOrder = [
    "Opening",
    "Early → Mid",
    "Mid → Late",
    "Victory push",
    "Territory policy",
    "Diplomacy",
    "Transition → route-2",
  ];
  assert.equal(countOccurrences(text, "CONTENT GAP"), registryOrder.length, "one in-flow marker per declared gap");
  for (let i = 0; i < registryOrder.length; i++) {
    const title = registryOrder[i] as string;
    assert.ok(text.includes(markerCopy(title)), `the "${title}" marker names its section as declared`);
    if (i > 0) {
      assert.ok(
        text.indexOf(markerCopy(registryOrder[i - 1] as string)) < text.indexOf(markerCopy(title)),
        `the "${title}" marker follows "${registryOrder[i - 1] as string}" in registry order`,
      );
    }
  }
  assert.ok(
    text.indexOf("ROUTE I") < text.indexOf(markerCopy("Opening")),
    "the markers run in-flow after the identity card, not in a trailing list",
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
      // route-1 keeps one real H2 body and declares the rest as gaps — the
      // "present or declared" mix the lint treats as a valid route document.
      const routeOne = await readFile(join(root, "elspeth-von-draken/routes/route-1.md"), "utf8");
      const mixed = routeOne
        .replace("  - Opening\n", "")
        .replace(
          /---\n$/,
          "---\n\n## Opening\n\nMixed-case opening prose proves the present section renders.\n",
        );
      await writeFile(join(root, "elspeth-von-draken/routes/route-1.md"), mixed);
    },
    async (root) => {
      assert.deepEqual(await lintContent(fsReader(root)), [], "the mixed copy is valid per the shared lint");

      const tree = await loadContentTree(fsReader(root));
      const lord = getLord(tree, "elspeth-von-draken");
      assert.ok(lord.found);
      const route = getRoute(tree, "elspeth-von-draken", "route-1");
      assert.ok(route.found);
      const view = RouteView({ lord: lord.value, route: route.value });
      const nodes = recordVNodes(view);
      const text = vnodeText(view);

      const markerFor = (title: string): string => `"${title}" is a declared gap — it has not been written yet.`;
      const afterSection = [
        "Early → Mid",
        "Mid → Late",
        "Victory push",
        "Territory policy",
        "Diplomacy",
        "Transition → route-2",
      ];
      const body = "Mixed-case opening prose proves the present section renders.";

      // the present section renders its written body at its registry position —
      // before the first marker — and keeps its scroll anchor
      assert.ok(text.includes(body), "the present section renders its written body");
      assert.ok(
        text.indexOf(body) < text.indexOf(markerFor("Early → Mid")),
        "the present Opening section sits before the Early → Mid marker in registry order",
      );
      assert.ok(
        nodes.some((n) => typeof n.props["data-section-id"] === "string"),
        "the present section keeps its data-section-id anchor for the router",
      );

      // the declared remainder renders exactly its markers, in registry order
      for (let i = 1; i < afterSection.length; i++) {
        assert.ok(
          text.indexOf(markerFor(afterSection[i - 1] as string)) < text.indexOf(markerFor(afterSection[i] as string)),
          `the "${afterSection[i] as string}" marker follows "${afterSection[i - 1] as string}" in registry order`,
        );
      }
      assert.equal(
        countOccurrences(text, "CONTENT GAP"),
        afterSection.length,
        "exactly the declared remainder renders markers",
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

test("the route view mounts the dashboard after the sections with five tabs in DESIGN order and per-panel empty states", async () => {
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
  assert.ok(
    text.indexOf("CONTENT GAP") < text.indexOf("ARMY TEMPLATES"),
    "the dashboard mounts after the section region (the registry gap markers precede the tab bar)",
  );

  // the committed tree: each of the five panels shows its explicit empty state — never blank
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
      panelText.includes(emptyLabels[index] as string),
      `panel ${index} shows its own explicit empty state; got: "${panelText}"`,
    );
    assert.ok(panelText.trim().length > 0, `panel ${index} is never blank space`);
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
