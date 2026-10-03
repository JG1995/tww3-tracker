/**
 * The only ledger I/O module (VCO-CAMPAIGN-LEDGER-DESIGN §2 "Persistent
 * Data", §5 "Ledger file unreadable or invalid JSON"; ledger package
 * `ledger-io-client`): on-demand index reads, document loads, writes, and
 * deletions over the server's `/ledgers/` root. Every failure surfaces as
 * the typed `LedgerError` (message + status) the view state can render —
 * never a silent catch, and no retry, caching, localStorage, or state.
 *
 * URLs resolve against the origin exactly like `contentRootUrl()` in
 * `app/main.tsx` does (`new URL("ledgers/", location.href)` + the relative
 * store path), so the SPA served by the local server reads and writes the
 * same origin. The origin is an injectable optional `base` parameter:
 * browser callers pass nothing and get `window.location.href`, while
 * `node --test` points the module at a spawned server
 * (`test/ledger-io.test.ts`). Nothing DOM-y is referenced at module scope,
 * so the module imports and runs under node.
 */

import type { CampaignDoc, LedgerIndexEntry } from "./types.ts";
import { isValidCampaignDoc } from "./logic.ts";

/**
 * A typed ledger failure the view state can render. `status` is the HTTP
 * status that produced the failure (a non-2xx response — the row-level
 * message renders it); it is null when no HTTP status exists: a
 * network-layer failure, or a response body that could not be parsed.
 */
export class LedgerError extends Error {
  readonly status: number | null;
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "LedgerError";
    this.status = status;
  }
}

/**
 * The ledger root URL (`contentRootUrl()`'s pattern at `ledgers/`): the
 * relative store path is appended to it, so a document lives at
 * `<root><lord-slug>/<route-id>.json` and the bare root is the index.
 */
function ledgerRootUrl(base?: string): string {
  return new URL("ledgers/", base ?? window.location.href).href;
}

/** Fetches once over the ledger root, wrapping network failures in the typed error. */
async function ledgerFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new LedgerError(`could not reach the local server (${detail})`);
  }
}

/** The shared non-2xx failure: the typed error carries the status the view renders. */
function rejectStatus(res: Response): never {
  throw new LedgerError(`the server rejected the request (status ${res.status})`, res.status);
}

/** Shape guard for one derived index entry (the server's `GET /ledgers` list). */
function isLedgerIndexEntry(value: unknown): value is LedgerIndexEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.lordSlug === "string" &&
    typeof entry.routeId === "string" &&
    (entry.status === "active" || entry.status === "completed" || entry.status === "corrupt") &&
    (typeof entry.updatedAt === "string" || entry.updatedAt === null)
  );
}

/** Parses the index response body into typed entries, or throws the typed error. */
function parseLedgerIndex(raw: string): readonly LedgerIndexEntry[] {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new LedgerError("the ledger index is unreadable or malformed");
  }
  const entries: LedgerIndexEntry[] = [];
  if (!Array.isArray(value)) throw new LedgerError("the ledger index is unreadable or malformed");
  for (const item of value) {
    if (!isLedgerIndexEntry(item)) throw new LedgerError("the ledger index is unreadable or malformed");
    entries.push(item);
  }
  return entries;
}

/** Parses a document body and validates its shape, or throws the typed corruption error. */
async function parseCampaignDoc(res: Response): Promise<CampaignDoc> {
  let raw: unknown;
  try {
    raw = JSON.parse(await res.text());
  } catch {
    throw new LedgerError("the campaign file is unreadable (invalid JSON)");
  }
  // The DESIGN's never-silently-repair rule: `io` rejects what the shape
  // guard rejects instead of fixing it (see `isValidCampaignDoc`).
  if (!isValidCampaignDoc(raw)) throw new LedgerError("the campaign file is not a valid campaign document");
  return raw;
}

/** GET the bare `/ledgers` index, typed-parsed to `LedgerIndexEntry[]`. */
export async function listLedgers(base?: string): Promise<readonly LedgerIndexEntry[]> {
  const res = await ledgerFetch(ledgerRootUrl(base));
  if (!res.ok) rejectStatus(res);
  return parseLedgerIndex(await res.text());
}

/**
 * GET the campaign document for `(lordSlug, routeId)`: `null` on 404 (the
 * absent path), the document on success, and the typed error on a network
 * failure or unreadable/invalid file — the corrupt-file distinction.
 */
export async function loadLedger(lordSlug: string, routeId: string, base?: string): Promise<CampaignDoc | null> {
  const res = await ledgerFetch(`${ledgerRootUrl(base)}${lordSlug}/${routeId}.json`);
  if (res.status === 404) return null;
  if (!res.ok) rejectStatus(res);
  return parseCampaignDoc(res);
}

/** PUT the serialized whole document; rejects non-2xx with the typed error carrying the status. */
export async function saveLedger(doc: CampaignDoc, base?: string): Promise<void> {
  const res = await ledgerFetch(`${ledgerRootUrl(base)}${doc.lordSlug}/${doc.routeId}.json`, {
    method: "PUT",
    body: JSON.stringify(doc),
  });
  if (!res.ok) rejectStatus(res);
}

/** DELETE the document; a 404 reads as already absent (the desired end-state). */
export async function deleteLedger(lordSlug: string, routeId: string, base?: string): Promise<void> {
  const res = await ledgerFetch(`${ledgerRootUrl(base)}${lordSlug}/${routeId}.json`, {
    method: "DELETE",
  });
  if (res.status === 404) return;
  if (!res.ok) rejectStatus(res);
}
