/**
 * Spawned-process proof for the content lint CLI (package lint-cli, commit 3).
 *
 * The CLI is the product surface, so these tests run the real script with
 * node:child_process over fixture roots: the committed two-lord fixtures pass
 * (exit 0), a broken temp-dir copy fails (exit 1 plus a formatted violation
 * line), and an empty or absent root is the "no content yet" pass (exit 0
 * with the notice). Broken variants only ever touch temp-dir copies — the
 * committed fixtures are never mutated.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CLI = fileURLToPath(new URL("../tools/content-lint.mjs", import.meta.url));
const FIXTURES = fileURLToPath(new URL("fixtures/content", import.meta.url));

/** Runs the CLI over a content root; resolves the exit code and captured output. */
function runCli(root: string): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, root], { encoding: "utf8" }, (err, stdout, stderr) => {
      if (err === null) {
        resolve({ code: 0, stdout, stderr });
      } else {
        // A non-zero exit surfaces as an error whose .code is the exit code.
        resolve({ code: typeof err.code === "number" ? err.code : null, stdout, stderr });
      }
    });
  });
}

// ─── 1. Pass: the valid two-lord fixture is clean ───────────────────────────

test("valid fixture root exits 0 with no violation output", async () => {
  const { code, stdout, stderr } = await runCli(FIXTURES);
  assert.equal(code, 0);
  assert.equal(stdout, "");
  assert.equal(stderr, "");
});

// ─── 2. Fail: a broken fixture copy exits 1 with a formatted violation ──────

test("broken fixture copy exits 1 and prints a file:field — message line", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lint-cli-fail-"));
  try {
    await cp(FIXTURES, dir, { recursive: true });
    // One seeded violation: an orphan file no manifest names.
    await writeFile(join(dir, "als-rhyn-of-lorek", "stray.md"), "not named by any manifest\n");

    const { code, stdout } = await runCli(dir);
    assert.equal(code, 1);
    assert.ok(
      stdout.includes("als-rhyn-of-lorek/stray.md:orphan — "),
      `expected an orphan violation line naming file and field; got: ${JSON.stringify(stdout)}`,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ─── 3. Fail: a frontmatter number diverging from the manifest is caught ────

test("route frontmatter number diverging from guide.json routes[] fails with a number violation", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lint-cli-number-"));
  try {
    await cp(FIXTURES, dir, { recursive: true });
    // The als-rhyn manifest pins route "dark-conduits" as number "I"; give the
    // frontmatter another valid number so only the cross-check can fail it.
    const routePath = join(dir, "als-rhyn-of-lorek", "routes", "route-1.md");
    const body = await readFile(routePath, "utf8");
    await writeFile(routePath, body.replace("number: I", "number: II"));

    const { code, stdout } = await runCli(dir);
    assert.equal(code, 1);
    assert.ok(
      stdout.includes(
        'als-rhyn-of-lorek/routes/route-1.md:number — route number "II" does not match guide.json routes[] number "I"',
      ),
      `expected a route number cross-check violation; got: ${JSON.stringify(stdout)}`,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ─── 4. Fail: the new dataset-schema and panel-order rules at the CLI seam ──

test("a schema-invalid army dataset exits 1 with a datasets field violation line", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lint-cli-army-"));
  try {
    await cp(FIXTURES, dir, { recursive: true });
    // One seeded violation: an army unit row with a non-numeric count.
    await writeFile(
      join(dir, "als-rhyn-of-lorek", "data", "armies.json"),
      JSON.stringify({
        "dark-conduits": {
          early: {
            label: "Early",
            name: "The first column",
            units: [{ n: "8", name: "Spearmen", role: "Holding line", kind: "line" }],
            legendary: [],
            generic: [],
            notes: [],
            plan: [],
            size: 20,
            sources: [],
          },
        },
      }),
    );

    const { code, stdout } = await runCli(dir);
    assert.equal(code, 1);
    assert.ok(
      stdout.includes(
        "als-rhyn-of-lorek/data/armies.json:datasets — armies.dark-conduits.early.units[0].n must be a number",
      ),
      `expected an army unit-row violation line; got: ${JSON.stringify(stdout)}`,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("an unresolvable panel-order id exits 1 with a panelOrder violation naming the id", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lint-cli-panel-"));
  try {
    await cp(FIXTURES, dir, { recursive: true });
    // One seeded violation: a skills id no entry in the lord-wide map exists for.
    const routePath = join(dir, "als-rhyn-of-lorek", "routes", "route-1.md");
    const body = await readFile(routePath, "utf8");
    await writeFile(routePath, body.replace("  skills: [conduit-rites]", "  skills: [ghost-skill]"));

    const { code, stdout } = await runCli(dir);
    assert.equal(code, 1);
    assert.ok(
      stdout.includes(
        'als-rhyn-of-lorek/routes/route-1.md:panelOrder — panelOrder id "ghost-skill" (group "skills") does not resolve to an entry in the lord\'s "skills" dataset',
      ),
      `expected an unresolvable panel-order id violation; got: ${JSON.stringify(stdout)}`,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ─── 5. No-content: empty and absent roots are a pass with the notice ───────

test("empty content root is the no-content-yet pass: exit 0 with the notice", async () => {
  const dir = await mkdtemp(join(tmpdir(), "lint-cli-empty-"));
  try {
    const { code, stdout } = await runCli(dir);
    assert.equal(code, 0);
    assert.ok(stdout.includes("no content yet"), `expected the no-content notice; got: ${JSON.stringify(stdout)}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("absent content root is the no-content-yet pass: exit 0 with the notice", async () => {
  const { code, stdout } = await runCli(join(tmpdir(), "lint-cli-absent-", "never-created"));
  assert.equal(code, 0);
  assert.ok(stdout.includes("no content yet"), `expected the no-content notice; got: ${JSON.stringify(stdout)}`);
});
