import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Locally enumerated token contract, derived one-for-one from the YAML frontmatter
// of `.wiki/DESIGN.md`: every CSS custom property name -> exact expected value.
const EXPECTED: Record<string, string> = {
  // Foundation — background & surface elevation
  "--color-background": "oklch(0.173 0 0)",
  "--color-on-background": "oklch(0.949 0 0)",
  "--color-surface-dim": "oklch(0.159 0 0)",
  "--color-surface": "oklch(0.22 0.006 56)",
  "--color-surface-bright": "oklch(0.351 0.005 39)",
  "--color-surface-container-lowest": "oklch(0.159 0 0)",
  "--color-surface-container-low": "oklch(0.196 0.003 68)",
  "--color-surface-container": "oklch(0.22 0.006 56)",
  "--color-surface-container-high": "oklch(0.275 0.006 56)",
  "--color-surface-container-highest": "oklch(0.312 0.005 39)",
  "--color-on-surface": "oklch(0.949 0 0)",
  "--color-on-surface-variant": "oklch(0.615 0.01 45)",
  "--color-inverse-surface": "oklch(0.949 0 0)",
  "--color-inverse-on-surface": "oklch(0.22 0.006 56)",
  // Borders & outlines
  "--color-outline": "oklch(0.351 0.005 39)",
  "--color-outline-variant": "oklch(0.263 0.006 56)",
  "--color-surface-tint": "oklch(0.663 0.19 42)",
  // Primary — signal orange (live/active state; never a button fill)
  "--color-primary": "oklch(0.663 0.19 42)",
  "--color-on-primary": "oklch(0.173 0 0)",
  "--color-primary-container": "oklch(0.319 0.068 46)",
  "--color-on-primary-container": "oklch(0.858 0.067 48)",
  "--color-inverse-primary": "oklch(0.84 0.076 47)",
  // Secondary — metric green (positive/complete state)
  "--color-secondary": "oklch(0.794 0.089 138)",
  "--color-on-secondary": "oklch(0.173 0 0)",
  "--color-secondary-container": "oklch(0.371 0.031 138)",
  "--color-on-secondary-container": "oklch(0.899 0.039 137)",
  "--color-inverse-secondary": "oklch(0.89 0.044 138)",
  // Tertiary — deliberately neutral (warm granite, uncoloured)
  "--color-tertiary": "oklch(0.615 0.01 45)",
  "--color-on-tertiary": "oklch(0.173 0 0)",
  "--color-tertiary-container": "oklch(0.275 0.006 56)",
  "--color-on-tertiary-container": "oklch(0.949 0 0)",
  // Semantic — status indicators
  "--color-success": "oklch(0.794 0.089 138)",
  "--color-on-success": "oklch(0.173 0 0)",
  "--color-success-container": "oklch(0.371 0.031 138)",
  "--color-on-success-container": "oklch(0.899 0.039 137)",
  "--color-warning": "oklch(0.663 0.19 42)",
  "--color-on-warning": "oklch(0.173 0 0)",
  "--color-warning-container": "oklch(0.319 0.068 46)",
  "--color-on-warning-container": "oklch(0.858 0.067 48)",
  "--color-error": "oklch(0.65 0.2 27)",
  "--color-on-error": "oklch(0.1 0.02 27)",
  "--color-error-container": "oklch(0.28 0.12 27)",
  "--color-on-error-container": "oklch(0.88 0.08 27)",
  "--color-info": "oklch(0.77 0.007 53)",
  "--color-on-info": "oklch(0.173 0 0)",
  "--color-info-container": "oklch(0.275 0.006 56)",
  "--color-on-info-container": "oklch(0.77 0.007 53)",

  // Typography
  // role: display
  "--font-display-family": "Geist",
  "--font-display-size": "44px",
  "--font-display-weight": "400",
  "--font-display-line-height": "1.12",
  "--font-display-letter-spacing": "-0.025em",
  // role: headline-lg
  "--font-headline-lg-family": "Geist",
  "--font-headline-lg-size": "28px",
  "--font-headline-lg-weight": "400",
  "--font-headline-lg-line-height": "1.2",
  "--font-headline-lg-letter-spacing": "-0.01em",
  // role: headline-md
  "--font-headline-md-family": "Geist",
  "--font-headline-md-size": "22px",
  "--font-headline-md-weight": "400",
  "--font-headline-md-line-height": "1.25",
  "--font-headline-md-letter-spacing": "-0.008em",
  // role: headline-sm
  "--font-headline-sm-family": "Geist",
  "--font-headline-sm-size": "18px",
  "--font-headline-sm-weight": "500",
  "--font-headline-sm-line-height": "1.35",
  // role: body-lg
  "--font-body-lg-family": "Geist",
  "--font-body-lg-size": "16px",
  "--font-body-lg-weight": "400",
  "--font-body-lg-line-height": "1.5",
  // role: body-md
  "--font-body-md-family": "Geist",
  "--font-body-md-size": "14px",
  "--font-body-md-weight": "400",
  "--font-body-md-line-height": "1.45",
  // role: body-sm
  "--font-body-sm-family": "Geist",
  "--font-body-sm-size": "13px",
  "--font-body-sm-weight": "400",
  "--font-body-sm-line-height": "1.4",
  // role: label-lg
  "--font-label-lg-family": "Geist",
  "--font-label-lg-size": "14px",
  "--font-label-lg-weight": "500",
  "--font-label-lg-line-height": "1.2",
  // role: label-md
  "--font-label-md-family": "Geist Mono",
  "--font-label-md-size": "12px",
  "--font-label-md-weight": "400",
  "--font-label-md-line-height": "1.2",
  "--font-label-md-letter-spacing": "-0.02em",
  // role: label-sm
  "--font-label-sm-family": "Geist Mono",
  "--font-label-sm-size": "12px",
  "--font-label-sm-weight": "400",
  "--font-label-sm-line-height": "1.2",
  "--font-label-sm-letter-spacing": "-0.02em",
  // role: mono-lg
  "--font-mono-lg-family": "Geist Mono",
  "--font-mono-lg-size": "24px",
  "--font-mono-lg-weight": "400",
  "--font-mono-lg-line-height": "1.2",
  // role: mono-md
  "--font-mono-md-family": "Geist Mono",
  "--font-mono-md-size": "14px",
  "--font-mono-md-weight": "400",
  "--font-mono-md-line-height": "1.4",
  // role: mono-sm
  "--font-mono-sm-family": "Geist Mono",
  "--font-mono-sm-size": "12px",
  "--font-mono-sm-weight": "400",
  "--font-mono-sm-line-height": "1.4",

  // Rounded
  "--radius-none": "0",
  "--radius-xs": "3px",
  "--radius-default": "3px",
  "--radius-md": "10px",
  "--radius-lg": "20px",
  "--radius-full": "9999px",

  // Spacing
  "--space-unit": "8px",
  "--space-table-row-height": "40px",
  "--space-header-height": "64px",
  "--space-gutter": "24px",
  "--space-stack-xs": "8px",
  "--space-stack-sm": "16px",
  "--space-stack-md": "24px",
  "--space-stack-lg": "40px",
  "--space-stack-xl": "56px",
  "--space-stack-2xl": "96px",
  "--space-content-max-width": "1200px",
};

const css = readFileSync(fileURLToPath(new URL("../app/styles/tokens.css", import.meta.url)), "utf8");

// Parse custom property declarations: full name (including `--`) -> trimmed value.
const parsed = new Map<string, string>();
for (const match of css.matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
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
