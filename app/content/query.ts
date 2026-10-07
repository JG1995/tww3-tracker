/**
 * Pure read functions over the immutable content tree (DESIGN §4/§5).
 * No I/O and no mutation: every lookup returns either the value or a typed
 * not-found result, exactly like the hash router's unknown routes render an
 * explicit not-found view instead of a blank page.
 *
 * The module also owns the cross-guide search (F6; ARCHITECTURE names this
 * file as the engine's home): `buildSearchIndex` and `searchContent` build
 * the searchable corpus from and match tokenized queries over the same
 * immutable tree, keeping the naive tokenized engine and its MiniSearch
 * upgrade path inside this file (ARCHITECTURE §1.1 performance).
 */

import {
  type Army,
  type ContentTree,
  type Item,
  type ItemDatasetName,
  type Lord,
  type LordDataset,
  type PanelGroup,
  type QueryResult,
  type Route,
  type Section,
  type Source,
  type UnitRow,
  type VcoItem,
  PANEL_GROUPS,
} from "./types.ts";

const NOT_FOUND = { found: false, kind: "not-found" } as const;

/** The flagged state: the only confidence state the flagged set ever carries. */
const VERIFY_IN_CAMPAIGN = "verify-in-campaign";

/** Every lord in `index.json` order. */
export function listLords(tree: ContentTree): readonly Lord[] {
  return tree.lords;
}

/** One lord by slug, or a typed not-found. */
export function getLord(tree: ContentTree, slug: string): QueryResult<Lord> {
  const lord = tree.lords.find((l) => l.slug === slug);
  return lord === undefined ? NOT_FOUND : { found: true, value: lord };
}

/** One route of a lord by route id, or a typed not-found. */
export function getRoute(tree: ContentTree, lordSlug: string, routeId: string): QueryResult<Route> {
  const lord = getLord(tree, lordSlug);
  if (!lord.found) return lord;
  const route = lord.value.routes.find((r) => r.id === routeId);
  return route === undefined ? NOT_FOUND : { found: true, value: route };
}

/** One rendered section (anchor target) of a route, or a typed not-found. */
export function getSection(
  tree: ContentTree,
  lordSlug: string,
  routeId: string,
  sectionId: string,
): QueryResult<Section> {
  const route = getRoute(tree, lordSlug, routeId);
  if (!route.found) return route;
  const section = route.value.sections.find((s) => s.id === sectionId);
  return section === undefined ? NOT_FOUND : { found: true, value: section };
}

/** One source of a lord by id (resolved against that lord's `data/sources.json`), or a typed not-found. */
export function getSource(tree: ContentTree, lordSlug: string, sourceId: string): QueryResult<Source> {
  const lord = getLord(tree, lordSlug);
  if (!lord.found) return lord;
  const sources = lord.value.datasets.find((d) => d.name === "sources");
  if (sources === undefined) return NOT_FOUND;
  const source = sources.value.find((s) => s.id === sourceId);
  return source === undefined ? NOT_FOUND : { found: true, value: source };
}

/**
 * One dashboard panel's resolved `panelOrder` entries per group (DESIGN §4
 * "Panel selection and order"): the armies ids resolve against the route's
 * own `armies[route.id]` map, the four item groups against the lord-wide
 * typed datasets — each in `panelOrder` order, with unlisted and unknown ids
 * omitted. The committed tree's empty lists drive the panels' explicit empty
 * states. The shape feeds `DeskPanel` in `app/components/deskPanel.ts`.
 */
export interface PanelEntries {
  readonly armies: readonly Army[];
  readonly skills: readonly Item[];
  readonly research: readonly Item[];
  readonly buildings: readonly Item[];
  readonly mechanics: readonly Item[];
}

/**
 * Resolves one flat item group's `panelOrder` ids against the lord's typed
 * dataset (DESIGN §4): known ids in the listed order, unknown ids dropped,
 * an absent dataset or list an empty result. Pure and never throws.
 */
function resolveItemEntries(
  lord: Lord,
  name: ItemDatasetName,
  ids: readonly string[] | undefined,
): readonly Item[] {
  if (ids === undefined) return [];
  // The literal-scoped find narrows to the item members (the variable-name
  // lookup defeats TS's inferred type predicates, leaving `readonly Source[]`
  // unindexable in the union — the explicit predicate keeps the typed read).
  const dataset = lord.datasets.find(
    (d): d is Extract<LordDataset, { readonly name: ItemDatasetName }> => d.name === name,
  );
  if (dataset === undefined) return [];
  return ids.map((id) => dataset.value[id]).filter((item): item is Item => item !== undefined);
}

/**
 * The five dashboard panel entry lists for one route (DESIGN §4 "Panel
 * selection and order"): each group's `panelOrder` ids resolve to their
 * typed entries in listed order — armies against the route's own armies map
 * `armies[route.id]`, skills/research/buildings/mechanics against the
 * lord-wide item datasets. A group with an empty or absent list yields `[]`;
 * unknown ids are omitted, never an error (the lint catches unresolvable ids
 * pre-boot). Pure: reads the immutable tree, never throws.
 */
export function getPanelEntries(lord: Lord, route: Route): PanelEntries {
  const order = route.panelOrder ?? {};
  const routeArmies = lord.datasets.find((d) => d.name === "armies")?.value[route.id];
  const armiesEntries = (order.armies ?? [])
    .map((id) => routeArmies?.[id])
    .filter((army): army is Army => army !== undefined);
  return {
    armies: armiesEntries,
    skills: resolveItemEntries(lord, "skills", order.skills),
    research: resolveItemEntries(lord, "research", order.research),
    buildings: resolveItemEntries(lord, "buildings", order.buildings),
    mechanics: resolveItemEntries(lord, "mechanics", order.mechanics),
  };
}

/**
 * One route's ordered VCO objective items (DESIGN §4 vco schema), or `[]`
 * when the `vco` dataset or that route's entry is absent — the DESIGN's
 * "optional" list, so the view renders no undercard then. A list-shaped read:
 * the empty list is its not-found. Never throws.
 */
export function getVcoObjectives(lord: Lord, routeId: string): readonly VcoItem[] {
  const vco = lord.datasets.find((d) => d.name === "vco");
  if (vco === undefined) return [];
  return vco.value[routeId] ?? [];
}

/**
 * Resolves source ids against the lord's `data/sources.json`: known ids in
 * the given order, unknown ids dropped (pure and never throws — a dangling id
 * simply resolves to no link, keeping the badge presentational).
 */
export function resolveSources(lord: Lord, sourceIds: readonly string[]): readonly Source[] {
  const sources = lord.datasets.find((d) => d.name === "sources");
  if (sources === undefined) return [];
  return sourceIds
    .map((id) => sources.value.find((s) => s.id === id))
    .filter((s): s is Source => s !== undefined);
}

/**
 * One flagged-set entry (DESIGN §4 "Flagged entry"): one
 * `verify-in-campaign` claim with the navigation structure the view needs to
 * name and link its place. `kind` discriminates the four claim families;
 * `state` is always `verify-in-campaign` in every member — the other three
 * confidence states never appear here (the union narrows on it). `sources`
 * holds the claim's resolved source notes (`resolveSources`: known ids in
 * order, dangling ids dropped). No hrefs or label strings live here — those
 * are the view's presentation.
 */
export type FlaggedEntry =
  | {
      readonly kind: "identity";
      readonly routeId: string;
      /** Which guide identity claim this is. */
      readonly claimKind: "objective" | "reward";
      readonly text: string;
      readonly state: "verify-in-campaign";
      readonly sources: readonly Source[];
    }
  | {
      readonly kind: "callout";
      readonly routeId: string;
      /** The enclosing section's router-anchor id and H2 title (the Commit 1 fields). */
      readonly sectionId: string;
      readonly sectionTitle: string;
      readonly text: string;
      readonly state: "verify-in-campaign";
      readonly sources: readonly Source[];
    }
  | {
      readonly kind: "dataset";
      readonly routeId: string;
      /** The dashboard panel group the entry belongs to (PANEL_GROUPS order). */
      readonly group: PanelGroup;
      /** The entry id within that group's panelOrder list. */
      readonly entryId: string;
      readonly text: string;
      readonly state: "verify-in-campaign";
      readonly sources: readonly Source[];
    }
  | {
      readonly kind: "vco";
      readonly routeId: string;
      /** The vco item id from `data/vco.json`. */
      readonly itemId: string;
      readonly text: string;
      readonly state: "verify-in-campaign";
      readonly sources: readonly Source[];
    };

/**
 * The ONE definition of a guide's flagged set (DESIGN §5 "Flagged set"):
 * every `verify-in-campaign` claim — route objective/reward identity claims,
 * route body `::claim` callouts, `panelOrder`-listed dataset items, and VCO
 * objective items. The banner count and the flagged list both read this
 * selector, so they cannot disagree; views never compute a second set.
 *
 * Order is stable (views group without re-sorting): routes in manifest
 * order; within a route, identity claims, then callouts in document order,
 * then dataset entries in PANEL_GROUPS order, then VCO items in list order.
 * Dataset entries resolve with the same scopes as `getPanelEntries` — armies
 * ids against the route's own `armies[route.id]` map (distinct per route and
 * entry), flat item ids against the lord-wide item datasets. A flat item
 * shared by several routes' `panelOrder` appears once, located to its panel;
 * the dedupe key is (group, id) because the same id may name entries in
 * different item groups (skills `theodore` and mechanics `theodore`). Pure:
 * reads the immutable tree, never throws.
 */
export function getFlaggedEntries(lord: Lord): readonly FlaggedEntry[] {
  const entries: FlaggedEntry[] = [];
  const seenFlat = new Set<string>();
  for (const route of lord.routes) {
    for (const [claimKind, claim] of [
      ["objective", route.objective],
      ["reward", route.reward],
    ] as const) {
      if (claim.state !== VERIFY_IN_CAMPAIGN) continue;
      entries.push({
        kind: "identity",
        routeId: route.id,
        claimKind,
        text: claim.text,
        state: VERIFY_IN_CAMPAIGN,
        sources: resolveSources(lord, claim.src),
      });
    }

    for (const callout of route.claims) {
      if (callout.state !== VERIFY_IN_CAMPAIGN) continue;
      entries.push({
        kind: "callout",
        routeId: route.id,
        sectionId: callout.sectionId,
        sectionTitle: callout.sectionTitle,
        text: callout.text,
        state: VERIFY_IN_CAMPAIGN,
        sources: resolveSources(lord, callout.src),
      });
    }

    for (const group of PANEL_GROUPS) {
      const order = route.panelOrder?.[group] ?? [];
      if (group === "armies") {
        const routeArmies = lord.datasets.find((d) => d.name === "armies")?.value[route.id];
        for (const id of order) {
          const army = routeArmies?.[id];
          if (army === undefined || army.state !== VERIFY_IN_CAMPAIGN) continue;
          entries.push({
            kind: "dataset",
            routeId: route.id,
            group,
            entryId: id,
            text: army.name,
            state: VERIFY_IN_CAMPAIGN,
            sources: resolveSources(lord, army.src ?? []),
          });
        }
      } else {
        // Flat item groups resolve lord-wide, exactly like `resolveItemEntries`.
        const items = lord.datasets.find(
          (d): d is Extract<LordDataset, { readonly name: ItemDatasetName }> => d.name === group,
        )?.value;
        for (const id of order) {
          const key = `${group}\u0000${id}`;
          const item = items?.[id];
          if (item === undefined || item.state !== VERIFY_IN_CAMPAIGN || seenFlat.has(key)) continue;
          seenFlat.add(key);
          entries.push({
            kind: "dataset",
            routeId: route.id,
            group,
            entryId: id,
            text: item.title,
            state: VERIFY_IN_CAMPAIGN,
            sources: resolveSources(lord, item.src ?? []),
          });
        }
      }
    }

    for (const item of getVcoObjectives(lord, route.id)) {
      if (item.state !== VERIFY_IN_CAMPAIGN) continue;
      entries.push({
        kind: "vco",
        routeId: route.id,
        itemId: item.id,
        text: item.text,
        state: VERIFY_IN_CAMPAIGN,
        sources: resolveSources(lord, item.src ?? []),
      });
    }
  }
  return entries;
}

// ─── Cross-guide search (F6; DESIGN §2 corpus, §4 landing targets) ──────────

/**
 * The nine searchable corpus families (DESIGN §2 "Corpus"): every rendered
 * content family the search indexes, closed so hits can never name a new one.
 */
export type SearchIndexEntryKind =
  | "section"
  | "shared"
  | "army"
  | "skill"
  | "research"
  | "building"
  | "mechanic"
  | "vco"
  | "source";

/**
 * One searchable corpus entry (DESIGN §2): a single unit of searchable text
 * with its stable breadcrumb identity. `routeId` is the manifest route id for
 * the route-scoped kinds and `null` for the lord-wide kinds (`shared`,
 * `source`). `text` and `title` are plain strings — the two HTML-stored
 * families (`Section.html`, `sharedHtml`) are tag-stripped at index time.
 */
export interface SearchIndexEntry {
  readonly kind: SearchIndexEntryKind;
  readonly lordSlug: string;
  readonly routeId: string | null;
  readonly title: string;
  readonly text: string;
}

/** One matched range inside a hit's snippet, relative to the snippet text. */
export interface SearchOccurrence {
  readonly start: number;
  readonly end: number;
}

/**
 * One search result hit (DESIGN §4): the entry's breadcrumb identity, the
 * fixed per-kind category label, the plain-text snippet, the matched ranges
 * inside it, and the DESIGN §4 landing-target hash. Never HTML: the view
 * renders text nodes around `occurrences`.
 */
export interface SearchHit {
  readonly kind: SearchIndexEntryKind;
  readonly lordSlug: string;
  readonly faction: string;
  readonly routeId: string | null;
  /** `${route.number} · ${route.name}`, or `null` for the lord-wide kinds. */
  readonly routeLabel: string | null;
  readonly category: string;
  readonly title: string;
  readonly snippet: string;
  readonly occurrences: readonly SearchOccurrence[];
  readonly href: string;
}

/** The result of one tokenized query: the full match count plus the first 30 hits. */
export interface SearchResults {
  readonly total: number;
  readonly hits: readonly SearchHit[];
}

/** The fixed category eyebrow per kind (DESIGN §2/§4). */
const CATEGORY_LABEL: Readonly<Record<SearchIndexEntryKind, string>> = {
  section: "Route plan",
  shared: "Shared fundamentals",
  army: "Army templates",
  skill: "Lord & hero skills",
  research: "Research priorities",
  building: "Settlement builds",
  mechanic: "Unique mechanics",
  vco: "VCO objective",
  source: "Sources",
};

/** The four flat item dataset names, as their per-kind label maps to them. */
const isItemKind = (name: LordDataset["name"]): name is ItemDatasetName =>
  name === "skills" || name === "research" || name === "buildings" || name === "mechanics";

/** Dataset name → index kind (the four flat datasets use plural names; the kinds are singular). */
const ITEM_KIND_BY_NAME: Readonly<Record<ItemDatasetName, "skill" | "research" | "building" | "mechanic">> = {
  skills: "skill",
  research: "research",
  buildings: "building",
  mechanics: "mechanic",
};

/** The result list cap (DESIGN §2 "30+" convention). */
const MAX_HITS = 30;
/** Whole-text shortcut threshold and half-window size for the snippet. */
const SNIPPET_WHOLE = 200;
const SNIPPET_HALF = 100;
/** The vco title lead-in cap (first sentence, truncated with an ellipsis). */
const VCO_LEAD_MAX = 72;

/**
 * Tag-strips one rendered HTML string by replacing every tag with a space
 * (DESIGN §2 corpus: the two HTML-stored families). Recorded naivety: no
 * entity decoding, so `&amp;` survives verbatim — snippets are plain text
 * nodes, so this is never a markup- or injection risk.
 */
function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

/** ASCII alphanumeric test on a code point (the tokenizer's character class). */
function isAlnum(code: number): boolean {
  return (code >= 48 && code <= 57) || (code >= 97 && code <= 122);
}

/**
 * Case-folds and splits text into whole tokens on non-alphanumerics, dropping
 * empties — the match rule's tokenization (plan: tokenize on non-alphanumerics).
 */
function toTokens(text: string): readonly string[] {
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/);
  return tokens.filter((t) => t.length > 0);
}

/**
 * All plain-string rendered fields of one army template (DESIGN §2 armies
 * corpus): label, name, supportName, every unit/legendary/generic row's name,
 * role and kind, the size (rendered), the context, and the notes/plan
 * TitleBody pairs (title and body of each).
 */
function armyText(army: Army): string {
  const rowFields = (rows: readonly UnitRow[]): readonly string[] =>
    rows.flatMap((row) => [row.name, row.role, row.kind]);
  return [
    army.label,
    army.name,
    army.supportName ?? "",
    String(army.size),
    army.context ?? "",
    ...rowFields(army.units),
    ...rowFields(army.legendary),
    ...rowFields(army.generic),
    ...army.notes.flatMap(([title, body]) => [title, body]),
    ...army.plan.flatMap(([title, body]) => [title, body]),
  ].join(" ");
}

/**
 * All plain-string fields of one flat dataset item (DESIGN §2 items corpus):
 * label, title, intro, every step's title/note/gate/short, and the details
 * TitleBody pairs (title and body of each).
 */
function itemText(item: Item): string {
  return [
    item.label,
    item.title,
    item.intro,
    ...item.steps.flatMap((step) => [step.title, step.note, step.gate ?? "", step.short ?? ""]),
    ...(item.details ?? []).flatMap(([title, body]) => [title, body]),
  ].join(" ");
}

/**
 * The vco entry title: `id · lead` where `lead` is the first sentence of the
 * item text (up to the first `". "`, else the whole text), truncated at 72
 * chars with a trailing ellipsis when truncated.
 */
function vcoTitle(item: VcoItem): string {
  const dot = item.text.indexOf(". ");
  const firstSentence = dot === -1 ? item.text : item.text.slice(0, dot + 1);
  const lead =
    firstSentence.length > VCO_LEAD_MAX ? `${firstSentence.slice(0, VCO_LEAD_MAX)}…` : firstSentence;
  return `${item.id} · ${lead}`;
}

/**
 * The internal corpus walk result: the public index shape plus the section
 * anchor id, which the section landing href needs (DESIGN §4) but the public
 * `SearchIndexEntry` contract does not carry.
 */
type CorpusEntry =
  | (SearchIndexEntry & { readonly kind: "section"; readonly sectionId: string })
  | (SearchIndexEntry & { readonly kind: Exclude<SearchIndexEntryKind, "section"> });

/**
 * Builds the searchable corpus in exact hit order (DESIGN §2): lords in
 * manifest order; within a lord, routes in manifest order, each contributing
 * sections (document order), armies of `armies[route.id]` (dataset key
 * order), the four flat item datasets in `lord.datasets` (manifest) order,
 * and VCO items of `vco[route.id]` (list order) — then, after the routes,
 * the shared fundamentals and the source entries. `panelOrder`-excluded
 * entries stay in the corpus (recorded plan decision). Pure: reads the
 * immutable tree, never throws.
 */
function walkCorpus(tree: ContentTree): readonly CorpusEntry[] {
  const entries: CorpusEntry[] = [];
  for (const lord of tree.lords) {
    for (const route of lord.routes) {
      for (const section of route.sections) {
        entries.push({
          kind: "section",
          lordSlug: lord.slug,
          routeId: route.id,
          title: section.title,
          text: stripTags(section.html),
          sectionId: section.id,
        });
      }
      const routeArmies = lord.datasets.find((d) => d.name === "armies")?.value[route.id];
      for (const army of Object.values(routeArmies ?? {})) {
        entries.push({
          kind: "army",
          lordSlug: lord.slug,
          routeId: route.id,
          title: army.name,
          text: armyText(army),
        });
      }
      for (const dataset of lord.datasets) {
        if (!isItemKind(dataset.name)) continue;
        for (const item of Object.values(dataset.value)) {
          entries.push({
            kind: ITEM_KIND_BY_NAME[dataset.name],
            lordSlug: lord.slug,
            routeId: route.id,
            title: item.title,
            text: itemText(item),
          });
        }
      }
      for (const item of getVcoObjectives(lord, route.id)) {
        entries.push({
          kind: "vco",
          lordSlug: lord.slug,
          routeId: route.id,
          title: vcoTitle(item),
          text: `${item.id} ${item.text}`,
        });
      }
    }
    entries.push({
      kind: "shared",
      lordSlug: lord.slug,
      routeId: null,
      title: "Shared fundamentals",
      text: stripTags(lord.sharedHtml),
    });
    const sources = lord.datasets.find((d) => d.name === "sources");
    if (sources !== undefined) {
      for (const source of sources.value) {
        entries.push({
          kind: "source",
          lordSlug: lord.slug,
          routeId: null,
          title: source.title,
          text: `${source.title} ${source.note}`,
        });
      }
    }
  }
  return entries;
}

/**
 * The searchable corpus in hit order (DESIGN §2), in the public read-only
 * shape — the internal walk minus the section anchor. Index order is hit
 * order: stable, never re-sorted.
 */
export function buildSearchIndex(tree: ContentTree): readonly SearchIndexEntry[] {
  return walkCorpus(tree).map((entry) => ({
    kind: entry.kind,
    lordSlug: entry.lordSlug,
    routeId: entry.routeId,
    title: entry.title,
    text: entry.text,
  }));
}

/**
 * The DESIGN §4 landing-target hash for one entry — the seven shapes
 * verbatim. Route-scoped kinds always have a `routeId`; the lord-wide kinds
 * take the fixed shapes.
 */
function landingHref(entry: CorpusEntry): string {
  const root = `#/${entry.lordSlug}`;
  switch (entry.kind) {
    case "section":
      return `${root}/plan/${entry.routeId}/${entry.sectionId}`;
    case "shared":
      return root;
    case "army":
    case "skill":
    case "research":
      return `${root}/armies/${entry.routeId}`;
    case "building":
      return `${root}/settlements/${entry.routeId}`;
    case "mechanic":
      return `${root}/workshop/${entry.routeId}`;
    case "vco":
      return `${root}/plan/${entry.routeId}`;
    case "source":
      return `${root}/sources`;
    default: {
      // Unreachable: the kind union is closed and every case returns above.
      // The never guard turns a new kind into a compile error at this case
      // instead of a silently empty landing hash.
      const exhaustive: never = entry;
      return exhaustive;
    }
  }
}

/**
 * The first left-boundary prefix occurrence of `token` in the folded text,
 * or -1. A match starts where an alphanumeric run begins (start of text or
 * after a non-alphanumeric) and that run starts with the query token.
 */
function firstMatchPosition(folded: string, token: string): number {
  for (let i = 0; i <= folded.length - token.length; i++) {
    if (!isAlnum(folded.charCodeAt(i))) continue;
    if (i > 0 && isAlnum(folded.charCodeAt(i - 1))) continue;
    if (folded.startsWith(token, i)) return i;
  }
  return -1;
}

/**
 * The plain-text snippet (DESIGN §2): the whole joined text when it is short,
 * otherwise a ~200-char window around the first occurrence of the first query
 * token, widened to token boundaries and clamped at the text edges. Positions
 * come from the case-folded text; the slice is taken from the original, which
 * is index-identical over the ASCII token runs this corpus produces.
 */
function makeSnippet(joined: string, folded: string, firstToken: string): string {
  if (joined.length <= SNIPPET_WHOLE) return joined;
  const match = firstMatchPosition(folded, firstToken);
  let start = Math.max(0, match - SNIPPET_HALF);
  let end = Math.min(joined.length, match + SNIPPET_HALF);
  while (start > 0 && isAlnum(folded.charCodeAt(start - 1))) start--;
  while (end < joined.length && isAlnum(folded.charCodeAt(end))) end++;
  return joined.slice(start, end);
}

/**
 * Every non-overlapping left-boundary prefix match of any query token inside
 * the snippet, as `{ start, end }` ranges relative to the snippet. At a run
 * start that several query tokens prefix, the longest token is recorded (the
 * most informative highlight); scanning continues past each recorded match,
 * so ranges never overlap.
 */
function findOccurrences(snippet: string, queryTokens: readonly string[]): readonly SearchOccurrence[] {
  const folded = snippet.toLowerCase();
  const occurrences: SearchOccurrence[] = [];
  let i = 0;
  while (i < folded.length) {
    if (isAlnum(folded.charCodeAt(i)) && (i === 0 || !isAlnum(folded.charCodeAt(i - 1)))) {
      let best: string | null = null;
      for (const token of queryTokens) {
        if (folded.startsWith(token, i) && (best === null || token.length > best.length)) best = token;
      }
      if (best !== null) {
        occurrences.push({ start: i, end: i + best.length });
        i += best.length;
        continue;
      }
    }
    i++;
  }
  return occurrences;
}

/** Assembles one hit for a matched entry (faction/route lookup + snippet/href). */
function assembleHit(
  entry: CorpusEntry,
  queryTokens: readonly string[],
  joined: string,
  folded: string,
  lordsBySlug: Map<string, Lord>,
): SearchHit {
  const lord = lordsBySlug.get(entry.lordSlug);
  // The walk emits only real routes, so route-scoped entries always resolve.
  const route = entry.routeId === null ? undefined : lord?.routes.find((r) => r.id === entry.routeId);
  const snippet = makeSnippet(joined, folded, queryTokens[0]);
  return {
    kind: entry.kind,
    lordSlug: entry.lordSlug,
    faction: lord?.guide.faction ?? "",
    routeId: entry.routeId,
    routeLabel: route === undefined ? null : `${route.number} · ${route.name}`,
    category: CATEGORY_LABEL[entry.kind],
    title: entry.title,
    snippet,
    occurrences: findOccurrences(snippet, queryTokens),
    href: landingHref(entry),
  };
}

/**
 * Tokenized cross-guide search (DESIGN §2/§4, ARCHITECTURE §1.1). Case-folds
 * the query and every entry's joined `title + " " + text`; an entry matches
 * when every query token is a left-word-boundary prefix of at least one entry
 * token (AND). A query with no tokens (empty, whitespace, punctuation-only)
 * returns zero hits. No ranking: hits keep index order; `total` counts every
 * match and `hits` holds the first 30. Pure: reads the immutable tree only,
 * never throws.
 */
export function searchContent(tree: ContentTree, query: string): SearchResults {
  const queryTokens = toTokens(query);
  if (queryTokens.length === 0) return { total: 0, hits: [] };

  const lordsBySlug = new Map(tree.lords.map((lord) => [lord.slug, lord]));
  const hits: SearchHit[] = [];
  let total = 0;
  for (const entry of walkCorpus(tree)) {
    const joined = `${entry.title} ${entry.text}`;
    const folded = joined.toLowerCase();
    const entryTokens = toTokens(folded);
    if (!queryTokens.every((queryToken) => entryTokens.some((t) => t.startsWith(queryToken)))) continue;
    total++;
    if (hits.length >= MAX_HITS) continue;
    hits.push(assembleHit(entry, queryTokens, joined, folded, lordsBySlug));
  }
  return { total, hits };
}
