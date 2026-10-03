/**
 * Lord view (DESIGN §2/§6): the Route Tab Strip at the top (active tab =
 * "shared", derived from the hash — the lord page IS the Shared surface),
 * the shared-fundamentals markdown (rendered once at boot, cached in the
 * tree) plus the route list — number, official VCO title or an explicit
 * "unresearched" marker when `vcoTitle` is null, the thematic subtitle
 * (dimmed), and the objective line, each row linking to the route page —
 * and the flagged-items section at the end of the page (DESIGN §5/§6): the
 * guide's complete `verify-in-campaign` re-check list rendered once from
 * the single flagged selector, grouped by location in the selector's stable
 * order with the explicit cleared state when the guide has no open flags.
 * Presentational: everything comes from the immutable tree.
 */

import { h, type JSX } from "preact";
import { TabStrip } from "../components/TabStrip.ts";
import { ConfidenceBadge } from "../components/ConfidenceBadge.ts";
import { getFlaggedEntries, type FlaggedEntry } from "../content/query.ts";
import type { Lord, PanelGroup, Route } from "../content/types.ts";

/**
 * The five dashboard panel display names — the location label of every
 * dataset flag row. Mirrors the dashboard's tab labels (their mapping stays
 * in `app/components/dashboard.ts`; reconcile into one shared constant only
 * when a third consumer appears).
 */
const PANEL_LABELS: Readonly<Record<PanelGroup, string>> = {
  armies: "ARMY TEMPLATES",
  skills: "SKILLS",
  research: "RESEARCH",
  buildings: "SETTLEMENTS",
  mechanics: "MECHANICS",
};

export function LordView(props: { lord: Lord }): JSX.Element {
  const lord = props.lord;
  return h(
    "article",
    { className: "lord-page" },
    h(TabStrip, { lordSlug: lord.slug, routes: lord.routes, activeId: "shared" }),
    h(
      "header",
      { className: "lord-page__header" },
      h("p", { className: "eyebrow" }, lord.guide.faction.toUpperCase()),
      h("h1", { className: "lord-page__title" }, lord.guide.lord),
      h("p", { className: "version-context" }, versionLabel(lord)),
    ),
    h(
      "section",
      { className: "shared-fundamentals", "aria-label": "Shared fundamentals" },
      h("div", { className: "prose", dangerouslySetInnerHTML: { __html: lord.sharedHtml } }),
    ),
    h(
      "section",
      { className: "route-list", "aria-label": "Routes" },
      h("h2", { className: "route-list__title" }, "Routes"),
      lord.routes.map((route) => routeRow(lord.slug, route)),
    ),
    flaggedSection(lord),
  );
}

/** `patch <X> · VCO <version>`, always together (DESIGN.md Value & Number Formatting). */
function versionLabel(lord: Lord): string {
  const v = lord.guide.version;
  return `patch ${v.patch} · VCO ${v.vco}`;
}

function routeRow(lordSlug: string, route: Route): JSX.Element {
  return h(
    "a",
    { className: "route-row", href: `#/${lordSlug}/route/${route.id}` },
    h("span", { className: "route-row__number" }, route.number),
    route.vcoTitle === null
      ? h("span", { className: "route-row__vco route-row__vco--unresearched" }, "UNRESEARCHED")
      : h("span", { className: "route-row__vco" }, route.vcoTitle),
    h("span", { className: "route-row__name" }, route.name),
    h("span", { className: "route-row__objective" }, route.objective.text),
  );
}

/**
 * The flagged-items section (DESIGN §5/§6; package `flagged-list`): the mono
 * uppercase eyebrow naming the re-check list, then `getFlaggedEntries(lord)`
 * — the ONE definition of the guide's flagged set, rendered here exactly
 * once, never recomputed — grouped by location with mono group headings in
 * the selector's stable order (the view never re-sorts). The explicit
 * cleared state reads as a positive finish — never blank space.
 * `id="flagged-items"` is the version-banner chip's future scroll target.
 */
function flaggedSection(lord: Lord): JSX.Element {
  const entries = getFlaggedEntries(lord);
  return h(
    "section",
    { className: "flagged-items", id: "flagged-items", "aria-label": "Verify in campaign flags" },
    h("h2", { className: "flagged-items__title" }, "VERIFY IN CAMPAIGN"),
    entries.length === 0 ? clearedState() : flaggedGroups(lord, entries),
  );
}

/**
 * The entries grouped by location in the selector's stable order — routes in
 * manifest order, one mono group heading per route, the entries inside
 * keeping the selector's exact family order (identity, then callouts in
 * body order, then dataset panels in `PANEL_GROUPS` order, then VCO items
 * in list order) — pure grouping, never a re-sort.
 */
function flaggedGroups(lord: Lord, entries: readonly FlaggedEntry[]): JSX.Element {
  const groups: Array<{ route: Route; entries: FlaggedEntry[] }> = [];
  for (const route of lord.routes) {
    const routeEntries = entries.filter((entry) => entry.routeId === route.id);
    if (routeEntries.length > 0) groups.push({ route, entries: routeEntries });
  }
  return h(
    "div",
    { className: "flagged-items__groups" },
    groups.map((group) =>
      h(
        "div",
        { key: group.route.id, className: "flagged-items__group" },
        h("h3", { className: "flagged-items__group-heading" }, `ROUTE ${group.route.number}`),
        group.entries.map((entry) => flaggedItem(lord, group.route, entry)),
      ),
    ),
  );
}

/** One compact flag row (DESIGN §6): label, claim text, badge, notes, link. */
function flaggedItem(lord: Lord, route: Route, entry: FlaggedEntry): JSX.Element {
  return h(
    "div",
    { key: flaggedKey(entry), className: `flagged-item flagged-item--${entry.kind}` },
    h("p", { className: "flagged-item__location" }, locationLabel(route, entry)),
    h("p", { className: "flagged-item__claim" }, entry.text),
    h(ConfidenceBadge, { state: entry.state, sources: entry.sources }),
    sourceNotes(entry),
    locationLink(lord, entry),
  );
}

/** One stable key per entry: kind + route + the kind-specific discriminator. */
function flaggedKey(entry: FlaggedEntry): string {
  if (entry.kind === "identity") return `identity:${entry.routeId}:${entry.claimKind}`;
  if (entry.kind === "callout") return `callout:${entry.routeId}:${entry.sectionId}`;
  if (entry.kind === "dataset") return `dataset:${entry.routeId}:${entry.group}:${entry.entryId}`;
  return `vco:${entry.routeId}:${entry.itemId}`;
}

/** The mono location label (DESIGN §6 — route + section / panel / objective id; copy descriptive, not contractual). */
function locationLabel(route: Route, entry: FlaggedEntry): string {
  if (entry.kind === "identity") return `ROUTE ${route.number} · ${entry.claimKind.toUpperCase()}`;
  if (entry.kind === "callout") return `ROUTE ${route.number} · ${entry.sectionTitle}`;
  if (entry.kind === "dataset") return PANEL_LABELS[entry.group];
  return `ROUTE ${route.number} · ${entry.itemId}`;
}

/**
 * The resolved source notes beneath the badge — one `body-sm` line per
 * source (their titles render as the badge's F2 source links); no sources ⇒
 * no note block, the row keeps its text, badge and location.
 */
function sourceNotes(entry: FlaggedEntry): JSX.Element | null {
  if (entry.sources.length === 0) return null;
  return h(
    "div",
    { className: "flagged-item__notes" },
    entry.sources.map((source) =>
      h("p", { key: source.id, className: "flagged-item__note" }, source.note),
    ),
  );
}

/**
 * The location link where the existing hash grammar reaches the entry
 * (DESIGN: "a link to the claim's location where the existing router reaches
 * it"): callouts → the section anchor the route view already emits
 * (`#/<lord>/route/<routeId>/<sectionId>`); identity and VCO items → the
 * route page. Dataset rows render no link element at all.
 */
function locationLink(lord: Lord, entry: FlaggedEntry): JSX.Element | null {
  if (entry.kind === "dataset") return null;
  const href =
    entry.kind === "callout"
      ? `#/${lord.slug}/route/${entry.routeId}/${entry.sectionId}`
      : `#/${lord.slug}/route/${entry.routeId}`;
  return h("a", { className: "flagged-item__link", href }, "VIEW");
}

/**
 * The explicit cleared empty state (DESIGN §5 Empty States / §6): the mono
 * label plus one proportional sentence in the success palette — the research
 * trail is complete, a positive visible state, never blank space.
 */
function clearedState(): JSX.Element {
  return h(
    "div",
    { className: "flagged-items__cleared" },
    h("p", { className: "flagged-items__cleared-label" }, "ALL CLEARED"),
    h(
      "p",
      { className: "flagged-items__cleared-copy" },
      "No claim is currently open — the research trail is complete.",
    ),
  );
}
