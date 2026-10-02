/**
 * Home view (DESIGN §5/§6): one card per lord from `content/index.json`, or —
 * when the tree holds no lords — the explicit empty state (a fresh checkout
 * before any content lands is a valid state, never an error). Presentational:
 * the tree is built once at boot by `app/content/load.ts` and passed down.
 */

import { h, type JSX } from "preact";
import type { ContentTree, Lord } from "../content/types.ts";

export function HomeView(props: { tree: ContentTree }): JSX.Element {
  const lords = props.tree.lords;
  if (lords.length === 0) return emptyState();
  return h(
    "section",
    { className: "lords", "aria-label": "Lord guides" },
    lords.map((lord) => lordCard(lord)),
  );
}

function lordCard(lord: Lord): JSX.Element {
  return h(
    "a",
    { className: "lord-card", href: `#/${lord.slug}` },
    h("h2", { className: "lord-card__name" }, lord.guide.lord),
    h("p", { className: "lord-card__faction" }, lord.guide.faction),
    h("p", { className: "version-context" }, versionContext(lord)),
  );
}

/**
 * Version context per DESIGN.md "Value & Number Formatting": `patch <X> ·
 * VCO <version>`, always both together, mono label styling in app.css.
 */
export function versionContext(lord: Lord): string {
  const v = lord.guide.version;
  return `patch ${v.patch} · VCO ${v.vco}`;
}

function emptyState(): JSX.Element {
  return h(
    "section",
    { className: "empty-state" },
    h("p", { className: "empty-state__label" }, "NO GUIDES YET"),
    h(
      "p",
      { className: "empty-state__copy" },
      "No guides have been added yet. Create a lord directory under content/ — a guide.json manifest naming its shared.md, route documents under routes/, and the data/ datasets — then list the lord slug in content/index.json. The site picks new content up on reload.",
    ),
  );
}
