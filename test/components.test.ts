/**
 * Contract proof for the Confidence Badge (package `confidence-badge`, commit 2 —
 * feature DESIGN §"Confidence Badges"): the presentational component renders
 * icon + mono uppercase label + colour-modifier class for all four confidence
 * states, with one trailing link per provided source (zero-DOM VNode flatten),
 * and the boot-time `::claim` callout renderer emits the same badged anatomy —
 * icon, mono label, resolved per-`src` links — inside the existing classed aside
 * markup, while the committed content (which has no callouts) renders unchanged.
 *
 * Seam: zero-DOM. The component is a plain `h()`-built preact VNode flattened
 * with the same text helper the views tests use; the callout output is the
 * `load.ts`-rendered HTML string over the same filesystem-reader trees the
 * content-model tests use.
 *
 * It also carries the route tab strip contract (package `route-tab-strip`,
 * commit 4 — feature DESIGN §2/§6): the exported pure `tabNav` keyboard
 * decision helper plus the rendered-tab VNode assertions over the committed
 * tree.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentTree } from "../app/content/load.ts";
import { getLord, getRoute } from "../app/content/query.ts";
import { CLAIM_STATES, type ContentReader, type Route, type Source } from "../app/content/types.ts";
import { ConfidenceBadge } from "../app/components/ConfidenceBadge.ts";
import { TabStripMarkup, tabNav } from "../app/components/TabStrip.ts";

const CONTENT = fileURLToPath(new URL("../content", import.meta.url));
const FIXTURES = fileURLToPath(new URL("fixtures/content", import.meta.url));

/** A filesystem `ContentReader` over a content root — the CLI's shape. */
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
 * Flattens a preact VNode tree to a plain text string: text children in
 * document order, plus boot-time-rendered `dangerouslySetInnerHTML` HTML
 * literals (the badge icon's inner SVG markup) — the views tests' helper.
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

// ─── 1. The component: icon + mono uppercase label + colour modifier, per state ─

test("ConfidenceBadge renders icon + mono uppercase label + colour modifier for all four states", () => {
  // The DESIGN confidence table's display labels — asserted literally so a
  // wrong vocabulary entry fails this test.
  const expectedLabels: Record<string, string> = {
    confirmed: "CONFIRMED",
    historical: "HISTORICAL",
    inferred: "INFERRED",
    "verify-in-campaign": "VERIFY",
  };

  const icons = new Set<string>();
  for (const state of CLAIM_STATES) {
    const nodes = recordVNodes(ConfidenceBadge({ state }));

    const badge = nodes.find(
      (n) =>
        n.tag === "span" &&
        String(n.props.className ?? "").split(/\s+/).includes(`confidence-badge--${state}`),
    );
    assert.ok(badge, `the badge span carries the ${state} colour-modifier class`);

    const label = nodes.find((n) => n.tag === "span" && n.props.className === "confidence-badge__label");
    assert.ok(label !== undefined, `the ${state} label is always present — colour is never the sole indicator`);
    assert.equal(label?.children[0], expectedLabels[state], `${state} label matches the DESIGN confidence table`);

    const svg = nodes.find((n) => n.tag === "svg");
    assert.ok(svg !== undefined, "the badge contains an <svg> icon element");
    const inner = String((svg?.props.dangerouslySetInnerHTML as { __html: string } | undefined)?.__html ?? "");
    assert.match(inner, /<(path|circle)/, "the icon is hand-authored inline SVG markup, not emoji or a CSS shape");
    icons.add(inner);
  }
  assert.equal(icons.size, CLAIM_STATES.length, "each state draws a distinct icon (check/clock/branch/flag)");
});

// ─── 2. Source links: one trailing <a> per source; none without sources ──────

const SAMPLE_SOURCES: readonly Source[] = [
  { id: "vco-guide", title: "VCO Campaign Guide", url: "https://example.test/vco-guide", note: "" },
  { id: "ca", title: "Casket of Souls deep dive", url: "https://example.test/casket", note: "" },
];

test("ConfidenceBadge trails one link per source and renders none without sources", () => {
  const withSources = recordVNodes(ConfidenceBadge({ state: "confirmed", sources: SAMPLE_SOURCES }));
  const links = withSources.filter((n) => n.tag === "a");
  assert.equal(links.length, SAMPLE_SOURCES.length, "one trailing <a> per provided source");
  assert.equal(links[0].props.href, "https://example.test/vco-guide");
  assert.equal(links[1].props.href, "https://example.test/casket");

  const flat = vnodeText(ConfidenceBadge({ state: "confirmed", sources: SAMPLE_SOURCES }));
  assert.ok(
    flat.includes("VCO Campaign Guide") && flat.includes("Casket of Souls deep dive"),
    "source titles land in the flattened output",
  );

  const noSources = recordVNodes(ConfidenceBadge({ state: "historical" }));
  assert.deepEqual(noSources.filter((n) => n.tag === "a"), [], "no sources → no trailing links");

  const emptySources = recordVNodes(ConfidenceBadge({ state: "historical", sources: [] }));
  assert.deepEqual(emptySources.filter((n) => n.tag === "a"), [], "an empty sources array renders no links either");
  assert.ok(
    vnodeText(ConfidenceBadge({ state: "historical" })).includes("HISTORICAL"),
    "the label still renders without sources",
  );
});

// ─── 3. The boot-time ::claim callout carries the same badged anatomy ────────

test("the fixture callout renders the badged anatomy with resolved per-src links inside the classed aside", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const route = getRoute(tree, "als-rhyn-of-lorek", "dark-conduits");
  assert.ok(route.found, "the fixture route loads");
  const section = route.value.sections.find((s) => s.id === "early-mid");
  assert.ok(section !== undefined, "the Early → Mid section exists");
  const html = section.html;

  // The existing content-model callout contract is preserved verbatim.
  assert.ok(html.includes('class="claim claim--confirmed"'), 'aside keeps class="claim claim--<state>"');
  assert.ok(html.includes('data-state="confirmed"'), "aside keeps data-state");
  assert.ok(html.includes('data-src="vco-guide,ca"'), "aside keeps data-src");

  // The badged anatomy: icon + mono uppercase label + one trailing link per src.
  assert.ok(
    html.includes('<span class="confidence-badge confidence-badge--confirmed">'),
    "the badge span matches the component's class contract",
  );
  assert.ok(html.includes('<svg class="confidence-badge__icon"'), "the icon wrapper <svg> is present");
  assert.ok(html.includes("<path"), "the icon inner markup is hand-authored svg");
  assert.ok(html.includes('<span class="confidence-badge__label">CONFIRMED</span>'), "the mono uppercase label is present");
  assert.ok(
    html.includes('<a class="confidence-badge__src" href="https://example.test/vco-guide">VCO Campaign Guide</a>'),
    "the first src id resolves to its source link",
  );
  assert.ok(
    html.includes('<a class="confidence-badge__src" href="https://example.test/casket">Casket of Souls deep dive</a>'),
    "the second src id resolves to its source link",
  );
});

// ─── 4. The committed content (no callouts) renders unchanged ────────────────

test("the committed content (no callouts) renders unchanged by the badge work", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  for (const lord of tree.lords) {
    assert.ok(
      !lord.sharedHtml.includes('<aside class="claim'),
      `${lord.slug}: no callout in the committed shared fundamentals`,
    );
    for (const route of lord.routes) {
      for (const section of route.sections) {
        assert.ok(
          !section.html.includes('<aside class="claim'),
          `no callout in committed ${route.id}/${section.id}`,
        );
      }
    }
  }
});

// ─── 5. The route tab strip: keyboard decision helper (package `route-tab-strip`) ─

test("tabNav wraps left/right around the strip's ends and stays on a single tab", () => {
  assert.equal(tabNav("left", 0, 4), 3, "left from the first tab wraps to the last");
  assert.equal(tabNav("right", 3, 4), 0, "right from the last tab wraps to the first");
  assert.equal(tabNav("left", 2, 4), 1, "left in the middle steps down");
  assert.equal(tabNav("right", 1, 4), 2, "right in the middle steps up");
  assert.equal(tabNav("left", 0, 1), 0, "a single tab wraps onto itself");
  assert.equal(tabNav("right", 0, 1), 0, "a single tab wraps onto itself the other way");
});

test("tabNav bounds home/end to the first and last tabs", () => {
  assert.equal(tabNav("home", 2, 4), 0, "Home always lands on the first tab");
  assert.equal(tabNav("home", 0, 4), 0, "Home from the first tab stays put");
  assert.equal(tabNav("end", 0, 4), 3, "End always lands on the last tab");
  assert.equal(tabNav("end", 3, 4), 3, "End from the last tab stays put");
});

// ─── 6. The route tab strip: rendered-tab VNode assertions ────────────────────

test("the tab strip renders Shared then the manifest routes in order, marking the active tab", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found, "the committed lord loads");

  const nodes = recordVNodes(
    TabStripMarkup({ lordSlug: lord.value.slug, routes: lord.value.routes, activeId: "route-2" }),
  );
  const tablist = nodes.find((n) => n.props.role === "tablist");
  assert.ok(tablist !== undefined, "the container carries role=tablist");
  assert.equal(tablist.props["aria-label"], "Routes", "the tablist has an accessible name");

  const tabs = nodes.filter((n) => n.tag === "a" && n.props.role === "tab");
  assert.equal(tabs.length, 4, "Shared plus one tab per manifest route");
  assert.deepEqual(
    tabs.map((t) => t.props.href),
    [
      "#/elspeth-von-draken",
      "#/elspeth-von-draken/route/route-1",
      "#/elspeth-von-draken/route/route-2",
      "#/elspeth-von-draken/route/route-3",
    ],
    "tabs link to the existing hash routes in manifest order (never re-sorted); Shared links to the lord page",
  );

  // Roving tabindex + aria-selected: only the hash-derived active tab is
  // tabbable; every other tab roves at tabIndex −1.
  assert.equal(tabs[2].props.tabIndex, 0, "the active route-2 tab is tabbable");
  assert.equal(tabs[2].props["aria-selected"], true, "the active tab carries aria-selected");
  for (const [index, tab] of tabs.entries()) {
    if (index === 2) continue;
    assert.equal(tab.props.tabIndex, -1, `tab ${index} roves out of tab order`);
    assert.equal(tab.props["aria-selected"], false, `tab ${index} is not selected`);
  }
});

test("the tab strip marks the Shared tab active for the lord page", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const tabs = recordVNodes(
    TabStripMarkup({ lordSlug: lord.value.slug, routes: lord.value.routes, activeId: "shared" }),
  ).filter((n) => n.props.role === "tab");
  assert.equal(tabs[0].props.tabIndex, 0, "Shared is tabbable on the lord page");
  assert.equal(tabs[0].props["aria-selected"], true, "the Shared tab is selected on the lord page");
  assert.ok(
    tabs.slice(1).every((t) => t.props.tabIndex === -1 && t.props["aria-selected"] === false),
    "route tabs rove at −1 when Shared is active",
  );
});

test("each route tab carries the code + title label line with the VCO line beneath (unresearched marker when null)", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const text = vnodeText(
    TabStripMarkup({ lordSlug: lord.value.slug, routes: lord.value.routes, activeId: "route-2" }),
  );
  assert.ok(text.includes("SHARED"), "the Shared tab label");
  assert.ok(text.includes("I The Graveyard Watch"), "route I: mono code + proportional title on the label line");
  assert.ok(text.includes("II The Southern Charter"), "route II: mono code + proportional title on the label line");
  assert.ok(text.includes("III Fozzrik’s Legacy"), "route III: mono code + proportional title on the label line");
  assert.ok(text.includes("The Graveyard Watch UNRESEARCHED"), "committed vcoTitle null ⇒ the explicit unresearched marker beneath route I");
  assert.ok(text.includes("The Southern Charter UNRESEARCHED"), "…and beneath route II");
  assert.ok(text.includes("Fozzrik’s Legacy UNRESEARCHED"), "…and beneath route III");
  assert.ok(text.indexOf("SHARED") < text.indexOf("I The Graveyard Watch"), "Shared first, then routes");
  assert.ok(text.indexOf("I The Graveyard Watch") < text.indexOf("II The Southern Charter"), "manifest order I → II");
  assert.ok(text.indexOf("II The Southern Charter") < text.indexOf("III Fozzrik’s Legacy"), "manifest order II → III");
});

test("a researched route tab renders its official VCO title instead of the marker", () => {
  const researched: Route = {
    id: "route-2",
    number: "II",
    name: "The Southern Charter",
    vcoTitle: "Written in the Charter",
    objective: { text: "", state: "confirmed", src: [] },
    reward: { text: "", state: "confirmed", src: [] },
    gaps: [],
    sections: [],
    claims: [],
  };
  const text = vnodeText(
    TabStripMarkup({ lordSlug: "elspeth-von-draken", routes: [researched], activeId: "route-2" }),
  );
  assert.ok(text.includes("Written in the Charter"), "the researched official title renders beneath the label line");
  assert.ok(!text.includes("UNRESEARCHED"), "no marker for a researched route");
});
