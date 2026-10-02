/**
 * Route tab strip (feature DESIGN §2 "Route tab strip", §6 copywriting;
 * DESIGN.md "Route Tab Strip"): the Shared tab plus one tab per manifest
 * route, in manifest order, mounted at the top of lord and route pages.
 * The active tab is derived from the `activeId` prop — `"shared"` or a
 * route id — which the views derive from the hash route; the strip stores
 * no tab state and performs no I/O. Links target the existing hash routes
 * and set `window.location.hash`, the single source of truth (DESIGN §2
 * "The hash is the only restored state").
 *
 * The keyboard contract is the ARIA tabs pattern (roving tabindex,
 * Left/Right with wrap, Home/End bounded): the pure exported `tabNav`
 * decides the next index, the keydown handler writes that tab's href to the
 * hash, and a ref/effect moves DOM focus to the newly active tab after the
 * re-render (the first mount never steals focus — the skip link stays first
 * in DOM, DESIGN.md Pre-Delivery Checklist).
 *
 * Seam: zero-DOM flatten. The hook-carrying `TabStrip` wraps the plain
 * `TabStripMarkup` VNode builder, so `node --test` can flatten and assert
 * the strip's output without a DOM library (hooks only run when preact
 * renders the mounted wrapper).
 */

import { h, type JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import type { Route } from "../content/types.ts";

export interface TabStripProps {
  readonly lordSlug: string;
  /** The lord's routes in manifest order (the order of `lord.routes`). */
  readonly routes: readonly Route[];
  /** `"shared"` or a route id, derived from the hash by the calling view. */
  readonly activeId: string;
}

/** One tab of the strip: the Shared tab, or one manifest route. */
type TabItem =
  | { readonly kind: "shared"; readonly id: "shared"; readonly href: string }
  | {
      readonly kind: "route";
      readonly id: string;
      readonly href: string;
      /** The mono uppercase route code (I/II/III). */
      readonly code: string;
      /** The proportional route title (the guide-created thematic subtitle). */
      readonly title: string;
      /** Official VCO title, or `null` until researched (renders the explicit marker). */
      readonly vcoTitle: string | null;
    };

/** The strip's tab list: Shared first, then the manifest routes in manifest order. */
function tabItems(lordSlug: string, routes: readonly Route[]): readonly TabItem[] {
  return [
    { kind: "shared", id: "shared", href: `#/${lordSlug}` },
    ...routes.map((route): TabItem => ({
      kind: "route",
      id: route.id,
      href: `#/${lordSlug}/route/${route.id}`,
      code: route.number,
      title: route.name,
      vcoTitle: route.vcoTitle,
    })),
  ];
}

export type TabNavDirection = "left" | "right" | "home" | "end";

/**
 * The roving-tabindex decision function (ARIA tabs pattern, DESIGN §2 Route
 * tab strip): Left/Right wrap around the strip's ends, Home lands on the
 * first tab, End on the last. Pure and exported so `node --test` can prove
 * the decision logic without a DOM; the caller changes the hash, which
 * re-derives the active tab.
 */
export function tabNav(direction: TabNavDirection, activeIndex: number, count: number): number {
  if (direction === "home") return 0;
  if (direction === "end") return count - 1;
  if (direction === "left") return (activeIndex - 1 + count) % count;
  return (activeIndex + 1) % count;
}

/** The tablist's pure VNode surface: what the mounted wrapper and the tests render. */
export interface TabStripMarkupProps extends TabStripProps {
  /** Container ref the mounted wrapper queries to move focus after render. */
  readonly stripRef?: { current: HTMLElement | null };
  /** Keyboard handler; the mounted wrapper supplies it, tests may omit it. */
  readonly onKeyDown?: (event: KeyboardEvent) => void;
}

/**
 * The strip markup: a `role="tablist"` container holding one `<a role="tab">`
 * per tab. Roving tabindex: only the active tab is tabbable (`tabIndex` 0),
 * the rest are `-1`; `aria-selected` marks the hash-derived active tab.
 */
export function TabStripMarkup(props: TabStripMarkupProps): JSX.Element {
  const { lordSlug, routes, activeId, stripRef, onKeyDown } = props;
  return h(
    "div",
    {
      className: "route-tab-strip",
      role: "tablist",
      "aria-label": "Routes",
      ref: stripRef,
      onKeyDown,
    },
    tabItems(lordSlug, routes).map((tab) =>
      h(
        "a",
        {
          key: tab.id,
          className: tab.id === activeId ? "route-tab route-tab--active" : "route-tab",
          href: tab.href,
          role: "tab",
          "aria-selected": tab.id === activeId,
          tabIndex: tab.id === activeId ? 0 : -1,
        },
        tabBody(tab),
      ),
    ),
  );
}

/**
 * Tab content per DESIGN §6: the mono uppercase route code (label-md) and the
 * proportional route title on one line, with the official VCO title dimmed
 * beneath — or the explicit unresearched marker when `vcoTitle` is null. The
 * Shared tab is a single mono uppercase "SHARED" label.
 */
function tabBody(tab: TabItem): JSX.Element | readonly JSX.Element[] {
  if (tab.kind === "shared") {
    return h("span", { className: "route-tab__code" }, "SHARED");
  }
  return [
    h(
      "span",
      { className: "route-tab__label" },
      h("span", { className: "route-tab__code" }, tab.code),
      h("span", { className: "route-tab__title" }, tab.title),
    ),
    h("span", { className: "route-tab__vco" }, tab.vcoTitle ?? "UNRESEARCHED"),
  ];
}

const KEY_TO_DIRECTION: Readonly<Record<string, TabNavDirection>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  Home: "home",
  End: "end",
};

/** The mounted component: keyboard → hash, and focus follows the active tab. */
export function TabStrip(props: TabStripProps): JSX.Element {
  const { lordSlug, routes, activeId } = props;
  const stripRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef<boolean>(true);
  const tabs = tabItems(lordSlug, routes);
  const activeIndex = tabs.findIndex((tab) => tab.id === activeId);

  // Roving focus with the hash as the single source of truth: after the hash
  // change re-renders the strip, move DOM focus onto the newly active tab so
  // arrow navigation keeps the keyboard contract. The first mount is skipped
  // so a page load never hijacks focus from the skip link.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const active = stripRef.current?.querySelector<HTMLAnchorElement>('[role="tab"][aria-selected="true"]');
    active?.focus();
  }, [activeId]);

  const onKeyDown = (event: KeyboardEvent): void => {
    const direction = KEY_TO_DIRECTION[event.key];
    if (direction === undefined) return;
    event.preventDefault();
    const next = tabNav(direction, activeIndex, tabs.length);
    window.location.hash = tabs[next].href;
  };

  return h(TabStripMarkup, { lordSlug, routes, activeId, stripRef, onKeyDown });
}
