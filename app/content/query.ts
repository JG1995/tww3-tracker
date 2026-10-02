/**
 * Pure read functions over the immutable content tree (DESIGN §4/§5).
 * No I/O and no mutation: every lookup returns either the value or a typed
 * not-found result, exactly like the hash router's unknown routes render an
 * explicit not-found view instead of a blank page.
 */

import {
  type Army,
  type ContentTree,
  type Item,
  type ItemDatasetName,
  type Lord,
  type LordDataset,
  type QueryResult,
  type Route,
  type Section,
  type Source,
  type VcoItem,
} from "./types.ts";

const NOT_FOUND = { found: false, kind: "not-found" } as const;

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
 * states. The shape is also the dashboard's props contract (`Dashboard` in
 * `app/components/dashboard.ts` spreads it directly).
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
