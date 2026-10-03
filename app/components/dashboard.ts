/**
 * The dashboard region (feature DESIGN §2/§4/§6 — Panel selection and order,
 * Route page structure, Layout, Copywriting): one block of tabbed panels
 * mounted after the route sections. The tab bar carries the five fixed panel
 * groups in the DESIGN's panel order (armies, skills, research, buildings,
 * mechanics — derived from `PANEL_GROUPS`, with the label mapping kept in one
 * place here), exactly one panel is visible at a time, and selection is
 * component-local `useState` seeded at the first panel. The keyboard contract
 * (Left/Right wrap, Home/End bounds) reuses the route strip's `tabNav` helper
 * but changes the LOCAL selection only — no hash write, nothing persisted
 * (DESIGN §2 "The system must NOT persist any UI state"). The view keys the
 * dashboard by route id, so navigating between routes remounts it and resets
 * the selection to the first panel; a within-route section-anchor hash change
 * does not reset it.
 *
 * Each panel renders its group's resolved `panelOrder` entries
 * (`getPanelEntries`, Commit 7's pure query): an empty or absent list renders
 * the explicit empty state (mono label + one proportional sentence — never
 * blank space, DESIGN §5 Empty States / §6 Copywriting), while listed entries
 * render the DESIGN §4 atlas-mirroring anatomy — the armies panel as one
 * entry per army with its legendary-lord and generic-lord unit columns (the
 * same `n`/`name`/`role`/`kind` row shape, an explicit absent marker for an
 * empty column, optional `context`, the `notes[]` and `plan` [title, body]
 * rows, `size`, and source links), and the four item panels as one card per
 * item (`label`, `title`, `intro`, steps with optional gate and short labels,
 * optional `details` [title, body] rows, and source links). Any entry
 * carrying a `state` renders the Confidence Badge with its resolved source
 * links, exactly as the route identity claims do. Source ids resolve through
 * the same pure `resolveSources` query the identity card uses — no second
 * URL-building path.
 *
 * Seam: zero-DOM flatten. The hook-carrying `Dashboard` wraps the plain
 * `DashboardMarkup` VNode builder, so `node --test` can flatten and assert
 * the output without a DOM library (hooks only run when preact renders the
 * mounted wrapper) — the same seam as `TabStrip` (commit 4).
 */

import { h, type JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { PanelEntries } from "../content/query.ts";
import { resolveSources } from "../content/query.ts";
import {
  PANEL_GROUPS,
  type Army,
  type Item,
  type Lord,
  type PanelGroup,
  type TitleBody,
  type UnitRow,
} from "../content/types.ts";
import { ConfidenceBadge } from "./ConfidenceBadge.ts";
import { tabNav, type TabNavDirection } from "./TabStrip.ts";

/** The tab labels for the five fixed panel groups — the single label mapping (DESIGN §2). */
const PANEL_LABELS: Readonly<Record<PanelGroup, string>> = {
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
const PANEL_EMPTY_COPY: Readonly<Record<PanelGroup, string>> = {
  armies: "No army templates are listed for this route yet.",
  skills: "No skills are listed for this route yet.",
  research: "No research is listed for this route yet.",
  buildings: "No settlements are listed for this route yet.",
  mechanics: "No mechanics are listed for this route yet.",
};

/** The absent-column marker for an empty legendary/generic column (never blank). */
const EMPTY_COLUMN_MARKER = "NO UNITS LISTED";

export interface DashboardMarkupProps extends PanelEntries {
  /**
   * The lord context — the anatomy renderers resolve dataset entry source ids
   * against its `data/sources.json` via `resolveSources`, the same pure read
   * the route identity card uses (no second URL-building path).
   */
  readonly lord: Lord;
  /** The locally selected panel index (initial 0 = the first panel). */
  readonly activeIndex: number;
  /** Tab-bar ref the mounted wrapper queries to move focus after selection. */
  readonly barRef?: { current: HTMLElement | null };
  /** Tab-bar keyboard handler; the mounted wrapper supplies it, tests may omit it. */
  readonly onKeyDown?: (event: KeyboardEvent) => void;
  /** Tab click handler; the mounted wrapper supplies it, tests may omit it. */
  readonly onTabSelect?: (index: number) => void;
}

/**
 * The dashboard's pure VNode surface: a `role="tablist"` bar holding one
 * `role="tab"` button per fixed panel group in `PANEL_GROUPS` order (roving
 * tabindex — only the selected tab is tabbable, `aria-selected` marks it) and
 * one `role="tabpanel"` per group — exactly one visible (`hidden` on the
 * rest), each holding that group's panel content.
 */
export function DashboardMarkup(props: DashboardMarkupProps): JSX.Element {
  const { lord, activeIndex, barRef, onKeyDown, onTabSelect, ...panels } = props;
  return h(
    "section",
    { className: "dashboard", "aria-label": "Route dashboard" },
    h(
      "div",
      { className: "dashboard__tabbar", role: "tablist", "aria-label": "Panels", ref: barRef, onKeyDown },
      PANEL_GROUPS.map((group, index) =>
        h(
          "button",
          {
            key: group,
            type: "button",
            className: index === activeIndex ? "dashboard__tab dashboard__tab--active" : "dashboard__tab",
            role: "tab",
            id: `dashboard-tab-${group}`,
            "aria-selected": index === activeIndex,
            "aria-controls": `dashboard-panel-${group}`,
            tabIndex: index === activeIndex ? 0 : -1,
            onClick: onTabSelect === undefined ? undefined : () => onTabSelect(index),
          },
          PANEL_LABELS[group],
        ),
      ),
    ),
    PANEL_GROUPS.map((group, index) =>
      h(
        "div",
        {
          key: group,
          className: "dashboard__panel",
          id: `dashboard-panel-${group}`,
          role: "tabpanel",
          "aria-labelledby": `dashboard-tab-${group}`,
          hidden: index !== activeIndex,
        },
        panelContent(group, lord, panels[group]),
      ),
    ),
  );
}

/**
 * One panel's body: the explicit empty state when the group's resolved
 * entries are empty or absent (the committed tree's five panels), otherwise
 * the DESIGN §4 per-group anatomy — armies render per-army entries, the four
 * item groups render per-item cards.
 */
function panelContent(group: PanelGroup, lord: Lord, entries: readonly Army[] | readonly Item[]): JSX.Element {
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

const KEY_TO_DIRECTION: Readonly<Record<string, TabNavDirection>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  Home: "home",
  End: "end",
};

/**
 * The mounted component: selection is local `useState` seeded at the first
 * panel; keyboard and click change it only, never the hash. Focus follows the
 * selected tab after a selection change (roving-tabindex contract), but a
 * mount never steals focus from the skip link — the route strip's pattern.
 */
export function Dashboard(props: PanelEntries & { lord: Lord }): JSX.Element {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const barRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef<boolean>(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    barRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus();
  }, [activeIndex]);

  const onKeyDown = (event: KeyboardEvent): void => {
    const direction = KEY_TO_DIRECTION[event.key];
    if (direction === undefined) return;
    event.preventDefault();
    setActiveIndex(tabNav(direction, activeIndex, PANEL_GROUPS.length));
  };

  return h(DashboardMarkup, { ...props, activeIndex, barRef, onKeyDown, onTabSelect: setActiveIndex });
}
