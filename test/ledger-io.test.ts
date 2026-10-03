/**
 * Contract proof for the ledger I/O client (package `ledger-io-client`,
 * commit 4) over the spawned-server seam.
 *
 * Boots the real CLI (`tools/server.mjs`) on port 0 via `PORT=0` with an
 * isolated ledger store (`LEDGER_ROOT` = an OS temp dir), discovers the
 * bound port from its stdout line, and drives `app/ledger/io.ts` against it
 * through the injectable base-origin parameter — the same seam
 * `test/server.test.ts` uses, so the module's URL resolution to the server
 * contract is proven over real HTTP with no fetch mocking.
 *
 * The assertions cover the client contract's four operations and its typed
 * failure boundary: `saveLedger` → `listLedgers` index entry →
 * `loadLedger` field round-trip; a 404 document loads as `null` (absent,
 * not an error); a hand-written unreadable file makes `loadLedger` throw
 * the typed error while `listLedgers` reports its `corrupt` entry (the
 * DESIGN's never-silently-repair rule); a file that parses but is not a
 * campaign document throws the same typed corruption error; `deleteLedger`
 * removes a document and a repeat delete resolves (404 = already absent);
 * a PUT the server rejects resolves to the typed error carrying the
 * status; and a network-layer failure throws the typed error with no
 * status — never a raw fetch error leaking up and never a silent catch.
 *
 * The child is shut down cleanly at the end and the temp store is removed;
 * every fixture lives under the temp store, never the real (absent)
 * `.local/`. The server requires the build output at boot, so when
 * `dist/index.html` is absent this file builds it first (`npm run build`)
 * — the `test/server.test.ts` guard, so `npm test` stays order-independent.
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execSync, spawn } from "node:child_process";
import type { ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { deleteLedger, LedgerError, listLedgers, loadLedger, saveLedger } from "../app/ledger/io.ts";
import type { CampaignDoc, ItemState } from "../app/ledger/types.ts";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const SERVER = fileURLToPath(new URL("../tools/server.mjs", import.meta.url));

/** The spawned CLI process: stdin ignored, stdout/stderr piped. */
type ServerProcess = ChildProcessByStdio<null, Readable, Readable>;

const SERVER_LINE = /listening on http:\/\/127\.0\.0\.1:(\d+)/;

let child: ServerProcess;
let origin: string;
let ledgerRoot: string;

/** A well-formed campaign document; `items` carries the round-trip fields. */
function makeDoc(
  lordSlug: string,
  routeId: string,
  items: Readonly<Record<string, ItemState>> = {},
): CampaignDoc {
  return {
    lordSlug,
    routeId,
    status: "active",
    createdAt: "2026-10-03T00:00:00.000Z",
    updatedAt: "2026-10-03T00:00:00.000Z",
    items,
  };
}

/** The client's 404 handling contract: an absent document is null, not an error. */
function expectTypedError(causeStatus: number | null): (err: unknown) => boolean {
  return (err: unknown): boolean => err instanceof LedgerError && err.status === causeStatus;
}

/** Waits for the server's stdout line and resolves the base origin; rejects on early exit. */
function waitForOrigin(proc: ServerProcess): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`server did not print its listening line within 10s; stderr: ${stderr}`));
    }, 10_000);
    const onData = (chunk: Buffer) => {
      stdout += chunk.toString();
      const match = SERVER_LINE.exec(stdout);
      if (match) {
        cleanup();
        resolve(`http://127.0.0.1:${match[1]}`);
      }
    };
    const onStderr = (chunk: Buffer) => {
      stderr += chunk.toString();
    };
    const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
      cleanup();
      reject(new Error(`server exited before listening (code ${code}, signal ${signal}); stderr: ${stderr}`));
    };
    const onError = (err: Error) => {
      cleanup();
      reject(new Error(`could not spawn the server: ${err.message}`));
    };
    const cleanup = () => {
      clearTimeout(timer);
      proc.stdout.off("data", onData);
      proc.stderr.off("data", onStderr);
      proc.off("exit", onExit);
      proc.off("error", onError);
    };
    proc.stdout.on("data", onData);
    proc.stderr.on("data", onStderr);
    proc.on("exit", onExit);
    proc.on("error", onError);
  });
}

/** One index entry in the derived list, for a precise per-scenario assertion. */
function findEntry(
  index: readonly { readonly lordSlug: string; readonly routeId: string }[],
  lordSlug: string,
  routeId: string,
): { readonly lordSlug: string; readonly routeId: string } | undefined {
  return index.find((e) => e.lordSlug === lordSlug && e.routeId === routeId);
}

before(async () => {
  // The server refuses to boot without the build output; build on demand so
  // this test does not depend on any prior `npm run build`.
  const distIndex = join(repoRoot, "dist", "index.html");
  if (!existsSync(distIndex)) {
    execSync("npm run build", { cwd: repoRoot, stdio: "inherit" });
  }

  // A fresh per-run store: every fixture below lives here, never in the real
  // (absent) `.local/` the server would use by default.
  ledgerRoot = mkdtempSync(join(tmpdir(), "vco-campaign-ledger-io-"));

  child = spawn(process.execPath, [SERVER], {
    env: { ...process.env, PORT: "0", LEDGER_ROOT: ledgerRoot },
    stdio: ["ignore", "pipe", "pipe"],
  });
  origin = await waitForOrigin(child);
});

after(async () => {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
  rmSync(ledgerRoot, { recursive: true, force: true });
});

test("saveLedger stores the document: listLedgers indexes it and loadLedger round-trips every field", async () => {
  const doc = makeDoc("io-save-lord", "route-1", {
    alpha: { planned: true, confirmedStep: 0 },
    beta: { planned: false, confirmedStep: 4 },
  });

  await saveLedger(doc, origin);

  const index = await listLedgers(origin);
  assert.deepEqual(findEntry(index, "io-save-lord", "route-1"), {
    lordSlug: "io-save-lord",
    routeId: "route-1",
    status: "active",
    updatedAt: doc.updatedAt,
  });

  const loaded = await loadLedger("io-save-lord", "route-1", origin);
  assert.deepEqual(loaded, doc); // exact field round-trip, not a reshaped document
});

test("loadLedger on an absent document returns null (absent, not an error)", async () => {
  assert.equal(await loadLedger("io-absent-lord", "route-1", origin), null);
});

test("a hand-written invalid-JSON file makes loadLedger throw the typed error while listLedgers reports its corrupt entry", async () => {
  mkdirSync(join(ledgerRoot, "io-corrupt-lord"), { recursive: true });
  writeFileSync(join(ledgerRoot, "io-corrupt-lord", "route-1.json"), "{ not json", "utf8");

  await assert.rejects(loadLedger("io-corrupt-lord", "route-1", origin), expectTypedError(null));

  assert.deepEqual(findEntry(await listLedgers(origin), "io-corrupt-lord", "route-1"), {
    lordSlug: "io-corrupt-lord",
    routeId: "route-1",
    status: "corrupt",
    updatedAt: null,
  });
});

test("a file that parses but is not a campaign document throws the same typed corruption error", async () => {
  // Valid JSON, but missing `routeId`, timestamps, and per-item states — not
  // a CampaignDoc. The fixture carries a top-level `status`/`updatedAt` pair
  // so the server's index derivation (which reads those fields verbatim from
  // any parseable file) still emits an expressible `LedgerIndexEntry` and
  // later index reads in this file stay independent — whether or not the
  // shape guard runs, `loadLedger` must reject this file, never return it.
  mkdirSync(join(ledgerRoot, "io-shape-lord"), { recursive: true });
  writeFileSync(
    join(ledgerRoot, "io-shape-lord", "route-1.json"),
    JSON.stringify({ lordSlug: "io-shape-lord", status: "corrupt", updatedAt: null }),
    "utf8",
  );

  await assert.rejects(loadLedger("io-shape-lord", "route-1", origin), expectTypedError(null));
});

test("deleteLedger removes the document and a repeat delete resolves (404 reads as already absent)", async () => {
  await saveLedger(makeDoc("io-del-lord", "route-1"), origin);
  assert.ok(findEntry(await listLedgers(origin), "io-del-lord", "route-1") !== undefined);

  await deleteLedger("io-del-lord", "route-1", origin);

  // The desired end-state after removal: not in the index, loads as null.
  assert.equal(findEntry(await listLedgers(origin), "io-del-lord", "route-1"), undefined);
  assert.equal(await loadLedger("io-del-lord", "route-1", origin), null);

  // A second delete of the already-absent document is the same end-state, not
  // an error — the server's repeat-DELETE 404 reads as already absent.
  await deleteLedger("io-del-lord", "route-1", origin);
});

test("a PUT the server rejects (oversized body → 413) rejects saveLedger with the typed error carrying the status", async () => {
  // The client always serializes valid JSON, so the server's only PUT
  // rejection through saveLedger is its body ceiling (a runaway body must
  // not OOM the dev server) — the 413 shape `test/server.test.ts` pins over
  // HTTP now proven through the client's typed error, with the status the
  // row-level message renders.
  const oversized = makeDoc("io-big-lord", "route-1", {
    ["k".repeat(1200 * 1024)]: { planned: false, confirmedStep: 0 },
  });

  await assert.rejects(saveLedger(oversized, origin), expectTypedError(413));

  // The rejected write never landed: the document is still absent.
  assert.equal(await loadLedger("io-big-lord", "route-1", origin), null);
});

test("a network failure rejects loadLedger with the typed error (no status), never a raw fetch error", async () => {
  // Port 1 (tcpmux) has no listener on localhost on this host, so fetch must
  // fail at the network layer — the typed error must surface with no HTTP
  // status instead of the raw fetch TypeError leaking up.
  await assert.rejects(
    loadLedger("io-net-lord", "route-1", "http://127.0.0.1:1/"),
    expectTypedError(null),
  );
});
