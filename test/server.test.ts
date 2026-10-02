/**
 * Spawned-process proof for the static local server (package static-server,
 * commit 7).
 *
 * Boots the real CLI (`tools/server.mjs`) on port 0 via `PORT=0`, discovers
 * the bound port from its stdout line, then asserts the four mandated request
 * shapes with plain fetch: `/` serves the built `dist/index.html`, the
 * committed `content/index.json` is served under `/content/`, unknown
 * non-content paths fall back to the SPA shell, and a traversal attempt that
 * reaches the server decodes outside its root and 404s without leaking
 * `package.json`. The child is shut down cleanly at the end.
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
import { existsSync, readFileSync } from "node:fs";
import { once } from "node:events";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const SERVER = fileURLToPath(new URL("../tools/server.mjs", import.meta.url));

/** The spawned CLI process: stdin ignored, stdout/stderr piped. */
type ServerProcess = ChildProcessByStdio<null, Readable, Readable>;

const SERVER_LINE = /listening on http:\/\/127\.0\.0\.1:(\d+)/;

let child: ServerProcess;
let origin: string;
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

  child = spawn(process.execPath, [SERVER], {
    env: { ...process.env, PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  origin = await waitForOrigin(child);
});

after(async () => {
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
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
