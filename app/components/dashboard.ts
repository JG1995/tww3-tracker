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
 * land in a plain count placeholder until the panel-items commit replaces it
 * with the per-group atlas anatomy (Commit 8).
 *
 * Seam: zero-DOM flatten. The hook-carrying `Dashboard` wraps the plain
 * `DashboardMarkup` VNode builder, so `node --test` can flatten and assert
 * the output without a DOM library (hooks only run when preact renders the
 * mounted wrapper) — the same seam as `TabStrip` (commit 4).
 */

import { h, type JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { PanelEntries } from "../content/query.ts";
import { PANEL_GROUPS, type Army, type Item, type PanelGroup } from "../content/types.ts";
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

export interface DashboardMarkupProps extends PanelEntries {
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
  const { activeIndex, barRef, onKeyDown, onTabSelect, ...panels } = props;
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
        panelContent(group, panels[group]),
      ),
    ),
  );
}

/**
 * One panel's body: the explicit empty state when the group's resolved
 * entries are empty or absent (the committed tree's five panels), otherwise a
 * plain count placeholder — the clean seam the panel-items commit replaces
 * with the per-group renderers (army templates vs title/intro/steps items).
 */
function panelContent(group: PanelGroup, entries: readonly Army[] | readonly Item[]): JSX.Element {
  if (entries.length === 0) {
    return h(
      "div",
      { className: "dashboard-empty" },
      h("p", { className: "dashboard-empty__label" }, `NO ${PANEL_LABELS[group]} YET`),
      h("p", { className: "dashboard-empty__copy" }, PANEL_EMPTY_COPY[group]),
    );
  }
  return h(
    "p",
    { className: "dashboard-panel__placeholder" },
    `${entries.length} ${entries.length === 1 ? "entry" : "entries"} listed`,
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
export function Dashboard(props: PanelEntries): JSX.Element {
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
