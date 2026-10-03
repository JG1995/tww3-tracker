/**
 * The campaign model contract (VCO-CAMPAIGN-LEDGER-DESIGN §2 "Persistent
 * Data", §4 "Track separation") — pure types.
 *
 * One campaign document per (lordSlug, routeId): each VCO objective item
 * carries a planning boolean and a separate game-confirmed 0–4 step, stored
 * as two distinct fields and never inferred from each other. `logic.ts`
 * transitions against these shapes; the later `io.ts` reads store files
 * through the same closed unions (a `corrupt` file surfaces in the index via
 * `LedgerIndexEntry.status`, never as a silently repaired document). There
 * is no logic here beyond the closed unions.
 */

/** One row's persisted state: the two separated tracks of one VCO item. */
export interface ItemState {
  /** The planning track: the player believes the item is planned/handled. */
  readonly planned: boolean;
  /**
   * The game-confirmed track: the fixed 4-step position
   * (0 none → 1 appears complete → 2 mission marked complete
   * → 3 victory registered → 4 reward received). A closed union:
   * an out-of-bounds step is a type error at the call site.
   */
  readonly confirmedStep: 0 | 1 | 2 | 3 | 4;
}

/** The two lifecycle statuses of one campaign document. */
export type CampaignStatus = "active" | "completed";

/** One persisted campaign document for the route of one lord. */
export interface CampaignDoc {
  readonly lordSlug: string;
  readonly routeId: string;
  readonly status: CampaignStatus;
  /** ISO timestamp of creation and of the last whole-document write. */
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Per-item state keyed by VCO dataset item id (`data/vco.json`). */
  readonly items: Readonly<Record<string, ItemState>>;
}

/** One derived index entry (the server's `GET /ledgers` list). */
export interface LedgerIndexEntry {
  readonly lordSlug: string;
  readonly routeId: string;
  /**
   * `"corrupt"` when the store file fails to parse (`updatedAt` is `null`
   * then — the DESIGN's never-silently-repair rule, not a document status).
   */
  readonly status: CampaignStatus | "corrupt";
  readonly updatedAt: string | null;
}
