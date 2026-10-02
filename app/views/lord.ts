/**
 * Lord view (DESIGN §2/§6): the shared-fundamentals markdown (rendered once at
 * boot, cached in the tree) plus the route list — number, official VCO title
 * or an explicit "unresearched" marker when `vcoTitle` is null, the thematic
 * subtitle (dimmed), and the objective line, each row linking to the route
 * page. Presentational: everything comes from the immutable tree.
 */

import { h, type JSX } from "preact";
import type { Lord, Route } from "../content/types.ts";

export function LordView(props: { lord: Lord }): JSX.Element {
  const lord = props.lord;
  return h(
    "article",
    { className: "lord-page" },
    h(
      "header",
      { className: "lord-page__header" },
      h("p", { className: "eyebrow" }, lord.guide.faction.toUpperCase()),
      h("h1", { className: "lord-page__title" }, lord.guide.lord),
      h("p", { className: "version-context" }, versionLabel(lord)),
    ),
    h(
      "section",
      { className: "shared-fundamentals", "aria-label": "Shared fundamentals" },
      h("div", { className: "prose", dangerouslySetInnerHTML: { __html: lord.sharedHtml } }),
    ),
    h(
      "section",
      { className: "route-list", "aria-label": "Routes" },
      h("h2", { className: "route-list__title" }, "Routes"),
      lord.routes.map((route) => routeRow(lord.slug, route)),
    ),
  );
}

/** `patch <X> · VCO <version>`, always together (DESIGN.md Value & Number Formatting). */
function versionLabel(lord: Lord): string {
  const v = lord.guide.version;
  return `patch ${v.patch} · VCO ${v.vco}`;
}

function routeRow(lordSlug: string, route: Route): JSX.Element {
  return h(
    "a",
    { className: "route-row", href: `#/${lordSlug}/route/${route.id}` },
    h("span", { className: "route-row__number" }, route.number),
    route.vcoTitle === null
      ? h("span", { className: "route-row__vco route-row__vco--unresearched" }, "UNRESEARCHED")
      : h("span", { className: "route-row__vco" }, route.vcoTitle),
    h("span", { className: "route-row__name" }, route.name),
    h("span", { className: "route-row__objective" }, route.objective.text),
  );
}
