# Feature: Route Transitions (F7)

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** Each route's `Transition → <route>` section becomes a live cross-link into the destination route's opening guidance, so a player who finishes one route continues into another instead of restarting (PRD F7, "Should v1.0").

**Context:** F7 sits on top of F2 (route-first rendering, completed 2026-10-03), which renders the transition sections as plain prose and explicitly deferred the cross-links, and on F4 (Elspeth migration, completed 2026-10-03), whose committed content already contains all six transition sections (two per route, three routes). F7 consumes the existing content tree, the hash router's route + section-anchor grammar, and the lint's existing validation that a transition title names another route of the same lord. Nothing consumes F7. It interacts with no other feature: F5 (ledger) and F6 (search) are independent.

**Non-Goals:**

- No new content model fields and no new lint rules — bidirectionality is not enforced in the content contract; the cross-link is derived from the already-validated transition title grammar.
- No cross-lord links (the lint restricts transition targets to routes of the same lord, and this feature keeps it that way).
- No changes to the Route Tab Strip, route identity card, dashboard, or any other F2/F3 surface.
- No new UI copy, no new "continue" component, no per-faction code.

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Transition link activation:** clicking (or activating via keyboard) the anchor rendered inside a `Transition → <route>` section heading. No other input is introduced.

### Displayed Data

- **Transition cross-link:** the H2 of a present transition section renders as an anchor. Visible when the section is present in the route body; depends on the title grammar (`Transition → <route id or name>`) and the lord's manifest route list. The link label is the authored heading text, verbatim.
- **Link target section:** the destination route's `Opening` section (or the destination route page top as fallback — see Logical Constraints).

### Persistent Data

None. The feature is a pure read over the immutable content tree; the hash remains the only restored state, per F1/F2.

- **The system must NOT persist** anything for this feature: there is no user state, no selection, no remembered position.

## 3. The User Journey (Step-by-Step)

### Continue into another route

1. **Entry Point:** the player is reading a route page and reaches one of its `Transition → <route>` sections.
2. **Action 1:** activates the section heading link (mouse click or keyboard Enter).
3. **System Response 1:** the hash changes to `#/<lord>/route/<target-id>/<target-opening-section-id>`; the route view remounts for the target route (tab strip selection and dashboard reset as with any route switch).
4. **System Response 2:** the target route's Opening H2 scrolls into view via the existing section-anchor effect.
5. **Success State:** the player is at the top of the next route's opening guidance, one hop away from continuing the campaign premise — and the target route's own `Transition → <source route>` section links back the same way.

## 4. Logical Constraints (The "Rules of the Road")

### Link derivation

- **IF** a route body section's title starts with `Transition → ` and the suffix names one of the lord's other routes (by id or name — a condition the content lint already guarantees), **THEN** the view renders that section's H2 as an anchor to the target route.
- **IF** the title does not match the grammar or the target does not resolve, **THEN** the section renders as a plain (non-link) H2 — content that passes the lint always resolves, so this branch protects the view invariant rather than a content case.

### Link target

- **IF** the target route has a present `Opening` section, **THEN** the anchor is `#/<lord>/route/<target-id>/<target-opening-section-id>` using the target section's real tree id.
- **IF** the target route's `Opening` is a declared gap (no rendered anchor exists), **THEN** the anchor is the route page top `#/<lord>/route/<target-id>`.

### Bidirectionality

- **IF** route A declares `Transition → B`, **THEN** a link from A to B exists; the link back from B to A exists only through B's own transition section to A, exactly as in the committed Elspeth content. The feature never synthesizes a link for a transition section the content does not contain.

### Gap sections

- **IF** a `Transition → <route>` title appears only in frontmatter `gaps` (no body section), **THEN** the in-flow Content Gap Marker renders unchanged — inert, with no anchor (F2's marker contract).

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- **Unresolvable transition target in the view (lint-passed content should never reach this):** the section renders as a plain H2 with its content; no broken href is ever emitted and boot does not fail.

### Empty States

- **A route with no transition sections at all:** the route page renders exactly as today (registry walk, no transition slots beyond declared gaps). No placeholder or empty "transitions" region appears.
- **A transition target whose `Opening` is a declared gap:** the link renders to the route page top (Logical Constraints); the target route shows its gap marker at the Opening slot, as F2 already does.

### Boundary Cases

- **Transition title naming a route by its thematic name rather than id:** resolves the same way — the target is matched against both id and name, mirroring the lint's `isKnownSectionTitle` rule.
- **All three pilot routes carry two transition sections each:** the committed Elspeth guide therefore renders six anchors (two per route page) with zero content change, satisfying the PRD acceptance criterion.

### Interruptions

- **Mid-navigation interruption (e.g. hash reset, reload):** the feature holds no state; the hash is the complete state, inherited from F1/F2. No rollback or recovery behavior is introduced.

## 6. Interface & Interaction (The "Look and Feel")

### Visual Style

Follows the existing design system (.wiki/DESIGN.md): the H2 keeps its current mono-eyebrow treatment; the anchor inherits the established link treatment and `:focus-visible` ring (2px primary, 3px offset). No new tokens, no new component classes beyond what the existing link/heading styles provide; any hover state stays within the 0.15–0.2s colour-only transition band and is disabled under `prefers-reduced-motion`.

### Layout

The link wraps the existing section heading in place — the transition section's slot position, panel anatomy, and Source panel (when present) are unchanged. Nothing else on the route page moves.

### Copywriting

- **Link label:** the authored heading text, verbatim (e.g. `Transition → route-2`). No invented labels, no route-name enrichment in this feature.

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] Each of the three committed Elspeth route pages renders exactly two transition anchors targeting the other two routes' `Opening` sections, and every href resolves to a rendered H2 id in the content tree.
- [ ] Following a transition link switches the hash to the target route and the target's Opening H2 scrolls into view (existing anchor effect).
- [ ] Transition links are keyboard-reachable and show the established `:focus-visible` treatment.
- [ ] A transition whose target `Opening` is a declared gap links to the route page top (proven with a test fixture).
- [ ] A gap-declared transition title still renders the inert F2 Content Gap Marker with no anchor (regression-covered).
- [ ] A transition title that fails to resolve (unreachable for lint-passed content) renders as a plain, non-link H2 (proven with a test fixture).
- [ ] The project commit gate passes, with the new/changed tests discovered and executed.
