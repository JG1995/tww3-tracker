/**
 * Confidence-state badge vocabulary (feature DESIGN §"Confidence Badges";
 * DESIGN.md "Confidence Badge" and "Icons and dependencies"): the mono
 * uppercase display label and the hand-authored 12px inline-SVG icon for
 * every `ClaimState`. Pure — no I/O, no rendering.
 *
 * Both consumers import this module so one vocabulary drives the identical
 * badge treatment everywhere: `app/components/ConfidenceBadge.ts` (the
 * data-driven VNode) and `app/content/load.ts` (the boot-time `::claim`
 * callout HTML). Icons are hand-authored 1px-stroke round-join inline SVG
 * inheriting `currentColor` — no icon library, no emoji, no CSS-shape
 * substitutes, and `package.json` stays unchanged.
 */

import type { ClaimState } from "./content/types.ts";

/** One confidence state's badge: the display label + the icon's inner SVG markup. */
export interface ConfidenceBadgeVocabulary {
  /** Mono uppercase display label (the DESIGN confidence table — never colour alone). */
  readonly label: string;
  /**
   * Inner markup of the 12×12 icon `<svg>`: one or more path/circle elements
   * inheriting the wrapper's `stroke="currentColor"`, 1px width, round caps
   * and joins.
   */
  readonly iconSvg: string;
}

/** `ClaimState` → label + icon. Labels match the DESIGN confidence table exactly. */
export const CONFIDENCE_BADGES = {
  // The `satisfies` keeps the per-entry literal types (label/iconSvg as written)
  // while still enforcing the exhaustive four-state vocabulary.

  confirmed: {
    label: "CONFIRMED",
    iconSvg: '<path d="M2.5 6.5 5 9 9.5 3.5"/>',
  },
  historical: {
    label: "HISTORICAL",
    iconSvg: '<circle cx="6" cy="6" r="4.5"/><path d="M6 3.5V6l1.9 1.4"/>',
  },
  inferred: {
    label: "INFERRED",
    iconSvg:
      '<path d="M3 1.5v6"/><circle cx="3" cy="9" r="1.5"/><circle cx="9" cy="3" r="1.5"/><path d="M9 4.5a4.5 4.5 0 0 1-4.5 4.5"/>',
  },
  "verify-in-campaign": {
    label: "VERIFY",
    iconSvg: '<path d="M2.5 1.5v9.5"/><path d="M2.5 2.5 7.5 4.5 2.5 6"/>',
  },
} satisfies Record<ClaimState, ConfidenceBadgeVocabulary>;
