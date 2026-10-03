/**
 * Ledger page view (feature DESIGN §6 Layout; package `ledger-view-page`):
 * the campaign context header — lord, route name, and the guide's
 * patch/VCO version context, the F3 version-banner pairing derived from
 * `lord.guide.version` through the shared version context helper — followed
 * by exactly one of the page states: the minimal mono in-flight line while
 * the document loads, the DESIGN fixed empty state for an absent campaign,
 * the `error`-bordered panel for a failed load (icon + `body-md` message +
 * ghost Retry wired to `onRetry`), or the Ledger Table composed with the
 * caller's single `logic.itemsFor` reconciliation (rows are the committed
 * item set — never a stored list). Presentational: every value and handler
 * arrives as props — no fetch, no state, no routing. Lifecycle actions
 * (complete/delete) land with their handlers in the lifecycle package.
 */

import { h, type JSX } from "preact";
import { getVcoObjectives } from "../content/query.ts";
import type { Lord, Route } from "../content/types.ts";
import { LedgerTable, type LedgerRowStatus, type LedgerTableRow } from "../components/LedgerTable.ts";
import type { LedgerRow } from "../ledger/logic.ts";
import type { CampaignDoc, ItemState } from "../ledger/types.ts";
import { versionContext } from "./home.ts";

/**
 * The document load lifecycle the page renders: `loading` (in-flight),
 * `ready` (doc present — the table; doc absent — the empty state; the DESIGN
 * "never blank" rule), or `error` (the fixed error panel).
 */
export type LedgerPhase =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly doc: CampaignDoc | null }
  | { readonly kind: "error"; readonly message: string };

export interface LedgerViewProps {
  /** The resolved lord value `main.tsx` passes, like every other view. */
  readonly lord: Lord;
  /** The campaign's route — the same resolved route value the route view gets. */
  readonly route: Route;
  readonly phase: LedgerPhase;
  /**
   * The reconciled rows — `logic.itemsFor` computed exactly once at the
   * caller; the view only adds the committed-item labels and counts.
   */
  readonly rows: readonly LedgerRow[];
  /** The per-row command statuses (`idle` / `saving` / `error` + message). */
  readonly statuses: Readonly<Record<string, LedgerRowStatus>>;
  /** The load-retry handler behind the error panel's ghost Retry button. */
  readonly onRetry: () => void;
  /** The planning-checkbox toggle for one item. */
  readonly onTick: (itemId: string, planned: boolean) => void;
  /** The step advance/retreat for one item (the closed 0–4 union). */
  readonly onStep: (itemId: string, step: ItemState["confirmedStep"]) => void;
}

/**
 * The 12×12 alert icon for the error panel, hand-authored in the icon-system
 * vocabulary (1px stroke, round joins, inheriting `currentColor` — DESIGN.md
 * "Icons and dependencies"): a circle with an exclamation.
 */
const ERROR_ICON = '<circle cx="6" cy="6" r="4.5"/><path d="M6 3.6v2.8"/><path d="M6 8.4h.01"/>';

/** The error panel's icon wrapper — same stroke style as the confidence badges. */
function errorIcon(): JSX.Element {
  return h("svg", {
    className: "ledger-error__icon",
    viewBox: "0 0 12 12",
    width: "12",
    height: "12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    dangerouslySetInnerHTML: { __html: ERROR_ICON },
  });
}

/** The campaign context header: lord, route name, and the patch/VCO pairing. */
function contextHeader(lord: Lord, route: Route): JSX.Element {
  return h(
    "header",
    { className: "ledger-context" },
    h("p", { className: "ledger-context__lord" }, lord.guide.lord),
    h("h1", { className: "ledger-context__title" }, route.name),
    h("p", { className: "version-context" }, versionContext(lord)),
  );
}

/** The in-flight mono line while the campaign document loads (page treatment). */
function inflightMarkup(): JSX.Element {
  return h("p", { className: "ledger-inflight", role: "status" }, "LOADING");
}

/** The DESIGN fixed empty state for an absent campaign — never blank. */
function emptyState(): JSX.Element {
  return h(
    "section",
    { className: "empty-state" },
    h("p", { className: "empty-state__label" }, "NO ACTIVE CAMPAIGN"),
    h("p", { className: "empty-state__copy" }, "— start one from a route page"),
  );
}

/** The DESIGN error panel: `error` border, icon + `body-md` message, ghost Retry. */
function errorPanel(message: string, onRetry: () => void): JSX.Element {
  return h(
    "section",
    { className: "ledger-error", role: "alert" },
    h(
      "div",
      { className: "ledger-error__body" },
      errorIcon(),
      h("p", { className: "ledger-error__message" }, message),
    ),
    h("button", { className: "button button--ghost", type: "button", onClick: onRetry }, "Retry"),
  );
}

/**
 * The composed Ledger Table: the reconciled rows carry the committed VCO
 * items' objective labels, and the progress counts are computed once over
 * the same reconciled rows (planning ticked / rows; reached step 1–4 / rows)
 * — the panel renders the numbers, never a second reconciliation.
 */
function tableMarkup(props: LedgerViewProps): JSX.Element {
  const labels = new Map(getVcoObjectives(props.lord, props.route.id).map((item) => [item.id, item.text]));
  const rows: LedgerTableRow[] = props.rows.map((row) => ({
    id: row.id,
    label: labels.get(row.id) ?? row.id,
    state: row.state,
  }));
  let plannedCount = 0;
  let confirmedCount = 0;
  for (const row of props.rows) {
    if (row.state.planned) plannedCount += 1;
    if (row.state.confirmedStep >= 1) confirmedCount += 1;
  }
  return h(LedgerTable, {
    rows,
    statuses: props.statuses,
    plannedCount,
    confirmedCount,
    onTick: props.onTick,
    onStep: props.onStep,
  });
}

/** Exactly one page state under the header, per the load phase. */
function pageState(props: LedgerViewProps): JSX.Element {
  switch (props.phase.kind) {
    case "loading":
      return inflightMarkup();
    case "error":
      return errorPanel(props.phase.message, props.onRetry);
    case "ready":
      return props.phase.doc === null ? emptyState() : tableMarkup(props);
  }
}

export function LedgerView(props: LedgerViewProps): JSX.Element {
  return h(
    "article",
    { className: "ledger-page" },
    contextHeader(props.lord, props.route),
    pageState(props),
  );
}
