/**
 * Route plan view (feature DESIGN §2/§4/§5/§6 — Displayed Data, Visual
 * system, Empty States, Layout, Copywriting; package `route-plan-view`):
 * the atlas's rendered composition over `{ lord, route, campaign? }`. The
 * page head (mono eyebrow "ROUTE <n> · <name>", serif "The campaign plan"
 * title, the one-line intro, and the route badge — official VCO title or
 * the UNRESEARCHED marker), the three-card fact row (PURPOSE =
 * interpretation, WHAT ACTUALLY WINS = objective + reward as badged claims,
 * LIKELY BOTTLENECK = bottleneck — a card is omitted when its field is
 * absent, never an empty card), the two-track body (the registry-walk
 * section body at 1.65fr/0.8fr with the "operation in five moves" aside —
 * collapsed to full width when the aside is absent), and below the body the
 * VCO objective undercard + campaign action region (moved from the route
 * page, unchanged in behaviour) and the slim panel-navigation strip.
 *
 * This module owns the registry-walk machinery the route page used to carry
 * (`transitionTarget`, `slotAt`, `sectionHeading`, `sectionInnerHtml`,
 * `sectionSources`, `sourcePanel`, `contentGapMarker`, `TRANSITION_PREFIX`)
 * with the two plan-page deltas: the F7 cross-link hrefs use the NEW hash
 * grammar (`#/<lord>/plan/<…>`), and the six registry sections render their
 * walk-order numeral (1–6) as a prefix to the H2 — the transition sections
 * render unnumbered and every H2 keeps the tree's section id (the anchors
 * and F7 cross-links are unaffected; only the rendered text gains the
 * prefix, per the recorded developer decision). This registry-walk body and
 * campaign region moved here from the route page; that page was deleted in
 * Commit 11.
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
import { ConfidenceBadge } from "../components/ConfidenceBadge.ts";
import { OPTIONAL_SECTIONS, REQUIRED_SECTIONS } from "../content/lint.ts";
import type { Claim, Lord, PhaseSummary, Route, Section, Source } from "../content/types.ts";
import { getVcoObjectives, resolveSources } from "../content/query.ts";
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

/** The registry's fixed slot order: the required sections then the optional sections (`lint.ts` order). */
const REGISTRY_SECTIONS: readonly string[] = [...REQUIRED_SECTIONS, ...OPTIONAL_SECTIONS];

/**
 * The walk-order numeral of a registry section (DESIGN §2/§7
 * "phase-numbered sections"; developer decision): 1 Opening, 2 Early → Mid,
 * 3 Mid → Late, 4 Victory push, 5 Territory policy, 6 Diplomacy — the
 * numeral is the section's position in the fixed registry order, never a
 * re-slugification. A transition title (an inter-route gap marker, not a
 * phase) returns null and renders unnumbered.
 */
function registryNumeral(title: string): string | null {
  const index = REGISTRY_SECTIONS.indexOf(title);
  return index === -1 ? null : String(index + 1);
}

/** Rendering options for a plan registry slot. */
interface SectionLoopOptions {
  /** Render the six registry sections' walk-order numerals as H2 prefixes. */
  readonly numbered: boolean;
}

/**
 * One present section's H2 (feature DESIGN §6): a matching transition title
 * renders the heading as a cross-link anchor (`route-section__heading-link`)
 * wrapping the authored heading text verbatim — into the target's `Opening`
 * H2 when that section is present, otherwise the target route page top. The
 * H2 always keeps the tree's section id (the router's section anchor); the
 * prose and Source-panel anatomy stay on the section, never the anchor.
 * Every other title keeps its plain H2. The phase-numbered plan renders the
 * registry section's walk-order numeral as a serif prefix to the H2.
 */
function sectionHeading(lord: Lord, section: Section, loop: SectionLoopOptions): JSX.Element {
  const numeral = loop.numbered ? registryNumeral(section.title) : null;
  const headingText =
    numeral === null
      ? section.title
      : [h("span", { className: "route-section__numeral" }, [numeral, " · "]), section.title];
  const target = transitionTarget(lord, section.title);
  if (target === null) {
    return h("h2", { id: section.id, className: "route-section__heading" }, headingText);
  }
  const href =
    target.openingSectionId === null
      ? `#/${lord.slug}/plan/${target.targetId}`
      : `#/${lord.slug}/plan/${target.targetId}/${target.openingSectionId}`;
  return h(
    "h2",
    { id: section.id, className: "route-section__heading" },
    h("a", { className: "route-section__heading-link", href }, headingText),
  );
}

/**
 * One registry slot: the route's section at that exact title renders in
 * place (its H2 as the same-lord cross-link when the title is a matching
 * `Transition → <route>`; with the Source / Verification Note panel after its
 * prose when the section's callout claims cite at least one distinct source);
 * otherwise the title is a declared gap and renders its marker.
 */
export function slotAt(lord: Lord, route: Route, title: string, loop: SectionLoopOptions): JSX.Element | null {
  const section = route.sections.find((s) => s.title === title);
  if (section !== undefined) {
    return h(
      "section",
      { className: "route-section", "data-section-id": section.id },
      sectionHeading(lord, section, loop),
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

/**
 * The registry walk's slot list (DESIGN §2/§6): the required sections, then
 * the optional sections (both in the `lint.ts` registry order), then the
 * route's declared transition gaps in declared order. The lint guarantees
 * every required section is present or declared, so a slot that is neither
 * is unreachable for required sections; an absent, undeclared optional
 * section simply renders nothing.
 */
export function registrySlots(route: Route): readonly string[] {
  return [...REGISTRY_SECTIONS, ...route.gaps.filter((title) => title.startsWith(TRANSITION_PREFIX))];
}

/**
 * One claim row: the Confidence Badge (state label + colour class + resolved
 * source links) followed by the claim text, verbatim from the frontmatter.
 * Shared with the route page's identity card so the fact-row claims and the
 * card claims resolve through the same single path.
 */
export function claimBlock(lord: Lord, label: string, claim: Claim): JSX.Element {
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

export function PlanView(props: { lord: Lord; route: Route; campaign?: RouteCampaignProps }): JSX.Element {
  const { lord, route, campaign } = props;
  return h(
    "article",
    { className: "plan-page" },
    planHead(route),
    factRow(lord, route),
    planTracks(lord, route),
    vcoUndercard(lord, route, campaign),
    panelStrip(lord, route),
  );
}

/** The one-line intro under the plan title (descriptive copy, not a DESIGN-fixed string). */
const PLAN_INTRO = "one read of the route — sections, claims, and sources, in order";

/**
 * The page head (DESIGN §2): the mono eyebrow "ROUTE <n> · <name>", the serif
 * "The campaign plan" title, the one-line intro, and the route badge — the
 * official VCO title or the explicit unresearched marker.
 */
function planHead(route: Route): JSX.Element {
  return h(
    "header",
    { className: "plan-head" },
    h("p", { className: "plan-head__eyebrow" }, `ROUTE ${route.number} · ${route.name}`),
    h("h1", { className: "plan-head__title" }, "The campaign plan"),
    h("p", { className: "plan-head__intro" }, PLAN_INTRO),
    route.vcoTitle === null
      ? h("p", { className: "plan-head__badge plan-head__badge--unresearched" }, "UNRESEARCHED")
      : h("p", { className: "plan-head__badge" }, route.vcoTitle),
  );
}

/**
 * The three-card fact row (DESIGN §2/§5): PURPOSE from the interpretation,
 * WHAT ACTUALLY WINS as the objective + reward claims in the badged
 * claim-block rendering (one resolution path with the identity card), and
 * LIKELY BOTTLENECK from the bottleneck. A card whose field is absent is
 * omitted entirely — never an empty card.
 */
function factRow(lord: Lord, route: Route): JSX.Element {
  return h(
    "section",
    { className: "plan-facts", "aria-label": "Route facts" },
    [
      route.interpretation === undefined
        ? null
        : factCard("PURPOSE", h("p", { className: "plan-fact__text" }, route.interpretation)),
      factCard(
        "WHAT ACTUALLY WINS",
        h(
          "div",
          { className: "plan-fact__claims" },
          claimBlock(lord, "Objective", route.objective),
          claimBlock(lord, "Reward", route.reward),
        ),
      ),
      route.bottleneck === undefined
        ? null
        : factCard("LIKELY BOTTLENECK", h("p", { className: "plan-fact__text" }, route.bottleneck)),
    ].filter((card): card is JSX.Element => card !== null),
  );
}

/** One fact card: the mono eyebrow over its body, in the atlas card treatment. */
function factCard(label: string, body: JSX.Element): JSX.Element {
  return h(
    "article",
    { className: "plan-fact" },
    h("p", { className: "plan-fact__eyebrow" }, label),
    body,
  );
}

/**
 * The two-track body (DESIGN §2/§5): the registry-walk sections at the atlas
 * 1.65fr/0.8fr split with the "operation in five moves" aside on the right.
 * A route without `phases` renders no aside and the container switches to
 * the full-width modifier — a class switch, never an empty card or a
 * conditional DOM hole.
 */
function planTracks(lord: Lord, route: Route): JSX.Element {
  const phases = route.phases ?? [];
  const hasAside = phases.length > 0;
  return h(
    "div",
    { className: hasAside ? "plan-track" : "plan-track plan-track--full" },
    planSections(lord, route),
    hasAside ? phasesAside(phases) : null,
  );
}

/** The left track: the registry walk over the fixed slot order with the plan grammar. */
function planSections(lord: Lord, route: Route): JSX.Element {
  return h(
    "div",
    { className: "plan-sections" },
    registrySlots(route)
      .map((title) => slotAt(lord, route, title, { numbered: true }))
      .filter((node): node is JSX.Element => node !== null),
  );
}

/**
 * The right track — "The operation in five moves" (DESIGN §2): one numbered
 * card per `route.phases` entry — serif numeral, title, note — pure data
 * over the committed frontmatter. Absent when the route carries no `phases`;
 * the caller collapses the track then.
 */
function phasesAside(phases: readonly PhaseSummary[]): JSX.Element {
  return h(
    "aside",
    { className: "plan-aside", "aria-label": "The operation in five moves" },
    h("h2", { className: "plan-aside__title" }, "The operation in five moves"),
    phases.map((phase, index) =>
      h(
        "article",
        { key: phase.title, className: "plan-move" },
        h("p", { className: "plan-move__numeral" }, String(index + 1)),
        h("h3", { className: "plan-move__title" }, phase.title),
        h("p", { className: "plan-move__note" }, phase.note),
      ),
    ),
  );
}

/**
 * The optional VCO objective-item undercard (DESIGN §4 vco schema): one
 * Confidence Badge-carrying row per item — stable id, text, state and the
 * optional resolved source link — below the two-track body, with the campaign
 * action region as its final block. A route without a `data/vco.json` entry
 * renders no undercard at all — and therefore no campaign action (the
 * DESIGN's no-VCO-route no-action rule). Moved from the route page
 * unchanged in behaviour; the plan page hosts the start flow (recorded
 * decision). The former route page was deleted in Commit 11.
 */
export function vcoUndercard(lord: Lord, route: Route, campaign: RouteCampaignProps | undefined): JSX.Element | null {
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
 * The campaign props (package `ledger-route-start`), supplied by `main.tsx`:
 * the on-demand ledger index read plus the start handler. The view stays
 * presentational — the derivation runs over the caller-supplied index, never
 * any I/O. `index` is the same `LedgerIndexState` shape the ledger page hook
 * exposes, so both surfaces consume the one `io.listLedgers` contract and
 * the same entry types (a route hash is the demand; nothing reads at boot).
 * The shape is unchanged from the route page's so Commit 9 retargets
 * `useRouteCampaign` without touching this view.
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
 * The slim panel-navigation strip (DESIGN §6): four links for this route —
 * the three detail pages and the VCO ledger — on the new grammar.
 */
function panelStrip(lord: Lord, route: Route): JSX.Element {
  return h(
    "nav",
    { className: "plan-strip", "aria-label": "Route pages" },
    PLAN_PANEL_LINKS.map((link) =>
      h(
        "a",
        { key: link.page, className: "plan-strip__link", href: `#/${lord.slug}/${link.page}/${route.id}` },
        link.label,
      ),
    ),
  );
}

/** The route-page segment of the strip's four links (the three detail pages + the VCO ledger). */
type PanelLinkPage = "armies" | "settlements" | "workshop" | "ledger";

/** The three detail pages + the VCO ledger, in DESIGN page order. */
const PLAN_PANEL_LINKS: readonly { page: PanelLinkPage; label: string }[] = [
  { page: "armies", label: "Armies & skills" },
  { page: "settlements", label: "Settlements & economy" },
  { page: "workshop", label: "Faction workshop" },
  { page: "ledger", label: "VCO ledger" },
];
