# Malakai and Mother Ostankya Migration

**Design:** [Malakai and Mother Ostankya migration design](MALAKAI-OSTANKYA-MIGRATION-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Migrate the two accepted atlases into the existing F10 content surfaces so all six campaign routes — and all five lords — are usable without opening the standalone HTML guides. The sibling DESIGN owns requirements and acceptance criteria, including the content-only boundary and the stress-test clause: a genuine model limitation stops the work and requires separate approval rather than an improvised extension. Execution requires independent plan review, developer acceptance of the delivery graph, committed tracked authority, and explicit delivery authorization. Planning grants no execution or Git authority. `Accepted` denotes the accepted feature intent, not acceptance of this provisional delivery graph.

## User-visible behavior

- Home and current navigation expose Malakai and Mother Ostankya alongside the three unchanged existing guides; cross-guide search indexes both new guides automatically through the existing corpus walk.
- All six route plans and route-selected references are usable without opening the source HTML, including all 30 complete army templates, phase summaries, same-lord continuations, and the guide-local material that has no matching top-level dataset (adventures and their task checklists, ship milestones, fortresses, provinces, named targets, witch lores, campaign Hexes, ingredients, legacy-research folds, and evidence notes).
- Sources, qualified archival context, actionable flags, and semantic VCO conditions use the existing reference and ledger pages. Confidence never initializes player progress; the existing one-active-campaign rule and isolated test-store checks are preserved.
- Detailed behavior and completion criteria remain in DESIGN §§4 and 7.

## Invariants

- Production work changes only the two new guide directories and the append-only corpus manifest. Later packages are content-only. Elspeth/Alith/Zhao content, application/model/lint/server/styles/dependencies, the raw archives, and player state do not change. No app/schema/lint-rule/server/style/dependency change is planned; a forcing block is reported for separate approval, never improvised into an extension.
- Automated proof protects site behavior and structural contracts, not guide/editorial/game-strategy constants. Required manual CONTENT REVIEW and archive mapping prove migration completeness, roster coherence/legality, recommendations, source accuracy, and strategy accuracy.
- Every meaningful embedded or script-rendered archive block has a visible destination or a reasoned exclusion removing no unique guidance. Dataset counts alone do not establish completeness.
- Current types, loader, lint, selectors, and F10 renderers govern serialization. Preserve differing route variants as distinct flat IDs, resolving citations, complete displayed army columns, and transition-slot declarations. Ostankya's four witch lores map into an existing item dataset kind (skills); no new dataset kind is added.
- Narrow primary VCO checks do not establish whole-guide or installed-version verification. A supported factual correction records its evidence and discrepancy; a strategy-changing correction or model limitation stops for separate approval. No VCO version string is invented for either archive.
- Malakai's structured objective rows map one-to-one to semantic stable IDs; Ostankya's rows are derived only from her stated conditions (five Hexes plus the ritual, three named settlement objectives, the 32-settlement counter plus the six named factions). No derived row adds, merges, or invents a condition, and no candidate list or optional continuation becomes a mandatory victory condition. These IDs stay stable once integrated.
- Every integrated prefix passes its package gate and describes partial material honestly. No empty skeleton or unfilled plan is represented as a completed migration.
- During delivery only the coordinator writes DESIGN, IMPLEMENTATION, TODO, BACKLOG, ADRs, and recovery records. Workers report coverage and discoveries rather than editing those owners.

## Non-goals

No renderer/router/schema/dataset-kind/lint-rule/server/style/dependency change, no fresh whole-guide research pass or strategy rewrite, no archive-specific calculators or progress/state import, no change to the reference HTML files or the three existing migrated guides, no live game integration or in-game/Smart Autoresolve test claim. The separately accepted PR template already exists and is a prerequisite, not an implementation package.

## Current-state map

- Planning checkout: `main` at `d885258c7c5a9287d0c42c6ab22d4a8d8d9100c4`, empty Git index. `content/index.json` names `elspeth-von-draken`, `alith-anar`, `zhao-ming`; neither new guide exists. The accepted DESIGN is present but uncommitted in `.wiki/features/malakai-ostankya-migration/`; committing the accepted DESIGN and this ledger before execution happens in a separate authorized operation, not this workflow.
- Publication provider: GitHub, origin `git@github.com:JG1995/tww3-tracker.git`. Prior publication evidence: PR #1 `feat/alith-zhao-migration` and PR #2 `feat/cross-guide-search`, both merge commits to `main`. `.github/pull_request_template.md` exists (Summary/Validation sections) and is tracked; no `.github/workflows/` CI exists. Branch convention `feat/<feature>`.
- Read-only source archives (gitignored): `.work/references/Malakai_VCO_Expedition_Atlas.html` (SHA256 `824cc39b40c2a3c444746efa5cae255b988d286f0ae335e099943a985b6de349`) and `.work/references/Mother_Ostankya_VCO_Expedition_Atlas.html` (SHA256 `c8ecdcfdfa1c23b6c7cdd503d4001e0666cc83f09ebbbbc40aaaf60e65b85c53`). Both carry the same generator and embedded `<script id="guide-data" type="application/json">` contract as the already-migrated archives. Neither carries a VCO version string; Ostankya's JSON carries `date: "30 September 2026"` and Malakai's source notes record a September 2026 research date (recheck 30 September 2026; guide header updated 25 September 2026). Provenance is archival, not installed-stack verification.
- `app/content/load.ts` loads manifest-named files, calls the same lint as the CLI, renders Markdown, and freezes the tree. Filesystem orphan checks in `app/content/lint.ts` prevent a detached unregistered guide directory before its manifest entry.
- `app/content/query.ts` selects only `panelOrder` IDs; unselected Items have no panel home and are not flagged. `getFlaggedEntries` ignores shared-only claims; important uncertainty must reach route claims, selected entries, or VCO rows. `resolveSources` silently drops unknown ordinary `sources` IDs; the existing corpus-wide selected-card citation check in `test/views.test.ts` catches those across every committed lord. `walkCorpus` picks up new lords automatically — no search work is planned.
- `app/components/deskPanel.ts` displays `legendary` and `generic` army columns directly; it does not append `units`. `registrySlots` in `app/views/plan.ts` derives transition slots from `route.gaps`, and `slotAt` renders a present body before checking for a gap marker, so declared transition titles with present bodies render without a false gap marker.
- `app/ledger/logic.ts` creates and reconciles objective state by ID; the existing action region enforces one active campaign. `tools/server.mjs` supports isolated `LEDGER_ROOT` and ephemeral `PORT=0` for final runtime proof.
- Test baseline at planning: 233/233 tests pass, `npx tsc --noEmit`, `npm run lint:content`, and `npm run build` clean. Corpus-dependent tests are already lord-count-agnostic: `test/elspeth-skeleton.test.ts` selects Elspeth by slug; `test/views.test.ts` home/citation checks iterate the supplied tree; `test/search.test.ts` uses `firstHitOf` per kind on the committed corpus (new lords append after `zhao-ming` in manifest order, so first-of-kind samples remain stable) and lower-bound ≥2-guide assertions; `test/content-model.test.ts` and `test/lint-cli.test.ts` use fixed two-lord fixtures. No test adaptation is anticipated for this migration; if execution refutes that, the registration package owns the bounded evidence-first adaptation without dropping existing coverage, routed through the coordinator.
- Known archive structure — Malakai (`The Grungni Expedition Atlas`): three routes, 15 armies (early/mid/late/airwing/home per route), 44 sources, shared blocks `opening`/`smart`/`manual`/`spending`, route-level `skills` (7 keys: `malakai`, `lord`, `engineer`, `gotrek`, `felix`, `runesmith`, `thane` — `malakai` and `lord` are per-route variants, the rest shared), `research` (`route` per-route queue plus shared `opening`/`gunline`/`air`/`economy`/`slayers`), `builds` (per-route sets over 10 roles), `mechanics` (`ship`/`shiplate`/`adventures`/`deeps`/`grudges` per-route plus shared `forge`), route-level `buildOrder`/`adventureOrder`, four phases per route with `actions`/`aim`/`ready`, and guide-local datasets: structured `objectives` (9/12/11 rows keyed positionally, e.g. `province:0`, `fortress:3`, `target:moulder`, `city:Altdorf`), `adventures` (7 with task checklists), `fortresses` (12), `provinces` (8), `targets` (9 triples), `shipMilestones` (10 triples), `legacyResearch` (5 tech-path keys). Armies carry no explicit `size` key: intended sizes derive from the roster rows and stated context (field/airwing 20-slot, home 12-slot hold guard with Malakai as emergency relief). Achorage detail — the archive's own renderer combines `units` with the `malakai`/`generic` character arrays plus `genericUnits`; the current app does not append `units` itself.
- Known archive structure — Mother Ostankya (`The Witch's Expedition Atlas`): three routes, 15 armies (early/mid/late/special/home per route) with explicit `size` (20-slot field/special, 12-slot home), 29 sources, six shared blocks (`opening`/`smart`/`manual`/`spending`/`start`/`spellPrimer`), route-level `skills` (5 keys: `mother` per-route variant plus shared `druzhina`/`patriarch`/`hag`/`ataman`), `research` (`route` per-route queue plus shared `opening`/`forest`/`expedition`/`later`), `builds` (nine roles, all shared content), `mechanics` (`route` per-route queue plus shared `hut`/`hexes`/`devotion`/`court`/`access`), four phases per route, prose-only route objectives, and guide-local datasets: `lores` (4 witch-lore paths in the flat item shape: `shadows`/`hags`/`death`/`beasts`), `hexes` (5 records with role/use/caution), `ingredients` (3 records, each with six candidate sites), `targets` (6 named New World factions with advice), `legacyResearch` (13 tech-path keys), `techs` (22 named tech records), `evidence` (7 notes), and `date` (30 September 2026). The archive claims a witch/Wild-Hunt Kislev campaign (Devotion, Huts, Ataman, Druzhina; IE Kislev section per its source notes) with a default Bleak Hold Fortress / Volksgrad start in Naggaroth and an optional Plesk homecoming; the DESIGN records that CONCEPT.md's Grand Cathay description of Ostankya is contradicted by the archive and is flagged for documentation reconciliation at close-out, not silently rewritten by this feature.
- Commands: `npm test`, `npx tsc --noEmit`, `npm run lint:content`, `npm run build`, and `npm run serve` (reading path over HTTP; `PORT=0` + isolated `LEDGER_ROOT` for runtime proof). No implementation gates, server/browser checks, or external research have run in planning beyond the recorded baseline.

## Feature architecture

### Migration outcomes

Use the existing manifest, shared Markdown, three route documents, seven datasets, and no crest per guide (neither archive contains a suitable SVG; both use the existing reduced header, not fabricated artwork). Registration creates a valid, discoverable archival reference entry with honest incomplete plans. A VCO contract package then checks that lord's three title/objective/reward sets and establishes the condition rows together, before related strategic material is migrated: Malakai's structured rows map one-to-one; Ostankya's rows are derived only from her stated conditions.

Each reference family is one review/recovery seam: skills (including Ostankya's witch lores), research (with legacy-research tech folds), settlement roles, faction mechanics (with Malakai's adventure/ship-milestone folds and Ostankya's Hex records), and all fifteen army templates with full-roster normalization. Select the migrated family immediately in the three route documents so the existing detail pages expose it without waiting for complete plans. Leave other groups and plan sections honestly incomplete.

A complete route package migrates its chronology, identity interpretation, route-use notes, territory/diplomacy, phase summaries, and both continuations together. Existing references and checked victory conditions are its prerequisites. Do not separate a transition body, army note, item variant, or named-target record into a commit merely because it is independently editable.

### Coverage destinations

This is the starting inventory, not completed mapping evidence. Each worker reports concrete destinations/exclusions for its families; the coordinator records the reconciled mapping under Discoveries.

| Material | Visible destination and owning package family |
| --- | --- |
| Identity, environment, no crest, archive date/version provenance and source catalogues | Registration; actual narrow checks and scoped source notes in VCO contract |
| Shared blocks (Malakai: opening/smart/manual/spending; Ostankya: opening/smart/manual/spending/start/spellPrimer), equipment/access assumptions, budget/reserve/payoff explanations, common doctrine and end-of-turn routine | Shared fundamentals, including meaningful non-data prose from army/economy/budget/notes renderers (Ostankya's spell primer and start-choice prose included) |
| Character queues and override priorities; role/effect/gate cautions; Malakai's seven skill builds, Ostankya's five builds plus the four witch-lore spell paths | Skills; route-specific `use` notes in complete routes. Lores fold into `data/skills.json` (flat item shape, route-selected per each route's default lore and hag build) |
| Research queues, differing route queues, and all meaningful technology prerequisites/why-notes; Malakai's five and Ostankya's thirteen legacy-research tech paths plus Ostankya's twenty-two named techs | Research steps/details; tracker indexes excluded only after unique tech guidance is represented |
| Settlement roles and per-route subsets (Malakai's per-route build sets; Ostankya's shared nine roles with route subsets including the hut/field/reclaim roles) | Settlements; route selections follow `buildOrder` |
| Malakai's ship/shiplate/Deeps/Grudges/Forge guidance, the seven adventures with task checklists, and the ten ship milestones | Mechanics, including folded task/milestone guidance; no interactive adventure/checklist recreation |
| Ostankya's Devotion/Court/Hut/Access systems, the five campaign-Hex records, and the per-route mechanic schedule | Mechanics, including the five Hex records folded into the `hexes` entry; ritual and Hex use context in complete routes |
| Fifteen templates per guide, complete variant troops/characters, recruitment/readiness/substitutions, manual doctrine; Malakai's no-`size` roster derivation; Ostankya's explicit 20/12 sizes and generic-led homes | Armies; general battle doctrine in shared fundamentals |
| VCO titles/conditions/rewards, trigger/reward limitations and evidence | VCO contract: identity claims, ordered actual conditions, sources, and discoverable callouts/flags. Malakai 32 rows (9/12/11, semantic IDs); Ostankya 16 derived rows (6/3/7) |
| Malakai province/fortress/target/city advice, route-2 seven-of-twelve credit semantics versus twelve eligible sites, route-3 city control and Empire relief; Ostankya ingredient site advice, ritual/Hex operations, 32-settlement counter and six named factions | Corresponding complete routes; condition rows reference actual requirements, not candidate/bookkeeping checklists; the twelve fortress rows and six-site ingredient lists stay clearly non-mandatory candidate sets |
| Malakai's `fortresses`/`provinces`/`targets` guide data and Ostankya's seven evidence notes | VCO rows plus the affected route/source material; evidence notes reach the source trail and, where consequential, the flagged selector |
| Checkboxes, input values, saved notes/preferences, calculator forms, backup/reset/search controls, duplicate tracker indexes, save/restore and "progress stays in this browser" machinery | Reasoned machinery/state exclusions only after extracting unique instructional prose |

Inspect both embedded `guide-data` and enclosing archive renderer prose. Inventory is coverage evidence, not a package list. Report an unassigned meaningful block while handling its family, not only at final close-out.

### Authorship and proof rules

1. Compare the owning archive family with current types/lint/rendering; inventory its meaningful prose and evidence. Author supported content and its route selections together; then prove the observed result and report mapping/corrections. Use current Markdown/frontmatter and Item shapes, omit empty optional step fields, and map archive `builds` to `buildings`, archive route keys `route1`/`route2`/`route3` to stable `route-1`/`route-2`/`route-3`, and army template keys `airwing`/`special` to their intended entries.
2. Keep genuinely identical references shared. Give differing effective variants distinct flat IDs (`malakai-route-1`, `lord-route-2`, `ship-route-3`, `mother-route-1`, and so on) selected only on their owning routes, never overwriting a shared entry to implement one route's variant. Preserve meaningful common/base advice in the selected effective entries; a redundant unselected base entry is not coverage.
3. Follow DESIGN's archival-confidence policy. Source catalogues qualify archive authors' checked assertions; scoped delivery checks record actual date/version/assertion/limitations. Do not advance the guide-wide archive date or claim the installed stack is verified. Resolve both ordinary `sources` and confidence `src` IDs, including shared callouts. Route claims, selected Items, and VCO rows — not a bibliography alone — carry consequential uncertainty.
4. Shared fundamentals may add important flag callouts to Route I's partial Opening because shared-only claims are not collected. If any package adds prose before full plans land, identify the plan as partial, retain genuine missing-section gaps, and use only registered headings. Full route authorship preserves earlier flags/citations and removes partial notices only when its content is complete.
5. Route packages use only registered H2s and bold labels within them. Opening → Opening, Early → Early → Mid, Mid plus Late → Mid → Late, Victory → Victory push. Five summary pairs supplement every detailed action/aim/checkpoint. Retain each completed transition title in `gaps` as a rendering slot; remove genuine operational gaps. `transitionTarget` derives a destination's real Opening from loaded content, otherwise the link uses the existing route-top fallback. Each worker inspects its own full route and outgoing links against the destinations actually available on its frozen base, without requiring a sibling's final body. The coordinator rechecks links on each integrated prefix and owns whole-guide reconciliation and all twelve final Opening destinations after all six route results integrate.
6. Reuse the existing functional suites and synthetic fixtures. No new migration suites, fixture assets, harness, per-record expansion, or archive-dependent tests are planned. The existing corpus-wide selected-card citation check exercises every committed lord automatically as families populate `panelOrder`. Preserve legitimate unchanged Elspeth/Alith/Zhao assertions; do not perform unrelated cleanup.
7. Required manual CONTENT REVIEW accompanies every package. Report concrete archive-block destinations/exclusions and inspect the delivered content through current selectors/renderers. Check completeness, full displayed rosters and legal commanders/sizes, effective variants/order, technology guidance, targets/conditions, phases/use notes, recommendations, confidence and source accuracy against the archive and bounded VCO evidence. These are content obligations, not automated snapshots. Do not add assertions pinning new-guide roster counts/commanders, technology order/names, corpus counts, prose, targets, conditions, full phases, or archival queue slots.

**Existing functional proof portfolio:**

- `test/content-model.test.ts` and `test/lint-cli.test.ts`: multi-lord loading, schema failures, manifest/reference resolution, confidence states and flagged selection, using fixed two-lord fixture inputs. Content lint also checks every authored package's structural validity.
- `test/components.test.ts`: supplied army columns/rows and explicit absence, Item steps/details, sources and confidence; Elspeth-scoped callout assertions filter by slug. Existing synthetic armies use arbitrary sizes; this proves rendering, not game roster legality.
- `test/views.test.ts`: lord-scoped queries, supplied panel selection/order, detail/plan/source rendering, phase and objective absence, registered sections/gaps, same-lord Opening transitions and route-top fallback, the data-driven home card/version-context check, and the corpus-wide selected-card source-resolution check. It loops over every supplied lord, so new guides are exercised automatically.
- `test/search.test.ts`: tokenized engine over the committed corpus and fixtures; kind samples use first-of-kind hits (stable under append-only manifest order), the 30-hit cap uses a >30 lower bound, and performance has a 500 ms tripwire.
- `test/router.test.ts`: hash grammar and section navigation. `test/ledger-logic.test.ts`, `test/ledger-state.test.ts`, `test/ledger-io.test.ts`, `test/server.test.ts`, and existing view/component cases protect ID-keyed reconciliation, independent progress/defaults, active-campaign blocking, rollback and persistence with synthetic IDs and isolated stores. They do not establish factual VCO requirements.

**Common package gate:** `npm run lint:content`, `npm test`, `npx tsc --noEmit`, and `npm run build`, plus required CONTENT REVIEW/mapping evidence. Later packages reuse the existing suite without adding cases/assets. Seek meaningful RED evidence for any changed functional check where practical; explain unavailable evidence. Existing full-suite server/IO tests start ephemeral-port servers with unique temporary ledger roots; no new package-specific server setup or player-state writes. Final integrated HTTP/browser proof is separate and serial.

**Common stops:** a missing/changed authority, unusable workspace/dependency setup/archive, ownership drift, unrepresentable meaningful content (the DESIGN stress-test clause: report the exact block and required developer decision), an unsupported confidence assignment, unavailable meaningful proof, or a strategy-changing factual conflict stops integration. A needed change outside the exact packet scope requires coordinator-routed replanning; do not weaken validation, add fields, or touch player data to obtain a pass.

### Waves and environment

After fresh review and developer acceptance, an authorized actor commits the tracked DESIGN, replacement ledger, and TODO reconciliation before delivery. Planning itself does none of those Git operations. No ignored-wiki snapshot journal applies.

Every initial package, including singleton registration, runs in its own verified Paseo-managed worktree on a unique scratch branch at the wave's frozen committed HEAD. Supply read-only same-host access to the two named gitignored archives and verify their hashes; worktrees do not copy them or ignored dependencies. Verify usable setup against the existing lockfile without changing dependency ownership/versions; unavailable setup stops dispatch.

Registration packages run serially because they share `content/index.json` and both must preserve append-only order. Waves 3–9 pair one Malakai and one Ostankya outcome: guide directories, selectors/IDs and source catalogues are lord-scoped; no later package writes shared tests, and neither member consumes its sibling's unfinished content. Each lord's reference-family chain serializes its recurring route-file ownership; these edges remain integration-order constraints, not invented strategic dependencies between unrelated reference families.

Wave 10 contains all six complete-route packages after both guides' reference families and VCO contracts have integrated. Their exact scopes are pairwise disjoint route files. Each route's prerequisite chain supplies its names/IDs, sources, conditions and selected references; no route author consumes a sibling's final plan. Preserve established titles, IDs, selections, flags and citations; author only the owned route and its two outgoing continuations. Sibling plans remain partial on every worker's identical frozen base, even if dispatched in a later batch. Apply the route-local proof rule above and report mapping/CONTENT REVIEW without claiming completed whole-guide coverage.

Dispatch wave members up to the selected preset's `max_parallel_subagents` policy. An integer limit is a shared simultaneous-subagent budget across workers, reviewers and other roles; a preset with no additional cap remains subject to provider request concurrency. If batching is needed, later members still start from the same frozen committed base. Tests use read-only corpus inputs, in-memory state or unique temporary directories. Existing full-suite server/IO tests use `PORT=0` and their own temporary ledger roots; inspect that isolation before gates. The lint CLI bundles into a unique temporary directory, and mutating content tests use temporary copies. Worktrees isolate build output, not services/ports. Final integrated runtime proof is serial with `PORT=0` and an explicitly verified isolated `LEDGER_ROOT`.

Freeze integration HEAD until all wave results are stopped, captured, and base/scope/digest-verified. Scratch commits are transport only. Import base-to-result patches serially in package-number order, validate/review as routed, and commit each accepted outcome separately; never merge/cherry-pick scratch history. Every route's integrated prefix retains its Common package gate and honest available-anchor/fallback inspection. After all six route results integrate, the serial coordinator reconciles both complete guides' mapping, selections and shared flags, then checks every directed transition into the actual final Opening before final acceptance. This is post-integration validation, not a new package or worker requirement. A failed member blocks wave advancement or close-out without undoing integrated work. Only the coordinator records progress and discoveries.

## Uncertainty register

### Known

- Read-only archive paths and hashes as recorded in Current-state map. Both archives share the migrated atlases' generator and embedded `guide-data` contract; neither carries a VCO version string. Ostankya's JSON carries `date: "30 September 2026"`; Malakai's source notes record the September 2026 research date (recheck 30 September 2026; guide header updated 25 September 2026). Provenance claims are archival, not installed-stack checks.
- Malakai structures: route-level `skills` (`malakai`, `lord` per-route variants; `engineer`, `gotrek`, `felix`, `runesmith`, `thane` shared), `research` (`route` per-route queue; `opening`, `gunline`, `air`, `economy`, `slayers` shared), `builds` (per-route sets over ten roles), `mechanics` (`ship`, `shiplate`, `adventures`, `deeps`, `grudges` per-route; `forge` shared); guide-local `adventures` (7, task checklists), `shipMilestones` (10), `fortresses` (12), `provinces` (8), `targets` (9), `legacyResearch` (5), structured `objectives` (9/12/11). The resulting flat reference families are approximately: skills 11 entries (5 shared + 6 variants), research 8 (5 shared + 3 queues), builds 19 (5 shared + 14 variants), mechanics 16 (1 shared + 15 variants), armies 15 templates with no explicit `size` field (sizes derive from roster rows and stated context: field/airwing 20, home 12).
- Ostankya structures: `skills` (`mother` per-route variant; `druzhina`, `patriarch`, `hag`, `ataman` shared), `research` (`route` queue; `opening`, `forest`, `expedition`, `later` shared), `builds` (nine roles, shared content), `mechanics` (`route` queue; `hut`, `hexes`, `devotion`, `court`, `access` shared); guide-local `lores` (4, item-shaped), `hexes` (5), `ingredients` (3, six candidate sites each), `targets` (6), `legacyResearch` (13), `techs` (22 named records), `evidence` (7), `date`. The resulting flat reference families are approximately: skills 7 + 4 lores, research 7, builds 9, mechanics 8, armies 15 with explicit 20/12 `size`.
- Ostankya's army character fields are `mother`/`generic`; troops are in `units`. Her home templates are explicitly smaller (12-slot) and may be genuinely generic-led; a Druzhina-General-led home must not be mislabelled as Mother Ostankya. Malakai's armies combine `units` with `malakai`/`generic` characters and variant `genericUnits`; Malakai, Gotrek and Felix stay in his field army; supporting armies use ordinary Dwarf characters.
- The current GitHub classifiers require the existing genuine template; publication classification additionally requires a completed PR boundary. A wholly Planned graph is not publication-ready.

### Assumptions

- Every meaningful block fits existing selected Items, registered prose and source notes. A forcing block disproves this assumption and requires separate approval under the DESIGN stress-test clause, not a schema workaround.
- Locked project dependencies can be made available in isolated worktrees without manifest/lockfile changes; verify before dispatch.
- Archive strategy remains the baseline subject to bounded primary-supported factual corrections. Untouched non-VCO material remains qualified archival guidance.
- The test suites are lord-count-agnostic as evidenced at planning; no test-file adaptation is needed unless execution disproves it.

### Decisions

- One GitHub PR, `feat/malakai-ostankya-migration` → `main`, using merge commits to retain the atomic migration sequence, mirroring the alith-zhao single-PR precedent. No intermediate trunk prerequisite warrants a second PR; the six-route content has no independently mergeable seam that must land early, and every prefix remains trunk-safe and honestly partial.
- Use one package per coherent guide registration, VCO contract, shared reference document, reference family, or complete route. Variant, task-milestone, individual roster, and directed-transition records remain coverage within those outcomes. Registration is manifest-coupled; the other seams bound practical review/recovery rather than count editable records.
- VCO contracts land before strategy families/plans to resolve or honestly flag their requirements. New semantic objective IDs are assigned by those packets and remain stable after integration, never array indexes or later-renumbered counters. Malakai's positional keys (`province:0`, `fortress:3`, `target:moulder`, `city:Altdorf`) become semantic stable IDs (`province-<name>`, `construct-silver-hall`, `fortress-<name>`, `eliminate-<faction>`, `secure-<city>` words) with the named condition as identity; the silver-hall/city/target conditions stay separate rows. CONTENT REVIEW establishes condition accuracy; existing synthetic tests protect ID-keyed ledger behavior.
- Ostankya's four witch lores map into `data/skills.json` (the character-priority item dataset) with route selection per each route's stated default lore and hag build. The `mechanics` dataset remains a viable alternative placement; the chosen consequence is that lores appear on the Armies & skills tab alongside the character queues, and the switch — if a reviewer/developer overrules — is a four-entry dataset relocation before any strategy material consumes the rows. No new dataset kind is added either way.
- Malakai's armies carry no explicit `size`: workers derive the intended per-template size from the roster rows and stated context (20-slot field/airwing, 12-slot home), and CONTENT REVIEW verifies every displayed column sums to the stated size with one legal commander and no unique-character duplication.
- Malakai Route II's twelve structured fortress rows are per-site credit candidates for a stated seven-of-twelve mission threshold; rows render each eligible site with text that keeps credit semantics explicit and never implies twelve mandatory conquests. Ostankya's derived rows stay exactly her stated conditions; neither the Hex list, the ingredient site lists, nor the target list becomes additional mandatory victory conditions.
- Soft ordering follows the alith-zhao shared/skills/research/settlement/mechanics/army/route flow after the early contract checks. Hard dependencies are registration, source/condition availability, valid referenced datasets, and serialized shared ownership.

### Unknowns

None gating the first package. Source availability/current applicable wording, installed versions, live trigger behavior, exact per-block placement, and final visual coverage are delivery facts handled by accepted fallback/stop rules, not facts to invent in planning.

### Risks

- Large data diffs can hide script-only prose, technology details, adventure task lists, or evidence notes. Required CONTENT REVIEW, the coverage map and worker reports establish fidelity; green functional tests do not establish content completeness.
- Malakai's missing `size` key invites roster sums that mismatch the intended force. CONTENT REVIEW must verify every actual template's full columns, intended sizes, legal commander and differing generic core.
- Ostankya Route II's material verification gap (published "search" wording versus the old mission's three-direct-controls-per-group quota, recorded in the atlas's own evidence notes) could tempt a derived-row elaboration. The contract limits rows to the three named settlement objectives with the site lists and uncertainty flagged, not resolved by invention.
- Invisible flat entries and shared-only flags can appear complete on paper. Family selections, effective variants and discoverable uncertainty travel with content.
- Removing transition slots silently hides complete bodies. Intermediate route-top links must not be mistaken for final Opening-anchor proof.
- A hidden corpus-count pin would refute the no-test-adaptation assumption. The registration package reports it before any test edit; a material pin would require reviewed replanning.
- The DESIGN stress-test clause is an invariant: any genuine model limitation (unrepresentable meaningful block) stops the work for separate approval rather than an improvised representation.

## Walking skeleton

Commits 1–2 prove new-guide discovery/context/source libraries through the real manifest/loader/home/desk/sources path with honest partial plans and no fabricated crest. After the VCO contracts (3–4), the family migrations (5–16) make references usable route-by-route. Commits 17–18 make each lord's Route I fully readable through the existing plan/reference/ledger surfaces, including both authored continuations with the supported fallback for unfinished destinations. Commits 19–22 complete Routes II/III and thereby all actual same-lord Opening destinations. No partial prefix is separately advertised as completed coverage.

## Delivery plan

**Commit packages:** 22

### PR `malakai-ostankya-content` — Migrate both atlases into the existing content surfaces

**Status:** Planned
**Depends on:** []
**PR ref:** Not published
**Merge ref:** Not merged
**Branch:** `feat/malakai-ostankya-migration`
**Base branch:** `main`
**Publication provider:** GitHub
**PR template:** .github/pull_request_template.md
**Merge method:** merge
**Required checks:** Local gates `npm run lint:content`, `npm test`, `npx tsc --noEmit`, `npm run build`, and the Final validation HTTP/coverage evidence. No current provider-required check names or CI workflow are evidenced. Verify live checks, review rules and exact-head approval through the publication skill before merge.
**Feature close-out:** Not run
**Provisional PR title:** `feat(content): migrate Malakai and Mother Ostankya atlases`
**Purpose:** Deliver six complete plans and their references as one content-only review/merge boundary with green atomic prefixes. No separate prerequisite needs to land on trunk. Publish/merge only after implementation, final feature review and current close-out; bind merge approval to the verified head and synchronize `main` with ff-only pull. In this tracked wiki, record the final immutable merge ref/Completed reconciliation at the next ordinary documentation update, not a self-referential metadata-only commit. Planning authorizes no Git/publication operation.

#### Package `malakai-registration` — Commit 1: Register Malakai's archival guide context

**Status:** Integrated
**Wave:** 1
**Depends on:** []
**Write scope:** ["content/index.json", "content/malakai/guide.json", "content/malakai/shared.md", "content/malakai/routes/route-1.md", "content/malakai/routes/route-2.md", "content/malakai/routes/route-3.md", "content/malakai/data/armies.json", "content/malakai/data/skills.json", "content/malakai/data/research.json", "content/malakai/data/buildings.json", "content/malakai/data/mechanics.json", "content/malakai/data/vco.json", "content/malakai/data/sources.json"]
**Provisional commit:** `feat(content): register Malakai's archival guide context`
**Work:** A discoverable, valid guide entry and source library with correct context and explicit incomplete plans.
**Atomicity:** Manifest registration, every named companion and boot/corpus protection are inseparable under missing/orphan-file lint. Approximately 120–180 counted manifest/frontmatter lines; prose, source data and tests excluded. A detached file subset is not a usable guide entry.
**Out of scope:** Full shared/reference/route content, primary checks, objective rows and Ostankya registration.
**Implementation packet:** Append Malakai after Zhao Ming in `content/index.json`. Create `guide.json` with stable slug `malakai` (`lord`/`faction` per the archive's claims — Dwarfen "Grungni Expedition" engineer identity), `environment` as the product setup (Immortal Empires · VCO · Normal / Normal · Smart Autoresolve · All WH3 DLC · WH1/WH2 free content only) plus the northern-theatre start context in the archive's own wording, and honest version provenance: `patch` `unverified`, `vco` explicitly `unverified` with no invented version string (the archive carries none), `checked` recording only the archive's September 2026 research date as scoped provenance — never a fresh whole-guide verification. Do not create a crest (no suitable archive artwork; the existing reduced header applies). Create `/shared.md` with the archive's common opening/smart/manual/spending guidance folded from the shared blocks and renderer prose. Populate all 44 qualified source records (IDs/titles/URLs/order/archival annotations) in `data/sources.json`. Create seven legal empty datasets and three truthful partial route documents with archive-derived thematic route names (The Northern Reconquest, The Seven-Fortress Expedition, The Empire-Relief Expedition), `vcoTitle: null` (title naming is check evidence, not installed proof), `objective`/`reward` claims in the existing unresearched state, empty `panelOrder` selections, partial Opening sections with honest partial notices and discoverable caveats, and genuine `gaps` declarations for the unwritten required sections plus the two transition-slot titles. Do not import any saved state.
**Files and responsibilities:** Index/manifest register and name all new files; shared context/source catalogue identify the archive; routes/datasets supply honest empty states. No test files are owned: the current suites are lord-count-agnostic (by-slug Elspeth assertions and data-driven home/search/citation checks, verified at planning); the corpus-wide selected-card citation check has no selections yet at registration and activates automatically as later packages fill `panelOrder`.
**Tests and proof:** Existing loader/home/reference suites protect registration and empty-state behavior. CONTENT REVIEW checks Malakai's complete named companions, qualified bibliography/context/provenance, absent-crest honesty and truthful partial pages.
**Validation:** First `node --test test/elspeth-skeleton.test.ts test/views.test.ts test/components.test.ts`; then Common package gate. No new test assets.
**Stop conditions:** Common stops; an evidenced corpus pin found during execution must be reported before any test edit (a bounded adaptation would be a reviewed scope change, not an implicit one); unavailable named asset/source evidence is not permission to fabricate it.
**Review mandate:** Manifest-complete entry with no crest, correct partial context, honest unverified version provenance without an invented VCO string, append-only ordering, complete qualified bibliography and loyal preservation of the Elspeth/Alith/Zhao protection.

#### Package `mother-ostankya-registration` — Commit 2: Register Mother Ostankya's archival guide context

**Status:** Integrated
**Wave:** 2
**Depends on:** ["malakai-registration"]
**Write scope:** ["content/index.json", "content/mother-ostankya/guide.json", "content/mother-ostankya/shared.md", "content/mother-ostankya/routes/route-1.md", "content/mother-ostankya/routes/route-2.md", "content/mother-ostankya/routes/route-3.md", "content/mother-ostankya/data/armies.json", "content/mother-ostankya/data/skills.json", "content/mother-ostankya/data/research.json", "content/mother-ostankya/data/buildings.json", "content/mother-ostankya/data/mechanics.json", "content/mother-ostankya/data/vco.json", "content/mother-ostankya/data/sources.json"]
**Provisional commit:** `feat(content): register Mother Ostankya's archival guide context`
**Work:** Add Mother Ostankya's valid archival entry and source library through the same existing path, recording the faction the archive claims.
**Atomicity:** Registration and all named companions form one loader-complete entry with its boot proof; approximately 120–180 counted manifest/frontmatter lines, excluding prose/data/tests. An unregistered fragment fails filesystem lint.
**Out of scope:** Full plans/references/checks, edits to prior guides or their tests, and CONCEPT.md reconciliation.
**Implementation packet:** Append Mother Ostankya after Malakai. Create the corresponding manifest/crest-less entry: stable slug `mother-ostankya`, `lord`/`faction` from the archive's claims (witch/Wild-Hunt Kislev campaign with Devotion, Huts, Ataman, Druzhina; IE Kislev section per its source notes), `environment` product setup, version provenance with the JSON `date` of 30 September 2026 as scoped archival provenance and no invented VCO version string, and the archive's start context (default Bleak Hold Fortress / Volksgrad start in Naggaroth with the optional Plesk homecoming, including the archive's note that CA describes Plesk as the harder start). No crest. Route thematic names The Malediction of Ruin / Toil & Trouble / The New Frontier with `vcoTitle: null`; all 29 qualified sources; seven empty datasets; three truthful partial routes with genuine gaps and partial Openings carrying the start-context caveats. Do not silently repeat CONCEPT.md's Grand Cathay claim; the contradiction is DESIGN-flagged for close-out documentation reconciliation.
**Files and responsibilities:** Index appends Mother Ostankya; Ostankya files form its named content tree. Commit 1's corpus reconciliation already supports additional lords; this package owns no tests.
**Tests and proof:** Existing loader/schema and data-driven home/reference proof exercise the appended guide without a fixed corpus count. CONTENT REVIEW checks Ostankya's named companions, qualified identity/context/source library and honest partial pages; previous entries remain unchanged.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; a residual shared-test ownership need must be reported before edits.
**Review mandate:** Manifest completeness, honest empty states, archive-claimed faction identity without CONCEPT.md duplication, qualified provenance, preserved Elspeth/Alith/Zhao/Malakai and no player-state import.

#### Package `malakai-vco-contract` — Commit 3: Establish Malakai's sourced victory contract

**Status:** Integrated
**Wave:** 3
**Depends on:** ["malakai-registration"]
**Write scope:** ["content/malakai/data/vco.json", "content/malakai/data/sources.json", "content/malakai/routes/route-1.md", "content/malakai/routes/route-2.md", "content/malakai/routes/route-3.md"]
**Provisional commit:** `feat(content): establish Malakai's sourced victory contract`
**Work:** Check three VCO title/objective/reward sets and expose consistent identity/ledger conditions with actionable limits.
**Atomicity:** One guide's victory catalogue, citing evidence and identity claims must agree before strategy consumes them; their condition/flag/ledger proof is one migration contract. Approximately 30–60 counted frontmatter lines; rows, prose, source data and tests excluded. Per-condition records are coverage, not separate outcomes.
**Out of scope:** Whole-guide revalidation and complete operational routes.
**Implementation packet:** Perform bounded primary checks of the six sets overall (this lord's three) and record actual dates/versions/assertions/limitations in scoped source notes. Verified official titles occupy `vcoTitle`, otherwise retain null with archive attribution. Map the structured `objectives` one-to-one into semantic stable IDs: eight `province-<name>` rows plus `construct-silver-hall` (tier-IV Kraka Drak, not merely queued) for Route I; twelve `fortress-<name>` per-site credit rows for Route II with the seven-of-twelve threshold and credit-vs-ownership limits explicit in row text and the route objective claim; nine `eliminate-<faction>` rows plus `secure-altdorf` and `secure-nuln` for Route III (direct or qualifying diplomatic control). The named condition is the identity; silver-hall, city and target conditions stay separate rows. Preserve the script victory insight (qualifying actions versus ownership, diplomatic-credit versus direct control), historical trigger limits, and reward scope; put detailed route advice in later plans with interim caveats visible where needed.
**Files and responsibilities:** VCO file owns ordered condition rows; sources owns new scoped checks/discrepancies; three route documents own aligned identity/caveats. No test files are owned.
**Tests and proof:** Existing fixture/synthetic tests protect typed objective display, confidence/citation handling and ID-keyed fresh/independent ledger state. CONTENT REVIEW verifies actual titles/rewards/conditions, semantic IDs and evidence, including Route II credit-versus-conquest and Route III control semantics; do not hardcode Malakai condition sets into tests.
**Validation:** Common package gate; no new test cases/assets or live game proof.
**Stop conditions:** Common stops; unavailable primary text uses DESIGN's archival fallback unless it prevents a usable plan. A strategy-changing quota/trigger/control conflict stops.
**Review mandate:** Published wording versus live behavior, condition/advice separation, honest title/reward scope, archival-date preservation, no twelve-mandatory-fortresses claim and actionable flags.

#### Package `mother-ostankya-vco-contract` — Commit 4: Establish Mother Ostankya's sourced victory contract

**Status:** Integrated
**Wave:** 3
**Depends on:** ["mother-ostankya-registration"]
**Write scope:** ["content/mother-ostankya/data/vco.json", "content/mother-ostankya/data/sources.json", "content/mother-ostankya/routes/route-1.md", "content/mother-ostankya/routes/route-2.md", "content/mother-ostankya/routes/route-3.md"]
**Provisional commit:** `feat(content): establish Mother Ostankya's sourced victory contract`
**Work:** Check the three title/objective/reward sets and derive the exact stated-condition ledger rows.
**Atomicity:** Victory catalogue, source scope and identity must agree as one guide contract with condition/flag/ledger proof. Approximately 30–60 counted frontmatter lines; reference data/prose/tests excluded. Splitting individual conditions does not create a useful migration seam.
**Out of scope:** Whole-guide research and full operational plans.
**Implementation packet:** Apply Commit 3's bounded-check policy to Ostankya. Derive rows only from stated conditions: Route I five `hex-<id>` rows (Purification Chant, Coven's Cursemark, Jinxed Land, Bewitching Lure, Recreant Spirit) plus `complete-malediction-ritual`; Route II three named settlement-objective rows (Itxi Grubs, Jungle Lotus Leaves, Coatl Feathers) with their candidate-site lists kept as clearly non-mandatory search guidance; Route III `occupy-32-settlements` plus six `eliminate-<faction>` rows (Cult of Pleasure, Exiles of Nehek, Slaughterhorn Tribe, The Drowned, Naggarond, Legion of the Gorequeen). The derivation must not add, merge, or invent conditions; the Hex and target lists do not become eighteen mandatory conquests, and the 32-settlement counter counts qualifying actions at different locations rather than 32 simultaneous settlements. Preserve the atlas's own Route II verification gap (published "search" wording versus the old mission's three-direct-controls-per-group quota) as an actionable flag, not a silently resolved rule. Verified titles occupy `vcoTitle`, otherwise null with archive attribution.
**Files and responsibilities:** VCO owns derived condition rows; sources owns bounded evidence; routes own aligned identity/caveats. No test files are owned.
**Tests and proof:** Existing objective/confidence and synthetic ledger cases protect supplied-row rendering, source resolution, ID-keyed progress and fresh defaults. CONTENT REVIEW verifies the derived rows match exactly the stated conditions, title/reward scope, semantic IDs and evidence; no Ostankya condition snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops and the accepted source-unavailable fallback; a materially changed campaign premise requires approval.
**Review mandate:** No added/merged/invented condition, no Hex/search/ingredient list elevated to mandatory conquest, honest title/reward scope and actionable Route II/ritual-trigger flags.

#### Package `malakai-shared-fundamentals` — Commit 5: Migrate Malakai's shared campaign fundamentals

**Status:** Integrated
**Wave:** 4
**Depends on:** ["malakai-vco-contract"]
**Write scope:** ["content/malakai/shared.md", "content/malakai/routes/route-1.md"]
**Provisional commit:** `feat(content): migrate Malakai's shared fundamentals`
**Work:** Complete the common reference document: four archive blocks and related non-data doctrine, access, equipment, budgets and routine.
**Atomicity:** These related fundamentals form one common campaign reference with rendered-document/flag proof; topic paragraphs are coverage, not separate product changes. Approximately 0 counted implementation lines; Markdown/tests excluded.
**Out of scope:** Character/dataset families, full routes and interactive ship/ledger machinery.
**Implementation packet:** Preserve Malakai's `opening`/`smart`/`manual`/`spending` blocks and related script army/economy/budget/notes guidance (the northern start, Smart Autoresolve evidence limits, manual doctrine, funding/recovery routine and reserves). Adapt obsolete controls to current-app advice. Surface consequential shared uncertainty in Route I's explicitly partial Opening with discoverable flag callouts and resolving sources.
**Files and responsibilities:** Shared owns fundamentals and archive scope; Route I owns required discoverable companion flags. No test files are owned.
**Tests and proof:** Existing desk/shared rendering and fixture-based flagged selection protect supplied content and confidence behavior. CONTENT REVIEW maps all common/script-only guidance, checks rendered access/equipment/budget reasoning and inspects important Route I flags and shared citations; no topic/prose snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; excluded machinery containing unassigned unique guidance must be mapped first.
**Review mandate:** No lost equipment/access/budget reasoning, false benchmark claim, duplicate strategy rewrite or hidden shared-only flag.

#### Package `mother-ostankya-shared-fundamentals` — Commit 6: Migrate Mother Ostankya's shared campaign fundamentals

**Status:** Integrated
**Wave:** 4
**Depends on:** ["mother-ostankya-vco-contract"]
**Write scope:** ["content/mother-ostankya/shared.md", "content/mother-ostankya/routes/route-1.md"]
**Provisional commit:** `feat(content): migrate Mother Ostankya's shared fundamentals`
**Work:** Complete six shared blocks and related common start, spell-primer, budget, battle, access and routine guidance.
**Atomicity:** One common campaign document with rendered-topic/flag proof; fragmenting paragraphs adds recovery noise without a new product outcome. Approximately 0 counted implementation lines.
**Out of scope:** Recruitment/mechanic specifics, complete routes and ritual calculators.
**Implementation packet:** Preserve the archive's `opening`/`smart`/`manual`/`spending`/`start`/`spellPrimer` blocks and unique script explanations: the Bleak Hold Fortress / Volksgrad versus optional Plesk starting choice, the Hag spell primer's practical doctrine, Devotion/funding basics, and untested autoresolve limits. Keep the start-context distinctions (including CA's harder-start note for Plesk) without assuming another lord's exclusive campaign subsystem. Put important common uncertainty in Route I's partial Opening with discoverable flags.
**Files and responsibilities:** Shared owns common guidance; Route I owns discoverable caveats. No test files are owned.
**Tests and proof:** Existing desk/shared and flagged-selector cases protect supplied prose/confidence rendering. CONTENT REVIEW maps the full common guidance and script-only explanations, inspects shared citations and visible companion flags, and verifies truthful limits; no Ostankya topic/prose constants.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unmapped unique script guidance.
**Review mandate:** Complete common guidance, source scope and appropriate flag visibility; no copy of another Kislev lord's systems in place of the archive's own claims.

#### Package `malakai-skills` — Commit 7: Migrate Malakai's character-priority reference

**Status:** Integrated
**Wave:** 5
**Depends on:** ["malakai-shared-fundamentals"]
**Write scope:** ["content/malakai/data/skills.json", "content/malakai/routes/route-1.md", "content/malakai/routes/route-2.md", "content/malakai/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Malakai's character-priority reference`
**Work:** Complete and select the eleven-entry skills family.
**Atomicity:** The commander/support/companion/engineer reference is one related build family with selection/render proof. Individual hero queues are inventory, not separate migration outcomes. Approximately 10–25 counted selection/frontmatter lines; JSON reference data/tests excluded.
**Out of scope:** Other reference groups and route-specific `use` prose owned by route packages.
**Implementation packet:** Map the seven archive build keys to flat Items: five shared entries (`engineer`, `gotrek`, `felix`, `runesmith`, `thane`) and six route-owned variants (`malakai-route-1/2/3`, `lord-route-1/2/3`), each carrying full steps/details/gates/sources. Select per route in archive order (the route's `skills` dict and defaults). Preserve role/effect/automatic-unlock cautions, the Malakai/Gotrek/Felix companionship guidance, and embedded-versus-detached distinctions under truthful confidence; never let a shared entry's advice be overwritten by one route's queue.
**Files and responsibilities:** Skills holds builds; three route files expose the family. No test files are owned.
**Tests and proof:** Existing synthetic selection/order and fixture Item steps/details/source cases protect functional panels. CONTENT REVIEW accounts for every build, full queue/role/gate advice and actual route selections/order; no build count, character priority or queue-slot assertions.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unsupported access/gate facts need honest qualification or approved correction.
**Review mandate:** Full character coverage, independent route variants, no borrowed unique-lord effects and no invented spending gates.

#### Package `mother-ostankya-skills` — Commit 8: Migrate Mother Ostankya's character and witch-lore reference

**Status:** Planned
**Wave:** 5
**Depends on:** ["mother-ostankya-shared-fundamentals"]
**Write scope:** ["content/mother-ostankya/data/skills.json", "content/mother-ostankya/routes/route-1.md", "content/mother-ostankya/routes/route-2.md", "content/mother-ostankya/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Ostankya's characters and witch lores`
**Work:** Complete the skills family including three Mother variants and the four witch-lore spell paths.
**Atomicity:** Common builds, the differing Mother queues and the lores jointly define the route-selected character/spell reference; variants travel with selection/non-overwrite proof. Approximately 10–25 counted selection/frontmatter lines; data/tests excluded. A lore or variant is not a separate feature.
**Out of scope:** Other reference families and full route-use prose.
**Implementation packet:** Migrate the five archive build keys to seven flat Items — `mother-route-1/2/3` effective variants plus shared `druzhina`, `patriarch`, `hag`, `ataman` — and map the four witch lores (`shadows`, `hags`, `death`, `beasts`) into the same dataset as item-shaped spell-path queues with route selection following each route's stated default lore and hag build (recorded decision; no new dataset kind). Preserve branch alternatives, spell-availability gates, and personal-versus-army-versus-support distinctions. Do not count a hidden redundant base entry as coverage; keep `units`-level access and caster-scope cautions qualified.
**Files and responsibilities:** Skills owns effective builds and lore queues; routes own independent selections. No test files are owned.
**Tests and proof:** Existing lord/route-scoped selection and supplied Item rendering protect variant binding and visible steps/details. CONTENT REVIEW checks every effective Mother override and lore against its archive, preserved base advice and full supporting builds; no exact queue/order or character-priority snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; conflicting base/override content requiring strategic reinterpretation.
**Review mandate:** Independent effective variants, preserved common advice, lore placement that does not fake a new dataset, and school/personal effects kept distinct.

#### Package `malakai-research` — Commit 9: Migrate Malakai's research reference

**Status:** Planned
**Wave:** 6
**Depends on:** ["malakai-skills"]
**Write scope:** ["content/malakai/data/research.json", "content/malakai/routes/route-1.md", "content/malakai/routes/route-2.md", "content/malakai/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Malakai's research reference`
**Work:** Complete the five shared branch entries, three route queues, and meaningful guidance from the five legacy-research tech paths.
**Atomicity:** Queues, prerequisites/why-notes and effective route-queue selection form one usable research family and its proof. Approximately 10–25 counted selection/frontmatter lines; data/tests excluded. Tech paths and an already-known per-route queue are not additional product seams.
**Out of scope:** Other datasets and checkbox/tracker linkage.
**Implementation packet:** Create eight flat Items — shared `opening`, `gunline`, `air`, `economy`, `slayers` plus `route-route-1/2/3` effective queues — and fold every meaningful name/prerequisite/why-note from the `legacyResearch` tech paths (`opening`, `gunline`, `air`, `economy`, `expedition`) into selected steps/details, not only existing queue titles. Preserve the route-level `research.route` ordering (the archive's `route` queue per route) and any differing per-route selections. Exclude tracker indexes only after verifying their guidance is represented.
**Files and responsibilities:** Research holds queues/tech folds; routes own selections. No test files are owned.
**Tests and proof:** Existing synthetic panel selection and fixture Item rendering protect supplied order/gates/details without editorial values. CONTENT REVIEW maps every technology path's unique guidance and checks actual route selections/order; no technology names/order or queue-slot assertions.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unmapped unique technology advice or a forcing unsupported shape.
**Review mandate:** No missing tech guidance, empty optional fields, hidden route-queue overwrite or borrowed prerequisite.

#### Package `mother-ostankya-research` — Commit 10: Migrate Mother Ostankya's research reference

**Status:** Planned
**Wave:** 6
**Depends on:** ["mother-ostankya-skills"]
**Write scope:** ["content/mother-ostankya/data/research.json", "content/mother-ostankya/routes/route-1.md", "content/mother-ostankya/routes/route-2.md", "content/mother-ostankya/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Mother Ostankya's research reference`
**Work:** Complete the shared branch entries, three route queues, and all meaningful guidance from the thirteen legacy-research paths and twenty-two named techs.
**Atomicity:** Queues, tech context and route-specific ordering are one research decision family with selection/non-overwrite proof; approximately 10–25 counted selection/frontmatter lines. Group/record subdivisions would fragment that migration reference.
**Out of scope:** Other groups and interactive tick indexes.
**Implementation packet:** Create seven flat Items — shared `opening`, `forest`, `expedition`, `later` plus `route-route-1/2/3` — and fold the thirteen `legacyResearch` tech paths and the twenty-two named `techs` records' prerequisites/why-notes into accessible named steps/details (ice/pathfinder/scavenger/siege/cold/collars/charms/undergrowth/shadows/glacial/dogma/convalescence/hooked and the `techs` lookup). Keep Route-I-vs-II/III ordering distinctions through the route queues and effect scopes honest; do not modernize old terminology silently — preserve the atlas's own "older terminology" caveats.
**Files and responsibilities:** Research owns effective queues and folds; routes expose them. No test files are owned.
**Tests and proof:** Existing synthetic selection/order and supplied Item steps/gates/details protect site behavior. CONTENT REVIEW maps every tech path/record, checks the effective queues and inspects scopes/cautions; no technology names/order, investment constants or queue snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; a unique tech record cannot be excluded as mere machinery.
**Review mandate:** No overwritten common entry, obsolete-faction chore retained as present, or conflated effect scopes.

#### Package `malakai-settlements` — Commit 11: Migrate Malakai's settlement-development reference

**Status:** Planned
**Wave:** 7
**Depends on:** ["malakai-research"]
**Write scope:** ["content/malakai/data/buildings.json", "content/malakai/routes/route-1.md", "content/malakai/routes/route-2.md", "content/malakai/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Malakai's settlement development`
**Work:** Complete the per-route building roles (approximately nineteen flat entries) and their intended route subsets.
**Atomicity:** Roles/gates and route subsets form one usable development reference with selected-page proof; approximately 10–25 counted selection/frontmatter lines. Individual construction queues are coverage within this family.
**Out of scope:** Other references and ship/state machinery.
**Implementation packet:** Map the archive `builds` to `buildings`: common entries (`frontier`, `hub`, `income`, `resource`, `deep` routing where identical, plus single-route roles such as `reclaim`/`recruit`/`staging`/`depot`) and effective per-route variants (`hub-route-X`, `income-route-X`, `resource-route-X`, `deep-route-X`, `outpost-route-2/3`) with complete queues, slot cautions and tier gates. Select per route in `buildOrder` order. Preserve Kraka Drak's capital/landmark role, the ship-versus-settlement growth separation, frontier/recovery staging purpose, and recruitment-chain cautions.
**Files and responsibilities:** Buildings owns roles; route selections expose the intended subsets/order. No test files are owned.
**Tests and proof:** Existing selected-panel and supplied Item cases protect settlement binding and rendering. CONTENT REVIEW maps every role, verifies actual route subsets/order and complete construction/readiness gates, and inspects visible homes; no role counts, construction priorities or landmark constants.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; route ID/role drift or unsupported construction premise.
**Review mandate:** No universal build recipe, hidden role, assumed treaty construction right or borrowed hold system.

#### Package `mother-ostankya-settlements` — Commit 12: Migrate Mother Ostankya's settlement-development reference

**Status:** Planned
**Wave:** 7
**Depends on:** ["mother-ostankya-research"]
**Write scope:** ["content/mother-ostankya/data/buildings.json", "content/mother-ostankya/routes/route-1.md", "content/mother-ostankya/routes/route-2.md", "content/mother-ostankya/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Mother Ostankya's settlement development`
**Work:** Complete the nine shared building roles and their per-route subsets.
**Atomicity:** Development roles, their recruitment gates and differing route subsets form one route-selected construction reference with subset/gate proof; approximately 10–25 counted selection lines. Splitting individual roles would leave the development advice incomplete.
**Out of scope:** Full army rosters, unrelated mechanics and ritual calculators.
**Implementation packet:** Migrate the nine archive `builds` roles to flat `buildings` entries (`hub`, `hut`, `income`, `recovery`, `resource`, `frontier`, `temporary`, plus the route-2 `field` and route-3 `reclaim` where applicable) with complete queues and slot/tier cautions; select per route in `buildOrder` order per its subset. Preserve the Hut's role in the witch economy, spirit-recruitment tier gates, recovery/frontier staging, scarce-slot cautions, and the route distinctions between the expedition and frontier subsets. Do not assert disputed income as confirmed.
**Files and responsibilities:** Buildings owns roles; three routes own subsets. No test files are owned.
**Tests and proof:** Existing scoped selection and supplied Item cases protect settlement pages. CONTENT REVIEW maps all roles, checks each route subset and preserved guidance, and inspects actual gates/substitutions; no capital queues, role counts or landmark snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; new access evidence changing the strategy or meaningful unrepresented recruitment guidance.
**Review mandate:** No hidden redundant base role, conflated landmarks, universal simultaneous-chain demand or overwritten variant.

#### Package `malakai-mechanics` — Commit 13: Migrate Malakai's faction-workshop reference

**Status:** Planned
**Wave:** 8
**Depends on:** ["malakai-settlements"]
**Write scope:** ["content/malakai/data/mechanics.json", "content/malakai/routes/route-1.md", "content/malakai/routes/route-2.md", "content/malakai/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Malakai's faction workshop`
**Work:** Complete the workshop family (approximately sixteen flat entries) with adventure task checklists and ship-milestone folds.
**Atomicity:** The lord's workshop references, adventure task guidance and ship milestones are one mechanic family with selected-workshop/flag proof; approximately 10–25 counted selection lines. Excluding controls must not separate their essential advice from the mechanic.
**Out of scope:** Calculators, saved ledger/checkbox state and new mechanics.
**Implementation packet:** Preserve `ship`, `shiplate`, `adventures`, `deeps`, `grudges` per-route variants and the shared `forge` entry. Fold all seven adventure records' task checklists into the owning `adventures-route-X` entries' steps/details (tasks are preparation guidance, never extra VCO objectives — keep the archive's own warning), all ten ship-milestone triples (`beer`, `hull2`, `cargo`, `engine`, `smelters`, `inventor`, `storage`, `hull5`, `propellers`, `assembly`) into the ship/shiplate guidance, and the Deeps/Grudges operational cautions with their route ordering. Select all six in each route's archive order; keep routable credit and engine/range limits distinct.
**Files and responsibilities:** Mechanics holds the workshop and folds; routes expose it. No test files are owned.
**Tests and proof:** Existing workshop/Item rendering and flagged-selector cases protect supplied advice and confidence behavior. CONTENT REVIEW maps every mechanic, task/milestone fold and script-only caution, checks actual selections/source accuracy and inspects consequential flags; no mechanic counts, task-credit rules or prose snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; an excluded interaction contains unrepresented meaningful instructions.
**Review mandate:** No invented task/milestone credit, route-variant overwrite, borrowed subsystem or stranded script prose.

#### Package `mother-ostankya-mechanics` — Commit 14: Migrate Mother Ostankya's faction-workshop reference

**Status:** Planned
**Wave:** 8
**Depends on:** ["mother-ostankya-settlements"]
**Write scope:** ["content/mother-ostankya/data/mechanics.json", "content/mother-ostankya/routes/route-1.md", "content/mother-ostankya/routes/route-2.md", "content/mother-ostankya/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Mother Ostankya's faction workshop`
**Work:** Complete the workshop family (eight flat entries) with the five campaign-Hex records folded in.
**Atomicity:** Workshop entries and related explanatory folds are one selected mechanic family with rendered/flag proof; approximately 10–25 counted selection lines. Numeric controls are excluded, not reasons to fragment the reference.
**Out of scope:** Ritual calculators, timers, saved Devotion/Hex state and other lords' systems.
**Implementation packet:** Preserve the `route` per-route schedule queues and the shared `hut`, `hexes`, `devotion`, `court`, `access` systems. Fold all five Hex records (Purification Chant, Coven's Cursemark, Jinxed Land, Bewitching Lure, Recreant Spirit) with their role/use/caution guidance into the `hexes` entry's steps/details; fold the Hut/Essence economy, Devotion crediting, Court & Orthodoxy administration (modern terms per the archive, with older-terminology caveats) and recruitment-access notes into their owning entries. Select the archive's six mechanics per route in order with each route's schedule. Qualify evidence and expose consequential uncertainty (Hex durations, Devotion credit, ritual trigger) in callouts/flags.
**Files and responsibilities:** Mechanics owns workshop guidance/folds; routes expose the family. No test files are owned.
**Tests and proof:** Existing workshop/Item and confidence/flag cases protect supplied-content behavior. CONTENT REVIEW maps all mechanics, Hex records and schedule cautions, checks practical factual limits and inspects actual flags/citations; no Hex count, mechanic rules or prose snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unrepresentable guidance or a correction changing Devotion/Hex strategy.
**Review mandate:** No lost Hex/ritual cautions, fictional timer/effect, obsolete faction balance or borrowed Cult/Orthodoxy-for-another-lord system.

#### Package `malakai-armies` — Commit 15: Migrate Malakai's complete army reference

**Status:** Planned
**Wave:** 9
**Depends on:** ["malakai-mechanics"]
**Write scope:** ["content/malakai/data/armies.json", "content/malakai/routes/route-1.md", "content/malakai/routes/route-2.md", "content/malakai/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Malakai's complete army reference`
**Work:** Normalize and expose all fifteen templates as a complete progression/support reference with derived sizes.
**Atomicity:** One army family shares the full-column normalization and readiness/doctrine contract with roster/render proof; individual templates/variants are coverage rather than separate product outcomes. Approximately 10–25 counted selection lines; the substantial reference JSON/tests are excluded from counted code but remain a real review surface.
**Out of scope:** App roster logic, strategy redesign and simultaneous Legendary Lord clones.
**Implementation packet:** Use canonical route keys and the five archive template IDs per route (early/mid/late/airwing/home). Each displayed legendary column combines the actual `malakai` characters with the troop core; generic combines `generic` characters with `genericUnits` when present, otherwise `units`. The archive carries no `size` key: derive the intended per-template size from the roster rows and stated context — field and airwing 20-slot, home 12-slot hold guard — and verify every non-empty column sums to it with one legal commander. Keep Malakai, Gotrek and Felix in his field army; supporting armies use ordinary Dwarf characters without duplicating unique characters. Preserve the airwing's explicitly optional purpose (retain ground troops, protect flyers from anti-air), the home guard's budget-tool purpose, recruitment gates, substitutions, economic readiness, manual plans and Smart Autoresolve evidence limits. Explain templates as alternatives/progression.
**Files and responsibilities:** Armies holds normalized templates; routes select five each in order. No test files are owned.
**Tests and proof:** Existing synthetic/fixture army tests protect supplied legendary/generic rows, full-column rendering and explicit absence, not game army legality. CONTENT REVIEW reconciles all fifteen actual templates against the archive: full troops/characters, differing generic cores, derived sizes/legal commanders, readiness/doctrine and visible selections. No roster-count/commander/unit snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; no legal archive-supported roster/fallback or a forcing size mismatch.
**Review mandate:** Full columns summing to the intended sizes, actual generic troop substitutions, optional airwing purpose, home scale honesty and no character-only copying.

#### Package `mother-ostankya-armies` — Commit 16: Migrate Mother Ostankya's complete army reference

**Status:** Planned
**Wave:** 9
**Depends on:** ["mother-ostankya-mechanics"]
**Write scope:** ["content/mother-ostankya/data/armies.json", "content/mother-ostankya/routes/route-1.md", "content/mother-ostankya/routes/route-2.md", "content/mother-ostankya/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Mother Ostankya's complete army reference`
**Work:** Normalize and expose fifteen field/specialist/home templates with complete applicable columns and the archive's explicit sizes.
**Atomicity:** One progression/support family and normalization contract with full-roster/render proof; per-company or per-variant commits add inventory noise. Approximately 10–25 counted selection lines; large reference data/tests excluded, not ignored in review.
**Out of scope:** Ritual recruitment UI, new unit availability logic and app changes.
**Implementation packet:** Normalize the actual `mother`/generic characters plus applicable troop cores; preserve the archive's explicit `size` (20-slot field/special, 12-slot home). Genuinely generic-led home forces carry explicit absent legendary columns instead of falsely labelling a Druzhina General as Mother Ostankya. Preserve gates/substitutions/economic readiness/notes/manual doctrine, the "each lord and hero uses a slot" caution, the supporting commander's non-inheritance of Mother's personal effects, and the waking-coven progression identity. Explain templates as alternatives/progression.
**Files and responsibilities:** Armies owns full variants; routes expose five each. No test files are owned.
**Tests and proof:** Existing fixture army cases protect supplied columns/rows and explicit absent-column rendering. CONTENT REVIEW reconciles all fifteen templates, verifies complete troops/characters, intended 20/12 sizes/legal commanders and true generic-only homes, and inspects gates/doctrine/visible variants. No roster-count/commander or home-force snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unsupported legal-force/access/size premise.
**Review mandate:** No missing troop core, padded home force, personal effect borrowed by a General or pre-victory reward budget.

#### Package `malakai-route-one` — Commit 17: Complete Malakai's reconquest route

**Status:** Planned
**Wave:** 10
**Depends on:** ["malakai-armies"]
**Write scope:** ["content/malakai/routes/route-1.md"]
**Provisional commit:** `feat(content): complete Malakai's reconquest route`
**Work:** Full Route I plan, policies, summaries and both continuations using integrated references/conditions.
**Atomicity:** Chronology, reference-use advice, retention policies and continuations jointly define one usable route with PlanView/link proof. Splitting phases or transition paragraphs fragments that migration outcome. Approximately 15–40 counted frontmatter/phase lines; Markdown/tests excluded.
**Out of scope:** Other route bodies, dataset changes and new checks outside the established contract.
**Implementation packet:** Apply Authorship rules to all eight sections and write the five summary pairs. Preserve all four archive phases' actions/aims/readiness guidance, the eight named province control conditions and Silver Hall construction, province growth/income sequence, voluntary Kraka Drak tier-IV gate, territory policy and diplomacy for the northern theatre. Keep checked claims/flags, both transition slots with present bodies, and remove only this route's partial notices/genuine operational gaps. Preserve established identity/selections. Inspect outgoing links to available frozen-base Openings or the established route-top fallback, not a sibling's final plan.
**Files and responsibilities:** Route file owns complete strategy/policies/continuations. No test files are owned.
**Tests and proof:** Existing plan/section/phase and same-lord transition cases protect supplied content, real anchors and fallback behavior. Route-local CONTENT REVIEW maps every action/aim/checkpoint/use note/target/summary/continuation, checks strategy and citations, and inspects this route's actual sections/links/gaps; no full-phase, target or route-prose assertions. Partial destinations remain explicitly partial; aggregate reconciliation and final destination proof belong to serial post-integration validation.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; source-supported requirements contradict the archive strategy materially.
**Review mandate:** End-to-end geography/economy/readiness coherence and full route coverage, not merely eight headings/counts.

#### Package `mother-ostankya-route-one` — Commit 18: Complete Mother Ostankya's ritual route

**Status:** Planned
**Wave:** 10
**Depends on:** ["mother-ostankya-armies"]
**Write scope:** ["content/mother-ostankya/routes/route-1.md"]
**Provisional commit:** `feat(content): complete Mother Ostankya's ritual route`
**Work:** Full ritual campaign plan, policies, summaries and continuations.
**Atomicity:** Hex questing, witchcraft progression, territory-as-means posture and continuation reuse form one coherent route contract with plan/link proof; approximately 15–40 counted frontmatter lines. Paragraph/phase splits add no sensible migration seam.
**Out of scope:** Other routes, dataset changes and ritual calculators.
**Implementation packet:** Complete eight sections and five summaries; preserve all phase/use guidance: the five Hex quests (purification, cursemark, jinxed-land, lure, recreant) as stated conditions, the Malediction of Ruin final ritual with its trigger caveats (the atlas's "map cast tracked separately" note), Incantation/Essence progression, the economic heartland and staging-territory policy, and the diplomacy posture around Bleak Hold Fortress/Volksgrad or the optional Plesk start. Territory is a means, not a fixed province ceiling. Retain contract/shared flags, established identity/selections and both transition slots; remove only this route's partial notices/genuine operational gaps; inspect available frozen-base destination Openings or route-top fallback without requiring sibling final plans.
**Files and responsibilities:** Route owns full strategy/policies/continuations. No test files are owned.
**Tests and proof:** Existing plan/panel/phase and transition cases protect supplied selections, content rendering and same-lord anchor/fallback behavior. Route-local CONTENT REVIEW maps every phase/use note/policy/summary/continuation, checks actual ritual strategy/evidence and inspects this route's gaps/links; no ritual-condition, income, full-phase or prose snapshots. Report partial destination state honestly; aggregate reconciliation and final destination proof are serial post-integration obligations.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; a strategy-changing Essence/Hex/ritual correction.
**Review mandate:** Complete usable ritual sequence, Hex conditions stay exactly the five named, and the ritual trigger uncertainty remains actionable rather than resolved by invention.

#### Package `malakai-route-two` — Commit 19: Complete Malakai's fortress-expedition route

**Status:** Planned
**Wave:** 10
**Depends on:** ["malakai-armies"]
**Write scope:** ["content/malakai/routes/route-2.md"]
**Provisional commit:** `feat(content): complete Malakai's fortress-expedition route`
**Work:** Full expedition route with twelve eligible-site advice, policies, summaries and continuations.
**Atomicity:** Staging, recovery, per-site credit guidance and continuation reuse form one complete route with plan/link proof; approximately 15–40 counted frontmatter lines. Candidate/phase records are coverage within it.
**Out of scope:** Other route edits and changes to pinned conditions/reference data.
**Implementation packet:** Complete eight sections/five summaries and all route-use/priority guidance, including the twelve eligible Dark Fortress records (Red Fortress, Bloodwind Keep, Fortress of Eyes, Zanbaijin, The Writhing Fortress, The Howling Citadel, The Crystal Spires, Black Rock, The Twisted Towers, Fortress of the Damned, The Frozen City, The Palace of Ruin) as credit-candidate advice under the seven-of-twelve threshold — never twelve mandatory conquests. Preserve the eligible-site distinctions, the recovery chain/launch base, Slayer/engine priorities and the ship-mobility/Deeps mechanics usage. Keep established identity/selections/flags and both transition slots; remove only this route's partial notices/genuine operational gaps. Inspect its outgoing links to available frozen-base Openings or fallback; do not require Route I's final body or incoming link.
**Files and responsibilities:** Route owns expedition chronology/policies/continuations. No test files are owned.
**Tests and proof:** Existing plan/flag/selection and same-lord transition cases protect supplied-content behavior. Route-local CONTENT REVIEW maps full site/phase/use/summary/continuation advice, checks actual credit semantics and uncertainty, and inspects its citations/outgoing links/gaps; no candidate, queue or full-phase constants. Destination presence is not completed guidance. The serial coordinator checks incoming links and all final destinations after all route results integrate.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; materially changed expedition premise.
**Review mandate:** Twelve candidate sites are not twelve required conquests, and credit-versus-ownership, recovery and staging advice survive intact and actionable.

#### Package `mother-ostankya-route-two` — Commit 20: Complete Mother Ostankya's Lustrian expedition route

**Status:** Planned
**Wave:** 10
**Depends on:** ["mother-ostankya-armies"]
**Write scope:** ["content/mother-ostankya/routes/route-2.md"]
**Provisional commit:** `feat(content): complete Mother Ostankya's Lustrian expedition`
**Work:** Full collecting expedition, policies, summaries and continuations.
**Atomicity:** Theatre operations, ingredient-site advice, station retention and reward-tradeoff continuations form one usable expedition with plan/link proof; approximately 15–40 counted frontmatter lines. Sites/phase records are not separate product changes.
**Out of scope:** Other route edits, pinned condition changes and army/mechanic rework.
**Implementation packet:** Complete eight sections/five summaries, all three ingredient groups (Itxi Grubs — northern cluster; Jungle Lotus Leaves — central/eastern; Coatl Feathers — southern/island) with their six candidate sites each as search guidance — not eighteen mandatory conquests — and full phase/use advice: collection-station retention, the "search is not a documented hero action" caveat, safe convoy progress, and the atlas's own Route II verification gap (published search wording versus the old mission's three-direct-controls quota) kept flagged. Preserve the Jinxed Land transport, Purification and protective Incantation usage, and the reward's custom-item/Frenzy scope as post-victory. Retain the established identity/selections/flags and both transition slots; remove only this route's partial notices/genuine operational gaps. Inspect outgoing links to available frozen-base Openings or fallback, without requiring Route I's final body or incoming transition.
**Files and responsibilities:** Route owns strategy/site advice/policies/continuations. No test files are owned.
**Tests and proof:** Existing supplied plan/panel/phase and transition cases protect rendering and same-lord anchor/fallback behavior. Route-local CONTENT REVIEW maps all site/theatre/phase/use/summary/continuation advice, checks actual variants/strategy/evidence and inspects its citations/links/gaps; no site/target sets or full-phase snapshots. Incoming links and all final destinations are checked by the serial coordinator after all route results integrate.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; a strategy-changing action/geography conflict.
**Review mandate:** No lost collection/staging guidance, invented search-credit rule or premature reward spending.

#### Package `malakai-route-three` — Commit 21: Complete Malakai's empire-relief route

**Status:** Planned
**Wave:** 10
**Depends on:** ["malakai-armies"]
**Write scope:** ["content/malakai/routes/route-3.md"]
**Provisional commit:** `feat(content): complete Malakai's empire-relief route`
**Work:** Full coalition/elimination route; its serial integration closes Malakai's plan coverage.
**Atomicity:** Faction elimination, city control, coalition diplomacy and continuation advice form one usable route with full-plan/link proof; approximately 15–40 counted frontmatter lines. Route-local checks accompany this outcome; aggregate completion proof remains serial validation, not a separate test-only package.
**Out of scope:** Other content owners and feature-level documentation/publication.
**Implementation packet:** Complete eight sections/five summaries, all nine named-target records (Clan Moulder, Wintertooth, The Ecstatic Legions, Bonerattlaz, Wargrove of Woe, The Fecundites, Sylvania, The Deceivers, Warherd of the One-Eye) as elimination-credit advice, the Altdorf/Nuln secure-directly-or-qualifying-control city advice, and the coalition diplomacy/territory/recovery guidance. Preserve elimination-versus-ownership distinctions, faction survival traps (a defeated lord is not a destroyed faction), the relief-column army identity and the engine/support-radius mechanics usage. Keep established identity/selections/flags and transition slots; remove only this route's partial notices/genuine operational gaps; inspect outgoing links to available frozen-base Openings or fallback. Report this route's destinations/exclusions, not completed sibling plans or whole-guide coverage; do not edit the ledger.
**Files and responsibilities:** Route owns the complete coalition plan and reports route-local coverage to the coordinator. No test files are owned.
**Tests and proof:** Existing plan/phase/transition and confidence cases protect supplied behavior. Route-local CONTENT REVIEW maps full elimination/city/phase/use/summary/continuation advice, checks strategy/condition separation and inspects this route's sections/citations/outgoing links/selected variants/flags; no target sets, route counts or full-phase snapshots. The serial coordinator reconciles all Malakai material and actual final Opening destinations after all route results integrate.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; owned meaningful Malakai route material without a visible home or a strategy-changing elimination/city correction. Expected sibling incompleteness on the frozen base is not a blocker.
**Review mandate:** Complete chronology/targets/condition separation and route-local coverage report; no missing continuation, hidden consequential uncertainty or premature whole-guide proof claim.

#### Package `mother-ostankya-route-three` — Commit 22: Complete Mother Ostankya's new-frontier route

**Status:** Planned
**Wave:** 10
**Depends on:** ["mother-ostankya-armies"]
**Write scope:** ["content/mother-ostankya/routes/route-3.md"]
**Provisional commit:** `feat(content): complete Mother Ostankya's new-frontier route`
**Work:** Full New World campaign; its serial integration closes Mother Ostankya's plan coverage.
**Atomicity:** The 32-settlement counter, six named factions, frontier development and continuation reuse form one complete route with full-plan/link proof; approximately 15–40 counted frontmatter lines. Route-local proof is intrinsic; aggregate completion remains serial validation, not another implementation outcome.
**Out of scope:** Other content owners, new state and feature-level close-out/Git operations.
**Implementation packet:** Complete eight sections/five summaries and all six named-target records (Cult of Pleasure, Exiles of Nehek, Slaughterhorn Tribe, The Drowned, Naggarond, Legion of the Gorequeen) plus the 32-settlement occupying/loot/raze/sack counter advice and phase/use guidance: the frontier economic heartland, Devotion progression, Cursemark/Purification/Incantation usage, the "do not open all six wars immediately" caution, and post-victory reward scope. Preserve counter-versus-ownership distinctions (qualifying actions at different locations, not 32 simultaneous settlements) and faction-elimination traps (Taurox's ruined settlement does not prove the Slaughterhorn Tribe is gone). Keep established identity/selections/flags and transition slots; remove only this route's partial notices/genuine operational gaps; inspect outgoing links to available frozen-base Openings or fallback. Report this route's coverage/exclusions, not completed siblings or whole-guide coverage.
**Files and responsibilities:** Route owns strategy/target/policy/continuation content and reports route-local coverage to the coordinator. No test files are owned.
**Tests and proof:** Existing plan/panel/phase/transition and confidence cases protect supplied behavior. Route-local CONTENT REVIEW maps full counter/faction/phase/use/summary/continuation advice and inspects this route's sections/citations/outgoing links/variants/flags. The serial coordinator reconciles all Ostankya material and final destinations after all route results integrate; Final validation retains six-route and thirty-template manual coverage. Automated tests do not pin those corpus counts or target/phase sets.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unrepresented owned meaningful Ostankya route material or a correction changing frontier strategy. Expected sibling incompleteness on the frozen base is not a blocker.
**Review mandate:** The 32-settlement counter and six-faction eliminations are not a single war, one town or a wounded lord; all owned meaningful guidance remains visible without a premature whole-guide proof claim.

## Discoveries and replanning

- The accepted DESIGN is present but uncommitted at planning HEAD `d885258`; accepted DESIGN, this replacement ledger and the TODO reconciliation must be committed by an authorized actor before delivery. Planning itself performs none of those Git operations.
- Verified at planning from the primary archives: the DESIGN's structural enumeration holds (Malakai objectives 9/12/11 with positional keys; adventures 7 with task checklists; fortresses 12; provinces 8; targets 9; shipMilestones 10; legacyResearch 5; Ostankya lores 4 / hexes 5 / ingredients 3 with six sites each / targets 6 / legacyResearch 13 / evidence 7; neither archive carries a VCO version string; Ostankya's JSON `date` is 30 September 2026). Two additions beyond the DESIGN text are now recorded: Malakai armies carry no explicit `size` key (sizes must be derived per template; Ostankya armies carry explicit 20/12 sizes), and neither archive contains crest artwork (both registrations omit `crest`).
- Verified at planning: the committed-corpus test suites are already lord-count-agnostic (by-slug Elspeth assertions, data-driven home/search/citation checks, fixed two-lord fixtures), so registration is not expected to own test adaptations as alith-zhao registration did. Any evidenced pin refutes this and becomes a reviewed scope discovery, not an implicit edit.
- Ostankya's witch lores map to `data/skills.json` by recorded decision (route-selected spell-path queues; no new dataset kind). The `mechanics` dataset remains a viable alternative pre-consumption.
- The Route II verification gap (published "search" versus the old mission's three-direct-controls-per-group quota) comes from the atlas's own evidence notes and is carried as an actionable flag; it is not resolved by invention.
- During delivery the coordinator records the completed block-to-visible-target/exclusion map, actual condition IDs, scoped factual discrepancies and disproved assumptions from worker reports. A material outcome/scope/order change requires fresh review; preserve integrated IDs and add reviewed replacement packages only then.

## Final validation

1. On the actual integrated implementation run `npm run lint:content`, `npm test`, `npx tsc --noEmit`, and `npm run build`. Confirm existing functional coverage and retained Elspeth/Alith/Zhao protection; no new migration suites/assets or editorial/game-strategy snapshots. No planning-time production pass is claimed.
2. After all six Wave 10 route results integrate, the serial coordinator reconciles both whole-guide maps from the package reports and performs required manual CONTENT REVIEW against DESIGN §7 and concrete mapping evidence: embedded/script-only material (Malakai's adventures/task checklists, ship milestones, fortresses, provinces, named targets, legacy-research paths; Ostankya's witch lores, campaign Hexes, ingredient site lists, named targets, legacy-research paths, techs, and seven evidence notes), six complete routes, thirty complete templates with derived/explicit sizes, full selected reference groups, and the unchanged raw archives. Reconcile every applicable roster's full columns, coherence/legal commander/size, gates and substitutions; check recommendations/strategy, source accuracy, ordinary `sources` and confidence citations/shared callouts, effective selections/variants, actual semantic objective IDs, and both archive SHA256 values (`824cc39b40c2a3c444746efa5cae255b988d286f0ae335e099943a985b6de349`, `c8ecdcfdfa1c23b6c7cdd503d4001e0666cc83f09ebbbbc40aaaf60e65b85c53`) remain byte-for-byte. Counts supplement, not replace, meaningful coverage; green functional gates are not content acceptance.
3. Build, then inspect over HTTP with `PORT=0 LEDGER_ROOT=<absolute isolated temporary test-store path> npm run serve`. Verify the isolated root before any runtime write action. This is existing setup, not a server/configuration change. Runtime proof is serial; stop and clean up only the test server/store after capturing evidence.
4. After all route results integrate, the serial coordinator inspects home, both default desks/context/comparison/flags, all six full plans/phase summaries, every selected reference group and all thirty templates' complete applicable roster columns, sources/long lists, twelve same-lord Opening destinations, and deep-link reload at desktop and laptop widths. Check I → II, I → III, II → I, II → III, III → I and III → II for each lord against the actual final Opening H2s; partial-base anchors or route-top fallback do not satisfy final destination proof. Verify preserved shared flags/selections/citations and both declared transition slots with present bodies, without false gap markers. Record hidden/clipped content or unavailable browser evidence as gaps; a genuine UI/model limit requires separate approval, not content truncation or app edits.
5. Only in the isolated ledger store, exercise new-guide objective display, start/open/block with another active campaign including a pre-existing guide, separate planning/game-confirmed tracks and reload persistence. A pre-existing isolated campaign remains intact after new content loads; confidence does not set completion. Existing synthetic `createCampaign`/`itemsFor` cases protect ID-keyed state. HTTP proof selects objective IDs from supplied new-guide data without hardcoded condition/strategy expectations and verifies unchanged runtime wiring, never player files.

## Documentation impact

Complete during reconciliation: the close-out documentation update moves this feature to Completed in `.wiki/TODO.md` with links to DESIGN and IMPLEMENTATION, records the immutable merge ref at the next ordinary tracked documentation update, and reconciles `.wiki/ARCHITECTURE.md` implemented-state text if it names the corpus, plus the DESIGN-flagged CONCEPT.md clarification about Mother Ostankya's faction (the archive's claims, not the Grand Cathay description) with the completed feature's evidence.
