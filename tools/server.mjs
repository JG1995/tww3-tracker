/**
 * Static local server (packages static-server and server-ledger-surface).
 *
 * Dependency-free Node `http` server for the SPA: serves the built site from
 * `dist/` at `/` and the committed guide content from `content/` under
 * `/content/`, GET only. The ledger store root (F5) is served and mutated
 * under `/ledgers/` and is method-aware: GET the derived index or a document,
 * PUT a whole document, DELETE one — with the same path-safety discipline as
 * the static roots and never any SPA fallback. Unknown non-content paths
 * still fall back to `dist/index.html` so the hash-routed shell loads at any
 * path.
 *
 * Binds 127.0.0.1 on port 8123 (override with `PORT`). The bound URL line is
 * printed to stdout, so `PORT=0` (ephemeral) callers can discover the actual
 * port. Requires `dist/index.html` at startup — run `npm run build` first;
 * when it is missing the server prints that message and exits non-zero.
 */

import { createServer } from "node:http";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DIST_ROOT = join(repoRoot, "dist");
const CONTENT_ROOT = join(repoRoot, "content");
const HOST = "127.0.0.1";
const DEFAULT_PORT = 8123;
const FALLBACK = "index.html";

/**
 * Ledger store root: one JSON document per campaign at
 * `<lord-slug>/<route-id>.json`, under a gitignored local directory. The
 * `LEDGER_ROOT` env override (the `PORT` precedent) lets server/io tests use
 * an isolated store without touching the real (absent) `.local/`.
 */
const LEDGER_ROOT = process.env.LEDGER_ROOT ?? join(repoRoot, ".local", "state", "ledgers");
/** Ceiling for a PUT body; campaign documents are a few KiB, so this is generous headroom. */
const MAX_LEDGER_BODY_BYTES = 1024 * 1024;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};
const DEFAULT_TYPE = "application/octet-stream";

/**
 * Resolves a requested relative path inside `root`, or null when it escapes.
 * `resolve()` normalizes `..` segments first and the containment check runs
 * against the normalized absolute path — a raw prefix string check would not.
 */
function safeResolve(root, rel) {
  const target = resolve(root, rel);
  return target === root || target.startsWith(root + sep) ? target : null;
}

function send(res, status, type, body) {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

async function handleRequest(req, res) {
  // Only GET is defined for the static roots; the ledger root is
  // method-aware (GET/PUT/DELETE), so those three are the only methods that
  // route through the shared path guards below.
  if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
    send(res, 405, "text/plain; charset=utf-8", "405 Method Not Allowed");
    return;
  }

  // The raw request-target, checked before URL parsing: literal ".."
  // segments are collapsed by normalization before the containment check
  // would see them, so reject them outright (percent-encoded escapes are
  // caught below, after decoding).
  const rawPath = req.url.startsWith("/") ? req.url.split("?", 1)[0] : req.url;
  if (/(^|\/)\.\.(\/|$)/.test(rawPath)) {
    send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
    return;
  }

  // Decode before any path handling: traversal attempts can arrive
  // percent-encoded (e.g. "/..%2fpackage.json"), and it is the decoded path
  // the containment check must see.
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    send(res, 400, "text/plain; charset=utf-8", "400 Bad Request");
    return;
  }

  if (pathname === "/ledgers" || pathname.startsWith("/ledgers/")) {
    await handleLedger(req, res, pathname);
    return;
  }

  // Static roots stay GET-only: PUT/DELETE outside the ledger root keep the
  // 405 convention.
  if (req.method !== "GET") {
    send(res, 405, "text/plain; charset=utf-8", "405 Method Not Allowed");
    return;
  }

  const isContent = pathname === "/content" || pathname.startsWith("/content/");
  const root = isContent ? CONTENT_ROOT : DIST_ROOT;
  let rel = pathname.slice(isContent ? "/content/".length : 1).replace(/^\/+/, "");
  if (rel === "" && !isContent) rel = FALLBACK; // "/" maps to dist/index.html
  const target = safeResolve(root, rel);
  if (target === null) {
    send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
    return;
  }

  let data;
  try {
    data = await readFile(target);
  } catch {
    if (isContent) {
      send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
      return;
    }
    // Unknown non-content path: serve the SPA shell so hash routes work.
    try {
      data = await readFile(join(DIST_ROOT, FALLBACK));
    } catch {
      send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
      return;
    }
    send(res, 200, CONTENT_TYPES[".html"], data);
    return;
  }
  send(res, 200, CONTENT_TYPES[extname(rel)] ?? DEFAULT_TYPE, data);
}

/**
 * Serves the ledger store root (F5). Path discipline matches the static
 * roots — `safeResolve` containment against `LEDGER_ROOT` (an escape 404s),
 * the global raw-`..` and decode guards above — but unlike them this branch
 * is method-aware and never SPA-falls back:
 *
 * - `GET /ledgers` — the derived JSON index (two store levels only);
 * - `GET /ledgers/<lord>/<route-id>.json` — the stored document, verbatim, or 404;
 * - `PUT /ledgers/<lord>/<route-id>.json` — validate JSON, mkdir the lord
 *   directory, one whole-document write, 2xx;
 * - `DELETE /ledgers/<lord>/<route-id>.json` — unlink, ENOENT maps to 404;
 * - everything else stays 405 (bare root is read-only) or 404 (not a
 *   two-level document path).
 */
async function handleLedger(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "PUT" && req.method !== "DELETE") {
    send(res, 405, "text/plain; charset=utf-8", "405 Method Not Allowed");
    return;
  }

  // Exactly two store levels: below the bare root every path is one lord
  // directory containing one "<route-id>.json" file.
  const rel = pathname.slice("/ledgers/".length).replace(/^\/+/, "");
  if (rel === "") {
    // The bare root is the index only.
    if (req.method !== "GET") {
      send(res, 405, "text/plain; charset=utf-8", "405 Method Not Allowed");
      return;
    }
    await sendLedgerIndex(res);
    return;
  }

  const sep = rel.indexOf("/");
  if (sep <= 0 || sep === rel.length - 1 || rel.slice(sep + 1).includes("/")) {
    // A stray single segment, an empty segment, or a deeper nest: none is a
    // document path.
    send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
    return;
  }

  const target = safeResolve(LEDGER_ROOT, rel);
  if (target === null) {
    send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
    return;
  }

  if (req.method === "GET") {
    try {
      const data = await readFile(target);
      send(res, 200, CONTENT_TYPES[extname(rel)] ?? DEFAULT_TYPE, data);
    } catch {
      send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
    }
    return;
  }

  if (req.method === "PUT") {
    let raw;
    try {
      raw = await readBody(req, MAX_LEDGER_BODY_BYTES);
    } catch {
      // The request stream failed mid-read (e.g. the client aborted).
      send(res, 400, "text/plain; charset=utf-8", "400 Bad Request");
      return;
    }
    if (raw === null) {
      send(res, 413, "text/plain; charset=utf-8", "413 Payload Too Large");
      return;
    }
    try {
      // Validation only — the whole document is stored verbatim (byte-exact
      // round-trip), never reshaped or repaired by the server.
      JSON.parse(raw.toString("utf8"));
    } catch {
      send(res, 400, "text/plain; charset=utf-8", "400 Bad Request");
      return;
    }
    try {
      // One whole-document write: mkdir the lord directory (recursively, so
      // a missing store root is created too), then a single writeFile.
      await mkdir(join(LEDGER_ROOT, rel.slice(0, sep)), { recursive: true });
      await writeFile(target, raw);
    } catch {
      send(res, 500, "text/plain; charset=utf-8", "500 Internal Server Error");
      return;
    }
    send(res, 200, "text/plain; charset=utf-8", "ok");
    return;
  }

  // DELETE — unlink; ENOENT is "already absent" and reads as 404.
  try {
    await unlink(target);
  } catch (err) {
    if (err?.code === "ENOENT") {
      send(res, 404, "text/plain; charset=utf-8", "404 Not Found");
    } else {
      send(res, 500, "text/plain; charset=utf-8", "500 Internal Server Error");
    }
    return;
  }
  send(res, 200, "text/plain; charset=utf-8", "ok");
}

/**
 * Collects the request body as a Buffer, discarding data past `maxBytes` so
 * a runaway body cannot OOM the dev server. Returns null past the ceiling
 * (the oversized body is still drained so a 413 can be sent); throws when
 * the request stream fails mid-read.
 */
async function readBody(req, maxBytes) {
  const chunks = [];
  let size = 0;
  let over = false;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      over = true;
    } else {
      chunks.push(chunk);
    }
  }
  return over ? null : Buffer.concat(chunks);
}

async function sendLedgerIndex(res) {
  let entries;
  try {
    entries = await ledgerIndex();
  } catch {
    send(res, 500, "text/plain; charset=utf-8", "500 Internal Server Error");
    return;
  }
  send(res, 200, "application/json; charset=utf-8", JSON.stringify(entries));
}

/**
 * Derives the ledger index from exactly two store levels
 * (`<lord-slug>/<route-id>.json`): one entry per existing file, sorted by
 * lord/route, stitching each document's top-level `status`/`updatedAt`. A
 * file that cannot be read or parsed is reported as `"corrupt"` with
 * `updatedAt: null` — the index never throws and never repairs. Stray files
 * outside the two-level layout (root-level files, non-directories,
 * non-`.json` files, deeper nests) are ignored.
 */
async function ledgerIndex() {
  let lords;
  try {
    lords = await readdir(LEDGER_ROOT, { withFileTypes: true });
  } catch (err) {
    // The store root need not exist yet: an empty store is an empty index.
    if (err?.code === "ENOENT") return [];
    throw err;
  }
  const entries = [];
  for (const lord of lords) {
    if (!lord.isDirectory()) continue;
    let files;
    try {
      files = await readdir(join(LEDGER_ROOT, lord.name), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith(".json")) continue;
      const routeId = file.name.slice(0, -".json".length);
      try {
        const parsed = JSON.parse(await readFile(join(LEDGER_ROOT, lord.name, file.name), "utf8"));
        entries.push({
          lordSlug: lord.name,
          routeId,
          status: parsed?.status,
          updatedAt: parsed?.updatedAt,
        });
      } catch {
        entries.push({ lordSlug: lord.name, routeId, status: "corrupt", updatedAt: null });
      }
    }
  }
  entries.sort((a, b) => `${a.lordSlug}/${a.routeId}`.localeCompare(`${b.lordSlug}/${b.routeId}`));
  return entries;
}

const port = Number(process.env.PORT ?? DEFAULT_PORT);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  console.error(
    `static-server: invalid PORT ${JSON.stringify(process.env.PORT)} — expected an integer 0–65535`,
  );
  process.exitCode = 1;
} else if (!existsSync(join(DIST_ROOT, FALLBACK))) {
  console.error("static-server: build output missing — run `npm run build` first, then start the server again");
  process.exitCode = 1;
} else {
  const server = createServer(handleRequest);
  server.listen(port, HOST, () => {
    // The actual bound port — differs from `port` when PORT is 0 (ephemeral).
    console.log(`listening on http://${HOST}:${server.address().port}`);
  });
}
