import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Locally enumerated token contract, derived one-for-one from the
// `.wiki/DESIGN.md` YAML frontmatter (feature DESIGN §4 literal names):
// every CSS custom property name -> exact expected value, verbatim from the
// reference atlases. Palette keys are the atlases' `:root` hex; typography,
// component, layout, spacing, and shape keys are the atlas treatments DESIGN
// §4 fixes. The Factory-era `--color-*` / `--font-*` naming scheme is
// retired with this package, so the sheet must also be free of oklch() and
// Geist, and app.css must reference no Factory-era token at all.
const EXPECTED: Record<string, string> = {
  // Palette — DESIGN §4, verbatim atlas `:root` hex
  "--bg": "#10171c",
  "--surface": "#172129",
  "--surface2": "#1d2a33",
  "--surface3": "#23333e",
  "--ink": "#eeeae2",
  "--muted": "#b4c0c6",
  "--faint": "#859aa7",
  "--line": "#354651",
  "--accent": "#ddc485",
  "--brass": "#ccaa72",
  "--good": "#adcead",
  "--danger": "#f0aaa0",

  // Typography — Georgia serif (system) 400 for display; Segoe UI sans for
  // body/chrome; the eyebrow spec
  "--serif": 'Georgia, "Times New Roman", serif',
  "--heading-weight": "400",
  "--heading-line-height": "1.22",
  "--h1-size": "2.2rem",
  "--h2-size": "1.6rem",
  "--h3-size": "1.18rem",
  "--h4-size": "1.05rem",
  "--sans": '"Segoe UI", Arial, sans-serif',
  "--text-base": "16px",
  "--text-small": "0.84rem",
  "--text-line-height": "1.5",
  "--eyebrow-size": "0.66rem",
  "--eyebrow-track": "1.8px",
  "--eyebrow-weight": "650",
  "--eyebrow-color": "var(--accent)",
  "--eyebrow-transform": "uppercase",

  // Components — DESIGN §4 atlas treatments
  "--card-fill": "linear-gradient(130deg,#1b2831,#172129)",
  "--card-border-color": "var(--line)",
  "--card-border-top-color": "#536472",
  "--card-radius": "5px",
  "--card-padding": "22px",
  "--button-fill": "var(--surface3)",
  "--button-border-color": "#546775",
  "--button-radius": "4px",
  "--button-padding": "8px 12px",
  "--link-color": "var(--accent)",
  "--kbd-size": "0.68rem",
  "--kbd-border-color": "var(--line)",
  "--kbd-radius": "3px",
  "--kbd-padding": "0 5px",
  "--kbd-color": "var(--muted)",

  // Layout — DESIGN §4 atlas measures
  "--wrap-width": "100%",
  "--wrap-max-width": "3360px",
  "--wrap-side-padding": "24px",
  "--header-height": "170px",
  "--header-blur": "10px",
  "--two-track": "1.65fr 0.8fr",

  // Spacing — the 16px base gap plus section steps
  "--gap-base": "16px",
  "--gap-xs": "8px",
  "--gap-md": "24px",
  "--gap-lg": "40px",
  "--gap-xl": "56px",
  "--gap-2xl": "96px",
  "--table-row-height": "40px",

  // Shapes
  "--radius-full": "9999px",
};

const tokensCss = readFileSync(
  fileURLToPath(new URL("../app/styles/tokens.css", import.meta.url)),
  "utf8",
);
const appCss = readFileSync(
  fileURLToPath(new URL("../app/styles/app.css", import.meta.url)),
  "utf8",
);

// Parse custom property declarations: full name (including `--`) -> trimmed value.
const parsed = new Map<string, string>();
for (const match of tokensCss.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
  parsed.set(match[1], match[2].trim());
}

test("tokens.css defines every DESIGN.md frontmatter token non-empty and exact", () => {
  // No extra or duplicate tokens: the sheet is a one-for-one mirror of the frontmatter.
  assert.equal(
    parsed.size,
    Object.keys(EXPECTED).length,
    "tokens.css must declare exactly the frontmatter token set",
  );
  for (const [name, expected] of Object.entries(EXPECTED)) {
    const actual = parsed.get(name);
    assert.ok(actual !== undefined, `missing token --${name}`);
    assert.equal(actual, expected, `unexpected value for --${name}`);
  }
});

test("tokens.css is free of Factory visual-system remnants", () => {
  assert.ok(!tokensCss.includes("oklch("), "tokens.css must not use oklch() — the atlas palette is hex");
  assert.ok(!tokensCss.includes("Geist"), "tokens.css must not reference the Geist webfont");
  assert.ok(!tokensCss.includes("--color-"), "tokens.css must not use the Factory --color-* scheme");
  assert.ok(!tokensCss.includes("--font-"), "tokens.css must not use the Factory --font-* scheme");
});

test("app.css retokens every surface and references no Factory remnant", () => {
  assert.ok(!appCss.includes("oklch("), "app.css must not use oklch() — the atlas palette is hex");
  assert.ok(!appCss.includes("Geist"), "app.css must not reference the Geist webfont");
  assert.ok(!appCss.includes("--color-"), "app.css must not reference the Factory --color-* scheme");
  assert.ok(!appCss.includes("--font-"), "app.css must not reference the Factory --font-* scheme");
});
