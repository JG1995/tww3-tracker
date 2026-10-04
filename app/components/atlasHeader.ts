/**
 * The atlas shell header (feature DESIGN §2/§3/§4/§6; package
 * `atlas-header-shell`, Commit 10): the sticky three-tier header rendered by
 * `main.tsx` over a hash route member, with every visible state derived from
 * the hash + the immutable content tree — no component state for selection.
 *
 * Two forms (DESIGN §4 "The shell renders two header forms"): the SLIM form
 * (home, not-found, boot loading/error) carries the wordmark plus one link
 * per lord to `#/<lord>`; the FULL form (every lord-scoped page) carries the
 * three tiers — the topline (crest + brand + environment line + the empty
 * reserved toolbar slot), the routebar ("YOUR CAMPAIGN / Victory route"
 * eyebrow pair + one route tab per manifest route, SELECTED derived from the
 * hash), and the pagenav (the DESIGN's generic eight page tabs + the static
 * save-state line "Saved locally · offline").
 *
 * Selection rules (DESIGN §2 rule 3 + the recorded decisions): route tabs are
 * route switches that KEEP THE PAGE — from a route-scoped member (a route
 * page, or the desk including the `#/<lord>` default-route desk) they target
 * `<page>/<new-route>`; from the lord pages they target `plan/<new-route>`.
 * Page tabs from a lord-scoped member with no route in the hash resolve the
 * lord's first manifest route. A lord page (`sources`/`notes`) carries no
 * route in the hash, so the routebar renders no selection there (DESIGN §4
 * "lord-scoped pages render no route selection"); its route tabs still rove
 * from the first tab so the tablist stays keyboard-reachable without ever
 * claiming a selection the hash does not carry.
 *
 * The keyboard contract is the F2 TabStrip idiom (role=tablist, roving
 * tabindex, Left/Right wrap, Home/End bounded, focus follows the selection,
 * the first mount never steals focus): both tablists share the pure `tabNav`
 * decision helper — a LOCAL copy of the TabStrip one, because TabStrip.ts is
 * deleted in Commit 11 and this module must not import from a doomed file
 * (the temporary duplication is recorded in the ledger and dies with Commit
 * 11).
 *
 * Seam: zero-DOM flatten. The hook-carrying `AtlasHeader` wraps the plain
 * `AtlasHeaderMarkup` VNode builder, so `node --test` can flatten and assert
 * the header's output without a DOM library (the `TabStripMarkup` precedent;
 * hooks only run when preact renders the mounted wrapper).
 */

import { h, type JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import type { Lord } from "../content/types.ts";
import type { LordPage, RoutePage } from "../router.ts";

/**
 * The three lord-scoped route members the FULL header renders for (DESIGN
 * §2). The router's member types plus the desk's optional route id — the
 * header never sees `home`/`not-found` (the slim form is the callers'
 * answer), and `route-page`'s section id is irrelevant to the chrome.
 */
export type HeaderRoute =
  | { readonly name: "desk"; readonly lordSlug: string; readonly routeId: string | null }
  | { readonly name: "lord-page"; readonly lordSlug: string; readonly page: LordPage }
  | { readonly name: "route-page"; readonly lordSlug: string; readonly page: RoutePage; readonly routeId: string };

/** The props both the mounted header and its markup seam share. */
export interface AtlasHeaderProps {
  /** Every lord — the slim form's links to `#/<slug>`; empty during boot states. */
  readonly lords: readonly Lord[];
  /** The resolved lord of the current page; null renders the slim form (home, not-found, boot). */
  readonly lord: Lord | null;
  /** The current route member; null renders the slim form. */
  readonly route: HeaderRoute | null;
}

/** The markup seam: the same props plus the two tablists' focus/handler wiring. */
export interface AtlasHeaderMarkupProps extends AtlasHeaderProps {
  /** The routebar tablist ref (the mounted wrapper queries it to move focus after a keyboard selection). */
  readonly routebarRef?: { current: HTMLElement | null };
  readonly routebarOnKeyDown?: (event: KeyboardEvent) => void;
  /** The pagenav tablist ref (same purpose). */
  readonly pagenavRef?: { current: HTMLElement | null };
  readonly pagenavOnKeyDown?: (event: KeyboardEvent) => void;
}

/**
 * DESIGN §2 rule 3 made mechanical: the route-tab href for the current route
 * member and a target route id. From a route-scoped member (a route page, or
 * a desk — including the `#/<lord>` default-route desk, recorded decision)
 * the tab keeps the SAME page under the new route; from a lord page it
 * targets `plan/<new-route>`. A section anchor never survives a route switch
 * (rule 3 keeps the page, not the section). This helper is the review
 * surface for the "same page under the new route" and first-manifest-route
 * resolution rules.
 */
export function routeTabHref(route: HeaderRoute, targetRouteId: string): string {
  return `#/${route.lordSlug}/${routeTabPage(route)}/${targetRouteId}`;
}

/** The route-tab page segment the current member keeps (DESIGN rule 3). */
function routeTabPage(route: HeaderRoute): RoutePage | "plan" {
  switch (route.name) {
    case "desk":
      return "desk";
    case "route-page":
      return route.page;
    case "lord-page":
      return "plan";
  }
}

export type TabNavDirection = "left" | "right" | "home" | "end";

/**
 * The roving-tabindex decision function (the F2 TabStrip contract, ARIA tabs
 * pattern): Left/Right wrap around the strip's ends, Home lands on the first
 * tab, End on the last. The header's own copy of the TabStrip helper — pure
 * and exported so `node --test` pins the decision logic, and the proof that
 * survives once TabStrip.ts is deleted in Commit 11.
 */
export function tabNav(direction: TabNavDirection, activeIndex: number, count: number): number {
  if (direction === "home") return 0;
  if (direction === "end") return count - 1;
  if (direction === "left") return (activeIndex - 1 + count) % count;
  return (activeIndex + 1) % count;
}

/** One tab's keyboard navigation data — the shared input to the roving handler. */
interface HeaderTab {
  readonly id: string;
  readonly href: string;
}

/** The DESIGN §2/§6 generic eight page tabs, in fixed order (never the atlas's faction-specific names). */
const PAGE_TABS: readonly { readonly segment: RoutePage | LordPage; readonly label: string }[] = [
  { segment: "desk", label: "Reference desk" },
  { segment: "plan", label: "Route plan" },
  { segment: "armies", label: "Armies & skills" },
  { segment: "settlements", label: "Settlements & economy" },
  { segment: "workshop", label: "Faction workshop" },
  { segment: "ledger", label: "VCO ledger" },
  { segment: "notes", label: "Field notes" },
  { segment: "sources", label: "Sources & settings" },
];

/** The lord's first manifest route id — the deterministic default (DESIGN §2). */
function firstRouteId(lord: Lord): string {
  return lord.routes[0].id;
}

/**
 * The resolved route id every full-header href reads (DESIGN §2 rule 3): the
 * hash's own route id, or — when the hash carries none — the lord's first
 * manifest route, the atlas's own default (never a hidden guess). A lord
 * page carries no route in the hash, so its resolved id only ever feeds
 * hrefs, never a selection (see `selectedRouteId`).
 */
function resolvedRouteId(lord: Lord, route: HeaderRoute): string {
  if (route.name === "route-page") return route.routeId;
  return route.name === "desk" ? (route.routeId ?? firstRouteId(lord)) : firstRouteId(lord);
}

/**
 * The SELECTED route id: the hash's route, or the resolved first manifest
 * route for the default-route desk at `#/<lord>` (recorded decision — the
 * desk is route-scoped; the routebar must show the resolved selection). A
 * lord page carries no route in the hash, so the routebar renders no
 * selection there (DESIGN §4) — null.
 */
function selectedRouteId(lord: Lord, route: HeaderRoute): string | null {
  return route.name === "lord-page" ? null : resolvedRouteId(lord, route);
}

/** The pagenav's SELECTED page segment, read from the route member only. */
function selectedPage(route: HeaderRoute): string {
  return route.name === "desk" ? "desk" : route.page;
}

/**
 * The pagenav href for one page tab (DESIGN §2/§6): the two lord pages
 * (`notes`/`sources`) are the grammar's 2-segment shapes `#/<lord>/<page>`
 * — a route suffix would land them in not-found; the six route pages carry
 * the resolved route id, `#/<lord>/<page>/<resolved>` (rule 3). The branch
 * is the `RoutePage | LordPage` union of the `PAGE_TABS` entries.
 */
function pageTabHref(lordSlug: string, page: RoutePage | LordPage, resolved: string): string {
  return page === "notes" || page === "sources" ? `#/${lordSlug}/${page}` : `#/${lordSlug}/${page}/${resolved}`;
}

/** One route tab's rendering data: the rule-3 href plus the route's label line. */
interface RouteTabItem extends HeaderTab {
  readonly number: string;
  readonly name: string;
  readonly vcoTitle: string | null;
}

function routeTabItems(lord: Lord, route: HeaderRoute): readonly RouteTabItem[] {
  return lord.routes.map((r) => ({
    id: r.id,
    href: routeTabHref(route, r.id),
    number: r.number,
    name: r.name,
    vcoTitle: r.vcoTitle,
  }));
}

/** `patch <X> · VCO <version>`, always together (DESIGN.md Value & Number Formatting). */
function versionLabel(lord: Lord): string {
  return `patch ${lord.guide.version.patch} · VCO ${lord.guide.version.vco}`;
}

/**
 * The topline tier (DESIGN §2): the crest (the boot-validated `crestSvg`
 * inlined `aria-hidden`; an absent crest renders the brand WITHOUT it, never
 * a placeholder box), the brand (faction uppercase / the serif "EXPEDITION
 * ATLAS · <lord>" title) linking to `#/<lord>`, the environment line (the
 * status dot + `guide.environment` when present, plus the patch/VCO pairing
 * that always renders — the reduced form omits the string, not the line),
 * and the empty toolbar slot (no buttons — reserved for F6/search and state
 * export).
 */
function topline(lord: Lord): JSX.Element {
  return h(
    "div",
    { className: "topline" },
    lord.crestSvg === undefined
      ? null
      : h("span", { className: "topline__crest", "aria-hidden": true, dangerouslySetInnerHTML: { __html: lord.crestSvg } }),
    h(
      "a",
      { className: "topline__brand", href: `#/${lord.slug}` },
      h("span", { className: "topline__faction" }, lord.guide.faction.toUpperCase()),
      h("span", { className: "topline__title" }, `EXPEDITION ATLAS · ${lord.guide.lord}`),
    ),
    h(
      "div",
      { className: "topline__env" },
      h("span", { className: "topline__dot", "aria-hidden": true }),
      lord.guide.environment === undefined
        ? null
        : h("span", { className: "topline__environment" }, lord.guide.environment),
      h("span", { className: "topline__version" }, versionLabel(lord)),
    ),
    h("div", { className: "topline__tools" }),
  );
}

/**
 * The routebar tier (DESIGN §2): the "YOUR CAMPAIGN / Victory route" eyebrow
 * pair plus one `role="tab"` per manifest route — serif numeral, route name,
 * and the official VCO title dimmed beneath (or the explicit UNRESEARCHED
 * marker when `vcoTitle` is null); the SELECTED indicator and every href are
 * hash-derived (rule 3). The tablist follows the TabStrip keyboard contract.
 */
function routebar(
  lord: Lord,
  route: HeaderRoute,
  selected: string | null,
  ref?: { current: HTMLElement | null },
  onKeyDown?: (event: KeyboardEvent) => void,
): JSX.Element {
  const tabs = routeTabItems(lord, route);
  return h(
    "div",
    { className: "routebar" },
    h(
      "div",
      { className: "routebar__eyebrows" },
      h("p", { className: "routebar__eyebrow" }, "YOUR CAMPAIGN"),
      h("p", { className: "routebar__eyebrow" }, "Victory route"),
    ),
    h(
      "div",
      { className: "routebar__tabs", role: "tablist", "aria-label": "Routes", ref, onKeyDown },
      tabs.map((tab, index) =>
        h(
          "a",
          {
            key: tab.id,
            className: tab.id === selected ? "routebar__tab routebar__tab--active" : "routebar__tab",
            href: tab.href,
            role: "tab",
            "aria-selected": tab.id === selected,
            // Roving tabindex: the selected tab is tabbable; with no route in
            // the hash the strip's first tab starts the rove, so the tablist
            // stays keyboard-reachable without claiming a selection.
            tabIndex: (index === 0 && selected === null) || tab.id === selected ? 0 : -1,
          },
          h(
            "span",
            { className: "routebar__tab-label" },
            h("span", { className: "routebar__tab-numeral" }, tab.number),
            h("span", { className: "routebar__tab-name" }, tab.name),
          ),
          h(
            "span",
            {
              className:
                tab.vcoTitle === null ? "routebar__tab-vco routebar__tab-vco--unresearched" : "routebar__tab-vco",
            },
            tab.vcoTitle ?? "UNRESEARCHED",
          ),
        ),
      ),
    ),
  );
}

/**
 * The pagenav tier (DESIGN §2/§6): the DESIGN's generic eight page tabs with
 * the hash-derived selection; every href resolves the member's route — the
 * hash's own id, or the first manifest route from a lord page (rule 3; the
 * VCO ledger tab targets `ledger/<route>` like the others) — plus the static
 * save-state line "Saved locally · offline" (the rendered atlas string; it
 * claims nothing about autosave). The six route-page tabs are the 3-segment
 * `#/<lord>/<page>/<resolved>` shapes; the two lord-page tabs (`notes`/
 * `sources`) are the grammar's 2-segment `#/<lord>/<page>` shapes. Same
 * TabStrip keyboard contract.
 */
function pagenav(
  route: HeaderRoute,
  selected: string,
  resolved: string,
  ref?: { current: HTMLElement | null },
  onKeyDown?: (event: KeyboardEvent) => void,
): JSX.Element {
  return h(
    "div",
    { className: "pagenav" },
    h(
      "div",
      { className: "pagenav__tabs", role: "tablist", "aria-label": "Pages", ref, onKeyDown },
      PAGE_TABS.map((page) =>
        h(
          "a",
          {
            key: page.segment,
            className: page.segment === selected ? "pagenav__tab pagenav__tab--active" : "pagenav__tab",
            href: pageTabHref(route.lordSlug, page.segment, resolved),
            role: "tab",
            "aria-selected": page.segment === selected,
            tabIndex: page.segment === selected ? 0 : -1,
          },
          page.label,
        ),
      ),
    ),
    h("p", { className: "pagenav__savestate" }, "Saved locally · offline"),
  );
}

/** The slim form (home, not-found, boot states): the wordmark + one link per lord to `#/<lord>`. */
function slimMarkup(lords: readonly Lord[]): JSX.Element {
  return h(
    "header",
    { className: "atlas-header atlas-header--slim" },
    h(
      "div",
      { className: "atlas-header__wrap" },
      h("p", { className: "atlas-header__wordmark" }, "VCO COMPANION"),
      lords.length === 0
        ? null
        : h(
            "nav",
            { className: "atlas-header__lords", "aria-label": "Lords" },
            lords.map((lord) =>
              h(
                "a",
                { key: lord.slug, className: "atlas-header__lord", href: `#/${lord.slug}` },
                lord.guide.lord,
              ),
            ),
          ),
    ),
  );
}

/** The full form: the three tiers inside the atlas measure. */
function fullMarkup(lord: Lord, route: HeaderRoute, props: AtlasHeaderMarkupProps): JSX.Element {
  const { routebarRef, routebarOnKeyDown, pagenavRef, pagenavOnKeyDown } = props;
  const selected = selectedRouteId(lord, route);
  const resolved = resolvedRouteId(lord, route);
  return h(
    "header",
    { className: "atlas-header atlas-header--full" },
    h(
      "div",
      { className: "atlas-header__wrap" },
      topline(lord),
      routebar(lord, route, selected, routebarRef, routebarOnKeyDown),
      pagenav(route, selectedPage(route), resolved, pagenavRef, pagenavOnKeyDown),
    ),
  );
}

/**
 * The header's pure VNode surface: the slim form when no lord/route member is
 * supplied (home, not-found, boot), the full three-tier form otherwise.
 */
export function AtlasHeaderMarkup(props: AtlasHeaderMarkupProps): JSX.Element {
  const { lords, lord, route } = props;
  return lord === null || route === null ? slimMarkup(lords) : fullMarkup(lord, route, props);
}

const KEY_TO_DIRECTION: Readonly<Record<string, TabNavDirection>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  Home: "home",
  End: "end",
};

/**
 * The mounted header: the TabStrip keyboard contract (keyboard → hash on
 * both tablists) plus the focus-follow effect. After a keyboard selection
 * changes the hash, the re-render moves DOM focus onto the newly selected
 * tab of the strip that dispatched the navigation (recorded on keydown, not
 * inferred from which selection changed — a lord-page → route-page
 * navigation changes BOTH tablists' selections at once); the first mount is
 * skipped so a page load never hijacks focus from the skip link (DESIGN
 * Pre-Delivery Checklist). Everything else is pure derivation from the route
 * member + the content tree — no `useState` for selection.
 */
export function AtlasHeader(props: AtlasHeaderProps): JSX.Element {
  const routebarRef = useRef<HTMLElement | null>(null);
  const pagenavRef = useRef<HTMLElement | null>(null);
  const firstRender = useRef<boolean>(true);
  const lastStrip = useRef<"routebar" | "pagenav" | null>(null);

  const { lords, lord, route } = props;
  const full = lord !== null && route !== null;
  const routebarItems = full ? routeTabItems(lord, route) : [];
  const routebarSelected = full ? selectedRouteId(lord, route) : null;
  const pagenavItems = full
    ? PAGE_TABS.map((page) => ({
        id: page.segment,
        href: pageTabHref(route.lordSlug, page.segment, resolvedRouteId(lord, route)),
      }))
    : [];
  const pagenavSelected = full ? selectedPage(route) : null;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (lastStrip.current === null) return;
    const ref = lastStrip.current === "routebar" ? routebarRef : pagenavRef;
    lastStrip.current = null;
    ref.current?.querySelector<HTMLAnchorElement>('[role="tab"][aria-selected="true"]')?.focus();
  }, [routebarSelected, pagenavSelected]);

  // Keyboard → hash, roving over the strip's own items: the pure `tabNav`
  // decision, with the dispatch remembered so focus follows the right strip.
  const keydown =
    (strip: "routebar" | "pagenav", items: readonly HeaderTab[], selected: string | null) =>
    (event: KeyboardEvent): void => {
      const direction = KEY_TO_DIRECTION[event.key];
      if (direction === undefined) return;
      event.preventDefault();
      const activeIndex = selected === null ? 0 : Math.max(0, items.findIndex((tab) => tab.id === selected));
      const target = items[tabNav(direction, activeIndex, items.length)];
      // Home/End on the already-selected tab (or a single-tab strip) would
      // write the identical hash: no navigation happens, so no strip may be
      // recorded — a stale focus target would yank focus to the wrong strip
      // on the next real keyboard navigation.
      if (target === undefined || target.href === window.location.hash) return;
      lastStrip.current = strip;
      window.location.hash = target.href;
    };

  return h(AtlasHeaderMarkup, {
    lords,
    lord,
    route,
    routebarRef,
    routebarOnKeyDown: keydown("routebar", routebarItems, routebarSelected),
    pagenavRef,
    pagenavOnKeyDown: keydown("pagenav", pagenavItems, pagenavSelected),
  });
}
