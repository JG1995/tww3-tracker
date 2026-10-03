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
  type PanelGroup,
  type QueryResult,
  type Route,
  type Section,
  type Source,
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
