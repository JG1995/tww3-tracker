/**
 * Boot the immutable content tree (ADR-0002, DESIGN §4/§5).
 *
 * The **only** file in the content domain with I/O: it reads `index.json`,
 * every manifest, and every named content file through an injected
 * `ContentReader` (browser `fetch` is the production reader; tests and the
 * CLI provide filesystem readers), renders Markdown once with markdown-it
 * plus one custom block rule for `::claim` callouts, validates through the
 * shared `lintContent` rule set, and deep-freezes the resulting tree. A
 * failed or invalid file is a boot error naming file + field — never a
 * partial tree.
 */

import MarkdownIt from "markdown-it";
import type { StateBlock } from "markdown-it";

import {
  type ArmiesDataset,
  type Claim,
  type ClaimState,
  type ContentReader,
  type ContentTree,
  type GuideManifest,
  type GuideRouteRef,
  type ItemDataset,
  type JsonValue,
  type Lord,
  type LordDataset,
  type PanelOrder,
  type Route,
  type Section,
  type Source,
  type VcoDataset,
  CLAIM_STATES,
} from "./types.ts";
import { CONFIDENCE_BADGES } from "../badges.ts";
import {
  lintContent,
  parseFrontmatter,
  parseClaimLine,
  splitFrontmatter,
  extractSections,
  extractClaimMarkers,
  type FmMap,
  type FmValue,
  type ContentViolation,
} from "./lint.ts";

/** Boot failure naming the offending file and field (DESIGN §5, never a white page). */
export class ContentBootError extends Error {
  readonly file: string;
  readonly field: string;
  readonly violations: readonly ContentViolation[];
  constructor(
    file: string,
    field: string,
    message: string,
    violations: readonly ContentViolation[] = [],
  ) {
    super(message);
    this.name = "ContentBootError";
    this.file = file;
    this.field = field;
    this.violations = violations;
  }

  static fromViolations(violations: readonly ContentViolation[]): ContentBootError {
    const first = violations[0];
    const suffix =
      violations.length > 1 ? ` (+${violations.length - 1} more violation(s))` : "";
    return new ContentBootError(
      first.file,
      first.field,
      `${first.file}:${first.field} — ${first.message}${suffix}`,
      violations,
    );
  }
}

// ─── Markdown: once per boot, one container rule for `::claim` blocks ────────

const md = new MarkdownIt();

/**
 * Render env for boot-time Markdown: the lord's parsed sources, so the
 * `claim_callout_open` rule can resolve each claim `src` id to its link
 * (feature DESIGN §"Confidence Badges": a `src`-carrying claim shows source
 * links). markdown-it stays confined to this module. (A type alias, not an
 * interface: object-literal types are the ones assignable to markdown-it's
 * index-signature `Env`.)
 */
type ClaimRenderEnv = {
  readonly sources: readonly Source[];
};

/** Renders the inner HTML of a `::claim … ::` block, sharing the lint's opener grammar. */
function claimCalloutBlock(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const maxPos = state.eMarks[startLine];
  const parsed = parseClaimLine(state.src.slice(start, maxPos));
  if (parsed === null) return false;

  // The block is bounded by a line whose trimmed content is exactly "::".
  let closeLine = -1;
  for (let i = startLine + 1; i < endLine; i++) {
    const s = state.bMarks[i] + state.tShift[i];
    const e = state.eMarks[i];
    if (state.src.slice(s, e).trim() === "::") {
      closeLine = i;
      break;
    }
  }
  if (closeLine === -1) return false; // unterminated: let default parsing handle it; lint flags it

  if (silent) return true;

  const stateWord = parsed.state;
  const srcIds = parsed.src;

  const open = state.push("claim_callout_open", "aside", 1);
  open.meta = { state: stateWord, src: srcIds };

  const oldParent = state.parentType;
  state.parentType = "claim_callout"; // excludes this rule's alt chain, so callouts do not nest
  state.md.block.tokenize(state, startLine + 1, closeLine);
  state.parentType = oldParent;

  state.push("claim_callout_close", "aside", -1);
  state.line = closeLine + 1;
  return true;
}

md.block.ruler.before("fence", "claim_callout", claimCalloutBlock, {
  alt: ["paragraph", "reference", "blockquote", "list"],
});

/**
 * The callout HTML keeps the existing classed-aside contract
 * (`class="claim"`, `data-state`, `data-src` — the content-model callout
 * assertions depend on them) and adds the Confidence Badge anatomy (icon +
 * mono uppercase label + one trailing link per `src` id) inside it, matching
 * the data-driven `ConfidenceBadge` component. Per-`src` links resolve at
 * boot against the lord's sources carried in the render env.
 */
md.renderer.rules.claim_callout_open = (tokens, idx, _options, env) => {
  const meta = tokens[idx].meta as { state: string; src: readonly string[] } | null;
  const stateWord = meta?.state ?? "claim";
  const srcIds = meta?.src ?? [];
  const esc = (s: string): string =>
    s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const aside = `<aside class="claim claim--${esc(stateWord)}" data-state="${esc(stateWord)}" data-src="${esc(srcIds.join(","))}">`;

  // The badge anatomy exists only for the four lint-validated states. Any other
  // word (reachable only from the shared-fundamentals callout, which the lint's
  // claim scanners do not cover) keeps the existing classed-aside contract.
  const state: ClaimState | null = CLAIM_STATES.find((s) => s === stateWord) ?? null;
  if (state === null) return `${aside}\n`;

  const sources = (env?.sources as readonly Source[] | undefined) ?? [];
  // A src id that the dangling-src lint missed (shared-fundamentals callouts are
  // not scanned) simply gets no link rather than breaking boot.
  const srcLinks = srcIds
    .map((id) => {
      const source = sources.find((s) => s.id === id);
      return source === undefined
        ? ""
        : `<a class="confidence-badge__src" href="${esc(source.url)}">${esc(source.title)}</a>`;
    })
    .join("");
  const badge = CONFIDENCE_BADGES[state];
  const svg =
    `<svg class="confidence-badge__icon" width="12" height="12" viewBox="0 0 12 12" ` +
    `fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true">${badge.iconSvg}</svg>`;
  return (
    `${aside}\n` +
    `<span class="confidence-badge confidence-badge--${esc(stateWord)}">${svg}` +
    `<span class="confidence-badge__label">${esc(badge.label)}</span>${srcLinks}</span>\n`
  );
};
md.renderer.rules.claim_callout_close = () => "</aside>\n";

// ─── Tree building ───────────────────────────────────────────────────────────

/** Anchor id for a section heading (`#/<lord>/route/<route>/<section-id>`). */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

function emptyTree(): ContentTree {
  return deepFreeze({ lords: [] });
}

/**
 * Loads the content tree: index → all guides (one parallel batch) → every
 * named file (one parallel pass) → lint → immutable frozen tree. Missing
 * index with no other files is the valid empty state (DESIGN §5).
 */
export async function loadContentTree(reader: ContentReader): Promise<ContentTree> {
  // Cache of everything already fetched, so lintContent re-reads memory, not I/O.
  const cache = new Map<string, string>();
  const cachedReader: ContentReader = {
    readFile: async (path: string): Promise<string> => cache.get(path) ?? (await reader.readFile(path)),
    listFiles: (): Promise<string[] | null> => reader.listFiles(),
  };

  // 1. index (single read)
  let indexRaw: string;
  try {
    indexRaw = await reader.readFile("index.json");
  } catch {
    let files: string[] | null;
    try {
      files = await reader.listFiles();
    } catch {
      files = null;
    }
    if (files === null || files.length === 0) return emptyTree();
    throw new ContentBootError("index.json", "lords", "content/index.json is missing but content files exist");
  }
  cache.set("index.json", indexRaw);
  let index: unknown;
  try {
    index = JSON.parse(indexRaw);
  } catch (e) {
    throw new ContentBootError("index.json", "lords", `unparseable JSON in content/index.json: ${(e as Error).message}`);
  }
  const idx = index as Record<string, unknown>;
  if (!Array.isArray(idx.lords) || !idx.lords.every((s): s is string => typeof s === "string")) {
    throw new ContentBootError("index.json", "lords", 'index.json must be { "lords": ["<lord-slug>", …] }');
  }
  const slugs = idx.lords as string[];

  // 2. every guide.json in one parallel batch
  const guides = await Promise.all(
    slugs.map(async (slug) => {
      const path = `${slug}/guide.json`;
      let text: string;
      try {
        text = await reader.readFile(path);
      } catch {
        throw new ContentBootError(path, "lords", `index names lord "${slug}" but ${path} is unreadable`);
      }
      cache.set(path, text);
      let manifest: GuideManifest | null = null;
      try {
        manifest = JSON.parse(text) as GuideManifest;
      } catch {
        manifest = null; // lint reports the unparseable manifest
      }
      return { slug, manifest };
    }),
  );

  // 3. every named file in exactly one parallel pass
  interface ToFetch {
    readonly path: string;
    readonly field: string;
  }
  const toFetch: ToFetch[] = [];
  for (const lord of guides) {
    const m = lord.manifest;
    if (m === null) continue;
    if (Array.isArray(m.routes)) {
      for (const r of m.routes) {
        if (typeof (r as Record<string, unknown>).file === "string") {
          toFetch.push({ path: `${lord.slug}/${(r as Record<string, unknown>).file as string}`, field: "routes" });
        }
      }
    }
    if (typeof m.shared === "string") toFetch.push({ path: `${lord.slug}/${m.shared}`, field: "shared" });
    if (Array.isArray(m.datasets)) {
      for (const d of m.datasets) {
        if (typeof d === "string") toFetch.push({ path: `${lord.slug}/data/${d}.json`, field: "datasets" });
      }
    }
  }
  const reads: Array<Promise<void>> = [];
  for (const { path, field } of toFetch) {
    reads.push(
      (async (): Promise<void> => {
        let text: string;
        try {
          text = await reader.readFile(path);
        } catch {
          throw new ContentBootError(path, field, "named in a manifest but unreadable");
        }
        cache.set(path, text);
      })(),
    );
  }
  await Promise.all(reads);

  // 4. validate with the same rule set the CLI will use
  const violations = await lintContent(cachedReader);
  if (violations.length > 0) throw ContentBootError.fromViolations(violations);

  // 5. build the tree (shapes are guaranteed by the lint just passed)
  const lords: Lord[] = [];
  for (const lord of guides) {
    if (lord.manifest === null) continue; // unreachable: lint would have failed the boot
    lords.push(buildLord(lord.slug, lord.manifest, cache));
  }
  return deepFreeze({ lords });
}

function buildLord(slug: string, manifest: GuideManifest, cache: Map<string, string>): Lord {
  const datasets: LordDataset[] = [];
  let sources: readonly Source[] = [];
  for (const name of manifest.datasets) {
    const path = `${slug}/data/${name}.json`;
    const dataset = buildDataset(name, parseDataset(path, cache.get(path) ?? ""));
    if (dataset.name === "sources") sources = dataset.value;
    datasets.push(dataset);
  }
  const env: ClaimRenderEnv = { sources };
  const routes: Route[] = [];
  for (const ref of manifest.routes) {
    const text = cache.get(`${slug}/${ref.file}`) ?? "";
    routes.push(buildRoute(ref, text, env));
  }
  const sharedHtml = md.render(cache.get(`${slug}/${manifest.shared}`) ?? "", env);
  return { slug, guide: manifest, sharedHtml, routes, datasets };
}

/** Parses a dataset JSON; the lint has already proven it parseable (a boot would have thrown). */
function parseDataset(path: string, raw: string): JsonValue {
  try {
    return JSON.parse(raw) as JsonValue;
  } catch (e) {
    throw new Error(`internal invariant: ${path} passed the lint but does not parse: ${(e as Error).message}`);
  }
}

/**
 * Casts one parsed dataset to its typed DESIGN §4 value. SAFETY: `lintContent`
 * has already validated every manifest-named dataset against its schema (the
 * per-schema dataset validators plus the sources shape rule) before the tree
 * is built, so each cast below is the post-validation contract — exactly like
 * the sources cast it replaces. The default is unreachable: the lint also
 * validated the manifest's `datasets[]` vocabulary.
 */
function buildDataset(name: string, value: JsonValue): LordDataset {
  switch (name) {
    case "sources":
      // SAFETY: lintContent validated this value as `Source[]` (id/title/url/note).
      return { name: "sources", value: value as unknown as readonly Source[] };
    case "armies":
      // SAFETY: the armies schema validator ran on this value.
      return { name: "armies", value: value as unknown as ArmiesDataset };
    case "vco":
      // SAFETY: the vco schema validator ran on this value.
      return { name: "vco", value: value as unknown as VcoDataset };
    case "skills":
    case "research":
    case "buildings":
    case "mechanics":
      // SAFETY: the item schema validator ran on this value.
      return { name, value: value as unknown as ItemDataset };
    default:
      throw new Error(`internal invariant: dataset "${name}" passed the vocabulary lint`);
  }
}

function claimFrom(value: FmValue | undefined): Claim {
  const c = (typeof value === "object" && value !== null ? value : {}) as FmMap;
  // Shape already proven by lint; raw casts are the post-validation contract.
  return {
    text: c.text as string,
    state: c.state as ClaimState,
    src: Array.isArray(c.src) ? (c.src as readonly string[]) : [],
  };
}

function optionalString(value: FmValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function buildRoute(ref: GuideRouteRef, text: string, env: ClaimRenderEnv): Route {
  const scan = splitFrontmatter(text);
  const meta = parseFrontmatter(scan.frontmatter ?? "");
  const sectionScan = extractSections(scan.body);
  const sections: Section[] = sectionScan.sections.map((s) => ({
    id: slugify(s.title),
    title: s.title,
    html: md.render(s.body, env),
  }));
  const claims = extractClaimMarkers(scan.body).map((m) => ({
    state: m.state as ClaimState,
    src: m.src,
    text: m.text,
  }));
  const po = meta.panelOrder;
  const panelOrder: PanelOrder | undefined =
    typeof po === "object" && po !== null && !Array.isArray(po)
      ? Object.fromEntries(
          Object.entries(po).map(([k, v]) => {
            // SAFETY: the panelOrder rule validated every group value as a
            // list of entry-id strings before the tree is built.
            const ids = Array.isArray(v) ? (v as unknown as readonly string[]) : [];
            return [k, Object.freeze(ids)];
          }),
        )
      : undefined;
  return {
    id: ref.id,
    number: ref.number,
    name: meta.name as string,
    vcoTitle: meta.vcoTitle === null ? null : (meta.vcoTitle as string),
    objective: claimFrom(meta.objective),
    reward: claimFrom(meta.reward),
    interpretation: optionalString(meta.interpretation),
    bottleneck: optionalString(meta.bottleneck),
    motto: optionalString(meta.motto),
    transitions: optionalString(meta.transitions),
    panelOrder,
    gaps: Array.isArray(meta.gaps) ? (meta.gaps as readonly string[]) : [],
    sections,
    claims,
  };
}

// ─── Production reader: browser fetch (file:// has no directory listing) ────

/**
 * The browser production reader: fetches `content/`-relative paths against
 * `baseUrl` (the loader origin) and cannot enumerate files, so only the
 * manifest-named set is linted in the browser — exactly as DESIGN §4 notes
 * for `file://`, where manifests are the only listing there is.
 */
export function createFetchReader(baseUrl: string): ContentReader {
  const root = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return {
    async readFile(path: string): Promise<string> {
      const response = await fetch(`${root}${path}`);
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
      return response.text();
    },
    async listFiles(): Promise<string[] | null> {
      return null;
    },
  };
}
