/**
 * Static local server (package static-server, commit 7).
 *
 * Dependency-free Node `http` server for the SPA: serves the built site from
 * `dist/` at `/` and the committed guide content from `content/` under
 * `/content/`, GET only, with no write path of any kind (the ledger write
 * path is F5). Unknown non-content paths fall back to `dist/index.html` so
 * the hash-routed shell loads at any path.
 *
 * Binds 127.0.0.1 on port 8123 (override with `PORT`). The bound URL line is
 * printed to stdout, so `PORT=0` (ephemeral) callers can discover the actual
 * port. Requires `dist/index.html` at startup — run `npm run build` first;
 * when it is missing the server prints that message and exits non-zero.
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DIST_ROOT = join(repoRoot, "dist");
const CONTENT_ROOT = join(repoRoot, "content");
const HOST = "127.0.0.1";
const DEFAULT_PORT = 8123;
const FALLBACK = "index.html";

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
  if (req.method !== "GET") {
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
