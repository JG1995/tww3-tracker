/**
 * The three detail pages (feature DESIGN §2/§4/§5/§6 — Displayed Data, the
 * desk-panel anatomy, Empty States, Layout, Copywriting; package
 * `detail-pages-view`): presentational views over `{ lord, route }`, each
 * opening with the desk toolbar (the serif page title + the mono context
 * line "ROUTE <n> · <name>") and rendering exactly its DESIGN panel set in
 * the shared desk-panel anatomy (`deskPanel.ts`) — the armies page renders
 * armies + skills + research, the settlements page renders buildings, the
 * workshop page renders mechanics. The split is rendering-only: every panel
 * feeds the same `getPanelEntries(lord, route)` resolution, and an empty or
 * absent panel list renders the explicit empty state (never a blank panel).
 *
 * The armies page carries the panel tab strip (Armies | Skills | Research) —
 * the F2 dashboard's selection contract relocated: component-local
 * `useState` seeded at the first tab; the ARIA tabs pattern (role=tablist,
 * roving tabindex, Left/Right wrap, Home/End bound, focus follows the
 * selected tab after a selection change, but a mount never steals focus);
 * no hash segment, nothing persisted. The keyboard decision is the small
 * pure `panelTabNav` — the `tabNav` pattern copied locally because
 * `TabStrip.ts` is deleted in Commit 11 (the same recorded approach as the
 * Commit 10 header helper); this page survives that deletion.
 *
 * Seam: zero-DOM flatten. The hook-carrying `ArmiesAndSkillsView` wraps the
 * plain `ArmiesMarkup` VNode builder (the `Dashboard`/`DashboardMarkup`
 * precedent), so `node --test` can flatten and assert the tab strip and
 * panes without a DOM library; the single-panel settlements and workshop
 * pages carry no state and render directly. Routed at
 * `#/<lord>/armies|settlements|workshop/<route-id>`.
 */

import { h, type JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { getPanelEntries } from "../content/query.ts";
import type { Lord, PanelGroup, Route } from "../content/types.ts";
import { DeskPanel } from "../components/deskPanel.ts";

type TabNavDirection = "left" | "right" | "home" | "end";

/**
 * The roving-tabindex decision function (the ARIA tabs pattern): Left/Right
 * wrap around the strip's ends, Home lands on the first tab, End on the
 * last. Pure and exported so `node --test` can prove the decision logic
 * without a DOM; the armies view changes its component-local selection
 * only — no hash write.
 */
export function panelTabNav(direction: TabNavDirection, activeIndex: number, count: number): number {
  if (direction === "home") return 0;
  if (direction === "end") return count - 1;
  if (direction === "left") return (activeIndex - 1 + count) % count;
  return (activeIndex + 1) % count;
}

/** One desk panel's fixed spec: the Roman index, the panel group, and the serif title. */
interface PanelSpec {
  readonly numeral: string;
  readonly group: PanelGroup;
  readonly title: string;
}

/**
 * The five panel specs, in the desk cards' I–V numbering (DESIGN §2): the
 * detail pages render their per-page slices of this fixed set — armies
 * I–III, settlements IV, workshop V — so the deep view carries the same
 * numerals and serif titles as the desk grid.
 */
const PANEL_SPECS: Readonly<Record<PanelGroup, PanelSpec>> = {
  armies: { numeral: "I", group: "armies", title: "Army templates" },
  skills: { numeral: "II", group: "skills", title: "Lord & hero skills" },
  research: { numeral: "III", group: "research", title: "Research priorities" },
  buildings: { numeral: "IV", group: "buildings", title: "Settlement builds" },
  mechanics: { numeral: "V", group: "mechanics", title: "Unique mechanics" },
};

/** The armies page's three panels in tab order (the DESIGN's armies/skills/research split). */
const ARMIES_PANELS: readonly PanelSpec[] = [
  PANEL_SPECS.armies,
  PANEL_SPECS.skills,
  PANEL_SPECS.research,
];

/** The armies page's tab labels, in tab order (the packet's fixed copy). */
const ARMIES_TAB_LABELS: readonly string[] = ["Armies", "Skills", "Research"];

/**
 * The desk toolbar (DESIGN §6 "Panel pages: desk-toolbar (page title +
 * context line ...)"): the serif page title over the mono context line
 * "ROUTE <n> · <name>" — the shared head of all three detail pages.
 */
function pageToolbar(title: string, route: Route): JSX.Element {
  return h(
    "header",
    { className: "panel-page__toolbar" },
    h("h1", { className: "panel-page__title" }, title),
    h("p", { className: "panel-page__context" }, `ROUTE ${route.number} · ${route.name}`),
  );
}

/** One numbered desk panel in the full anatomy over its resolved entries. */
function fullPanel(lord: Lord, spec: PanelSpec, entries: ReturnType<typeof getPanelEntries>[PanelGroup]): JSX.Element {
  return h(DeskPanel, { numeral: spec.numeral, group: spec.group, title: spec.title, lord, entries });
}

export interface ArmiesMarkupProps {
  readonly lord: Lord;
  /** The resolved route — the armies page is route-scoped; the caller always supplies it. */
  readonly route: Route;
  /** The component-local tab index (initial 0 = the first tab, armies). */
  readonly activeTab: number;
  /** Tab-bar ref the mounted wrapper queries to move focus after selection. */
  readonly tabRef?: { current: HTMLElement | null };
  /** Tab-bar keyboard handler; the mounted wrapper supplies it, tests may omit it. */
  readonly onKeyDown?: (event: KeyboardEvent) => void;
  /** Tab click handler; the mounted wrapper supplies it, tests may omit it. */
  readonly onTabSelect?: (index: number) => void;
}

/**
 * The armies page's pure VNode surface: the toolbar, a `role="tablist"` bar
 * holding one `role="tab"` button per panel in tab order (roving tabindex —
 * only the selected tab is tabbable, `aria-selected` marks it), and one
 * `role="tabpanel"` per panel — exactly one visible (`hidden` on the rest),
 * each holding that panel's full anatomy.
 */
export function ArmiesMarkup(props: ArmiesMarkupProps): JSX.Element {
  const { lord, route, activeTab, tabRef, onKeyDown, onTabSelect } = props;
  const panels = getPanelEntries(lord, route);
  return h(
    "article",
    { className: "panel-page" },
    pageToolbar("Armies & skills", route),
    h(
      "div",
      { className: "panel-page__tabbar", role: "tablist", "aria-label": "Panels", ref: tabRef, onKeyDown },
      ARMIES_PANELS.map((spec, index) =>
        h(
          "button",
          {
            key: spec.group,
            type: "button",
            className: index === activeTab ? "panel-page__tab panel-page__tab--active" : "panel-page__tab",
            role: "tab",
            id: `armies-tab-${spec.group}`,
            "aria-selected": index === activeTab,
            "aria-controls": `armies-panel-${spec.group}`,
            tabIndex: index === activeTab ? 0 : -1,
            onClick: onTabSelect === undefined ? undefined : () => onTabSelect(index),
          },
          ARMIES_TAB_LABELS[index],
        ),
      ),
    ),
    ARMIES_PANELS.map((spec, index) =>
      h(
        "div",
        {
          key: spec.group,
          className: "panel-page__tabpanel",
          id: `armies-panel-${spec.group}`,
          role: "tabpanel",
          "aria-labelledby": `armies-tab-${spec.group}`,
          hidden: index !== activeTab,
        },
        fullPanel(lord, spec, panels[spec.group]),
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
 * The mounted armies page: the tab selection is component-local `useState`
 * seeded at the first tab (armies); keyboard and click change it only, never
 * the hash. Focus follows the selected tab after a selection change
 * (roving-tabindex contract), but a mount never steals focus from the skip
 * link — the F2 dashboard's pattern.
 */
export function ArmiesAndSkillsView(props: { lord: Lord; route: Route }): JSX.Element {
  const [activeTab, setActiveTab] = useState<number>(0);
  const tabRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef<boolean>(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    tabRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus();
  }, [activeTab]);

  const onKeyDown = (event: KeyboardEvent): void => {
    const direction = KEY_TO_DIRECTION[event.key];
    if (direction === undefined) return;
    event.preventDefault();
    setActiveTab(panelTabNav(direction, activeTab, ARMIES_PANELS.length));
  };

  return h(ArmiesMarkup, { ...props, activeTab, tabRef, onKeyDown, onTabSelect: setActiveTab });
}

/**
 * The settlements page — "Settlements & economy": the toolbar over the
 * buildings panel (desk numeral IV) in the full anatomy. No local state.
 */
export function SettlementsView(props: { lord: Lord; route: Route }): JSX.Element {
  const { lord, route } = props;
  return h(
    "article",
    { className: "panel-page" },
    pageToolbar("Settlements & economy", route),
    fullPanel(lord, PANEL_SPECS.buildings, getPanelEntries(lord, route).buildings),
  );
}

/**
 * The workshop page — "Faction workshop": the toolbar over the mechanics
 * panel (desk numeral V) in the full anatomy. No local state.
 */
export function WorkshopView(props: { lord: Lord; route: Route }): JSX.Element {
  const { lord, route } = props;
  return h(
    "article",
    { className: "panel-page" },
    pageToolbar("Faction workshop", route),
    fullPanel(lord, PANEL_SPECS.mechanics, getPanelEntries(lord, route).mechanics),
  );
}
