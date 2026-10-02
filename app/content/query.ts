/**
 * Pure read functions over the immutable content tree (DESIGN §4/§5).
 * No I/O and no mutation: every lookup returns either the value or a typed
 * not-found result, exactly like the hash router's unknown routes render an
 * explicit not-found view instead of a blank page.
 */

import {
  type ContentTree,
  type Lord,
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
