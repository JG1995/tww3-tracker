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
 * DESIGN §4's "optional" list), and the section region as the registry walk
 * (DESIGN §2/§6): required sections, optional sections, then the declared
 * transition gaps — each slot rendered at its fixed registry position as the
 * present section (a Content Panel whose H2 reads as the panel's mono eyebrow
 * and keeps the tree's section id for the router's section anchor) or an
 * in-flow Content Gap Marker for a declared gap; the F1 trailing gap list and
 * its "no sections yet" fallback are gone. Body H2s carry the section ids
 * from the tree so the router's section anchor can scroll them into view.
 */

import { h, type JSX } from "preact";
import { TabStrip } from "../components/TabStrip.ts";
import { ConfidenceBadge } from "../components/ConfidenceBadge.ts";
import { Dashboard } from "../components/dashboard.ts";
import { OPTIONAL_SECTIONS, REQUIRED_SECTIONS } from "../content/lint.ts";
import type { Claim, Lord, Route } from "../content/types.ts";
import { getPanelEntries, getVcoObjectives, resolveSources } from "../content/query.ts";

/** Declared transition gaps are those titles the route authors as `Transition → <route>`. */
const TRANSITION_PREFIX = "Transition → ";

export function RouteView(props: { lord: Lord; route: Route }): JSX.Element {
  const { lord, route } = props;
  return h(
    "article",
    { className: "route-page" },
    h(TabStrip, { lordSlug: lord.slug, routes: lord.routes, activeId: route.id }),
    identityCard(lord, route),
    vcoUndercard(lord, route),
    routeBody(route),
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

/**
 * One claim row: the Confidence Badge (state label + colour class + resolved
 * source links) followed by the claim text, verbatim from the frontmatter.
 */
function claimBlock(lord: Lord, label: string, claim: Claim): JSX.Element {
  return h(
    "div",
    { className: "claim-block" },
    h("p", { className: "claim-block__label" }, label),
    h(
      "div",
      { className: "claim-block__row" },
      h(ConfidenceBadge, { state: claim.state, sources: resolveSources(lord, claim.src) }),
      h("span", { className: "claim-block__text" }, claim.text),
    ),
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
 * The optional VCO objective-item undercard (DESIGN §4 vco schema): one
 * Confidence Badge-carrying row per item — stable id, text, state and the
 * optional resolved source link — under the identity card. A route without a
 * `data/vco.json` entry renders no undercard at all.
 */
function vcoUndercard(lord: Lord, route: Route): JSX.Element | null {
  const objectives = getVcoObjectives(lord, route.id);
  if (objectives.length === 0) return null;
  return h(
    "section",
    { className: "vco-undercard", "aria-label": "VCO objective items" },
    h("p", { className: "vco-undercard__eyebrow" }, "VCO OBJECTIVES"),
    objectives.map((item) =>
      h(
        "div",
        { key: item.id, className: "vco-undercard__item" },
        h("span", { className: "vco-undercard__id" }, item.id),
        h("span", { className: "vco-undercard__text" }, item.text),
        h(ConfidenceBadge, { state: item.state, sources: resolveSources(lord, item.src ?? []) }),
      ),
    ),
  );
}

/**
 * The section region (DESIGN §2 Displayed Data / §6 Layout): a registry walk
 * over the fixed slot order — the required sections, then the optional
 * sections (both in the `lint.ts` registry order), then the route's declared
 * transition gaps in declared order — with present sections and Content Gap
 * Markers interleaved at each slot's position. The lint guarantees every
 * required section is present or declared, so a slot that is neither is
 * unreachable for required sections; an absent, undeclared optional section
 * simply renders nothing. The committed all-gap content therefore renders
 * exactly the registry markers in order, never a blank page.
 */
function routeBody(route: Route): JSX.Element {
  const transitionSlots = route.gaps.filter((title) => title.startsWith(TRANSITION_PREFIX));
  const slots = [...REQUIRED_SECTIONS, ...OPTIONAL_SECTIONS, ...transitionSlots];
  return h(
    "div",
    { className: "route-body" },
    slots.map((title) => slotAt(route, title)).filter((node) => node !== null),
  );
}

/**
 * One registry slot: the route's section at that exact title renders in
 * place; otherwise the title is a declared gap and renders its marker.
 */
function slotAt(route: Route, title: string): JSX.Element | null {
  const section = route.sections.find((s) => s.title === title);
  if (section !== undefined) {
    return h(
      "section",
      { className: "route-section", "data-section-id": section.id },
      h("h2", { id: section.id, className: "route-section__heading" }, section.title),
      h("div", { className: "prose", dangerouslySetInnerHTML: { __html: sectionInnerHtml(section.html) } }),
    );
  }
  if (route.gaps.includes(title)) {
    return contentGapMarker(title);
  }
  return null;
}

/**
 * `section.html` is markdown-it's render of the section body, which always
 * opens with the `<h2>Title</h2>` the loader produced from the heading. The
 * view re-renders that heading in JSX so it can carry the tree's section id
 * as a stable anchor; only the inner HTML stays boot-time-rendered.
 */
function sectionInnerHtml(html: string): string {
  const close = html.indexOf("</h2>");
  return close === -1 ? html : html.slice(close + "</h2>".length);
}

/**
 * The in-flow Content Gap Marker (DESIGN.md "Content Gap Marker"): a dashed
 * hairline panel with the mono "CONTENT GAP" eyebrow and F1's explanatory
 * line, rendered at the slot's registry position instead of F1's trailing
 * list. Present sections own the router anchors; a marker does not.
 */
function contentGapMarker(title: string): JSX.Element {
  return h(
    "div",
    { className: "gap-marker" },
    h("p", { className: "gap-marker__eyebrow" }, "CONTENT GAP"),
    h("p", { className: "gap-marker__copy" }, `"${title}" is a declared gap — it has not been written yet.`),
  );
}
