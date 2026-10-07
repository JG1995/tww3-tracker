/**
 * Contract proof for the Confidence Badge (package `confidence-badge`, commit 2 —
 * feature DESIGN §"Confidence Badges"): the presentational component renders
 * icon + mono uppercase label + colour-modifier class for all four confidence
 * states, with one trailing link per provided source (zero-DOM VNode flatten),
 * and the boot-time `::claim` callout renderer emits the same badged anatomy —
* icon, mono label, resolved per-`src` links — inside the existing classed aside
* markup, and the migrated Elspeth `::claim` callouts render through the same
* contract.
*
 * Seam: zero-DOM. The component is a plain `h()`-built preact VNode flattened
 * with the same text helper the views tests use; the callout output is the
 * `load.ts`-rendered HTML string over the same filesystem-reader trees the
 * content-model tests use.
 *
 * It also carries the atlas header contract (package `atlas-header-shell`,
 * Commit 10): the slim/full forms, the hash-derived routebar and pagenav
 * selections, and the keyboard contract the F2 TabStrip carried (its suite
 * was pruned with the component in Commit 11). The search-trigger contract
 * (package `search-header-controls`, Commit 3 of the cross-guide-search
 * feature) lives in the same section: the optional `onOpenSearch` prop
 * renders the trigger in the topline slot / after the slim lord links, and
 * its absence changes no header output (the F10 zero-lord contract).
 *
 * It also carries the ledger table panel contract (package
 * `ledger-table-panel`, commit 6 — DESIGN.md §Ledger Table): the two mono
 * uppercase column-group headers with their `n / m` progress pairs, one
 * 40px-classed row per reconciled item in committed order, the planning
 * checkbox states, the four DESIGN step cells with their dot + label
 * treatments (success reached, step-1 warning, neutral earlier, dimmed
 * later), the bounds-disabled step controls, and the per-row saving/error
 * feedback. The panel is data-driven, so the proofs build props directly —
 * no content tree.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentTree } from "../app/content/load.ts";
import { getLord, getPanelEntries, getRoute } from "../app/content/query.ts";
import { CLAIM_STATES, PANEL_GROUPS, type Army, type ContentReader, type Item, type Lord, type PanelGroup, type Route, type Source } from "../app/content/types.ts";
import { ConfidenceBadge } from "../app/components/ConfidenceBadge.ts";
import { DeskPanel } from "../app/components/deskPanel.ts";
import { LedgerTable, type LedgerRowStatus, type LedgerTableRow } from "../app/components/LedgerTable.ts";
import {
  AtlasHeaderMarkup,
  routeTabHref,
  tabNav as headerTabNav,
  type HeaderRoute,
} from "../app/components/atlasHeader.ts";
import { parseHash } from "../app/router.ts";
import { SearchDialogMarkup, searchHitNav } from "../app/components/search.ts";
import type { SearchHit, SearchResults } from "../app/content/query.ts";

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

// ─── 4. Elspeth's migrated route callouts; shared fundamentals stay callout-free ──

test("Elspeth's migrated callouts render with badges; its shared fundamentals stay callout-free", async () => {
  const tree = await loadContentTree(fsReader(CONTENT));
  assert.ok(getLord(tree, "elspeth-von-draken").found, "the committed Elspeth guide remains in the corpus");
  for (const lord of tree.lords.filter((candidate) => candidate.slug === "elspeth-von-draken")) {
    assert.ok(
      !lord.sharedHtml.includes('<aside class="claim'),
      `${lord.slug}: no callout in the committed shared fundamentals`,
    );
    const routeOne = lord.routes.find((r) => r.id === "route-1");
    assert.ok(routeOne !== undefined, "the committed route-1 loads");

    // the Guide-interpretation claim (Opening — the route-title identity
    // context) renders the inferred badge anatomy with the resolved link
    const opening = routeOne.sections.find((s) => s.id === "opening");
    assert.ok(opening !== undefined, "the Opening section exists");
    assert.ok(
      opening.html.includes('<aside class="claim claim--inferred"'),
      'the Opening callout keeps class="claim claim--inferred"',
    );
    assert.ok(opening.html.includes('data-state="inferred"'), "the Opening callout keeps data-state");
    assert.ok(opening.html.includes('data-src="vco-guide"'), "the Opening callout keeps data-src");
    assert.ok(
      opening.html.includes('<span class="confidence-badge confidence-badge--inferred">'),
      "the badge span matches the component's class contract",
    );
    assert.ok(
      opening.html.includes('<span class="confidence-badge__label">INFERRED</span>'),
      "the mono uppercase label is present",
    );
    assert.ok(
      opening.html.includes(
        '<a class="confidence-badge__src" href="https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084">VCO • author’s route objectives</a>',
      ),
      "the src id resolves to its source link",
    );
    assert.ok(
      opening.html.includes("They are not independently verified in-game route titles."),
      "the folded Guide-interpretation evidence text renders verbatim",
    );

    // the Verified-author-quest-trigger claim (Victory push — the newly
    // unlocked Nuln defence) renders the confirmed badge anatomy
    const victory = routeOne.sections.find((s) => s.id === "victory-push");
    assert.ok(victory !== undefined, "the Victory push section exists");
    assert.ok(
      victory.html.includes('<aside class="claim claim--confirmed"'),
      'the Victory callout keeps class="claim claim--confirmed"',
    );
    assert.ok(victory.html.includes('data-state="confirmed"'), "the Victory callout keeps data-state");
    assert.ok(
      victory.html.includes('<span class="confidence-badge__label">CONFIRMED</span>'),
      "the mono uppercase label is present",
    );
    assert.ok(
      victory.html.includes("Completing Route I unlocks the Elspeth/Malakai defence against Tamurkhan."),
      "the folded quest-trigger evidence text renders verbatim",
    );

    // Route II's treaty-validation hedges (Mid → Late transfer-credit, Victory
    // push no-final-battle, Diplomacy treaty wording) render the same badged
    // anatomy with the resolved link — mirroring the Route I callout
    // discipline route-1-worker added.
    const routeTwo = lord.routes.find((r) => r.id === "route-2");
    assert.ok(routeTwo !== undefined, "the committed route-2 loads");

    // the transfer-credit claim (Mid → Late — the province audit) renders the
    // verify-in-campaign badge anatomy with the resolved link
    const midLate = routeTwo.sections.find((s) => s.id === "mid-late");
    assert.ok(midLate !== undefined, "the Mid → Late section exists");
    assert.ok(
      midLate.html.includes('<aside class="claim claim--verify-in-campaign"'),
      'the Mid → Late callout keeps class="claim claim--verify-in-campaign"',
    );
    assert.ok(midLate.html.includes('data-state="verify-in-campaign"'), "the Mid → Late callout keeps data-state");
    assert.ok(midLate.html.includes('data-src="vco-guide"'), "the Mid → Late callout keeps data-src");
    assert.ok(
      midLate.html.includes('<span class="confidence-badge confidence-badge--verify-in-campaign">'),
      "the badge span matches the component's class contract",
    );
    assert.ok(
      midLate.html.includes('<span class="confidence-badge__label">VERIFY</span>'),
      "the mono uppercase label is present",
    );
    assert.ok(
      midLate.html.includes(
        '<a class="confidence-badge__src" href="https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084">VCO • author’s route objectives</a>',
      ),
      "the src id resolves to its source link",
    );
    assert.ok(
      midLate.html.includes("A transfer is acceptable only while the game still credits the control relationship."),
      "the transfer-credit treaty-validation wording renders verbatim",
    );

    // the no-final-battle claim (Victory push — the confirm-route step) keeps
    // the same verify-in-campaign anatomy
    const victoryPush = routeTwo.sections.find((s) => s.id === "victory-push");
    assert.ok(victoryPush !== undefined, "the Victory push section exists");
    assert.ok(
      victoryPush.html.includes('<aside class="claim claim--verify-in-campaign"'),
      'the Victory push callout keeps class="claim claim--verify-in-campaign"',
    );
    assert.ok(victoryPush.html.includes('data-state="verify-in-campaign"'), "the Victory push callout keeps data-state");
    assert.ok(victoryPush.html.includes('data-src="vco-guide"'), "the Victory push callout keeps data-src");
    assert.ok(
      victoryPush.html.includes('<span class="confidence-badge__label">VERIFY</span>'),
      "the Victory push callout carries the mono uppercase label",
    );
    assert.ok(
      victoryPush.html.includes(
        '<a class="confidence-badge__src" href="https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084">VCO • author’s route objectives</a>',
      ),
      "the Victory push src id resolves to its source link",
    );
    assert.ok(
      victoryPush.html.includes("There is no published extra Elspeth-specific final battle for this route."),
      "the no-final-battle claim renders verbatim",
    );

    // the treaty-wording hedge (Diplomacy — what the live mission credits)
    const diplomacySection = routeTwo.sections.find((s) => s.id === "diplomacy");
    assert.ok(diplomacySection !== undefined, "the Diplomacy section exists");
    assert.ok(
      diplomacySection.html.includes('<aside class="claim claim--verify-in-campaign"'),
      'the Diplomacy callout keeps class="claim claim--verify-in-campaign"',
    );
    assert.ok(
      diplomacySection.html.includes('<span class="confidence-badge__label">VERIFY</span>'),
      "the Diplomacy callout carries the mono uppercase label",
    );
    assert.ok(
      diplomacySection.html.includes(
        '<a class="confidence-badge__src" href="https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084">VCO • author’s route objectives</a>',
      ),
      "the Diplomacy src id resolves to its source link",
    );
    assert.ok(
      diplomacySection.html.includes("Do not assume non-aggression or a trade agreement counts as control."),
      "the treaty-wording hedge renders verbatim",
    );

    // Route III's migrated hedges (Diplomacy treaty-validation + Mid → Late
    // search-status) render the same badged anatomy with the resolved link,
    // mirroring the Route I/II callout discipline. The residual callout-free
    // skeleton block is removed as a contract removal: after this package no
    // committed route is a skeleton, and the per-route callout anatomy
    // assertions above fully replace it.
    const routeThree = lord.routes.find((r) => r.id === "route-3");
    assert.ok(routeThree !== undefined, "the committed route-3 loads");

    // the treaty-validation claim (Diplomacy — what the live objective
    // accepts as a crediting relationship) renders the verify-in-campaign
    // badge anatomy with the resolved link
    const routeThreeDiplomacy = routeThree.sections.find((s) => s.id === "diplomacy");
    assert.ok(routeThreeDiplomacy !== undefined, "the Diplomacy section exists");
    assert.ok(
      routeThreeDiplomacy.html.includes('<aside class="claim claim--verify-in-campaign"'),
      'the Diplomacy callout keeps class="claim claim--verify-in-campaign"',
    );
    assert.ok(
      routeThreeDiplomacy.html.includes('data-state="verify-in-campaign"'),
      "the Diplomacy callout keeps data-state",
    );
    assert.ok(routeThreeDiplomacy.html.includes('data-src="vco-guide"'), "the Diplomacy callout keeps data-src");
    assert.ok(
      routeThreeDiplomacy.html.includes('<span class="confidence-badge confidence-badge--verify-in-campaign">'),
      "the badge span matches the component's class contract",
    );
    assert.ok(
      routeThreeDiplomacy.html.includes('<span class="confidence-badge__label">VERIFY</span>'),
      "the Diplomacy callout carries the mono uppercase label",
    );
    assert.ok(
      routeThreeDiplomacy.html.includes(
        '<a class="confidence-badge__src" href="https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084">VCO • author’s route objectives</a>',
      ),
      "the Diplomacy src id resolves to its source link",
    );
    assert.ok(
      routeThreeDiplomacy.html.includes(
        "Friendly Dwarf holdings may be the best diplomatic route if the live objective accepts the treaty.",
      ),
      "the treaty-validation wording renders verbatim",
    );

    // the search-status claim (Mid → Late — the unexposed search result)
    // keeps the same verify-in-campaign anatomy and folds the atlas evidence
    // note "Unexposed implementation" verbatim
    const routeThreeMidLate = routeThree.sections.find((s) => s.id === "mid-late");
    assert.ok(routeThreeMidLate !== undefined, "the Mid → Late section exists");
    assert.ok(
      routeThreeMidLate.html.includes('<aside class="claim claim--verify-in-campaign"'),
      'the Mid → Late callout keeps class="claim claim--verify-in-campaign"',
    );
    assert.ok(routeThreeMidLate.html.includes('data-state="verify-in-campaign"'), "the Mid → Late callout keeps data-state");
    assert.ok(routeThreeMidLate.html.includes('data-src="vco-guide"'), "the Mid → Late callout keeps data-src");
    assert.ok(
      routeThreeMidLate.html.includes('<span class="confidence-badge__label">VERIFY</span>'),
      "the Mid → Late callout carries the mono uppercase label",
    );
    assert.ok(
      routeThreeMidLate.html.includes(
        '<a class="confidence-badge__src" href="https://steamcommunity.com/sharedfiles/filedetails/?id=2964052084">VCO • author’s route objectives</a>',
      ),
      "the Mid → Late src id resolves to its source link",
    );
    assert.ok(
      routeThreeMidLate.html.includes(
        "No exact Route III quota/search algorithm, guaranteed fortress location, follower mechanics or treaty-validation code was available in the current public guide.",
      ),
      "the folded Unexposed-implementation evidence note renders verbatim",
    );
  }
});

// ─── 8. The desk-panel anatomy (package `detail-pages-view`) ────────────────

/** The fixture tree's lord + route, the inputs every desk-panel test renders. */
async function fixturePanelInputs() {
  const tree = await loadContentTree(fsReader(FIXTURES));
  const lord = getLord(tree, "als-rhyn-of-lorek");
  assert.ok(lord.found, "the fixture lord loads");
  const route = getRoute(tree, "als-rhyn-of-lorek", "dark-conduits");
  assert.ok(route.found, "the fixture route loads");
  return { lord: lord.value, route: route.value };
}

/** One panel of the shared desk-panel anatomy over the given entries. */
function renderPanel(
  lord: Lord,
  group: PanelGroup,
  entries: readonly Army[] | readonly Item[],
  numeral = "I",
  title = "Panel",
): { text: string; nodes: VNodeRecord[] } {
  const markup = DeskPanel({ numeral, group, title, lord, entries });
  return { text: vnodeText(markup), nodes: recordVNodes(markup) };
}

/** Renders one army entry's anatomy through the shared panel (the two columns case). */
async function renderArmyPanel(): Promise<{ text: string; nodes: VNodeRecord[] }> {
  const { lord, route } = await fixturePanelInputs();
  return renderPanel(lord, "armies", getPanelEntries(lord, route).armies, "I", "Army templates");
}

/** Renders the skills panel through the shared desk-panel component. */
async function renderSkillsPanel(): Promise<{ text: string; nodes: VNodeRecord[] }> {
  const { lord, route } = await fixturePanelInputs();
  return renderPanel(lord, "skills", getPanelEntries(lord, route).skills, "II", "Lord & hero skills");
}

test("the desk panel renders the serif head — Roman numeral and title — above the anatomy", async () => {
  const { nodes } = await renderArmyPanel();

  const head = nodes.find((n) => n.props.className === "desk-panel__head");
  assert.ok(head !== undefined, "the panel renders its head");
  const index = nodes.find((n) => n.props.className === "desk-panel__index");
  assert.equal(String(index?.children[0]), "I", "the Roman-numeral index renders");
  const title = nodes.find((n) => n.props.className === "desk-panel__title");
  assert.equal(title?.tag, "h2", "the panel title is the serif heading element");
  assert.equal(String(title?.children[0]), "Army templates", "the serif panel title renders");
});

test("an army panel renders the two unit columns with count/name/role/kind rows and the absent marker", async () => {
  const { text } = await renderArmyPanel();

  // both army entries with label + name (+ the optional supporting-army name)
  assert.ok(text.includes("Early") && text.includes("The Toll of the Silver Sand"), "early army label + name");
  assert.ok(text.includes("The Dust Wardens"), "the early army's supporting-army name");
  assert.ok(text.includes("Late") && text.includes("The River Line Watch"), "late army label + name");

  // the legendary-lord column rows: ×N count, name, role, kind
  assert.ok(text.includes("×1") && text.includes("Tomb King on Warsphinx"), "legendary row count + name");
  assert.ok(text.includes("Battle-line general") && text.includes("monstrous"), "legendary row role + kind");
  assert.ok(text.includes("Tomb Guard") && text.includes("Elite guard"), "second legendary row");

  // the early army's generic-lord column rows
  assert.ok(
    text.includes("×3") && text.includes("Spearmen") && text.includes("Holding line"),
    "generic row count + name + role",
  );
  assert.ok(text.includes("line"), "generic row kind");

  // the late army's empty generic column shows its explicit absent marker —
  // exactly once across both armies, never blank space
  assert.equal(text.split("NO UNITS LISTED").length - 1, 1, "the absent generic column marker renders exactly once");

  // context, notes[]/plan [title, body] rows, and the size lines
  assert.ok(text.includes("Anchors the eastern desert line while the three conduit towns consolidate."), "context");
  assert.ok(text.includes("Deployment") && text.includes("Spread the archers behind the warriors"), "a notes row");
  assert.ok(text.includes("Turn 1") && text.includes("Consolidate all three conduit towns before turn ten."), "a plan row");
  assert.ok(text.includes("Size 2200") && text.includes("Size 900"), "each army declares its size");
});

test("an item panel renders label, title, intro, steps with optional gate and short labels, and details rows", async () => {
  const { nodes, text } = await renderSkillsPanel();

  assert.ok(text.includes("Conduit Rites"), "the listed skill renders its label");
  assert.ok(text.includes("Raise the conduit towns"), "the skill renders its title");
  assert.ok(text.includes("Construction discounts before the first levy."), "the skill renders its intro");
  assert.ok(text.includes("Conduit Silos") && text.includes("Two silos a town before turn ten."), "step title + note render");
  assert.ok(text.includes("Sealed Depot"), "the short-labelled step's title renders");
  assert.ok(text.includes("Town per turn") && text.includes("One conduit town ripens every four turns."), "details rows render");

  // the optional gate and short labels render on their step head line
  const gate = nodes.find((n) => n.props.className === "item-step__gate");
  assert.ok(gate !== undefined && gate.children[0] === "Opening option", "the gate label renders");
  const short = nodes.find((n) => n.props.className === "item-step__short");
  assert.ok(short !== undefined && short.children[0] === "Depot", "the short label renders");
});

test("state-carrying entries render the Confidence Badge, and stateless entries render none — with resolved source links", async () => {
  const { nodes, text } = await renderArmyPanel();

  // the early army carries the inferred badge; the stateless late army never
  // renders one — the badge span itself is proven by the confidence-badge suite
  const badges = nodes.filter((n) => typeof n.props.state === "string" && Array.isArray(n.props.sources));
  assert.equal(badges.length, 1, "exactly the inferred early army renders a badge");
  assert.equal(badges[0]?.props.state, "inferred", "the state badge is the army's own");

  const hrefs = nodes.filter((n) => typeof n.props.href === "string").map((n) => n.props.href);
  assert.ok(hrefs.includes("https://example.test/casket"), "the early army's ca source resolves");
  assert.ok(!text.includes("Prepare the twin casket fleet"), "no item card renders inside the army panel");
});

test("a state-carrying item renders the badge and its resolved source links through the item panel", async () => {
  const { nodes } = await renderSkillsPanel();

  const badges = nodes.filter((n) => typeof n.props.state === "string" && Array.isArray(n.props.sources));
  assert.equal(badges.length, 1, "the listed skill carries the confirmed badge");
  assert.equal(badges[0]?.props.state, "confirmed", "the skill's own state renders");
  const hrefs = nodes.filter((n) => typeof n.props.href === "string").map((n) => n.props.href);
  assert.ok(hrefs.includes("https://example.test/vco-guide"), "the listed skill's vco-guide source resolves");
  assert.ok(!hrefs.includes("https://example.test/casket"), "the item panel carries no army source");
  assert.ok(!vnodeText(nodes).includes("Prepare the twin casket fleet"), "the unlisted skill's title is absent");
});

test("an empty desk panel renders the explicit empty state — never blank", async () => {
  const { lord } = await fixturePanelInputs();
  const markup = DeskPanel({ numeral: "V", group: "mechanics", title: "Unique mechanics", lord, entries: [] });
  const nodes = recordVNodes(markup);
  const text = vnodeText(markup);
  assert.ok(text.includes("NO MECHANICS YET"), "the mono empty label names the panel");
  assert.ok(text.includes("No mechanics are listed for this route yet."), "the proportional sentence explains the state");
  assert.ok(nodes.some((n) => n.props.className === "desk-panel__title"), "the empty panel keeps its head — never blank space");
  assert.ok(!nodes.some((n) => String(n.props.className).includes("panel-entry")), "no entry renders on the empty panel");
});

// ─── 9. The ledger table panel (package `ledger-table-panel`) ────────────────

/** A hand-built reconciled row for the panel's data-driven proofs. */
function ledgerRow(id: string, label: string, confirmedStep: 0 | 1 | 2 | 3 | 4, planned: boolean): LedgerTableRow {
  return { id, label, state: { planned, confirmedStep } };
}

/** The per-row command status map with every row idle — the common default. */
function idleStatuses(rows: readonly LedgerTableRow[]): Record<string, LedgerRowStatus> {
  const statuses: Record<string, LedgerRowStatus> = {};
  for (const row of rows) statuses[row.id] = { phase: "idle", message: null };
  return statuses;
}

/** The four fixed DESIGN step labels, asserted literally so a wrong cell vocabulary fails. */
const LEDGER_STEP_LABELS: readonly string[] = [
  "APPEARS COMPLETE",
  "MISSION COMPLETE",
  "VICTORY REGISTERED",
  "REWARD RECEIVED",
];

const STEP_ROWS: readonly LedgerTableRow[] = [
  ledgerRow("item-a", "Secure the north gate", 3, true),
  ledgerRow("item-b", "Hold the river crossing", 1, false),
  ledgerRow("item-c", "Raze the foothold fort", 0, false),
];

/** Renders the panel with the shared fixture rows plus caller-computed counts. */
function renderLedger(
  plannedCount: number,
  confirmedCount: number = 0,
  statuses?: Record<string, LedgerRowStatus>,
) {
  return recordVNodes(
    LedgerTable({
      rows: STEP_ROWS,
      statuses: statuses ?? idleStatuses(STEP_ROWS),
      plannedCount,
      confirmedCount,
      onTick: () => {},
      onStep: () => {},
    }),
  );
}

/** The className string of one VNode record (empty when absent). */
function cls(record: { props: Record<string, unknown> }): string {
  return String(record.props.className ?? "");
}

test("the ledger table renders the two mono group headers with the n / m progress pairs beside them", () => {
  const nodes = renderLedger(2, 0);
  const text = vnodeText(nodes);

  const planning = nodes.find((n) => String(n.props.className).split(/\s+/).includes("ledger-table__group--planning"));
  const confirmed = nodes.find((n) => String(n.props.className).split(/\s+/).includes("ledger-table__group--confirmed"));
  assert.ok(planning !== undefined, "the planning column-group header renders");
  assert.ok(confirmed !== undefined, "the game-confirmed column-group header renders");
  assert.ok(vnodeText(planning).includes("PLANNING"), "the planning header conveys the planning track");
  assert.ok(
    !vnodeText(planning).toLowerCase().includes("confirmed"),
    "the planning header never claims the confirmed track",
  );
  assert.ok(vnodeText(confirmed).includes("GAME CONFIRMED"), "the game-confirmed header conveys the confirmed track");

  assert.ok(vnodeText(planning).includes("2 / 3"), "the planning progress pair reads ticked / rows (2 / 3)");
  assert.ok(vnodeText(confirmed).includes("0 / 3"), "the confirmed progress pair reads reached / rows (0 / 3)");
  assert.ok(text.indexOf("PLANNING") < text.indexOf("GAME CONFIRMED"), "planning group renders before the game-confirmed group");
});

test("an all-ticked / all-unconfirmed campaign shows its complete planning pair and the zero confirmed pair", () => {
  const nodes = renderLedger(3, 0);
  const text = vnodeText(nodes);
  assert.ok(text.includes("3 / 3"), "all ticked: the planning pair reads 3 / 3");
  assert.ok(text.includes("0 / 3"), "none confirmed: the confirmed pair reads 0 / 3 — the two facts stay visibly separate");
});

test("one 40px-classed ledger row renders per reconciled item, in committed order, with its objective label", () => {
  const nodes = renderLedger(2, 1);
  const rows = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-row"));
  assert.equal(rows.length, STEP_ROWS.length, "one ledger-row per reconciled item");
  for (const [index, row] of STEP_ROWS.entries()) {
    assert.ok(vnodeText(rows[index]).includes(row.label), `row ${index} renders its objective label (${row.label})`);
  }
  const text = vnodeText(nodes);
  assert.ok(
    text.indexOf("Secure the north gate") < text.indexOf("Hold the river crossing") &&
      text.indexOf("Hold the river crossing") < text.indexOf("Raze the foothold fort"),
    "rows render in committed order, never re-sorted",
  );
});

test("the planning checkbox renders checked with the on-surface check class, and unchecked otherwise", () => {
  const nodes = renderLedger(1, 0);
  const checks = nodes.filter((n) => n.tag === "input" && n.props.type === "checkbox");
  assert.equal(checks.length, STEP_ROWS.length, "one real checkbox per row");

  const ticked = checks[0];
  assert.equal(ticked.props.checked, true, "the ticked item-a row's checkbox is checked");
  assert.ok(
    String(ticked.props.className).split(/\s+/).includes("ledger-row__check--on-surface"),
    "the ticked check renders the on-surface class treatment",
  );

  for (const [index, check] of checks.entries()) {
    const expected = STEP_ROWS[index].state.planned;
    assert.equal(check.props.checked, expected, `row ${index} checkbox matches its ItemState.planned`);
    const hasOnSurface = String(check.props.className).split(/\s+/).includes("ledger-row__check--on-surface");
    assert.equal(hasOnSurface, expected, `row ${index} renders the on-surface check class exactly when ticked`);
  }

  const rows = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-row"));
  const firstRowText = vnodeText(rows[0]);
  assert.ok(firstRowText.includes("PLANNED"), "the planning state carries its mono label beside the checkbox");
});

test("each row renders the four step cells with the DESIGN step labels, each pairing a dot with a text label", () => {
  const nodes = renderLedger(2, 1);
  const cells = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-step"));
  assert.equal(cells.length, STEP_ROWS.length * 4, "four step cells per row");
  for (let row = 0; row < STEP_ROWS.length; row++) {
    for (let step = 0; step < 4; step++) {
      const cell = cells[row * 4 + step];
      assert.equal(
        vnodeText(cell).includes(LEDGER_STEP_LABELS[step]),
        true,
        `row ${row} step ${step + 1} carries its DESIGN label (${LEDGER_STEP_LABELS[step]})`,
      );
      const cellNodes = recordVNodes(cell);
      assert.ok(
        cellNodes.some((n) => String(n.props.className).split(/\s+/).includes("ledger-step__dot")),
        `row ${row} step ${step + 1}: the state dot is always present — the state is never colour-only`,
      );
      assert.ok(
        cellNodes.some((n) => String(n.props.className).split(/\s+/).includes("ledger-step__label")),
        `row ${row} step ${step + 1}: the text label is always present alongside the dot`,
      );
    }
  }
});

test("the reached step renders the success-classed dot + label; earlier steps neutral, later steps dimmed", () => {
  const nodes = renderLedger(2, 1);
  const cells = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-step"));

  // item-a is at step 3: steps 1–2 passed (neutral), step 3 reached (success), step 4 future (dimmed)
  const a = cells.slice(0, 4);
  assert.ok(cls(a[2]).includes("ledger-step--success"), "the reached step-3 cell carries the success treatment");
  assert.ok(
    recordVNodes(a[2]).some((n) => String(n.props.className).split(/\s+/).includes("ledger-step__dot")),
    "the reached step pairs the success dot with its label",
  );
  assert.ok(cls(a[0]).includes("ledger-step--neutral"), "the passed step-1 cell renders the neutral treatment");
  assert.ok(cls(a[1]).includes("ledger-step--neutral"), "the passed step-2 cell renders the neutral treatment");
  assert.ok(cls(a[3]).includes("ledger-step--future"), "the not-yet-reached step-4 cell renders dimmed");

  // item-c is at step 0: every cell is future/dimmed — none claims a reached state
  const c = cells.slice(8, 12);
  for (const cell of c) {
    assert.ok(cls(cell).includes("ledger-step--future"), "a step-0 row renders every step dimmed");
  }
});

test("a row at step 1 (appears complete but unconfirmed) renders the warning treatment on that cell", () => {
  const nodes = renderLedger(0, 1);
  const cells = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-step"));

  // item-b is at step 1: the appears-complete edge carries the warning treatment
  const b = cells.slice(4, 8);
  assert.ok(cls(b[0]).includes("ledger-step--warning"), "the step-1 cell renders the warning treatment");
  assert.ok(cls(b[1]).includes("ledger-step--future"), "steps past the edge stay dimmed");
  assert.ok(cls(b[2]).includes("ledger-step--future"), "steps past the edge stay dimmed");
  assert.ok(cls(b[3]).includes("ledger-step--future"), "steps past the edge stay dimmed");

  // the reached-success treatment belongs to steps 2–4 only: a step-3 row shows no warning anywhere
  const a = cells.slice(0, 4);
  assert.ok(!cls(a[0]).includes("--warning") && !cls(a[2]).includes("--warning"), "a non-step-1 reached row never warns");
  assert.ok(cls(a[2]).includes("ledger-step--success"), "its reached step stays success");
});

test("the step controls disable at the bounds: no back before step 0, no forward past step 4", () => {
  const rows: readonly LedgerTableRow[] = [
    ledgerRow("item-a", "Secure the north gate", 0, false),
    ledgerRow("item-b", "Hold the river crossing", 2, false),
    ledgerRow("item-c", "Raze the foothold fort", 4, false),
  ];
  const nodes = recordVNodes(
    LedgerTable({ rows, statuses: idleStatuses(rows), plannedCount: 0, confirmedCount: 2, onTick: () => {}, onStep: () => {} }),
  );
  const backs = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-row__control--back"));
  const forwards = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-row__control--forward"));
  assert.equal(backs.length, 3, "one back control per row");
  assert.equal(forwards.length, 3, "one forward control per row");
  assert.equal(backs[0].props.disabled, true, "step 0: back is disabled (no retreat below 0)");
  assert.equal(forwards[0].props.disabled, false, "step 0: forward stays enabled");
  assert.equal(backs[1].props.disabled, false, "mid-track row: back enabled");
  assert.equal(forwards[1].props.disabled, false, "mid-track row: forward enabled");
  assert.equal(forwards[2].props.disabled, true, "step 4: forward is disabled (no advance past 4)");
  assert.equal(backs[2].props.disabled, false, "step 4: back stays enabled (correction)");
  assert.equal(backs[0].props.type, "button", "the step controls are real buttons, keyboard-operable");
});

test("a row in the saving phase shows the in-flight feedback on that row only", () => {
  const statuses = idleStatuses(STEP_ROWS);
  statuses["item-b"] = { phase: "saving", message: null };
  const nodes = renderLedger(1, 1, statuses);
  const rows = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-row"));
  assert.ok(vnodeText(rows[1]).includes("SAVING"), "the saving row shows the in-flight feedback");
  assert.ok(!vnodeText(rows[0]).includes("SAVING"), "a settled row shows no saving feedback");
  assert.ok(!vnodeText(rows[2]).includes("SAVING"), "a settled row shows no saving feedback");
});

test("a failed row renders the error border class with the inline message, showing the rolled-back value", () => {
  const statuses = idleStatuses(STEP_ROWS);
  statuses["item-b"] = { phase: "error", message: "The write failed — try again." };
  const nodes = renderLedger(1, 1, statuses);
  const rows = nodes.filter((n) => String(n.props.className).split(/\s+/).includes("ledger-row"));

  const failed = rows[1];
  assert.ok(cls(failed).includes("ledger-row--error"), "the failed row carries the error border class");
  assert.ok(vnodeText(failed).includes("The write failed — try again."), "the failure message renders as inline text");
  // the parent's document holds the pre-write value after the rollback, so the row renders it unchanged
  const check = recordVNodes(failed).find((n) => n.tag === "input" && n.props.type === "checkbox");
  assert.equal(check?.props.checked, false, "the failed row renders its rolled-back (pre-write) planned value");
  const cells = recordVNodes(failed).filter((n) => String(n.props.className).split(/\s+/).includes("ledger-step"));
  assert.ok(cls(cells[0]).includes("ledger-step--warning"), "the rolled-back step (item-b at step 1) renders as stored");

  assert.ok(!cls(rows[0]).includes("ledger-row--error"), "a settled row never carries the error border");
  assert.ok(!vnodeText(rows[0]).includes("The write failed"), "the message stays scoped to the failed row");
});

// ─── 10. The atlas header (package `atlas-header-shell`, feature atlas-ux-realignment) ─

/** The committed tree's Elspeth lord — the input most header tests render. */
async function committedHeaderLord(): Promise<Lord> {
  const tree = await loadContentTree(fsReader(CONTENT));
  const lord = getLord(tree, "elspeth-von-draken");
  assert.ok(lord.found, "the committed lord loads");
  return lord.value;
}

/** An explicit-route desk member — a route-scoped desk used by the selection and keyboard-contract tests. */
const DESK_EXPLICIT: HeaderRoute = { name: "desk", lordSlug: "elspeth-von-draken", routeId: "route-2" };

/** One lord-scoped member per shape — the full header serves all of them (DESIGN §4). */
const FULL_FORM_MEMBERS: readonly HeaderRoute[] = [
  { name: "desk", lordSlug: "elspeth-von-draken", routeId: null },
  DESK_EXPLICIT,
  { name: "lord-page", lordSlug: "elspeth-von-draken", page: "sources" },
  { name: "lord-page", lordSlug: "elspeth-von-draken", page: "notes" },
  { name: "route-page", lordSlug: "elspeth-von-draken", page: "plan", routeId: "route-1" },
  { name: "route-page", lordSlug: "elspeth-von-draken", page: "ledger", routeId: "route-3" },
];

/** The `<a role="tab">` records of one header tablist (matched by its class prefix). */
function headerTabs(nodes: VNodeRecord[], prefix: "routebar__tab" | "pagenav__tab"): VNodeRecord[] {
  return nodes.filter((n) => n.tag === "a" && n.props.role === "tab" && cls(n).includes(prefix));
}

/** The unison reduced-form lord: the committed crest/environment stripped (the DESIGN's clean absence). */
function reducedLord(lord: Lord): Lord {
  return { ...lord, crestSvg: undefined, guide: { ...lord.guide, environment: undefined } };
}

test("the slim header renders the wordmark plus one lord link to #/<slug> over home, not-found, and boot states", async () => {
  // A null lord/route member is what home, not-found, and the boot states feed
  // the shell: the slim form only — the wordmark plus the available lord links.
  const lord = await committedHeaderLord();
  const nodes = recordVNodes(AtlasHeaderMarkup({ lords: [lord], lord: null, route: null }));
  const text = vnodeText(nodes);
  assert.ok(text.includes("VCO COMPANION"), "the wordmark renders — the header owns it now (the index.html slot is gone)");
  const links = nodes.filter((n) => n.tag === "a");
  assert.equal(links.length, 1, "one link per lord on the slim form");
  assert.equal(links[0]?.props.href, "#/elspeth-von-draken", "the lord link targets #/<slug>");
  assert.ok(vnodeText(links[0]).includes("Elspeth von Draken"), "the link carries the guide's lord display name");
  assert.ok(!vnodeText(nodes).includes("EXPEDITION ATLAS"), "the slim form never renders the topline brand");
  assert.ok(!nodes.some((n) => cls(n).split(/\s+/).includes("routebar")), "no routebar on the slim form");
  assert.ok(!nodes.some((n) => cls(n).split(/\s+/).includes("pagenav")), "no pagenav on the slim form");
  const boot = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: null, route: null }));
  assert.ok(vnodeText(boot).includes("VCO COMPANION"), "the boot states (no tree yet) still carry the wordmark");
  assert.deepEqual(boot.filter((n) => n.tag === "a"), [], "no lord links before the tree resolves");
});

test("the full header renders the three tiers — topline, routebar, pagenav — on every lord-scoped member", async () => {
  for (const route of FULL_FORM_MEMBERS) {
    const nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route }));
    assert.ok(nodes.some((n) => cls(n).split(/\s+/).includes("topline")), `${route.name}: the topline tier renders`);
    assert.ok(nodes.some((n) => cls(n).split(/\s+/).includes("routebar")), `${route.name}: the routebar tier renders`);
    assert.ok(nodes.some((n) => cls(n).split(/\s+/).includes("pagenav")), `${route.name}: the pagenav tier renders`);
    assert.ok(
      !vnodeText(nodes).includes("VCO COMPANION"),
      `${route.name}: the full form carries the atlas brand, never the slim wordmark`,
    );
  }
});

test("the topline brand links to #/<lord> with the uppercase faction and the EXPEDITION ATLAS · <lord> title", async () => {
  const nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: FULL_FORM_MEMBERS[0] }));
  const brand = nodes.find((n) => cls(n) === "topline__brand");
  assert.ok(brand !== undefined, "the brand anchor renders");
  assert.equal(brand.props.href, "#/elspeth-von-draken", "the brand links to the lord's reference desk (the default-route desk)");
  const brandText = vnodeText(brand);
  assert.ok(brandText.includes("EMPIRE"), "the faction eyebrow renders uppercase");
  assert.ok(brandText.includes("EXPEDITION ATLAS · Elspeth von Draken"), "the serif title carries the atlas brand formula");
});

test("the crest renders aria-hidden from crestSvg; a crest-less lord renders the brand without it — never a placeholder box", async () => {
  const nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: FULL_FORM_MEMBERS[0] }));
  const crest = nodes.find((n) => cls(n) === "topline__crest");
  assert.ok(crest !== undefined, "the crest container renders over the committed lord");
  assert.equal(crest.props["aria-hidden"], true, "the crest is decorative — aria-hidden");
  const inner = String((crest.props.dangerouslySetInnerHTML as { __html: string } | undefined)?.__html ?? "");
  assert.ok(inner.trimStart().startsWith("<svg"), "the inlined text is the boot-validated crest SVG");

  const plain = reducedLord(await committedHeaderLord());
  const reduced = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: plain, route: FULL_FORM_MEMBERS[0] }));
  assert.ok(!reduced.some((n) => cls(n) === "topline__crest"), "no crest element and no placeholder box without crestSvg");
  assert.ok(vnodeText(reduced).includes("EXPEDITION ATLAS · Elspeth von Draken"), "the brand still renders");
});

test("the environment line shows the dot + guide.environment when present and reduces cleanly — the patch/VCO pairing always renders", async () => {
  const nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: FULL_FORM_MEMBERS[0] }));
  const text = vnodeText(nodes);
  assert.ok(text.includes("Normal / Normal · Smart Autoresolve · VCO · Immortal Empires"), "the committed environment topline renders");
  assert.ok(nodes.some((n) => cls(n) === "topline__dot"), "the status dot renders with the environment line");

  const plain = reducedLord(await committedHeaderLord());
  const reduced = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: plain, route: FULL_FORM_MEMBERS[0] }));
  const reducedText = vnodeText(reduced);
  assert.ok(!reduced.some((n) => cls(n) === "topline__environment"), "no environment string when absent — never a blank placeholder");
  assert.ok(reducedText.includes("patch 9.0 · VCO 2026.09.30.1"), "the patch · VCO pairing always renders (reduced form included)");
  assert.ok(reduced.some((n) => cls(n) === "topline__dot"), "the status dot stays with the reduced line");
});

test("the toolbar is an empty reserved slot — no buttons this feature", async () => {
  const nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: FULL_FORM_MEMBERS[0] }));
  const toolbar = nodes.find((n) => cls(n) === "topline__tools");
  assert.ok(toolbar !== undefined, "the toolbar slot renders");
  assert.deepEqual(toolbar.children, [], "no buttons — the slot is reserved for F6/search and state export");
});

test("the routebar marks the hash-derived route selected — including #/<lord> selecting the first manifest route", async () => {
  // #/<lord>: no route id in the hash, yet the default-route desk is route-scoped
  // (recorded decision) — the routebar must show the resolved first route.
  let tabs = headerTabs(
    recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: FULL_FORM_MEMBERS[0] })),
    "routebar__tab",
  );
  assert.equal(tabs.length, 3, "one route tab per manifest route");
  assert.equal(tabs[0]?.props["aria-selected"], true, "route I is SELECTED at #/<lord>");
  assert.equal(tabs[0]?.props.tabIndex, 0, "the selected route tab is tabbable");
  assert.ok(
    tabs.slice(1).every((t) => t.props["aria-selected"] === false && t.props.tabIndex === -1),
    "the other route tabs rove at tabIndex −1",
  );

  // an explicit route-page member follows the hash's route id (distinct from
  // the first-route default, so the two cases cannot be confused)
  const planTwo: HeaderRoute = { name: "route-page", lordSlug: "elspeth-von-draken", page: "plan", routeId: "route-2" };
  tabs = headerTabs(
    recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: planTwo })),
    "routebar__tab",
  );
  assert.equal(tabs[1]?.props["aria-selected"], true, "route II is SELECTED on a #/<lord>/plan/route-2 member");
});

test("the routebar renders no route selection on the lord-scoped pages — the hash carries no route there", async () => {
  const sources: HeaderRoute = { name: "lord-page", lordSlug: "elspeth-von-draken", page: "sources" };
  const tabs = headerTabs(
    recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: sources })),
    "routebar__tab",
  );
  assert.ok(tabs.every((t) => t.props["aria-selected"] === false), "no route tab claims the selection on a lord page");
  assert.equal(tabs[0]?.props.tabIndex, 0, "the first route tab stays keyboard-reachable (roving starts there)");
  assert.ok(tabs.slice(1).every((t) => t.props.tabIndex === -1), "the remaining route tabs rove at −1");
});

test("routeTabHref keeps the page from a route-scoped member and targets plan/<route> from the lord pages (DESIGN rule 3)", () => {
  const lordSlug = "elspeth-von-draken";
  // from a route-scoped page the tab keeps the SAME page under the new route
  assert.equal(
    routeTabHref({ name: "route-page", lordSlug, page: "plan", routeId: "route-1" }, "route-2"),
    "#/elspeth-von-draken/plan/route-2",
    "plan keeps the plan page",
  );
  assert.equal(
    routeTabHref({ name: "route-page", lordSlug, page: "armies", routeId: "route-1" }, "route-3"),
    "#/elspeth-von-draken/armies/route-3",
    "armies keeps the armies page",
  );
  assert.equal(
    routeTabHref({ name: "route-page", lordSlug, page: "ledger", routeId: "route-1" }, "route-2"),
    "#/elspeth-von-draken/ledger/route-2",
    "the ledger tab targets ledger/<route> like the others",
  );
  // the desk at #/<lord> counts as route-scoped (recorded decision): desk/<new-route>
  assert.equal(
    routeTabHref({ name: "desk", lordSlug, routeId: null }, "route-2"),
    "#/elspeth-von-draken/desk/route-2",
    "the default-route desk switches routes to desk/<new-route>",
  );
  assert.equal(
    routeTabHref({ name: "desk", lordSlug, routeId: "route-1" }, "route-2"),
    "#/elspeth-von-draken/desk/route-2",
    "an explicit-route desk keeps the desk page too",
  );
  // from a lord-scoped page the tab targets plan/<route>
  assert.equal(
    routeTabHref({ name: "lord-page", lordSlug, page: "sources" }, "route-2"),
    "#/elspeth-von-draken/plan/route-2",
    "sources targets plan/<route>",
  );
  assert.equal(
    routeTabHref({ name: "lord-page", lordSlug, page: "notes" }, "route-1"),
    "#/elspeth-von-draken/plan/route-1",
    "notes targets plan/<route>",
  );
});

test("the rendered route tabs follow the member's page with the serif numeral, route name, and VCO line", async () => {
  const planOne: HeaderRoute = { name: "route-page", lordSlug: "elspeth-von-draken", page: "plan", routeId: "route-1" };
  const nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: planOne }));
  const tabs = headerTabs(nodes, "routebar__tab");
  assert.deepEqual(
    tabs.map((t) => t.props.href),
    [
      "#/elspeth-von-draken/plan/route-1",
      "#/elspeth-von-draken/plan/route-2",
      "#/elspeth-von-draken/plan/route-3",
    ],
    "from a route-scoped page every tab keeps the same page under the new route (rule 3)",
  );
  const firstText = vnodeText(tabs[0]);
  assert.ok(firstText.includes("I"), "the serif route numeral renders");
  assert.ok(firstText.includes("The Graveyard Watch"), "the route name renders");
  assert.ok(firstText.includes("UNRESEARCHED"), "the committed null vcoTitle renders the explicit marker");
});

test("a researched route tab renders its official VCO title instead of the marker", async () => {
  const lord = await committedHeaderLord();
  const researched: Lord = {
    ...lord,
    routes: lord.routes.map((route) => ({
      ...route,
      vcoTitle: route.id === "route-2" ? "Written in the Charter" : "Researched title",
    })),
  };
  const text = vnodeText(
    AtlasHeaderMarkup({ lords: [], lord: researched, route: FULL_FORM_MEMBERS[4] }),
  );
  assert.ok(text.includes("Written in the Charter"), "the official VCO title renders beneath the name line");
  assert.ok(!text.includes("UNRESEARCHED"), "no marker on a researched route");
});

test("the pagenav renders the DESIGN's generic eight tabs with hash-derived selection and the resolved route", async () => {
  const notes: HeaderRoute = { name: "lord-page", lordSlug: "elspeth-von-draken", page: "notes" };
  let nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: notes }));
  let tabs = headerTabs(nodes, "pagenav__tab");
  assert.equal(tabs.length, 8, "exactly the eight page tabs");
  assert.deepEqual(
    tabs.map((t) => vnodeText(t)),
    [
      "Reference desk",
      "Route plan",
      "Armies & skills",
      "Settlements & economy",
      "Faction workshop",
      "VCO ledger",
      "Field notes",
      "Sources & settings",
    ],
    "the DESIGN's generic eight labels in fixed order — never the atlas's faction-specific names",
  );
  assert.deepEqual(
    tabs.map((t) => String(t.props.href)),
    [
      "#/elspeth-von-draken/desk/route-1",
      "#/elspeth-von-draken/plan/route-1",
      "#/elspeth-von-draken/armies/route-1",
      "#/elspeth-von-draken/settlements/route-1",
      "#/elspeth-von-draken/workshop/route-1",
      "#/elspeth-von-draken/ledger/route-1",
      "#/elspeth-von-draken/notes",
      "#/elspeth-von-draken/sources",
    ],
    "the six route-page tabs resolve the first manifest route (rule 3) as #/<lord>/<page>/<route>; the two lord-page tabs (Field notes, Sources & settings) are the grammar's 2-segment #/<lord>/<page> shapes",
  );
  assert.equal(tabs[6]?.props["aria-selected"], true, "the current lord page (Field notes) is selected");
  assert.equal(tabs[6]?.props.tabIndex, 0, "the selected page tab is tabbable");

  const planTwo: HeaderRoute = { name: "route-page", lordSlug: "elspeth-von-draken", page: "plan", routeId: "route-2" };
  nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: planTwo }));
  tabs = headerTabs(nodes, "pagenav__tab");
  assert.deepEqual(
    tabs.map((t) => String(t.props.href)),
    [
      "#/elspeth-von-draken/desk/route-2",
      "#/elspeth-von-draken/plan/route-2",
      "#/elspeth-von-draken/armies/route-2",
      "#/elspeth-von-draken/settlements/route-2",
      "#/elspeth-von-draken/workshop/route-2",
      "#/elspeth-von-draken/ledger/route-2",
      "#/elspeth-von-draken/notes",
      "#/elspeth-von-draken/sources",
    ],
    "route-scoped pages keep the hash's route id on the six route pages — #/<lord>/<page>/<route> (the ledger tab included, index 5); the lord-page tabs stay the 2-segment #/<lord>/<page> shapes",
  );
  assert.equal(tabs[1]?.props["aria-selected"], true, "Route plan is selected on a plan member");
});

test("every rendered pagenav href round-trips through parseHash to its intended member", async () => {
  // The regression guard for the pagenav template: the six route-page tabs
  // are 3-segment shapes (#/<lord>/<page>/<route>), while the two lord-page
  // tabs — Field notes and Sources & settings — are the grammar's 2-segment
  // #/<lord>/<page> shapes. A uniform <segment>/<resolved> suffix would send
  // the lord pages (their own selected self-hrefs included) to not-found —
  // the defect this test pins. Three member shapes cover both resolved-route
  // sources: the default-route desk and the lord page resolving the first
  // manifest route, and a route page carrying the hash's own route id.
  const lord = await committedHeaderLord();
  const members: readonly HeaderRoute[] = [
    { name: "desk", lordSlug: lord.slug, routeId: null },
    { name: "lord-page", lordSlug: lord.slug, page: "notes" },
    { name: "route-page", lordSlug: lord.slug, page: "plan", routeId: "route-2" },
  ];
  for (const member of members) {
    const tabs = headerTabs(recordVNodes(AtlasHeaderMarkup({ lords: [], lord, route: member })), "pagenav__tab");
    const expectedRoute = member.name === "route-page" ? member.routeId : lord.routes[0].id;
    for (const tab of tabs) {
      const href = String(tab.props.href);
      const segment = href.slice(`#/${lord.slug}/`.length).split("/")[0];
      const parsed = parseHash(href);
      if (segment === "notes" || segment === "sources") {
        if (parsed.name !== "lord-page") {
          assert.fail(`${href} must parse to the lord-page member, not ${parsed.name}`);
        }
        assert.equal(parsed.lordSlug, lord.slug, `${href} keeps the lord`);
        assert.equal(parsed.page, segment, `${href} parses to the ${segment} page`);
      } else {
        if (parsed.name !== "route-page") {
          assert.fail(`${href} must parse to the route-page member, not ${parsed.name}`);
        }
        assert.equal(parsed.lordSlug, lord.slug, `${href} keeps the lord`);
        assert.equal(parsed.page, segment, `${href} parses to the ${segment} route page`);
        assert.equal(parsed.routeId, expectedRoute, `${href} carries the resolved route id (${expectedRoute})`);
      }
    }
  }
});

test("the pagenav carries the static save-state line verbatim — claiming nothing about autosave", async () => {
  const text = vnodeText(
    AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: FULL_FORM_MEMBERS[0] }),
  );
  assert.ok(text.includes("Saved locally · offline"), "the exact rendered atlas string");
  assert.ok(!/auto.?save/i.test(text), "the line never claims autosave");
});

test("both header tablists carry the TabStrip keyboard contract: named tablists, roving tabindex, one selection each", async () => {
  const nodes = recordVNodes(AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: DESK_EXPLICIT }));
  const tablists = nodes.filter((n) => n.props.role === "tablist");
  assert.equal(tablists.length, 2, "the routebar and the pagenav are the header's two tablists");
  assert.ok(tablists.some((n) => n.props["aria-label"] === "Routes"), "the routebar tablist is named");
  assert.ok(tablists.some((n) => n.props["aria-label"] === "Pages"), "the pagenav tablist is named");
  const tabs = nodes.filter((n) => n.tag === "a" && n.props.role === "tab");
  assert.equal(tabs.filter((t) => t.props["aria-selected"] === true).length, 2, "one selected tab per tablist");
  assert.equal(tabs.filter((t) => t.props.tabIndex === 0).length, 2, "exactly the two selected tabs are tabbable");
});

test("the header's local tabNav copy keeps the TabStrip wrap/bounds decision (the surviving proof once TabStrip.ts is deleted in Commit 11)", () => {
  assert.equal(headerTabNav("left", 0, 4), 3, "left from the first tab wraps to the last");
  assert.equal(headerTabNav("right", 3, 4), 0, "right from the last tab wraps to the first");
  assert.equal(headerTabNav("left", 2, 4), 1, "left in the middle steps down");
  assert.equal(headerTabNav("right", 1, 4), 2, "right in the middle steps up");
  assert.equal(headerTabNav("home", 2, 4), 0, "home lands on the first tab");
  assert.equal(headerTabNav("end", 0, 4), 3, "end lands on the last tab");
});

// ─── 10b. The search trigger (package `search-header-controls`, Commit 3 of
//            the cross-guide-search feature, DESIGN §4/§6) ────────────────
// The header's one rule: the optional `onOpenSearch` prop present → render
// the trigger; absent → the header output stays exactly as before (the F10
// zero-lord contract). The trigger is a real ghost button labelled "Search"
// with the <kbd>/</kbd> chip and the aria-name "Open search ( / )", firing
// the callback; WHICH pages pass the prop is the shell's decision (Commit
// 4) — the header never page-scopes.

/** The trigger button records of one header render (matched by its class). */
function headerSearchTriggers(nodes: VNodeRecord[]): VNodeRecord[] {
  return nodes.filter((n) => cls(n).split(/\s+/).includes("atlas-header__search"));
}

test("full form: onOpenSearch renders the trigger inside topline__tools, and its absence keeps the slot content-free", async () => {
  const lord = await committedHeaderLord();
  const without = recordVNodes(AtlasHeaderMarkup({ lords: [], lord, route: FULL_FORM_MEMBERS[0] }));
  const withProp = recordVNodes(
    AtlasHeaderMarkup({ lords: [], lord, route: FULL_FORM_MEMBERS[0], onOpenSearch: () => {} }),
  );

  const emptySlot = without.find((n) => cls(n) === "topline__tools");
  assert.ok(emptySlot !== undefined, "the reserved toolbar slot renders");
  assert.deepEqual(emptySlot.children, [], "absent prop: content-free exactly as today (the F10 zero-lord contract)");

  const filledSlot = withProp.find((n) => cls(n) === "topline__tools");
  assert.ok(filledSlot !== undefined, "the slot renders with the prop supplied too");
  assert.equal(filledSlot.children.length, 1, "the slot's only child is the trigger");
  assert.equal(headerSearchTriggers(recordVNodes(filledSlot)).length, 1, "that child is the search trigger");
  assert.deepEqual(
    recordVNodes(filledSlot).slice(1).map((n) => n.tag),
    ["button", "kbd"],
    "the slot holds nothing but the trigger button and its kbd chip",
  );
  assert.deepEqual(headerSearchTriggers(without), [], "no trigger anywhere on the prop-absent full form");
});

test("the trigger is a real ghost button: the Search label, the <kbd>/</kbd> chip, the aria-name, and the callback", async () => {
  const onOpenSearch = (): void => {};
  const nodes = recordVNodes(
    AtlasHeaderMarkup({ lords: [], lord: await committedHeaderLord(), route: FULL_FORM_MEMBERS[0], onOpenSearch }),
  );
  const trigger = headerSearchTriggers(nodes)[0];
  assert.ok(trigger !== undefined, "the trigger renders in the topline");
  assert.equal(trigger.tag, "button", "a real button control — keyboard-reachable");
  assert.equal(trigger.props.type, "button", "type=button — never a submit");
  assert.ok(vnodeText(trigger).includes("Search"), "the visible label reads Search");
  const chip = recordVNodes(trigger).find((n) => n.tag === "kbd");
  assert.equal(chip?.children[0], "/", "the trigger carries the <kbd>/</kbd> chip");
  assert.equal(trigger.props["aria-label"], "Open search ( / )", "the aria-name spells the shortcut");
  assert.equal(trigger.props.onClick, onOpenSearch, "clicking the trigger fires the supplied callback");
  assert.ok(
    String(trigger.props.className).split(/\s+/).includes("button--ghost"),
    "the trigger rides the shared ghost-button variant",
  );
});

test("slim form: onOpenSearch renders the trigger after the lord links, and its absence renders none", async () => {
  const lord = await committedHeaderLord();
  const without = recordVNodes(AtlasHeaderMarkup({ lords: [lord], lord: null, route: null }));
  assert.deepEqual(headerSearchTriggers(without), [], "absent prop: no trigger on the slim form");

  const withProp = recordVNodes(
    AtlasHeaderMarkup({ lords: [lord], lord: null, route: null, onOpenSearch: () => {} }),
  );
  assert.equal(headerSearchTriggers(withProp).length, 1, "the prop renders exactly one trigger on the slim form");

  // wordmark and lord links keep their positions: the trigger is the wrap's
  // final flex item, after the lords nav (the recorded slim-header deviation).
  const wrap = withProp.find((n) => cls(n) === "atlas-header__wrap");
  assert.ok(wrap !== undefined, "the slim wrap renders");
  assert.deepEqual(
    recordVNodes(wrap).filter((n) => n.tag === "p" || n.tag === "nav" || n.tag === "button").map((n) => n.tag),
    ["p", "nav", "button"],
    "wordmark first, the lord-links nav, then the trigger — order preserved",
  );
  const text = vnodeText(withProp);
  assert.ok(
    text.indexOf("VCO COMPANION") < text.indexOf("Elspeth von Draken") &&
      text.indexOf("Elspeth von Draken") < text.indexOf("Search"),
    "flattened order: wordmark → lord links → trigger",
  );
});

/** A stable one-record signature: tag + the readable props (raw `children`
 *  VNodes excluded — preact stamps per-instance internal field values on
 *  them) + the flattened subtree text. The byte-identity comparator for two
 *  renders: equal sig lists ⇒ identical readable output. */
function recordSig(record: VNodeRecord): string {
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record.props)) {
    if (key !== "children") props[key] = value;
  }
  return JSON.stringify([record.tag, props, vnodeText(record)]);
}

test("the onOpenSearch prop changes no other header output — the trigger (and its container chain) is the only difference in both forms", async () => {
  const lord = await committedHeaderLord();
  const stripSearch = (nodes: VNodeRecord[]): VNodeRecord[] =>
    nodes.filter((n) => {
      const classes = cls(n).split(/\s+/);
      return (
        !classes.includes("topline") &&            // the topline tier holding the slot
        !classes.includes("topline__tools") &&     // the reserved slot itself
        !classes.includes("atlas-header") &&       // the header root
        !classes.includes("atlas-header__wrap") && // the slim/full wrap
        !classes.includes("atlas-header__search") && // the trigger button
        n.tag !== "kbd"                            // the trigger's kbd chip
      );
    });

  const fullWithout = recordVNodes(AtlasHeaderMarkup({ lords: [], lord, route: FULL_FORM_MEMBERS[0] }));
  const fullWith = recordVNodes(
    AtlasHeaderMarkup({ lords: [], lord, route: FULL_FORM_MEMBERS[0], onOpenSearch: () => {} }),
  );
  assert.deepEqual(
    stripSearch(fullWith).map(recordSig),
    stripSearch(fullWithout).map(recordSig),
    "the full form gains only the trigger",
  );

  const slimWithout = recordVNodes(AtlasHeaderMarkup({ lords: [lord], lord: null, route: null }));
  const slimWith = recordVNodes(AtlasHeaderMarkup({ lords: [lord], lord: null, route: null, onOpenSearch: () => {} }));
  assert.deepEqual(
    stripSearch(slimWith).map(recordSig),
    stripSearch(slimWithout).map(recordSig),
    "the slim form gains only the trigger",
  );
});

// ─── 11. The search dialog (package `search-dialog-component`, Commit 2 of
//                       the cross-guide-search feature) ──────────────────────
// The DESIGN §2/§5 list rules proven over constructed `SearchResults` (two
// factions, two routes, lord-wide entries, a 30+ total, the empty and
// no-match states): the zero-DOM `SearchDialogMarkup` VNode builder is
// flattened with the same helpers the views use, so every assertion is an
// observable rendering rule, not class-name trivia beyond the selected-row
// marker and the match spans.

/** The route-scoped section hit — "garrison" matched inside the snippet. */
const SEARCH_SECTION_HIT: SearchHit = {
  kind: "section",
  lordSlug: "als-rhyn-of-lorek",
  faction: "Tomb Kings",
  routeId: "dark-conduits",
  routeLabel: "I · The Dark Conduits",
  category: "Route plan",
  title: "Early → Mid",
  snippet: "Hold the gate against the garrison.",
  occurrences: [{ start: 26, end: 34 }],
  href: "#/als-rhyn-of-lorek/plan/dark-conduits/early-mid",
};

/** The lord-wide shared hit — same faction, no route label. */
const SEARCH_SHARED_HIT: SearchHit = {
  kind: "shared",
  lordSlug: "als-rhyn-of-lorek",
  faction: "Tomb Kings",
  routeId: null,
  routeLabel: null,
  category: "Shared fundamentals",
  title: "Shared fundamentals",
  snippet: "The garrisons of the desert watch the passes.",
  occurrences: [{ start: 4, end: 13 }],
  href: "#/als-rhyn-of-lorek",
};

/** The second faction's route-scoped army hit. */
const SEARCH_ARMY_HIT: SearchHit = {
  kind: "army",
  lordSlug: "second-lord",
  faction: "Lizardmen",
  routeId: "lone-route",
  routeLabel: "II · The Lone Watch",
  category: "Army templates",
  title: "The first column",
  snippet: "Skinks hold the line against the garrison.",
  occurrences: [{ start: 33, end: 41 }],
  href: "#/second-lord/armies/lone-route",
};

/** The second faction's lord-wide source hit — no match inside its snippet. */
const SEARCH_SOURCE_HIT: SearchHit = {
  kind: "source",
  lordSlug: "second-lord",
  faction: "Lizardmen",
  routeId: null,
  routeLabel: null,
  category: "Sources",
  title: "Spawning Pools archive",
  snippet: "Source note for the lone watch.",
  occurrences: [],
  href: "#/second-lord/sources",
};

/** The four hits in hit order: two factions, two routes, both lord-wide kinds. */
const SEARCH_GROUPED_RESULTS: SearchResults = {
  total: 4,
  hits: [SEARCH_SECTION_HIT, SEARCH_SHARED_HIT, SEARCH_ARMY_HIT, SEARCH_SOURCE_HIT],
};

/** Renders the dialog with the wrapper-less prop set the tests always control. */
function renderSearchDialog(
  query: string,
  results: SearchResults,
  selectedIndex = 0,
  open = true,
): VNodeRecord[] {
  return recordVNodes(
    SearchDialogMarkup({
      open,
      query,
      results,
      selectedIndex,
      onQueryChange: () => {},
      onOpenSelected: () => {},
      onClose: () => {},
    }),
  );
}

/** The rows (real buttons) and the row's one part's text, from one rendered dialog. */
function searchRows(nodes: VNodeRecord[]): VNodeRecord[] {
  return nodes.filter((n) => n.tag === "button" && cls(n).split(/\s+/).includes("search-hit"));
}

function searchRowPart(row: VNodeRecord, part: string): string {
  const child = recordVNodes(row).find((n) => cls(n).split(/\s+/).includes(part));
  return child === undefined ? "" : vnodeText(child);
}

test("the search dialog is a labelled native dialog: head, labelled field, and the hint line — no hits for an empty or whitespace-only query", () => {
  for (const query of ["", "   "]) {
    const nodes = renderSearchDialog(query, { total: 0, hits: [] });
    const dialog = nodes.find((n) => n.tag === "dialog" && cls(n).split(/\s+/).includes("search-dialog"));
    assert.ok(dialog !== undefined, "the native <dialog class=search-dialog> root renders");
    assert.equal(dialog.props["aria-label"], "Search the guides", "the dialog is labelled by its title");
    assert.equal(
      dialog.props.open,
      undefined,
      "the builder never renders the native open attribute — the wrapper's showModal() owns the open state (a rendered open would make showModal throw InvalidStateError)",
    );
    const text = vnodeText(dialog);
    assert.ok(text.includes("ALL GUIDES") && text.includes("Search the guides"), "the mono eyebrow + serif title render");
    assert.ok(text.includes("Unit, skill, building, mechanic or objective"), "the field's visible label renders");

    const field = nodes.find((n) => n.tag === "input" && n.props.type === "search");
    assert.ok(field !== undefined, "the labelled type=search field renders");
    assert.equal(field.props.value, query, "the field reflects the query text");

    assert.ok(
      text.includes("Search a unit, named skill, building, mechanic or objective."),
      "an empty/whitespace query renders the hint line — never a blank list",
    );
    assert.ok(!text.includes("matching references."), "no count line for an empty query");
    assert.deepEqual(searchRows(nodes), [], "no hit rows for an empty query");
    assert.ok(!nodes.some((n) => cls(n).split(/\s+/).includes("search-dialog__group")), "no faction headers for an empty query");
  }
});

test("a non-empty query with zero matches renders the explicit no-match line and no list", () => {
  const nodes = renderSearchDialog("garzon", { total: 0, hits: [] });
  const text = vnodeText(nodes);
  assert.ok(
    text.includes("No match in any guide. Try a shorter phrase."),
    "the explicit no-match line renders — never a blank region",
  );
  assert.ok(!text.includes("Search a unit,"), "the empty-query hint does not render for a non-empty query");
  assert.ok(!text.includes("matching references."), "no count line for a no-match query");
  assert.deepEqual(searchRows(nodes), [], "no hit rows for a no-match query");
});

test("hits group by faction in hit order with route breadcrumbs, category eyebrows, exact match spans, and no raw HTML", () => {
  const nodes = renderSearchDialog("garrison", SEARCH_GROUPED_RESULTS);
  const dialogText = vnodeText(nodes);

  const groupTexts = nodes
    .filter((n) => cls(n).split(/\s+/).includes("search-dialog__group"))
    .map((n) => vnodeText(n));
  assert.deepEqual(groupTexts, ["Tomb Kings", "Lizardmen"], "one faction header per lord, in hit order — never re-sorted");

  const rows = searchRows(nodes);
  assert.equal(rows.length, 4, "one button row per hit");
  assert.ok(rows.every((row) => row.props.type === "button"), "every hit row is a real button control");

  const crumbs = rows.map((row) => searchRowPart(row, "search-hit__crumb"));
  assert.deepEqual(
    crumbs,
    [
      "Tomb Kings / I · The Dark Conduits / Early → Mid",
      "Tomb Kings / Shared fundamentals",
      "Lizardmen / II · The Lone Watch / Army templates",
      "Lizardmen / Sources",
    ],
    "the mono breadcrumb is faction / route / section-or-category, with the route omitted for lord-wide hits",
  );

  const categories = rows.map((row) => searchRowPart(row, "search-hit__category"));
  assert.deepEqual(
    categories,
    ["Route plan", "Shared fundamentals", "Army templates", "Sources"],
    "each row renders its category eyebrow",
  );

  const titles = rows.map((row) => searchRowPart(row, "search-hit__title"));
  assert.deepEqual(
    titles,
    ["Early → Mid", "Shared fundamentals", "The first column", "Spawning Pools archive"],
    "rows keep hit order, never re-sorted",
  );

  // The snippet renders as plain text with each occurrence wrapped in exactly
  // one search-hit__match span at its exact range — never HTML.
  const matches = (row: VNodeRecord): VNodeRecord[] =>
    recordVNodes(row).filter((n) => cls(n).split(/\s+/).includes("search-hit__match"));
  assert.equal(String(matches(rows[0])[0].children[0]), "garrison", "the matched run is spelled exactly by the span");
  assert.equal(String(matches(rows[1])[0].children[0]), "garrisons", "the second faction's shared hit spans its own match");
  assert.equal(String(matches(rows[2])[0].children[0]), "garrison", "the second faction's route hit spans its match");
  assert.deepEqual(matches(rows[3]), [], "a snippet without an occurrence carries no match span");

  const snippet = recordVNodes(rows[0]).find((n) => cls(n).split(/\s+/).includes("search-hit__snippet"));
  assert.equal(snippet?.children[0], "Hold the gate against the ", "text before the match renders as a plain text node");
  assert.equal(snippet?.children[2], ".", "text after the match renders as a plain text node");

  assert.ok(!dialogText.includes("<"), "the flattened dialog carries no raw markup");
});

test("the count line reports the total, and the 30+ convention when the list is capped", () => {
  const small = vnodeText(renderSearchDialog("garrison", { total: 5, hits: [SEARCH_SECTION_HIT] }));
  assert.ok(small.includes("5 matching references."), "the count reports the total");
  assert.ok(!small.includes("30+"), "an under-cap total never claims the 30+ convention");

  const capped = vnodeText(renderSearchDialog("the", { total: 42, hits: SEARCH_GROUPED_RESULTS.hits }));
  assert.ok(capped.includes("30+ matching references."), "a total above the cap renders the explicit 30+ convention");
});

test("the dialog head carries the ghost Close button with the Esc kbd chip; the selected row is marked, non-colour-wise, exactly once", () => {
  const nodes = renderSearchDialog("garrison", SEARCH_GROUPED_RESULTS, 1);
  const close = nodes.find((n) => n.tag === "button" && cls(n).split(/\s+/).includes("search-dialog__close"));
  assert.ok(close !== undefined, "the Close button renders");
  assert.ok(typeof close?.props.onClick === "function", "the Close button calls the close handler");
  assert.ok(vnodeText(close).includes("Close"), "the button is labelled Close");
  const chip = recordVNodes(close).find((n) => n.tag === "kbd");
  assert.ok(chip !== undefined && chip.children[0] === "Esc", "the button carries the <kbd>Esc</kbd> chip");

  const rows = searchRows(nodes);
  assert.equal(rows.length, 4);
  assert.ok(cls(rows[1]).includes("search-hit--selected"), "the row at selectedIndex carries the --selected marker");
  assert.ok(
    rows.every((row, index) => index === 1 || !cls(row).includes("--selected")),
    "no row other than the selected one carries the marker",
  );
  assert.equal(rows[1].props["aria-current"], "true", "the selected row is identified via aria-current — never colour alone");
  assert.equal(
    rows.filter((row) => row.props["aria-current"] === "true").length,
    1,
    "exactly one row carries the selection indicator",
  );
});

test("searchHitNav wraps the selection over the flat hit list at both ends and stays inert at zero elements", () => {
  assert.equal(searchHitNav("down", 2, 5), 3, "down in the middle steps up");
  assert.equal(searchHitNav("up", 2, 5), 1, "up in the middle steps down");
  assert.equal(searchHitNav("down", 4, 5), 0, "down from the last row wraps to the first");
  assert.equal(searchHitNav("up", 0, 5), 4, "up from the first row wraps to the last");
  assert.equal(searchHitNav("down", 0, 1), 0, "a single-element list wraps to itself going down");
  assert.equal(searchHitNav("up", 0, 1), 0, "a single-element list wraps to itself going up");
  assert.equal(searchHitNav("down", 0, 0), 0, "an empty list stays at 0");
  assert.equal(searchHitNav("up", 7, 0), 0, "an empty list stays at 0 for any index");
});
