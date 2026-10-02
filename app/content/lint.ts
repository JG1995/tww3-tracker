/**
 * The content rule set (DESIGN §4) — pure over an injected reader.
 *
 * This module is deliberately free of I/O: it receives an injected
 * `ContentReader` and yields `{ file, field, message }` violations. Both
 * entry points run the same rules — `load.ts` at boot (via the reader it
 * was given) and the content-lint CLI later over a filesystem reader.
 *
 * It also owns the pure content-syntax layer the loader reuses: the
 * frontmatter-subset parser and the Markdown structure scanners (sections,
 * claim callouts). Keeping the grammar here means the loader, the lint, and
 * the CLI can never drift apart, and the CLI never has to bundle `load.ts`
 * or markdown-it. A full YAML parser is not justified (DESIGN assumption):
 * the subset is scalars, one-level nested maps, lists of scalars and of
 * maps, `panelOrder` (map of lists), and `{ text, state, src }` claims.
 */

import {
  CLAIM_STATES,
  DATASET_NAMES,
  PANEL_GROUPS,
  type ContentReader,
  type GuideRouteRef,
  type ItemDatasetName,
} from "./types.ts";

// ─── Frontmatter subset ─────────────────────────────────────────────────────

/** A scalar the subset parses: string, number, boolean, or null. */
export type FmScalar = string | number | boolean | null;
/** Any value expressible in the frontmatter subset (lists are heterogeneous). */
export type FmValue = FmScalar | readonly FmValue[] | FmMap;
/** A frontmatter map; keys are top-level or (for claims) one level nested. */
export interface FmMap {
  readonly [key: string]: FmValue;
}

/** Thrown by `parseFrontmatter` on syntax the subset cannot express. */
export class FrontmatterError extends Error {
  readonly line: number;
  constructor(
    message: string,
    line: number,
  ) {
    super(message);
    this.name = "FrontmatterError";
    this.line = line;
  }
}

interface FmLine {
  readonly indent: number;
  readonly text: string;
  readonly num: number;
}

/** Splits a frontmatter block into non-blank, non-comment logical lines. */
function toFmLines(block: string): FmLine[] {
  const out: FmLine[] = [];
  block.split(/\r?\n/).forEach((raw, i) => {
    const text = raw.trim();
    if (text === "" || text.startsWith("#")) return;
    out.push({ indent: raw.length - raw.trimStart().length, text, num: i + 1 });
  });
  return out;
}

/** Splits a string on a top-level separator, ignoring quotes and nested braces/brackets. */
function splitTopLevel(src: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote: "'" | '"' | null = null;
  let cur = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quote !== null) {
      cur += c;
      if (c === "\\" && quote === '"' && i + 1 < src.length) {
        cur += src[++i];
      } else if (c === quote) {
        quote = null;
      }
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      cur += c;
      continue;
    }
    if (c === "{" || c === "[") {
      depth++;
      cur += c;
      continue;
    }
    if (c === "}" || c === "]") {
      depth--;
      cur += c;
      continue;
    }
    if (c === sep && depth === 0) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

/** Index of the first top-level `target` character, or -1. */
function indexOfTopLevel(src: string, target: string): number {
  let depth = 0;
  let quote: "'" | '"' | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quote !== null) {
      if (c === "\\" && quote === '"' && i + 1 < src.length) i++;
      if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      continue;
    }
    if (c === "{" || c === "[") {
      depth++;
      continue;
    }
    if (c === "}" || c === "]") {
      depth--;
      continue;
    }
    if (c === target && depth === 0) return i;
  }
  return -1;
}

/** Strips one level of quotes; double quotes honour `\x` escapes. */
function unquote(s: string): string {
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1).replace(/\\(.)/g, "$1");
  }
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
  return s;
}

function parseScalar(raw: string): FmScalar {
  const s = raw.trim();
  if (s === "" || s === "null" || s === "~") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return unquote(s);
}

/** A flow value is a `{}` map, a `[]` list, or a scalar (on one line). */
function parseFlowValue(src: string, line: FmLine): FmValue {
  if (src.startsWith("{")) return parseFlowMap(src, line);
  if (src.startsWith("[")) return parseFlowList(src, line);
  return parseScalar(src);
}

function parseFlowMap(src: string, line: FmLine): FmMap {
  if (!src.endsWith("}")) throw new FrontmatterError(`flow map must end with '}': ${src}`, line.num);
  const map: Record<string, FmValue> = {};
  for (const part of splitTopLevel(src.slice(1, -1), ",")) {
    if (part.trim() === "") continue;
    const col = indexOfTopLevel(part, ":");
    if (col === -1) throw new FrontmatterError(`flow map entry must be 'key: value': ${part.trim()}`, line.num);
    const key = unquote(part.slice(0, col).trim());
    const rest = part.slice(col + 1).trim();
    map[key] = rest === "" ? null : parseFlowValue(rest, line);
  }
  return map;
}

function parseFlowList(src: string, line: FmLine): FmValue {
  if (!src.endsWith("]")) throw new FrontmatterError(`flow list must end with ']': ${src}`, line.num);
  const items: FmValue[] = [];
  for (const part of splitTopLevel(src.slice(1, -1), ",")) {
    const t = part.trim();
    if (t !== "") items.push(parseFlowValue(t, line));
  }
  return items;
}

interface Parse<T> {
  readonly value: T;
  readonly next: number;
}

/** Parses a block map: lines `key: value` / `key:` + indented block, at exactly `indent`. */
function parseMap(lines: FmLine[], start: number, indent: number): Parse<FmMap> {
  const map: Record<string, FmValue> = {};
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (line.indent < indent || line.text.startsWith("-")) break;
    if (line.indent > indent) throw new FrontmatterError("unexpected indentation", line.num);
    const col = indexOfTopLevel(line.text, ":");
    if (col === -1) throw new FrontmatterError(`expected 'key: value', got '${line.text}'`, line.num);
    const key = unquote(line.text.slice(0, col).trim());
    if (key === "") throw new FrontmatterError("empty key", line.num);
    const rest = line.text.slice(col + 1).trim();
    if (rest === "") {
      const blockLine = i + 1 < lines.length ? lines[i + 1] : null;
      if (blockLine !== null && blockLine.indent > indent) {
        const sub = parseMapOrList(lines, i + 1, indent);
        map[key] = sub.value;
        i = sub.next;
      } else {
        map[key] = null;
        i++;
      }
    } else {
      map[key] = parseFlowValue(rest, line);
      i++;
    }
  }
  return { value: map, next: i };
}

/** Parses the block reached by a `key:` line: either a deeper map or a `- ` list. */
function parseMapOrList(lines: FmLine[], start: number, parentIndent: number): Parse<FmValue> {
  const line = lines[start];
  if (line.text.startsWith("- ")) return parseList(lines, start, parentIndent);
  return parseMap(lines, start, line.indent) as Parse<FmValue>;
}

/** Parses a `- ` list whose items are scalars or `key: value` maps (not mixed). */
function parseList(lines: FmLine[], start: number, parentIndent: number): Parse<FmValue> {
  const items: FmValue[] = [];
  let i = start;
  let mapMode: boolean | null = null;
  while (i < lines.length) {
    const line = lines[i];
    if (line.indent < parentIndent) break;
    const m = /^-\s*(.*)$/.exec(line.text);
    if (m === null) break;
    const rest = m[1].trim();
    const isMapItem =
      rest !== "" &&
      !rest.startsWith("{") &&
      !rest.startsWith("[") &&
      indexOfTopLevel(rest, ":") !== -1;
    if (isMapItem) {
      if (mapMode === false) throw new FrontmatterError("mixed scalar and map list items", line.num);
      mapMode = true;
      const col = indexOfTopLevel(rest, ":");
      const obj: Record<string, FmValue> = {};
      const r2 = rest.slice(col + 1).trim();
      if (r2 === "") {
        const blockLine = i + 1 < lines.length ? lines[i + 1] : null;
        if (blockLine !== null && blockLine.indent > line.indent) {
          const sub = parseMapOrList(lines, i + 1, line.indent);
          obj[unquote(rest.slice(0, col).trim())] = sub.value;
          i = sub.next;
        } else {
          obj[unquote(rest.slice(0, col).trim())] = null;
          i++;
        }
      } else {
        obj[unquote(rest.slice(0, col).trim())] = parseFlowValue(r2, line);
        i++;
      }
      items.push(obj);
    } else {
      if (mapMode === true) throw new FrontmatterError("mixed map and scalar list items", line.num);
      mapMode = false;
      items.push(rest === "" ? null : parseFlowValue(rest, line));
      i++;
    }
  }
  return { value: items, next: i };
}

/**
 * Parses a frontmatter block (the text between the leading and closing `---`
 * lines) into a generic map. Throws `FrontmatterError` on syntax the subset
 * cannot express.
 */
export function parseFrontmatter(block: string): FmMap {
  const lines = toFmLines(block);
  const parsed = parseMap(lines, 0, 0);
  return parsed.value;
}

// ─── Markdown structure scanners ───────────────────────────────────────────

/** Splits a Markdown file into frontmatter block and body. */
export interface SplitDocument {
  /** Raw frontmatter text between `---` lines, or null when absent. */
  readonly frontmatter: string | null;
  /** Markdown body after the closing `---`. */
  readonly body: string;
  /** Set when the file starts with `---` but never closes it. */
  readonly headError: string | null;
}

export function splitFrontmatter(text: string): SplitDocument {
  const lines = text.split(/\r?\n/);
  if (lines.length > 0 && lines[0].trim() === "---") {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === "---") {
        return { frontmatter: lines.slice(1, i).join("\n"), body: lines.slice(i + 1).join("\n"), headError: null };
      }
    }
    return { frontmatter: null, body: text, headError: "unterminated frontmatter (missing closing ---)" };
  }
  return { frontmatter: null, body: text, headError: null };
}

/** True when a line starts a ```/~~~ fenced code block (≤3-space indent). */
function isFenceMarker(line: string): boolean {
  return /^ {0,3}(```|~~~)/.test(line);
}

/** One registry H2 section found in a route body. */
export interface RawSection {
  /** Heading text after `## `. */
  readonly title: string;
  /** Number of leading `#` characters. */
  readonly level: number;
  /** 1-based line number of the heading line. */
  readonly headingLine: number;
  /** Inner Markdown (lines after the heading, before the next heading). */
  readonly body: string;
}

/** The section structure of a route body. */
export interface SectionScan {
  readonly sections: readonly RawSection[];
  /** Body text before the first heading (empty when the body starts with a section). */
  readonly before: string;
}

/** Scans a route body for ATX headings, ignoring fenced code blocks. */
export function extractSections(body: string): SectionScan {
  const lines = body.split(/\r?\n/);
  const sections: RawSection[] = [];
  let cur: RawSection | null = null;
  let firstHeading = -1;
  let inFence = false;
  const push = (): void => {
    if (cur !== null) sections.push(cur);
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isFenceMarker(raw)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^ {0,3}(#{1,6})\s+(.+?)\s*$/.exec(raw);
    if (m !== null) {
      push();
      if (firstHeading === -1) firstHeading = i;
      cur = { title: m[2], level: m[1].length, headingLine: i + 1, body: "" };
      continue;
    }
    if (cur !== null) {
      cur = {
        title: cur.title,
        level: cur.level,
        headingLine: cur.headingLine,
        body: cur.body === "" ? raw : `${cur.body}\n${raw}`,
      };
    }
  }
  push();
  const before =
    firstHeading === -1 ? lines.join("\n") : lines.slice(0, firstHeading).join("\n");
  return { sections, before };
}

/** A `::claim <state> [src=…] … ::` block callout parsed from route body lines. */
export interface ClaimMarker {
  readonly state: string;
  readonly src: readonly string[];
  /** 1-based line of the opening marker. */
  readonly line: number;
  /** Inner Markdown text ("" for an empty callout). */
  readonly text: string;
  /** False when the body ends before a closing `::` line. */
  readonly terminated: boolean;
}

/** Parses one `::claim ...` opening line; null when the line is not a callout opener. */
export function parseClaimLine(text: string): { state: string; src: string[] } | null {
  const m = /^::claim[ \t]+([A-Za-z][A-Za-z0-9-]*)(?:[ \t]+src=([A-Za-z0-9_,-]+))?[ \t]*$/.exec(text);
  if (m === null) return null;
  return { state: m[1] as string, src: m[2] === undefined ? [] : m[2].split(",") };
}

/** Scans a route body for claim callouts, ignoring fenced code blocks. */
export function extractClaimMarkers(body: string): ClaimMarker[] {
  const lines = body.split(/\r?\n/);
  const out: ClaimMarker[] = [];
  let open: Omit<ClaimMarker, "terminated"> | null = null;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isFenceMarker(raw)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (open !== null) {
      if (raw.trim() === "::") {
        out.push({ ...open, terminated: true });
        open = null;
      } else {
        open = {
          state: open.state,
          src: open.src,
          line: open.line,
          text: open.text === "" ? raw : `${open.text}\n${raw}`,
        };
      }
      continue;
    }
    const parsed = parseClaimLine(raw.trim());
    if (parsed !== null) open = { ...parsed, line: i + 1, text: "" };
  }
  if (open !== null) out.push({ ...open, terminated: false });
  return out;
}

// ─── The rule set (DESIGN §4, one-for-one) ─────────────────────────────────

/** One lint finding; `file` is content-root-relative, `field` the manifest/schema location. */
export interface ContentViolation {
  readonly file: string;
  readonly field: string;
  readonly message: string;
}

const STATE_SET: ReadonlySet<string> = new Set<string>(CLAIM_STATES);
/** The registry order views import to render sections (exported for Commit 6). */
export const REQUIRED_SECTIONS: readonly string[] = ["Opening", "Early → Mid", "Mid → Late", "Victory push"];
export const OPTIONAL_SECTIONS: readonly string[] = ["Territory policy", "Diplomacy"];
const ALLOWED_DATASETS: ReadonlySet<string> = new Set(["sources", ...DATASET_NAMES]);
const PANEL_GROUP_SET: ReadonlySet<string> = new Set<string>(PANEL_GROUPS);
const TRANSITION_PREFIX = "Transition → ";

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v !== "";
}

function isRouteNumber(v: unknown): v is "I" | "II" | "III" {
  return v === "I" || v === "II" || v === "III";
}

/** A manifest path that could escape the content root. */
function isUnsafePath(p: string): boolean {
  return p.startsWith("/") || p.includes("\\") || /(^|\/)[.][.](\/|$)/.test(p);
}

function transitionSuffix(title: string): string | null {
  return title.startsWith(TRANSITION_PREFIX) ? title.slice(TRANSITION_PREFIX.length) : null;
}

/** Whether a section title belongs to the registry or names another route. */
function isKnownSectionTitle(title: string, otherRoutes: readonly { id: string; name: string }[]): boolean {
  if (REQUIRED_SECTIONS.includes(title) || OPTIONAL_SECTIONS.includes(title)) return true;
  const target = transitionSuffix(title);
  return target !== null && otherRoutes.some((r) => r.id === target || r.name === target);
}

/** Reads one manifest-named file; on failure records a violation and returns null. */
async function readNamed(
  root: ContentReader,
  out: ContentViolation[],
  path: string,
  field: string,
): Promise<string | null> {
  try {
    return await root.readFile(path);
  } catch {
    out.push({ file: path, field, message: `named in a manifest but missing` });
    return null;
  }
}

/**
 * Runs the full DESIGN §4 rule set over the content root. Orphan detection
 * uses `root.listFiles()` when the reader can enumerate files (filesystem
 * readers); a browser reader returns null and only the manifest-named set is
 * validated.
 */
export async function lintContent(root: ContentReader): Promise<ContentViolation[]> {
  const out: ContentViolation[] = [];
  const named: Set<string> = new Set(["index.json"]);

  let indexRaw: string | null = null;
  try {
    indexRaw = await root.readFile("index.json");
  } catch {
    indexRaw = null;
  }
  if (indexRaw === null) {
    // DESIGN §5: a fresh checkout with no files is a valid empty state.
    const files = await root.listFiles();
    if (files !== null && files.length > 0) {
      out.push({ file: "index.json", field: "lords", message: "content/index.json is missing but content files exist" });
    }
    return out;
  }
  let index: unknown;
  try {
    index = JSON.parse(indexRaw);
  } catch {
    out.push({ file: "index.json", field: "lords", message: "unparseable JSON in content/index.json" });
    return out;
  }
  const idx = index as Record<string, unknown>;
  const lords = idx.lords;
  if (!Array.isArray(lords) || !lords.every((s): s is string => typeof s === "string")) {
    out.push({ file: "index.json", field: "lords", message: 'index.json must be { "lords": ["<lord-slug>", …] }' });
    return out;
  }
  const seenLords: Set<string> = new Set();
  for (const slug of lords) {
    if (seenLords.has(slug)) {
      out.push({ file: "index.json", field: "lords", message: `duplicate lord slug "${slug}"` });
      continue;
    }
    seenLords.add(slug);
    await lintLord(root, out, named, slug);
  }

  const files = await root.listFiles();
  if (files !== null) {
    for (const f of files) {
      if (!named.has(f)) {
        out.push({ file: f, field: "orphan", message: "file not named by index.json or any guide.json manifest" });
      }
    }
  }
  return out;
}

/** Lints one lord directory: guide.json manifest, shared file, datasets, and routes. */
async function lintLord(
  root: ContentReader,
  out: ContentViolation[],
  named: Set<string>,
  slug: string,
): Promise<void> {
  if (slug === "" || slug === "." || slug === ".." || slug.includes("/") || slug.includes("\\")) {
    out.push({ file: "index.json", field: "lords", message: `unsafe lord slug "${slug}"` });
    return;
  }
  const guidePath = `${slug}/guide.json`;
  named.add(guidePath);
  let raw: string;
  try {
    raw = await root.readFile(guidePath);
  } catch {
    out.push({ file: guidePath, field: "lords", message: `index names lord "${slug}" but ${guidePath} is missing` });
    return;
  }
  let guide: unknown;
  try {
    guide = JSON.parse(raw);
  } catch {
    out.push({ file: guidePath, field: "manifest", message: "unparseable JSON in guide.json" });
    return;
  }
  const g = (typeof guide === "object" && guide !== null ? guide : {}) as Record<string, unknown>;
  const v = (typeof g.version === "object" && g.version !== null ? g.version : {}) as Record<string, unknown>;

  for (const field of ["id", "lord", "faction"]) {
    if (!isNonEmptyString(g[field])) out.push({ file: guidePath, field, message: `guide.json requires ${field} (string)` });
  }
  for (const field of ["patch", "vco", "checked"]) {
    if (typeof v[field] !== "string") {
      out.push({ file: guidePath, field: `version.${field}`, message: `guide.json requires version.${field} (string)` });
    }
  }
  if (typeof g.shared !== "string" || g.shared === "") {
    out.push({ file: guidePath, field: "shared", message: "guide.json requires shared (file name)" });
  }

  // routes[] manifest lines
  const refs: GuideRouteRef[] = [];
  if (!Array.isArray(g.routes)) {
    out.push({ file: guidePath, field: "routes", message: "guide.json requires routes[]" });
  } else {
    for (const r of g.routes) {
      const rr = (typeof r === "object" && r !== null ? r : {}) as Record<string, unknown>;
      if (!isNonEmptyString(rr.id) || !isNonEmptyString(rr.file) || !isRouteNumber(rr.number)) {
        out.push({ file: guidePath, field: "routes", message: 'routes[] entries require { id, file, number } with number one of I/II/III' });
        continue;
      }
      if (isUnsafePath(rr.file)) {
        out.push({ file: guidePath, field: "routes", message: `unsafe route file path "${rr.file}"` });
        continue;
      }
      refs.push({ id: rr.id, file: rr.file, number: rr.number });
    }
  }

  // datasets[]
  const datasetNames: string[] = [];
  if (!Array.isArray(g.datasets)) {
    out.push({ file: guidePath, field: "datasets", message: "guide.json requires datasets[]" });
  } else {
    for (const d of g.datasets) {
      if (typeof d !== "string" || !ALLOWED_DATASETS.has(d)) {
        out.push({
          file: guidePath,
          field: "datasets",
          message: `unknown dataset "${String(d)}" (expected sources, armies, skills, research, buildings, mechanics, vco)`,
        });
        continue;
      }
      datasetNames.push(d);
    }
  }

  const srcRefs: Array<{ file: string; id: string }> = [];
  let sourceIds: Set<string> | null = null; // null = sources dataset broken/missing
  const panelDatasets: PanelDatasets = {};

  // shared fundamentals file
  if (typeof g.shared === "string" && g.shared !== "") {
    const path = `${slug}/${g.shared}`;
    named.add(path);
    if (isUnsafePath(g.shared)) {
      out.push({ file: guidePath, field: "shared", message: `unsafe shared file path "${g.shared}"` });
    } else {
      await readNamed(root, out, path, "shared");
    }
  }

  // datasets (one of them is sources; its ids resolve every src reference)
  for (const name of datasetNames) {
    const path = `${slug}/data/${name}.json`;
    named.add(path);
    const text = await readNamed(root, out, path, "datasets");
    if (text === null) continue;
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      out.push({ file: path, field: "datasets", message: "unparseable JSON" });
      continue;
    }
    if (name === "sources") {
      sourceIds = lintSources(out, path, value);
    } else {
      // The generic state/src vocabulary rule covers every dataset (DESIGN §4);
      // the per-schema rule proves the DESIGN §4 shape of the named dataset.
      lintDataItems(out, path, name, value, srcRefs);
      lintDatasetShape(out, path, name, value, panelDatasets);
    }
  }

  // routes: read every route document first (pass A) so section checks can see
  // the whole lord's route ids/names for `Transition → <other route>`.
  interface RouteDoc {
    readonly path: string;
    readonly ref: GuideRouteRef;
    readonly scan: SplitDocument;
    readonly meta: FmMap;
    readonly metaError: string | null;
    readonly sections: SectionScan;
    readonly markers: ClaimMarker[];
  }
  const docs: RouteDoc[] = [];
  const identities: Array<{ id: string; name: string }> = [];
  for (const ref of refs) {
    const path = `${slug}/${ref.file}`;
    named.add(path);
    const text = await readNamed(root, out, path, "routes");
    if (text === null) continue;
    const scan = splitFrontmatter(text);
    let meta: FmMap = {};
    let metaError: string | null = scan.headError;
    if (metaError === null && scan.frontmatter !== null) {
      try {
        meta = parseFrontmatter(scan.frontmatter);
      } catch (e) {
        metaError = e instanceof Error ? e.message : String(e);
      }
    }
    const sections = extractSections(scan.body);
    const markers = extractClaimMarkers(scan.body);
    if (isNonEmptyString(meta.id) && isNonEmptyString(meta.name)) {
      identities.push({ id: meta.id, name: meta.name });
    }
    docs.push({ path, ref, scan, meta, metaError, sections, markers });
  }

  for (const doc of docs) {
    const other = identities.filter((i) => i.id !== doc.ref.id);
    assertRouteDocument(out, doc, other, srcRefs, panelDatasets);
  }

  // resolve every collected src id against this lord's sources
  if (sourceIds !== null) {
    for (const { file, id } of srcRefs) {
      if (!sourceIds.has(id)) {
        out.push({ file, field: "src", message: `dangling src id "${id}" (not in this lord's data/sources.json)` });
      }
    }
  }
}

/** Validates `data/sources.json`; returns the id set, or null when invalid. */
function lintSources(out: ContentViolation[], path: string, value: unknown): Set<string> | null {
  if (!Array.isArray(value)) {
    out.push({ file: path, field: "sources", message: "data/sources.json must be an array of { id, title, url, note }" });
    return null;
  }
  const ids = new Set<string>();
  value.forEach((s, i) => {
    if (typeof s !== "object" || s === null || Array.isArray(s)) {
      out.push({ file: path, field: "sources", message: `sources[${i}] must be an object` });
      return;
    }
    const e = s as Record<string, unknown>;
    if (!isNonEmptyString(e.id)) {
      out.push({ file: path, field: "sources", message: `sources[${i}].id must be a non-empty string` });
      return;
    }
    ids.add(e.id);
    for (const k of ["title", "url", "note"]) {
      if (typeof e[k] !== "string") {
        out.push({ file: path, field: "sources", message: `sources[${i}].${k} must be a string` });
      }
    }
  });
  return ids;
}

/** Validates optional `state`/`src` fields on dataset items (any nesting). */
function lintDataItems(
  out: ContentViolation[],
  path: string,
  name: string,
  value: unknown,
  srcRefs: Array<{ file: string; id: string }>,
): void {
  const visit = (v: unknown, where: string): void => {
    if (Array.isArray(v)) {
      v.forEach((x, i) => visit(x, `${where}[${i}]`));
      return;
    }
    if (typeof v !== "object" || v === null) return;
    const o = v as Record<string, unknown>;
    if ("state" in o && (typeof o.state !== "string" || !STATE_SET.has(o.state))) {
      out.push({ file: path, field: "datasets", message: `invalid state "${String(o.state)}" (${where})` });
    }
    if ("src" in o) {
      if (!Array.isArray(o.src) || o.src.length === 0 || !o.src.every((x) => typeof x === "string")) {
        out.push({ file: path, field: "datasets", message: `src at ${where} must be a non-empty list of source ids` });
      } else {
        for (const id of o.src as string[]) srcRefs.push({ file: path, id });
      }
    }
    for (const [k, x] of Object.entries(o)) visit(x, `${where}.${k}`);
  };
  visit(value, name);
}

// ─── Dataset schema rules (DESIGN §4, one-for-one) ─────────────────────────

/**
 * The shape-validated panel datasets of one lord, so `panelOrder` ids can
 * resolve against them (DESIGN §4 "Panel selection and order"): armies ids
 * resolve in the route's own armies map; flat item ids in the lord-wide map.
 * `vco` is not a panel group and is validated, not collected.
 */
interface PanelDatasets {
  armies?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  skills?: Readonly<Record<string, unknown>>;
  research?: Readonly<Record<string, unknown>>;
  buildings?: Readonly<Record<string, unknown>>;
  mechanics?: Readonly<Record<string, unknown>>;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStringList(v: unknown): v is readonly string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

/** Validates a `units`/`legendary`/`generic` column: rows of `{ n, name, role, kind }`. */
function lintUnitRows(out: ContentViolation[], path: string, where: string, rows: unknown): void {
  if (!Array.isArray(rows)) {
    out.push({ file: path, field: "datasets", message: `${where} must be a list of unit rows { n, name, role, kind }` });
    return;
  }
  rows.forEach((row, i) => {
    if (!isRecord(row)) {
      out.push({ file: path, field: "datasets", message: `${where}[${i}] must be a unit row { n, name, role, kind }` });
      return;
    }
    if (typeof row.n !== "number") {
      out.push({ file: path, field: "datasets", message: `${where}[${i}].n must be a number` });
    }
    for (const key of ["name", "role", "kind"] as const) {
      if (!isNonEmptyString(row[key])) {
        out.push({ file: path, field: "datasets", message: `${where}[${i}].${key} must be a non-empty string` });
      }
    }
  });
}

/** Validates a list of `[title, body]` string pairs (`notes`/`plan`/`details`). */
function lintTitleBodyList(out: ContentViolation[], path: string, where: string, value: unknown): void {
  if (!Array.isArray(value)) {
    out.push({ file: path, field: "datasets", message: `${where} must be a list of [title, body] pairs` });
    return;
  }
  value.forEach((entry, i) => {
    if (!Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== "string" || typeof entry[1] !== "string") {
      out.push({ file: path, field: "datasets", message: `${where}[${i}] must be a [title, body] string pair` });
    }
  });
}

/** Validates `data/armies.json`: route id → entry id → army (DESIGN §4). */
function lintArmiesDataset(
  out: ContentViolation[],
  path: string,
  value: unknown,
  panels: PanelDatasets,
): void {
  if (!isRecord(value)) {
    out.push({ file: path, field: "datasets", message: "data/armies.json must be a map of route id → army entry map" });
    return;
  }
  const routeMaps: Record<string, Record<string, unknown>> = {};
  for (const routeId of Object.keys(value)) {
    const map = value[routeId];
    if (!isRecord(map)) {
      out.push({ file: path, field: "datasets", message: `armies.${routeId} must be a map of entry id → army` });
      continue;
    }
    const entries: Record<string, unknown> = {};
    for (const entryId of Object.keys(map)) {
      const army = map[entryId];
      if (!isRecord(army)) {
        out.push({ file: path, field: "datasets", message: `armies.${routeId}.${entryId} must be an army object` });
        continue;
      }
      entries[entryId] = army;
      const where = `armies.${routeId}.${entryId}`;
      for (const key of ["label", "name"] as const) {
        if (!isNonEmptyString(army[key])) {
          out.push({ file: path, field: "datasets", message: `${where}.${key} must be a non-empty string` });
        }
      }
      if ("supportName" in army && !isNonEmptyString(army.supportName)) {
        out.push({ file: path, field: "datasets", message: `${where}.supportName must be a non-empty string when present` });
      }
      lintUnitRows(out, path, `${where}.units`, army.units);
      lintUnitRows(out, path, `${where}.legendary`, army.legendary);
      lintUnitRows(out, path, `${where}.generic`, army.generic);
      if ("context" in army && !isNonEmptyString(army.context)) {
        out.push({ file: path, field: "datasets", message: `${where}.context must be a non-empty string when present` });
      }
      lintTitleBodyList(out, path, `${where}.notes`, army.notes);
      lintTitleBodyList(out, path, `${where}.plan`, army.plan);
      if (typeof army.size !== "number") {
        out.push({ file: path, field: "datasets", message: `${where}.size must be a number` });
      }
      if (!isStringList(army.sources) || army.sources.some((s) => s === "")) {
        out.push({ file: path, field: "datasets", message: `${where}.sources must be a list of source ids` });
      }
    }
    routeMaps[routeId] = entries;
  }
  panels.armies = routeMaps;
}

/** Validates one flat item dataset: entry id → item (DESIGN §4). */
function lintItemDataset(
  out: ContentViolation[],
  path: string,
  name: ItemDatasetName,
  value: unknown,
  panels: PanelDatasets,
): void {
  if (!isRecord(value)) {
    out.push({ file: path, field: "datasets", message: `data/${name}.json must be a map of entry id → item` });
    return;
  }
  const entries: Record<string, unknown> = {};
  for (const entryId of Object.keys(value)) {
    const item = value[entryId];
    if (!isRecord(item)) {
      out.push({ file: path, field: "datasets", message: `${name}.${entryId} must be an item object` });
      continue;
    }
    entries[entryId] = item;
    const where = `${name}.${entryId}`;
    for (const key of ["label", "title", "intro"] as const) {
      if (!isNonEmptyString(item[key])) {
        out.push({ file: path, field: "datasets", message: `${where}.${key} must be a non-empty string` });
      }
    }
    if (!Array.isArray(item.steps)) {
      out.push({ file: path, field: "datasets", message: `${where}.steps must be a list of steps { title, note, gate?, short? }` });
    } else {
      item.steps.forEach((step, i) => {
        const stepWhere = `${where}.steps[${i}]`;
        if (!isRecord(step)) {
          out.push({ file: path, field: "datasets", message: `${stepWhere} must be a step { title, note, gate?, short? }` });
          return;
        }
        for (const key of ["title", "note"] as const) {
          if (!isNonEmptyString(step[key])) {
            out.push({ file: path, field: "datasets", message: `${stepWhere}.${key} must be a non-empty string` });
          }
        }
        for (const key of ["gate", "short"] as const) {
          if (key in step && !isNonEmptyString(step[key])) {
            out.push({ file: path, field: "datasets", message: `${stepWhere}.${key} must be a non-empty string when present` });
          }
        }
      });
    }
    if ("details" in item) lintTitleBodyList(out, path, `${where}.details`, item.details);
    if (!isStringList(item.sources) || item.sources.some((s) => s === "")) {
      out.push({ file: path, field: "datasets", message: `${where}.sources must be a list of source ids` });
    }
  }
  panels[name] = entries;
}

/** Validates `data/vco.json`: route id → ordered objective items (DESIGN §4). */
function lintVcoDataset(out: ContentViolation[], path: string, value: unknown): void {
  if (!isRecord(value)) {
    out.push({ file: path, field: "datasets", message: "data/vco.json must be a map of route id → objective item list" });
    return;
  }
  for (const routeId of Object.keys(value)) {
    const items = value[routeId];
    if (!Array.isArray(items)) {
      out.push({ file: path, field: "datasets", message: `vco.${routeId} must be an ordered list of { id, text, state, src? }` });
      continue;
    }
    items.forEach((item, i) => {
      const where = `vco.${routeId}[${i}]`;
      if (!isRecord(item)) {
        out.push({ file: path, field: "datasets", message: `${where} must be an objective item { id, text, state, src? }` });
        return;
      }
      if (!isNonEmptyString(item.id)) {
        out.push({ file: path, field: "datasets", message: `${where}.id must be a non-empty string` });
      }
      if (!isNonEmptyString(item.text)) {
        out.push({ file: path, field: "datasets", message: `${where}.text must be a non-empty string` });
      }
      if (typeof item.state !== "string" || !STATE_SET.has(item.state)) {
        out.push({
          file: path,
          field: "datasets",
          message: `${where}.state is required and must be one of confirmed, historical, inferred, verify-in-campaign`,
        });
      }
    });
  }
}

/**
 * Dispatches one named non-source dataset to its DESIGN §4 schema validator.
 * `sources` is linted by `lintSources`; the manifest vocabulary check already
 * ran on every name, so an unknown name never reaches this dispatch.
 */
function lintDatasetShape(
  out: ContentViolation[],
  path: string,
  name: string,
  value: unknown,
  panels: PanelDatasets,
): void {
  if (name === "armies") {
    lintArmiesDataset(out, path, value, panels);
  } else if (name === "vco") {
    lintVcoDataset(out, path, value);
  } else if (name === "skills" || name === "research" || name === "buildings" || name === "mechanics") {
    lintItemDataset(out, path, name, value, panels);
  }
}

/**
 * Validates one route's `panelOrder` block (DESIGN §4 "Panel selection and
 * order"): group keys are exactly the five canonical panel dataset names,
 * every listed id resolves into the parsed entries (armies ids in the route's
 * own armies map, flat-dataset ids in the lord-wide map), and groups whose
 * dataset is absent or whose list is empty/absent are valid empty states.
 * `vco` is not a panel group and never appears here.
 */
function lintPanelOrder(
  out: ContentViolation[],
  path: string,
  routeId: string,
  po: unknown,
  panels: PanelDatasets,
): void {
  if (!isRecord(po)) {
    out.push({ file: path, field: "panelOrder", message: "panelOrder must be a map of panel group keys to id lists" });
    return;
  }
  for (const group of Object.keys(po)) {
    if (!PANEL_GROUP_SET.has(group)) {
      out.push({
        file: path,
        field: "panelOrder",
        message: `unknown panel-order group "${group}" (expected one of armies, skills, research, buildings, mechanics)`,
      });
      continue;
    }
    const list = po[group];
    if (!Array.isArray(list) || !list.every((x) => typeof x === "string")) {
      out.push({ file: path, field: "panelOrder", message: `panelOrder group "${group}" must be a list of entry ids` });
      continue;
    }
    // SAFETY: every element was checked to be a string above; the cast is that check's contract.
    const ids = list as readonly string[];
    if (group === "armies") {
      // Armies ids resolve in the route's own armies map.
      const routeMap = panels.armies?.[routeId];
      for (const id of ids) {
        if (routeMap === undefined || !(id in routeMap)) {
          out.push({
            file: path,
            field: "panelOrder",
            message: `panelOrder id "${id}" (group "armies") does not resolve to an army entry for route "${routeId}"`,
          });
        }
      }
    } else {
      // Flat item ids resolve in the lord-wide map for that dataset.
      // SAFETY: the vocabulary check constrained `group` to the four flat item
      // datasets (this is the non-armies branch), all of which are keys of `panels`.
      const map = panels[group as ItemDatasetName];
      for (const id of ids) {
        if (map === undefined || !(id in map)) {
          out.push({
            file: path,
            field: "panelOrder",
            message: `panelOrder id "${id}" (group "${group}") does not resolve to an entry in the lord's "${group}" dataset`,
          });
        }
      }
    }
  }
}

/** Validates one route document against the DESIGN §4 route/section/claim rules. */
function assertRouteDocument(
  out: ContentViolation[],
  doc: { path: string; ref: GuideRouteRef; meta: FmMap; metaError: string | null; sections: SectionScan; markers: ClaimMarker[] },
  otherRoutes: readonly { id: string; name: string }[],
  srcRefs: Array<{ file: string; id: string }>,
  panels: PanelDatasets,
): void {
  const { path, ref, meta } = doc;
  const push = (field: string, message: string): void => {
    out.push({ file: path, field, message });
  };

  if (doc.metaError !== null) {
    push("frontmatter", `invalid frontmatter: ${doc.metaError}`);
    return;
  }

  // required frontmatter
  if (!isNonEmptyString(meta.id)) push("id", "route frontmatter requires id (string)");
  else if (meta.id !== ref.id) push("id", `route id "${meta.id}" does not match guide.json routes[] id "${ref.id}"`);
  if (!isRouteNumber(meta.number)) push("number", 'route frontmatter requires number, one of "I"/"II"/"III"');
  else if (meta.number !== ref.number) push("number", `route number "${meta.number}" does not match guide.json routes[] number "${ref.number}"`);
  if (!isNonEmptyString(meta.name)) push("name", "route frontmatter requires name (string)");
  if (typeof meta.vcoTitle !== "string" && meta.vcoTitle !== null) {
    push("vcoTitle", "route frontmatter requires vcoTitle (string or null)");
  }

  // typed claims: objective and reward always carry a confidence state
  const claimFields = ["objective", "reward"] as const;
  for (const field of claimFields) {
    const value = meta[field];
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      push(field, `route frontmatter requires ${field} as a claim { text, state, src }`);
      continue;
    }
    const c = value as FmMap;
    if (typeof c.text !== "string") push(`${field}.text`, `${field}.text must be a string`);
    if (typeof c.state !== "string" || !STATE_SET.has(c.state)) {
      push(`${field}.state`, `invalid claim state "${String(c.state)}" (expected one of confirmed, historical, inferred, verify-in-campaign)`);
    }
    if (!Array.isArray(c.src) || !c.src.every((s) => typeof s === "string" && s !== "")) {
      push(`${field}.src`, `${field}.src must be a list of source ids`);
    } else {
      for (const id of c.src as readonly string[]) srcRefs.push({ file: path, id });
    }
  }

  // optional frontmatter fields, typed when present
  for (const field of ["interpretation", "bottleneck", "motto", "transitions"]) {
    if (field in meta && typeof meta[field] !== "string") {
      push(field, `route frontmatter ${field} must be a string when present`);
    }
  }
  if ("panelOrder" in meta) {
    lintPanelOrder(out, path, ref.id, meta.panelOrder, panels);
  }

  // gaps: declared missing sections, each a registry section title
  const declaredGaps = new Set<string>();
  if ("gaps" in meta) {
    const gaps = meta.gaps;
    if (!Array.isArray(gaps) || !gaps.every((x) => typeof x === "string" && x !== "")) {
      push("gaps", "gaps must be a list of section names");
    } else {
      for (const t of gaps as readonly string[]) {
        if (!REQUIRED_SECTIONS.includes(t) && !OPTIONAL_SECTIONS.includes(t) && transitionSuffix(t) === null) {
          push("gaps", `gaps entry "${t}" is not a registry section heading`);
        }
        declaredGaps.add(t);
      }
    }
  }

  // body structure: registry headings in order, declared gaps allowed
  const { sections } = doc.sections;
  let expect = 0;
  const seen = new Set<string>();
  for (const s of sections) {
    if (s.level !== 2) {
      push("sections", `only H2 section headings are allowed in route bodies (line ${s.headingLine})`);
      continue;
    }
    const requiredIdx = REQUIRED_SECTIONS.indexOf(s.title);
    if (requiredIdx !== -1) {
      if (seen.has(s.title)) {
        push("sections", `duplicate required section "${s.title}" (line ${s.headingLine})`);
      } else if (requiredIdx !== expect) {
        push("sections", `section "${s.title}" out of order; expected "${REQUIRED_SECTIONS[expect] ?? "—"}" first (line ${s.headingLine})`);
      } else {
        expect++;
      }
      seen.add(s.title);
      continue;
    }
    if (!isKnownSectionTitle(s.title, otherRoutes)) {
      push("sections", `unknown section heading "${s.title}" (line ${s.headingLine})`);
    }
  }
  for (let i = expect; i < REQUIRED_SECTIONS.length; i++) {
    const title = REQUIRED_SECTIONS[i];
    if (seen.has(title)) continue; // present but out of order — already reported above
    if (!declaredGaps.has(title)) {
      push("sections", `missing required section "${title}" (declare it in frontmatter gaps to omit)`);
    }
  }
  if (doc.sections.before.trim() !== "") {
    push("sections", "route body content must start with a section heading");
  }

  // claim callouts: state vocabulary, termination, src ids
  for (const m of doc.markers) {
    if (!STATE_SET.has(m.state)) {
      push("claims", `invalid claim state "${m.state}" (marker on line ${m.line})`);
    }
    if (!m.terminated) {
      push("claims", `unterminated claim callout (missing closing "::" after line ${m.line})`);
    }
    for (const id of m.src) srcRefs.push({ file: path, id });
  }
}
