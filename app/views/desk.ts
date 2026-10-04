/**
 * Reference desk view (feature DESIGN §2/§4/§5/§6 — Displayed Data, Empty
 * States, Layout, Copywriting; package `reference-desk-view`): the
 * route-scoped quick-reference surface over `{ lord, route }` — the resolved
 * route is always supplied by the caller (the desk is a route-page type).
 * The desk toolbar carries the serif "Reference desk" title, the caption,
 * and the "Compare routes" action — a component-local toggle (the `Dashboard`
 * hook-wrapper + plain-markup-builder seam, so node:test reaches the markup
 * without a DOM; `main.tsx` keys the desk by resolved route id, so the toggle
 * resets on a route switch like the dashboard's panel selection). The toggle
 * swaps the five-panel desk grid (I–V in `PANEL_GROUPS` order — flat
 * `panelOrder` label rows with a count + detail-page footer, three columns
 * wide and stacked below ~900px) for the route comparison cards.
 *
 * Below the grid, the lord-level zone (identical across routes): the Version
 * Banner (VERIFIED AGAINST eyebrow, `patch <X> · VCO <version>`, the
 * open-flags chip or ALL CLEARED chip), the shared fundamentals, and the
 * flagged-items section — the F3 implementation's behaviour (the single
 * `getFlaggedEntries` selector rendered exactly once, stable group order,
 * explicit cleared state) with VIEW links on the NEW hash grammar
 * (`plan/<route>/<section>` for callouts, `plan/<route>` for identity/VCO).
 * This module re-uses `getFlaggedEntries`, `ConfidenceBadge`, and the query
 * layer directly and imports nothing from `lord.ts` (that module is deleted
 * in Commit 9; it keeps its own old-grammar copies until then).
 * Presentational: everything comes from the immutable tree.
 */

import { h, type JSX, type TargetedMouseEvent } from "preact";
import { useState } from "preact/hooks";
import { ConfidenceBadge } from "../components/ConfidenceBadge.ts";
import { getFlaggedEntries, getPanelEntries, type FlaggedEntry, type PanelEntries } from "../content/query.ts";
import type { Army, Item, Lord, PanelGroup, Route } from "../content/types.ts";

/** One desk-panel card's fixed spec (DESIGN §2): the Roman index, the serif title, and the detail-page link. */
interface DeskPanelSpec {
  readonly numeral: string;
  readonly group: PanelGroup;
  readonly title: string;
  /** The detail-page route segment the card's footer links to. */
  readonly page: "armies" | "settlements" | "workshop";
  /** The detail page's display name (DESIGN §2 page copy). */
  readonly pageLabel: string;
}

/**
 * The five desk panel cards, in `PANEL_GROUPS` order (the DESIGN's fixed
 * panel order): each card's Roman-numeral index, serif title, and the
 * detail-page segment + display name its footer links to (I→armies, II→
 * armies, III→armies, IV→settlements, V→workshop — DESIGN §2).
 */
const DESK_PANELS: readonly DeskPanelSpec[] = [
  { numeral: "I", group: "armies", title: "Army templates", page: "armies", pageLabel: "Armies & skills" },
  { numeral: "II", group: "skills", title: "Lord & hero skills", page: "armies", pageLabel: "Armies & skills" },
  { numeral: "III", group: "research", title: "Research priorities", page: "armies", pageLabel: "Armies & skills" },
  { numeral: "IV", group: "buildings", title: "Settlement builds", page: "settlements", pageLabel: "Settlements & economy" },
  { numeral: "V", group: "mechanics", title: "Unique mechanics", page: "workshop", pageLabel: "Faction workshop" },
];

/**
 * The desk cards' explicit empty-state sentences, one per panel group
 * (DESIGN §5 Empty States / §6 Copywriting — the dashboard's
 * `PANEL_EMPTY_COPY` precedent: mono label + one proportional sentence,
 * never a blank card). The mono empty label derives from the card title in
 * `deskEmpty`.
 */
const DESK_EMPTY_COPY: Readonly<Record<PanelGroup, string>> = {
  armies: "No army templates are listed for this route yet.",
  skills: "No skills are listed for this route yet.",
  research: "No research is listed for this route yet.",
  buildings: "No settlements are listed for this route yet.",
  mechanics: "No mechanics are listed for this route yet.",
};

/**
 * The five panel display names — the location label of every dataset flag
 * row (the F3 vocabulary; mirrors the detail-page panel labels). These two
 * label maps are intentionally maintained by their respective consumers.
 */
const PANEL_LABELS: Readonly<Record<PanelGroup, string>> = {
  armies: "ARMY TEMPLATES",
  skills: "SKILLS",
  research: "RESEARCH",
  buildings: "SETTLEMENTS",
  mechanics: "MECHANICS",
};

export interface DeskMarkupProps {
  readonly lord: Lord;
  /** The resolved route — the desk is route-scoped; the caller always supplies it. */
  readonly route: Route;
  /** The component-local compare state: false = the panel grid, true = the route comparison cards. */
  readonly comparing: boolean;
  /** The Compare routes toggle action; the mounted wrapper supplies it, tests may omit it. */
  readonly onCompare?: () => void;
}

/**
 * The desk's pure VNode surface: the toolbar, exactly one of the panel grid
 * or the route comparison section (the compare toggle swaps them), then the
 * lord-level zone — version banner, shared fundamentals, flagged items.
 */
export function DeskMarkup(props: DeskMarkupProps): JSX.Element {
  const { lord, route, comparing, onCompare } = props;
  return h(
    "article",
    { className: "desk-page" },
    toolbar(comparing, onCompare),
    comparing ? comparisonSection(lord) : deskGrid(lord, route, getPanelEntries(lord, route)),
    versionBanner(lord, route),
    sharedFundamentals(lord),
    flaggedSection(lord),
  );
}

/**
 * The mounted desk: the compare state is component-local `useState` — no hash
 * write, nothing persisted (DESIGN §2 "The system must NOT persist any UI
 * state"). `main.tsx` keys the desk by resolved route id, so navigating
 * between routes remounts it and resets the toggle, like the dashboard.
 */
export function DeskView(props: { lord: Lord; route: Route }): JSX.Element {
  const [comparing, setComparing] = useState<boolean>(false);
  return h(DeskMarkup, { ...props, comparing, onCompare: () => setComparing((value) => !value) });
}

/** The desk toolbar (DESIGN §2): the serif title, the caption, the action. */
function toolbar(comparing: boolean, onCompare: (() => void) | undefined): JSX.Element {
  return h(
    "header",
    { className: "desk-toolbar" },
    h("h1", { className: "desk-toolbar__title" }, "Reference desk"),
    h("p", { className: "desk-toolbar__caption" }, "essentials here, full detail one page away"),
    h(
      "button",
      {
        className: comparing ? "desk-toolbar__toggle desk-toolbar__toggle--active" : "desk-toolbar__toggle",
        type: "button",
        "aria-pressed": comparing,
        onClick: onCompare,
      },
      "Compare routes",
    ),
  );
}

/**
 * The five-panel desk grid (the rendered atlas composition: three columns
 * wide, stacked below ~900px — DESIGN §2/§4, visual reconciliation). Each
 * card renders the `getPanelEntries` selection — the same `panelOrder` read
 * the dashboard uses.
 */
function deskGrid(lord: Lord, route: Route, panels: PanelEntries): JSX.Element {
  return h(
    "div",
    { className: "desk-grid" },
    DESK_PANELS.map((spec) => deskCard(lord, route, spec, panels[spec.group])),
  );
}

/**
 * One desk-panel card (DESIGN §2 desk-panel anatomy): the Roman-numeral
 * panel index + serif title, then the flat numbered rows in `panelOrder`
 * order (label lines only — no checkbox, no "Read notes"; those are deferred
 * scope), and the footer with the item count + the detail-page link. An
 * empty/absent panel list renders the explicit empty state — never a blank
 * card body.
 */
function deskCard(
  lord: Lord,
  route: Route,
  spec: DeskPanelSpec,
  entries: readonly Army[] | readonly Item[],
): JSX.Element {
  return h(
    "article",
    { key: spec.group, className: "desk-card" },
    h(
      "header",
      { className: "desk-card__head" },
      h("p", { className: "desk-card__index" }, spec.numeral),
      h("h2", { className: "desk-card__title" }, spec.title),
    ),
    entries.length === 0 ? deskEmpty(spec) : deskRows(spec, entries),
    deskFooter(lord, route, spec, entries.length),
  );
}

/**
 * The flat numbered rows — one per `panelOrder` entry in order: the army
 * `name` on the armies card, the item `title` on the four item cards.
 */
function deskRows(spec: DeskPanelSpec, entries: readonly Army[] | readonly Item[]): JSX.Element {
  return h(
    "ol",
    { className: "desk-card__rows" },
    entries.map((entry, index) =>
      h(
        "li",
        { key: entry.label, className: "desk-row" },
        h("span", { className: "desk-row__index" }, String(index + 1)),
        h(
          "span",
          { className: "desk-row__label" },
          spec.group === "armies" ? (entry as Army).name : (entry as Item).title,
        ),
      ),
    ),
  );
}

/** The explicit empty state in place of the rows: mono label + one sentence. */
function deskEmpty(spec: DeskPanelSpec): JSX.Element {
  return h(
    "div",
    { className: "desk-card__empty" },
    h("p", { className: "desk-card__empty-label" }, `NO ${spec.title.toUpperCase()} YET`),
    h("p", { className: "desk-card__empty-copy" }, DESK_EMPTY_COPY[spec.group]),
  );
}

/** The card footer: the item count and the detail-page link (new grammar). */
function deskFooter(lord: Lord, route: Route, spec: DeskPanelSpec, count: number): JSX.Element {
  return h(
    "footer",
    { className: "desk-card__footer" },
    h(
      "p",
      { className: "desk-card__count" },
      h("span", { className: "desk-card__count-number" }, String(count)),
      h("span", { className: "desk-card__count-label" }, "entries"),
    ),
    h(
      "a",
      { className: "desk-card__link", href: `#/${lord.slug}/${spec.page}/${route.id}` },
      spec.pageLabel,
    ),
  );
}

/**
 * The route comparison cards — one per manifest route (DESIGN §2): the
 * number, the official VCO title or the UNRESEARCHED marker, the thematic
 * subtitle, the objective, the reward, and the interpretation — an absent
 * `interpretation` renders no line, not a placeholder.
 */
function comparisonSection(lord: Lord): JSX.Element {
  return h(
    "section",
    { className: "desk-compare", "aria-label": "Route comparison" },
    lord.routes.map((route) => comparisonCard(route)),
  );
}

function comparisonCard(route: Route): JSX.Element {
  return h(
    "article",
    { key: route.id, className: "compare-card" },
    h(
      "header",
      { className: "compare-card__head" },
      h("p", { className: "compare-card__number" }, route.number),
      route.vcoTitle === null
        ? h("p", { className: "compare-card__vco compare-card__vco--unresearched" }, "UNRESEARCHED")
        : h("p", { className: "compare-card__vco" }, route.vcoTitle),
      h("p", { className: "compare-card__name" }, route.name),
    ),
    compareLine("OBJECTIVE", route.objective.text),
    compareLine("REWARD", route.reward.text),
    route.interpretation === undefined ? null : compareLine("INTERPRETATION", route.interpretation),
  );
}

function compareLine(label: string, text: string): JSX.Element {
  return h(
    "div",
    { className: "compare-card__line" },
    h("p", { className: "compare-card__eyebrow" }, label),
    h("p", { className: "compare-card__text" }, text),
  );
}

/* ─── The lord-level zone (identical across routes) ─────────────────────── */

/** `patch <X> · VCO <version>`, always together (DESIGN.md Value & Number Formatting). */
function versionLabel(lord: Lord): string {
  const v = lord.guide.version;
  return `patch ${v.patch} · VCO ${v.vco}`;
}

/**
 * The Version Banner (DESIGN.md "Version Banner"): the fixed VERIFIED AGAINST
 * mono eyebrow, the guide's version pairing, and the open-flags chip. The
 * count is `getFlaggedEntries(lord).length` — the SAME array the flagged-items
 * section renders, so the count and the list cannot disagree; never computed
 * again.
 */
function versionBanner(lord: Lord, route: Route): JSX.Element {
  const count = getFlaggedEntries(lord).length;
  return h(
    "div",
    { className: "version-banner" },
    h("p", { className: "version-banner__eyebrow" }, "VERIFIED AGAINST"),
    h("p", { className: "version-banner__version" }, versionLabel(lord)),
    count === 0 ? clearedChip() : flagsChip(lord, route, count),
  );
}

/**
 * The open-flags chip — a warning-role anchor whose href is this desk page
 * (the new grammar), with the F3 skip-link click idiom so the click never
 * emits a new hash shape: `preventDefault` the hash change, then scroll to
 * (and focus) the `flagged-items` section this view rendered.
 */
function flagsChip(lord: Lord, route: Route, count: number): JSX.Element {
  return h(
    "a",
    {
      className: "version-chip version-chip--warning",
      href: `#/${lord.slug}/desk/${route.id}`,
      onClick: (event: TargetedMouseEvent<HTMLAnchorElement>) => {
        // A same-page hash would re-route; scroll and focus the flagged
        // section instead (the skip-link click idiom in main.tsx).
        event.preventDefault();
        const target = document.getElementById("flagged-items");
        target?.scrollIntoView();
        target?.focus({ preventScroll: true });
      },
    },
    `${count} OPEN FLAGS`,
  );
}

/** The cleared state — a non-link success chip, no href, no handler. */
function clearedChip(): JSX.Element {
  return h("span", { className: "version-chip version-chip--success" }, "ALL CLEARED");
}

/** The shared fundamentals, rendered once at boot and cached in the tree. */
function sharedFundamentals(lord: Lord): JSX.Element {
  return h(
    "section",
    { className: "shared-fundamentals", "aria-label": "Shared fundamentals" },
    h("div", { className: "prose", dangerouslySetInnerHTML: { __html: lord.sharedHtml } }),
  );
}

/**
 * The flagged-items section (DESIGN §5/§6; package `flagged-list`): the mono
 * uppercase eyebrow naming the re-check list, then `getFlaggedEntries(lord)`
 * — the ONE definition of the guide's flagged set, rendered here exactly
 * once, never recomputed — grouped by location with mono group headings in
 * the selector's stable order (the view never re-sorts). The explicit
 * cleared state reads as a positive finish — never blank space.
 * `id="flagged-items"` is the version-banner chip's scroll target.
 */
function flaggedSection(lord: Lord): JSX.Element {
  const entries = getFlaggedEntries(lord);
  return h(
    "section",
    { className: "flagged-items", id: "flagged-items", tabIndex: -1, "aria-label": "Verify in campaign flags" },
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
 * The location link with the NEW hash grammar (the desk owns this zone from
 * this commit): callouts → the plan section anchor
 * (`#/<lord>/plan/<routeId>/<sectionId>`); identity and VCO items → the plan
 * page (`#/<lord>/plan/<routeId>`). Dataset rows render no link element at
 * all.
 */
function locationLink(lord: Lord, entry: FlaggedEntry): JSX.Element | null {
  if (entry.kind === "dataset") return null;
  const href =
    entry.kind === "callout"
      ? `#/${lord.slug}/plan/${entry.routeId}/${entry.sectionId}`
      : `#/${lord.slug}/plan/${entry.routeId}`;
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
