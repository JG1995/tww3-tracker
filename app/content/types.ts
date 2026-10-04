/**
 * The content model contract (ADR-0002, DESIGN §4) — pure types.
 *
 * Every later feature imports from this module: the immutable `ContentTree`,
 * its node types, the four confidence states, the F1 dataset registry, and
 * the typed not-found result shape used by `query.ts`. There is no logic here
 * beyond constant literals; `lint.ts` validates content against these shapes
 * and `load.ts` builds trees that satisfy them.
 *
 * Paths inside the content domain are relative to the content root
 * (`"index.json"`, `"<lord-slug>/guide.json"`, `"<lord-slug>/data/sources.json"`).
 */

/** Confidence states for a claim (ADR-0002). Exactly one applies to every claim. */
export type ClaimState = "confirmed" | "historical" | "inferred" | "verify-in-campaign";

/** The closed confidence-state vocabulary, as emitted by the lint. */
export const CLAIM_STATES: readonly ClaimState[] = [
  "confirmed",
  "historical",
  "inferred",
  "verify-in-campaign",
];

/**
 * F1 structured-dataset registry (DESIGN §4): the six non-source datasets.
 * `sources` is the seventh, separately typed as `Source[]` per the DESIGN.
 * A future corpus-wide dataset kind is added to this registry, never forked.
 */
export const DATASET_NAMES: readonly ["armies", "skills", "research", "buildings", "mechanics", "vco"] = [
  "armies",
  "skills",
  "research",
  "buildings",
  "mechanics",
  "vco",
];

export type DatasetName = (typeof DATASET_NAMES)[number];

/**
 * The five dashboard panel dataset names, in the DESIGN's fixed panel order
 * (DESIGN §4 "Panel selection and order"). `vco` is not a panel group: its
 * per-route objective list renders under the route identity, not in a panel.
 */
export const PANEL_GROUPS: readonly ["armies", "skills", "research", "buildings", "mechanics"] = [
  "armies",
  "skills",
  "research",
  "buildings",
  "mechanics",
];

export type PanelGroup = (typeof PANEL_GROUPS)[number];

/** A claim: prose or structured assertion with an explicit confidence state and evidence. */
export interface Claim {
  readonly text: string;
  readonly state: ClaimState;
  /** Source ids resolving against the lord's `data/sources.json`. */
  readonly src: readonly string[];
}

/** One entry of `data/sources.json`. */
export interface Source {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly note: string;
}

/** One unit row of an army template (DESIGN §4 armies schema). */
export interface UnitRow {
  /** Number of units of this type. */
  readonly n: number;
  readonly name: string;
  readonly role: string;
  readonly kind: string;
}

/**
 * A [title, body] string pair — the atlas's structured note/plan/detail line.
 * Books render the title and the body as separate lines.
 */
export type TitleBody = readonly [title: string, body: string];

/** One army template entry of `data/armies.json` (DESIGN §4 armies schema). */
export interface Army {
  readonly label: string;
  readonly name: string;
  /** The same template expressed as the supporting army. */
  readonly supportName?: string;
  readonly units: readonly UnitRow[];
  /** The legendary-lord column — the same unit-row shape as `units`. */
  readonly legendary: readonly UnitRow[];
  /** The generic-lord column — the same unit-row shape as `units`. */
  readonly generic: readonly UnitRow[];
  readonly context?: string;
  readonly notes: readonly TitleBody[];
  readonly plan: readonly TitleBody[];
  readonly size: number;
  /** Source ids resolving against the lord's `data/sources.json`. */
  readonly sources: readonly string[];
  readonly state?: ClaimState;
  readonly src?: readonly string[];
}

/** One step of an item (DESIGN §4 items schema). */
export interface ItemStep {
  readonly title: string;
  readonly note: string;
  /** An optional prerequisite or selectable option label. */
  readonly gate?: string;
  /** An optional short label. */
  readonly short?: string;
}

/** One item of the flat skills/research/buildings/mechanics datasets (DESIGN §4). */
export interface Item {
  readonly label: string;
  readonly title: string;
  readonly intro: string;
  readonly steps: readonly ItemStep[];
  readonly details?: readonly TitleBody[];
  /** Source ids resolving against the lord's `data/sources.json`. */
  readonly sources: readonly string[];
  readonly state?: ClaimState;
  readonly src?: readonly string[];
}

/** One objective item of `data/vco.json` (DESIGN §4): a VCO claim the F5 ledger will tick. */
export interface VcoItem {
  /** The stable objective id, unchanged across routes of the same lord. */
  readonly id: string;
  readonly text: string;
  /** VCO claims carry a confidence state by the same rule as objective/reward claims. */
  readonly state: ClaimState;
  readonly src?: readonly string[];
}

/** `data/armies.json`: route id → entry id → army (DESIGN §4 armies schema). */
export type ArmiesDataset = Readonly<Record<string, Readonly<Record<string, Army>>>>;

/** The four flat per-lord item dataset names (DESIGN §4 items schema). */
export type ItemDatasetName = "skills" | "research" | "buildings" | "mechanics";

/** `data/skills|research|buildings|mechanics.json`: entry id → item (DESIGN §4). */
export type ItemDataset = Readonly<Record<string, Item>>;

/** `data/vco.json`: route id → ordered objective items (DESIGN §4). */
export type VcoDataset = Readonly<Record<string, readonly VcoItem[]>>;

/** `version { patch, vco, checked }` from `guide.json`. */
export interface GuideVersion {
  readonly patch: string;
  readonly vco: string;
  readonly checked: string;
}

/** One `routes[]` entry of `guide.json`: the loader manifest line for a route document. */
export interface GuideRouteRef {
  readonly id: string;
  /** Path of the route Markdown file, relative to the lord directory. */
  readonly file: string;
  /** Display numeral I/II/III. */
  readonly number: "I" | "II" | "III";
}

/** The parsed `guide.json` manifest naming everything the loader must fetch. */
export interface GuideManifest {
  readonly id: string;
  readonly lord: string;
  readonly faction: string;
  readonly version: GuideVersion;
  readonly routes: readonly GuideRouteRef[];
  /** Path of the shared-fundamentals Markdown file, relative to the lord directory. */
  readonly shared: string;
  /** Dataset file names under `data/` (any mix of `sources` and the six). */
  readonly datasets: readonly string[];
  /** Optional crest SVG file name, resolved inside the lord directory (DESIGN §4). */
  readonly crest?: string;
  /** Optional environment topline, e.g. "Normal / Normal · Smart Autoresolve · VCO · Immortal Empires". */
  readonly environment?: string;
}

/** A rendered body section: one registry H2 with its (once, at boot) rendered inner Markdown. */
export interface Section {
  /** Anchor-slugged heading text, used by `#/<…>/plan/<route-id>/<section-id>`. */
  readonly id: string;
  /** The raw H2 heading text (registry title or `Transition → <other route>`). */
  readonly title: string;
  /** Markdown-rendered inner HTML, cached at boot. */
  readonly html: string;
}

/** A `::claim <state> [src=…] … ::` block callout parsed from a route body. */
export interface RouteCallout {
  readonly state: ClaimState;
  readonly src: readonly string[];
  /** Raw inner Markdown text between the opening and closing markers. */
  readonly text: string;
  /** The router-anchor id of the section enclosing this callout (the same slugified title as `Section.id`). */
  readonly sectionId: string;
  /** The registry H2 title of the section enclosing this callout. */
  readonly sectionTitle: string;
}

/** `panelOrder` frontmatter: a one-level map of string id lists. */
export type PanelOrder = Readonly<Record<string, readonly string[]>>;

/** One phase of a route's "operation in five moves" summary (DESIGN §4). */
export interface PhaseSummary {
  readonly title: string;
  readonly note: string;
}

/** A loaded route document (frontmatter contract plus body sections and callouts). */
export interface Route {
  readonly id: string;
  readonly number: "I" | "II" | "III";
  /** Guide-created thematic subtitle. */
  readonly name: string;
  /** Official VCO title, or `null` until researched. */
  readonly vcoTitle: string | null;
  readonly objective: Claim;
  readonly reward: Claim;
  readonly interpretation?: string;
  readonly bottleneck?: string;
  /** Authored route data retained for future use; currently unrendered. */
  readonly motto?: string;
  readonly transitions?: string;
  readonly panelOrder?: PanelOrder;
  /** Declared content-gap section titles; recorded so F2 can render gap markers. */
  readonly gaps: readonly string[];
  /** Optional ordered "operation in five moves" summaries; absent ⇒ no aside. */
  readonly phases?: readonly PhaseSummary[];
  /** Body H2 sections in document order. */
  readonly sections: readonly Section[];
  /** Callout claims in document order. */
  readonly claims: readonly RouteCallout[];
}

/** Any value a JSON file may hold — the shape of the six non-source datasets. */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { readonly [key: string]: JsonValue };

/** One loaded dataset: `sources` stays `Source[]`; the six carry typed values (DESIGN §4). */
export type LordDataset =
  | { readonly name: "sources"; readonly value: readonly Source[] }
  | { readonly name: "armies"; readonly value: ArmiesDataset }
  | { readonly name: ItemDatasetName; readonly value: ItemDataset }
  | { readonly name: "vco"; readonly value: VcoDataset };

/** One loaded lord: manifest, rendered shared fundamentals, routes, and datasets. */
export interface Lord {
  /** Directory name under `content/` (the manifest identity). */
  readonly slug: string;
  readonly guide: GuideManifest;
  /** `shared.md` rendered to HTML once at boot. */
  readonly sharedHtml: string;
  /** The validated crest SVG text fetched at boot; undefined without a `crest` manifest field. */
  readonly crestSvg?: string;
  readonly routes: readonly Route[];
  readonly datasets: readonly LordDataset[];
}

/** The immutable in-memory content tree; built once at boot, frozen. */
export interface ContentTree {
  readonly lords: readonly Lord[];
}

/** Reader abstraction: how the content domain performs I/O (injected everywhere). */
export interface ContentReader {
  /** Read one file by content-root-relative path; rejects when missing/unreadable. */
  readFile(path: string): Promise<string>;
  /**
   * Every file under the content root, for orphan detection. Returns `null`
   * when the platform cannot enumerate files (browser `file://` has no
   * directory listing); the lint then checks only the manifest-named set.
   */
  listFiles(): Promise<string[] | null>;
}

/**
 * Typed query result: either the value or an explicit not-found. Query
 * functions never throw for unknown ids (DESIGN §4 "unknown hash route").
 */
export type QueryResult<T> =
  | { readonly found: true; readonly value: T }
  | { readonly found: false; readonly kind: "not-found" };
