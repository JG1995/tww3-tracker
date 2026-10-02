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
}

/** A rendered body section: one registry H2 with its (once, at boot) rendered inner Markdown. */
export interface Section {
  /** Anchor-slugged heading text, used by `#/<…>/route/<id>/<section-id>`. */
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
}

/** `panelOrder` frontmatter: a one-level map of lists of scalars. */
export type PanelOrder = Readonly<Record<string, readonly (string | number | boolean | null)[]>>;

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
  readonly motto?: string;
  readonly transitions?: string;
  readonly panelOrder?: PanelOrder;
  /** Declared content-gap section titles; recorded so F2 can render gap markers. */
  readonly gaps: readonly string[];
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

/** One loaded dataset: `sources` is typed as `Source[]`, the six as raw JSON. */
export type LordDataset =
  | { readonly name: "sources"; readonly value: readonly Source[] }
  | { readonly name: DatasetName; readonly value: JsonValue };

/** One loaded lord: manifest, rendered shared fundamentals, routes, and datasets. */
export interface Lord {
  /** Directory name under `content/` (the manifest identity). */
  readonly slug: string;
  readonly guide: GuideManifest;
  /** `shared.md` rendered to HTML once at boot. */
  readonly sharedHtml: string;
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
