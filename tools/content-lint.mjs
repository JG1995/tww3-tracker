/**
 * Content lint CLI (package lint-cli, commit 3).
 *
 * Thin glue over the shared rule set in `app/content/lint.ts`: bundles that
 * module (plus the types it needs) to a temp file with the esbuild JS API,
 * runs `lintContent` over a content root with a real filesystem reader, and
 * prints one `file:field — message` line per violation. The shape rules stay
 * in `app/content/lint.ts`; the only rule that reads files is the DESIGN §5
 * crest pre-run check below (a named crest must exist and carry an `<svg`
 * start tag — the same verdict the boot pass applies via `isCrestSvg`).
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

/**
 * The DESIGN §5 crest pre-run check: for every guide that names a `crest`,
 * the file must exist and carry an `<svg` start tag — the same verdict the
 * boot pass applies in `load.ts`, via the shared `isCrestSvg` predicate.
 */
async function lintCrestFiles(root, lint) {
  const out = [];
  let index;
  try {
    index = JSON.parse(await readFile(join(root, "index.json"), "utf8"));
  } catch {
    return out; // a missing or broken index is already a lintContent violation
  }
  const lords = Array.isArray(index?.lords) ? index.lords : [];
  for (const slug of lords) {
    if (typeof slug !== "string") continue;
    // Unsafe slugs are a lintContent violation; never read outside the root.
    if (slug === "" || slug === "." || slug === ".." || slug.includes("/") || slug.includes("\\")) continue;
    let guide;
    try {
      guide = JSON.parse(await readFile(join(root, slug, "guide.json"), "utf8"));
    } catch {
      continue; // a missing or unparseable manifest is already a lintContent violation
    }
    const crest = guide?.crest;
    if (typeof crest !== "string" || crest === "") continue; // shape is lintContent's rule
    const path = `${slug}/${crest}`;
    let text;
    try {
      text = await readFile(join(root, path), "utf8");
    } catch {
      out.push({ file: path, field: "crest", message: "crest file named in guide.json is missing" });
      continue;
    }
    if (!lint.isCrestSvg(text)) {
      out.push({ file: path, field: "crest", message: "crest file must contain an <svg start tag" });
    }
  }
  return out;
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

  const violations = [
    ...(await lint.lintContent(fsReader(root))),
    ...(await lintCrestFiles(root, lint)),
  ];
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
