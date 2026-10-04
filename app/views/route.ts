/**
 * Route view (feature DESIGN §2/§3 — the F2 route page): the Route Tab Strip
 * at the top (DESIGN §2 — the active tab is this route's own id, derived from
 * the hash; the view receives the lord for the strip's manifest routes), the
 * bone Route Identity Card (DESIGN.md "Route Identity Card" — mono eyebrow
 * with a primary dot, the official VCO title or the explicit unresearched
 * marker, the dimmed thematic subtitle, objective and reward as Confidence
 * Badged claims with their resolved source links, plus
 * interpretation/bottleneck/motto when present), the optional VCO
 * objective-item undercard from `data/vco.json`'s per-route entry (each item a
 * Confidence Badge-carrying row; nothing renders when the entry is absent —
 * DESIGN §4's "optional" list), and the section region as the registry walk
 * (DESIGN §2/§6): required sections, optional sections, then the declared
 * transition gaps — each slot rendered at its fixed registry position as the
 * present section (a Content Panel whose H2 reads as the panel's mono eyebrow
 * and keeps the tree's section id for the router's section anchor) or an
 * in-flow Content Gap Marker for a declared gap; the F1 trailing gap list and
 * its "no sections yet" fallback are gone. Body H2s carry the section ids
 * from the tree so the router's section anchor can scroll them into view.
 *
 * The VCO undercard also carries the campaign action region (feature DESIGN
 * Journey 1; package `ledger-route-start`): a presentational block driven by
 * the caller-supplied `campaign` props — the start action while the index is
 * ready and no campaign is active, the open-ledger link when the active
 * campaign is this route's, or the start-blocked message linking to the
 * active campaign (the DESIGN's single-active-campaign rule). No I/O lives
 * here; the pure derivation runs over the index the caller provides.
 */

import { h, type JSX } from "preact";
import { TabStrip } from "../components/TabStrip.ts";
import { ConfidenceBadge } from "../components/ConfidenceBadge.ts";
import { Dashboard } from "../components/dashboard.ts";
import { OPTIONAL_SECTIONS, REQUIRED_SECTIONS } from "../content/lint.ts";
import type { Claim, Lord, Route, Section, Source } from "../content/types.ts";
import { getPanelEntries, getVcoObjectives, resolveSources } from "../content/query.ts";
import type { LedgerIndexEntry } from "../ledger/types.ts";
import type { LedgerIndexState } from "../ledger/useCampaign.ts";

/** Declared transition gaps are those titles the route authors as `Transition → <route>`. */
const TRANSITION_PREFIX = "Transition → ";

/**
 * One resolved `Transition → <route>` title (feature DESIGN §4 "Link
 * derivation"): the target route's id plus that target's real `Opening`
 * section tree id — read from the tree, never re-slugified or invented.
 */
export interface TransitionTarget {
  readonly targetId: string;
  /** The target route's own `Opening` section tree id, or null when `Opening` is a declared gap. */
  readonly openingSectionId: string | null;
}

/**
 * The pure transition-target resolution: when the title starts with the
 * `Transition → ` prefix, the suffix is matched against the lord's manifest
 * routes by id or name — exactly the `isKnownSectionTitle` scoping the lint
 * applies in `app/content/lint.ts` (`r.id === target || r.name === target`).
 * Returns the target route id plus its real `Opening` section tree id
 * (`target.sections.find(s => s.title === "Opening")?.id`), or null for a
 * non-transition title or a suffix that matches no route; the view then
 * renders the plain H2.
 */
export function transitionTarget(lord: Lord, title: string): TransitionTarget | null {
  if (!title.startsWith(TRANSITION_PREFIX)) return null;
  const target = title.slice(TRANSITION_PREFIX.length);
  const route = lord.routes.find((r) => r.id === target || r.name === target);
  if (route === undefined) return null;
  const opening = route.sections.find((s) => s.title === "Opening");
  return { targetId: route.id, openingSectionId: opening === undefined ? null : opening.id };
}

export function RouteView(props: { lord: Lord; route: Route; campaign?: RouteCampaignProps }): JSX.Element {
  const { lord, route, campaign } = props;
  return h(
    "article",
    { className: "route-page" },
    h(TabStrip, { lordSlug: lord.slug, routes: lord.routes, activeId: route.id }),
    identityCard(lord, route),
    vcoUndercard(lord, route, campaign),
    routeBody(lord, route),
    // Keyed by route id: navigating between routes remounts the dashboard and
    // resets its component-local panel selection to the first panel (a
    // within-route section-anchor hash change does not). The lord context is
    // threaded so the panel anatomy resolves source ids the same way the
    // identity card does (DESIGN §4; `resolveSources`).
    h(Dashboard, { key: route.id, lord, ...getPanelEntries(lord, route) }),
  );
}

/**
 * The bone Route Identity Card: mono uppercase eyebrow with a primary dot, the
 * official VCO title (or the explicit unresearched marker), the dimmed
 * thematic subtitle, badged objective/reward claims, and the notes when
 * present. The official-title slot and the thematic subtitle stay distinct
 * elements with distinct classes — never interchangeable (DESIGN §4).
 */
function identityCard(lord: Lord, route: Route): JSX.Element {
  return h(
    "header",
    { className: "route-identity" },
    h(
      "p",
      { className: "route-identity__eyebrow" },
      h("span", { className: "route-identity__dot", "aria-hidden": "true" }),
      `ROUTE ${route.number}`,
    ),
    route.vcoTitle === null
      ? h("p", { className: "route-identity__vco route-identity__vco--unresearched" }, "UNRESEARCHED — no official VCO title recorded")
      : h("p", { className: "route-identity__vco" }, route.vcoTitle),
    h("h1", { className: "route-identity__title" }, route.name),
    h(
      "div",
      { className: "route-identity__claims" },
      claimBlock(lord, "Objective", route.objective),
      claimBlock(lord, "Reward", route.reward),
    ),
    route.interpretation === undefined ? null : identityNote("Interpretation", route.interpretation),
    route.bottleneck === undefined ? null : identityNote("Bottleneck", route.bottleneck),
    route.motto === undefined ? null : identityNote("Motto", route.motto),
  );
}

/**
 * One claim row: the Confidence Badge (state label + colour class + resolved
 * source links) followed by the claim text, verbatim from the frontmatter.
 */
function claimBlock(lord: Lord, label: string, claim: Claim): JSX.Element {
  return h(
    "div",
    { className: "claim-block" },
    h("p", { className: "claim-block__label" }, label),
    h(
      "div",
      { className: "claim-block__row" },
      h(ConfidenceBadge, { state: claim.state, sources: resolveSources(lord, claim.src) }),
      h("span", { className: "claim-block__text" }, claim.text),
    ),
  );
}

function identityNote(label: string, text: string): JSX.Element {
  return h(
    "div",
    { className: "route-identity__note" },
    h("p", { className: "claim-block__label" }, label),
    h("p", { className: "route-identity__note-text" }, text),
  );
}

/**
 * The optional VCO objective-item undercard (DESIGN §4 vco schema): one
 * Confidence Badge-carrying row per item — stable id, text, state and the
 * optional resolved source link — under the identity card, with the campaign
 * action region as its final block. A route without a `data/vco.json` entry
 * renders no undercard at all — and therefore no campaign action (the
 * DESIGN's no-VCO-route no-action rule).
 */
function vcoUndercard(lord: Lord, route: Route, campaign: RouteCampaignProps | undefined): JSX.Element | null {
  const objectives = getVcoObjectives(lord, route.id);
  if (objectives.length === 0) return null;
  return h(
    "section",
    { className: "vco-undercard", "aria-label": "VCO objective items" },
    h("p", { className: "vco-undercard__eyebrow" }, "VCO OBJECTIVES"),
    objectives.map((item) =>
      h(
        "div",
        { key: item.id, className: "vco-undercard__item" },
        h("span", { className: "vco-undercard__id" }, item.id),
        h("span", { className: "vco-undercard__text" }, item.text),
        h(ConfidenceBadge, { state: item.state, sources: resolveSources(lord, item.src ?? []) }),
      ),
    ),
    campaignActionRegion(lord, route, campaign),
  );
}

/**
 * The route page's campaign props (package `ledger-route-start`), supplied by
 * `main.tsx`: the on-demand ledger index read plus the start handler. The
 * view stays presentational — the derivation runs over the caller-supplied
 * index, never any I/O. `index` is the same `LedgerIndexState` shape the
 * ledger page hook exposes, so both surfaces consume the one `io.listLedgers`
 * contract and the same entry types (a route hash is the demand; nothing
 * reads at boot).
 */
export interface RouteCampaignProps {
  /** The index read for this route page; `ready` carries the entries the action region derives from. */
  readonly index: LedgerIndexState;
  /**
   * Start: builds the campaign document from the committed VCO item ids via
   * the pure model, persists it through `io.saveLedger`, and navigates to the
   * ledger hash on success. A failed start surfaces via `startError` — the
   * button must not appear to have worked.
   */
  readonly onStart: () => void;
  /** The typed failure message of the last start attempt (null = none), rendered inline near the action. */
  readonly startError: string | null;
}

/** The start action's label (instrument voice; presentation, not a DESIGN-fixed string). */
const START_ACTION_LABEL = "Start ledger";
/** The open-ledger action's label. */
const OPEN_ACTION_LABEL = "Open ledger";

/**
 * The derived action-region state for one route page: `start` when no
 * campaign is active; `open` when the single active campaign is THIS route's
 * (the open-ledger link); `blocked` when a different campaign is active (the
 * message links to that campaign's ledger hash); `none` when this route's own
 * file is `corrupt` — the ledger's recorded never-silently-repair decision
 * offers neither start nor open for it. A `completed` document for this route
 * does NOT block start (the DESIGN's "startable again"). Only an `active`
 * campaign is the single-active fact (the DESIGN's single-active-campaign
 * rule, site-wide); the index is its one definition.
 */
type RouteCampaignAction =
  | { readonly kind: "start" }
  | { readonly kind: "open"; readonly campaign: LedgerIndexEntry }
  | { readonly kind: "blocked"; readonly campaign: LedgerIndexEntry }
  | { readonly kind: "none" };

/** The three-state + no-action derivation: a pure read over the caller-supplied index entries. */
function campaignAction(entries: readonly LedgerIndexEntry[], lordSlug: string, routeId: string): RouteCampaignAction {
  const active = entries.find((entry) => entry.status === "active");
  if (active !== undefined) {
    return active.lordSlug === lordSlug && active.routeId === routeId
      ? { kind: "open", campaign: active }
      : { kind: "blocked", campaign: active };
  }
  const ownCorrupt = entries.some(
    (entry) => entry.status === "corrupt" && entry.lordSlug === lordSlug && entry.routeId === routeId,
  );
  return ownCorrupt ? { kind: "none" } : { kind: "start" };
}

/** The ledger hash both action links share (the Commit-3 grammar). */
function campaignHref(campaign: LedgerIndexEntry): string {
  return `#/${campaign.lordSlug}/ledger/${campaign.routeId}`;
}

/** The failed-start inline message: `error` ink, announced — the DESIGN's no-silent-writes. */
function campaignStartFailure(message: string): JSX.Element {
  return h("p", { className: "route-campaign__failure", role: "alert" }, message);
}

/**
 * The campaign action region as the VCO undercard's final block (feature
 * DESIGN Journey 1's entry point). While the index read is in flight — and
 * on a failed index read — the region renders nothing: the minimal neutral
 * in-flight treatment, the action appears only once the index resolves. A
 * failed start keeps the start action visible and renders the typed message
 * inline beneath it (never a silent write; the button must not appear to
 * have worked).
 */
function campaignActionRegion(lord: Lord, route: Route, campaign: RouteCampaignProps | undefined): JSX.Element | null {
  if (campaign === undefined || campaign.index.kind !== "ready") return null;
  const action = campaignAction(campaign.index.entries, lord.slug, route.id);
  switch (action.kind) {
    case "start":
      return h(
        "div",
        { className: "route-campaign" },
        h(
          "button",
          { className: "button button--primary", type: "button", onClick: campaign.onStart },
          START_ACTION_LABEL,
        ),
        campaign.startError === null ? null : campaignStartFailure(campaign.startError),
      );
    case "open":
      return h(
        "div",
        { className: "route-campaign" },
        h("a", { className: "button button--primary", href: campaignHref(action.campaign) }, OPEN_ACTION_LABEL),
      );
    case "blocked":
      return h(
        "div",
        { className: "route-campaign" },
        h(
          "p",
          { className: "route-campaign__blocked" },
          "A campaign is already active — ",
          h("a", { href: campaignHref(action.campaign) }, "open it"),
          ".",
        ),
      );
    case "none":
      return null;
  }
}

/**
 * The section region (DESIGN §2 Displayed Data / §6 Layout): a registry walk
 * over the fixed slot order — the required sections, then the optional
 * sections (both in the `lint.ts` registry order), then the route's declared
 * transition gaps in declared order — with present sections and Content Gap
 * Markers interleaved at each slot's position. The lint guarantees every
 * required section is present or declared, so a slot that is neither is
 * unreachable for required sections; an absent, undeclared optional section
 * simply renders nothing. The committed all-gap content therefore renders
 * exactly the registry markers in order, never a blank page.
 */
function routeBody(lord: Lord, route: Route): JSX.Element {
  const transitionSlots = route.gaps.filter((title) => title.startsWith(TRANSITION_PREFIX));
  const slots = [...REQUIRED_SECTIONS, ...OPTIONAL_SECTIONS, ...transitionSlots];
  return h(
    "div",
    { className: "route-body" },
    slots.map((title) => slotAt(lord, route, title)).filter((node) => node !== null),
  );
}

/**
 * One present section's H2 (feature DESIGN §6): a matching transition title
 * renders the heading as a cross-link anchor (`route-section__heading-link`)
 * wrapping the authored heading text verbatim — into the target's `Opening`
 * H2 when that section is present, otherwise the target route page top. The
 * H2 always keeps the tree's section id (the router's section anchor); the
 * prose and Source-panel anatomy stay on the section, never the anchor.
 * Every other title keeps its plain H2.
 */
function sectionHeading(lord: Lord, section: Section): JSX.Element {
  const target = transitionTarget(lord, section.title);
  if (target === null) {
    return h("h2", { id: section.id, className: "route-section__heading" }, section.title);
  }
  const href =
    target.openingSectionId === null
      ? `#/${lord.slug}/route/${target.targetId}`
      : `#/${lord.slug}/route/${target.targetId}/${target.openingSectionId}`;
  return h(
    "h2",
    { id: section.id, className: "route-section__heading" },
    h("a", { className: "route-section__heading-link", href }, section.title),
  );
}

/**
 * One registry slot: the route's section at that exact title renders in
 * place (its H2 as the same-lord cross-link when the title is a matching
 * `Transition → <route>`; with the Source / Verification Note panel after its
 * prose when the section's callout claims cite at least one distinct source);
 * otherwise the title is a declared gap and renders its marker.
 */
function slotAt(lord: Lord, route: Route, title: string): JSX.Element | null {
  const section = route.sections.find((s) => s.title === title);
  if (section !== undefined) {
    return h(
      "section",
      { className: "route-section", "data-section-id": section.id },
      sectionHeading(lord, section),
      h("div", { className: "prose", dangerouslySetInnerHTML: { __html: sectionInnerHtml(section.html) } }),
      sourcePanel(lord, route, section),
    );
  }
  if (route.gaps.includes(title)) {
    return contentGapMarker(title);
  }
  return null;
}

/**
 * `section.html` is markdown-it's render of the section body, which always
 * opens with the `<h2>Title</h2>` the loader produced from the heading. The
 * view re-renders that heading in JSX so it can carry the tree's section id
 * as a stable anchor; only the inner HTML stays boot-time-rendered.
 */
function sectionInnerHtml(html: string): string {
  const close = html.indexOf("</h2>");
  return close === -1 ? html : html.slice(close + "</h2>".length);
}

/**
 * The distinct sources cited by one section's callout claims (feature DESIGN
 * "Source panels"; DESIGN.md "Source / Verification Note"): the route
 * callouts whose `sectionId` matches the section id — the Commit 1
 * attribution field, reused verbatim, no second slugify — their `src` ids
 * resolved against the lord's `data/sources.json` via `resolveSources`, then
 * deduplicated by source id preserving first-seen order. A `::claim` with no
 * `src` contributes nothing. Pure read over the immutable tree: a section
 * whose callouts carry no resolvable source yields `[]`, and the view then
 * renders no panel — the section keeps its plain F2 anatomy.
 */
function sectionSources(lord: Lord, route: Route, section: Section): readonly Source[] {
  const ids = route.claims
    .filter((c) => c.sectionId === section.id)
    .flatMap((c) => c.src);
  const resolved = resolveSources(lord, ids);
  const seen = new Set<string>();
  return resolved.filter((source) => {
    if (seen.has(source.id)) return false;
    seen.add(source.id);
    return true;
  });
}

/**
 * The Source / Verification Note panel (DESIGN.md "Source / Verification
 * Note"): the fixed "SOURCE" mono eyebrow and one entry per distinct cited
 * source — the source title as an ordinary link to its URL (perceivable link
 * text — the title itself), the URL, and the note in body-sm — mounted after
 * the section's prose in the present-section branch. Renders only when the
 * section's callouts resolve at least one source; nested inside the route
 * section, never a standalone blank slot.
 */
function sourcePanel(lord: Lord, route: Route, section: Section): JSX.Element | null {
  const sources = sectionSources(lord, route, section);
  if (sources.length === 0) return null;
  return h(
    "section",
    { className: "source-panel", "aria-label": "Sources cited by this section" },
    h("p", { className: "source-panel__eyebrow" }, "SOURCE"),
    sources.map((source) =>
      h(
        "div",
        { key: source.id, className: "source-panel__entry" },
        h("a", { className: "source-panel__title", href: source.url }, source.title),
        h("p", { className: "source-panel__url" }, source.url),
        h("p", { className: "source-panel__note" }, source.note),
      ),
    ),
  );
}

/**
 * The in-flow Content Gap Marker (DESIGN.md "Content Gap Marker"): a dashed
 * hairline panel with the mono "CONTENT GAP" eyebrow and F1's explanatory
 * line, rendered at the slot's registry position instead of F1's trailing
 * list. Present sections own the router anchors; a marker does not.
 */
function contentGapMarker(title: string): JSX.Element {
  return h(
    "div",
    { className: "gap-marker" },
    h("p", { className: "gap-marker__eyebrow" }, "CONTENT GAP"),
    h("p", { className: "gap-marker__copy" }, `"${title}" is a declared gap — it has not been written yet.`),
  );
}
