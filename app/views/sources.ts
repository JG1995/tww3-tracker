/**
 * Sources & settings view (feature DESIGN §2/§5/§6 — Displayed Data, Empty
 * States, Copywriting; package `sources-page-view`): the lord-scoped
 * presentational view over `{ lord }`. The desk toolbar opens the page —
 * the serif "Sources & settings" title over the lord-page context line
 * (the panel pages' "ROUTE <n> · <name>" pattern adapted to a lord page:
 * no route exists here, so the context line names the lord itself — the
 * recorded package copy decision; the faction stays with the header's
 * brand line). Below the toolbar: the lord's committed `data/sources.json`
 * list — one row per entry: number, title as a link to its `url`, and the
 * note — read through the existing typed dataset access (no new query),
 * and then the explicit deferred settings stand-in: one fixed line (the
 * DESIGN's deferred-surface rule — settings are a later feature, never a
 * blank region). A lord with an absent or empty sources dataset renders
 * the explicit empty state (mono label + one proportional sentence — the
 * project's empty-state policy). Presentational: everything comes from the
 * immutable tree. Routed at `#/<lord>/sources`.
 */

import { h, type JSX } from "preact";
import type { Lord, LordDataset, Source } from "../content/types.ts";

/** The DESIGN-fixed deferred-settings line (DESIGN §2 — one line, never blank). */
const DEFERRED_SETTINGS = "Appearance settings arrive with a later feature";

/**
 * The lord's committed `data/sources.json` list — the existing typed
 * dataset read (the `LordDataset` union access, exactly like
 * `resolveItemEntries` in `query.ts`); an absent sources dataset is an
 * empty list, never an error.
 */
function lordSources(lord: Lord): readonly Source[] {
  const dataset = lord.datasets.find(
    (d): d is Extract<LordDataset, { readonly name: "sources" }> => d.name === "sources",
  );
  return dataset === undefined ? [] : dataset.value;
}

/**
 * The sources page: the desk toolbar, the sources list (or its explicit
 * empty state — the two never render together), then the deferred settings
 * stand-in.
 */
export function SourcesView(props: { lord: Lord }): JSX.Element {
  const sources = lordSources(props.lord);
  return h(
    "article",
    { className: "sources-page" },
    pageToolbar(props.lord),
    sources.length === 0 ? sourcesEmpty() : sourcesList(sources),
    deferredSettings(),
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
    { className: "sources-page__toolbar" },
    h("h1", { className: "sources-page__title" }, "Sources & settings"),
    h("p", { className: "sources-page__context" }, lord.guide.lord),
  );
}

/** The numbered source rows — one per committed entry, in file order. */
function sourcesList(sources: readonly Source[]): JSX.Element {
  return h(
    "ol",
    { className: "sources-list" },
    sources.map((source, index) =>
      h(
        "li",
        { key: source.id, className: "sources-row" },
        h("span", { className: "sources-row__index" }, String(index + 1)),
        h(
          "div",
          { className: "sources-row__body" },
          h("a", { className: "sources-row__title", href: source.url }, source.title),
          h("p", { className: "sources-row__note" }, source.note),
        ),
      ),
    ),
  );
}

/** The explicit empty state — the project's policy: mono label + one sentence. */
function sourcesEmpty(): JSX.Element {
  return h(
    "div",
    { className: "sources-empty" },
    h("p", { className: "sources-empty__label" }, "NO SOURCES YET"),
    h("p", { className: "sources-empty__copy" }, "No sources are listed for this lord yet."),
  );
}

/** The deferred settings stand-in: one explicit line, never a blank region. */
function deferredSettings(): JSX.Element {
  return h(
    "div",
    { className: "sources-deferred" },
    h("p", { className: "sources-deferred__line" }, DEFERRED_SETTINGS),
  );
}
