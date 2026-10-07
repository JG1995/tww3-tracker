/**
 * The cross-guide search dialog (feature DESIGN §2/§3/§4/§5/§6; package
 * `search-dialog-component`, Commit 2 of the cross-guide-search feature):
 * the site's first modal — a focus-trapped native `<dialog>` holding the
 * search field at top, the count line, and the grouped result list (faction
 * headers in hit order, one button row per hit with the mono breadcrumb,
 * the category eyebrow, and the hit title plus snippet), per DESIGN.md
 * "Search Field & Results". The dialog consumes Commit 1's query layer
 * (`searchContent`, `SearchHit`, `SearchResults`) read-only over the
 * immutable boot tree.
 *
 * Zero-DOM seam, the `AtlasHeaderMarkup`/`AtlasHeader` precedent: the pure
 * `SearchDialogMarkup` VNode builder and the pure `searchHitNav` decision
 * are exported so `node --test` flattens the markup and pins the wrap-around
 * selection without a DOM library, while the mounted `SearchDialog` wrapper
 * owns every `document`/`window`/`<dialog>` interaction — the open/close
 * effect (showModal + field focus; `close()` on close), the ~150 ms
 * debounced results, the field keydown (wrapping arrows, Enter to navigate),
 * the backdrop click (a click whose target is the `<dialog>` element itself
 * closes it — DESIGN §2/§6), the global `/` shortcut, and the close event's
 * focus restore with the `isConnected` guard (the reference atlases'
 * `lastFocus` pattern, covering Enter navigation where the opener page is
 * replaced).
 *
 * Controlled-dialog note (recorded for the coordinator): the builder never
 * renders the native `open` attribute, even though `open` is part of its
 * props contract. Setting the attribute from JSX would make the wrapper's
 * `showModal()` throw `InvalidStateError` (the spec throws when the open
 * attribute is already set), so the wrapper's effect owns the element's
 * open state via `showModal()`/`close()` — the seam holds without the
 * builder touching a browser API.
 *
 * Security: guide markdown is never re-parsed. Snippets render as plain
 * text nodes with each `occurrences` range wrapped in a `search-hit__match`
 * span — no `dangerouslySetInnerHTML` anywhere in this module.
 */

import { h, type JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { searchContent, type SearchHit, type SearchResults } from "../content/query.ts";
import type { ContentTree } from "../content/types.ts";

/** The field's stable id — the label's `htmlFor`, unique in the document. */
const SEARCH_FIELD_ID = "search-dialog__field";

/** The debounce window over the sub-100 ms synchronous search (the DESIGN's
 *  "debounced input"; the exact value is an implementation detail, recorded
 *  in the ledger's uncertainty register). */
const SEARCH_DEBOUNCE_MS = 150;

/** The display cap mirrored from the query layer's 30-hit list cap (the
 *  DESIGN §2 "30+" convention). */
const SEARCH_LIST_CAP = 30;

/** The hint line for an empty/whitespace query — the DESIGN's explicit empty
 *  state (what can be searched), never a blank list. */
const SEARCH_HINT = "Search a unit, named skill, building, mechanic or objective.";

/** The explicit no-match line with the shorten-the-phrase hint (DESIGN §5;
 *  the reference-atlas voice, exact copy not contractual). */
const SEARCH_NO_MATCH = "No match in any guide. Try a shorter phrase.";

/** The mounted wrapper's props — the shell (Commit 4) renders it as a
 *  sibling of the header and main region, owning the `open` boolean. */
export interface SearchDialogProps {
  /** The immutable boot tree the query layer searches (read-only). */
  readonly tree: ContentTree;
  /** Whether the dialog should be open (the shell's own boolean). */
  readonly open: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  /** The shell's result navigation (close + hash write) — the wrapper never
   *  writes the hash itself. */
  readonly onNavigate: (href: string) => void;
}

/** The markup seam's props: the pure builder's inputs — the wrapper hands
 *  down the handlers, the refs, and the field keydown binding; tests omit
 *  them. `open` mirrors the dialog's state (see the controlled-dialog note
 *  in the module doc comment — the builder does not render the attribute). */
export interface SearchDialogMarkupProps {
  readonly open: boolean;
  readonly query: string;
  readonly results: SearchResults;
  /** The selected row's flat index (the wrapper clamps it). */
  readonly selectedIndex: number;
  readonly onQueryChange: (value: string) => void;
  /** Opens the given hit's landing target (Enter and row-click share it). */
  readonly onOpenSelected: (href: string) => void;
  readonly onClose: () => void;
  /** The field ref the wrapper uses to focus on open — optional for tests. */
  readonly inputRef?: { current: HTMLInputElement | null };
  /** The dialog element ref the wrapper's showModal/close effect needs. */
  readonly dialogRef?: { current: HTMLDialogElement | null };
  /** The field's keydown binding (the wrapper's arrow/Enter handling). */
  readonly dialogKeyProps?: { readonly onKeyDown?: (event: KeyboardEvent) => void };
}

/**
 * The wrap-around selection decision over the flat hit list (the
 * `tabNav`/`panelTabNav` pattern, a local pure copy): down wraps from the
 * last row to the first, up from the first to the last; a single-element
 * list wraps to itself; an empty list has no selection — 0.
 */
export function searchHitNav(direction: "up" | "down", index: number, count: number): number {
  if (count === 0) return 0;
  return direction === "up" ? (index - 1 + count) % count : (index + 1) % count;
}

/** The count line — `N matching references.`, rendered `30+ …` when the list
 *  is capped and the total made explicit (the DESIGN §2 "30+" convention). */
function countLine(total: number): string {
  return total > SEARCH_LIST_CAP ? `${SEARCH_LIST_CAP}+ matching references.` : `${total} matching references.`;
}

/** The breadcrumb's final segment: the section title for section hits, the
 *  category label otherwise (the DESIGN's `section-or-category`). */
function crumbTrailing(hit: SearchHit): string {
  return hit.kind === "section" ? hit.title : hit.category;
}

/** The mono breadcrumb `faction / route / section-or-category`, with the
 *  route omitted for the lord-wide kinds (shared fundamentals, sources). */
function hitBreadcrumb(hit: SearchHit): string {
  const trailing = crumbTrailing(hit);
  return hit.routeLabel === null ? `${hit.faction} / ${trailing}` : `${hit.faction} / ${hit.routeLabel} / ${trailing}`;
}

/** One hit row's snippet children: the snippet as plain text nodes with each
 *  occurrence range wrapped in exactly one `search-hit__match` span — the
 *  matched text reads `on-surface` (ink) against the `on-surface-variant`
 *  surroundings (muted), never HTML. */
function snippetNodes(hit: SearchHit): Array<string | JSX.Element> {
  const nodes: Array<string | JSX.Element> = [];
  let cursor = 0;
  for (const occurrence of hit.occurrences) {
    if (occurrence.start > cursor) nodes.push(hit.snippet.slice(cursor, occurrence.start));
    nodes.push(h("span", { className: "search-hit__match" }, hit.snippet.slice(occurrence.start, occurrence.end)));
    cursor = occurrence.end;
  }
  if (cursor < hit.snippet.length) nodes.push(hit.snippet.slice(cursor));
  return nodes;
}

/** One hit row — a real button control (focus rings work): the label-sm mono
 *  breadcrumb, the category eyebrow, the serif title, and the body snippet
 *  with its match spans. The row at `selectedIndex` carries the `--selected`
 *  treatment AND the aria-current label, so the selection is never colour-
 *  only. */
function hitRow(hit: SearchHit, index: number, selectedIndex: number, onOpenSelected: (href: string) => void): JSX.Element {
  const selected = index === selectedIndex;
  return h(
    "button",
    {
      key: `hit-${index}`,
      type: "button",
      className: selected ? "search-hit search-hit--selected" : "search-hit",
      onClick: () => onOpenSelected(hit.href),
      "aria-current": selected ? "true" : undefined,
    },
    h("p", { className: "search-hit__crumb" }, hitBreadcrumb(hit)),
    h("p", { className: "search-hit__category" }, hit.category),
    h("p", { className: "search-hit__title" }, hit.title),
    h("p", { className: "search-hit__snippet" }, ...snippetNodes(hit)),
  );
}

/** The grouped list: consecutive hits of the same lord under one faction
 *  header (the `faction` name, mono label), in hit order — never re-sorted. */
function groupedRows(props: SearchDialogMarkupProps): JSX.Element[] {
  const nodes: JSX.Element[] = [];
  let group: string | null = null;
  props.results.hits.forEach((hit, index) => {
    if (hit.lordSlug !== group) {
      group = hit.lordSlug;
      nodes.push(h("p", { key: `group-${group}`, className: "search-dialog__group" }, hit.faction));
    }
    nodes.push(hitRow(hit, index, props.selectedIndex, props.onOpenSelected));
  });
  return nodes;
}

/** One of the three list-area states (DESIGN §2/§5): the hint for an
 *  empty/whitespace query, the explicit no-match line for a non-empty query
 *  with zero results, or the count line above the grouped hits. */
function listArea(props: SearchDialogMarkupProps): JSX.Element {
  if (props.query.trim() === "") return h("p", { className: "search-dialog__hint" }, SEARCH_HINT);
  if (props.results.total === 0) {
    return h("p", { className: "search-dialog__no-match" }, SEARCH_NO_MATCH);
  }
  return h(
    "div",
    { className: "search-dialog__results" },
    h("p", { className: "search-dialog__count" }, countLine(props.results.total)),
    groupedRows(props),
  );
}

/**
 * The dialog's pure VNode surface (zero-DOM): the labelled native `<dialog>`
 * holding the head (mono eyebrow "ALL GUIDES", serif title, ghost Close
 * button with the `<kbd>Esc</kbd>` chip), the labelled search field, and the
 * list area per DESIGN §2/§5 — the hint line for an empty/whitespace query,
 * the explicit no-match line for a non-empty query with zero results, and
 * otherwise the count line above the grouped list. Highlights render as
 * plain text spans; guide markdown is never re-parsed.
 */
export function SearchDialogMarkup(props: SearchDialogMarkupProps): JSX.Element {
  const { query, onQueryChange, onClose } = props;
  return h(
    "dialog",
    {
      className: "search-dialog",
      "aria-label": "Search the guides",
      ref: props.dialogRef,
    },
    h(
      "div",
      { className: "search-dialog__head" },
      h(
        "div",
        { className: "search-dialog__titles" },
        h("p", { className: "search-dialog__eyebrow" }, "ALL GUIDES"),
        h("h2", { className: "search-dialog__title" }, "Search the guides"),
      ),
      h(
        "button",
        { className: "button button--ghost search-dialog__close", type: "button", onClick: onClose },
        "Close",
        h("kbd", null, "Esc"),
      ),
    ),
    h(
      "div",
      { className: "search-dialog__body" },
      h("label", { className: "search-dialog__label", htmlFor: SEARCH_FIELD_ID }, "Unit, skill, building, mechanic or objective"),
      h("input", {
        id: SEARCH_FIELD_ID,
        className: "search-dialog__field",
        type: "search",
        value: query,
        placeholder: "Unit, skill, building, mechanic or objective",
        onInput: (event: Event) => onQueryChange((event.currentTarget as HTMLInputElement).value),
        ref: props.inputRef,
        onKeyDown: props.dialogKeyProps?.onKeyDown,
      }),
      listArea(props),
    ),
  );
}

/**
 * The mounted search dialog (the wrapper — every `document`/`window`/dialog
 * access lives here): the component-local query and selection state, the
 * ~150 ms debounced `searchContent` results, the native dialog open/focus
 * lifecycle with the `lastFocus` restore on `close` (guarded by
 * `isConnected`, covering Enter navigation where the opener page is
 * replaced), the backdrop click dismissal (a click whose target is the
 * dialog element itself closes it, per DESIGN §2/§6 — the close event's
 * restore then owns the hand-back), the field keydown (wrapping
 * ArrowUp/ArrowDown with the clamped selection, Enter navigating the
 * selected hit — inert with no result), and the global `/` shortcut
 * (guarded by typing targets and any open dialog; registered only while
 * this component is mounted, so the zero-lord shell — which never mounts
 * it — has no shortcut).
 */
export function SearchDialog(props: SearchDialogProps): JSX.Element {
  const { tree, open, onOpen, onClose, onNavigate } = props;
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResults>({ total: 0, hits: [] });
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const fieldRef = useRef<HTMLInputElement | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // Debounced results: the DESIGN's "debounced input" over the sub-100 ms
  // synchronous search; the timer is cleared on change and on unmount.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setResults(searchContent(tree, query));
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [tree, query]);

  // The dialog's close event: restore the opener's focus when it is still
  // connected (the reference atlases' lastFocus guard — Escape and backdrop
  // restores the opener; Enter navigation may replace the opener page), and
  // sync the shell's open boolean (the native close never touches it).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    const onDialogClose = (): void => {
      const opener = lastFocus.current;
      if (opener !== null && opener.isConnected) opener.focus();
      onClose();
    };
    dialog.addEventListener("close", onDialogClose);
    return () => dialog.removeEventListener("close", onDialogClose);
  }, [onClose]);

  // Open/close lifecycle: on open — save the active element, show the modal,
  // focus the field; on close — close the dialog (the close event's restore
  // then hands focus back).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (open) {
      lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      fieldRef.current?.focus();
    } else {
      dialog.close();
    }
  }, [open]);

  // Backdrop dismissal (DESIGN §2/§6 "backdrop-click-closing"): in a modal
  // dialog a click on the ::backdrop is delivered to the <dialog> element
  // itself, so the listener closes the dialog exactly when the click target
  // IS the dialog — clicks inside the panel land on inner content and never
  // match. On an already-closed dialog `close()` is a no-op; the close
  // event's focus restore then covers the hand-back exactly like Escape.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    const onDialogClick = (event: MouseEvent): void => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener("click", onDialogClick);
    return () => dialog.removeEventListener("click", onDialogClick);
  }, []);

  // The global "/" shortcut — active only while this component is mounted:
  // firing while no typing element is focused and no other dialog is open.
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent): void => {
      if (event.key !== "/") return;
      const target = event.target;
      if (target instanceof Element && target.matches('input, textarea, [contenteditable="true"]')) return;
      if (document.querySelector("dialog[open]") !== null) return;
      event.preventDefault();
      onOpen();
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [onOpen]);

  // The selection clamps when the result set shrinks (a stale index from a
  // previously longer list never points past the current list).
  const selected = results.hits.length === 0 ? 0 : Math.min(selectedIndex, results.hits.length - 1);

  const onFieldKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const count = results.hits.length;
      if (count === 0) return;
      event.preventDefault();
      setSelectedIndex(searchHitNav(event.key === "ArrowDown" ? "down" : "up", selected, count));
      return;
    }
    if (event.key === "Enter") {
      const hit = results.hits[selected];
      if (hit === undefined) return;
      onNavigate(hit.href);
    }
  };

  return h(SearchDialogMarkup, {
    open,
    query,
    results,
    selectedIndex: selected,
    onQueryChange: (value: string) => {
      setQuery(value);
      setSelectedIndex(0);
    },
    onOpenSelected: onNavigate,
    onClose,
    inputRef: fieldRef,
    dialogRef,
    dialogKeyProps: { onKeyDown: onFieldKeyDown },
  });
}
