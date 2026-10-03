/**
 * Spawned-process proof for the local server (packages static-server and
 * server-ledger-surface).
 *
 * Boots the real CLI (`tools/server.mjs`) on port 0 via `PORT=0` with an
 * isolated ledger store (`LEDGER_ROOT` = an OS temp dir), discovers the bound
 * port from its stdout line, then asserts:
 *
 * - the static shapes: `/` serves the built `dist/index.html`, the committed
 *   `content/index.json` is served under `/content/`, unknown non-content
 *   paths fall back to the SPA shell, and a traversal attempt that reaches
 *   the server decodes outside its root and 404s without leaking
 *   `package.json`;
 * - the ledger root: the derived index over the exactly two-level store
 *   (`<lord-slug>/<route-id>.json`), byte-exact document GET/PUT
 *   round-trips, whole-document overwrite, DELETE (and repeat-DELETE 404),
 *   400 for a non-JSON PUT with no file written, 413 beyond the body
 *   ceiling, 404 for a missing document, `corrupt` index entries for
 *   hand-written unparseable files whose raw bytes still GET verbatim,
 *   encoded traversal under `/ledgers/` rejected by the containment guard,
 *   405 for every method combination the surface does not define, and 404
 *   (never the SPA shell) for unknown ledger paths.
 *
 * The child is shut down cleanly at the end and the temp store is removed.
 * All ledger fixtures live under the temp store — the real (absent) `.local/`
 * is never touched.
 *
 * The server requires the build output at boot, so when `dist/index.html` is
 * absent this file builds it first (`npm run build`) — `npm test` stays
 * order-independent.
 */

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execSync, spawn } from "node:child_process";
import type { ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const SERVER = fileURLToPath(new URL("../tools/server.mjs", import.meta.url));

/** The spawned CLI process: stdin ignored, stdout/stderr piped. */
type ServerProcess = ChildProcessByStdio<null, Readable, Readable>;

/** One derived index entry: a campaign document or a `corrupt` marker. */
interface LedgerIndexEntry {
  lordSlug: string;
  routeId: string;
  status: string | null;
  updatedAt: string | null;
}

const SERVER_LINE = /listening on http:\/\/127\.0\.0\.1:(\d+)/;

let child: ServerProcess;
let origin: string;
let ledgerRoot: string;
let indexBytes: Buffer;
let contentIndexBytes: Buffer;
let packageBytes: Buffer;

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

/** Fetches the derived ledger index, asserting its JSON contract. */
async function fetchLedgerIndex(): Promise<LedgerIndexEntry[]> {
  const res = await fetch(`${origin}/ledgers`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
  return (await res.json()) as LedgerIndexEntry[];
}

function findEntry(
  index: LedgerIndexEntry[],
  lordSlug: string,
  routeId: string,
): LedgerIndexEntry | undefined {
  return index.find((e) => e.lordSlug === lordSlug && e.routeId === routeId);
}

before(async () => {
  // The server refuses to boot without the build output; build on demand so
  // this test does not depend on any prior `npm run build`.
  const distIndex = join(repoRoot, "dist", "index.html");
  if (!existsSync(distIndex)) {
    execSync("npm run build", { cwd: repoRoot, stdio: "inherit" });
  }

  indexBytes = readFileSync(distIndex);
  contentIndexBytes = readFileSync(join(repoRoot, "content", "index.json"));
  packageBytes = readFileSync(join(repoRoot, "package.json"));

  // A fresh per-run store: every fixture below lives here, never in the real
  // (absent) `.local/` the server would use by default.
  ledgerRoot = mkdtempSync(join(tmpdir(), "vco-campaign-ledger-"));

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

test("GET / returns 200 with the exact bytes of dist/index.html", async () => {
  const res = await fetch(`${origin}/`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/html; charset=utf-8");
  assert.deepEqual(Buffer.from(await res.arrayBuffer()), indexBytes);
});

test("GET /content/index.json returns 200 with the committed index", async () => {
  const res = await fetch(`${origin}/content/index.json`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
  assert.deepEqual(Buffer.from(await res.arrayBuffer()), contentIndexBytes);
});

test("GET /nope (unknown non-content path) falls back to dist/index.html", async () => {
  const res = await fetch(`${origin}/nope`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "text/html; charset=utf-8");
  assert.deepEqual(Buffer.from(await res.arrayBuffer()), indexBytes);
});

test("a traversal that reaches the server decodes outside the root and 404s without leaking package.json", async () => {
  // A literal "/../package.json" is normalized away by undici before it hits
  // the wire, so it never reaches the server. The encoded-slash form does
  // arrive raw and decodes to the same traversal — the server must reject it.
  const res = await fetch(`${origin}/..%2fpackage.json`);
  assert.equal(res.status, 404);
  assert.notDeepEqual(Buffer.from(await res.arrayBuffer()), packageBytes);
});

// --- Ledger root (package server-ledger-surface) ---
// The store is fresh per run and tests run serially in declaration order, so
// the empty-index assertion must stay the first ledger test.

test("GET /ledgers on an empty store returns 200 with []", async () => {
  assert.deepEqual(await fetchLedgerIndex(), []);
});

test("PUT stores the body verbatim, the index derives one parsed entry, and a second PUT overwrites", async () => {
  const first = {
    lordSlug: "lord-a",
    routeId: "route-1",
    status: "active",
    updatedAt: "2026-01-01T00:00:00.000Z",
    items: { "item-1": { planned: false, confirmedStep: 0 } },
  };
  const firstBody = JSON.stringify(first);

  let res = await fetch(`${origin}/ledgers/lord-a/route-1.json`, {
    method: "PUT",
    body: firstBody,
  });
  assert.equal(res.status, 200);

  // The stored document round-trips the exact bytes that were PUT.
  res = await fetch(`${origin}/ledgers/lord-a/route-1.json`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(await res.text(), firstBody);

  // The index lists one entry with the document's parsed status/updatedAt.
  assert.deepEqual(findEntry(await fetchLedgerIndex(), "lord-a", "route-1"), {
    lordSlug: "lord-a",
    routeId: "route-1",
    status: "active",
    updatedAt: "2026-01-01T00:00:00.000Z",
  });

  // A second PUT replaces the whole document.
  const second = { ...first, updatedAt: "2026-01-02T00:00:00.000Z" };
  const secondBody = JSON.stringify(second);
  res = await fetch(`${origin}/ledgers/lord-a/route-1.json`, {
    method: "PUT",
    body: secondBody,
  });
  assert.equal(res.status, 200);
  res = await fetch(`${origin}/ledgers/lord-a/route-1.json`);
  assert.equal(await res.text(), secondBody);
  assert.deepEqual(findEntry(await fetchLedgerIndex(), "lord-a", "route-1"), {
    lordSlug: "lord-a",
    routeId: "route-1",
    status: "active",
    updatedAt: "2026-01-02T00:00:00.000Z",
  });
});

test("DELETE removes the document, its index entry, and a repeat DELETE returns 404", async () => {
  const body = JSON.stringify({
    lordSlug: "lord-del",
    routeId: "route-9",
    status: "active",
    updatedAt: "2026-01-01T00:00:00.000Z",
    items: {},
  });
  let res = await fetch(`${origin}/ledgers/lord-del/route-9.json`, {
    method: "PUT",
    body,
  });
  assert.equal(res.status, 200);

  res = await fetch(`${origin}/ledgers/lord-del/route-9.json`, { method: "DELETE" });
  assert.equal(res.status, 200);
  assert.equal((await fetch(`${origin}/ledgers/lord-del/route-9.json`)).status, 404);
  assert.equal(findEntry(await fetchLedgerIndex(), "lord-del", "route-9"), undefined);

  // Removing an already-absent document is 404, not an error.
  res = await fetch(`${origin}/ledgers/lord-del/route-9.json`, { method: "DELETE" });
  assert.equal(res.status, 404);
});

test("PUT with a non-JSON body returns 400 and creates no file", async () => {
  const res = await fetch(`${origin}/ledgers/lord-b/route-1.json`, {
    method: "PUT",
    body: "{ definitely not json",
  });
  assert.equal(res.status, 400);
  assert.equal((await fetch(`${origin}/ledgers/lord-b/route-1.json`)).status, 404);
  assert.equal(findEntry(await fetchLedgerIndex(), "lord-b", "route-1"), undefined);
});

test("GET of a missing ledger document returns 404", async () => {
  const res = await fetch(`${origin}/ledgers/lord-missing/route-1.json`);
  assert.equal(res.status, 404);
});

test("encoded traversal under /ledgers/ is rejected by the containment guard without leaking", async () => {
  // The encoded-slash form arrives raw and decodes to a path that escapes the
  // ledger root; safeResolve against `LEDGER_ROOT` must 404 before any read,
  // and the body must not leak a repository file.
  const res = await fetch(`${origin}/ledgers/..%2fpackage.json`);
  assert.equal(res.status, 404);
  assert.notDeepEqual(Buffer.from(await res.arrayBuffer()), packageBytes);

  // A two-segment look-alike with traversal inside the route-id part is not a
  // two-level document path and must 404 too.
  const nested = await fetch(`${origin}/ledgers/lord-a/..%2f..%2fpackage.json`);
  assert.equal(nested.status, 404);
});

test("a hand-written unparseable file is indexed as corrupt and its GET still returns the raw bytes", async () => {
  // Seeded directly into the (temp) store, the way manual corruption would
  // appear on disk; the server never repairs it.
  mkdirSync(join(ledgerRoot, "corrupt-lord"), { recursive: true });
  writeFileSync(join(ledgerRoot, "corrupt-lord", "route-1.json"), "{ not json", "utf8");

  assert.deepEqual(findEntry(await fetchLedgerIndex(), "corrupt-lord", "route-1"), {
    lordSlug: "corrupt-lord",
    routeId: "route-1",
    status: "corrupt",
    updatedAt: null,
  });

  const res = await fetch(`${origin}/ledgers/corrupt-lord/route-1.json`);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "{ not json");
});

test("PUT/DELETE outside /ledgers/ and unknown methods keep the 405 convention", async () => {
  // PUT/DELETE anywhere outside the ledger root.
  assert.equal((await fetch(`${origin}/nope`, { method: "PUT", body: "x" })).status, 405);
  assert.equal((await fetch(`${origin}/content/index.json`, { method: "DELETE" })).status, 405);
  // Methods the server never defines.
  assert.equal((await fetch(`${origin}/`, { method: "POST" })).status, 405);
  assert.equal((await fetch(`${origin}/ledgers/lord-a/route-1.json`, { method: "PATCH" })).status, 405);
  assert.equal((await fetch(`${origin}/ledgers`, { method: "POST" })).status, 405);
  // The bare root is the read-only index.
  assert.equal((await fetch(`${origin}/ledgers`, { method: "PUT", body: "x" })).status, 405);
});

test("unknown /ledgers/ paths return 404, never the SPA shell", async () => {
  for (const path of [
    "/ledgers/no-such-lord/no-such-route.json", // absent document
    "/ledgers/nope", // one level deep is not a document path
    "/ledgers/lord-a", // a lord directory alone is not a document path
    "/ledgers/lord-a/route-1.json/extra", // three levels is outside the store layout
  ]) {
    const res = await fetch(`${origin}${path}`);
    assert.equal(res.status, 404);
    assert.notDeepEqual(Buffer.from(await res.arrayBuffer()), indexBytes);
  }
});

test("PUT with an oversized body returns 413 and writes nothing", async () => {
  // The server bounds the request body (a runaway body must not OOM the dev
  // server); a body comfortably above the 1 MiB ceiling is rejected before
  // any mkdir or write.
  const res = await fetch(`${origin}/ledgers/lord-big/route-1.json`, {
    method: "PUT",
    body: "x".repeat(2 * 1024 * 1024),
  });
  assert.equal(res.status, 413);
  assert.equal((await fetch(`${origin}/ledgers/lord-big/route-1.json`)).status, 404);
  assert.equal(findEntry(await fetchLedgerIndex(), "lord-big", "route-1"), undefined);
});
