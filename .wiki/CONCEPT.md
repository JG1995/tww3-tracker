# Product Concept Document: TWW3 VCO Campaign Companion

> Authority: This document owns product purpose, users, principles, and boundaries. It does not own the implementation backlog or current architecture.

---

## The Idea

A personal local reference site for **Total War: Warhammer III — Immortal Empires** played under the **Victory Conditions Overhaul (VCO)** mod. It hosts faction-specific campaign guides, each organized around the faction's three VCO victory routes, and each route is a complete, independent campaign plan for its Legendary Lord: opening moves, army templates, skill orders, research, settlement roles, unique mechanics, diplomacy, and territory policy.

The central organizing principle, carried over from the guide specification: **the VCO route is the campaign's strategic premise.** Every other recommendation — army, skills, research, settlement builds, diplomacy, mechanic use — exists to reinforce that premise. A Route I campaign and a Route III campaign for the same Lord should feel like two different stories, not two checklists on the same page.

The site is not only a static library. It also integrates the research work behind the guides: which claims are verified against the current game patch and VCO version, which are historical, inferred, or still need in-campaign confirmation — with sources recorded next to the claims that need them.

## Problem Statement

The guides currently exist as five standalone HTML files in `.work/references/` — one per Legendary Lord (Alith Anar, Elspeth von Draken, Malakai, Mother Ostankya, Zhao Ming). Each file is a self-contained page of roughly 270–425 KB with its own layout, styling, scripts, and embedded content.

That is not sustainable:

- **No reuse.** Every new faction or route means regenerating another bespoke file instead of adding content to a shared structure. The five existing files already drift in layout and terminology even though they follow one shared specification.
- **No shared navigation.** There is no way to search across guides, compare the same topic (e.g. settlement roles, autoresolve warnings) between factions, or move from one Lord's route into another's transition section.
- **No research trail.** The specification demands strict separation of confirmed objective text, historical implementation, inferred strategy, and things to verify in a live campaign. Standalone generated pages have no durable place for sources, patch/VCO version context, or verification status.
- **No living state.** A VCO campaign is long. The specification calls for ledgers that track individual objective progress and — critically — keep *planning progress* separate from the game's *actual completion state*. Static pages cannot hold that state per campaign.
- **Staleness is silent.** Factions get reworked between patches and VCO itself changes. A page that is not versioned against the patch and VCO version it was researched under quietly becomes wrong.

## Solution

### 1. One site, many guides

A single local site hosts all faction guides behind a shared structure: common navigation, shared visual language, and one content model that every guide fills. Adding a new Legendary Lord is an act of adding content, not rebuilding a page. (How the site is built is an architecture decision owned by [ARCHITECTURE.md](ARCHITECTURE.md); this document only owns that the outcome must exist.)

The five existing atlases are the seed content: their material is restructured into the shared model, not preserved as opaque files.

### 2. Route-first content model

Each guide is organized as three independent route plans plus shared faction fundamentals, following the guide specification:

- **Shared fundamentals** — economy cores, universally valuable tech, essential skills, key mechanic unlocks: advice that holds for any route.
- **Route plans** — identity, exact current VCO objectives, reward, strategic interpretation, opening, early/mid/late game, victory push, diplomacy, territory policy, and a transition section into the other routes.
- **Reference dashboards** — army templates (early/mid/late/specialist/home guard, with Legendary vs Generic lord versions), character skill orders, research priorities, settlement role build orders, and unique-mechanic references.

Two of the seed guides (Mother Ostankya and Zhao Ming) are the same faction, Grand Cathay — the model must make "three distinct campaign stories for one faction" a first-class case, not an accident.

### 3. Research and verification integrated

Research is a visible part of the product, not a one-time input:

- Every guide records the game patch and VCO version it was researched against.
- Claims carry a confidence state: **confirmed** (current objective text or verified game behavior), **historical** (true of an older implementation), **inferred** (strategy reasoning), **verify in campaign** (uncertain VCO trigger or reward behavior).
- Source/verification notes live with the content they support, so a patch can be checked as a review pass over flagged items rather than a full rewrite from memory.
- Nothing invents hidden triggers to look complete; gaps stay visible as gaps.

### 4. Living campaign ledgers

For a campaign in progress, the site tracks a VCO ledger: per-route objective items, planning progress, and the game-confirmed state kept explicitly separate (objective appears complete → mission marked complete → victory registered → reward received). A checklist in the site never pretends to determine whether the game considers an objective done.

## Target Audience

| Segment         | Description                                                                                              | Key Need                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **The player**  | Single human player (the repository owner). Solo hobbyist use. Normal campaign / Normal battle, Smart Autoresolve mod, all WH3 DLC, WH1/II free content only. | A campaign companion that answers "what should I actually do?" for a chosen VCO route, and stays trustworthy as patches change. |

Scope calibration: this is a hobbyist solo project. There is no second user, no publishing requirement, and no support obligation.

## Differentiation

| Existing option                    | Its strength                                        | How this differs                                                          |
| ---------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- |
| Standalone generated HTML atlases  | Rich, faction-specific content, already written      | Shared structure, cross-guide search, versioned research trail, per-campaign ledgers; new factions cost content, not pages. |
| Community wikis and databases      | Broad, crowd-maintained unit/building/tech data      | They are encyclopedias, not campaign plans. This product gives route-specific *recommendations*, not raw data. |
| Forum/YouTube faction guides       | Experienced-player opinions, often current          | Not tied to VCO victory routes, not versioned against patch/VCO state, and not structured for mid-campaign reference. |

## Core Principles

1. **The route is the premise:** army, skills, research, settlements, and diplomacy all follow the chosen VCO route. Do not impose a global playstyle (tall/wide/expeditionary) where the route does not demand it.
2. **Thematic before optimal:** recommendations are strong and sensible, forgiving, and reasonably good under Smart Autoresolve — but a faction's identity (Bretonnian cavalry, Skryre machines, Shadow-walkers, Malakai's Slayers) is not sacrificed for optimization or micro-reduction.
3. **Honest uncertainty:** confirmed, historical, inferred, and verify-in-campaign are four different states. The product shows which state a claim is in, and never fabricates a trigger or claims an objective complete.
4. **Companion, not wiki dump:** guidance answers "what should I actually do?" with concrete recommendations, while acknowledging legitimate alternatives instead of enumerating every unit and building.
5. **Content is separable from presentation:** the guides' value is their content and its research trail. The structure exists so content can be added, searched, and re-versioned without regenerating pages.

## Success Looks Like

A campaign is about to start. The player opens the site, picks Grand Cathay, and sees both available Lords side by side. Choosing Mother Ostankya and Route II shows a complete plan: the official route title, a short thematic subtitle, the exact current objectives and reward, the first twenty turns in concrete steps, and which two armies to field. During turn 30, mid-campaign, the player comes back for the dashboard: the mid-game army template, the settlement role for the province just captured, and the mechanic upgrade that is next in order. They tick the ledger as VCO items complete, and the ledger still clearly shows that "I believe this is done" and "the game marked this done" are different facts. A patch drops; the site shows which patch and VCO version each guide was verified against, and the flagged verify-in-campaign items give a short, concrete re-check list instead of a rewrite from scratch. A month later a new faction's guide is added: it uses the same structure, inherits the site's navigation and search, and only its own content is new.

## Scope Boundaries

### In Scope (MVP)

- Local site hosting the five existing guide atlases, restructured into the shared content model.
- Consistent navigation and cross-guide search over the guide content.
- Per-guide research/verification notes: patch + VCO version context and the four confidence states, with sources.
- VCO ledger tracking for a campaign in progress, with planning progress and game-confirmed state kept separate.
- Route transition sections connecting each route plan to the other two for the same Lord.

### Out of Scope (MVP)

- Multiplayer builds or hyper-optimized single-faction doomstacks.
- Generic faction encyclopedia content (full unit stats, complete tech/building trees) — reference data, not recommendations.
- Any other game or any Total War title besides WH3 — Immortal Empires.
- Live game integration (reading saves, auto-detecting campaign state); game-confirmed status is recorded by the player.
- Hosting for others, publishing, accounts, or cloud sync.
- Ownership assumptions for paid WH1/II DLC; unavailable units get in-line replacements, not silent drops.

## Risk Assumptions

1. **The seed atlases contain all the content they appear to contain.** The five HTML files are assumed to be complete, self-contained renderings of the specification's sections. If any guide is missing a required section (e.g. generic-lord armies or the VCO ledger), restructuring surfaces that as a content gap to fill, not a bug.
2. **VCO documentation stays partly opaque.** Some VCO objectives and rewards are incompletely documented publicly. The design assumes uncertainty is permanent, not temporary — the confidence states and verification workflow must work without ever getting a complete official spec.
3. **One shared content model fits all factions.** The specification deliberately avoids forcing every faction into identical mechanic headings. The shared model may need optional/variable sections per faction; if two or more restructurings fight the model, the model changes. ARCHITECTURE must keep the content model easier to change than the site around it.
4. **The player's setup stays roughly constant.** Normal/Normal, Smart Autoresolve, all WH3 DLC plus WH1/II free content are current inputs to every recommendation. Changes (difficulty, autoresolve off, new DLC) make recommendations re-evaluable, not the site obsolete — but the MVP does not build per-profile recommendation systems.
