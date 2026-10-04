/**
 * Contract proof for the data-driven views: the home card list over the real
 * committed Elspeth tree (package `home-real`, commit 6); the reference desk
 * (package `reference-desk-view`), the route plan with the section walk,
 * transitions, source panels, gap markers, VCO undercard, and campaign action
 * region (packages `route-plan-view` / `ledger-route-start`), the three detail
 * pages (package `detail-pages-view`), the sources and notes pages, and the
 * ledger page view over constructed props (package `ledger-view-page`): the
 * campaign context header (lord, route name, patch/VCO), the loading
 * in-flight line, the composed table (committed order, fresh misses, dropped
 * extras, passed-through statuses, progress), the exact empty state, and the
 * error panel with its Retry wired to `onRetry`.
 * Seam: zero-DOM. The committed `content/` loads through the same
 * `app/content/load.ts` pass the CLI and the site boot use (filesystem
 * `ContentReader`, one immutable tree), then each view function is called
 * directly with the data `main.tsx` passes it — `HomeView` gets the tree,
 * the plan/desk/panel views get query results — and the returned Preact VNode
 * tree is flattened to text with the small helper below. Views stay plain
 * `.ts` modules built from `h()`, so node:test can import them without a DOM
 * library (see the plan-revision discovery on `.tsx` under node:test). The
 * badge components (no hooks) expand through the pure `ConfidenceBadge`
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
  getSection,
  getVcoObjectives,
  resolveSources,
} from "../app/content/query.ts";
import { CLAIM_STATES, PANEL_GROUPS, type Army, type ClaimState, type ContentReader, type Item, type Lord, type LordDataset, type Route, type Source } from "../app/content/types.ts";
import { ConfidenceBadge } from "../app/components/ConfidenceBadge.ts";
import { DeskPanel } from "../app/components/deskPanel.ts";
import { HomeView, versionContext } from "../app/views/home.ts";
import { DeskMarkup } from "../app/views/desk.ts";
import { ArmiesMarkup, SettlementsView, WorkshopView, panelTabNav } from "../app/views/panels.ts";
import type { PanelGroup } from "../app/content/types.ts";
import { SourcesView } from "../app/views/sources.ts";
import { NotesView } from "../app/views/notes.ts";
import { PlanView, transitionTarget } from "../app/views/plan.ts";
import { itemsFor } from "../app/ledger/logic.ts";
import type { CampaignDoc, LedgerIndexEntry } from "../app/ledger/types.ts";
import type { LedgerIndexState } from "../app/ledger/useCampaign.ts";
import { LedgerTable, type LedgerRowStatus, type LedgerTableProps } from "../app/components/LedgerTable.ts";
import { LedgerView, type LedgerViewProps } from "../app/views/ledger.ts";

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
 * The ConfidenceBadge VNodes at the view seam. The badge is a pure component
 * with no hooks, so it expands through the component function with the
 * recorded props, keeping the zero-DOM seam.
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

/** The F7 transition cross-link anchors of one route view (selected by the link class). */
function transitionAnchors(view: unknown): VNodeRecord[] {
  return recordVNodes(view).filter((n) => n.tag === "a" && n.props.className === "route-section__heading-link");
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

function sectionSubtree(view: unknown, sectionId: string): VNodeRecord[] {
  const nodes = recordVNodes(view);
  const section = nodes.find((n) => n.props["data-section-id"] === sectionId);
  assert.ok(section !== undefined, `the ${sectionId} section renders`);
  return recordVNodes(section);
}

/* ─── The flagged-items section in the views' lord-level zone (package flagged-list) ─ */

/** The recorded subtree of a view's flagged section (the `flagged-items` anchor + rows). */
function flaggedSectionNodes(view: unknown): VNodeRecord[] {
  const nodes = recordVNodes(view);
  const section = nodes.find((n) => n.props.id === "flagged-items");
  assert.ok(section !== undefined, "the view renders the flagged-items section");
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

/* ─── The Version Banner in the views' lord-level zone (package version-banner) ─ */

/** The recorded subtree of a view's version banner (the desk's lord-level zone since Commit 9). */
function versionBannerNode(view: unknown): VNodeRecord[] {
  const nodes = recordVNodes(view);
  const banner = nodes.find((n) => n.props.className === "version-banner");
  assert.ok(banner !== undefined, "the view renders the version banner");
  return recordVNodes(banner);
}

/** The banner's chip node — the warning anchor or the cleared span. */
function versionChipNode(view: unknown): VNodeRecord {
  const banner = versionBannerNode(view);
  const chip = banner.find((n) => String(n.props.className ?? "").includes("version-chip"));
  assert.ok(chip !== undefined, "the banner renders its open-flags chip");
  return chip;
}

/* ─── The reference desk view (package `reference-desk-view`) ────────────── */

/** One desk card's row nodes (the flat numbered label rows). */
function deskRowsOf(card: VNodeRecord): VNodeRecord[] {
  return recordVNodes(card).filter((n) => n.props.className === "desk-row");
}

/** The first row label of one desk card (the panelOrder order proof's head). */
function firstRowLabel(card: VNodeRecord): string | undefined {
  const row = deskRowsOf(card)[0];
  if (row === undefined) return undefined;
  const label = recordVNodes(row).find((n) => n.props.className === "desk-row__label");
  return label === undefined ? undefined : String(label.children[0]);
}

test("the desk toolbar renders the serif title, the caption, and the Compare routes toggle", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const markup = DeskMarkup({ lord: lord.value, route: route.value, comparing: false });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);

  const titleAt = nodes.findIndex((n) => n.props.className === "desk-toolbar__title");
  const captionAt = nodes.findIndex((n) => n.props.className === "desk-toolbar__caption");
  const toggleAt = nodes.findIndex((n) => n.props.className === "desk-toolbar__toggle");
  assert.ok(titleAt < captionAt && captionAt < toggleAt, "the title, caption, and toggle render in toolbar order");
  const title = nodes[titleAt];
  assert.equal(title?.tag, "h1", "the serif Reference desk H1");
  assert.equal(String(title?.children[0]), "Reference desk", "the fixed desk title");
  assert.equal(
    nodes.filter((n) => n.props.className === "desk-toolbar__title").length,
    1,
    "the reference desk title renders exactly once",
  );
  const caption = nodes[captionAt];
  assert.equal(
    String(caption?.children[0]),
    "essentials here, full detail one page away",
    "the DESIGN-fixed caption",
  );
  const toggle = nodes[toggleAt];
  assert.equal(toggle?.tag, "button", "the action is a toggle button");
  assert.equal(String(toggle?.children[0]), "Compare routes", "the fixed action label");
  assert.equal(toggle?.props["aria-pressed"], false, "the toggle starts unpressed");
  assert.equal(toggle?.props.onClick, undefined, "tests may omit the wrapper's toggle handler");
  assert.ok(text.includes("Reference desk"), "the toolbar text reads on the page");
});

test("the desk grid renders the five panel cards in I-V order with the panelOrder rows", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const markup = DeskMarkup({ lord: lord.value, route: route.value, comparing: false });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);

  const cards = nodes.filter((n) => n.props.className === "desk-card");
  assert.equal(cards.length, 5, "all five panels render as desk cards");
  assert.deepEqual(
    cards.map((card) => {
      const index = recordVNodes(card).find((n) => n.props.className === "desk-card__index");
      return index === undefined ? undefined : String(index.children[0]);
    }),
    ["I", "II", "III", "IV", "V"],
    "the Roman panel indices render in order",
  );
  assert.deepEqual(
    cards.map((card) => {
      const title = recordVNodes(card).find((n) => n.props.className === "desk-card__title");
      return title === undefined ? undefined : String(title.children[0]);
    }),
    [
      "Army templates",
      "Lord & hero skills",
      "Research priorities",
      "Settlement builds",
      "Unique mechanics",
    ],
    "the serif card titles follow the DESIGN's panel order",
  );

  // the flat numbered rows in `panelOrder` order — label lines only: no
  // checkbox, no "Read notes" (deferred scope)
  const expectedCounts = { armies: 5, skills: 10, research: 4, buildings: 6, mechanics: 5 };
  for (let index = 0; index < PANEL_GROUPS.length; index++) {
    const group = PANEL_GROUPS[index];
    assert.equal(deskRowsOf(cards[index]).length, expectedCounts[group], `the ${group} card shows its ${expectedCounts[group]} resolved rows`);
  }
  assert.ok(
    !nodes.some((n) => n.tag === "input"),
    "no checkbox renders on the desk rows",
  );
  assert.equal(countOccurrences(text, "Read notes"), 0, "no deferred Read notes action renders");

  // the panelOrder order: each card opens with its first resolved entry, and
  // the armies card orders its five templates exactly as panelOrder lists them
  assert.deepEqual(
    cards.map((card) => firstRowLabel(card)),
    [
      "The first Nuln column",
      "Elspeth",
      "A working army before luxury research",
      "Nuln · foundry and field-test centre",
      "Field Testing · unlock what the army will use",
    ],
    "each card opens with its panelOrder first entry",
  );
  assert.deepEqual(
    deskRowsOf(cards[0]).map((row) => {
      const label = recordVNodes(row).find((n) => n.props.className === "desk-row__label");
      return label === undefined ? undefined : String(label.children[0]);
    }),
    [
      "The first Nuln column",
      "The Countess’s field company",
      "The Black Rose procession",
      "The Black Rose procession · Amethyst detachment",
      "The local watch · 12 slots",
    ],
    "the armies rows follow panelOrder order (early, mid, late, amethyst, home)",
  );
  assert.deepEqual(
    deskRowsOf(cards[0]).map((row) => {
      const index = recordVNodes(row).find((n) => n.props.className === "desk-row__index");
      return index === undefined ? undefined : String(index.children[0]);
    }),
    ["1", "2", "3", "4", "5"],
    "the armies rows are numbered 1..5",
  );
});

test("each desk card footer carries the item count and the new-grammar detail-page href", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const markup = DeskMarkup({ lord: lord.value, route: route.value, comparing: false });
  const cards = recordVNodes(markup).filter((n) => n.props.className === "desk-card");
  const expectedFooters = [
    { count: "5", href: "#/elspeth-von-draken/armies/route-1", page: "Armies & skills" },
    { count: "10", href: "#/elspeth-von-draken/armies/route-1", page: "Armies & skills" },
    { count: "4", href: "#/elspeth-von-draken/armies/route-1", page: "Armies & skills" },
    { count: "6", href: "#/elspeth-von-draken/settlements/route-1", page: "Settlements & economy" },
    { count: "5", href: "#/elspeth-von-draken/workshop/route-1", page: "Faction workshop" },
  ];
  for (let index = 0; index < cards.length; index++) {
    const foot = recordVNodes(cards[index]);
    const number = foot.find((n) => n.props.className === "desk-card__count-number");
    assert.equal(String(number?.children[0]), expectedFooters[index]?.count, `card ${index + 1}'s count numeral`);
    const countLine = foot.find((n) => n.props.className === "desk-card__count");
    assert.equal(
      countLine !== undefined ? vnodeText(countLine) : "",
      `${expectedFooters[index]?.count} entries`,
      `card ${index + 1}'s count line reads as an item count`,
    );
    const link = foot.find((n) => n.tag === "a" && n.props.className === "desk-card__link");
    assert.equal(link?.props.href, expectedFooters[index]?.href, `card ${index + 1}'s detail-page href (new grammar)`);
    assert.equal(String(link?.children[0]), expectedFooters[index]?.page, `card ${index + 1}'s link names the detail page`);
  }

  // the desk is route-scoped: the same grid over route-2 targets route-2
  const route2 = getRoute(tree, "elspeth-von-draken", "route-2");
  assert.ok(route2.found);
  const markup2 = DeskMarkup({ lord: lord.value, route: route2.value, comparing: false });
  const cards2 = recordVNodes(markup2).filter((n) => n.props.className === "desk-card");
  const hrefs2 = cards2.map((card) => {
    const link = recordVNodes(card).find((n) => n.props.className === "desk-card__link");
    return link?.props.href;
  });
  assert.deepEqual(
    hrefs2,
    [
      "#/elspeth-von-draken/armies/route-2",
      "#/elspeth-von-draken/armies/route-2",
      "#/elspeth-von-draken/armies/route-2",
      "#/elspeth-von-draken/settlements/route-2",
      "#/elspeth-von-draken/workshop/route-2",
    ],
    "route-scoped footers: the current route's id in every href",
  );
});

test("the desk resolves each route's override research at its atlas positions and the settlement roles", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);

  // route-2 owns base-arcane, route-3 owns base-economy beside their own
  // override entries; each route's research card keeps the atlas order and
  // the buildings card shows exactly the route's six settlement roles
  const byRoute: Array<[routeId: string, researchOrder: string[], buildingsRoles: string[]]> = [
    [
      "route-2",
      [
        "Prepare a long southern campaign",
        "Infantry, artillery and the escort",
        "Support a durable southern sphere",
        "Magic, machines and the Garden network",
      ],
      [
        "Southern charter capital · a second production centre",
        "Resource or valuable landmark settlement",
        "Safe income town",
        "A settlement that guards a real approach",
        "Expedition capture / future handover",
      ],
    ],
    [
      "route-3",
      [
        "A durable survey column",
        "Infantry, artillery and the escort",
        "Build the next theatre, not empty infrastructure",
        "The expedition’s practical research",
      ],
      [
        "Nuln · foundry and field-test centre",
        "Survey foothold · an expedition service station",
        "Military support town · the missing profession",
        "Safe income town",
        "Provincial recovery and support base",
        "Expedition capture / future handover",
      ],
    ],
  ];
  for (const [routeId, researchOrder, buildingsRoles] of byRoute) {
    const route = getRoute(tree, "elspeth-von-draken", routeId);
    assert.ok(route.found);
    const nodes = recordVNodes(DeskMarkup({ lord: lord.value, route: route.value, comparing: false }));
    const cards = nodes.filter((n) => n.props.className === "desk-card");
    assert.equal(cards.length, 5, `${routeId} renders the five panel cards`);

    // research: the override entries resolve at the atlas's own positions —
    // the base groups Route I owns are never restated here
    const researchRowLabels = deskRowsOf(cards[2] as VNodeRecord).map((row) => {
      const label = recordVNodes(row).find((n) => n.props.className === "desk-row__label");
      return label === undefined ? undefined : String(label.children[0]);
    });
    assert.deepEqual(
      researchRowLabels,
      researchOrder.map((r) => r),
      "the override/firepower/base groups resolve in the atlas's own order",
    );

    // buildings: exactly the six settlement roles, never the empty state
    const buildingsRows = deskRowsOf(cards[3] as VNodeRecord);
    assert.equal(buildingsRows.length, 6, `${routeId} shows exactly six settlement roles`);
    for (const role of buildingsRoles) {
      assert.ok(vnodeText(cards[3] as VNodeRecord).includes(role), `${routeId} resolves the "${role}" role`);
    }
    assert.ok(vnodeText(cards[0] as VNodeRecord).trim().length > 0, `${routeId} armies card is never blank`);
  }
});

test("the compare toggle swaps the grid for the three route comparison cards", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const off = DeskMarkup({ lord: lord.value, route: route.value, comparing: false });
  assert.ok(recordVNodes(off).some((n) => n.props.className === "desk-card"), "the grid renders while comparing is off");
  assert.ok(
    !recordVNodes(off).some((n) => n.props.className === "desk-compare"),
    "the comparison section is absent while comparing is off",
  );

  const comparing = DeskMarkup({ lord: lord.value, route: route.value, comparing: true });
  const nodes = recordVNodes(comparing);
  const text = vnodeText(comparing);
  assert.ok(!nodes.some((n) => n.props.className === "desk-card"), "the grid is gone while comparing");
  assert.equal(
    nodes.find((n) => String(n.props.className ?? "").includes("desk-toolbar__toggle"))?.props["aria-pressed"],
    true,
    "the toggle's pressed role follows the compare state",
  );
  const section = nodes.find((n) => n.props.className === "desk-compare");
  assert.ok(section !== undefined, "the comparison section renders while comparing");

  const cards = recordVNodes(section).filter((n) => n.props.className === "compare-card");
  assert.equal(cards.length, 3, "one comparison card per manifest route");
  assert.deepEqual(
    cards.map((card) => {
      const number = recordVNodes(card).find((n) => n.props.className === "compare-card__number");
      return number === undefined ? undefined : String(number.children[0]);
    }),
    ["I", "II", "III"],
    "the comparison cards carry their route numerals in manifest order",
  );
  assert.deepEqual(
    cards.map((card) => {
      const name = recordVNodes(card).find((n) => n.props.className === "compare-card__name");
      return name === undefined ? undefined : String(name.children[0]);
    }),
    ["The Graveyard Watch", "The Southern Charter", "Fozzrik’s Legacy"],
    "the thematic subtitles render on each card",
  );
  assert.equal(countOccurrences(text, "UNRESEARCHED"), 3, "every committed route is unresearched (vcoTitle === null)");
  assert.ok(text.includes("Defeat the five listed factions and win 35 battles."), "route I's objective text");
  assert.ok(
    text.includes("Global recruitment capacity +3, building income +15%, and recruitment cost"),
    "route II's reward text",
  );
  assert.ok(
    text.includes("Nuln’s black-powder soldiery and the knights of Morr restore security to the Empire."),
    "route I's interpretation text",
  );
  assert.equal(
    nodes.filter((n) => n.props.className === "compare-card__eyebrow" && String(n.children[0]) === "INTERPRETATION").length,
    3,
    "every committed route carries its interpretation line",
  );
});

test("a researched comparison card shows the official VCO title and omits an absent interpretation", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const lord = getLord(tree, "second-lord");
  assert.ok(lord.found);
  const route = getRoute(tree, "second-lord", "lone-route");
  assert.ok(route.found);

  const markup = DeskMarkup({ lord: lord.value, route: route.value, comparing: true });
  const nodes = recordVNodes(markup);
  const cards = nodes.filter((n) => n.props.className === "compare-card");
  assert.equal(cards.length, 1, "one comparison card for the fixture lord");
  const vco = recordVNodes(cards[0]).find((n) => n.props.className === "compare-card__vco");
  assert.equal(String(vco?.children[0]), "Sun-Priest of the Lost", "the official VCO title renders for a researched route");
  assert.ok(
    !nodes.some((n) => n.props.className === "compare-card__eyebrow" && String(n.children[0]) === "INTERPRETATION"),
    "an absent interpretation renders no line, not a placeholder",
  );
});

test("the desk's lord-level zone renders the banner, shared fundamentals, and the flagged section with new-grammar VIEW links", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const markup = DeskMarkup({ lord: lord.value, route: route.value, comparing: false });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);

  // grid-first layout: toolbar, grid, then banner, shared fundamentals, flagged
  const gridAt = nodes.findIndex((n) => n.props.className === "desk-grid");
  const bannerAt = nodes.findIndex((n) => n.props.className === "version-banner");
  const fundamentalsAt = nodes.findIndex((n) => n.props.className === "shared-fundamentals");
  const flaggedAt = nodes.findIndex((n) => n.props.id === "flagged-items");
  assert.ok(
    gridAt < bannerAt && bannerAt < fundamentalsAt && fundamentalsAt < flaggedAt,
    "grid-first: the version banner, shared fundamentals, then the flagged section",
  );

  // the banner: fixed eyebrow, the patch · VCO pairing once, and the chip
  assert.ok(text.includes("VERIFIED AGAINST"), "the fixed banner eyebrow renders");
  assert.equal(countOccurrences(text, "patch 9.0 · VCO 2026.09.30.1"), 1, "the patch · VCO pairing renders exactly once");
  const chip = versionChipNode(markup);
  assert.equal(chip.tag, "a", "the open-flags chip renders as an anchor");
  assert.equal(String(chip.props.className), "version-chip version-chip--warning", "the warning role");
  assert.equal(String(chip.children[0]), "36 OPEN FLAGS", "the chip labels the selector's committed count");
  assert.equal(chip.props.href, "#/elspeth-von-draken/desk/route-1", "the chip href is this desk page (new grammar)");
  assert.equal(typeof chip.props.onClick, "function", "the chip keeps the scroll/focus click idiom");
  assert.equal(
    nodes.find((n) => n.props.id === "flagged-items")?.props.tabIndex,
    -1,
    "the flagged section stays programmatically focusable for the chip",
  );
  assert.ok(
    !nodes.some((n) => typeof n.props.href === "string" && String(n.props.href).includes("flagged")),
    "no flag-hash href shape is ever emitted",
  );
  assert.equal(countOccurrences(text, "36 OPEN FLAGS"), 1, "the committed count appears exactly once, in the chip");

  // the banner anatomy: exactly one fixed eyebrow and one pairing element in
  // the banner (the lord-page banner's element-level contract, ported)
  const banner = versionBannerNode(markup);
  assert.equal(
    banner.filter((n) => n.props.className === "version-banner__eyebrow").length,
    1,
    "the banner carries the fixed mono eyebrow",
  );
  assert.equal(
    banner.filter((n) => n.props.className === "version-banner__version").length,
    1,
    "the banner carries the mono patch · VCO pairing",
  );

  // the shared fundamentals: the boot-rendered markdown in the zone
  const prose = nodes.find((n) => n.props.className === "prose");
  assert.ok(prose !== undefined, "the shared fundamentals prose renders");
  assert.ok(text.includes("The common foundation"), "the shared-fundamentals HTML renders in the zone");
  // the four atlas shared blocks render in atlas order (opening → smart →
  // budget → equipment) — the lord page's surface, moved to the desk zone
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

  // the flagged section: 36 entries from the single selector, family counts,
  // stable order — the F3 rendering relocated
  const section = flaggedSectionNodes(markup);
  const rows = flaggedRows(section);
  assert.equal(rows.length, 36, "all 36 committed flagged entries render");
  const byKind = { identity: 0, callout: 0, dataset: 0, vco: 0 };
  for (const row of rows) byKind[row.kind as keyof typeof byKind] += 1;
  assert.deepEqual(byKind, { identity: 6, callout: 5, dataset: 22, vco: 3 }, "family counts over the committed tree");
  const expectedKinds = getFlaggedEntries(lord.value).map((e) => e.kind);
  assert.deepEqual(
    rows.map((r) => r.kind),
    expectedKinds,
    "rows follow the selector's stable order — one definition rendered once",
  );

  // per-family representative claim texts render verbatim from the tree
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
  const firstRowNodes = recordVNodes(rows[0].node);
  const at = (pred: (n: VNodeRecord) => boolean): number => firstRowNodes.findIndex(pred);
  assert.ok(
    at((n) => n.props.className === "flagged-item__location") < at((n) => n.props.className === "flagged-item__claim"),
    "location label precedes the claim text",
  );
  const badgeAt = at((n) => typeof n.props.state === "string" && Array.isArray(n.props.sources));
  const notesAt = at((n) => n.props.className === "flagged-item__notes");
  const linkAt = at((n) => n.props.className === "flagged-item__link");
  assert.ok(badgeAt < notesAt && notesAt < linkAt, "badge, then source notes, then the location link");

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

  // the VIEW links use the NEW grammar: callouts anchor the plan section,
  // identity and vco rows the plan page; dataset rows render no link
  const links = section.filter((n) => n.tag === "a" && n.props.className === "flagged-item__link");
  assert.equal(links.length, 14, "5 callout + 6 identity + 3 vco location links");
  assert.deepEqual(
    links.map((n) => n.props.href),
    [
      "#/elspeth-von-draken/plan/route-1",
      "#/elspeth-von-draken/plan/route-1",
      "#/elspeth-von-draken/plan/route-1",
      "#/elspeth-von-draken/plan/route-1",
      "#/elspeth-von-draken/plan/route-1",
      "#/elspeth-von-draken/plan/route-2",
      "#/elspeth-von-draken/plan/route-2",
      "#/elspeth-von-draken/plan/route-2/mid-late",
      "#/elspeth-von-draken/plan/route-2/victory-push",
      "#/elspeth-von-draken/plan/route-2/diplomacy",
      "#/elspeth-von-draken/plan/route-3",
      "#/elspeth-von-draken/plan/route-3",
      "#/elspeth-von-draken/plan/route-3/mid-late",
      "#/elspeth-von-draken/plan/route-3/diplomacy",
    ],
    "callouts link plan/<route>/<section>; identity and vco rows link plan/<route>",
  );
  for (const row of rows.filter((r) => r.kind === "dataset")) {
    assert.ok(
      !recordVNodes(row.node).some((n) => n.tag === "a"),
      "dataset rows render no link element — the mono panel label carries the location",
    );
  }

  // one VERIFY badge per row — the F3 vocabulary, recoloured only by the CSS
  const badges = badgeVNodes(markup);
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
});

test("a flags-clear lord renders the desk's ALL CLEARED chip and cleared state — never blank", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const lord = getLord(tree, "als-rhyn-of-lorek");
  assert.ok(lord.found);
  const route = getRoute(tree, "als-rhyn-of-lorek", "dark-conduits");
  assert.ok(route.found);

  const markup = DeskMarkup({ lord: lord.value, route: route.value, comparing: false });
  const text = vnodeText(markup);
  const chip = versionChipNode(markup);
  assert.equal(chip.tag, "span", "the cleared state is a non-link span");
  assert.equal(String(chip.props.className), "version-chip version-chip--success", "the cleared chip carries the success role");
  assert.equal(String(chip.children[0]), "ALL CLEARED", "the fixed cleared label renders");
  assert.equal(chip.props.href, undefined, "the cleared chip has no href");
  assert.equal(chip.props.onClick, undefined, "the cleared chip has no click handler");
  const section = flaggedSectionNodes(markup);
  assert.ok(
    section.some((n) => n.props.className === "flagged-items__title"),
    "the re-check list eyebrow stays",
  );
  assert.ok(
    section.some((n) => n.props.className === "flagged-items__cleared-label"),
    "the explicit cleared statement fills the section",
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
  assert.equal(badgeVNodes(markup).length, 0, "no badge vocabulary leaks into the cleared state");
  assert.ok(section.length > 1, "the cleared statement fills the section — never blank space");
});

test("a single-flag lord renders the desk's 1 OPEN FLAGS warning anchor chip", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const lord = getLord(tree, "second-lord");
  assert.ok(lord.found);
  assert.equal(getFlaggedEntries(lord.value).length, 1, "the second-lord fixture carries exactly one flag");
  const route = getRoute(tree, "second-lord", "lone-route");
  assert.ok(route.found);

  const markup = DeskMarkup({ lord: lord.value, route: route.value, comparing: false });
  const chip = versionChipNode(markup);
  assert.equal(chip.tag, "a", "the one-flag chip renders as an anchor");
  assert.equal(String(chip.props.className), "version-chip version-chip--warning", "the warning role");
  assert.equal(String(chip.children[0]), "1 OPEN FLAGS", "the chip labels the single open flag");
  assert.equal(chip.props.href, "#/second-lord/desk/lone-route", "the chip href is this desk page (new grammar)");
  assert.equal(typeof chip.props.onClick, "function", "…with the scroll/focus click handler");
});

test("a desk panel with an empty panelOrder list renders the explicit empty state — never a blank card", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const committed = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(committed.found);

  // A lint-covered committed route always carries a resolvable panelOrder, so
  // an empty panel is proven with a hand-built route over the committed lord
  // (the constructed-route precedent): only the skills list is emptied.
  const emptied: Route = {
    ...committed.value,
    panelOrder: { ...committed.value.panelOrder, skills: [] },
  };
  const markup = DeskMarkup({ lord: lord.value, route: emptied, comparing: false });
  const nodes = recordVNodes(markup);
  const cards = nodes.filter((n) => n.props.className === "desk-card");
  const skillsCard = cards[1];
  assert.ok(skillsCard !== undefined, "the skills card renders");
  const skillsNodes = recordVNodes(skillsCard);
  const skillsText = vnodeText(skillsCard);
  assert.ok(skillsText.includes("NO LORD & HERO SKILLS YET"), "the mono empty label names the card");
  assert.ok(
    skillsText.includes("No skills are listed for this route yet."),
    "the proportional empty sentence explains the state",
  );
  assert.ok(!skillsNodes.some((n) => n.props.className === "desk-row"), "no row renders on the empty card");
  assert.ok(
    skillsNodes.some((n) => n.props.className === "desk-card__index") &&
      skillsNodes.some((n) => n.props.className === "desk-card__footer"),
    "the empty card keeps its head and footer — never blank space",
  );
  for (let index = 0; index < cards.length; index++) {
    if (index === 1) continue;
    assert.ok(
      deskRowsOf(cards[index]).length > 0,
      "the populated cards keep their rows — the empty state is per panel",
    );
  }
});

// ─── 10. The ledger page view (package `ledger-view-page`) ─────────────────────

// ─── The route plan view (package `route-plan-view`) ───────────────────────

/** The plan's fact cards, in render order (PURPOSE / WHAT ACTUALLY WINS / LIKELY BOTTLENECK). */
function factCards(view: unknown): VNodeRecord[] {
  return recordVNodes(view).filter((n) => n.props.className === "plan-fact");
}

/** The plan's section-walk H2s in registry order (the class is shared with the route page). */
function planHeadings(view: unknown): VNodeRecord[] {
  return recordVNodes(view).filter((n) => n.tag === "h2" && n.props.className === "route-section__heading");
}

test("the plan head renders the route eyebrow, the campaign-plan title, the intro, and the route badge", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const view = PlanView({ lord: lord.value, route: route.value });
  const nodes = recordVNodes(view);

  const eyebrow = nodes.find((n) => n.props.className === "plan-head__eyebrow");
  assert.equal(String(eyebrow?.children[0]), "ROUTE I · The Graveyard Watch", "the mono eyebrow reads ROUTE <n> · <name>");
  const title = nodes.find((n) => n.props.className === "plan-head__title");
  assert.equal(title?.tag, "h1", "the page title is the headline element");
  assert.equal(String(title?.children[0]), "The campaign plan", "the DESIGN-fixed plan title");
  const intro = nodes.find((n) => n.props.className === "plan-head__intro");
  assert.ok(
    intro !== undefined && String(intro.children[0]).trim().length > 0,
    "the one-line intro renders",
  );
  const badge = nodes.find((n) => n.props.className === "plan-head__badge plan-head__badge--unresearched");
  assert.equal(String(badge?.children[0]), "UNRESEARCHED", "the null vcoTitle renders the explicit marker");

  // a researched route renders the official VCO title as the badge
  const fixtures = await loadContentTree(fsReader(FIXTURES));
  const second = getLord(fixtures, "second-lord");
  assert.ok(second.found);
  const lone = getRoute(fixtures, "second-lord", "lone-route");
  assert.ok(lone.found);
  const researched = recordVNodes(PlanView({ lord: second.value, route: lone.value })).find(
    (n) => n.props.className === "plan-head__badge",
  );
  assert.equal(String(researched?.children[0]), "Sun-Priest of the Lost", "a researched vcoTitle is the badge");
});

test("the plan fact row renders the three cards with badged objective/reward claims and omits an absent card", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);
  const view = PlanView({ lord: lord.value, route: route.value });
  const cards = factCards(view);

  // the fully-carried committed route renders exactly the three cards, in
  // the DESIGN order, each carrying the mapped field
  assert.deepEqual(
    cards.map((card) => {
      const eyebrow = recordVNodes(card).find((n) => n.props.className === "plan-fact__eyebrow");
      return eyebrow === undefined ? undefined : String(eyebrow.children[0]);
    }),
    ["PURPOSE", "WHAT ACTUALLY WINS", "LIKELY BOTTLENECK"],
    "the three fact cards render in the DESIGN order",
  );
  assert.ok(
    vnodeText(cards[0]).includes("Nuln’s black-powder soldiery and the knights of Morr"),
    "the PURPOSE card carries the interpretation",
  );
  assert.ok(
    vnodeText(cards[2]).includes("Finishing the last surviving faction"),
    "the LIKELY BOTTLENECK card carries the bottleneck",
  );

  // WHAT ACTUALLY WINS: the objective + reward claims as badged rows with
  // their resolved source links (route 1's verify-in-campaign states)
  const wins = recordVNodes(cards[1]);
  const claimLabels = wins.filter(
    (n) => n.props.className === "claim-block__label" && n.children.length === 1 && typeof n.children[0] === "string",
  );
  assert.deepEqual(
    claimLabels.map((n) => String(n.children[0])),
    ["Objective", "Reward"],
    "the wins card renders the objective + reward claim blocks",
  );
  const winsBadges = badgeVNodes(cards[1]);
  assert.equal(winsBadges.length, 2, "exactly the two identity claims are badged on the wins card");
  assert.ok(
    winsBadges.every((n) => n.props.state === "verify-in-campaign"),
    "route 1's objective/reward claims carry their verify-in-campaign states",
  );
  const srcLinks = winsBadges.flatMap((badge) =>
    recordVNodes(expandBadge(badge)).filter((n) => n.tag === "a" && n.props.className === "confidence-badge__src"),
  );
  assert.equal(srcLinks.length, 2, "each claim trails its resolved source link");
  assert.ok(
    srcLinks.every((l) => l.props.href === "https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084"),
    "the claims resolve to the committed vco-guide url",
  );

  // an absent field omits its card — never an empty card
  const noBottleneck: Route = { ...route.value, bottleneck: undefined };
  const noBottleneckCards = factCards(PlanView({ lord: lord.value, route: noBottleneck }));
  assert.deepEqual(
    noBottleneckCards.map((card) =>
      String(recordVNodes(card).find((n) => n.props.className === "plan-fact__eyebrow")?.children[0]),
    ),
    ["PURPOSE", "WHAT ACTUALLY WINS"],
    "a route without a bottleneck renders exactly two cards",
  );
  const noInterpretation: Route = { ...route.value, interpretation: undefined };
  const noInterpretationCards = factCards(PlanView({ lord: lord.value, route: noInterpretation }));
  assert.deepEqual(
    noInterpretationCards.map((card) =>
      String(recordVNodes(card).find((n) => n.props.className === "plan-fact__eyebrow")?.children[0]),
    ),
    ["WHAT ACTUALLY WINS", "LIKELY BOTTLENECK"],
    "a route without an interpretation renders exactly two cards",
  );
});

test("the plan's section walk keeps the tree ids, adds the phase numerals, and links transitions on the plan grammar", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);
  const view = PlanView({ lord: lord.value, route: route.value });
  const text = vnodeText(view);

  // the eight slots in registry order — the six registry sections then the
  // two declared transitions — each H2 keeping the tree's anchor id
  const headings = planHeadings(view);
  assert.deepEqual(
    headings.map((h) => h.props.id),
    [
      "opening",
      "early-mid",
      "mid-late",
      "victory-push",
      "territory-policy",
      "diplomacy",
      "transition-route-2",
      "transition-route-3",
    ],
    "the section H2 ids are the tree's anchor ids, unchanged, in registry order",
  );

  // the six registry sections carry their walk-order numerals as a rendered
  // prefix (1 Opening, 2 Early → Mid, …, 6 Diplomacy)
  const expectedNumerals: Array<[id: string, numeral: string | undefined]> = [
    ["opening", "1"],
    ["early-mid", "2"],
    ["mid-late", "3"],
    ["victory-push", "4"],
    ["territory-policy", "5"],
    ["diplomacy", "6"],
  ];
  for (const [id, numeral] of expectedNumerals) {
    const heading = headings.find((h) => h.props.id === id);
    assert.ok(heading !== undefined, `the ${id} section heading renders`);
    const numeralSpan = recordVNodes(heading).find((n) => n.props.className === "route-section__numeral");
    assert.equal(
      numeralSpan === undefined ? undefined : String(numeralSpan.children[0]),
      numeral,
      `the ${id} heading carries its walk-order numeral`,
    );
  }
  assert.ok(
    vnodeText(headings[0]).includes("Opening"),
    "the first section heading renders the numeral prefix + the title",
  );

  // the transition sections render unnumbered with their ids unchanged, and
  // their headings are cross-links on the NEW grammar targeting the real
  // Opening ids of the target routes
  for (const id of ["transition-route-2", "transition-route-3"]) {
    const heading = headings.find((h) => h.props.id === id);
    assert.ok(heading !== undefined, `the ${id} transition heading renders`);
    assert.ok(
      !recordVNodes(heading).some((n) => n.props.className === "route-section__numeral"),
      `the ${id} transition heading renders unnumbered`,
    );
  }
  const links = transitionAnchors(view);
  assert.deepEqual(
    links.map((a) => [String(a.children[0]), a.props.href]),
    [
      ["Transition → route-2", "#/elspeth-von-draken/plan/route-2/opening"],
      ["Transition → route-3", "#/elspeth-von-draken/plan/route-3/opening"],
    ],
    "Route I's two transition headings are anchors with new-grammar plan hrefs into the actual Opening ids",
  );

  // the F3 source panel renders on the claim-citing Opening section
  const opening = sectionSubtree(view, "opening");
  assert.equal(
    opening.filter((n) => n.props.className === "source-panel").length,
    1,
    "the citing Opening section renders its source panel on the plan",
  );
  assert.equal(
    opening.filter((n) => n.props.className === "source-panel__entry").length,
    1,
    "the Opening panel lists its single distinct source once",
  );
  const openingTitleLink = opening.find((n) => n.tag === "a" && n.props.className === "source-panel__title");
  assert.equal(String(openingTitleLink?.children[0]), "VCO • author’s route objectives", "the entry is the resolved vco-guide title link");
  assert.equal(countOccurrences(text, "CONTENT GAP"), 0, "no gap marker on the committed Route I plan");
});

test("the plan aside renders the five-moves cards from route.phases and collapses cleanly when phases is absent", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const view = PlanView({ lord: lord.value, route: route.value });
  const nodes = recordVNodes(view);
  const aside = nodes.find((n) => n.props.className === "plan-aside");
  assert.ok(aside !== undefined, "the aside renders for a phases-carrying route");
  const asideNodes = recordVNodes(aside);
  const title = asideNodes.find((n) => n.props.className === "plan-aside__title");
  assert.equal(String(title?.children[0]), "The operation in five moves", "the fixed aside title");

  const moves = asideNodes.filter((n) => n.props.className === "plan-move");
  assert.equal(moves.length, 5, "one card per committed Route I phase");
  assert.deepEqual(
    moves.map((move) => {
      const numeral = recordVNodes(move).find((n) => n.props.className === "plan-move__numeral");
      return numeral === undefined ? undefined : String(numeral.children[0]);
    }),
    ["1", "2", "3", "4", "5"],
    "the move cards carry serif numerals 1..5 in committed order",
  );
  const first = recordVNodes(moves[0]);
  assert.equal(
    String(first.find((n) => n.props.className === "plan-move__title")?.children[0]),
    "Give Nuln breathing room",
    "the first move card carries its committed title",
  );
  assert.equal(
    String(first.find((n) => n.props.className === "plan-move__note")?.children[0]),
    "Win the starting war without creating three additional fronts.",
    "…and its committed note",
  );
  const last = recordVNodes(moves[4]);
  assert.equal(
    String(last.find((n) => n.props.className === "plan-move__title")?.children[0]),
    "Claim the victory, then defend the city",
    "the fifth card renders the closing move",
  );
  const track = nodes.find((n) => String(n.props.className ?? "").split(/\s+/).includes("plan-track"));
  assert.equal(String(track?.props.className), "plan-track", "the two-track container carries the atlas split while the aside is present");

  // a route without `phases` collapses the left track to full width — no
  // aside element and no empty card anywhere
  const noPhases: Route = { ...route.value, phases: undefined };
  const collapsed = recordVNodes(PlanView({ lord: lord.value, route: noPhases }));
  assert.ok(
    collapsed.some((n) => String(n.props.className) === "plan-track plan-track--full"),
    "the track container switches to the full-width class when the aside is absent",
  );
  assert.ok(
    !collapsed.some((n) => n.props.className === "plan-aside"),
    "no aside element renders at all (never an empty card)",
  );
  assert.ok(
    !collapsed.some((n) => n.props.className === "plan-move"),
    "no move card renders without phases",
  );
});

test("the plan's VCO undercard and campaign action region render the moved start/open/blocked/none states", async () => {
  const { lord, route } = await ledgerInputs();

  // the moved undercard renders over the plan, below the two-track body
  const startView = PlanView({ lord, route, campaign: { index: readyIndex([]), onStart: () => {}, startError: null } });
  const startText = vnodeText(startView);
  assert.ok(startText.includes("VCO OBJECTIVES"), "the moved undercard eyebrow renders on the plan");
  assert.ok(
    startText.includes("battles-35") && startText.includes("Win 35 battles"),
    "the committed undercard rows render below the body",
  );

  // start: no active campaign
  const startRegion = campaignRegion(startView);
  assert.ok(startRegion !== undefined, "the start action renders while no campaign is active");
  const start = recordVNodes(startRegion).find((n) => n.tag === "button" && hasClass(n, "button--primary"));
  assert.equal(String(start?.children[0]), "Start ledger", "the start action keeps its label");
  assert.equal(typeof start?.props.onClick, "function", "the start button is wired to the onStart handler");

  // open: the active campaign is this route's
  const openView = PlanView({
    lord,
    route,
    campaign: {
      index: readyIndex([
        { lordSlug: "elspeth-von-draken", routeId: "route-1", status: "active", updatedAt: "2026-10-03T00:00:00.000Z" },
      ]),
      onStart: () => {},
      startError: null,
    },
  });
  const openRegion = campaignRegion(openView);
  assert.ok(openRegion !== undefined, "the open action region renders for the active campaign");
  const open = recordVNodes(openRegion).find((n) => n.tag === "a" && hasClass(n, "button--primary"));
  assert.equal(vnodeText(open).trim(), "Open ledger", "the open action keeps its label");
  assert.equal(open?.props.href, "#/elspeth-von-draken/ledger/route-1", "the open link keeps the exact ledger hash");

  // blocked: a different route's campaign is active
  const blockedView = PlanView({
    lord,
    route,
    campaign: {
      index: readyIndex([
        { lordSlug: "elspeth-von-draken", routeId: "route-2", status: "active", updatedAt: "2026-10-03T00:00:00.000Z" },
      ]),
      onStart: () => {},
      startError: null,
    },
  });
  const blocked = campaignRegion(blockedView);
  assert.ok(blocked !== undefined, "the blocked message region renders");
  assert.ok(vnodeText(blocked).includes("A campaign is already active"), "the blocked message renders");
  assert.equal(
    recordVNodes(blocked).find((n) => n.tag === "a")?.props.href,
    "#/elspeth-von-draken/ledger/route-2",
    "the blocked message links the active campaign's own ledger hash",
  );

  // none: this route's own file is corrupt — neither start nor open
  const noneView = PlanView({
    lord,
    route,
    campaign: {
      index: readyIndex([
        { lordSlug: "elspeth-von-draken", routeId: "route-1", status: "corrupt", updatedAt: null },
      ]),
      onStart: () => {},
      startError: null,
    },
  });
  assert.ok(campaignRegion(noneView) === undefined, "a corrupt own file offers no action region on the plan");
  assert.ok(!vnodeText(noneView).includes("Start ledger"), "start is not offered over a corrupt file");
  assert.ok(!vnodeText(noneView).includes("Open ledger"), "open is not offered for a corrupt file");
});

test("the plan's panel strip links the three detail pages and the VCO ledger for the current route", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found);

  const view = PlanView({ lord: lord.value, route: route.value });
  const strip = recordVNodes(view).find((n) => n.props.className === "plan-strip");
  assert.ok(strip !== undefined, "the panel strip renders");
  const links = recordVNodes(strip).filter((n) => n.tag === "a" && n.props.className === "plan-strip__link");
  assert.deepEqual(
    links.map((l) => l.props.href),
    [
      "#/elspeth-von-draken/armies/route-1",
      "#/elspeth-von-draken/settlements/route-1",
      "#/elspeth-von-draken/workshop/route-1",
      "#/elspeth-von-draken/ledger/route-1",
    ],
    "the four strip links target the current route's detail pages and ledger (new grammar)",
  );
  assert.deepEqual(
    links.map((l) => String(l.children[0])),
    ["Armies & skills", "Settlements & economy", "Faction workshop", "VCO ledger"],
    "the strip links carry the page copy",
  );

  // the strip is route-scoped: the same plan over route-2 targets route-2
  const route2 = getRoute(tree, "elspeth-von-draken", "route-2");
  assert.ok(route2.found);
  const strip2 = recordVNodes(PlanView({ lord: lord.value, route: route2.value })).find(
    (n) => n.props.className === "plan-strip",
  );
  const hrefs2 = recordVNodes(strip2)
    .filter((n) => n.tag === "a" && n.props.className === "plan-strip__link")
    .map((n) => n.props.href);
  assert.deepEqual(
    hrefs2,
    [
      "#/elspeth-von-draken/armies/route-2",
      "#/elspeth-von-draken/settlements/route-2",
      "#/elspeth-von-draken/workshop/route-2",
      "#/elspeth-von-draken/ledger/route-2",
    ],
    "route-scoped strip: the current route's id in every href",
  );
});

// ─── The route plan's moved section-walk proofs (ports from the deleted ──────
// route suite: the registry-walk, transition, source-panel, gap-marker, and
// undercard behaviours the route page carried moved to the plan page in
// Commit 5; these equivalents prove them on the plan grammar).

test("the plan's section walk renders present sections interleaved with gap markers at registry positions", async () => {
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
      const view = PlanView({ lord: lord.value, route: route.value });
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
    },
  );
});

test("the six committed transition anchors resolve, via getRoute/getSection, to rendered H2 ids on the plan grammar", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);

  // DESIGN §7 acceptance item 1: every committed route renders its two
  // transition sections as same-lord anchors in body order, each naming the
  // target route's Opening section tree id — now on the plan grammar
  const anchors: VNodeRecord[] = [];
  for (const routeId of ["route-1", "route-2", "route-3"]) {
    const route = getRoute(tree, "elspeth-von-draken", routeId);
    assert.ok(route.found);
    anchors.push(...transitionAnchors(PlanView({ lord: lord.value, route: route.value })));
  }
  assert.deepEqual(
    anchors.map((a) => a.props.href),
    [
      "#/elspeth-von-draken/plan/route-2/opening",
      "#/elspeth-von-draken/plan/route-3/opening",
      "#/elspeth-von-draken/plan/route-1/opening",
      "#/elspeth-von-draken/plan/route-3/opening",
      "#/elspeth-von-draken/plan/route-1/opening",
      "#/elspeth-von-draken/plan/route-2/opening",
    ],
    "the six committed anchors in route/body order, each into the target's Opening (plan grammar)",
  );

  // every href target resolves through the pure query surface and is a
  // rendered H2 id in the same loaded tree — never an invented or stale id
  for (const anchor of anchors) {
    const parts = String(anchor.props.href).split("/");
    assert.equal(parts.length, 5, "each href follows the #/<lord>/plan/<id>/<section-id> grammar");
    const lordSlug = parts[1] as string;
    const routeId = parts[3] as string;
    const sectionId = parts[4] as string;
    const route = getRoute(tree, lordSlug, routeId);
    assert.ok(route.found, `the ${String(anchor.props.href)} target route resolves`);
    const section = getSection(tree, lordSlug, routeId, sectionId);
    assert.ok(section.found, `the ${String(anchor.props.href)} target section resolves`);
    assert.equal(section.value.title, "Opening", "every transition link targets the destination's Opening section");
    assert.ok(
      recordVNodes(PlanView({ lord: lord.value, route: route.value })).some(
        (n) => n.tag === "h2" && n.props.id === sectionId,
      ),
      `the "${sectionId}" id is a rendered H2 in the ${routeId} plan view`,
    );
  }
});

test("a transition whose target Opening is a declared gap links the plan page top instead", async () => {
  await inContentCopy(
    async (root) => {
      // The target rule needs a route whose Opening is a declared gap: the
      // copy removes route-2's required-section bodies and declares all four
      // in gaps — the required-order rule accepts no other shape (a present
      // Early → Mid after a missing Opening would be out of order).
      let routeTwo = await readFile(join(root, "elspeth-von-draken/routes/route-2.md"), "utf8");
      routeTwo = routeTwo
        .replace(/## Opening\n\n[\s\S]*?(?=\n## Early → Mid)/, "")
        .replace(/## Early → Mid\n\n[\s\S]*?(?=\n## Mid → Late)/, "")
        .replace(/## Mid → Late\n\n[\s\S]*?(?=\n## Victory push)/, "")
        .replace(/## Victory push\n\n[\s\S]*?(?=\n## Territory policy)/, "");
      routeTwo = routeTwo.replace(
        "gaps:\n  - Transition → route-1\n  - Transition → route-3\n",
        ["gaps:", "  - Opening", "  - Early → Mid", "  - Mid → Late", "  - Victory push", "  - Transition → route-1", "  - Transition → route-3", ""].join("\n"),
      );
      await writeFile(join(root, "elspeth-von-draken/routes/route-2.md"), routeTwo);
    },
    async (root) => {
      assert.deepEqual(await lintContent(fsReader(root)), [], "the gap-Opening copy stays valid per the shared lint");

      const tree = await loadContentTree(fsReader(root));
      const lord = getLord(tree, "elspeth-von-draken");
      assert.ok(lord.found);

      // the mutant target actually lost its Opening section (now a declared gap)
      assert.equal(
        getSection(tree, "elspeth-von-draken", "route-2", "opening").found,
        false,
        "route-2's Opening is now a declared gap — no rendered section exists",
      );

      // Route I's link into route-2 drops the section segment — the plan
      // page top — while its link into the still-present route-3 Opening
      // keeps the section segment
      const routeOne = getRoute(tree, "elspeth-von-draken", "route-1");
      assert.ok(routeOne.found);
      const links = transitionAnchors(PlanView({ lord: lord.value, route: routeOne.value }));
      assert.deepEqual(
        links.map((a) => [String(a.children[0]), a.props.href]),
        [
          ["Transition → route-2", "#/elspeth-von-draken/plan/route-2"],
          ["Transition → route-3", "#/elspeth-von-draken/plan/route-3/opening"],
        ],
        "a gap-Opening target links the plan page top; a present Opening keeps the section segment",
      );
    },
  );
});

test("a transition title removed from the body but still declared in gaps keeps the inert content gap marker on the plan", async () => {
  await inContentCopy(
    async (root) => {
      // Route I's second transition section is removed while its title stays
      // declared in frontmatter gaps: the registry slot must then render the
      // in-flow Content Gap Marker, never an anchor and never a broken href.
      const routeOne = await readFile(join(root, "elspeth-von-draken/routes/route-1.md"), "utf8");
      const truncated = routeOne.replace(/## Transition → route-3\n\n[\s\S]*$/, "");
      await writeFile(join(root, "elspeth-von-draken/routes/route-1.md"), truncated);
    },
    async (root) => {
      assert.deepEqual(await lintContent(fsReader(root)), [], "the transition-gap copy stays valid per the shared lint");

      const tree = await loadContentTree(fsReader(root));
      const lord = getLord(tree, "elspeth-von-draken");
      assert.ok(lord.found);
      const route = getRoute(tree, "elspeth-von-draken", "route-1");
      assert.ok(route.found);
      const view = PlanView({ lord: lord.value, route: route.value });
      const text = vnodeText(view);

      // the declared gap renders its inert marker at the registry slot; the
      // surviving transition section keeps its anchor
      const markerFor = (title: string): string => `"${title}" is a declared gap — it has not been written yet.`;
      assert.ok(
        text.includes(markerFor("Transition → route-3")),
        "the body-less declared transition renders the Content Gap Marker",
      );
      assert.equal(countOccurrences(text, "CONTENT GAP"), 1, "exactly the one declared transition renders its marker");
      const links = transitionAnchors(view);
      assert.deepEqual(
        links.map((a) => [String(a.children[0]), a.props.href]),
        [["Transition → route-2", "#/elspeth-von-draken/plan/route-2/opening"]],
        "the surviving transition section still renders its anchor — the marker branch carries none",
      );
    },
  );
});

test("an unresolvable transition title renders the plain H2 with no anchor on the plan (constructed route)", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const committedRoute = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(committedRoute.found);

  // The lint rejects a transition title naming no other same-lord route, so
  // no loader-built tree can hold this shape; the view-invariant guard (a
  // plain, non-link H2) is proven with a hand-built route over the committed
  // lord, reusing the loaded committed claim values.
  const route: Route = {
    id: "ghost-route",
    number: "I",
    name: "The Ghost Route",
    vcoTitle: null,
    objective: committedRoute.value.objective,
    reward: committedRoute.value.reward,
    gaps: ["Transition → nosuchroute"],
    sections: [
      {
        id: "transition-nosuchroute",
        title: "Transition → nosuchroute",
        html: "<h2>Transition → nosuchroute</h2><p>Nowhere to go.</p>",
      },
    ],
    claims: [],
  };
  const nodes = recordVNodes(PlanView({ lord: lord.value, route }));

  const heading = nodes.find((n) => n.tag === "h2" && n.props.id === "transition-nosuchroute");
  assert.ok(heading !== undefined, "the unresolvable transition title renders its section H2");
  assert.equal(
    heading.props.className,
    "route-section__heading",
    "the plain H2 keeps the heading's anatomy (its tree id remains the router anchor)",
  );
  assert.ok(
    !recordVNodes(heading).some((n) => n.tag === "a"),
    "an unresolvable transition renders the plain H2 — no anchor element and no broken href",
  );
  assert.ok(
    !nodes.some((n) => n.tag === "a" && n.props.className === "route-section__heading-link"),
    "no transition-link markup appears anywhere in the view",
  );
});

test("the committed route-2 and route-3 walks render their eight registry sections in order with phase leads and no gap markers", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);

  const byRoute: Array<[routeId: string, order: string[], phaseLead: string]> = [
    [
      "route-2",
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
      "Make the departure affordable",
    ],
    [
      "route-3",
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
      "Prepare the expedition, not an entire Empire reconquest",
    ],
  ];
  for (const [routeId, order, phaseLead] of byRoute) {
    const route = getRoute(tree, "elspeth-von-draken", routeId);
    assert.ok(route.found);
    const text = vnodeText(PlanView({ lord: lord.value, route: route.value }));

    for (let i = 0; i < order.length; i++) {
      const title = order[i] as string;
      assert.ok(text.includes(title), `${routeId} renders the "${title}" section heading`);
      if (i > 0) {
        assert.ok(
          text.indexOf(order[i - 1] as string) < text.indexOf(title),
          `${routeId} keeps "${order[i - 1]}" before "${title}" in registry order`,
        );
      }
    }
    assert.ok(text.includes(phaseLead), `${routeId} renders its Opening phase lead`);
    assert.equal(countOccurrences(text, "CONTENT GAP"), 0, `no gap marker anywhere on the migrated ${routeId}`);
  }
});

test("source panels render under citing plan sections with the source as a title link and its note", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const routeOne = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(routeOne.found);
  const viewOne = PlanView({ lord: lord.value, route: routeOne.value });

  const vcoGuideTitle = "VCO • author’s route objectives";
  const vcoGuideUrl = "https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084";

  // a section with no callouts keeps its plain anatomy: no panel markup and
  // no SOURCE text anywhere in the section's subtree (never a blank slot)
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
    const view = PlanView({ lord: lord.value, route: route.value });
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

      const url = subtree.find((n) => n.tag === "p" && n.props.className === "source-panel__url");
      assert.equal(String(url?.children[0]), vcoGuideUrl, `the ${routeId} "${sectionId}" panel lists the source url`);
    }
  }
});

test("a section citing the same source twice renders the source once in its plan panel", async () => {
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

      const view = PlanView({ lord: lord.value, route: route.value });
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

test("every committed route renders the plan's VCO undercard with its item counts and per-item badge anatomy", async () => {
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
    const view = PlanView({ lord: lord.value, route: route.value });
    const text = vnodeText(view);

    // the undercard renders on every committed route: mono eyebrow plus one row
    // per item carrying the stable id and the atlas text, below the plan body
    assert.ok(text.includes("VCO OBJECTIVES"), `${routeId} renders the undercard's mono eyebrow`);
    assert.ok(text.includes(probeId), `${routeId} renders the "${probeId}" item id`);
    assert.ok(text.includes(probeText), `${routeId} renders the "${probeId}" item text verbatim`);

    // badge anatomy: the fact-row objective + reward claims and every vco item
    // are Confidence Badged with their own state colour classes, mono uppercase
    // labels and one resolved source link each
    const badges = badgeVNodes(view);
    assert.equal(
      badges.length,
      2 + itemCount,
      `${routeId} the two fact-row claims plus its ${itemCount} vco items are Confidence Badged`,
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
    assert.equal(srcLinks.length, 2 + itemCount, `${routeId} each src-carrying claim and item trails its resolved source link`);
    assert.ok(
      srcLinks.every((l) => l.props.href === "https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084"),
      `${routeId} every committed claim and item resolves to the vco-guide url`,
    );
  }
});

test("the fixture plan's VCO undercard renders per-item badges with their own states and src links", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const lord = getLord(tree, "als-rhyn-of-lorek");
  assert.ok(lord.found);
  const route = getRoute(tree, "als-rhyn-of-lorek", "dark-conduits");
  assert.ok(route.found);
  const view = PlanView({ lord: lord.value, route: route.value });
  const text = vnodeText(view);

  // the undercard: mono eyebrow + one row per item with the id, text and badge
  assert.ok(text.includes("VCO OBJECTIVES"), "the undercard's mono eyebrow");
  assert.ok(text.includes("obj-conduits"), "the first stable objective id");
  assert.ok(text.includes("Secure all three southeast dark conduit settlements."), "the first item's text");
  assert.ok(text.includes("obj-casket"), "the second stable objective id");
  assert.ok(text.includes("Unlock the Casket of Souls quest chain."), "the second item's text");

  // every vco item is a Confidence Badge-carrying row: the fixture's two items
  // render alongside the two fact-row claims, with per-item labels + state
  // colour classes + resolved source links
  const badges = badgeVNodes(view);
  assert.equal(badges.length, 4, "the objective + reward claims and both vco items are Confidence Badged");
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
    "casket resolves for the reward claim and obj-casket",
  );
});

test("transitionTarget mirrors the lint's isKnownSectionTitle: id or name match, real Opening tree id, null otherwise", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);

  assert.deepEqual(
    transitionTarget(lord.value, "Transition → route-2"),
    { targetId: "route-2", openingSectionId: "opening" },
    "an id-named transition resolves to the target route id and its real Opening tree id",
  );
  assert.deepEqual(
    transitionTarget(lord.value, "Transition → The Southern Charter"),
    { targetId: "route-2", openingSectionId: "opening" },
    "a name-named transition resolves the same way — the lint's id-or-name scoping",
  );
  assert.equal(transitionTarget(lord.value, "Transition → nosuchroute"), null, "an unmatched suffix resolves to null");
  assert.equal(transitionTarget(lord.value, "Opening"), null, "a non-transition title is not a target");
});

// ─── The detail pages (package `detail-pages-view`) ────────────────────────

/** The armies page's tabpanel VNodes in tab order. */
function armiesTabpanels(nodes: VNodeRecord[]): VNodeRecord[] {
  return nodes.filter((n) => n.props.role === "tabpanel");
}

/** The armies page's tab VNodes in tab order. */
function armiesTabs(nodes: VNodeRecord[]): VNodeRecord[] {
  return nodes.filter((n) => n.props.role === "tab");
}

/** The committed Elspeth tree resolved once for the panel-page proofs. */
async function committedPanelInputs() {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found, "the committed lord loads");
  const route = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(route.found, "route-1 resolves");
  return { lord: lord.value, route: route.value };
}

/**
 * The DeskPanel exactly as the view composes it: its recorded props at the
 * view seam, then the same props expanded through the pure `DeskPanel`
 * builder — the zero-DOM equivalent of letting the view's child component
 * render (the seam pattern the deleted `mountedTabStrip` helper established).
 */
function mountedDeskPanel(view: unknown): { nodes: VNodeRecord[]; text: string } {
  const desk = recordVNodes(view).find(
    (n) => typeof n.props.numeral === "string" && typeof n.props.group === "string",
  );
  assert.ok(desk !== undefined, "the view composes the desk panel");
  const markup = DeskPanel({
    numeral: String(desk.props.numeral),
    group: desk.props.group as PanelGroup,
    title: String(desk.props.title),
    lord: desk.props.lord as Lord,
    entries: desk.props.entries as readonly Army[] | readonly Item[],
  });
  return { nodes: recordVNodes(markup), text: vnodeText(markup) };
}

/** Each armies tabpanel's desk panel, expanded in tab order. */
function armiesPanels(lord: Lord, route: Route, activeTab = 0): Array<{ nodes: VNodeRecord[]; text: string }> {
  const tabpanels = armiesTabpanels(recordVNodes(ArmiesMarkup({ lord, route, activeTab })));
  assert.equal(tabpanels.length, 3, "the armies page renders three tabpanels");
  return tabpanels.map((panel) => mountedDeskPanel(panel));
}

test("the armies page renders the toolbar, the three panel tabs in order, and exactly one visible tabpanel", async () => {
  const { lord, route } = await committedPanelInputs();
  const nodes = recordVNodes(ArmiesMarkup({ lord, route, activeTab: 0 }));

  // the desk toolbar: serif page title + the "ROUTE <n> · <name>" context line
  const title = nodes.find((n) => n.props.className === "panel-page__title");
  assert.equal(title?.tag, "h1", "the page title is the headline element");
  assert.equal(String(title?.children[0]), "Armies & skills", "the DESIGN page copy renders");
  const context = nodes.find((n) => n.props.className === "panel-page__context");
  assert.equal(
    String(context?.children[0]),
    "ROUTE I · The Graveyard Watch",
    "the mono context line reads ROUTE <n> · <name>",
  );

  // the three panel tabs in render order with roving tabindex at tab zero
  const tabs = armiesTabs(nodes);
  assert.deepEqual(
    tabs.map((t) => t.children[0]),
    ["Armies", "Skills", "Research"],
    "the three panel tabs render in order",
  );
  assert.equal(tabs[0]?.props.tabIndex, 0, "the first tab is tabbable at the initial selection");
  assert.equal(tabs[0]?.props["aria-selected"], true, "the first tab is the selected one");
  for (let index = 1; index < tabs.length; index++) {
    assert.equal(tabs[index]?.props.tabIndex, -1, `tab ${index} roves out of tab order`);
    assert.equal(tabs[index]?.props["aria-selected"], false, `tab ${index} is not selected`);
  }

  // exactly one visible tabpanel at the initial selection
  const panels = armiesTabpanels(nodes);
  assert.equal(panels.length, 3, "one tabpanel per panel");
  assert.equal(panels[0]?.props.hidden, false, "the first panel is the visible one");
  assert.ok(panels.slice(1).every((p) => p.props.hidden === true), "every other panel is hidden");
});

test("each armies panel renders its committed Route I head and rows in panelOrder order", async () => {
  const { lord, route } = await committedPanelInputs();
  const panels = armiesPanels(lord, route, 0);

  // the panel heads carry the Roman indices and serif titles of the desk
  // cards I–III (the atlas's armies/skills/research split)
  const specs: Array<{ index: string; title: string; count: number; first: string; second: string }> = [
    { index: "I", title: "Army templates", count: 5, first: "The first Nuln column", second: "The Countess’s field company" },
    { index: "II", title: "Lord & hero skills", count: 10, first: "Elspeth", second: "Master Engineer" },
    { index: "III", title: "Research priorities", count: 4, first: "A working army before luxury research", second: "Infantry, artillery and the escort" },
  ];
  for (let index = 0; index < panels.length; index++) {
    const spec = specs[index];
    assert.ok(spec !== undefined);
    const panel = panels[index];
    assert.ok(panel !== undefined);
    const headIndex = panel.nodes.find((n) => n.props.className === "desk-panel__index");
    assert.equal(String(headIndex?.children[0]), spec.index, `panel ${index} carries numeral ${spec.index}`);
    const headTitle = panel.nodes.find((n) => n.props.className === "desk-panel__title");
    assert.equal(String(headTitle?.children[0]), spec.title, `panel ${index} carries its serif title`);
    const entries = panel.nodes.filter(
      (n) => n.tag === "article" && String(n.props.className).includes("panel-entry"),
    );
    assert.equal(entries.length, spec.count, `the ${spec.title} panel renders its ${spec.count} resolved entries`);
    assert.ok(panel.text.includes(spec.first), "the panelOrder first entry renders");
    assert.ok(panel.text.indexOf(spec.first) < panel.text.indexOf(spec.second), "entries render in panelOrder order");
  }

  // the armies page never renders the buildings or mechanics rows (the fixed split)
  const joined = panels.map((panel) => panel.text).join(" ");
  assert.ok(!joined.includes("Safe income town"), "no buildings row on the armies page");
  assert.ok(!joined.includes("Field Testing · unlock what the army will use"), "no mechanics row on the armies page");
});

test("the settlements page renders the buildings panel under its toolbar", async () => {
  const { lord, route } = await committedPanelInputs();
  const view = SettlementsView({ lord, route });
  const nodes = recordVNodes(view);
  const { nodes: panelNodes, text } = mountedDeskPanel(view);

  const title = nodes.find((n) => n.props.className === "panel-page__title");
  assert.equal(String(title?.children[0]), "Settlements & economy", "the DESIGN page copy renders");
  const context = nodes.find((n) => n.props.className === "panel-page__context");
  assert.equal(String(context?.children[0]), "ROUTE I · The Graveyard Watch", "the context line reads ROUTE <n> · <name>");

  const headIndex = panelNodes.find((n) => n.props.className === "desk-panel__index");
  assert.equal(String(headIndex?.children[0]), "IV", "the single panel head carries desk numeral IV");
  const headTitle = panelNodes.find((n) => n.props.className === "desk-panel__title");
  assert.equal(String(headTitle?.children[0]), "Settlement builds", "the serif panel title renders");
  const entries = panelNodes.filter((n) => n.tag === "article" && String(n.props.className).includes("panel-entry"));
  assert.equal(entries.length, 6, "the six committed buildings entries render");
  assert.ok(text.includes("Nuln · foundry and field-test centre"), "the panelOrder first row renders");
  assert.ok(!text.includes("Field Testing · unlock what the army will use"), "no mechanics row on the settlements page");
});

test("the workshop page renders the mechanics panel under its toolbar", async () => {
  const { lord, route } = await committedPanelInputs();
  const view = WorkshopView({ lord, route });
  const nodes = recordVNodes(view);
  const { nodes: panelNodes, text } = mountedDeskPanel(view);

  const title = nodes.find((n) => n.props.className === "panel-page__title");
  assert.equal(String(title?.children[0]), "Faction workshop", "the DESIGN page copy renders");
  const context = nodes.find((n) => n.props.className === "panel-page__context");
  assert.equal(String(context?.children[0]), "ROUTE I · The Graveyard Watch", "the context line reads ROUTE <n> · <name>");

  const headIndex = panelNodes.find((n) => n.props.className === "desk-panel__index");
  assert.equal(String(headIndex?.children[0]), "V", "the single panel head carries desk numeral V");
  const headTitle = panelNodes.find((n) => n.props.className === "desk-panel__title");
  assert.equal(String(headTitle?.children[0]), "Unique mechanics", "the serif panel title renders");
  const entries = panelNodes.filter((n) => n.tag === "article" && String(n.props.className).includes("panel-entry"));
  assert.equal(entries.length, 5, "the five committed mechanics entries render");
  assert.ok(text.includes("Field Testing · unlock what the army will use"), "the panelOrder first row renders");
  assert.ok(!text.includes("Safe income town"), "no buildings row on the workshop page");
});

test("the armies panel tabs wrap and bound at the three-tab count", () => {
  const count = 3;
  assert.equal(panelTabNav("left", 0, count), count - 1, "left from the first tab wraps to the last");
  assert.equal(panelTabNav("right", count - 1, count), 0, "right from the last tab wraps to the first");
  assert.equal(panelTabNav("home", 1, count), 0, "home jumps to the first tab");
  assert.equal(panelTabNav("end", 0, count), count - 1, "end jumps to the last tab");
});

test("the selection is component-local: the roving tabindex follows the active tab index", async () => {
  const { lord, route } = await committedPanelInputs();
  const nodes = recordVNodes(ArmiesMarkup({ lord, route, activeTab: 2 }));
  const tabs = armiesTabs(nodes);
  assert.equal(tabs[2]?.props.tabIndex, 0, "the selected tab is tabbable");
  assert.equal(tabs[2]?.props["aria-selected"], true, "the selected tab is marked");
  for (let index = 0; index < tabs.length; index++) {
    if (index === 2) continue;
    assert.equal(tabs[index]?.props.tabIndex, -1, `tab ${index} roves out of tab order`);
    assert.equal(tabs[index]?.props["aria-selected"], false, `tab ${index} is not selected`);
  }
  const panels = armiesTabpanels(nodes);
  assert.equal(panels[2]?.props.hidden, false, "the selected tab's panel is the visible one");
  assert.ok(panels.slice(0, 2).every((p) => p.props.hidden === true), "the others are hidden");
});

test("the detail pages are route-scoped: the toolbar context and the armies data follow the route", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const route2 = getRoute(tree, "elspeth-von-draken", "route-2");
  assert.ok(route2.found);

  const nodes = recordVNodes(ArmiesMarkup({ lord: lord.value, route: route2.value, activeTab: 0 }));
  const context = nodes.find((n) => n.props.className === "panel-page__context");
  assert.equal(String(context?.children[0]), "ROUTE II · The Southern Charter", "the context line follows the route");
  const [armiesPanel] = armiesPanels(lord.value, route2.value, 0);
  assert.ok(armiesPanel !== undefined);
  assert.ok(armiesPanel.text.includes("The southern charter column"), "route-2's own armies render");
  assert.ok(!armiesPanel.text.includes("The Black Rose procession"), "route-1's armies never render on route-2");
});

test("a panel page whose panelOrder lists no items renders the explicit empty state — never blank", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found);
  const committed = getRoute(tree, "elspeth-von-draken", "route-1");
  assert.ok(committed.found);

  // the constructed-route precedent: only the skills + buildings lists empty
  const emptied: Route = {
    ...committed.value,
    panelOrder: { ...committed.value.panelOrder, skills: [], buildings: [] },
  };
  const armiesNodes = recordVNodes(ArmiesMarkup({ lord: lord.value, route: emptied, activeTab: 1 }));
  const skillsPanel = armiesNodes.find((n) => n.props.id === "armies-panel-skills");
  assert.ok(skillsPanel !== undefined, "the skills tabpanel renders");
  const skills = mountedDeskPanel(skillsPanel);
  assert.ok(skills.text.includes("NO SKILLS YET"), "the mono empty label names the panel");
  assert.ok(skills.text.includes("No skills are listed for this route yet."), "the proportional sentence explains the state");
  assert.ok(
    skills.nodes.some((n) => n.props.className === "desk-panel__title"),
    "the empty panel keeps its head — never blank space",
  );

  const settlements = mountedDeskPanel(SettlementsView({ lord: lord.value, route: emptied }));
  assert.ok(settlements.text.includes("NO SETTLEMENTS YET"), "the settlements page carries its own empty panel");
  assert.ok(
    settlements.text.includes("No settlements are listed for this route yet."),
    "the proportional sentence explains the state",
  );
});

/** The className membership check used across the structural asserts. */
function hasClass(node: VNodeRecord, className: string): boolean {
  return String(node.props.className ?? "").split(/\s+/).includes(className);
}

/**
 * The LedgerTable exactly as the view composes it: its recorded props at the
 * view seam, then the same props expanded through the pure `LedgerTable`
 * component function — the zero-DOM equivalent of letting the view's child
 * component render (the `mountedTabStrip` precedent).
 */
function mountedLedgerTable(view: unknown): { props: LedgerTableProps; nodes: VNodeRecord[]; text: string } {
  const table = recordVNodes(view).find(
    (n) => typeof n.props.plannedCount === "number" && typeof n.props.confirmedCount === "number",
  );
  assert.ok(table !== undefined, "the view composes the ledger table");
  const props: LedgerTableProps = {
    rows: table.props.rows as LedgerTableProps["rows"],
    statuses: table.props.statuses as LedgerTableProps["statuses"],
    plannedCount: table.props.plannedCount as number,
    confirmedCount: table.props.confirmedCount as number,
    onTick: table.props.onTick as LedgerTableProps["onTick"],
    onStep: table.props.onStep as LedgerTableProps["onStep"],
  };
  const rendered = LedgerTable(props);
  const nodes = recordVNodes(rendered);
  return { props, nodes, text: vnodeText(rendered) };
}

/** The committed Elspeth tree resolved once for the ledger proofs. */
async function ledgerInputs() {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found, "the committed Elspeth guide loads");
  const route = getRoute(tree, lord.value.slug, "route-1");
  assert.ok(route.found, "route-1 resolves");
  return { lord: lord.value, route: route.value };
}

/**
 * A synthetic active campaign document over route-1's committed ids: stored
 * out of committed order, with every committed id present except one (the
 * missing id renders fresh) and one extra stored id the reconciliation must
 * drop — the DESIGN §4 items-follow-committed-content case. The stored
 * states: ids[2] planned at step 3, ids[4] unplanned at step 1.
 */
function syntheticCampaignDoc(lord: Lord, route: Route): CampaignDoc {
  const ids = getVcoObjectives(lord, route.id).map((item) => item.id);
  return {
    lordSlug: lord.slug,
    routeId: route.id,
    status: "active",
    createdAt: "2026-10-03T00:00:00.000Z",
    updatedAt: "2026-10-03T01:00:00.000Z",
    items: {
      [ids[2]]: { planned: true, confirmedStep: 3 },
      [ids[4]]: { planned: false, confirmedStep: 1 },
      "stale-extra-id": { planned: true, confirmedStep: 4 },
    },
  };
}

test("the ledger view loading phase renders the minimal mono in-flight line and nothing else", async () => {
  const { lord, route } = await ledgerInputs();
  const view = LedgerView({
    lord,
    route,
    phase: { kind: "loading" },
    rows: [],
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
  });
  const text = vnodeText(view);
  const nodes = recordVNodes(view);

  assert.ok(
    nodes.some((n) => hasClass(n, "ledger-inflight") && vnodeText(n).trim() === "LOADING"),
    "the page in-flight mono line renders while the document loads",
  );
  assert.ok(!nodes.some((n) => hasClass(n, "ledger-table")), "no table while loading");
  assert.ok(!nodes.some((n) => hasClass(n, "ledger-error")), "no error panel while loading");
  assert.ok(!text.includes("NO ACTIVE CAMPAIGN"), "no empty state while loading");
});

test("the ledger view ready phase renders the context header, the composed table in committed order, statuses, and progress", async () => {
  const { lord, route } = await ledgerInputs();
  const objectives = getVcoObjectives(lord, route.id);
  const ids = objectives.map((item) => item.id);
  const doc = syntheticCampaignDoc(lord, route);
  const rows = itemsFor(doc, ids);

  const onTick = (): void => {};
  const onStep = (): void => {};
  const statuses: Record<string, LedgerRowStatus> = {
    [ids[0]]: { phase: "saving", message: null },
    [ids[3]]: { phase: "error", message: "The write failed" },
  };
  const view = LedgerView({ lord, route, phase: { kind: "ready", doc }, rows, statuses, onRetry: () => {}, onTick, onStep, ...idleLifecycleProps() });
  const text = vnodeText(view);

  // the campaign context header: lord, route name, and the guide's patch/VCO
  // pairing exactly as the shared version-context helper derives it
  assert.ok(text.includes("Elspeth von Draken"), "the lord name renders in the context header");
  assert.ok(text.includes("The Graveyard Watch"), "the route name renders in the context header");
  assert.equal(countOccurrences(text, versionContext(lord)), 1, "the patch/VCO pairing renders exactly once");

  // the composed LedgerTable receives the reconciled rows with committed-order
  // labels, the passed-through statuses, the two progress counts, and the handlers
  const mounted = mountedLedgerTable(view);
  const rowsProp = mounted.props.rows;
  assert.equal(rowsProp.length, ids.length, "one table row per committed objective item");
  assert.deepEqual(
    rowsProp.map((row) => row.label),
    objectives.map((item) => item.text),
    "table rows carry the committed objective labels in committed order",
  );
  assert.equal(rowsProp[0].state.planned, false, "a stored-missing id renders fresh (unplanned)");
  assert.equal(rowsProp[0].state.confirmedStep, 0, "a stored-missing id renders fresh (step 0)");
  assert.equal(rowsProp[2].state.planned, true, "the stored tick survives reconciliation");
  assert.equal(rowsProp[2].state.confirmedStep, 3, "the stored step survives reconciliation");
  assert.equal(mounted.props.statuses, statuses, "the per-row status map passes through");
  assert.equal(mounted.props.plannedCount, 1, "progress counts exactly the reconciled planned rows");
  assert.equal(mounted.props.confirmedCount, 2, "progress counts exactly the reconciled step-1-4 rows");
  assert.equal(mounted.props.onTick, onTick, "the tick handler reaches the table");
  assert.equal(mounted.props.onStep, onStep, "the step handler reaches the table");

  // the rendered table shows the same rows in committed order — never doc
  // order and never the stored-extra id — with the per-row status feedback
  const rendered = mounted.nodes;
  assert.ok(
    mounted.text.indexOf(objectives[0].text) < mounted.text.indexOf(objectives[1].text) &&
      mounted.text.indexOf(objectives[1].text) < mounted.text.indexOf(objectives[5].text),
    "rows render in committed order",
  );
  assert.ok(!mounted.text.includes("stale-extra-id"), "a stored id removed from content renders no row");
  const rowsRendered = rendered.filter((n) => hasClass(n, "ledger-row"));
  assert.equal(rowsRendered.length, ids.length, "one rendered row per committed id");
  assert.equal(countOccurrences(mounted.text, objectives[0].text), 1, "the first committed item renders once");
  assert.ok(vnodeText(rowsRendered[0]).trim().endsWith("SAVING"), "the saving row shows the mono in-flight feedback");
  assert.ok(vnodeText(rowsRendered[3]).includes("The write failed"), "the failed row shows its error message");

  // the fixed n / m progress pairs render beside the group headers
  assert.equal(countOccurrences(mounted.text, "1 / 6"), 1, "the planning pair reads ticked / rows");
  assert.equal(countOccurrences(mounted.text, "2 / 6"), 1, "the confirmed pair reads reached / rows");
});

test("the ledger view renders the exact fixed empty state when the campaign document is absent — never blank", async () => {
  const { lord, route } = await ledgerInputs();
  const view = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc: null },
    rows: [],
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
  });
  const text = vnodeText(view);

  assert.ok(
    text.includes("NO ACTIVE CAMPAIGN — start one from the route plan"),
    "the DESIGN-fixed empty copy renders exactly",
  );
  assert.ok(text.trim().length > 0, "the page is never blank");
  assert.ok(!text.includes("SAVING"), "no table content in the empty state");
  assert.ok(!recordVNodes(view).some((n) => hasClass(n, "ledger-table")), "no table when no document exists");
});

test("the ledger view error phase renders the error-bordered panel with the message and Retry wired to onRetry", async () => {
  const { lord, route } = await ledgerInputs();
  const onRetry = (): void => {};
  const view = LedgerView({
    lord,
    route,
    phase: { kind: "error", message: "The campaign file could not be read" },
    rows: [],
    statuses: {},
    onRetry,
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
  });
  const nodes = recordVNodes(view);
  const panel = nodes.find((n) => hasClass(n, "ledger-error"));
  assert.ok(panel !== undefined, "the error panel renders");
  assert.ok(panel.props.role === "alert", "the panel announces itself");
  const panelNodes = recordVNodes(panel);
  assert.ok(panelNodes.some((n) => n.tag === "svg"), "the panel carries an icon (colour is never the sole indicator)");
  assert.ok(vnodeText(panel).includes("The campaign file could not be read"), "the body-md message renders");
  const retry = panelNodes.find((n) => n.tag === "button" && String(n.props.className ?? "").includes("button--ghost"));
  assert.ok(retry !== undefined, "the ghost Retry button renders");
  assert.equal(vnodeText(retry), "Retry", "the button copy is the fixed Retry label");
  assert.equal(retry.props.onClick, onRetry, "Retry is wired to the onRetry prop");
});

/** The idle lifecycle props: no confirmation open and nothing in flight — the live actions render. */
function idleLifecycleProps(): Pick<
  LedgerViewProps,
  "lifecycle" | "onComplete" | "onDelete" | "onConfirmLifecycle" | "onDismissLifecycle"
> {
  return {
    lifecycle: null,
    onComplete: () => {},
    onDelete: () => {},
    onConfirmLifecycle: () => {},
    onDismissLifecycle: () => {},
  };
}

test("an active campaign's lifecycle region offers mark complete (primary) and delete (destructive), wired to their actions", async () => {
  const { lord, route } = await ledgerInputs();
  const doc = syntheticCampaignDoc(lord, route); // the active campaign
  const rows = itemsFor(doc, getVcoObjectives(lord, route.id).map((item) => item.id));
  const onComplete = (): void => {};
  const onDelete = (): void => {};
  const view = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc },
    rows,
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
    onComplete,
    onDelete,
  });
  const region = recordVNodes(view).find((n) => hasClass(n, "ledger-lifecycle"));
  assert.ok(region !== undefined, "the lifecycle region renders under the table");
  const regionNodes = recordVNodes(region);
  const mark = regionNodes.find(
    (n) => n.tag === "button" && hasClass(n, "button--primary") && vnodeText(n) === "Mark complete",
  );
  assert.ok(mark !== undefined, "the active campaign offers the primary mark-complete action");
  assert.equal(mark.props.onClick, onComplete, "mark complete is wired to onComplete");
  const del = regionNodes.find(
    (n) => n.tag === "button" && hasClass(n, "button--danger") && vnodeText(n) === "Delete",
  );
  assert.ok(del !== undefined, "the active campaign offers the destructive delete action");
  assert.equal(del.props.onClick, onDelete, "delete is wired to onDelete");
  assert.ok(!vnodeText(region).includes("removed from disk"), "no confirmation copy while idle");
  assert.ok(!vnodeText(region).includes("keeps the archived file"), "no complete confirmation copy while idle");
});

test("the complete confirmation copy states the archived file is KEPT, with confirm and cancel wired", async () => {
  const { lord, route } = await ledgerInputs();
  const doc = syntheticCampaignDoc(lord, route);
  const rows = itemsFor(doc, getVcoObjectives(lord, route.id).map((item) => item.id));
  const onConfirmLifecycle = (): void => {};
  const onDismissLifecycle = (): void => {};
  const view = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc },
    rows,
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
    lifecycle: { kind: "confirm", action: "complete" },
    onConfirmLifecycle,
    onDismissLifecycle,
  });
  const panel = recordVNodes(view).find((n) => hasClass(n, "ledger-confirm"));
  assert.ok(panel !== undefined, "the confirmation surface renders in place of the actions");
  const text = vnodeText(panel);
  assert.ok(text.includes("keeps the archived file on disk"), "the copy names that the archived file is KEPT");
  assert.ok(!text.includes("removed from disk"), "the complete confirmation never names removal");
  const panelNodes = recordVNodes(panel);
  const confirmBtn = panelNodes.find(
    (n) => n.tag === "button" && hasClass(n, "button--primary") && vnodeText(n) === "Mark complete",
  );
  assert.ok(confirmBtn !== undefined, "the primary confirm action renders");
  assert.equal(confirmBtn.props.onClick, onConfirmLifecycle, "confirm is wired to onConfirmLifecycle");
  const cancel = panelNodes.find((n) => n.tag === "button" && vnodeText(n) === "Cancel");
  assert.ok(cancel !== undefined, "the dismiss action renders");
  assert.equal(cancel.props.onClick, onDismissLifecycle, "cancel is wired to onDismissLifecycle");
});

test("the delete confirmation copy names the file removal in plain language — a dismissed confirmation renders no removal", async () => {
  const { lord, route } = await ledgerInputs();
  const ids = getVcoObjectives(lord, route.id).map((item) => item.id);
  const doc = syntheticCampaignDoc(lord, route);
  const rows = itemsFor(doc, ids);
  const onConfirmLifecycle = (): void => {};
  const onDismissLifecycle = (): void => {};
  const confirming = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc },
    rows,
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
    lifecycle: { kind: "confirm", action: "delete" },
    onConfirmLifecycle,
    onDismissLifecycle,
  });
  const panel = recordVNodes(confirming).find((n) => hasClass(n, "ledger-confirm"));
  assert.ok(panel !== undefined, "the delete confirmation renders");
  const text = vnodeText(panel);
  assert.ok(text.includes("removed from disk"), "the copy names the file removal in plain language");
  assert.ok(text.includes("cannot be undone"), "the copy states the removal is irreversible");
  assert.ok(!text.includes("keeps the archived file"), "the delete confirmation never claims the file is kept");
  const confirmBtn = recordVNodes(panel).find(
    (n) => n.tag === "button" && hasClass(n, "button--danger") && vnodeText(n) === "Delete campaign",
  );
  assert.ok(confirmBtn !== undefined, "the destructive confirm action renders");
  assert.equal(confirmBtn.props.onClick, onConfirmLifecycle, "the destructive confirm is wired to onConfirmLifecycle");

  // Dismissed: the campaign renders with its actions again and NO removal copy anywhere.
  const dismissed = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc },
    rows,
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
  });
  const dismissedText = vnodeText(dismissed);
  assert.ok(!dismissedText.includes("removed from disk"), "dismissal renders no removal copy");
  assert.ok(!dismissedText.includes("cannot be undone"), "dismissal renders no irreversibility copy");
  assert.ok(dismissedText.includes("The Graveyard Watch"), "the campaign document still renders after dismissal");
});

test("the lifecycle in-flight stage renders the mono removing/saving feedback and no actions", async () => {
  const { lord, route } = await ledgerInputs();
  const doc = syntheticCampaignDoc(lord, route);
  const rows = itemsFor(doc, getVcoObjectives(lord, route.id).map((item) => item.id));

  const deleting = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc },
    rows,
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
    lifecycle: { kind: "removing", action: "delete" },
  });
  const deletingNodes = recordVNodes(deleting);
  const deletingRegion = deletingNodes.find((n) => hasClass(n, "ledger-lifecycle"));
  assert.ok(deletingRegion !== undefined, "the lifecycle region renders while removing");
  assert.equal(vnodeText(deletingRegion).trim(), "REMOVING", "the removal feedback renders the mono line");
  assert.ok(
    !recordVNodes(deletingRegion).some((n) => n.tag === "button"),
    "no actions while the removal is in flight (no double-confirm)",
  );

  const completing = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc },
    rows,
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
    lifecycle: { kind: "removing", action: "complete" },
  });
  const completingRegion = recordVNodes(completing).find((n) => hasClass(n, "ledger-lifecycle"));
  assert.ok(completingRegion !== undefined, "the lifecycle region renders while the complete write is in flight");
  assert.equal(vnodeText(completingRegion).trim(), "SAVING", "the complete write renders the mono saving feedback");
});

test("a completed campaign's ledger renders read-only rows — no mutation controls — with delete and no complete", async () => {
  const { lord, route } = await ledgerInputs();
  const ids = getVcoObjectives(lord, route.id).map((item) => item.id);
  const doc = { ...syntheticCampaignDoc(lord, route), status: "completed" as const, updatedAt: "2026-10-03T02:00:00.000Z" };
  const rows = itemsFor(doc, ids);
  const view = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc },
    rows,
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
  });
  const nodes = recordVNodes(view);
  const text = vnodeText(view);

  // No mutation controls anywhere on the archived campaign (the recorded decision).
  assert.ok(!nodes.some((n) => n.tag === "input"), "archived rows render no checkbox controls");
  assert.ok(
    !nodes.some((n) => hasClass(n, "ledger-row__control")),
    "archived rows render no step controls",
  );
  assert.ok(
    !nodes.some((n) => hasClass(n, "ledger-row__feedback--saving")),
    "no per-row write feedback on the archived view",
  );

  // The committed states still render as the read-only table: the two group
  // headers, the fixed step cells, and the progress pairs.
  const table = nodes.find((n) => hasClass(n, "ledger-table"));
  assert.ok(table !== undefined, "the read-only table renders");
  assert.ok(hasClass(table, "ledger-table--readonly"), "the archived table is the read-only rendition");
  assert.ok(text.includes("PLANNING"), "the planning group header renders");
  assert.ok(text.includes("GAME CONFIRMED"), "the confirmed group header renders");
  assert.ok(
    text.includes("APPEARS COMPLETE") && text.includes("VICTORY REGISTERED"),
    "the fixed step cells render their labels",
  );
  assert.equal(countOccurrences(text, "1 / 6"), 1, "the planning progress pair renders");
  assert.equal(countOccurrences(text, "2 / 6"), 1, "the confirmed progress pair renders");

  // The lifecycle region: delete yes, complete no.
  const region = nodes.find((n) => hasClass(n, "ledger-lifecycle"));
  assert.ok(region !== undefined, "the archived view keeps the lifecycle region");
  const regionText = vnodeText(region);
  assert.ok(regionText.includes("Delete"), "delete stays available on the archived view");
  assert.ok(!regionText.includes("Mark complete"), "a completed campaign offers no complete action");
});

test("a failed lifecycle operation renders its message with the actions retained — the retry affordance, no silent write", async () => {
  const { lord, route } = await ledgerInputs();
  const doc = syntheticCampaignDoc(lord, route);
  const rows = itemsFor(doc, getVcoObjectives(lord, route.id).map((item) => item.id));
  const view = LedgerView({
    lord,
    route,
    phase: { kind: "ready", doc },
    rows,
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
    lifecycle: { kind: "error", message: "the server rejected the request (status 500)" },
  });
  const region = recordVNodes(view).find((n) => hasClass(n, "ledger-lifecycle"));
  assert.ok(region !== undefined, "the lifecycle region renders the failure");
  const regionNodes = recordVNodes(region);
  const failure = regionNodes.find((n) => hasClass(n, "ledger-lifecycle__error"));
  assert.ok(failure !== undefined, "the lifecycle error message renders");
  assert.equal(failure.props.role, "alert", "the failure announces itself");
  assert.equal(
    vnodeText(failure),
    "the server rejected the request (status 500)",
    "the typed message surfaces verbatim",
  );
  assert.ok(
    regionNodes.some((n) => n.tag === "button" && vnodeText(n) === "Delete"),
    "the actions remain — the retry affordance",
  );
});

test("a corrupt file's load-error panel carries no delete — removing a corrupt file is the human's manual step (recorded decision)", async () => {
  const { lord, route } = await ledgerInputs();
  const view = LedgerView({
    lord,
    route,
    phase: { kind: "error", message: "The campaign file is not a valid campaign document" },
    rows: [],
    statuses: {},
    onRetry: () => {},
    onTick: () => {},
    onStep: () => {},
    ...idleLifecycleProps(),
  });
  const nodes = recordVNodes(view);
  assert.ok(nodes.some((n) => hasClass(n, "ledger-error")), "the committed load-error panel renders");
  assert.ok(!nodes.some((n) => hasClass(n, "ledger-lifecycle")), "no lifecycle region over a corrupt file");
  assert.ok(!vnodeText(view).includes("Delete"), "no delete action in the error panel");
  assert.ok(vnodeText(view).includes("Retry"), "the ghost Retry action stays");
});

// ─── 11. The plan's campaign action region (package `ledger-route-start`) ────
// The start flow moved to the route plan page (recorded decision); the route
// page no longer exists, so these proofs render the moved region over the
// plan view (the plan suite's `vco-undercard` test above proves the
// start/open/blocked/corrupt states; the cases below are its complements).

/** A ready ledger index with the given entries — the caller-supplied index state the action region derives from. */
function readyIndex(entries: readonly LedgerIndexEntry[]): LedgerIndexState {
  return { kind: "ready", entries };
}

/** The plan page's campaign action region node, when one renders. */
function campaignRegion(view: unknown): VNodeRecord | undefined {
  return recordVNodes(view).find((n) => hasClass(n, "route-campaign"));
}

test("a route with zero VCO items renders no undercard and no campaign action on the plan, even with a ready index", async () => {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const second = getLord(tree, "second-lord");
  assert.ok(second.found);
  const route = getRoute(tree, "second-lord", "lone-route");
  assert.ok(route.found);
  const view = PlanView({
    lord: second.value,
    route: route.value,
    campaign: { index: readyIndex([]), onStart: () => {}, startError: null },
  });
  const text = vnodeText(view);

  assert.ok(!text.includes("VCO OBJECTIVES"), "no undercard for a lord without a vco dataset");
  assert.ok(campaignRegion(view) === undefined, "no action region without the VCO undercard");
  assert.ok(!text.includes("Start ledger"), "no start action for a route with no committed VCO items");
  assert.ok(!text.includes("Open ledger"), "no open link for a route with no committed VCO items");
  assert.ok(!text.includes("A campaign is already active"), "no blocked message for a route with no committed VCO items");
});

test("a completed document for this route does not block the start action on the plan", async () => {
  const { lord, route } = await ledgerInputs();
  const view = PlanView({
    lord,
    route,
    campaign: {
      index: readyIndex([
        {
          lordSlug: "elspeth-von-draken",
          routeId: "route-1",
          status: "completed",
          updatedAt: "2026-10-03T00:00:00.000Z",
        },
      ]),
      onStart: () => {},
      startError: null,
    },
  });
  const region = campaignRegion(view);

  assert.ok(region !== undefined, "the action region renders under the undercard");
  const start = recordVNodes(region).find((n) => n.tag === "button" && hasClass(n, "button--primary"));
  assert.ok(start !== undefined, "an archived (completed) campaign leaves the plan startable again");
  assert.equal(vnodeText(start), "Start ledger", "the start action renders over the completed document");
});

test("a failed start renders the typed message inline under the retained start action — never a silent write", async () => {
  const { lord, route } = await ledgerInputs();
  const view = PlanView({
    lord,
    route,
    campaign: {
      index: readyIndex([]),
      onStart: () => {},
      startError: "the server rejected the request (status 500)",
    },
  });
  const region = campaignRegion(view);

  assert.ok(region !== undefined, "the action region stays visible after a failed start");
  const regionNodes = recordVNodes(region);
  assert.ok(
    regionNodes.some((n) => n.tag === "button" && hasClass(n, "button--primary")),
    "the start button remains (the retry affordance)",
  );
  const failure = regionNodes.find((n) => hasClass(n, "route-campaign__failure"));
  assert.ok(failure !== undefined, "the failure message renders inline near the action");
  assert.equal(failure.props.role, "alert", "the failure announces itself");
  assert.equal(
    vnodeText(failure),
    "the server rejected the request (status 500)",
    "the typed LedgerError message surfaces verbatim",
  );
});


// ─── The sources page (package `sources-page-view`) ──────────────────────────

/** The committed Elspeth tree resolved once for the sources-page proofs. */
async function committedSourcesInputs(): Promise<{ lord: Lord }> {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found, "the committed lord loads");
  return { lord: lord.value };
}

/** The sources page's rows in render order. */
function sourceRowsOf(view: unknown): VNodeRecord[] {
  return recordVNodes(view).filter((n) => n.props.className === "sources-row");
}

test("the sources page renders the desk toolbar: the serif title over the lord-page context line", async () => {
  const { lord } = await committedSourcesInputs();
  const markup = SourcesView({ lord });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);

  const titleAt = nodes.findIndex((n) => n.props.className === "sources-page__title");
  const contextAt = nodes.findIndex((n) => n.props.className === "sources-page__context");
  assert.ok(titleAt !== -1 && contextAt !== -1 && titleAt < contextAt, "the title renders above the context line in the toolbar");
  const title = nodes[titleAt];
  assert.equal(title?.tag, "h1", "the serif page title is the headline element");
  assert.equal(String(title?.children[0]), "Sources & settings", "the DESIGN page copy renders");
  assert.equal(
    nodes.filter((n) => n.props.className === "sources-page__title").length,
    1,
    "the page title renders exactly once",
  );
  const context = nodes[contextAt];
  assert.equal(
    String(context?.children[0]),
    "Elspeth von Draken",
    "the lord-page context line names the lord (the recorded package copy decision)",
  );
  assert.ok(text.includes("Sources & settings"), "the toolbar text reads on the page");
});

test("the sources list renders one row per committed entry: count, link href = the url, and the note", async () => {
  const { lord } = await committedSourcesInputs();
  const markup = SourcesView({ lord });
  const rows = sourceRowsOf(markup);

  assert.equal(rows.length, 35, "one row per committed Elspeth source entry");

  const first = rows[0];
  assert.ok(first !== undefined, "the first row renders");
  const firstNodes = recordVNodes(first);
  const firstIndex = firstNodes.find((n) => n.props.className === "sources-row__index");
  assert.equal(String(firstIndex?.children[0]), "1", "the first row is numbered 1");
  const firstLink = firstNodes.find((n) => n.props.className === "sources-row__title");
  assert.equal(firstLink?.tag, "a", "the title renders as a link");
  assert.equal(
    String(firstLink?.props.href),
    "https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084",
    "the link href is the entry url verbatim",
  );
  assert.equal(String(firstLink?.children[0]), "VCO • author’s route objectives", "the link text is the entry title");
  const firstNote = firstNodes.find((n) => n.props.className === "sources-row__note");
  assert.equal(firstNote?.tag, "p", "the note renders as a paragraph");
  assert.ok(
    String(firstNote?.children[0]).startsWith("Primary author reference"),
    "the entry note text renders",
  );

  const last = rows[rows.length - 1];
  assert.ok(last !== undefined, "the last row renders");
  const lastLink = recordVNodes(last).find((n) => n.props.className === "sources-row__title");
  assert.equal(
    String(lastLink?.children[0]),
    "Smart Autoresolve • evidence boundary",
    "the last committed entry renders last (JSON order preserved)",
  );

  const text = vnodeText(markup);
  assert.ok(
    text.indexOf("VCO • author’s route objectives") < text.indexOf("VCO • Workshop setup"),
    "rows render in sources.json order",
  );
});

test("the settings block renders the fixed deferred line — never a blank region", async () => {
  const { lord } = await committedSourcesInputs();
  const markup = SourcesView({ lord });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);

  const deferred = nodes.find((n) => n.props.className === "sources-deferred__line");
  assert.ok(deferred !== undefined, "the deferred settings line renders");
  assert.equal(
    String(deferred?.children[0]),
    "Appearance settings arrive with a later feature",
    "the DESIGN-fixed deferred-surface copy",
  );
  assert.ok(
    text.includes("Appearance settings arrive with a later feature"),
    "the deferred line reads on the page",
  );
});

test("a lord with an absent sources dataset renders the explicit empty state", async () => {
  const { lord } = await committedSourcesInputs();
  const sourcesLess: Lord = {
    ...lord,
    datasets: lord.datasets.filter((d) => d.name !== "sources"),
  };
  const markup = SourcesView({ lord: sourcesLess });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);

  assert.ok(text.includes("NO SOURCES YET"), "the mono empty label names the state");
  assert.ok(
    text.includes("No sources are listed for this lord yet."),
    "the proportional empty sentence explains the state",
  );
  assert.equal(sourceRowsOf(markup).length, 0, "no row renders on the empty page");
  assert.ok(
    nodes.some((n) => n.props.className === "sources-deferred__line"),
    "the deferred settings line still renders below the empty list",
  );
});

test("a lord with an empty sources dataset ([]) renders the same explicit empty state", async () => {
  const { lord } = await committedSourcesInputs();
  const emptySources: Lord = {
    ...lord,
    datasets: lord.datasets.map((d): LordDataset =>
      d.name === "sources" ? { name: "sources", value: [] } : d,
    ),
  };
  const markup = SourcesView({ lord: emptySources });
  const text = vnodeText(markup);

  assert.ok(text.includes("NO SOURCES YET"), "the mono empty label renders for an empty dataset");
  assert.ok(
    text.includes("No sources are listed for this lord yet."),
    "the proportional empty sentence explains the state",
  );
  assert.equal(sourceRowsOf(markup).length, 0, "no row renders for an empty dataset");
});

// ─── The field notes page (package `notes-page-view`) ─────────────────────────

/** The committed Elspeth tree resolved once for the field-notes proofs. */
async function committedNotesInputs(): Promise<{ lord: Lord }> {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found, "the committed lord loads");
  return { lord: lord.value };
}

test("the field notes page renders the desk toolbar: the serif title over the lord-page context line", async () => {
  const { lord } = await committedNotesInputs();
  const markup = NotesView({ lord });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);

  const titleAt = nodes.findIndex((n) => n.props.className === "notes-page__title");
  const contextAt = nodes.findIndex((n) => n.props.className === "notes-page__context");
  assert.ok(
    titleAt !== -1 && contextAt !== -1 && titleAt < contextAt,
    "the title renders above the context line in the toolbar",
  );
  const title = nodes[titleAt];
  assert.equal(title?.tag, "h1", "the serif page title is the headline element");
  assert.equal(String(title?.children[0]), "Field notes", "the DESIGN page copy renders");
  assert.equal(
    nodes.filter((n) => n.props.className === "notes-page__title").length,
    1,
    "the page title renders exactly once",
  );
  const context = nodes[contextAt];
  assert.equal(
    String(context?.children[0]),
    "Elspeth von Draken",
    "the lord-page context line names the lord (the shared lord-page copy decision)",
  );
  assert.ok(text.includes("Field notes"), "the toolbar text reads on the page");
});

test("the field notes body is the explicit deferred empty state: the label + the DESIGN-fixed sentence, never a blank region", async () => {
  const { lord } = await committedNotesInputs();
  const markup = NotesView({ lord });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);

  const deferredAt = nodes.findIndex((n) => n.props.className === "notes-deferred");
  const contextAt = nodes.findIndex((n) => n.props.className === "notes-page__context");
  assert.ok(deferredAt !== -1, "the deferred state occupies the page body — explicit copy, never a blank region");
  assert.ok(contextAt !== -1 && deferredAt > contextAt, "the deferred state renders below the toolbar");

  const label = nodes.find((n) => n.props.className === "notes-deferred__label");
  assert.ok(label !== undefined, "the deferred-state label renders");
  assert.equal(label?.tag, "p", "the label renders as a paragraph");
  assert.equal(String(label?.children[0]), "NO NOTES YET", "the mono label names the deferred state");
  const copy = nodes.find((n) => n.props.className === "notes-deferred__copy");
  assert.ok(copy !== undefined, "the deferred-state sentence renders");
  assert.equal(copy?.tag, "p", "the sentence renders as a paragraph");
  assert.equal(
    String(copy?.children[0]),
    "Notes arrive with a later feature",
    "the DESIGN-fixed deferred-surface sentence",
  );
  assert.ok(text.includes("Notes arrive with a later feature"), "the deferred sentence reads on the page");
  assert.ok(
    text.indexOf("NO NOTES YET") < text.indexOf("Notes arrive with a later feature"),
    "the deferred state reads label first, then the sentence (the DESIGN's label + one sentence shape)",
  );
});
