/**
 * The shared desk-panel anatomy (feature DESIGN §2/§4/§5/§6 — Displayed
 * Data, the desk-panel anatomy, Empty States, Copywriting; package
 * `detail-pages-view`): one numbered panel in the atlas's desk-panel
 * anatomy — the serif head (Roman-numeral index + serif title) over the
 * **full item anatomy moved from `dashboard.ts` behaviour-identically**.
 * The armies panel renders one entry per army with the legendary-lord and
 * generic-lord unit columns (the same `n`/`name`/`role`/`kind` row shape,
 * an explicit absent marker for an empty column, optional `context`, the
 * `notes[]` and `plan` [title, body] rows, `size`, and source links); the
 * four item panels render one card per item (`label`, `title`, `intro`,
 * steps with optional gate and short labels, optional `details` [title,
 * body] rows, and source links). Any entry carrying a `state` renders the
 * Confidence Badge with its resolved source links, exactly as the route
 * identity claims do. Source ids resolve through the same pure
 * `resolveSources` query the identity card uses — no second URL-building
 * path. An empty or absent entry list renders the explicit empty state
 * (mono label + one proportional sentence — never blank space, DESIGN §5
 * Empty States / §6 Copywriting).
 *
 * Dumb component: props in, UI out. The panel splits are a rendering
 * decision — the detail views (and the F2 dashboard until Commit 11)
 * feed the same `getPanelEntries` data through this one anatomy, so the
 * F2 page and the deep pages must agree in every commit.
 */

import { h, type JSX } from "preact";
import { resolveSources } from "../content/query.ts";
import type { Army, Item, Lord, PanelGroup, TitleBody, UnitRow } from "../content/types.ts";
import { ConfidenceBadge } from "./ConfidenceBadge.ts";

/** The tab labels for the five fixed panel groups — the single label mapping (DESIGN §2). */
export const PANEL_LABELS: Readonly<Record<PanelGroup, string>> = {
  armies: "ARMY TEMPLATES",
  skills: "SKILLS",
  research: "RESEARCH",
  buildings: "SETTLEMENTS",
  mechanics: "MECHANICS",
};

/**
 * The empty-state sentences, one per panel group (DESIGN §6 Copywriting:
 * "explicit mono label + one proportional sentence", the "no content yet"
 * meaning). The mono empty label derives from the tab label in `panelContent`.
 */
export const PANEL_EMPTY_COPY: Readonly<Record<PanelGroup, string>> = {
  armies: "No army templates are listed for this route yet.",
  skills: "No skills are listed for this route yet.",
  research: "No research is listed for this route yet.",
  buildings: "No settlements are listed for this route yet.",
  mechanics: "No mechanics are listed for this route yet.",
};

/** The absent-column marker for an empty legendary/generic column (never blank). */
const EMPTY_COLUMN_MARKER = "NO UNITS LISTED";

export interface DeskPanelProps {
  /** The panel's Roman-numeral index (I–V, the desk card numbering). */
  readonly numeral: string;
  /** The panel group — drives the empty-state copy and the army/item anatomy branch. */
  readonly group: PanelGroup;
  /** The serif panel title (the desk card's serif titles). */
  readonly title: string;
  /**
   * The lord context — the anatomy renderers resolve dataset entry source ids
   * against its `data/sources.json` via `resolveSources`, the same pure read
   * the route identity card uses (no second URL-building path).
   */
  readonly lord: Lord;
  /** The group's resolved `panelOrder` entries (an empty list renders the explicit empty state). */
  readonly entries: readonly Army[] | readonly Item[];
}

/**
 * One numbered desk panel: the serif head — Roman-numeral index + serif
 * title — over the full item anatomy, or the explicit empty state when the
 * group's resolved entries are empty or absent. Never a blank panel.
 */
export function DeskPanel(props: DeskPanelProps): JSX.Element {
  const { numeral, group, title, lord, entries } = props;
  return h(
    "article",
    { className: "desk-panel" },
    h(
      "header",
      { className: "desk-panel__head" },
      h("p", { className: "desk-panel__index" }, numeral),
      h("h2", { className: "desk-panel__title" }, title),
    ),
    panelContent(group, lord, entries),
  );
}

/**
 * One panel's body: the explicit empty state when the group's resolved
 * entries are empty or absent, otherwise the DESIGN §4 per-group anatomy —
 * armies render per-army entries, the four item groups render per-item cards.
 * This is the body the F2 dashboard renders inside its tabpanels (moved
 * from `dashboard.ts` behaviour-identically), so both consumers share one
 * anatomy.
 */
export function panelContent(group: PanelGroup, lord: Lord, entries: readonly Army[] | readonly Item[]): JSX.Element {
  if (entries.length === 0) {
    return h(
      "div",
      { className: "dashboard-empty" },
      h("p", { className: "dashboard-empty__label" }, `NO ${PANEL_LABELS[group]} YET`),
      h("p", { className: "dashboard-empty__copy" }, PANEL_EMPTY_COPY[group]),
    );
  }
  if (group === "armies") {
    return h(
      "div",
      { className: "panel-armies" },
      (entries as readonly Army[]).map((army) => armyEntry(lord, army)),
    );
  }
  return h(
    "div",
    { className: "panel-items" },
    (entries as readonly Item[]).map((item) => itemEntry(lord, item)),
  );
}

/**
 * One army template entry (DESIGN §4 armies schema): label, name, the
 * optional supporting-army name, the Confidence Badge when the army carries a
 * state, the two unit columns (legendary-lord and generic-lord — the same
 * unit-row shape, an explicit absent marker for an empty column), then the
 * optional `context`, the `notes[]` and `plan` [title, body] rows, `size`,
 * and the resolved source links.
 */
function armyEntry(lord: Lord, army: Army): JSX.Element {
  return h(
    "article",
    { key: army.label, className: "panel-entry panel-entry--army" },
    h("h3", { className: "panel-entry__title" }, army.label),
    h("p", { className: "panel-entry__name" }, army.name),
    army.supportName === undefined ? null : h("p", { className: "panel-entry__support" }, army.supportName),
    army.state === undefined
      ? null
      : h(ConfidenceBadge, { state: army.state, sources: resolveSources(lord, army.src ?? []) }),
    h(
      "div",
      { className: "army-table" },
      unitColumn("LEGENDARY LORD", army.legendary),
      unitColumn("GENERIC LORD", army.generic),
    ),
    army.context === undefined ? null : h("p", { className: "panel-entry__context" }, army.context),
    titleBodyRows("NOTES", army.notes),
    titleBodyRows("PLAN", army.plan),
    h("p", { className: "panel-entry__size" }, `Size ${army.size}`),
    sourceLinks(lord, army.sources),
  );
}

/**
 * One unit column of an army template: the mono column heading, then the unit
 * rows (`n`, `name`, `role`, `kind` — the design system's ×N count next to
 * the unit name) or the explicit absent marker when the column lists nothing.
 */
function unitColumn(heading: string, rows: readonly UnitRow[]): JSX.Element {
  return h(
    "div",
    { className: "army-table__column" },
    h("p", { className: "army-table__column-label" }, heading),
    rows.length === 0
      ? h("p", { className: "army-table__absent" }, EMPTY_COLUMN_MARKER)
      : h(
          "ul",
          { className: "army-table__rows" },
          rows.map((row) =>
            h(
              "li",
              { key: `${row.name}-${row.n}`, className: "army-table__row" },
              h("span", { className: "army-table__n" }, `×${row.n}`),
              h("span", { className: "army-table__name" }, row.name),
              h("span", { className: "army-table__role" }, row.role),
              h("span", { className: "army-table__kind" }, row.kind),
            ),
          ),
        ),
  );
}

/**
 * One title/intro/steps item entry (DESIGN §4 items schema): label, the
 * Confidence Badge when the item carries a state, title, intro, the steps
 * (each step title + note with the optional gate and short labels on its
 * head line), the optional `details` [title, body] rows, and the resolved
 * source links.
 */
function itemEntry(lord: Lord, item: Item): JSX.Element {
  return h(
    "article",
    { key: item.label, className: "panel-entry panel-entry--item" },
    h("h3", { className: "panel-entry__title" }, item.label),
    item.state === undefined
      ? null
      : h(ConfidenceBadge, { state: item.state, sources: resolveSources(lord, item.src ?? []) }),
    h("p", { className: "panel-entry__name" }, item.title),
    h("p", { className: "panel-entry__intro" }, item.intro),
    h(
      "ol",
      { className: "item-steps" },
      item.steps.map((step) =>
        h(
          "li",
          { key: step.title, className: "item-step" },
          h(
            "div",
            { className: "item-step__head" },
            h("span", { className: "item-step__title" }, step.title),
            step.gate === undefined ? null : h("span", { className: "item-step__gate" }, step.gate),
            step.short === undefined ? null : h("span", { className: "item-step__short" }, step.short),
          ),
          h("p", { className: "item-step__note" }, step.note),
        ),
      ),
    ),
    item.details === undefined ? null : titleBodyRows("DETAILS", item.details),
    sourceLinks(lord, item.sources),
  );
}

/**
 * A titled block of [title, body] rows — the `notes[]` and `plan` of an
 * army, the optional `details` of an item. Renders nothing when the list is
 * empty, so absence leaves no trace.
 */
function titleBodyRows(label: string, rows: readonly TitleBody[]): JSX.Element | null {
  if (rows.length === 0) return null;
  return h(
    "div",
    { className: "panel-titlebody" },
    h("p", { className: "panel-titlebody__label" }, label),
    rows.map(([title, body], index) =>
      h(
        "div",
        { key: `${label}-${index}`, className: "panel-titlebody__row" },
        h("p", { className: "panel-titlebody__title" }, title),
        h("p", { className: "panel-titlebody__body" }, body),
      ),
    ),
  );
}

/**
 * The entry's resolved source links — one trailing `<a>` per source id, the
 * same `resolveSources` pure read the identity card and undercard use.
 */
function sourceLinks(lord: Lord, sourceIds: readonly string[]): JSX.Element | null {
  const sources = resolveSources(lord, sourceIds);
  if (sources.length === 0) return null;
  return h(
    "p",
    { className: "panel-entry__sources" },
    sources.map((source) =>
      h("a", { key: source.id, className: "panel-entry__src", href: source.url }, source.title),
    ),
  );
}
