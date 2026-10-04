/**
 * The dashboard region (feature DESIGN §2/§4/§6 — Panel selection and order,
 * Route page structure, Layout, Copywriting): one block of tabbed panels
 * mounted after the route sections. The tab bar carries the five fixed panel
 * groups in the DESIGN's panel order (armies, skills, research, buildings,
 * mechanics — derived from `PANEL_GROUPS`, with the `PANEL_LABELS` mapping
 * imported from `deskPanel.ts`), exactly one panel is visible at a time, and
 * selection is component-local `useState` seeded at the first panel. The
 * keyboard contract (Left/Right wrap, Home/End bounds) reuses the route
 * strip's `tabNav` helper but changes the LOCAL selection only — no hash
 * write, nothing persisted (DESIGN §2 "The system must NOT persist any UI
 * state"). The view keys the dashboard by route id, so navigating between
 * routes remounts it and resets the selection to the first panel; a
 * within-route section-anchor hash change does not reset it.
 *
 * The panel bodies render through the shared desk-panel anatomy in
 * `deskPanel.ts` (package `detail-pages-view`): each group's resolved
 * `panelOrder` entries (`getPanelEntries`, Commit 7's pure query) render the
 * DESIGN §4 atlas-mirroring anatomy — armies as per-army entries with the
 * legendary-lord and generic-lord unit columns, the four item groups as
 * per-item cards — with the explicit empty state for an empty or absent
 * list. The anatomy MOVED out of this module behaviour-identically, so the
 * F2 page keeps rendering unchanged until Commit 11 retires it; the deep
 * detail pages feed the same anatomy.
 *
 * Seam: zero-DOM flatten. The hook-carrying `Dashboard` wraps the plain
 * `DashboardMarkup` VNode builder, so `node --test` can flatten and assert
 * the output without a DOM library (hooks only run when preact renders the
 * mounted wrapper) — the same seam as `TabStrip` (commit 4).
 */

import { h, type JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { PanelEntries } from "../content/query.ts";
import { PANEL_GROUPS, type Lord } from "../content/types.ts";
import { PANEL_LABELS, panelContent } from "./deskPanel.ts";
import { tabNav, type TabNavDirection } from "./TabStrip.ts";

export interface DashboardMarkupProps extends PanelEntries {
  /**
   * The lord context — the panel anatomy resolves dataset entry source ids
   * against its `data/sources.json` via `resolveSources` (deskPanel.ts).
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
 * rest), each holding that group's panel content from `deskPanel.ts`.
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
