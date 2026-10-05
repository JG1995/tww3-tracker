---
name: create-faction-guide
description: >
  Research, create, migrate, or update Total War: Warhammer III Immortal Empires
  faction guides in this repository's Markdown/JSON campaign atlas. Use for VCO
  route plans, thematic army templates, lord/hero skill priorities, research,
  settlement development, faction mechanics, or patch/DLC revalidation. Keep
  strategies route-specific, sourced, and practical under Smart Autoresolve.
  Not for unrelated app/UI work or generating standalone HTML pages.
---

# Create a faction guide

Produce a campaign companion that answers:

> Given this Legendary Lord, faction, VCO route, game/mod version, and available roster, what should the player do next—and why?

The VCO route is the strategic premise.
Research its requirements before designing armies; derive geography, diplomacy, mechanics, recruitment, skills, technology, and settlement roles from that premise.
Aim for **thematic first, sensible second, effective always**.
Do not produce a generic tier list, a mechanics encyclopedia, or the same doomstack with different route labels.

## Output and scope

The normal deliverable is repository content under `content/<lord-slug>/`, plus a manifest entry in `content/index.json` for a new guide.
The Preact app supplies presentation, navigation, confidence badges, source panels, and the campaign ledger.
**Do not generate another HTML atlas, embed guide data in app code, or add guide-specific JavaScript, CSS, localStorage, or dependencies.**

For a strategy question without a request to change files, answer with sourced advice rather than editing the repository.
For a content update, preserve unrelated routes and useful existing guidance.
If the request genuinely needs a new renderer or schema capability, explain the limitation and obtain approval for that separate implementation; do not silently expand content work into framework work.

### Load the relevant references

Supporting-file paths below are relative to this skill directory.
Repository paths elsewhere in the instructions are relative to the repository root.

| When | Read |
| --- | --- |
| Before creating, migrating, or editing guide files | [Repository content contract](references/repository-content.md): manifests, exact file shapes, frontmatter grammar, rendering limits, ID compatibility, and validation |
| Before new research, migration verification, or patch/mod/DLC revalidation | [Research and evidence](references/research-verification.md): source hierarchy, VCO trigger checks, confidence attribution, and incomplete-evidence handling |
| Before designing a new route or substantially changing its strategy | [Campaign design](references/campaign-design.md): comprehensive army, skill, economy, settlement, mechanic, and battle guidance |

For a narrow update, load only the needed sections of an already-read reference and the affected content.
Do not force a full-guide research pass for one corrected building name.
The current types, loader, lint, and renderers override examples in this skill if the repository has changed.

## 1. Establish the campaign and change contract

1. Read [README.md](../../../README.md), [.wiki/INDEX.md](../../../.wiki/INDEX.md), and the relevant current-state sections of [.wiki/CONCEPT.md](../../../.wiki/CONCEPT.md) and [.wiki/ARCHITECTURE.md](../../../.wiki/ARCHITECTURE.md).
2. Inspect the target guide, its sources, route documents, selected datasets, and any supplied material.
   For a new guide, inspect `content/elspeth-von-draken/` as a **format example**, not as verified game data or a mandatory army/phase template.
3. Determine whether the task is a new guide, archive migration, route redesign, targeted correction, or revalidation.
   Define which lord, routes, files, and recommendations may change.
4. Establish the actual setup:

| Input | Repository default unless the user overrides it |
| --- | --- |
| Campaign | Warhammer III, Immortal Empires |
| Victory mod | Victory Conditions Overhaul (VCO) |
| Difficulty | Normal campaign / Normal battle |
| Autoresolve | Smart Autoresolve; verify the particular mod/version before making mod-specific claims |
| Ownership | All WH3 DLC; WH1/WH2 free content only—not all paid DLC across the trilogy |
| Style | Thematic, forgiving, low-micro armies with practical manual and autoresolve use |
| Versions | Establish the game patch, installed/researched VCO version, and actual check date; never copy a seed guide's values as current |

Record setup in `guide.json.environment` and relevant shared prose; `version` records research context, not a claim of a completed in-game campaign.
Ask only when missing information blocks correctness: for example, no identified lord, conflicting DLC ownership, or a non-VCO request whose objectives cannot be resolved within the current content model.
If the current patch or installed mod cannot be established, state the bounded assumption and mark affected claims honestly; do not invent versions.

For an archive migration, preserve the source HTML in `.work/references/` unchanged.
Extract content and its provenance, not its styling, scripts, tabs, persistence, or obsolete field names.
Treat generated recommendations and archived factual claims as material to verify, not authority merely because they were in the original guide.

## 2. Research route requirements first

Use available web/source tools for current game and mod information; enable web access if the harness requires it.
Inspect supplied files or installed data when those identify the player's actual version.
Use the evidence reference rather than relying on model memory.

Research in this order:

1. Exact current VCO objectives and rewards, including control definitions and counters.
2. Faction and Legendary Lord mechanics that can satisfy those requirements.
3. Strategic geography, hostile corridors, staging points, diplomacy, and expansion stopping rules.
4. Army jobs and available units, including DLC and faction-specific access.
5. Current skill trees, technologies, buildings, landmarks, and recruitment gates supporting those jobs.
6. Community testing for practical interpretation, difficult matchups, and campaign bottlenecks.

Spend research effort where the recommendation depends on an uncertain interaction, a recent change, or exact mission wording.
Do not exhaustively research unused units and buildings.
Record source IDs and limitations as you go so evidence is not reconstructed after writing.

For each route, distinguish:

- The official VCO title (`vcoTitle`) from the guide-created thematic subtitle (`name`).
- Objective conditions from strategic interpretation.
- Route completion prerequisites from optional continuation/epilogue battles.
- VCO objectives from vanilla victory objectives that may coexist.
- Published objective text from verified trigger/reward behavior.

When a condition is ambiguous, explain the uncertainty, what observation would resolve it, and how to avoid spending the campaign on an untested assumption.
Do not invent hidden triggers or assume AI factions pursue human VCO victory routes.

## 3. Design a coherent campaign

For a complete guide, provide independent plans for the lord's three VCO routes, with shared fundamentals only where the advice really is shared.
For a single-route task, complete that route within the existing guide without redesigning the other two.
Do not fabricate extra routes if verified mod coverage differs; resolve that scope with the user.

Before writing, outline each route:

- **Identity:** one strategic fantasy and a reason to choose it.
- **Objective interpretation:** what must actually be conquered, defended, searched, allied, built, counted, or left alone.
- **Geography and diplomacy:** sensible theatre sequence, buffers, legal control relationships, scouting, and recovery/staging points.
- **Opening:** concrete first-war, recruitment, development, and scouting actions grounded in the current start.
- **Readiness gates:** conditions for departure, expansion, new armies, elite purchases, and victory—not brittle turn-number promises.
- **Army jobs:** the main host, repeatable supporting forces, homeland/frontier defence, and specialists where the route needs them.
- **Support:** role-specific character builds, research priorities, settlement programme, mechanic spending, and an affordable recovery reserve.
- **Stopping rule:** when further expansion stops serving victory.
- **Transitions:** how to reuse armies, treaties, territory, infrastructure, and research when continuing into either other route.

Use [Campaign design](references/campaign-design.md) for the detailed requirements.
Trace **turn one → first province → first major enemy → first objective → additional army → durable frontier → final condition → reward**.
If recruitment, upkeep, skill gates, technology prerequisites, travel, or building capacity cannot support the sequence, revise the plan before committing it to content.
Do not fund pre-victory decisions with rewards received only after victory.

## 4. Encode the guide in the existing model

Follow [Repository content contract](references/repository-content.md), including its examples and rendering caveats.
The content surfaces are:

| Surface | Authoring location |
| --- | --- |
| Guide identity, version, environment, route order, optional crest | `guide.json` |
| Shared faction fundamentals | `shared.md` |
| Route identity, objective/reward claims, phases, panel selection, phased prose, transitions | `routes/<route-id>.md` |
| Route-specific army templates and manual doctrine | `data/armies.json` |
| Lord/hero priority queues | `data/skills.json` |
| Research priority queues | `data/research.json` |
| Settlement roles and development | `data/buildings.json` |
| Strategically relevant faction mechanics | `data/mechanics.json` |
| Ordered VCO objective rows | `data/vco.json` |
| Evidence catalogue and verification limitations | `data/sources.json` |

Important implementation constraints:

- `panelOrder` controls which dataset entries the reader sees; a populated dataset alone does not populate the panels.
- Armies are nested by route, but skills/research/buildings/mechanics are **flat lord-wide maps**.
  Use distinct entry IDs and route selection when priorities differ; never overwrite a shared entry to implement one route's variant.
- Route bodies accept only the registered H2 headings.
  Use bold labels and lists within sections, not H1/H3 or invented H2 headings.
- Write JSON text fields as plain text, not HTML or Markdown intended to render as markup.
- Verify the displayed army columns contain the full usable roster.
  The current renderer displays `legendary` and `generic` directly; it does **not** automatically append `units` to character-only columns.
- Confidence attribution uses the four exact states: `confirmed`, `historical`, `inferred`, `verify-in-campaign`.
  Mark recommendations as reasoning, and isolate uncertain mechanical claims instead of presenting an entire mixed-confidence entry as confirmed.
- Keep route IDs, source IDs, and unchanged objective IDs stable.
  Do not reuse an existing objective ID for a different condition; explain necessary objective replacement because saved ledgers follow those IDs.

The reference desk and detail pages are generated from these files.
Do not create separate miniature copies of full pages for the desk.
Do not promise search, persistent field notes, appearance settings, tech checkmarks, or localStorage behavior merely because an archived atlas had them.
Check the current implementation before describing any interactive capability.

## 5. Verify the content and its rendering

### Strategy and factual checks

- Exact objective/reward wording, scope, named targets, counters, and ownership rules match the cited version or carry an explicit uncertainty.
- Each route's summary, prose, army choices, skill queues, research, settlement roles, mechanics, and ledger rows agree.
- Every complete army variant has the stated slot count, one legal lord, available embedded heroes, and a practical substitution for an inaccessible unit.
- Unique lords/heroes are not assigned to simultaneous armies; mounts and summons do not create extra army slots.
- Skill ranks, point gates, exclusive choices, automatic unlocks, technology prerequisites, recruitment tiers, hero capacity, and building-slot limits are plausible.
- The economy can sustain the proposed forces and infrastructure without assuming future loot or victory rewards.
- Each unresolved trigger has a concrete in-campaign check; source presence alone is not proof of verification.
- No newly completed section remains declared as a gap; no missing material is disguised as a complete guide.

### Repository checks

For guide-file changes, run from the repository root:

```sh
npm run lint:content
npm test
npx tsc --noEmit
npm run build
```

Inspect failures rather than weakening lint or tests to make content pass.
Some content tests preserve the original Elspeth migration exactly; change an expectation only when the approved content change genuinely replaces that behavior, and retain meaningful coverage.
Do not assert website validation proves the campaign strategy or Smart Autoresolve performance was tested in-game.

Serve the app over HTTP with `npm run serve` (built site) or `npm run dev` (development).
Reload after content changes: the content tree is loaded once at boot.
When browser tools are available, inspect the affected desk, plan, Armies/Skills/Research tabs, settlements, workshop, source links, ledger objective rows, and transition links.
Check long lists and both full army columns at a second-monitor width and a narrow width.
Use a test ledger store if exercising writes; never create, complete, or delete the player's real campaign just to test a guide.
If browser or in-game validation was not performed, report that limit explicitly.

When a check fails, fix the authored shape/content and rerun the affected check.
If the failure is pre-existing or needs out-of-scope framework work, report the exact blocker and leave the task incomplete rather than claiming success.

## Completion and handoff

A complete guide makes the player understand the campaign's identity, each army's job, what to build/research next, when to move, and when to stop expanding.
Its recommendations should be recognisably specific to **this lord + this faction + this route + this roster + this version context**.

Finish with a brief report of:

- The lord/routes and content files created or changed.
- The patch/VCO context and important sources checked.
- Material strategic changes and any ledger-ID compatibility impact.
- Validation actually performed, unresolved gaps, and checks still needing a browser or live campaign.

Do not commit changes, modify unrelated configuration, or write player state unless the user requests it.
A research-only answer, a draft with declared gaps, and a validated complete guide are different outcomes; name the delivered outcome accurately.
