/**
 * The Ledger Table panel (feature DESIGN §"Ledger Table"; ARCHITECTURE §1.1's
 * reserved dumb component `LedgerTable`): the fixed DESIGN-system surface for
 * one campaign's reconciled rows — two visually separate column groups
 * ("planning" vs "game confirmed") with mono uppercase group headers and the
 * explicit `n / m` progress pairs beside them, 40px hairline-divided rows,
 * and per-row controls.
 *
 * The panel decides NOTHING: it has no fetch, no routing, no state — the
 * ordered rows (label + id + `ItemState` from the caller's single
 * `logic.itemsFor` read), the per-row `{ phase, message }` command statuses,
 * the progress numbers (computed by the caller in one place), and the
 * `onTick`/`onStep` callbacks all arrive as props, and it renders VNodes
 * only. Each row renders the objective label (`body-md`), the planning
 * checkbox with its `mono-sm` label (ticked → the `on-surface` check), and
 * the four game-confirmed step cells (`label-sm` cells that always pair a
 * state dot with a text label — never colour alone).
 *
 * Step states (DESIGN.md §Ledger Table): the reached step renders the
 * `success` treatment; the appears-complete-but-unconfirmed edge (the row at
 * step 1) renders the `warning` treatment; earlier steps render neutral and
 * later steps dimmed. Controls mark the bounds (no forward past step 4, no
 * back before step 0), are keyboard-operable buttons with the global
 * `:focus-visible` ring, and the per-row statuses render the in-flight
 * `saving` feedback or the failed row's `error` border + inline text — the
 * row always renders whatever document the parent holds, so a rolled-back
 * write shows its pre-write value naturally.
 */

import { h, type JSX } from "preact";
import type { ItemState } from "../ledger/types.ts";

/** One row's command state: the in-flight write feedback the parent holds. */
export interface LedgerRowStatus {
  /** `saving` = an optimistic write for this row is in flight; `error` = failed. */
  readonly phase: "idle" | "saving" | "error";
  /** The error message rendered inline under `phase: "error"`. */
  readonly message: string | null;
}

/** One reconciled row the panel renders: id + label + the stored `ItemState`. */
export interface LedgerTableRow {
  readonly id: string;
  readonly label: string;
  readonly state: ItemState;
}

export interface LedgerTableProps {
  /** The reconciled rows in committed order (`logic.itemsFor` at the caller). */
  readonly rows: readonly LedgerTableRow[];
  /** Per-row command statuses keyed by item id. */
  readonly statuses: Readonly<Record<string, LedgerRowStatus>>;
  /** Progress numbers computed by the caller — the panel only renders them. */
  readonly plannedCount: number;
  readonly confirmedCount: number;
  /** The planning checkbox toggle for one item. */
  readonly onTick: (itemId: string, planned: boolean) => void;
  /** The step advance/retreat for one item (the closed 0–4 union). */
  readonly onStep: (itemId: string, step: ItemState["confirmedStep"]) => void;
}

/**
 * The four fixed DESIGN step labels in track order (step 1 → 4); the exact
 * cell copy beyond the DESIGN-fixed step names is presentation.
 */
const STEP_LABELS: readonly ["APPEARS COMPLETE", "MISSION COMPLETE", "VICTORY REGISTERED", "REWARD RECEIVED"] = [
  "APPEARS COMPLETE",
  "MISSION COMPLETE",
  "VICTORY REGISTERED",
  "REWARD RECEIVED",
];

/** The planning-checkbox label — the `mono-sm` voice beside the check. */
const PLANNING_LABEL = "PLANNED";

/** The in-flight feedback copy while a row's optimistic write is pending. */
const SAVING_LABEL = "SAVING";

/**
 * One step cell's treatment for a row at `current`: passed steps render
 * neutral, later steps dimmed, the reached step success — except the
 * appears-complete-but-unconfirmed edge (current step 1), which renders the
 * warning treatment (DESIGN.md §Ledger Table states).
 */
function stepTreatment(step: 1 | 2 | 3 | 4, current: ItemState["confirmedStep"]): "success" | "warning" | "neutral" | "future" {
  if (step < current) return "neutral";
  if (step > current) return "future";
  return step === 1 ? "warning" : "success";
}

/** The step one back from `step` — only reachable while the back control is enabled (step > 0). */
function stepBefore(step: ItemState["confirmedStep"]): ItemState["confirmedStep"] {
  return (step - 1) as ItemState["confirmedStep"];
}

/** The step one forward from `step` — only reachable while the forward control is enabled (step < 4). */
function stepAfter(step: ItemState["confirmedStep"]): ItemState["confirmedStep"] {
  return (step + 1) as ItemState["confirmedStep"];
}

/** The four step cells of one row, each a mono label cell with its state dot + text label. */
function stepCells(current: ItemState["confirmedStep"]): JSX.Element[] {
  return STEP_LABELS.map((label, index) => {
    const step = (index + 1) as 1 | 2 | 3 | 4;
    return h(
      "span",
      { key: step, className: `ledger-step ledger-step--${stepTreatment(step, current)}` },
      h("span", { className: "ledger-step__dot", "aria-hidden": "true" }),
      h("span", { className: "ledger-step__label" }, label),
    );
  });
}

/** The row's trailing feedback cell: `SAVING` while in flight, the message on error, empty when idle. */
function feedbackMarkup(status: LedgerRowStatus | undefined): JSX.Element {
  if (status === undefined || status.phase === "idle") {
    return h("span", { className: "ledger-row__feedback" });
  }
  if (status.phase === "saving") {
    return h("span", { className: "ledger-row__feedback ledger-row__feedback--saving" }, SAVING_LABEL);
  }
  return h(
    "span",
    { className: "ledger-row__feedback ledger-row__feedback--error", title: status.message ?? undefined },
    status.message ?? "",
  );
}

/** One 40px hairline-divided row: label, planning checkbox, 4 step cells, step controls, feedback. */
function rowMarkup(
  row: LedgerTableRow,
  status: LedgerRowStatus | undefined,
  onTick: (itemId: string, planned: boolean) => void,
  onStep: (itemId: string, step: ItemState["confirmedStep"]) => void,
): JSX.Element {
  const step = row.state.confirmedStep;
  const errorClass = status?.phase === "error" ? " ledger-row--error" : "";
  return h(
    "div",
    { key: row.id, className: `ledger-row${errorClass}` },
    h("div", { className: "ledger-row__label", title: row.label }, row.label),
    h(
      "label",
      { className: "ledger-row__planning" },
      h("input", {
        type: "checkbox",
        className: `ledger-row__check${row.state.planned ? " ledger-row__check--on-surface" : ""}`,
        checked: row.state.planned,
        onChange: (event) => onTick(row.id, event.currentTarget.checked),
      }),
      h("span", { className: "ledger-row__plan" }, PLANNING_LABEL),
    ),
    h("div", { className: "ledger-row__track" }, stepCells(step)),
    h(
      "div",
      { className: "ledger-row__controls" },
      h(
        "button",
        {
          key: "back",
          type: "button",
          className: "ledger-row__control ledger-row__control--back",
          disabled: step === 0,
          "aria-label": `${row.label} — move back one step`,
          onClick: () => onStep(row.id, stepBefore(step)),
        },
        "BACK",
      ),
      h(
        "button",
        {
          key: "forward",
          type: "button",
          className: "ledger-row__control ledger-row__control--forward",
          disabled: step === 4,
          "aria-label": `${row.label} — move forward one step`,
          onClick: () => onStep(row.id, stepAfter(step)),
        },
        "FORWARD",
      ),
    ),
    feedbackMarkup(status),
  );
}

export function LedgerTable(props: LedgerTableProps): JSX.Element {
  const { rows, statuses, plannedCount, confirmedCount, onTick, onStep } = props;
  return h(
    "section",
    { className: "ledger-table", "aria-label": "Campaign ledger" },
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
    rows.map((row) => rowMarkup(row, statuses[row.id], onTick, onStep)),
  );
}
