/**
 * Field notes view (feature DESIGN §2/§5/§6 — Displayed Data, Empty States,
 * Copywriting; package `notes-page-view`): the lord-scoped presentational
 * view over `{ lord }`. The desk toolbar opens the page — the serif "Field
 * notes" title over the lord-page context line (the panel pages' "ROUTE <n>
 * · <name>" pattern adapted to a lord page: no route exists here, so the
 * context line names the lord itself — the `sources-page-view` package copy
 * decision, shared by both lord-scoped pages; the faction stays with the
 * header's brand line). Below the toolbar, the whole body is the explicit
 * deferred empty state — the mono label (this package's copy within the
 * DESIGN's fixed-sentence constraint) + the DESIGN-fixed one sentence
 * ("Notes arrive with a later feature", DESIGN §6 — the fixed
 * deferred-surface rule; the project's empty-state policy: never blank
 * space). The notes content itself is a later feature; the page is the
 * deferred state only. Presentational: everything comes from the immutable
 * tree. Dormant until Commit 9 routes to it.
 */

import { h, type JSX } from "preact";
import type { Lord } from "../content/types.ts";

/**
 * The deferred state's mono label (the DESIGN's "label + one sentence" —
 * §2; the label is this package's copy in the project's `NO … YET`
 * empty-state voice, `sources-empty`/`desk-card__empty` precedent).
 */
const DEFERRED_LABEL = "NO NOTES YET";

/** The DESIGN-fixed deferred sentence (DESIGN §6 — "never a blank region"). */
const DEFERRED_COPY = "Notes arrive with a later feature";

/**
 * The field notes page: the desk toolbar over the explicit deferred empty
 * state (label + the DESIGN-fixed sentence) — the page's only body.
 */
export function NotesView(props: { lord: Lord }): JSX.Element {
  return h(
    "article",
    { className: "notes-page" },
    pageToolbar(props.lord),
    deferredState(),
  );
}

/**
 * The desk toolbar (DESIGN §6 "Panel pages: desk-toolbar (page title +
 * context line ...)"): the serif page title over the lord-page context
 * line, in the eyebrow voice (the lord's own name — see the module doc).
 */
function pageToolbar(lord: Lord): JSX.Element {
  return h(
    "header",
    { className: "notes-page__toolbar" },
    h("h1", { className: "notes-page__title" }, "Field notes"),
    h("p", { className: "notes-page__context" }, lord.guide.lord),
  );
}

/**
 * The explicit deferred empty state (DESIGN §2/§5 — the page's whole body,
 * never a blank region): the mono label + the fixed sentence, in the
 * empty-state anatomy (label + one proportional sentence).
 */
function deferredState(): JSX.Element {
  return h(
    "div",
    { className: "notes-deferred" },
    h("p", { className: "notes-deferred__label" }, DEFERRED_LABEL),
    h("p", { className: "notes-deferred__copy" }, DEFERRED_COPY),
  );
}
