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
 * DESIGN §4's "optional" list), the markdown body rendered at boot (its
 * `::claim` callouts arrive as labelled `<aside class="claim …">` blocks,
 * styled in app.css), and the declared content-gap list. Body H2s carry the
 * section ids from the tree so the router's section anchor can scroll them
 * into view.
 */

import { h, type JSX } from "preact";
import { TabStrip } from "../components/TabStrip.ts";
import { ConfidenceBadge } from "../components/ConfidenceBadge.ts";
import type { Claim, Lord, Route, Section } from "../content/types.ts";
import { getVcoObjectives, resolveSources } from "../content/query.ts";

export function RouteView(props: { lord: Lord; route: Route }): JSX.Element {
  const { lord, route } = props;
  return h(
    "article",
    { className: "route-page" },
    h(TabStrip, { lordSlug: lord.slug, routes: lord.routes, activeId: route.id }),
    identityCard(lord, route),
    vcoUndercard(lord, route),
    routeBody(route.sections),
    gapList(route.gaps),
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

function routeBody(sections: readonly Section[]): JSX.Element {
  if (sections.length === 0) {
    return h("p", { className: "route-body__empty" }, "This route has no sections yet.");
  }
  return h(
    "div",
    { className: "route-body" },
    sections.map((section) =>
      h(
        "section",
        { className: "route-section", "data-section-id": section.id },
        h("h2", { id: section.id, className: "route-section__heading" }, section.title),
        h("div", { className: "prose", dangerouslySetInnerHTML: { __html: sectionInnerHtml(section.html) } }),
      ),
    ),
  );
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

function gapList(gaps: readonly string[]): JSX.Element | null {
  if (gaps.length === 0) return null;
  return h(
    "section",
    { className: "gap-list", "aria-label": "Declared content gaps" },
    h("h2", { className: "gap-list__title" }, "Content gaps"),
    gaps.map((title) =>
      h(
        "div",
        { className: "gap-marker" },
        h("p", { className: "gap-marker__eyebrow" }, "CONTENT GAP"),
        h("p", { className: "gap-marker__copy" }, `"${title}" is a declared gap — it has not been written yet.`),
      ),
    ),
  );
}
