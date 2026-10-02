/**
 * Content lint CLI (package lint-cli, commit 3).
 *
 * Thin glue over the shared rule set in `app/content/lint.ts`: bundles that
 * module (plus the types it needs) to a temp file with the esbuild JS API,
 * runs `lintContent` over a content root with a real filesystem reader, and
 * prints one `file:field — message` line per violation. No validation logic
 * lives here — every rule is in `app/content/lint.ts`.
 *
 * Exit codes: 0 clean or "no content yet"; 1 violations; 2 usage or
 * environment error (bad arguments, esbuild unavailable, unreadable root).
 */

import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** Repo root, derived from this script's own path so any cwd works. */
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Filesystem ContentReader — the `ContentReader` the content domain injects. */
function fsReader(root) {
  return {
    readFile: (path) => readFile(join(root, path), "utf8"),
    async listFiles() {
      const files = [];
      const walk = async (dir) => {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
          const inner = join(dir, entry.name);
          if (entry.isDirectory()) await walk(inner);
          else files.push(relative(root, inner).replaceAll("\\", "/"));
        }
      };
      await walk(root);
      return files.sort();
    },
  };
}

/** Bundles app/content/lint.ts to a temp file and returns its `lintContent`. */
async function loadLint() {
  const esbuild = await import("esbuild");
  const dir = await mkdtemp(join(tmpdir(), "content-lint-"));
  try {
    await esbuild.build({
      entryPoints: [join(repoRoot, "app", "content", "lint.ts")],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: join(dir, "lint.mjs"),
      logLevel: "silent",
    });
    return await import(pathToFileURL(join(dir, "lint.mjs")).href);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Violation files are content-root-relative; repo-relative when possible. */
function displayPath(contentRoot, file) {
  const rel = relative(repoRoot, join(contentRoot, file));
  return rel === "" || rel.startsWith("..") ? file : rel;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    console.error("usage: node tools/content-lint.mjs [<content-root>]");
    return 2;
  }
  const root = args.length === 1 ? resolve(args[0]) : join(repoRoot, "content");

  // Fresh-checkout state: absent content dir / index.json is a pass, not a failure.
  try {
    await stat(join(root, "index.json"));
  } catch (err) {
    if (err?.code === "ENOENT") {
      console.log(
        `no content yet at ${root} — no content/index.json; add guides under content/ (see the site DESIGN §4 layout)`,
      );
      return 0;
    }
    console.error(`content-lint: cannot read content root ${root}: ${err?.message ?? err}`);
    return 2;
  }

  let lint;
  try {
    lint = await loadLint();
  } catch (err) {
    console.error(`content-lint: cannot bundle app/content/lint.ts via esbuild: ${err?.message ?? err}`);
    return 2;
  }

  const violations = await lint.lintContent(fsReader(root));
  for (const { file, field, message } of violations) {
    console.log(`${displayPath(root, file)}:${field} — ${message}`);
  }
  return violations.length > 0 ? 1 : 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (err) => {
    console.error(`content-lint: ${err?.message ?? err}`);
    process.exitCode = 2;
  },
);
