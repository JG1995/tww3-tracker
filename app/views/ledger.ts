/**
 * Ledger page view (feature DESIGN §6 Layout; packages `ledger-view-page`
 * and `ledger-complete-delete`): the campaign context header — lord, route
 * name, and the guide's patch/VCO version context, the F3 version-banner
 * pairing derived from `lord.guide.version` through the shared version
 * context helper — followed by exactly one of the page states: the minimal
 * mono in-flight line while the document loads, the DESIGN fixed empty
 * state for an absent campaign, the `error`-bordered panel for a failed
 * load (icon + `body-md` message + ghost Retry wired to `onRetry`), or the
 * Ledger Table composed with the caller's single `logic.itemsFor`
 * reconciliation (rows are the committed item set — never a stored list).
 * A completed (archived) campaign renders the same reconciled rows
 * READ-ONLY — no mutation controls (the recorded decision) — and the
 * lifecycle region under the table carries the actions: mark complete
 * (primary, active only), delete (destructive, with the explicit
 * confirmation whose copy states the file is removed / completion's copy
 * states the archived file is kept), the in-flight feedback, and a failed
 * operation's message (the no-silent-writes retry affordance).
 * Presentational: every value and handler arrives as props — no fetch, no
 * state, no routing.
 */

import { h, type JSX } from "preact";
import { getVcoObjectives } from "../content/query.ts";
import type { Lord, Route } from "../content/types.ts";
import { LedgerTable, type LedgerRowStatus, type LedgerTableRow } from "../components/LedgerTable.ts";
import type { LedgerRow } from "../ledger/logic.ts";
import type { LifecycleStage } from "../ledger/state.ts";
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
  /**
   * The lifecycle stage (null = no confirmation open and no lifecycle
   * operation in flight): the open confirmation, the in-flight removal, or a
   * failed operation's message.
   */
  readonly lifecycle: LifecycleStage | null;
  /** Opens the mark-complete confirmation (rendered only while the campaign is active). */
  readonly onComplete: () => void;
  /** Opens the delete confirmation (available on the active and archived views). */
  readonly onDelete: () => void;
  /** Confirms the open confirmation — performs the complete/delete operation. */
  readonly onConfirmLifecycle: () => void;
  /** Dismisses the open confirmation — the campaign stays untouched. */
  readonly onDismissLifecycle: () => void;
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
 * The once-computed table content both renditions share (the interactive
 * Ledger Table and the archived read-only one): the reconciled rows carry
 * the committed VCO items' objective labels, and the progress counts are
 * computed once over the same reconciled rows (planning ticked / rows;
 * reached step 1–4 / rows) — never a second reconciliation.
 */
function tableContent(props: LedgerViewProps): {
  readonly rows: LedgerTableRow[];
  readonly plannedCount: number;
  readonly confirmedCount: number;
} {
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
  return { rows, plannedCount, confirmedCount };
}

/** The composed Ledger Table: rows + statuses + handlers hand the panel its props. */
function tableMarkup(props: LedgerViewProps): JSX.Element {
  const { rows, plannedCount, confirmedCount } = tableContent(props);
  return h(LedgerTable, {
    rows,
    statuses: props.statuses,
    plannedCount,
    confirmedCount,
    onTick: props.onTick,
    onStep: props.onStep,
  });
}

/**
 * The fixed game-confirmed step labels in track order — the read-only
 * rendition shares the DESIGN-fixed names with the Ledger Table's
 * interactive track (`LedgerTable.STEP_LABELS` is not public and the
 * archived table lives in this view, so the fixed four repeat as this
 * rendition's own presentation data).
 */
const ARCHIVED_STEP_LABELS = ["APPEARS COMPLETE", "MISSION COMPLETE", "VICTORY REGISTERED", "REWARD RECEIVED"] as const;

/**
 * One archived step cell's treatment for a row at `current` — the same fixed
 * rule the interactive track renders (reached success, the step-1 edge
 * warning, earlier neutral, later dimmed).
 */
function archivedStepTreatment(
  step: 1 | 2 | 3 | 4,
  current: ItemState["confirmedStep"],
): "success" | "warning" | "neutral" | "future" {
  if (step < current) return "neutral";
  if (step > current) return "future";
  return step === 1 ? "warning" : "success";
}

/** The four fixed step cells of an archived row (dot + label, no controls). */
function archivedStepCells(current: ItemState["confirmedStep"]): JSX.Element[] {
  return ARCHIVED_STEP_LABELS.map((label, index) => {
    const step = (index + 1) as 1 | 2 | 3 | 4;
    return h(
      "span",
      { key: step, className: `ledger-step ledger-step--${archivedStepTreatment(step, current)}` },
      h("span", { className: "ledger-step__dot", "aria-hidden": "true" }),
      h("span", { className: "ledger-step__label" }, label),
    );
  });
}

/**
 * One archived row: the committed states only — the planning state renders
 * as a static state dot + the track label (no checkbox), and the four step
 * cells render with neither the back/forward controls nor the per-row write
 * feedback (the recorded decision: a completed campaign opens read-only;
 * mutations belong to the live campaign).
 */
function archivedRow(row: LedgerTableRow): JSX.Element {
  return h(
    "div",
    { key: row.id, className: "ledger-row" },
    h("div", { className: "ledger-row__label", title: row.label }, row.label),
    h(
      "div",
      { className: "ledger-row__planning ledger-row__planning--readonly" },
      h("span", {
        className: `ledger-row__state-dot${row.state.planned ? " ledger-row__state-dot--on" : ""}`,
        "aria-hidden": "true",
      }),
      h("span", { className: "ledger-row__plan" }, "PLANNED"),
    ),
    h("div", { className: "ledger-row__track" }, archivedStepCells(row.state.confirmedStep)),
  );
}

/**
 * The archived (completed) campaign's read-only rendition of the same
 * reconciled rows: the fixed two group headers with their progress pairs,
 * then the 40px hairline rows with the committed states only.
 */
function archivedTableMarkup(props: LedgerViewProps): JSX.Element {
  const { rows, plannedCount, confirmedCount } = tableContent(props);
  return h(
    "section",
    { className: "ledger-table ledger-table--readonly", "aria-label": "Campaign ledger" },
    h(
      "div",
      { className: "ledger-table__header" },
      h(
        "div",
        { className: "ledger-table__group ledger-table__group--planning" },
        h("span", { className: "ledger-table__group-label" }, "PLANNING"),
        h("span", { className: "ledger-table__group-progress" }, `${plannedCount} / ${rows.length}`),
      ),
      h(
        "div",
        { className: "ledger-table__group ledger-table__group--confirmed" },
        h("span", { className: "ledger-table__group-label" }, "GAME CONFIRMED"),
        h("span", { className: "ledger-table__group-progress" }, `${confirmedCount} / ${rows.length}`),
      ),
    ),
    rows.map((row) => archivedRow(row)),
  );
}

/** Whether the rendered document is an archived (completed) campaign — its rows read-only, delete only. */
function isArchivedDoc(props: LedgerViewProps): boolean {
  return props.phase.kind === "ready" && props.phase.doc !== null && props.phase.doc.status === "completed";
}

/** The lifecycle action buttons: mark complete (primary, active only) + delete (destructive ghost). */
function lifecycleButtons(props: LedgerViewProps): JSX.Element[] {
  const actions: JSX.Element[] = [];
  if (!isArchivedDoc(props)) {
    actions.push(
      h(
        "button",
        { className: "button button--primary", type: "button", onClick: props.onComplete },
        "Mark complete",
      ),
    );
  }
  actions.push(
    h(
      "button",
      { className: "button button--ghost button--danger", type: "button", onClick: props.onDelete },
      "Delete",
    ),
  );
  return actions;
}

/**
 * The confirmation surface (the DESIGN system's destructive-action
 * confirmation): the copy names the removal in plain language for delete
 * (irreversible) and states the archived file is KEPT for complete; the
 * confirm action performs the lifecycle operation, Cancel dismisses it and
 * leaves the campaign untouched. An inline panel, not a modal — no focus
 * trap required; the buttons are keyboard-operable like every button.
 */
function confirmPanel(stage: Extract<LifecycleStage, { readonly kind: "confirm" }>, props: LedgerViewProps): JSX.Element {
  const destructive = stage.action === "delete";
  return h(
    "div",
    { className: "ledger-confirm" },
    h("p", { className: "ledger-confirm__label" }, destructive ? "DELETE CAMPAIGN" : "MARK COMPLETE"),
    h(
      "p",
      { className: "ledger-confirm__copy" },
      destructive
        ? "The campaign file is removed from disk. This cannot be undone."
        : "Marking the campaign complete keeps the archived file on disk — it stops being active and this route becomes startable again.",
    ),
    h(
      "div",
      { className: "ledger-confirm__actions" },
      h(
        "button",
        {
          className: destructive ? "button button--ghost button--danger" : "button button--primary",
          type: "button",
          onClick: props.onConfirmLifecycle,
        },
        destructive ? "Delete campaign" : "Mark complete",
      ),
      h(
        "button",
        { className: "button button--ghost", type: "button", onClick: props.onDismissLifecycle },
        "Cancel",
      ),
    ),
  );
}

/**
 * The lifecycle region under the table: the action buttons, the
 * confirmation surface, the mono in-flight feedback while an operation
 * runs, or a failed operation's message with the actions retained (the
 * retry affordance — no silent writes).
 */
function lifecycleRegion(props: LedgerViewProps): JSX.Element {
  const stage = props.lifecycle;
  return h("section", { className: "ledger-lifecycle" }, lifecycleRegionContent(stage, props));
}

function lifecycleRegionContent(
  stage: LifecycleStage | null,
  props: LedgerViewProps,
): JSX.Element | JSX.Element[] {
  if (stage === null) return lifecycleButtons(props);
  if (stage.kind === "confirm") return confirmPanel(stage, props);
  if (stage.kind === "removing") {
    return h(
      "p",
      { className: "ledger-lifecycle__removing", role: "status" },
      stage.action === "delete" ? "REMOVING" : "SAVING",
    );
  }
  return [
    h("p", { className: "ledger-lifecycle__error", role: "alert" }, stage.message),
    ...lifecycleButtons(props),
  ];
}

/** Exactly one page state under the header, per the load phase (the lifecycle region rides the ready document). */
function pageState(props: LedgerViewProps): JSX.Element {
  switch (props.phase.kind) {
    case "loading":
      return inflightMarkup();
    case "error":
      return errorPanel(props.phase.message, props.onRetry);
    case "ready": {
      if (props.phase.doc === null) return emptyState();
      return h(
        "div",
        { className: "ledger-page__body" },
        isArchivedDoc(props) ? archivedTableMarkup(props) : tableMarkup(props),
        lifecycleRegion(props),
      );
    }
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
