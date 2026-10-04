# Product Requirements Document: TWW3 VCO Campaign Companion

> Authority: This document owns product requirements, priorities, and release shape. Purpose, users, and principles live in [CONCEPT.md](CONCEPT.md); information architecture and the content model live in [DESIGN.md](DESIGN.md); the implemented stack lives in [ARCHITECTURE.md](ARCHITECTURE.md).

## Product Overview

**Product Vision:** A personal local site where each VCO victory route is a complete, researched, versioned campaign plan for a Total War: Warhammer III Legendary Lord — and where in-campaign progress is tracked without ever conflating "I think it's done" with "the game says it's done."

**Target Users:** A single user (the repository owner). Solo player: Normal campaign / Normal battle, Smart Autoresolve mod, all WH3 DLC, WH1/II free content only. No secondary users.

**Business Objectives:** Personal project — the objectives are:

1. Make the existing five ChatGPT-generated faction atlases browsable and extensible through one shared structure instead of five bespoke HTML files.
2. Make the research behind each guide visible: patch/VCO version context, confidence states, and sources.
3. Make a live VCO campaign trackable: per-route ledgers with planning progress and game-confirmed state kept separate.

**Success Metrics:** Measured by usefulness in play, not traffic:

- The pilot faction's complete guide is usable end-to-end during an actual campaign: route plan, dashboard sections, and ledger all reachable without opening the raw HTML files.
- Every restructured claim that depends on VCO behavior or current patch data carries an explicit confidence state; no claim is left unattributed.
- Adding the second faction costs content, not new pages: it reuses the pilot's structure, navigation, and search without modifying shared code beyond content additions.
- Mid-campaign questions ("which settlement role?", "what's next on Route II?", "is that tech worth it?") are answerable from the site in under a minute.

## User Personas

### Persona 1: Jonas — the player
- **Demographics:** Adult hobbyist, technically proficient developer, single user of the site.
- **Goals:** Run a thematic VCO campaign per Legendary Lord; have strong, sensible, forgiving recommendations that fit Smart Autoresolve; know what to do in the opening, mid-campaign, and victory push; keep honest track of VCO objective progress; re-verify advice after patches.
- **Pain Points:** Five large self-contained HTML files with no shared navigation or search; no visible research trail or version context; no durable per-campaign progress tracking; silently stale advice after patches or VCO changes.
- **User Journey:** Before a campaign: pick lord → pick route → read the full plan. During the campaign: open the dashboard for army templates, settlement roles, and mechanic order; tick the ledger as objectives complete and record game-confirmed states. After a patch: review the version banner and the flagged verify-in-campaign items. When adding a faction: add content to the existing structure.

There is intentionally no second persona. Requirements that only matter with more users (accounts, sync, permissions, hosting) are out of scope.

## Feature Requirements

| Feature | Description | User Stories | Priority | Acceptance Criteria | Dependencies |
|---------|-------------|-------------|----------|---------------------|--------------|
| **F1. Guide site with shared structure** | One local site hosts all faction guides: common layout, navigation (home → faction/lord → route → section), and one content model every guide fills. | As a player, I want one place to open and find any guide section, so I stop hunting through five separate files. | Must (v1.0) | Pilot faction reachable as home → faction → lord → route → section. All navigation works in a desktop browser with no build step required to just read. Structure accepts a second faction as pure content addition. | None |
| **F2. Route-first content rendering** | Renders the guide specification's content model: shared faction fundamentals, three independent route plans (identity, objectives, reward, interpretation, opening, early/mid/late, victory push, diplomacy, territory policy, transition), and dashboard sections (army templates, skill orders, research, settlement roles, unique mechanics). | As a player, I want the whole route plan in one coherent flow, so the route reads as a campaign premise, not a checklist. | Must (v1.0) | Pilot faction shows all specification sections present or explicitly marked as content gaps. Official VCO route titles are visually distinct from guide-created thematic subtitles. Shared vs route-sensitive advice is visibly separated. | F1 |
| **F3. Research & verification notes** | Per-guide version context (game patch, VCO version) plus per-claim confidence states: confirmed, historical, inferred, verify-in-campaign. Sources recorded where a claim depends on external documentation. | As a player, I want to know how sure each claim is and against which version it was checked, so a patch becomes a review pass, not a rewrite. | Must (v1.0) | Pilot guide displays its patch + VCO version. Every claim depending on VCO behavior or current patch data carries one of the four states. At least the uncertain VCO items are flagged, with their open questions visible. No fabricated triggers or completion claims. | F1, F2 |
| **F4. Seed content migration** | Restructure the ChatGPT-generated pilot atlas from raw HTML into the shared content model. Originals kept untouched in `.work/references/` as the raw archive. | As a player, I want the existing guide content preserved while gaining structure, so nothing is lost to the restructure. | Must (v1.0) | All pilot atlas content present in the new structure or listed as an explicit content gap. `.work/references/` unchanged and gitignored. Migration discrepancies resolved in favor of the original file and noted. | F2 |
| **F5. VCO campaign ledger** | Per-campaign, per-route progress tracking: objective items with planning progress and a separate game-confirmed track (objective appears complete → mission marked complete → victory registered → reward received). State persisted as plain files in gitignored local storage. | As a player, I want my campaign progress to survive between sessions and browser resets, and to never mistake my checklist for the game's state. | Should (v1.0) | Ledger for the pilot faction's active route persists across site reloads and is stored outside Git. Planning and game-confirmed states are stored and displayed as separate fields. Completing the checklist never marks the game-confirmed track done. | F2 |
| **F6. Cross-guide search** | Search over all guide content (sections, units, tech, buildings, mechanics), with results grouped by faction/route. | As a player, I want to compare one topic across factions or find a unit, so I stop scrolling whole atlases. | Should (v1.1) | Search returns hits from every migrated faction with faction/route context. Usable by keyboard. Meaningful only once two or more guides are migrated; built or completed in the same release as the second faction. | F1, two migrated guides |
| **F7. Route transition views** | Each route's transition section links into the other two routes' opening/adjustment guidance for the same lord. | As a player, I want to continue into another route after finishing one, so continuation is convenient, not a restart. | Should (v1.0) | All three route pages of the pilot faction cross-link transitions bidirectionally. | F2 |
| **F10. Atlas UX re-alignment** | Align the site's chrome, information architecture, and visual system with the reference atlases: adopt the new hash grammar, three-tier header, eight-page lord IA, slate/brass styling, and optional crest, environment, and route-phase content. | As the player, I want the guide to retain the atlases' navigation and visual language while using the shared site model, so I can move between route plans and reference material in play. | Should (v1.1) | The reference desk, route plan, three detail pages, ledger, field notes, and sources/settings routes use the new grammar; all lord- and route-scoped pages show the atlas header; obsolete F2 dashboard and route surfaces are removed; the atlas palette and typography are used; optional chrome data loads and validates, and absent values remain absent. | F1–F5, F7 |
| **F8. Light local database for ledgers** | Replace file-based ledger storage with a simple local database once the ledger's data shape has stabilized in use. | As a player, I want ledger state to remain simple but durable and structured, so tracking multiple campaigns does not become file juggling. | Could (v1.2) | Chosen store (e.g. SQLite) is local-only, requires no server, and survives browser resets. File storage remains a supported export/backup form. | F5 proven in at least one real campaign |
| **F9. Faction onboarding aid** | A documented, repeatable procedure (or script) for adding a new faction: template content files, gap checklist against the specification, verification-note scaffold. | As a player, I want adding a faction to be a known checklist, so growth of the site stays cheap. | Could (v1.2) | A new faction can be added by following the documented procedure without editing shared site code. | F1, F2 proven across ≥3 factions |

Explicitly **Won't** (MVP and beyond): multiplayer builds, unit-stat encyclopedia data, save-file or live game integration (game-confirmed status is always entered by the player), hosting/publishing/accounts/cloud sync, per-profile recommendation systems, and any other game or Total War title.

## User Flows

### Flow 1: Pre-campaign planning
1. Open the site home; see available factions/lords with their patch + VCO version context.
2. Select a lord; see shared faction fundamentals and the three route plans side by side.
3. Read a route: identity, objectives, reward, opening, then early/mid/late and victory push.
   - [Alternative path] Route looks wrong for the desired style → read the other routes' transition sections before choosing.
   - [Error state] Section missing from content → visible "content gap" marker, never a silently empty page.
4. Commit to a route; (v1.0+) start its ledger.

### Flow 2: Mid-campaign reference
1. Open the active route's dashboard.
2. Pull what's needed: army template, skill order, research priority, settlement role, or mechanic upgrade order.
3. Update the ledger: tick planning progress, and separately record game-confirmed state when the game shows it.
   - [Error state] Objective appears complete but the game has not marked it → both states visible and distinct; no alert, no assumption.

### Flow 3: Post-patch verification
1. Open the faction guide; the version banner shows which patch/VCO version it was verified against.
2. Review the flagged items: verify-in-campaign claims and any objectives with known uncertain VCO triggers.
3. Update confidence states as the live campaign confirms or refutes them; record the new version context.
   - [Alternative path] Claim is refuted → mark historical, note the change, adjust the recommendation.

### Flow 4: Adding a faction (v1.1+)
1. Start from the content template for the shared model; generate or bring in the raw atlas.
2. Restructure content section by section; gaps surface as explicit markers.
3. Fill verification notes: patch, VCO version, sources, confidence states.
4. Navigation, search, and ledger pick the new faction up without shared-code changes.
   - [Error state] The content model cannot express a faction's mechanic → model change is a designed, reviewed extension, not a per-faction fork.

## Non-Functional Requirements

### Performance
- **Load Time:** Instant for practical purposes — the site is local and content-sized. Any guide section should be usable without perceptible wait on a normal desktop machine.
- **Concurrent Users:** One.
- **Response Time:** Search and navigation should respond within a fraction of a second over the full (five-faction) content corpus.

### Security
- **Authentication:** None. Local, single user.
- **Authorization:** None.
- **Data Protection:** The site stores no secrets, no credentials, no personal data. Ledger files are game progress; losing them is inconvenient, not harmful. No network transmission of content is required by any feature.

### Compatibility
- **Devices:** Personal desktop; laptop and desktop both expected.
- **Browsers:** Current stable desktop browsers; no legacy support targets.
- **Screen Sizes:** Desktop widths primary; readable at laptop widths without horizontal scrolling.

### Accessibility
- **Compliance Level:** No formal target (personal tool), but the baseline is cheap: semantic HTML structure, keyboard-operable navigation and search, sufficient contrast, no content conveyed by color alone (confidence states in particular need text labels, not just color).

## Technical Specifications

Constraints only — the concrete stack is a DESIGN.md / ARCHITECTURE.md decision:

- **Local and personal:** runs on the owner's machine; no hosting, no accounts, no cloud sync. Reading the site must not require a running server or a build step.
- **Plain-text content:** all guide content lives as editable plain-text files (e.g. Markdown and structured data files) in the repository, versioned in Git. Editing content without running the site is always possible.
- **Ledger state outside Git:** campaign ledger state lives in gitignored local storage (v1.0: plain files; v1.2 candidate: a simple local database). It must survive browser resets and remain exportable as plain text.
- **No backend services:** no API server, no database server. If a store is added in v1.2 it is embedded and local-only.
- **Extensibility requirement:** adding a faction must be achievable as content-only work (F9's goal). The content model is easier to change than the site around it (per CONCEPT risk 3).

### Infrastructure
- **Hosting:** none.
- **Scaling:** none.
- **CI/CD:** none required. Optional local checks (content schema validation, link checking) are welcome but not mandatory for MVP.

## Analytics & Monitoring

None. A single-user local site has no telemetry, no dashboards, and no alerting. Success is measured by the personal criteria in Product Overview.

## Release Planning

No fixed dates — solo project, paced around campaigns.

### MVP (v1.0) — one-faction pilot
- **Pilot faction recommendation:** Elspeth von Draken. Three of the five seed files (Elspeth, Alith Anar, Zhao Ming) share one generated skeleton, so a successful Elspeth pilot immediately de-risks two straightforward follow-on migrations, leaving the two structurally different files (Malakai, Mother Ostankya) as the model's real stress test. Swapping the pilot is a one-line change if a different lord is about to be played.
- **Features:** F1, F2, F3, F4 (Must); F5, F7 (Should).
- **Success Criteria:** Success Metrics 1–2 from Product Overview; the pilot campaign (if one is started) is planned and referenced entirely from the site for at least the first 20 turns.

### Future Releases
- **v1.1 — full corpus:** migrate the remaining four atlases (F4 for each), deliver F6 cross-guide search, verify the "second faction is content-only" claim.
- **v1.2 — tracking growth:** F8 ledger storage upgrade (simple local database) if file-based tracking has proven its data shape in real use; F9 faction onboarding aid once the model has held across at least three factions.
- **v2.0 — only if the site earns it:** candidates are multi-campaign history and comparison (side-by-side ledgers of past campaigns), a patch-verification workflow that produces a concrete re-check list per faction, and cross-faction topic comparison views. None of these are committed until v1.x is in regular use.

## Open Questions & Assumptions

- **Question 1 — Pilot lord:** Is Elspeth the right pilot, or is a specific lord's campaign imminent (in which case that lord should be the pilot)?
- **Question 2 — Ledger granularity:** Does the ledger track one active campaign at a time, or should multiple campaigns (including finished ones) coexist from v1.0? MVP assumes one active campaign; finished campaigns are archived as plain files.
- **Question 3 — Content authority:** Where the restructured content and the original HTML disagree, the original file wins (assumed). If any atlas was edited after generation, that is not known to the site.
- **Assumption 1:** The five seed atlases contain all the content they appear to contain; missing specification sections surface as content gaps during migration, to be filled by new research, not invented.
- **Assumption 2:** VCO's public documentation stays partly incomplete, so the four confidence states are a permanent part of the product, not a migration-phase scaffold.
- **Assumption 3:** The player's setup (Normal/Normal, Smart Autoresolve, WH3 full DLC + WH1/II free content) is stable for the life of v1.x; changes re-evaluate recommendations, not the site.
- **Assumption 4:** The site's content is generated/researched with AI assistance (ChatGPT and Pi agents); the verification notes exist precisely because that pipeline can be confidently wrong about current VCO behavior.

## Appendix

### Competitive Analysis
See [CONCEPT.md — Differentiation](CONCEPT.md): standalone generated HTML atlases (rich but bespoke and non-reusable), community wikies/databases (broad data, no route-specific plans), forum/YouTube guides (experience, not VCO-routed or versioned).

### User Research Findings
From the player's established preferences (see CONCEPT): thematic campaigns over optimization; understandable army roles with limited battle micro; Smart Autoresolve compatibility; concrete "what do I actually do?" guidance over encyclopedic dumps; compact empires no longer a global requirement — territory policy follows the route.

### AI Conversation Insights
- **Specification (2026-10, ChatGPT, model not recorded):** Produced the 18-section guide specification (research requirements, route-first structure, dashboard categories, army design philosophy, confidence-state discipline, content hierarchy). This PRD's F2 section mapping and the four confidence states derive directly from it.
- **Seed content (2026-10, ChatGPT, model not recorded):** The five faction atlases in `.work/references/`. Two distinct generated skeletons observed: one shared by Elspeth, Alith Anar, and Zhao Ming; one each for Malakai and Mother Ostankya. This is the evidence base for the pilot ordering in Release Planning.
- **AI-Generated Edge Cases:** Objective appears complete but VCO mission not marked complete; VCO trigger/reward with no public documentation; thematic unit weak in autoresolve; same-faction lords with different route stories; patch reworking a faction after a guide is written.

### Glossary
- **VCO:** Victory Conditions Overhaul — a mod replacing Immortal Empires' victory conditions with per-faction objective routes and rewards.
- **Route:** One of a faction's three VCO victory routes; the strategic premise of a campaign plan.
- **Expedition Atlas:** The ChatGPT-generated per-lord guide document; the seed content for the site.
- **Confidence states:** The four states of a claim — confirmed, historical, inferred, verify-in-campaign.
- **Dashboard:** The quick-reference section of a guide (army templates, skills, research, settlement roles, mechanics).
- **Ledger:** Per-campaign VCO progress tracking, with planning progress and game-confirmed state as separate tracks.
- **Content gap:** A specification section with no content yet; shown explicitly, never as an empty page.
