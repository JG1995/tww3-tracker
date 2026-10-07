# Feature: Alith Anar and Zhao Ming Migration (F4 × 2)

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** Migrate the existing Alith Anar and Zhao Ming atlases into the shared content model so the player can use all six campaign routes without opening the standalone HTML guides.

**Context:** This feature is order 7 in [Planned Work](../../TODO.md), narrowed to these two lords by developer decision. It follows the completed [Elspeth migration](../elspeth-migration/ELSPETH-MIGRATION-DESIGN.md), but targets the current [atlas UX](../atlas-ux-realignment/ATLAS-UX-REALIGNMENT-DESIGN.md), not the retired F2 route/dashboard surfaces. The existing app supplies discovery, navigation, reference panels, sources, verification flags, transitions, and the VCO ledger. The feature proves that additional guides cost content rather than shared application changes and supplies more content for the later cross-guide search feature.

**Source atlases:** `.work/references/Alith_Anar_VCO_Expedition_Atlas.html` and `.work/references/Zhao_Ming_VCO_Expedition_Atlas.html`. Both record an archive research date of 30 September 2026 and a version string of `2026.09.30.1`. These are provenance claims in the archives, not independent verification of the player's current installation.

**Accepted scope:** Content migration with focused primary-source checks of VCO titles, objectives, and rewards. Preserve the strategic coverage and research trail; make supported factual corrections rather than retaining a known error for textual fidelity. This is not a fresh whole-guide research pass or a strategy rewrite.

**Non-Goals:**

- No third lord, Malakai or Mother Ostankya migration, or cross-guide search.
- No renderer, router, schema, lint-rule, server, style, or dependency changes. A genuine model limitation requires separate approval rather than an improvised extension.
- No archive-specific calculators, numeric progress counters, caravan-operation forms, persistent field notes, appearance controls, or import of browser-local checkbox, note, or view state.
- No modification of the reference HTML files, existing Elspeth content, or the player's campaign files.
- No live game integration, automatic objective confirmation, in-game campaign testing claim, or Smart Autoresolve benchmark claim.

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Guide selection:** Choose Alith Anar or Zhao Ming from the existing home and lord navigation.
- **Route and page selection:** Choose routes I–III and the existing atlas pages through their current hash-based navigation.
- **Reference selection:** Use the existing armies, skills, and research tabs and the settlements and workshop pages.
- **Campaign progress:** Use existing ledger controls when the player starts a campaign. This feature adds objective content, not new progress controls or persistence behavior.
- **Authored content:** Add `content/alith-anar/` and `content/zhao-ming/` and append their slugs to `content/index.json`, preserving existing entries and order. Each guide follows the existing manifest, shared Markdown, three route documents, six strategy datasets, and source catalogue contract.

### Displayed Data

- **Guide context:** Correct lord and faction identity, environment, version provenance, and shared fundamentals. Reuse available archive crests and phase summaries through the supported optional content fields; do not create a new presentation system.
- **Six route plans:** Objectives and rewards, strategic interpretation, bottlenecks, full phase guidance, territory policy, diplomacy, and continuation advice for both other routes of the same lord.
- **Route identity:** Official VCO titles remain distinct from guide-created strategic subtitles. Both archives attribute their route names to VCO localisation; those attributions are evidence to check, not proof that the currently installed mod uses the same titles.
- **Reference panels:** All archived army templates, character priorities, research queues, settlement roles, and faction mechanics, selected in the appropriate route's order. Both guides contain five army templates per route, for 30 templates across the feature.
- **Additional reference material:** Alith's cities, search candidates, named targets, technology records, and evidence notes; Zhao's sites, provinces, faction targets, technology records, Compass guidance, recruitment notes, and evidence notes. Their meaningful guidance must have a visible home even when there is no matching top-level dataset in the current model.
- **Research trail:** Each guide's source catalogue, confidence states, and actionable verification notes. Important uncertainties must appear in the existing flagged-items surface, not only in shared prose or an unlinked bibliography.
- **VCO rows:** Ordered, stable-ID objective rows usable by the existing plan and ledger views. Candidate locations and unresolved thresholds must not be misrepresented as additional mandatory conditions.

### Persistent Data

- **Guide content:** Markdown, JSON, and any supported crest SVG live under the two new guide directories and are versioned in Git. The site reads but does not write them.
- **Campaign state:** Existing ledger persistence remains separate from reference content. Player-initiated progress uses the current local server and gitignored ledger store; adding guides does not create, reset, migrate, or delete a campaign.
- **Raw archives:** The two reference HTML files remain unchanged and gitignored.
- **The system must NOT persist** any new state introduced by this migration. Archive-local notes, numeric inputs, checkbox ticks, and view preferences are not imported.

## 3. The User Journey (Step-by-Step)

### Journey A — Plan a campaign

1. **Entry Point:** Open the local site over HTTP and choose either new lord from home.
2. **System Response:** The selected lord's first route opens on the reference desk, with the correct guide, environment, and version context.
3. **Action:** Compare routes or select a different route, then open its route plan.
4. **System Response:** The plan shows the selected route's identity, sourced objective and reward claims, complete opening-to-victory guidance, and both continuation sections. Phase summaries supplement rather than replace the detailed plan.
5. **Action:** Follow a transition link.
6. **System Response:** Navigation reaches the other route's opening within the same lord, using the established transition behavior.
7. **Success State:** The player can choose and follow any of the six plans without consulting the original HTML.

### Journey B — Find the next army or development decision

1. **Entry Point:** Open the chosen route's reference desk during play.
2. **Action:** Open Armies & skills, Settlements & economy, or Faction workshop; select skills or research where applicable.
3. **System Response:** The appropriate route-selected entries render with full guidance, source links, and confidence attribution. Route variants do not overwrite a shared entry used by another route.
4. **Action:** Read an army template and its supporting-army variant.
5. **System Response:** Each applicable roster column shows the complete force, with counts, commander, heroes, substitutions, recruitment constraints, and manual-battle doctrine. An intentionally unavailable legendary variant is explicit rather than silently incomplete.
6. **Success State:** The player can determine what to recruit, research, build, or spend next and why it serves this route.

### Journey C — Check uncertainty and track objectives

1. **Entry Point:** Read an objective, reward, or mechanical claim in the guide.
2. **Action:** Follow its evidence or the desk's verification flags.
3. **System Response:** The guide identifies what is established, what remains uncertain, the relevant provenance, and a concrete observation or fallback for consequential uncertainty.
4. **Action:** Start or open the selected route's ledger using existing controls.
5. **System Response:** The existing ledger uses this guide's objective rows. An active campaign elsewhere continues to block starting another; guide confidence never sets player progress.
6. **Action:** Record planning progress or a game-confirmed observation, then reload.
7. **System Response:** Existing persistence and separate progress tracks behave unchanged.
8. **Success State:** The player can distinguish researched requirements, uncertain interactions, planning ticks, and actual game observations.

## 4. Logical Constraints (The "Rules of the Road")

### Coverage and source authority

- Every meaningful archive content block must map to visible content or a documented, reasoned exclusion. Inventory must include embedded data and meaningful guidance emitted by the archive's rendering code, not only the ordinary panel datasets.
- Presentation machinery, browser-local state, and duplicate tracker-link indexes may be excluded when their exclusion removes no unique guidance. Do not discard explanatory prose merely because it sits beside an excluded calculator or tracker.
- Archive wording and strategic intent are the migration baseline. If primary evidence establishes a factual error, correct the migrated content and record the discrepancy, evidence, and affected advice. Do not edit the archive.
- If a VCO check would require a substantial new campaign strategy or expose an unrepresentable mechanic, stop and seek approval rather than widening this feature.
- Elspeth content and existing manifest entries remain unchanged. Companion tests may evolve to cover multiple committed guides without dropping Elspeth's existing behavioral protection.

### Version context and confidence

- Check the six VCO title/objective/reward sets against applicable primary sources during delivery. Distinguish published wording from verified live trigger or reward behavior.
- If a title is verified, populate the official-title field separately from the thematic subtitle. Otherwise retain `vcoTitle: null`, preserve the archive's naming attribution in visible reference prose, and use the existing unresearched state.
- Preserve the archive research date and scoped provenance. Qualify version values known only from the archive; do not present them as the installed game/mod version or advance the whole guide's checked date after a narrow source check.
- Record new checks with their actual date, source, applicable version, supported assertion, and limitations in the relevant source notes. Other archived research remains explicitly archival unless it was rechecked.
- Every VCO- or patch-dependent claim has truthful confidence attribution using `confirmed`, `historical`, `inferred`, or `verify-in-campaign`. A URL or an archive's claim that something was checked does not by itself justify `confirmed`.
- Recommendations remain reasoning, not confirmed spending orders or benchmark-tested armies. Isolate unresolved mechanical interactions instead of hiding them inside a broadly confident entry.
- Consequential unresolved claims state what is known, what is unknown, how to check it, and what to do if the expected credit or effect does not appear.
- Important actionable uncertainties must be represented by route claims/callouts, selected dataset entries, or VCO rows so the existing flagged selector can discover them. Shared-only callouts are not sufficient because the current selector does not include shared prose.
- Every cited source ID resolves within its own guide, including both ordinary card links and confidence citations.

### Content model and route specificity

- Use stable lord slugs `alith-anar` and `zhao-ming`, with route IDs `route-1`, `route-2`, and `route-3` in numeral order. Archive-local route hashes and saved UI state are not compatibility contracts for these new guides.
- Each route carries Opening, Early → Mid, Mid → Late, Victory push, Territory policy, Diplomacy, and both same-lord transition bodies. The archive's five phases retain their full guidance when mapped to these sections.
- `panelOrder` determines visible entries. Every selected ID resolves, and all five reference groups are populated for every route.
- Use distinct flat dataset IDs for differing research, skill, building, or mechanic priorities. This includes Alith's research variant and Zhao's research, skill, and settlement variants; one route must not alter another's queue through a shared object.
- Follow the current renderer's transition-slot convention: present transition bodies also need their titles declared in `gaps` to be walked by `registrySlots` in `app/views/plan.ts`. These declarations are rendering slots, not missing content, and must not produce a gap marker when the body exists. Do not import a blanket `gaps: []` rule that would hide transitions.
- If any meaningful material cannot fit the current schemas and registered sections, report the exact block and stop for separate approval. Do not add guide-specific app logic, unsupported fields, raw HTML fragments, or a new dataset kind.

### Complete and usable armies

- The archives keep shared troops in `units` and commanders/heroes in lord-specific `alith` or `zhao` arrays and `generic`. Their own renderer combines those arrays; the current app does not.
- Normalize each applicable displayed `legendary` and `generic` column into a complete roster, using any actual variant-specific troop core. Do not copy only the character arrays or treat the missing archive field named `legendary` as an absent army.
- Each non-empty roster column has the stated slot count and one legal commander, with explicit alternatives for unavailable heroes or units. Preserve intentionally smaller home forces and their purpose.
- Templates are alternatives and progression stages, not instructions to clone the Legendary Lord or a unique hero into simultaneous forces. A genuinely generic-only force may retain an explicit absent legendary column.
- Preserve the product setup: Immortal Empires, VCO, Normal/Normal, Smart Autoresolve, all WH3 DLC, and WH1/WH2 free content only. Do not silently assume paid older-game DLC or another lord's exclusive campaign subsystem.
- Recruitment gates, practical substitutions, economic readiness, manual doctrine, and Smart Autoresolve evidence limits remain visible. Unknown current access is flagged rather than asserted as verified.

### Objectives and ledger compatibility

- Objective rows represent actual conditions or clearly labelled search candidates. They do not invent a requirement to complete every candidate or silently turn a historical threshold into a current fact.
- Preserve Alith's distinction between search candidates and the provisional search quota, and between successful assassination actions and named-lord wound conditions. Preserve Zhao's separate income, caravan-run, goods-delivery, and landmark conditions and the distinction between required targets and ordinary campaign bookkeeping.
- Historical script timing, diplomatic credit, reward scope, and other unresolved trigger details retain scoped evidence and live checks instead of guessed mechanics.
- New objective IDs are semantic and stable within their lord/route. Do not use display position as identity or reuse an ID for a different condition; saved progress follows these IDs.
- Guide confidence and player completion remain separate. Adding content neither marks objectives done nor changes the global one-active-campaign rule.

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- **Primary source unavailable or incomplete:** Retain traceable archive evidence with its scope, mark the unresolved assertion honestly, and provide a practical verification step. Do not fabricate a source, title, objective, threshold, or current version. If the missing fact prevents a usable route plan, report the blocker rather than claim the guide complete.
- **Conflicting current and archived evidence:** Explain the difference near the affected guidance. Apply a supported correction within this feature's boundary; a strategy-changing or model-changing conflict requires approval.
- **Invalid shape or dangling references:** Existing lint and boot validation reject the authored content. Correct the content instead of weakening validation or introducing a faction exception.
- **Unsupported archive interaction:** Preserve its unique guidance in supported prose or datasets; exclude the interaction itself with a reason. If guidance cannot be represented, stop under the content-only boundary.
- **Ledger read/write failure:** Inherit existing load errors, retry, optimistic rollback, and visible failure behavior. This migration introduces no alternate state store.

### Empty States

- No strategy panel or supported plan section remains empty when the archive supplies material. A genuine missing-content gap must stay visible and be reported; it is not a completed six-plan migration.
- Unknown official titles use the existing unresearched marker. Missing optional crest content uses the existing reduced header, not fabricated artwork.
- Field notes and appearance settings retain their existing deferred states; archive prose must not promise that those features work.
- A route with no player campaign uses the existing no-active-campaign state, not imported or fabricated progress.

### Boundary Cases

- Long rosters, source notes, technology queues, and route prose remain readable through the existing desktop/laptop layouts; do not truncate content to fit a panel.
- Shared entries remain shared only when their advice is genuinely identical. Route-specific usage notes retain a visible route-owned home.
- Repeated route and source IDs across different lords remain scoped to their own guide. Transitions never cross into another lord's route by accident.
- A candidate list, route reward, optional continuation, or reference calculator is not an additional mandatory victory condition.

### Interruptions

- Reload restores the existing hash-selected guide/page/route and rebuilds the content tree. The player must reload after authored content changes because the app loads the corpus once at boot.
- Adding either guide leaves existing saved campaigns untouched. Player-initiated ledger changes continue to persist through the existing server contract.
- Any published partial delivery must remain valid and must not advertise missing material as complete. A lint-clean skeleton is not evidence that this feature's coverage is delivered.

## 6. Interface & Interaction (The "Look and Feel")

### Visual Style

Inherit the current [design system](../../DESIGN.md), shared atlas components, keyboard navigation, visible focus, labelled confidence states, and responsive behavior. No faction-specific palettes, CSS, dialogs, or controls are introduced.

### Layout

Use the existing eight-page information architecture: reference desk and comparison, route plan, armies/skills/research, settlements/economy, faction workshop, VCO ledger, sources/settings, and deferred field notes. Shared fundamentals and verification flags remain in the desk's lord-level zone. The existing app determines layout; guide data determines content and selection.

### Copywriting

Preserve the archives' concrete route-specific advice and thematic voice while adapting references to their new visible homes. Replace obsolete instructions such as using an archive-only reader, meter, or local note control with accurate current-app guidance. Distinguish official requirements, strategic recommendations, archive evidence, and unresolved live checks. No new exact UI labels are required beyond established component vocabulary.

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] Home and existing navigation expose Alith Anar and Zhao Ming alongside Elspeth, with correct guide identity and environment; existing manifest entries and Elspeth content remain unchanged.
- [ ] All six routes are usable end-to-end: full phase guidance, interpretation, bottleneck, territory policy, diplomacy, phase summaries, and both continuation bodies are visible, with no real content-gap markers where material exists.
- [ ] Every meaningful archive block, including additional reference structures and all evidence notes, has a recorded visible target or a reasoned exclusion that removes no unique guidance. Supported factual corrections identify their evidence and archive discrepancy.
- [ ] All five reference groups are populated on every route in the intended order; Alith and Zhao's route-specific variants remain independent and every selected entry is accessible through the current detail pages.
- [ ] All 30 army templates render their complete applicable roster columns, with correct stated counts, legal commanders, clear generic/legendary distinctions, readiness and access caveats, substitutions, and manual doctrine. Troops do not disappear because only character arrays were copied.
- [ ] Primary-source checks of the six VCO title/objective/reward sets are recorded with their scope and date. Verified titles remain distinct from strategic subtitles; unresolved titles retain the existing unresearched state and archive attribution without invention.
- [ ] Each guide displays honest archive/version provenance. A narrow check does not claim that the whole guide or the installed game/mod stack was freshly verified.
- [ ] VCO- and patch-dependent claims carry truthful confidence attribution and resolving citations; consequential uncertainties include actionable checks and appear in the existing flagged-items surface rather than only shared prose.
- [ ] Objective rows preserve separate conditions and uncertainty, including Alith's provisional search quota and wound interactions and Zhao's independent trade-route requirements. No candidate list, historical trigger, optional continuation, or reward becomes an invented requirement.
- [ ] Both transitions on each route link to the correct opening of another route for the same lord. Transition slot declarations do not hide the authored bodies or render false gap markers.
- [ ] The existing ledger consumes the new stable objective IDs, preserves planning/game-confirmed separation and the global one-active-campaign rule, and survives reload. Runtime write checks use an isolated test store, never the player's campaign files.
- [ ] The two raw HTML archives remain byte-for-byte unchanged; no shared app/schema/lint-rule/server/style/dependency change is required, and no archive-local state is imported.
- [ ] `npm run lint:content`, `npm test`, `npx tsc --noEmit`, and `npm run build` pass without weakening existing behavioral coverage to accommodate the larger corpus.
- [ ] HTTP/browser inspection covers both guides' desks, all six route plans and selected reference groups, full army columns, sources/flags, transition destinations, deep-link reload, and ledger objective display at desktop and laptop widths. Website validation is not reported as live campaign or Smart Autoresolve testing.
