/**
 * Route view (feature DESIGN §2/§3 — the F2 route page): the Route Tab Strip
 * at the top (DESIGN §2 — the active tab is this route's own id, derived from
 * the hash; the view receives the lord for the strip's manifest routes), the
 * bone Route Identity Card (DESIGN.md "Route Identity Card" — mono eyebrow
 * with a primary dot, the official VCO title or the explicit unresearched
 * marker, the dimmed thematic subtitle, objective and reward as Confidence
 * Badged claims with their resolved source links, plus
 * interpretation/bottleneck/motto when present), the optional VCO
 * objective-item undercard from `data/vco.json`'s per-route entry (each item a
 * Confidence Badge-carrying row; nothing renders when the entry is absent —
 * DESIGN §4's "optional" list), the section region as the registry walk
 * (DESIGN §2/§6): required sections, optional sections, then the declared
 * transition gaps — each slot rendered at its fixed registry position as the
 * present section (a Content Panel whose H2 reads as the panel's mono eyebrow
 * and keeps the tree's section id for the router's section anchor) or an
 * in-flow Content Gap Marker for a declared gap; the F1 trailing gap list and
 * its "no sections yet" fallback are gone. Body H2s carry the section ids
 * from the tree so the router's section anchor can scroll them into view.
 *
 * The registry-walk machinery, the VCO undercard, and the campaign action
 * region moved to `app/views/plan.ts` (package `route-plan-view`): this page
 * imports them and keeps rendering identically under the old grammar — the
 * route page renders no heading numerals, and the F7 cross-link hrefs keep
 * the old `route/` segment — until Commit 9 retires it.
 */

import { h, type JSX } from "preact";
import { TabStrip } from "../components/TabStrip.ts";
import { Dashboard } from "../components/dashboard.ts";
import type { Lord, Route } from "../content/types.ts";
import { getPanelEntries } from "../content/query.ts";
import { claimBlock, registrySlots, slotAt, vcoUndercard, type RouteCampaignProps } from "./plan.ts";

export type { RouteCampaignProps } from "./plan.ts";
export { transitionTarget } from "./plan.ts";

export function RouteView(props: { lord: Lord; route: Route; campaign?: RouteCampaignProps }): JSX.Element {
  const { lord, route, campaign } = props;
  return h(
    "article",
    { className: "route-page" },
    h(TabStrip, { lordSlug: lord.slug, routes: lord.routes, activeId: route.id }),
    identityCard(lord, route),
    vcoUndercard(lord, route, campaign),
    routeBody(lord, route),
    // Keyed by route id: navigating between routes remounts the dashboard and
    // resets its component-local panel selection to the first panel (a
    // within-route section-anchor hash change does not). The lord context is
    // threaded so the panel anatomy resolves source ids the same way the
    // identity card does (DESIGN §4; `resolveSources`).
    h(Dashboard, { key: route.id, lord, ...getPanelEntries(lord, route) }),
  );
}

/**
 * The bone Route Identity Card: mono uppercase eyebrow with a primary dot, the
 * official VCO title (or the explicit unresearched marker), the dimmed
 * thematic subtitle, badged objective/reward claims, and the notes when
 * present. The official-title slot and the thematic subtitle stay distinct
 * elements with distinct classes — never interchangeable (DESIGN §4).
 */
function identityCard(lord: Lord, route: Route): JSX.Element {
  return h(
    "header",
    { className: "route-identity" },
    h(
      "p",
      { className: "route-identity__eyebrow" },
      h("span", { className: "route-identity__dot", "aria-hidden": "true" }),
      `ROUTE ${route.number}`,
    ),
    route.vcoTitle === null
      ? h("p", { className: "route-identity__vco route-identity__vco--unresearched" }, "UNRESEARCHED — no official VCO title recorded")
      : h("p", { className: "route-identity__vco" }, route.vcoTitle),
    h("h1", { className: "route-identity__title" }, route.name),
    h(
      "div",
      { className: "route-identity__claims" },
      claimBlock(lord, "Objective", route.objective),
      claimBlock(lord, "Reward", route.reward),
    ),
    route.interpretation === undefined ? null : identityNote("Interpretation", route.interpretation),
    route.bottleneck === undefined ? null : identityNote("Bottleneck", route.bottleneck),
    route.motto === undefined ? null : identityNote("Motto", route.motto),
  );
}

function identityNote(label: string, text: string): JSX.Element {
  return h(
    "div",
    { className: "route-identity__note" },
    h("p", { className: "claim-block__label" }, label),
    h("p", { className: "route-identity__note-text" }, text),
  );
}

/**
 * The section region (DESIGN §2 Displayed Data / §6 Layout): a registry walk
 * over the fixed slot order — the required sections, then the optional
 * sections (both in the `lint.ts` registry order), then the route's declared
 * transition gaps in declared order — with present sections and Content Gap
 * Markers interleaved at each slot's position. The walk lives on the plan
 * page now; this copy renders it under the old grammar (no heading numerals,
 * `route/` cross-link hrefs) so the F2 route page keeps rendering exactly as
 * before until Commit 9.
 */
function routeBody(lord: Lord, route: Route): JSX.Element {
  return h(
    "div",
    { className: "route-body" },
    registrySlots(route)
      .map((title) => slotAt(lord, route, title, { hrefPage: "route", numbered: false }))
      .filter((node): node is JSX.Element => node !== null),
  );
}
