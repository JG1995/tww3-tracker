/**
 * The pure campaign model (VCO-CAMPAIGN-LEDGER-DESIGN §2 "Persistent Data",
 * §4 "Track separation") — transitions and validation with no I/O.
 *
 * Every transition returns a whole new immutable document and never mutates
 * its input (the repo's immutable-tree convention); the clock is
 * caller-injected (`now`, an ISO string), never a Date.now default, so the
 * suite pins timestamps exactly. The committed VCO item ids are read-only
 * inputs; `itemsFor` is the single definition of "rows = committed content
 * order" — the view and the table never compute a second intersection.
 */

import { type CampaignDoc, type ItemState } from "./types.ts";

/**
 * One reconciled row: a VCO item id from the committed content with its
 * stored state, or the fresh default when the document has not stored it.
 */
export interface LedgerRow {
  readonly id: string;
  readonly state: ItemState;
}

/**
 * The fresh state of a never-stored item: unplanned, step 0. The single
 * definition shared by `createCampaign`, `itemsFor`, and the transitions'
 * stored-missing handling, so a fresh row is the same everywhere.
 */
const FRESH_ITEM: ItemState = { planned: false, confirmedStep: 0 };

/**
 * A new `active` campaign document for (lordSlug, routeId): every committed
 * VCO item id starts fresh (unplanned, step 0). Both timestamps are the
 * caller-injected ISO `now` — no Date.now default, so the clock stays
 * testable. Pure: returns a new document, never mutates its inputs.
 */
export function createCampaign(
  lordSlug: string,
  routeId: string,
  committedIds: readonly string[],
  now: string,
): CampaignDoc {
  const items: Record<string, ItemState> = {};
  for (const id of committedIds) items[id] = { ...FRESH_ITEM };
  return { lordSlug, routeId, status: "active", createdAt: now, updatedAt: now, items };
}

/**
 * The next document with ONLY `itemId`'s `planned` changed — the track
 * separation invariant: its `confirmedStep` and every other item are
 * untouched. A stored-missing id starts from the fresh default (the same
 * rule `itemsFor` renders), so a tick on a committed row always persists.
 * `updatedAt` is stamped with the caller-injected ISO `now` (the same clock
 * pattern as `createCampaign` — no Date.now default, so the stamp stays
 * testable). Pure: returns a new document, never mutates its input.
 */
export function tickItem(doc: CampaignDoc, itemId: string, planned: boolean, now: string): CampaignDoc {
  return {
    ...doc,
    updatedAt: now,
    items: {
      ...doc.items,
      [itemId]: { planned, confirmedStep: doc.items[itemId]?.confirmedStep ?? FRESH_ITEM.confirmedStep },
    },
  };
}

/**
 * The next document with ONLY `itemId`'s `confirmedStep` changed — the track
 * separation invariant: `planned` is untouched. The step is the closed union
 * `0|1|2|3|4`, so an out-of-bounds value is a type error at the call site
 * (see `isValidConfirmedStep` for the runtime guard on untrusted input). A
 * stored-missing id starts from the fresh default. `updatedAt` is stamped
 * with the caller-injected ISO `now` (the same clock pattern as
 * `createCampaign` — no Date.now default, so the stamp stays testable).
 * Pure: returns a new document, never mutates its input.
 */
export function setConfirmedStep(doc: CampaignDoc, itemId: string, step: 0 | 1 | 2 | 3 | 4, now: string): CampaignDoc {
  return {
    ...doc,
    updatedAt: now,
    items: {
      ...doc.items,
      [itemId]: { planned: doc.items[itemId]?.planned ?? FRESH_ITEM.planned, confirmedStep: step },
    },
  };
}

/**
 * The lifecycle close-out transition (feature DESIGN Journey 3): marks the
 * campaign `completed` — the archived file stays on disk, the campaign stops
 * being the active one (the index is the single active-campaign fact), and
 * the route pages become startable again. ONLY `status` and `updatedAt`
 * change; every item and every other field is byte-identical, so the
 * archived file is the whole committed record. `updatedAt` is stamped with
 * the caller-injected ISO `now` (the same clock pattern as `createCampaign`
 * — no Date.now default, so the stamp stays testable). Pure: returns a new
 * document, never mutates its input.
 */
export function completeCampaign(doc: CampaignDoc, now: string): CampaignDoc {
  return { ...doc, status: "completed", updatedAt: now };
}

/**
 * The single definition of "rows = committed content order" (DESIGN §4
 * "Items follow committed content"): one row per committed id, in committed
 * order, carrying the stored state or the fresh default when the document
 * lacks that id; an id removed from content is absent from the result. Pure:
 * reads the document, never mutates it.
 */
export function itemsFor(doc: CampaignDoc, committedIds: readonly string[]): readonly LedgerRow[] {
  return committedIds.map((id) => ({
    id,
    state: doc.items[id] ?? { ...FRESH_ITEM },
  }));
}

/**
 * The runtime step-bounds guard: true exactly when `step` is an integer in
 * 0–4. The closed union makes an out-of-bounds step a type error at the call
 * site; this predicate is the check for external input (e.g. a hand-edited
 * store file parsed later by `io`) — advancing past 4 and retreating below
 * 0 are invalid, and so are non-integers like 2.5 (not a union member).
 */
export function isValidConfirmedStep(step: number): step is 0 | 1 | 2 | 3 | 4 {
  return Number.isInteger(step) && step >= 0 && step <= 4;
}

/**
 * The document-shape guard for untrusted input (e.g. a hand-edited campaign
 * file parsed later by `io`): true only for an object with string
 * `lordSlug`/`routeId`, a `status` of `"active"` | `"completed"`, string
 * timestamps, and an `items` record whose values are `{ planned: boolean,
 * confirmedStep in 0–4 }`. `"corrupt"` is an index status, never a document
 * status. The DESIGN's never-silently-repair rule means `io` rejects what
 * this guard rejects instead of fixing it.
 */
export function isValidCampaignDoc(value: unknown): value is CampaignDoc {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const doc = value as Record<string, unknown>;
  if (typeof doc.lordSlug !== "string") return false;
  if (typeof doc.routeId !== "string") return false;
  if (doc.status !== "active" && doc.status !== "completed") return false;
  if (typeof doc.createdAt !== "string") return false;
  if (typeof doc.updatedAt !== "string") return false;
  if (typeof doc.items !== "object" || doc.items === null || Array.isArray(doc.items)) return false;
  for (const item of Object.values(doc.items as Record<string, unknown>)) {
    if (typeof item !== "object" || item === null) return false;
    const state = item as Record<string, unknown>;
    if (typeof state.planned !== "boolean") return false;
    if (typeof state.confirmedStep !== "number" || !isValidConfirmedStep(state.confirmedStep)) return false;
  }
  return true;
}
