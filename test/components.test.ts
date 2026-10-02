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
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { loadContentTree } from "../app/content/load.ts";
import { getRoute } from "../app/content/query.ts";
import { CLAIM_STATES, type ContentReader, type Source } from "../app/content/types.ts";
import { ConfidenceBadge } from "../app/components/ConfidenceBadge.ts";

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
