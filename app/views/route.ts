/**
 * Route view (feature DESIGN §2/§3 — the F1 route form): the identity block
 * from frontmatter (number, official VCO title or an explicit "unresearched"
 * marker, thematic subtitle, objective and reward each with a mono uppercase
 * confidence label + claim text + src ids, plus interpretation/bottleneck
 * when present), the markdown body rendered at boot (its `::claim` callouts
 * arrive as labelled `<aside class="claim …">` blocks, styled in app.css),
 * and the declared content-gap list. Body H2s carry the section ids from the
 * tree so the router's section anchor can scroll them into view.
 */

import { h, type JSX } from "preact";
import type { Claim, ClaimState, Route, Section } from "../content/types.ts";

/** The DESIGN confidence-table display labels; always shown, never colour alone. */
export const STATE_LABELS: Record<ClaimState, string> = {
  confirmed: "CONFIRMED",
  historical: "HISTORICAL",
  inferred: "INFERRED",
  "verify-in-campaign": "VERIFY",
};

export function RouteView(props: { route: Route }): JSX.Element {
  const route = props.route;
  return h(
    "article",
    { className: "route-page" },
    identityBlock(route),
    routeBody(route.sections),
    gapList(route.gaps),
  );
}

function identityBlock(route: Route): JSX.Element {
  return h(
    "header",
    { className: "route-identity" },
    h("p", { className: "route-identity__eyebrow" }, `ROUTE ${route.number}`),
    route.vcoTitle === null
      ? h("p", { className: "route-identity__vco route-identity__vco--unresearched" }, "UNRESEARCHED — no official VCO title recorded")
      : h(
          "p",
          { className: "route-identity__vco" },
          h("span", { className: "route-identity__dot", "aria-hidden": "true" }),
          route.vcoTitle,
        ),
    h("h1", { className: "route-identity__title" }, route.name),
    h(
      "div",
      { className: "route-identity__claims" },
      claimBlock("Objective", route.objective),
      claimBlock("Reward", route.reward),
    ),
    route.interpretation === undefined ? null : identityNote("Interpretation", route.interpretation),
    route.bottleneck === undefined ? null : identityNote("Bottleneck", route.bottleneck),
  );
}

/** One claim row: mono uppercase state label + claim text + src ids. */
function claimBlock(label: string, claim: Claim): JSX.Element {
  return h(
    "div",
    { className: "claim-block" },
    h("p", { className: "claim-block__label" }, label),
    h(
      "div",
      { className: "claim-block__row" },
      h("span", { className: `state-label state-label--${claim.state}` }, STATE_LABELS[claim.state]),
      h("span", { className: "claim-block__text" }, claim.text),
      claim.src.length === 0 ? null : h("span", { className: "claim-block__src" }, `SRC ${claim.src.join(", ")}`),
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
