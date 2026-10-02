/**
 * The Confidence Badge (feature DESIGN §"Confidence Badges"; DESIGN.md
 * "Confidence Badge"): a presentational VNode rendering one claim's
 * confidence state as icon + mono uppercase label + state colour, with the
 * optional trailing source links. The badge computes nothing — the state and
 * its resolved sources come from the content tree (ADR-0002) — and it shares
 * its label + icon vocabulary with the boot-time `::claim` callout renderer
 * through `app/badges.ts`, so data-driven claims and callout prose render the
 * identical treatment (colour is never the sole indicator).
 */

import { h, type JSX } from "preact";
import { CONFIDENCE_BADGES } from "../badges.ts";
import type { ClaimState, Source } from "../content/types.ts";

export interface ConfidenceBadgeProps {
  readonly state: ClaimState;
  /** Resolved sources to trail as links; omit or pass [] when the claim cites none. */
  readonly sources?: readonly Source[];
}

/**
 * The 12×12 icon wrapper: design-system 1px-stroke round-join stroke style,
 * inheriting `currentColor` (DESIGN.md "Icons and dependencies").
 */
function iconMarkup(iconSvg: string): JSX.Element {
  return h("svg", {
    className: "confidence-badge__icon",
    viewBox: "0 0 12 12",
    width: "12",
    height: "12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    dangerouslySetInnerHTML: { __html: iconSvg },
  });
}

export function ConfidenceBadge(props: ConfidenceBadgeProps): JSX.Element {
  const { state, sources = [] } = props;
  const badge = CONFIDENCE_BADGES[state];
  return h(
    "span",
    { className: `confidence-badge confidence-badge--${state}` },
    iconMarkup(badge.iconSvg),
    h("span", { className: "confidence-badge__label" }, badge.label),
    sources.map((source) =>
      h("a", { className: "confidence-badge__src", href: source.url, key: source.id }, source.title),
    ),
  );
}
