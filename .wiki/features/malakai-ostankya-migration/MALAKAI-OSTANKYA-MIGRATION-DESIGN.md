# Feature: Malakai and Mother Ostankya Migration (F4 × 2)

## Open Questions

None.

## 1. Executive Summary

**High-Level Goal:** Migrate the existing Malakai and Mother Ostankya atlases into the shared content model so the player can use all six campaign routes — and all five lords — without opening the standalone HTML guides.

**Context:** This feature is order 9 in [Planned Work](../../TODO.md), narrowed to these two lords by the development sequence. It follows the completed [Elspeth migration](../elspeth-migration/ELSPETH-MIGRATION-DESIGN.md) and the [Alith Anar and Zhao Ming migration](../alith-zhao-migration/ALITH-ZHAO-MIGRATION-DESIGN.md), and targets the current [atlas UX](../atlas-ux-realignment/ATLAS-UX-REALIGNMENT-DESIGN.md). The existing app supplies discovery, navigation, cross-guide search, reference panels, sources, verification flags, transitions, and the VCO ledger. The TODO names these two archives "the model's real stress test": their embedded data is structurally different from the three migrated guides, so the delivery must prove whether the current content model expresses them without change. A genuine model limitation stops the work and is reported for separate approval; it is never improvised into an extension. After this feature the seed corpus is complete.

**Source atlases:** `.work/references/Malakai_VCO_Expedition_Atlas.html` and `.work/references/Mother_Ostankya_VCO_Expedition_Atlas.html`. Both use the same generator and embedded `guide-data` JSON contract as the already-migrated archives and record an archive research date of September 2026 (Ostankya's JSON carries `30 September 2026`; Malakai carries `September 2026`). Neither archive carries a VCO version string. These are provenance claims in the archives, not independent verification of the player's current installation.

**Structural differences the delivery must absorb:** Malakai is the only archive with a structured per-route `objectives` list (9, 12, and 11 rows over routes I–III, keyed positionally such as `province:0`, `fortress:3`, `target:moulder`) and carries guide-local datasets absent from the other three: `adventures` (7, with task checklists), `fortresses` (12), `provinces` (8), `targets` (9), `shipMilestones` (10), `legacyResearch` (5), and route-level `buildOrder`/`adventureOrder`. Mother Ostankya has **no** structured objective list — her route objectives are prose that the migration must convert into ledger rows from stated conditions only (route I: the five named campaign Hexes plus the Malediction of Ruin ritual; route II: three named Lustria settlement objectives; route III: a 32-settlement occupation counter plus the six named New World factions in `targets`) — and carries `lores` (4 witch-lore paths in the flat item shape), `hexes` (5), `ingredients` (3), `targets` (6), `legacyResearch` (13), and `evidence` (7). Both keep per-route `skills`, `research`, `builds`, and `mechanics` with route-level defaults, the flat-dataset-plus-`panelOrder` pattern used for the earlier migrations.

**Known documentation discrepancy:** [CONCEPT.md](../../CONCEPT.md) describes Mother Ostankya and Zhao Ming as the same faction, Grand Cathay. The archive contradicts this: Ostankya's campaign is a witch/Wild-Hunt campaign (Devotion, Huts, Ataman, Druzhina; the Slaughterhorn Tribe appears as a target faction) with a default start in Bleak Hold Fortress in Naggaroth and an optional Plesk homecoming. The migration records the faction the archive claims; the CONCEPT.md statement is flagged for documentation reconciliation at feature close-out and is not silently rewritten by this feature.

**Accepted scope:** Content migration with focused primary-source checks of VCO titles, objectives, and rewards. Preserve the strategic coverage and research trail; make supported factual corrections rather than retaining a known error for textual fidelity. This is not a fresh whole-guide research pass or a strategy rewrite.

**Non-Goals:**

- No renderer, router, schema, dataset-kind, lint-rule, server, style, or dependency changes. A genuine model limitation requires separate approval rather than an improvised extension.
- No fresh whole-guide research pass, strategy rewrite, or re-planning of routes the archive already defines.
- No archive-specific calculators, numeric progress counters, caravan or task ledgers, save/restore campaigns, persistent field notes, appearance controls, or import of any archive-local checkbox, note, or view state ("progress stays in this browser" behavior is not a compatibility contract).
- No modification of the reference HTML files, the existing three migrated guides, or the player's campaign files.
- No live game integration, automatic objective confirmation, in-game campaign testing claim, or Smart Autoresolve benchmark claim.

## 2. Information Architecture (The "Memory Bank")

### User Inputs

- **Guide selection:** Choose Malakai or Mother Ostankya from the existing home and lord navigation.
- **Route and page selection:** Choose routes I–III and the existing atlas pages through their current hash-based navigation.
- **Reference selection:** Use the existing armies, skills, and research tabs and the settlements and workshop pages.
- **Campaign progress:** Use existing ledger controls when the player starts a campaign. This feature adds objective content, not new progress controls or persistence behavior.
- **Authored content:** Add `content/malakai/` and `content/mother-ostankya/` and append their slugs to `content/index.json`, preserving existing entries and order. Each guide follows the existing manifest, shared Markdown, three route documents, six strategy datasets, and source catalogue contract.

### Displayed Data

- **Guide context:** Correct lord and faction identity, environment, and version provenance, following the archive's own claims. No crest artwork exists in either archive; both guides use the existing reduced header, not fabricated artwork.
- **Six route plans:** Objectives and rewards, strategic interpretation, bottlenecks, full phase guidance, territory policy, diplomacy, and continuation advice for both other routes of the same lord.
- **Route identity:** Official VCO titles remain distinct from guide-created strategic subtitles. The archive's route names (Malakai: The Northern Reconquest, The Seven-Fortress Expedition, The Empire-Relief Expedition; Ostankya: The Malediction of Ruin, Toil & Trouble, The New Frontier) are treated as naming evidence to check, not proof that the installed mod uses the same titles.
- **Reference panels:** All archived army templates, character priorities, research queues, settlement roles, and faction mechanics, selected in the appropriate route's order. Both guides contain five army templates per route, for 30 templates across the feature (Malakai: early/mid/late/airwing/home; Ostankya: early/mid/late/special/home).
- **Additional reference material:** Malakai's adventures and their task checklists, ship milestones, fortresses, provinces, and named targets; Ostankya's witch lores, campaign Hexes, ingredients, named New World targets, and evidence notes. Their meaningful guidance must have a visible home even when there is no matching top-level dataset in the current model.
- **Research trail:** Each guide's source catalogue, confidence states, and actionable verification notes. Important uncertainties must appear in the existing flagged-items surface, not only in shared prose or an unlinked bibliography.
- **VCO rows:** Ordered, stable-ID objective rows usable by the existing plan and ledger views. Malakai's structured rows map one-to-one. Ostankya's rows are derived only from her stated conditions; the derived set is the visible contract, and the 32-settlement route condition counts qualifying actions at different locations rather than requiring 32 settlements held at once.

### Persistent Data

- **Guide content:** Markdown and JSON live under the two new guide directories and are versioned in Git. The site reads but does not write them.
- **Campaign state:** Existing ledger persistence remains separate from reference content. Player-initiated progress uses the current local server and gitignored ledger store; adding guides does not create, reset, migrate, or delete a campaign.
- **Raw archives:** The two reference HTML files remain unchanged and gitignored.
- **The system must NOT persist** any new state introduced by this migration. Archive-local notes, numeric inputs, checkbox ticks, save/restore campaign state, and view preferences are not imported.

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
5. **System Response:** Each applicable roster column shows the complete force, with counts, commander, heroes, substitutions, recruitment constraints, and manual-battle doctrine. An intentionally smaller home or specialist force is explicit rather than silently incomplete.
6. **Success State:** The player can determine what to recruit, research, build, or spend next — including which adventure, ship milestone, lore path, or Hex to pursue — and why it serves this route.

### Journey C — Check uncertainty and track objectives

1. **Entry Point:** Read an objective, reward, or mechanical claim in the guide.
2. **Action:** Follow its evidence or the desk's verification flags.
3. **System Response:** The guide identifies what is established, what remains uncertain, the relevant provenance, and a concrete observation or fallback for consequential uncertainty.
4. **Action:** Start or open the selected route's ledger using existing controls.
5. **System Response:** The existing ledger uses this guide's objective rows, including Ostankya's derived rows. An active campaign elsewhere continues to block starting another; guide confidence never sets player progress.
6. **Action:** Record planning progress or a game-confirmed observation, then reload.
7. **System Response:** Existing persistence and separate progress tracks behave unchanged.
8. **Success State:** The player can distinguish researched requirements, uncertain interactions, planning ticks, and actual game observations.

## 4. Logical Constraints (The "Rules of the Road")

### Coverage and source authority

- Every meaningful archive content block must map to visible content or a documented, reasoned exclusion. Inventory must include the embedded `guide-data` JSON and meaningful guidance emitted by the archive's rendering code, not only the ordinary panel datasets.
- Presentation machinery, browser-local state, save/restore machinery, and duplicate indexes may be excluded when their exclusion removes no unique guidance. Do not discard explanatory prose merely because it sits beside an excluded calculator or tracker.
- Archive wording and strategic intent are the migration baseline. If primary evidence establishes a factual error, correct the migrated content and record the discrepancy, evidence, and affected advice. Do not edit the archive.
- If a VCO check would require a substantial new campaign strategy or expose an unrepresentable mechanic, stop and seek approval rather than widening this feature.
- The three existing guides and their manifest entries remain unchanged. Companion tests may evolve to cover the larger corpus without dropping the existing guides' behavioral protection.

### Version context and confidence

- Check the six VCO title/objective/reward sets against applicable primary sources during delivery. Distinguish published wording from verified live trigger or reward behavior.
- If a title is verified, populate the official-title field separately from the thematic subtitle. Otherwise retain `vcoTitle: null`, preserve the archive's naming attribution in visible reference prose, and use the existing unresearched state.
- Preserve the archive research date (September 2026) as scoped provenance. Neither archive carries a VCO version string; do not invent one, do not present any version as the installed game/mod version, and do not advance the whole guide's checked date after a narrow source check.
- Record new checks with their actual date, source, applicable version, supported assertion, and limitations in the relevant source notes. Other archived research remains explicitly archival unless it was rechecked.
- Every VCO- or patch-dependent claim has truthful confidence attribution using `confirmed`, `historical`, `inferred`, or `verify-in-campaign`. A URL or an archive's claim that something was checked does not by itself justify `confirmed`.
- Recommendations remain reasoning, not confirmed spending orders or benchmark-tested armies. Isolate unresolved mechanical interactions instead of hiding them inside a broadly confident entry.
- Consequential unresolved claims state what is known, what is unknown, how to check it, and what to do if the expected credit or effect does not appear.
- Important actionable uncertainties must be represented by route claims/callouts, selected dataset entries, or VCO rows so the existing flagged selector can discover them. Shared-only callouts are not sufficient because the current selector does not include shared prose.
- Every cited source ID resolves within its own guide, including both ordinary card links and confidence citations.

### Content model and route specificity

- Use stable lord slugs `malakai` and `mother-ostankya`, with route IDs `route-1`, `route-2`, and `route-3` in numeral order. Archive-local route hashes and saved UI state are not compatibility contracts for these new guides.
- Each route carries Opening, Early → Mid, Mid → Late, Victory push, Territory policy, Diplomacy, and both same-lord transition bodies. The archive's five phases retain their full guidance when mapped to these sections.
- `panelOrder` determines visible entries. Every selected ID resolves, and all five reference groups are populated for every route.
- Use distinct flat dataset IDs for differing research, skill, building, or mechanic priorities. Per-route archive datasets (both guides) become flat entries selected per route; one route must not alter another's queue through a shared object. Ostankya's four witch lores map into an existing item dataset kind with route selection; no new dataset kind is added.
- Malakai's adventures, ship milestones, fortresses, provinces, and named targets keep their unique guidance in supported prose or datasets alongside the objective rows they feed; their exclusion of the archive's interactive machinery removes no unique guidance.
- Follow the current renderer's transition-slot convention: present transition bodies also need their titles declared in `gaps` to be walked by `registrySlots` in `app/views/plan.ts`. These declarations are rendering slots, not missing content, and must not produce a gap marker when the body exists.
- If any meaningful material cannot fit the current schemas and registered sections, report the exact block and stop for separate approval. Do not add guide-specific app logic, unsupported fields, raw HTML fragments, a new dataset kind, or a renderer change.

### Complete and usable armies

- The archives keep shared troops in `units` and commanders/heroes in lord-specific `malakai` or `mother` arrays plus `generic` (Malakai additionally carries `genericUnits`). Their own renderer combines those arrays; the current app does not.
- Normalize each applicable displayed `legendary` and `generic` column into a complete roster, using any actual variant-specific troop core. Do not copy only the character arrays or treat a missing archive field as an absent army.
- Each non-empty roster column has the stated slot count and one legal commander, with explicit alternatives for unavailable heroes or units. Preserve intentionally smaller home, airwing, or specialist forces and their purpose.
- Templates are alternatives and progression stages, not instructions to clone Malakai or Mother Ostankya (or an embedded unique hero) into simultaneous forces. A genuinely generic-only force may retain an explicit absent legendary column.
- Preserve the product setup: Immortal Empires, VCO, Normal/Normal, Smart Autoresolve, all WH3 DLC, and WH1/WH2 free content only. Record each archive's start context (Malakai's northern theatre; Ostankya's default Bleak Hold Fortress start and optional Plesk homecoming, including the archive's note that CA describes Plesk as the harder start) without silently assuming another lord's exclusive campaign subsystem.
- Recruitment gates, practical substitutions, economic readiness, manual doctrine, and Smart Autoresolve evidence limits remain visible. Unknown current access is flagged rather than asserted as verified.

### Objectives and ledger compatibility

- Objective rows represent actual conditions or clearly labelled search candidates. They do not invent a requirement to complete every candidate or silently turn a historical threshold into a current fact.
- Malakai's rows come from the archive's structured `objectives` lists. Their positional keys (`province:0`, `fortress:3`, `target:moulder`, `city:Altdorf`) become semantic, stable IDs; the named condition is the identity, and the silver-hall, city, and target conditions stay separate rows.
- Ostankya's rows are derived only from stated conditions: route I — the five named campaign Hexes plus the Malediction of Ruin ritual; route II — the three named Lustria settlement objectives; route III — the 32-settlement occupation counter and the six named New World target factions. The derivation must not add, merge, or invent conditions, and the hex and target lists do not become eighteen mandatory conquests.
- Preserve each archive's distinction between qualifying actions (occupy, loot, raze, or sack) and ownership, between required targets and ordinary campaign bookkeeping, and between the ritual route's territory-as-means posture and a fixed province ceiling.
- Historical script timing, diplomatic credit, reward scope, and other unresolved trigger details retain scoped evidence and live checks instead of guessed mechanics.
- New objective IDs are semantic and stable within their lord/route. Do not use display position as identity or reuse an ID for a different condition; saved progress follows these IDs.
- Guide confidence and player completion remain separate. Adding content neither marks objectives done nor changes the global one-active-campaign rule.

## 5. Negative Paths & Edge Cases (The "What-Ifs")

### Error Handling

- **Primary source unavailable or incomplete:** Retain traceable archive evidence with its scope, mark the unresolved assertion honestly, and provide a practical verification step. Do not fabricate a source, title, objective, threshold, version string, or current version. If the missing fact prevents a usable route plan, report the blocker rather than claim the guide complete.
- **Conflicting current and archived evidence:** Explain the difference near the affected guidance. Apply a supported correction within this feature's boundary; a strategy-changing or model-changing conflict requires approval.
- **Invalid shape or dangling references:** Existing lint and boot validation reject the authored content. Correct the content instead of weakening validation or introducing a faction exception.
- **Unsupported archive interaction:** Preserve its unique guidance in supported prose or datasets; exclude the interaction itself with a reason. If guidance cannot be represented, stop under the content-only boundary and report the exact block.
- **Ledger read/write failure:** Inherit existing load errors, retry, optimistic rollback, and visible failure behavior. This migration introduces no alternate state store.

### Empty States

- No strategy panel or supported plan section remains empty when the archive supplies material. A genuine missing-content gap must stay visible and be reported; it is not a completed six-plan migration.
- Unknown official titles use the existing unresearched marker. Both guides' missing optional crest content uses the existing reduced header, not fabricated artwork.
- Field notes and appearance settings retain their existing deferred states; archive prose must not promise that those features work, and the archive's save/restore and "progress stays in this browser" machinery must not be promised or imported.
- A route with no player campaign uses the existing no-active-campaign state, not imported or fabricated progress.

### Boundary Cases

- Long rosters, source notes, technology queues, adventure task lists, and route prose remain readable through the existing desktop/laptop layouts; do not truncate content to fit a panel.
- Shared entries remain shared only when their advice is genuinely identical. Route-specific usage notes retain a visible route-owned home.
- Repeated route and source IDs across different lords remain scoped to their own guide. Transitions never cross into another lord's route by accident.
- A candidate list, route reward, optional continuation (including the Plesk homecoming), or reference calculator is not an additional mandatory victory condition.
- Ostankya's derived ledger rows stay exactly the stated conditions; neither the Hex list, the target list, nor the settlement counter gains or loses rows to fit another guide's density.

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

Preserve the archives' concrete route-specific advice and thematic voice while adapting references to their new visible homes. Replace obsolete instructions such as using an archive-only reader, save/restore control, meter, or local note control with accurate current-app guidance. Distinguish official requirements, strategic recommendations, archive evidence, and unresolved live checks. No new exact UI labels are required beyond established component vocabulary.

## 7. Acceptance Criteria (The "Mission Accomplished" Checklist)

- [ ] Home and existing navigation expose Malakai and Mother Ostankya alongside the three existing lords, with correct guide identity, environment, and reduced header; cross-guide search returns hits for both new guides; existing manifest entries and existing guide content remain unchanged.
- [ ] All six routes are usable end-to-end: full phase guidance, interpretation, bottleneck, territory policy, diplomacy, phase summaries, and both continuation bodies are visible, with no real content-gap markers where material exists.
- [ ] Every meaningful archive block — including the guide-local `adventures`, `shipMilestones`, `fortresses`, `provinces`, `targets`, `lores`, `hexes`, `ingredients`, `legacyResearch`, and `evidence` structures and all evidence notes — has a recorded visible target or a reasoned exclusion that removes no unique guidance. Supported factual corrections identify their evidence and archive discrepancy.
- [ ] All five reference groups are populated on every route in the intended order; both guides' per-route variants remain independent entries, and every selected entry is accessible through the current detail pages.
- [ ] All 30 army templates render their complete applicable roster columns, with correct stated counts, legal commanders, clear generic/legendary distinctions, readiness and access caveats, substitutions, and manual doctrine. Troops do not disappear because only character arrays were copied; airwing, specialist, and home forces keep their stated size and purpose.
- [ ] Primary-source checks of the six VCO title/objective/reward sets are recorded with their scope and date. Verified titles remain distinct from strategic subtitles; unresolved titles retain the existing unresearched state and archive attribution without invention.
- [ ] Each guide displays honest archive provenance: the September 2026 research date, no invented VCO version string, and no claim that the whole guide or the installed game/mod stack was freshly verified.
- [ ] VCO- and patch-dependent claims carry truthful confidence attribution and resolving citations; consequential uncertainties include actionable checks and appear in the existing flagged-items surface rather than only shared prose.
- [ ] Malakai's objective rows carry semantic stable IDs covering his structured province, fortress, target, city, and silver-hall conditions; Ostankya's rows are exactly her stated conditions (five Hexes plus the ritual, three named settlement objectives, the 32-settlement counter plus the six named factions). No derived row adds, merges, or invents a condition, and no candidate list, historical trigger, or optional continuation becomes an invented requirement.
- [ ] Both transitions on each route link to the correct opening of another route for the same lord. Transition slot declarations do not hide the authored bodies or render false gap markers.
- [ ] The existing ledger consumes the new stable objective IDs, preserves planning/game-confirmed separation and the global one-active-campaign rule, and survives reload. Runtime write checks use an isolated test store, never the player's campaign files.
- [ ] The two raw HTML archives remain byte-for-byte unchanged; no shared app/schema/lint-rule/server/style/dependency change is required, and no archive-local state is imported.
- [ ] `npm run lint:content`, `npm test`, `npx tsc --noEmit`, and `npm run build` pass without weakening existing behavioral coverage to accommodate the larger corpus.
- [ ] HTTP/browser inspection covers both guides' desks, all six route plans and selected reference groups, full army columns, sources/flags, transition destinations, deep-link reload, and ledger objective display at desktop and laptop widths. Website validation is not reported as live campaign or Smart Autoresolve testing.
