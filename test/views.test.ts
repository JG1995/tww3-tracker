/**
 * Contract proof for the data-driven views (package `home-real`, commit 6):
 * the home card list, the lord page, and the F1 route page rendered from the
 * REAL committed Elspeth tree; and (package `route-tab-strip`, commit 4) the
 * route tab strip the lord/route views mount over the committed tree.
 *
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
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentTree } from "../app/content/load.ts";
import { getLord, getRoute } from "../app/content/query.ts";
import type { ContentReader, Route } from "../app/content/types.ts";
import { TabStripMarkup, type TabStripProps } from "../app/components/TabStrip.ts";
import { HomeView } from "../app/views/home.ts";
import { LordView } from "../app/views/lord.ts";
import { RouteView } from "../app/views/route.ts";

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

test("route page shows the identity claims verbatim with state labels and seven declared gaps", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);
  const text = vnodeText(RouteView({ lord: lord.value, route: route.value }));

  // identity block: display number, thematic title, explicit unresearched marker
  assert.ok(text.includes("ROUTE I"), "route number eyebrow");
  assert.ok(text.includes("The Graveyard Watch"), "thematic subtitle");
  assert.ok(
    text.includes("UNRESEARCHED — no official VCO title recorded"),
    "the null vcoTitle slot is explicitly marked unresearched",
  );

  // objective and reward, verbatim from the committed frontmatter, each with
  // its mono uppercase state label and its src ids
  assert.ok(text.includes("Defeat the five listed factions and win 35 battles."), "objective claim text");
  assert.ok(
    text.includes(
      "Published rewards strengthen Elspeth’s magic and personal combat, and give her army movement after battle. The author lists +20% spell intensity, +25% targeting range, +10% weapon strength, and “+15” post-battle movement; check the live unit/scope of that last value.",
    ),
    "reward claim text",
  );
  assert.equal(countOccurrences(text, "VERIFY"), 2, "both claims carry the verify-in-campaign state label");
  assert.equal(countOccurrences(text, "SRC vco-guide"), 2, "both claims cite the vco-guide source");

  // body: the skeleton declares every section as a gap, so the F1 route page
  // renders the explicit empty-body message, not a blank
  assert.ok(text.includes("This route has no sections yet."), "all sections declared as gaps is a meaningful page");

  // declared-gap list: one entry per declared gap, naming the section and
  // that it is declared (not accidentally empty)
  const declaredGaps = [
    "Opening",
    "Early → Mid",
    "Mid → Late",
    "Victory push",
    "Territory policy",
    "Diplomacy",
    "Transition → route-2",
  ];
  assert.equal(countOccurrences(text, "CONTENT GAP"), declaredGaps.length, "one entry per declared gap");
  for (const gap of declaredGaps) {
    assert.ok(
      text.includes(`"${gap}" is a declared gap — it has not been written yet.`),
      `gap entry names the "${gap}" section as declared`,
    );
  }
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
