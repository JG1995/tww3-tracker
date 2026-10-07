# Alith Anar and Zhao Ming Migration

**Design:** [Alith Anar and Zhao Ming migration design](ALITH-ZHAO-MIGRATION-DESIGN.md)

## Status

Accepted

**Ledger schema:** 4

## Intent

Migrate the two accepted atlases into the existing F10 content surfaces. The sibling DESIGN owns requirements and acceptance criteria. Execution requires independent plan review, developer acceptance of the delivery graph, committed tracked authority, and explicit delivery authorization. Planning grants no execution or Git authority. `Accepted` denotes the accepted feature intent, not acceptance of this provisional delivery graph.

## User-visible behavior

- Home and current navigation expose Alith Anar and Zhao Ming alongside unchanged Elspeth.
- All six plans and route-selected references are usable without opening the source HTML, including all 30 complete army templates, phase summaries, and same-lord continuations.
- Sources, qualified archival context, actionable flags, and semantic VCO conditions use the existing reference and ledger pages. Confidence never initializes player progress.
- Detailed behavior and completion criteria remain in DESIGN §§4 and 7.

## Invariants

- Production work changes only the two new guide directories and the append-only corpus manifest. Commit 1 owns bounded functional-test adaptations; later packages are content-only. Elspeth content, application/model/lint/server/styles/dependencies, archives, and player state do not change.
- Automated proof protects site behavior and structural contracts, not guide/editorial/game-strategy constants. Required manual CONTENT REVIEW and archive mapping prove migration completeness, roster coherence/legality, recommendations, source accuracy, and strategy accuracy.
- Every meaningful embedded or script-rendered archive block has a visible destination or a reasoned exclusion removing no unique guidance. Dataset counts alone do not establish completeness.
- Current types, loader, lint, selectors, and F10 renderers govern serialization. Preserve differing route overrides, resolving citations, full displayed army columns, and transition-slot declarations.
- Narrow primary VCO checks do not establish whole-guide or installed-version verification. A supported factual correction records its evidence and discrepancy; a strategy-changing correction or model limitation stops for separate approval.
- New objective IDs identify conditions, not display positions, and remain stable once integrated.
- Every integrated prefix passes its package gate and describes partial material honestly. No empty skeleton or unfilled plan is represented as a completed migration.
- During delivery only the coordinator writes DESIGN, IMPLEMENTATION, TODO, BACKLOG, ADRs, and recovery records. Workers report coverage and discoveries rather than editing those owners.

## Non-goals

No third lord, search feature, guide-specific UI/schema, new state, archive calculators/forms/preferences, archive-state import, whole-guide research pass, strategy rewrite, or in-game/Smart Autoresolve test claim. The separately approved PR template is a prerequisite, not an implementation package.

## Current-state map

- Planning checkout: `main` at `a794e02ed6fb0129e90f65ea42d92a1e3923cd3b`, empty Git index. `content/index.json` names only `elspeth-von-draken`; neither new guide exists.
- Publication provider: GitHub, origin `git@github.com:JG1995/tww3-tracker.git`. Coordinator-supplied provider inspection reports default branch `main`, merge commits allowed, and no branch protection. No CI workflow exists. The separately approved `.github/pull_request_template.md` now exists with Summary/Validation sections but is untracked. DESIGN is also untracked; accepted planning documents and the template must be committed by an authorized actor before execution.
- `app/content/load.ts` loads manifest-named files, calls the same lint as the CLI, renders Markdown, and freezes the tree. Filesystem orphan checks in `app/content/lint.ts` prevent adding a detached unregistered guide directory before its manifest entry.
- `app/content/query.ts` selects only `panelOrder` IDs. Unselected Items have no panel home; `getFlaggedEntries` ignores shared-only claims. Ordinary card `sources` references and shared callouts need companion checks beyond current lint's `src` coverage. `resolveSources` silently drops unknown IDs: one corpus-wide selected-card citation check is warranted, without pinning source IDs/counts.
- `app/components/deskPanel.ts` displays `legendary` and `generic` army columns directly; it does not append `units`. `registrySlots` in `app/views/plan.ts` derives transition slots from `route.gaps`, and `slotAt` renders a present body before checking for a gap marker.
- F10 allocation: desk owns common context/comparison/flags; plan owns chronology/phases/transitions/VCO undercard; armies/skills/research, settlements, and workshop own selected references; sources owns the catalogue. Use current page-first hashes in `app/router.ts`, not retired F2 URLs.
- `app/ledger/logic.ts` creates and reconciles objective state by ID. The existing action region enforces one active campaign. `tools/server.mjs` supports isolated `LEDGER_ROOT` and ephemeral `PORT=0` for final runtime proof.
- Registration affects three existing test assumptions: the one-lord assertion in `test/elspeth-skeleton.test.ts`, home version-context coverage in `test/views.test.ts`, and the Elspeth-specific callout assertions incorrectly looped over every lord in `test/components.test.ts`. Preserve those Elspeth assertions by selecting Elspeth explicitly; do not impose its content on the new guides.
- Complete local precedent read: [Elspeth implementation](../elspeth-migration/ELSPETH-MIGRATION-IMPLEMENTATION.md). It groups shared fundamentals, reference families, VCO rows, full routes/transitions, and a discovered research-override correction. Its F2 pages, character-only roster mapping, Local publication, blanket archive authority, and confidence defaults are not this feature's contracts.
- Known archive structure: each lord has three routes and fifteen armies; Alith has 42 sources, 4 shared blocks, 8 skills, 4 base research groups plus a Route II hunt override, 20 tech records, 9 settlement roles, 6 mechanics, 6 cities, 8 search candidates, 6 named targets, and 8 evidence notes. Zhao has 33 sources, 3 shared blocks, 7 base skills with Zhao overrides on all routes, 4 research groups plus a Route I opening override, 30 tech records, 9 base settlement roles with Shang-Yang overrides on all routes, 6 mechanics, 5 sites, 4 provinces, 3 faction targets, 4 Compass records, 7 recruitment notes, and 8 evidence notes.
- Commands: `npm test`, `npx tsc --noEmit`, `npm run lint:content`, `npm run build`, and `npm run serve`. No implementation gates, server/browser checks, or external research have run in planning. CodeGraph has no index; no maintenance is authorized.

## Feature architecture

### Migration outcomes

Use the existing manifest, shared Markdown, three route documents, seven datasets, and optional supported crest per guide. Registration creates a valid, discoverable archival reference entry with honest incomplete plans. A VCO contract package then checks that lord's three title/objective/reward sets and establishes their condition rows together, before related strategic material is migrated.

Each reference family is one review/recovery seam: skills with effective variants, research with tech folds and variants, settlement roles with variants, faction mechanics with related script guidance, and all fifteen army templates with full-roster normalization. Select the migrated family immediately in the three route documents, so the existing detail pages expose it without waiting for complete plans. Leave other groups and plan sections honestly incomplete.

A complete route package migrates its chronology, identity interpretation, route-use notes, territory/diplomacy, phase summaries, and both continuations together. Existing references and checked victory conditions are its prerequisites. Do not separate a transition body, hero queue, equipment paragraph, or army variant into a commit merely because it is independently editable.

This follows the pilot's migration scale without copying its graph. The additional registration seam is necessary because these guides do not already have committed skeletons. Known overrides belong to their owning family now, not a later correction. The early VCO seam separates researched requirements from strategic plan authorship and allows a material factual conflict to stop before that authorship.

### Coverage destinations

This is the starting inventory, not completed mapping evidence. Each worker reports concrete destinations/exclusions for its families; the coordinator records the reconciled mapping under Discoveries.

| Material | Visible destination and owning package family |
| --- | --- |
| Identity, environment, available crests, archive date/version and source catalogues | Registration; actual narrow checks and source notes in VCO contract |
| Shared blocks, equipment/access assumptions, budget/reserve/payoff explanations, common doctrine and recurring routine | Shared fundamentals, including meaningful non-data prose from army/economy/budget/notes renderers |
| Character queues and override priorities; role/effect/gate cautions | Skills; route-specific `use` notes in complete routes |
| Research queues, differing overrides, all meaningful technology prerequisites/why-notes | Research steps/details; tracker indexes excluded only after unique tech guidance is represented |
| Settlement roles, effective Shang-Yang variants, construction gates and slot constraints | Settlements; Zhao's seven recruitment notes folded into relevant role details, with army-specific substitutions in armies |
| Alith shadow tools, marks/deadlines, Hand, Influence reserves, Patrons and rites | Mechanics, including unique `influenceCalc`, `timingCalc`, `patronLedger`, workshop and victory explanations |
| Zhao caravans/escorts/destinations/counter distinctions, Compass, Harmony, alchemy, Ogres and governance | Mechanics, including all four Compass records and unique planner/calculator/ledger explanations; no interactive planner recreation |
| Fifteen templates per guide, complete variant troops/characters, recruitment/readiness/substitutions, manual doctrine | Armies; general battle doctrine in shared fundamentals |
| VCO titles/conditions/rewards, trigger/reward limitations and evidence | VCO contract: identity claims, ordered actual conditions, sources, and discoverable callouts/flags |
| Alith city/search/target advice; Zhao site/province/faction advice; full five-phase actions/aims/checkpoints, priorities, recommendations, diplomacy/territory and continuation reuse | Corresponding complete routes; condition rows reference actual requirements, not candidate/bookkeeping checklists |
| Eight evidence notes per guide | Source trail plus the affected visible claim/reference/route; important unresolved assertions must reach the flagged selector |
| Checkboxes, input values, saved notes/preferences, calculator forms, backup/reset/search controls, duplicate tracker indexes | Reasoned machinery/state exclusions only after extracting unique instructional prose |

Inspect both embedded `guide-data` and enclosing archive renderer prose. In particular, do not overlook `armies`, `economy`, `budgetHTML`, `workshop`, `victory`, `notes`, `sourcesPage`, or the lord-specific calculator/planner functions named above. Inventory is coverage evidence, not a package list. Report an unassigned meaningful block while handling its family, not only at final close-out.

### Authorship and proof rules

1. Compare the owning archive family with current types/lint/rendering; inventory its meaningful prose and evidence. Author supported content and its route selections together; then prove the observed result and report mapping/corrections. Use current Markdown/frontmatter and Item shapes, omit empty optional step fields, and map archive `builds` to `buildings` and `route1/2/3` to stable `route-1/2/3`.
2. Keep genuinely identical references shared. Give differing effective overrides distinct flat IDs selected only on their owning routes. Preserve meaningful common/base advice in the selected effective entries; a redundant unselected base entry is not coverage.
3. Follow DESIGN's archival-confidence policy. Source catalogues qualify archive authors' checked assertions; scoped delivery checks record actual date/version/assertion/limitations. Do not advance the guide-wide archive date or claim the installed stack is verified. Resolve both ordinary `sources` and confidence `src` IDs, including shared callouts. Route claims, selected Items, and VCO rows—not a bibliography alone—carry consequential uncertainty.
4. Shared fundamentals may add important flag callouts to Route I's partial Opening because shared-only claims are not collected. If any package adds prose before full plans land, identify the plan as partial, retain genuine missing-section gaps, and use only registered headings. Full route authorship preserves earlier flags/citations and removes partial notices only when its content is complete.
5. Route packages use only registered H2s and bold labels within them. Opening → Opening, Early → Early → Mid, Mid plus Late → Mid → Late, Victory → Victory push. Five summary pairs supplement every detailed action/aim/checkpoint. Retain each completed transition title in `gaps` as a rendering slot; remove genuine operational gaps. `transitionTarget` derives a destination's real Opening from loaded content, otherwise the link uses the existing route-top fallback. An existing partial Opening is an available anchor, not completed destination guidance. Each worker inspects its own full route and outgoing links against the destinations actually available on its frozen base, without requiring a sibling's final body. The coordinator rechecks links on each integrated prefix and owns whole-guide reconciliation and all twelve final Opening destinations after all six route results integrate.
6. Reuse the existing functional suites and synthetic fixtures. Commit 1 adapts the three evidenced pilot assumptions, extends the existing home check to supplied per-guide card/context data, and adds one corpus-wide check that ordinary selected-card source IDs resolve within their own lord. No guide-specific migration suites, new fixture assets, harness, per-record expansion, or archive-dependent tests are planned. Preserve legitimate unchanged Elspeth assertions; do not perform unrelated cleanup.
7. Required manual CONTENT REVIEW accompanies every package. Report concrete archive-block destinations/exclusions and inspect the delivered content through current selectors/renderers. Check completeness, full displayed rosters and legal commanders/sizes, effective overrides/order, technology guidance, targets/conditions, phases/use notes, recommendations, confidence and source accuracy against the archive and bounded VCO evidence. These are content obligations, not automated snapshots. Do not add assertions pinning new-guide roster counts/commanders, technology order/names, corpus counts, prose, targets, conditions, full phases, or archival queue slots.

**Existing functional proof portfolio:**

- `test/content-model.test.ts` and `test/lint-cli.test.ts`: multi-lord loading, schema failures, manifest/reference resolution, confidence states and flagged selection, using existing fixture inputs. Content lint also checks every authored package's structural validity.
- `test/components.test.ts`: supplied army columns/rows and explicit absence, Item steps/details, sources and confidence. Existing synthetic armies use arbitrary sizes; this proves rendering, not game roster legality.
- `test/views.test.ts`: lord-scoped queries, supplied panel selection/order, detail/plan/source rendering, phase and objective absence, registered sections/gaps, same-lord Opening transitions and route-top fallback. Its existing constructed/fixture cases protect behavior; new guide strategies do not get duplicate exact-value cases.
- `test/router.test.ts`: hash grammar and section navigation. `test/ledger-logic.test.ts`, `test/ledger-state.test.ts`, `test/ledger-io.test.ts`, `test/server.test.ts`, and existing view/component cases protect ID-keyed reconciliation, independent progress/defaults, active-campaign blocking, rollback and persistence with synthetic IDs and isolated stores. They do not establish factual VCO requirements.

**Common package gate:** `npm run lint:content`, `npm test`, `npx tsc --noEmit`, and `npm run build`, plus required CONTENT REVIEW/mapping evidence. Commit 1 first runs its recorded focused command; later packages reuse the existing suite without adding cases/assets. Seek meaningful RED evidence for the changed functional checks where practical; explain unavailable evidence. Existing full-suite server/IO tests start ephemeral-port servers with unique temporary ledger roots; no new package-specific server setup or player-state writes. Final integrated HTTP/browser proof is separate and serial.

**Common stops:** a missing/changed authority, unusable workspace/dependency setup/archive, ownership drift, unrepresentable meaningful content, an unsupported confidence assignment, unavailable meaningful proof, or a strategy-changing factual conflict stops integration. A needed change outside the exact packet scope requires coordinator-routed replanning; do not weaken validation, add fields, or touch player data to obtain a pass.

### Waves and environment

After fresh review and developer acceptance, an authorized actor commits the tracked DESIGN, replacement ledger, TODO reconciliation, and separately approved PR template before delivery. Planning itself does none of those Git operations. No ignored-wiki snapshot journal applies.

Every initial package, including singleton registration, runs in its own verified Paseo-managed worktree on a unique scratch branch at the wave's frozen committed HEAD. Supply read-only same-host access to the two named gitignored archives and verify their hashes; worktrees do not copy them or ignored dependencies. Verify usable setup against the existing lockfile without changing dependency ownership/versions; unavailable setup stops dispatch.

Registration packages run serially because they share `content/index.json` and the first must adapt shared corpus assumptions. Waves 3–9 pair one Alith and one Zhao outcome: guide directories, selectors/IDs and source catalogues are lord-scoped; no later package writes shared tests, and neither member consumes its sibling's unfinished content. Each lord's reference-family chain serializes its recurring route-file ownership; these edges remain integration-order constraints, not invented strategic dependencies between unrelated reference families.

Wave 10 contains all six complete-route packages after both guides' reference families and VCO contracts have integrated. Their exact scopes are pairwise disjoint route files. Each route's prerequisite chain supplies its names/IDs, sources, conditions and selected references; no route author consumes a sibling's final plan. Preserve established titles, IDs, selections, flags and citations; author only the owned route and its two outgoing continuations. Sibling plans remain partial on every worker's identical frozen base, even if dispatched in a later batch. Apply the route-local proof rule above and report mapping/CONTENT REVIEW without claiming completed whole-guide coverage.

Dispatch wave members up to the selected preset's `max_parallel_subagents` policy. An integer limit is a shared simultaneous-subagent budget across workers, reviewers and other roles; a preset with no additional cap remains subject to provider request concurrency. If batching is needed, later members still start from the same frozen committed base. Tests use read-only corpus inputs, in-memory state or unique temporary directories. Existing full-suite server/IO tests use `PORT=0` and their own temporary ledger roots; inspect that isolation before gates. The lint CLI bundles into a unique temporary directory, and mutating content tests use temporary copies. Worktrees isolate build output, not services/ports. Final integrated runtime proof is serial with `PORT=0` and an explicitly verified isolated `LEDGER_ROOT`.

Freeze integration HEAD until all wave results are stopped, captured, and base/scope/digest-verified. Scratch commits are transport only. Import base-to-result patches serially in package-number order, validate/review as routed, and commit each accepted outcome separately; never merge/cherry-pick scratch history. Every route's integrated prefix retains its Common package gate and honest available-anchor/fallback inspection. After all six route results integrate, the serial coordinator reconciles both complete guides' mapping, selections and shared flags, then checks every directed transition into the actual final Opening before final acceptance. This is post-integration validation, not a new package or worker requirement. A failed member blocks wave advancement or close-out without undoing integrated work. Only the coordinator records progress and discoveries.

## Uncertainty register

### Known

- Read-only archive paths: `.work/references/Alith_Anar_VCO_Expedition_Atlas.html` and `.work/references/Zhao_Ming_VCO_Expedition_Atlas.html`. SHA256 respectively `1adb6bc355253a6a08ff86a5fe45d910b1b4405d4269fad882d3cab5abf6cb66` and `37b3d50895ae90703f69e59e2be9b5a7011bbad4c3a78bbdc244cee4496daea5`.
- Both archives report 30 September 2026 and `2026.09.30.1`; localisation attributions support checking route titles, not claiming current verified titles.
- Army character fields are `alith`/`zhao`; troops are in `units` and actual `genericUnits` variants. Each nonempty displayed column needs its intended 20-slot field or 12-slot home count and a legal single commander. Zhao home templates are genuinely General-led, not Zhao variants merely because the archive field is named `zhao`.
- Alith Route II changes `hunt` research. Zhao changes `zhao` skills and `shang` settlement priorities on all routes and `opening` research on Route I. Empty mechanics override maps add no variants.
- The current GitHub classifiers require the existing genuine template. Publication classification additionally requires a completed PR boundary; a wholly Planned graph is not publication-ready.

### Assumptions

- Every meaningful block fits existing selected Items, registered prose and source notes. A forcing block disproves this assumption and requires separate approval, not a schema workaround.
- Locked project dependencies can be made available in isolated worktrees without manifest/lockfile changes; verify before dispatch.
- Archive strategy remains the baseline subject to bounded primary-supported factual corrections. Untouched non-VCO material remains qualified archival guidance.

### Decisions

- Developer rejected the unaccepted 122-record decomposition and explicitly authorized a clean retry at sensible migration scale using the complete Elspeth precedent. No rejected package was executed or integrated; no Removed-history rows are retained.
- One GitHub PR, `feat/alith-zhao-migration` → `main`, using merge commits to retain the atomic migration sequence. Provider metadata permits it; live publication rules/checks/approvals must be verified again by the publication skill. No intermediate trunk prerequisite warrants a second PR.
- Use one package per coherent guide registration, VCO contract, shared reference document, reference family, or complete route. Variant, equipment, individual roster, and directed-transition records remain coverage within those outcomes. Registration is manifest-coupled; the other seams bound practical review/recovery rather than count editable records.
- VCO contracts land before strategy families/plans to resolve or honestly flag their requirements. New semantic objective IDs are assigned by those packets and remain stable after integration, never array indexes or later-renumbered counters. CONTENT REVIEW establishes condition accuracy; existing synthetic tests protect ID-keyed ledger behavior.
- Alith conditions distinguish Naggarond destruction/six cities, actual relic-search credit versus eight candidates/provisional quota, and Anlec/successful actions/six named wounds. Zhao conditions distinguish four trade requirements, five fixed sites, and four provinces/three destroyed factions. Candidate lists and optional reward/bookkeeping advice do not become mandatory rows.
- Soft ordering follows the pilot's shared/skills/research/settlement/mechanics/army/route review flow after the early contract checks. Hard dependencies are registration, source/condition availability, valid referenced datasets, and serialized shared ownership.

### Unknowns

None gating the first package. Source availability/current applicable wording, installed versions, live trigger behavior, exact per-block placement, and final visual coverage are delivery facts handled by accepted fallback/stop rules, not facts to invent in planning.

### Risks

- Large data diffs can hide script-only prose, technology details or evidence notes. Required CONTENT REVIEW, the coverage map and worker reports establish fidelity; green functional tests do not establish content completeness.
- A character-only roster rename passes shape lint yet hides troops. Existing fixture tests protect supplied-column rendering; CONTENT REVIEW must verify every actual template's full columns, intended sizes, legal commander and differing generic core.
- Invisible flat entries and shared-only flags can appear complete on paper. Family selections, effective variants and discoverable uncertainty travel with content.
- Removing transition slots silently hides complete bodies. Intermediate route-top links must not be mistaken for final Opening-anchor proof.
- The initial registration must narrow all three evidenced pilot-test assumptions without weakening Elspeth protection or permanently asserting that later new-guide families stay empty.
- No provider check names or CI are currently evidenced; local gates are not fictional required GitHub checks.

## Walking skeleton

Commits 1–2 prove new-guide discovery/context/source libraries through the real manifest/loader/home/desk/sources path with honest partial plans. After the family migrations, Commits 17–18 make each lord's Route I fully readable through the existing plan/reference/ledger surfaces, including both authored continuations with the supported fallback for unfinished destinations. Commits 19–22 complete Routes II/III and thereby all actual same-lord Opening destinations. No partial prefix is separately advertised as completed coverage.

## Delivery plan

**Commit packages:** 22

### PR `alith-zhao-content` — Migrate both atlases into the existing content surfaces

**Status:** Planned
**Depends on:** []
**PR ref:** Not published
**Merge ref:** Not merged
**Branch:** `feat/alith-zhao-migration`
**Base branch:** `main`
**Publication provider:** GitHub
**PR template:** .github/pull_request_template.md
**Merge method:** merge
**Required checks:** Local gates `npm run lint:content`, `npm test`, `npx tsc --noEmit`, `npm run build`, and the Final validation HTTP/coverage evidence. No current provider-required check names or CI workflow are evidenced. Verify live checks, review rules and exact-head approval through the publication skill before merge.
**Feature close-out:** Current
**Provisional PR title:** `feat(content): migrate Alith Anar and Zhao Ming atlases`
**Purpose:** Deliver six complete plans and their references as one content-only review/merge boundary with green atomic prefixes. No separate prerequisite needs to land on trunk. Publish/merge only after implementation, final feature review and current close-out; bind merge approval to the verified head and synchronize `main` with ff-only pull. In this tracked wiki, record the final immutable merge ref/Completed reconciliation at the next ordinary documentation update, not a self-referential metadata-only commit. Planning authorizes no Git/publication operation.

#### Package `alith-registration` — Commit 1: Register Alith's archival guide context

**Status:** Integrated
**Wave:** 1
**Depends on:** []
**Write scope:** ["content/index.json", "content/alith-anar/guide.json", "content/alith-anar/shared.md", "content/alith-anar/crest.svg", "content/alith-anar/routes/route-1.md", "content/alith-anar/routes/route-2.md", "content/alith-anar/routes/route-3.md", "content/alith-anar/data/armies.json", "content/alith-anar/data/skills.json", "content/alith-anar/data/research.json", "content/alith-anar/data/buildings.json", "content/alith-anar/data/mechanics.json", "content/alith-anar/data/vco.json", "content/alith-anar/data/sources.json", "test/elspeth-skeleton.test.ts", "test/views.test.ts", "test/components.test.ts"]
**Provisional commit:** `feat(content): register Alith's archival guide context`
**Work:** A discoverable, valid guide entry and source library with correct context and explicit incomplete plans.
**Atomicity:** Manifest registration, every named companion and boot/corpus protection are inseparable under missing/orphan-file lint. Approximately 120–180 counted manifest/frontmatter lines; prose, source data, crest and tests excluded. A detached file subset is not a usable guide entry.
**Out of scope:** Full shared/reference/route content, primary checks, objective rows and Zhao registration.
**Implementation packet:** Append Alith after Elspeth; extract the available crest, qualify archive date/version/setup and all 42 sources. Name/create seven legal empty datasets and three route stubs with archived/unverified identity, `vcoTitle: null`, empty selections and genuine gap declarations. Display partial status. Adapt the three evidenced corpus-test assumptions, preserving every Elspeth-specific expectation.
**Files and responsibilities:** Index/manifest register and name all new files; shared context/source catalogue/crest identify the archive; routes/datasets supply honest empty states. Existing skeleton/components tests explicitly select Elspeth while retaining its assertions. Views owns data-driven home/card context and one corpus-wide selected-card source-resolution check, using the existing reader/query/VNode helpers without hardcoded guide IDs/counts.
**Tests and proof:** Existing loader/home/reference suites protect registration and empty-state behavior. Adapted home proof checks each supplied guide's card/link/context, allowing later appended lords; citation proof catches silently dropped ordinary source IDs, not bibliography accuracy. CONTENT REVIEW checks Alith's complete named companions, qualified bibliography/context and truthful partial pages.
**Validation:** First `node --test test/elspeth-skeleton.test.ts test/views.test.ts test/components.test.ts`; then Common package gate. No new test assets.
**Stop conditions:** Common stops; unavailable named asset/source evidence is not permission to fabricate it.
**Review mandate:** Manifest-complete entry, correct partial context, append-only ordering, complete qualified bibliography and narrowed—not deleted—Elspeth protection.

#### Package `zhao-registration` — Commit 2: Register Zhao's archival guide context

**Status:** Integrated
**Wave:** 2
**Depends on:** ["alith-registration"]
**Write scope:** ["content/index.json", "content/zhao-ming/guide.json", "content/zhao-ming/shared.md", "content/zhao-ming/crest.svg", "content/zhao-ming/routes/route-1.md", "content/zhao-ming/routes/route-2.md", "content/zhao-ming/routes/route-3.md", "content/zhao-ming/data/armies.json", "content/zhao-ming/data/skills.json", "content/zhao-ming/data/research.json", "content/zhao-ming/data/buildings.json", "content/zhao-ming/data/mechanics.json", "content/zhao-ming/data/vco.json", "content/zhao-ming/data/sources.json"]
**Provisional commit:** `feat(content): register Zhao's archival guide context`
**Work:** Add Zhao's valid archival entry and source library through the same existing path.
**Atomicity:** Registration and all named companions form one loader-complete entry with its boot proof; approximately 120–180 counted manifest/frontmatter lines, excluding prose/data/crest/tests. An unregistered fragment fails filesystem lint.
**Out of scope:** Full plans/references/checks and edits to prior guides or their tests.
**Implementation packet:** Append Zhao after Alith. Create the corresponding manifest/crest/context, all 33 qualified sources, seven empty datasets and three truthful partial routes, as Commit 1 does. Do not import saved state.
**Files and responsibilities:** Index appends Zhao; Zhao files form its named content tree. Commit 1's corpus reconciliation already supports additional lords; this package owns no tests.
**Tests and proof:** Existing loader/schema and data-driven home/reference proof exercise the appended guide without a fixed corpus count. CONTENT REVIEW checks Zhao's named companions, qualified identity/context/source library and honest partial pages; previous entries remain unchanged.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; a residual shared-test ownership need must be reported before edits.
**Review mandate:** Manifest completeness, honest empty states, qualified provenance, preserved Elspeth/Alith and no player-state import.

#### Package `alith-vco-contract` — Commit 3: Establish Alith's sourced victory contract

**Status:** Integrated
**Wave:** 3
**Depends on:** ["alith-registration"]
**Write scope:** ["content/alith-anar/data/vco.json", "content/alith-anar/data/sources.json", "content/alith-anar/routes/route-1.md", "content/alith-anar/routes/route-2.md", "content/alith-anar/routes/route-3.md"]
**Provisional commit:** `feat(content): establish Alith's sourced victory contract`
**Work:** Check three VCO title/objective/reward sets and expose consistent identity/ledger conditions with actionable limits.
**Atomicity:** One guide's victory catalogue, citing evidence and identity claims must agree before strategy consumes them; their condition/flag/ledger proof is one migration contract. Approximately 30–60 counted frontmatter lines; rows, prose, source data and tests excluded. Per-condition records are coverage, not separate outcomes.
**Out of scope:** Whole-guide revalidation and complete operational routes.
**Implementation packet:** Perform bounded primary checks and record actual dates/versions/assertions/limitations. Verified official titles occupy `vcoTitle`, otherwise retain null and archive attribution. Establish semantic IDs: distinguish Naggarond/six cities, actual relic-search condition versus eight candidates/provisional quota, and Anlec/action counter/six wounds. Preserve script victory limits; put detailed route advice in later plans, with interim caveats visible where needed.
**Files and responsibilities:** VCO file owns ordered conditions; sources owns new scoped checks/discrepancies; three route documents own aligned identity and discoverable caveats. No test files are owned.
**Tests and proof:** Existing fixture/synthetic tests protect typed objective display, confidence/citation handling and ID-keyed fresh/independent ledger state. CONTENT REVIEW verifies actual titles/rewards/conditions, semantic IDs and evidence, including relic credit versus candidates; do not hardcode Alith condition sets into tests.
**Validation:** Common package gate; no new test cases/assets or live game proof.
**Stop conditions:** Common stops; unavailable primary text uses DESIGN's archival fallback unless it prevents a usable plan. Strategy-changing quota/trigger/control conflict stops.
**Review mandate:** Published wording versus live behavior, condition/advice separation, honest title/reward scope, archival-date preservation and actionable flags.

#### Package `zhao-vco-contract` — Commit 4: Establish Zhao's sourced victory contract

**Status:** Integrated
**Wave:** 3
**Depends on:** ["zhao-registration"]
**Write scope:** ["content/zhao-ming/data/vco.json", "content/zhao-ming/data/sources.json", "content/zhao-ming/routes/route-1.md", "content/zhao-ming/routes/route-2.md", "content/zhao-ming/routes/route-3.md"]
**Provisional commit:** `feat(content): establish Zhao's sourced victory contract`
**Work:** Check Zhao's three title/objective/reward sets and establish their identity/ledger conditions.
**Atomicity:** Victory catalogue, source scope and identity must agree as one guide contract with condition/flag/ledger proof. Approximately 30–60 counted frontmatter lines; reference data/prose/tests excluded. Splitting individual targets does not create a useful migration seam.
**Out of scope:** Whole-guide research and full operational plans.
**Implementation packet:** Apply Commit 3's bounded-check policy to Zhao. Separate four trade requirements, five fixed-site operations, and four complete provinces/three faction eliminations. Preserve gross/net/cargo/gold, Embassy/House of Secrets, sack/qualifying action and post-victory reward distinctions; assign semantic IDs and honest title/trigger confidence.
**Files and responsibilities:** VCO owns conditions; sources owns bounded evidence; routes own aligned identity/caveats. No test files are owned.
**Tests and proof:** Existing objective/confidence and synthetic ledger cases protect supplied-row rendering, source resolution, ID-keyed progress and fresh defaults. CONTENT REVIEW verifies actual trade/site/control/elimination conditions, title/reward scope, semantic IDs and evidence; no Zhao condition snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops and the accepted source-unavailable fallback; a materially changed campaign premise requires approval.
**Review mandate:** No bookkeeping/candidate/reward rows masquerading as requirements or reward-financed opening assumptions.

#### Package `alith-shared-fundamentals` — Commit 5: Migrate Alith's shared campaign fundamentals

**Status:** Integrated
**Wave:** 4
**Depends on:** ["alith-vco-contract"]
**Write scope:** ["content/alith-anar/shared.md", "content/alith-anar/routes/route-1.md"]
**Provisional commit:** `feat(content): migrate Alith's shared fundamentals`
**Work:** Complete the common reference document: four blocks and related non-data doctrine, access, equipment, budgets and routine.
**Atomicity:** These related fundamentals form one common campaign reference with rendered-document/flag proof; topic paragraphs are coverage, not separate product changes. Approximately 0 counted implementation lines; Markdown/tests excluded.
**Out of scope:** Character/dataset families, full routes and interactive calculators.
**Implementation packet:** Preserve all four shared blocks and related script army/economy/budget/notes guidance. Adapt obsolete controls to current-app advice; retain practical reserves, manual recovery and Smart Autoresolve evidence limits. Surface consequential shared uncertainty in Route I's explicitly partial Opening.
**Files and responsibilities:** Shared owns fundamentals and archive scope; Route I owns required discoverable companion flags. No test files are owned.
**Tests and proof:** Existing desk/shared rendering and fixture-based flagged selection protect supplied content and confidence behavior. CONTENT REVIEW maps all common/script-only guidance, checks rendered access/equipment/budget reasoning and inspects important Route I flags and shared citations; no topic/prose snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; excluded machinery containing unassigned unique guidance must be mapped first.
**Review mandate:** No lost equipment/access/budget reasoning, false benchmark claim, duplicate strategy rewrite or hidden shared-only flag.

#### Package `zhao-shared-fundamentals` — Commit 6: Migrate Zhao's shared campaign fundamentals

**Status:** Integrated
**Wave:** 4
**Depends on:** ["zhao-vco-contract"]
**Write scope:** ["content/zhao-ming/shared.md", "content/zhao-ming/routes/route-1.md"]
**Provisional commit:** `feat(content): migrate Zhao's shared fundamentals`
**Work:** Complete three shared blocks and related common budget, battle, access, equipment and routine guidance.
**Atomicity:** One common campaign document with rendered-topic/flag proof; fragmenting paragraphs adds recovery noise without a new product outcome. Approximately 0 counted implementation lines.
**Out of scope:** Recruitment-role/mechanics/army specifics, complete routes and calculators.
**Implementation packet:** Preserve shared material and unique army/economy/budget/notes script explanations. Keep formation proximity versus equal-count and provincial Harmony distinctions, practical funding and untested autoresolve limits. Put important common uncertainty in Route I's partial Opening; recruitment/Compass/Harmony details have later family owners.
**Files and responsibilities:** Shared owns common guidance; Route I owns discoverable caveats. No test files are owned.
**Tests and proof:** Existing desk/shared and flagged-selector cases protect supplied prose/confidence rendering. CONTENT REVIEW maps the full common guidance and script-only explanations, inspects shared citations and visible companion flags, and verifies truthful limits; no Zhao topic/prose constants.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unmapped unique script guidance.
**Review mandate:** Complete common guidance, source scope and appropriate flag visibility without copying another Cathayan lord's systems.

#### Package `alith-skills` — Commit 7: Migrate Alith's character-priority reference

**Status:** Integrated
**Wave:** 5
**Depends on:** ["alith-shared-fundamentals"]
**Write scope:** ["content/alith-anar/data/skills.json", "content/alith-anar/routes/route-1.md", "content/alith-anar/routes/route-2.md", "content/alith-anar/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Alith's character priorities`
**Work:** Complete and select the eight-entry skills family.
**Atomicity:** The commander/support/agent/caster reference is one related build family with selection/render proof. Individual hero queues are inventory, not separate migration outcomes. Approximately 10–25 counted selection/frontmatter lines; JSON reference data/tests excluded.
**Out of scope:** Other reference groups and route-specific `use` prose owned by route packages.
**Implementation packet:** Map full steps/details/gates/sources to Items and fill each route's skills selection in archive order. Preserve script role/effect/automatic-unlock cautions and embedded-versus-detached distinctions under truthful confidence.
**Files and responsibilities:** Skills holds builds; three route files expose the family. No test files are owned.
**Tests and proof:** Existing synthetic selection/order and fixture Item steps/details/source cases protect functional panels. CONTENT REVIEW accounts for every build, full queue/role/gate advice and actual route selections/order; no build count, character priority or queue-slot assertions.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unsupported access/gate facts need honest qualification or approved correction.
**Review mandate:** Full character coverage and no borrowed unique lord effects or invented spending gates.

#### Package `zhao-skills` — Commit 8: Migrate Zhao's character-priority reference

**Status:** Integrated
**Wave:** 5
**Depends on:** ["zhao-shared-fundamentals"]
**Write scope:** ["content/zhao-ming/data/skills.json", "content/zhao-ming/routes/route-1.md", "content/zhao-ming/routes/route-2.md", "content/zhao-ming/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Zhao's character priorities`
**Work:** Complete the skills family including three effective Zhao variants.
**Atomicity:** Common builds and their differing commander priorities jointly define the route-selected skill reference; variants travel with selection/non-overwrite proof. Approximately 10–25 counted selection lines; data/tests excluded. A variant is not a separate feature.
**Out of scope:** Other reference families and full route-use prose.
**Implementation packet:** Migrate seven base records' meaningful guidance, flatten effective Zhao overrides into distinct route-owned IDs, and select them with common supporting builds. Preserve branch alternatives, Caravan Master scope and automatic-unlock/role caveats. Do not count a hidden redundant base Zhao entry as coverage.
**Files and responsibilities:** Skills owns effective builds; routes own independent selections. No test files are owned.
**Tests and proof:** Existing lord/route-scoped selection and supplied Item rendering protect variant binding and visible steps/details. CONTENT REVIEW checks every effective Zhao override against its archive, preserved base advice and full supporting builds; no exact queue/order or character-priority snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; conflicting base/override content requiring strategic reinterpretation.
**Review mandate:** Independent effective variants, preserved common advice and personal/army/caravan effects kept distinct.

#### Package `alith-research` — Commit 9: Migrate Alith's research reference

**Status:** Integrated
**Wave:** 6
**Depends on:** ["alith-skills"]
**Write scope:** ["content/alith-anar/data/research.json", "content/alith-anar/routes/route-1.md", "content/alith-anar/routes/route-2.md", "content/alith-anar/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Alith's research reference`
**Work:** Complete four base groups, the Route II hunt variant, and meaningful guidance from all twenty technology records.
**Atomicity:** Queues, prerequisites/why-notes and effective variant selection form one usable research family and its proof. Approximately 10–25 counted selection lines; data/tests excluded. Tech records and an already-known override are not additional product seams.
**Out of scope:** Other datasets and checkbox/tracker linkage.
**Implementation packet:** Fold every unique tech name/prerequisite/why-note into selected steps/details, not only existing queue titles. Preserve the differing hunt queue as a distinct ID selected only on Route II; retain common hunt for I/III. Exclude tracker indexes only after verifying their guidance is represented.
**Files and responsibilities:** Research holds queues/tech folds; routes own selections. No test files are owned.
**Tests and proof:** Existing synthetic panel selection and fixture Item rendering protect supplied order/gates/details without editorial values. CONTENT REVIEW maps every technology's unique guidance and checks the actual hunt override versus I/III selections and visible context; no technology names/order or queue-slot assertions.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unmapped unique technology advice or a forcing unsupported shape.
**Review mandate:** No missing tech guidance, empty optional fields, hidden override or borrowed Aislinn prerequisite.

#### Package `zhao-research` — Commit 10: Migrate Zhao's research reference

**Status:** Integrated
**Wave:** 6
**Depends on:** ["zhao-skills"]
**Write scope:** ["content/zhao-ming/data/research.json", "content/zhao-ming/routes/route-1.md", "content/zhao-ming/routes/route-2.md", "content/zhao-ming/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Zhao's research reference`
**Work:** Complete four research groups, Route I's opening variant and all thirty meaningful technology records.
**Atomicity:** Queues, tech context and route-specific ordering are one research decision family with selection/non-overwrite proof; approximately 10–25 counted selection lines. Group/record subdivisions would fragment that migration reference.
**Out of scope:** Other groups and interactive tick indexes.
**Implementation packet:** Fold tech prerequisites/why-notes into accessible steps/details; keep Route I's effective opening separate from II/III. Preserve both distinct caravan-slot investments and Military/Provinces effect scopes, blocked-node fallbacks, and modern Harmony distinctions.
**Files and responsibilities:** Research owns effective queues and folds; routes expose them. No test files are owned.
**Tests and proof:** Existing synthetic selection/order and supplied Item steps/gates/details protect site behavior. CONTENT REVIEW maps every technology, checks the effective opening versus II/III and inspects capacity/effect distinctions; no technology names/order, investment constants or queue snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; a unique tech record cannot be excluded as mere machinery.
**Review mandate:** No overwritten common opening, obsolete faction-Harmony chores or conflated caravan capacity/master/cargo requirements.

#### Package `alith-settlements` — Commit 11: Migrate Alith's settlement-development reference

**Status:** Integrated
**Wave:** 7
**Depends on:** ["alith-research"]
**Write scope:** ["content/alith-anar/data/buildings.json", "content/alith-anar/routes/route-1.md", "content/alith-anar/routes/route-2.md", "content/alith-anar/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Alith's settlement development`
**Work:** Complete nine settlement roles and their intended route subsets.
**Atomicity:** Roles/gates and route subsets form one usable development reference with selected-page proof; approximately 10–25 counted selection lines. Individual construction queues are coverage within this family.
**Out of scope:** Other references and holdings/calculator state.
**Implementation packet:** Map complete role queues and related slot/tier script cautions; rename `builds` to `buildings`. Preserve Anlec construction control/readiness, frontier/temporary purpose, and faction-specific agent-centre distinctions.
**Files and responsibilities:** Buildings owns roles; route selections expose the intended subsets/order. No test files are owned.
**Tests and proof:** Existing selected-panel and supplied Item cases protect settlement binding and rendering. CONTENT REVIEW maps every role, verifies actual route subsets/order and complete construction/readiness gates, and inspects visible homes; no role counts, construction priorities or landmark constants.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; route ID/role drift or unsupported construction premise.
**Review mandate:** No universal build recipe, hidden role, assumed treaty construction right or borrowed Gardens of Morr system.

#### Package `zhao-settlements` — Commit 12: Migrate Zhao's settlement-development reference

**Status:** Integrated
**Wave:** 7
**Depends on:** ["zhao-research"]
**Write scope:** ["content/zhao-ming/data/buildings.json", "content/zhao-ming/routes/route-1.md", "content/zhao-ming/routes/route-2.md", "content/zhao-ming/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Zhao's settlement development`
**Work:** Complete settlement roles, effective Shang-Yang variants, and seven recruitment notes in their visible homes.
**Atomicity:** Development roles, their recruitment gates and differing capital priorities form one route-selected construction reference with variant/gate proof; approximately 10–25 counted selection lines. Splitting its related recruitment notes would leave the development advice incomplete.
**Out of scope:** Full army rosters, unrelated mechanics and calculator behavior.
**Implementation packet:** Flatten all three effective Shang overrides to distinct selected IDs while preserving meaningful base advice. Retain all nine role families, seven recruitment chain/capacity/substitution notes, scarce-slot cautions, and Embassy versus House of Secrets distinction; do not assert disputed income as confirmed.
**Files and responsibilities:** Buildings owns effective roles/recruitment details; three routes own subsets. No test files are owned.
**Tests and proof:** Existing scoped selection and supplied Item cases protect settlement pages. CONTENT REVIEW maps all roles/recruitment notes, checks each effective Shang variant and preserved base advice, and inspects actual gates/substitutions; no capital queues, role/note counts or landmark snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; new access evidence changing the strategy or meaningful unrepresented recruitment guidance.
**Review mandate:** No hidden redundant base role, conflated landmarks, universal simultaneous-chain demand or overwritten variant.

#### Package `alith-mechanics` — Commit 13: Migrate Alith's faction-workshop reference

**Status:** Integrated
**Wave:** 8
**Depends on:** ["alith-settlements"]
**Write scope:** ["content/alith-anar/data/mechanics.json", "content/alith-anar/routes/route-1.md", "content/alith-anar/routes/route-2.md", "content/alith-anar/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Alith's faction workshop`
**Work:** Complete six mechanics and their unique script-rendered operational guidance.
**Atomicity:** The lord's workshop references and related calculator explanations are one mechanic family with selected-workshop/flag proof; approximately 10–25 counted selection lines. Excluding controls must not separate their essential advice from the mechanic.
**Out of scope:** Calculators, saved marks/Patron ticks and new mechanics.
**Implementation packet:** Preserve shadow tools, marks, Hand, Influence, Patrons and rites. Fold method/deadline/reserve/seat/scope cautions from calculators/ledgers into relevant steps/details; keep Gold/Influence/Favour, ordinary actions/named wounds and optional marks/VCO separate. Select all six in archive order with concrete uncertain-interaction fallbacks.
**Files and responsibilities:** Mechanics holds the workshop and folds; routes expose it. No test files are owned.
**Tests and proof:** Existing workshop/Item rendering and flagged-selector cases protect supplied advice and confidence behavior. CONTENT REVIEW maps every mechanic and script-only caution, checks actual selections/source accuracy and inspects consequential flags; no mechanic counts, action-credit rules or prose snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; an excluded interaction contains unrepresented meaningful instructions.
**Review mandate:** No invented action credit, province ownership from a court seat, borrowed subsystem or stranded script prose.

#### Package `zhao-mechanics` — Commit 14: Migrate Zhao's faction-workshop reference

**Status:** Integrated
**Wave:** 8
**Depends on:** ["zhao-settlements"]
**Write scope:** ["content/zhao-ming/data/mechanics.json", "content/zhao-ming/routes/route-1.md", "content/zhao-ming/routes/route-2.md", "content/zhao-ming/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Zhao's faction workshop`
**Work:** Complete six mechanics with Compass records and unique Harmony/caravan planner guidance.
**Atomicity:** Workshop entries and related explanatory folds are one selected mechanic family with rendered/flag proof; approximately 10–25 counted selection lines. Numeric controls are excluded, not reasons to fragment the reference.
**Out of scope:** Forms, timers, numeric simulation, normal-army-as-caravan recruitment and other lords' systems.
**Implementation packet:** Preserve caravans/escorts/destinations, Compass, Harmony, alchemy, Ogres and governance. Fold all four Compass records and planner/calculator/ledger cautions: gross/cargo/credit distinctions, funded rotations/recovery, cooldown scope, net province changes and battle proximity. Select six mechanics in route order, qualify evidence and expose consequential uncertainty.
**Files and responsibilities:** Mechanics owns workshop guidance/folds; routes expose the family. No test files are owned.
**Tests and proof:** Existing workshop/Item and confidence/flag cases protect supplied-content behavior. CONTENT REVIEW maps all mechanics, Compass records and planner/calculator cautions, checks practical factual limits and inspects actual flags/citations; no Compass count, mechanic rules or prose snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unrepresentable guidance or a correction changing caravan/Harmony strategy.
**Review mandate:** No lost planner cautions, fictional timer/effect, obsolete faction balance or borrowed Iron Favour/Steel-and-Stone system.

#### Package `alith-armies` — Commit 15: Migrate Alith's complete army reference

**Status:** Integrated
**Wave:** 9
**Depends on:** ["alith-mechanics"]
**Write scope:** ["content/alith-anar/data/armies.json", "content/alith-anar/routes/route-1.md", "content/alith-anar/routes/route-2.md", "content/alith-anar/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Alith's complete army reference`
**Work:** Normalize and expose all fifteen templates as a complete progression/support reference.
**Atomicity:** One army family shares the full-column normalization and readiness/doctrine contract with roster/render proof; individual templates/variants are coverage rather than separate product outcomes. Approximately 10–25 counted selection lines; the substantial reference JSON/tests are excluded from counted code but remain a real review surface.
**Out of scope:** App roster logic, strategy redesign and simultaneous Legendary Lord clones.
**Implementation packet:** Use canonical route keys and five archive template IDs per route. Each displayed legendary column combines its actual `alith` characters and troop core; generic combines its characters with `genericUnits` when present, otherwise `units`. Keep genuinely shared troops in `units`, complete displayed variant cores, intentional 20/12 sizes, one legal commander, access/substitution/readiness notes and manual plans. Explain templates as alternatives/progression.
**Files and responsibilities:** Armies holds normalized templates; routes select five each in order. No test files are owned.
**Tests and proof:** Existing synthetic/fixture army tests protect supplied legendary/generic rows, full-column rendering and explicit absence, not game army legality. CONTENT REVIEW reconciles all fifteen actual templates against the archive: full troops/characters, differing generic cores, intended sizes/legal commanders, readiness/doctrine and visible selections. No roster-count/commander/unit snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; no legal archive-supported roster/fallback, a forcing size mismatch or strategy-changing access correction.
**Review mandate:** Full columns, actual generic troop substitutions, smaller home purpose, explicit alternatives and no character-only pilot mapping.

#### Package `zhao-armies` — Commit 16: Migrate Zhao's complete army reference

**Status:** Integrated
**Wave:** 9
**Depends on:** ["zhao-mechanics"]
**Write scope:** ["content/zhao-ming/data/armies.json", "content/zhao-ming/routes/route-1.md", "content/zhao-ming/routes/route-2.md", "content/zhao-ming/routes/route-3.md"]
**Provisional commit:** `feat(content): migrate Zhao's complete army reference`
**Work:** Normalize and expose fifteen field/support/home templates with complete applicable columns.
**Atomicity:** One progression/support family and normalization contract with full-roster/render proof; per-company or per-variant commits add inventory noise. Approximately 10–25 counted selection lines; large reference data/tests excluded, not ignored in review.
**Out of scope:** Caravan recruitment UI, new unit availability logic and app changes.
**Implementation packet:** Normalize actual `zhao`/generic characters plus applicable troops, preserve 20-slot field and 12-slot home forces, gates/substitutions/economic readiness/notes/manual doctrine. The home `zhao` arrays contain Generals: encode genuinely generic-only forces with explicit absent legendary columns instead of falsely labelling a General as Zhao. Preserve unique-lord alternatives and field-versus-convoy roles.
**Files and responsibilities:** Armies owns full variants; routes expose five each. No test files are owned.
**Tests and proof:** Existing fixture army cases protect supplied columns/rows and explicit absent-column rendering. CONTENT REVIEW reconciles all fifteen templates, verifies complete troops/characters, intended sizes/legal commanders and true generic-only homes, and inspects gates/doctrine/visible variants. No roster-count/commander or home-force snapshots.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unsupported legal-force/access/size premise.
**Review mandate:** No missing troop core, padded home force, personal effect borrowed by a General or pre-victory reward budget.

#### Package `alith-route-one` — Commit 17: Complete Alith's conquest route

**Status:** Integrated
**Wave:** 10
**Depends on:** ["alith-armies"]
**Write scope:** ["content/alith-anar/routes/route-1.md"]
**Provisional commit:** `feat(content): complete Alith's conquest route`
**Work:** Full Route I plan, policies, summaries and both continuations using integrated references/conditions.
**Atomicity:** Chronology, reference-use advice, retention policies and continuations jointly define one usable route with PlanView/link proof. Splitting phases or transition paragraphs fragments that migration outcome. Approximately 15–40 counted frontmatter/phase lines; Markdown/tests excluded.
**Out of scope:** Other route bodies, new checks outside the established contract and dataset changes.
**Implementation packet:** Apply Authorship rules to all eight sections. Preserve all phase actions/aims/checkpoints, city guidance, type/priorities/recommendation/use notes, Naggarond elimination versus retained qualifying cities, and funded recovery. Keep checked claims/flags, five summaries and both transition slots; remove only this route's partial notices/genuine operational gaps. Preserve established identity and selections. Inspect outgoing links to available frozen-base Openings or the established route-top fallback, not a sibling's final plan.
**Files and responsibilities:** Route file owns complete strategy/policies/continuations. No test files are owned.
**Tests and proof:** Existing plan/section/phase and same-lord transition cases protect supplied content, real anchors and fallback behavior. Route-local CONTENT REVIEW maps every action/aim/checkpoint/use note/target/summary/continuation, checks strategy and citations, and inspects this route's actual sections/links/gaps; no full-phase, target or route-prose assertions. Partial destinations remain explicitly partial; aggregate reconciliation and final destination proof belong to serial post-integration validation.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; source-supported requirements contradict the archive strategy materially.
**Review mandate:** End-to-end geography/economy/readiness coherence and full route coverage, not merely eight headings/counts.
- [x] All eight route sections completed with archive coverage (actions/aims/checkpoints/city guidance/use notes); five phase summaries; Naggarond elimination vs retained qualifying cities and funded recovery; both transition slots present with anchors resolving to frozen-base Openings.
- [x] Established identity/objective/reward/VCO rows and all panelOrder selections byte-preserved; checked claims retained, only the route's operational partial notices removed.
- [x] Worker PlanView/VNode probe: no CONTENT GAP, both transition anchors resolve, panelOrder exact; gates green (214/214). Fresh reviewer 17 (4848e7e9) Accept, no findings at any tier; Jev suitable .99 / review .78. Aggregate whole-guide destination reconciliation remains serial post-integration close-out.

#### Package `zhao-route-one` — Commit 18: Complete Zhao's trade route

**Status:** Integrated
**Wave:** 10
**Depends on:** ["zhao-armies"]
**Write scope:** ["content/zhao-ming/routes/route-1.md"]
**Provisional commit:** `feat(content): complete Zhao's trade route`
**Work:** Full commercial plan, policies, summaries and continuations.
**Atomicity:** Income, funded rotations, capital timing, defence and continuation retuning share one coherent route contract with plan/link proof; approximately 15–40 counted frontmatter lines. Paragraph/phase splits add no sensible migration seam.
**Out of scope:** Other routes, dataset changes and interactive trade calculators.
**Implementation packet:** Complete eight sections and five summaries; preserve all phase/use guidance and trade-specific variants, four separate bottlenecks, gross/net/cargo/treasury distinctions, Embassy timing and rewards only after victory. Retain contract/shared flags, established identity/selections and both transition slots. Remove only this route's partial notices/genuine operational gaps; inspect available frozen-base destination Openings or route-top fallback without requiring sibling final plans.
**Files and responsibilities:** Route owns full strategy/policies/continuations. No test files are owned.
**Tests and proof:** Existing plan/panel/phase and transition cases protect supplied selections, content rendering and same-lord anchor/fallback behavior. Route-local CONTENT REVIEW maps every phase/use note/policy/summary/continuation, checks actual commercial strategy/variants/citations and inspects this route's gaps/links; no trade-condition, income, full-phase or prose snapshots. Report partial destination state honestly; aggregate reconciliation and final destination proof are serial post-integration obligations.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; a strategy-changing income/caravan/landmark correction.
**Review mandate:** Complete usable commercial sequence, funding/readiness and factual limits rather than checked-heading coverage alone.
- [x] All eight sections and five phase summaries completed with archive coverage; four separate bottlenecks, gross/net/cargo/treasury distinctions, Embassy timing and rewards-only-after-victory all in visible homes.
- [x] Established identity/objective/reward/VCO rows and all panelOrder selections byte-preserved; checked claims retained, only the route's operational partial notices removed; 50+ worker probe checks incl. no CONTENT GAP and both transition anchors resolving to sibling Opening anchors.
- [x] Gates green (214/214); fresh reviewer 18 (c4530660) Accept, no findings at any tier; Jev suitable .99 / review .83. shared.md stale Opening sentence deferred to close-out whole-guide reconciliation; aggregate destination reconciliation remains serial post-integration.

#### Package `alith-route-two` — Commit 19: Complete Alith's relic-search route

**Status:** Integrated
**Wave:** 10
**Depends on:** ["alith-armies"]
**Write scope:** ["content/alith-anar/routes/route-2.md"]
**Provisional commit:** `feat(content): complete Alith's relic-search route`
**Work:** Full expedition route with candidate advice, policies, summaries and both continuations.
**Atomicity:** Search/scouting, staging/recovery, uncertain-credit fallback and continuation reuse form one complete route with plan/link proof; approximately 15–40 counted frontmatter lines. Candidate/phase records are coverage within it.
**Out of scope:** Other route edits and changes to pinned conditions/reference data.
**Implementation packet:** Complete eight sections/five summaries and all route-use/priority guidance, including eight candidate records and the distinct hunt queue. Preserve provisional quota/interaction limits without inventing an algorithm. Keep established identity/selections/flags and both transition slots; remove only this route's partial notices/genuine operational gaps. Inspect its outgoing links to available frozen-base Openings or fallback; do not require Route I's final body or incoming link.
**Files and responsibilities:** Route owns search chronology/policies/continuations. No test files are owned.
**Tests and proof:** Existing plan/flag/selection and same-lord transition cases protect supplied-content behavior. Route-local CONTENT REVIEW maps full search/candidate/phase/use/summary/continuation advice, checks actual hunt priorities and uncertainty, and inspects its citations/outgoing links/gaps; no candidate, queue or full-phase constants. Destination presence is not completed guidance. The serial coordinator checks incoming links and all final destinations after all route results integrate.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; materially changed search premise.
**Review mandate:** Candidate advice is not eight required conquests, independent queue/use notes survive, and uncertainty remains actionable.
- [x] All eight sections and five phase summaries completed; eight candidate records with advice; `hunt-route-2` linked not restated; provisional quota/interaction limits preserved without an invented algorithm; both transition slots present with anchors resolving to frozen-base Openings.
- [x] Reviewer 19 (a79e79e2) MEDIUM (Late-phase southern resolution had no body home) delegated as mandatory correction: same worker added the archive-faithful "Resolve the southern candidates" Late block (transport squashed to d79a16ef, tree byte-identical); bounded re-review: MEDIUM cleared, zero regression, original Accept stands.
- [x] Established identity/selections/flags byte-preserved; gates green (214/214); Jev suitable .98. Aggregate destination reconciliation remains serial close-out.

#### Package `zhao-route-two` — Commit 20: Complete Zhao's alchemy-expedition route

**Status:** Integrated
**Wave:** 10
**Depends on:** ["zhao-armies"]
**Write scope:** ["content/zhao-ming/routes/route-2.md"]
**Provisional commit:** `feat(content): complete Zhao's alchemy-expedition route`
**Work:** Full fixed-site expedition, policies, summaries and continuations.
**Atomicity:** Theatre operations, replacement/staging choices, target advice and reward-tradeoff continuations form one usable expedition with plan/link proof; approximately 15–40 counted frontmatter lines. Sites/phase records are not separate product changes.
**Out of scope:** Other route edits, pinned condition changes and army/mechanic rework.
**Implementation packet:** Complete eight sections/five summaries, all five site records, full phase/use guidance and independent capital/skill priorities. Preserve qualifying action/current-owner checks and post-victory corruption/tool limits. Retain established identity/selections/flags and both transition slots; remove only this route's partial notices/genuine operational gaps. Inspect its outgoing links to available frozen-base Openings or fallback, without requiring Route I's final body or incoming transition.
**Files and responsibilities:** Route owns strategy/site advice/policies/continuations. No test files are owned.
**Tests and proof:** Existing supplied plan/panel/phase and transition cases protect rendering and same-lord anchor/fallback behavior. Route-local CONTENT REVIEW maps all site/theatre/phase/use/summary/continuation advice, checks actual variants/strategy/evidence and inspects its citations/links/gaps; no site/target sets or full-phase snapshots. Incoming links and all final destinations are checked by the serial coordinator after all route results integrate.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; a strategy-changing action/geography conflict.
**Review mandate:** No lost target-theatre/recovery guidance, invented relic search or premature reward spending.
- [x] All eight sections and five phase summaries completed; five site records (raze-or-conquer targets) and all phase/use guidance in visible homes; independent capital/skill priorities with common research selections linked (not restated); qualifying action/current-owner checks and post-victory corruption/tool limits retained.
- [x] Established identity/selections/flags and the five `raze-or-conquer-<site>` VCO rows byte-preserved; both transition slots present with anchors resolving to frozen-base Openings.
- [x] Gates green (214/214); fresh reviewer 20 (13da754f) Accept, no findings at any tier (brief explicitly checked the thin-phase-home class); Jev suitable .98 / review .80. Aggregate destination reconciliation remains serial close-out.

#### Package `alith-route-three` — Commit 21: Complete Alith's vengeance route

**Status:** Integrated
**Wave:** 10
**Depends on:** ["alith-armies"]
**Write scope:** ["content/alith-anar/routes/route-3.md"]
**Provisional commit:** `feat(content): complete Alith's vengeance route`
**Work:** Full coordinated vengeance route; its serial integration closes Alith's plan coverage.
**Atomicity:** Landmark growth, ordinary agent programme, six wound hunts and final-window/continuation advice form one usable route with full-plan/link proof; approximately 15–40 counted frontmatter lines. Route-local checks accompany this outcome; aggregate completion proof remains serial validation, not a separate test-only package.
**Out of scope:** Other content owners and feature-level documentation/publication.
**Implementation packet:** Complete eight sections/five summaries, all named-target advice, phase/use notes and both continuations. Preserve Anlec/action/wound distinctions and conservative persistence fallback, established identity/selections/flags and transition slots. Remove only this route's partial notices/genuine operational gaps; inspect outgoing links to available frozen-base Openings or fallback. Report this route's destinations/exclusions, not completed sibling plans or whole-guide coverage; do not edit the ledger.
**Files and responsibilities:** Route owns the complete coordinated plan and reports route-local coverage to the coordinator. No test files are owned.
**Tests and proof:** Existing plan/phase/transition and confidence cases protect supplied behavior. Route-local CONTENT REVIEW maps full vengeance/target/phase/use/summary/continuation advice, checks strategy/condition separation and inspects this route's sections/citations/outgoing links/selected variants/flags; no target sets, route counts or full-phase snapshots. The serial coordinator reconciles all Alith material and actual final Opening destinations after all route results integrate.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; owned meaningful Alith route material without a visible home or a strategy-changing wound/action correction. Expected sibling incompleteness on the frozen base is not a blocker.
**Review mandate:** Complete chronology/targets/condition separation and route-local coverage report; no missing continuation, hidden consequential uncertainty or premature whole-guide proof claim.
- [x] All eight sections and five phase summaries completed with full archive coverage; all named-target advice, phase/use notes and both continuations (III→I, III→II) in visible homes with anchors resolving on the candidate base.
- [x] Anlec/action/wound distinctions and conservative persistence fallback preserved (linked, not restated); route-III hand/marks swap linked; established identity/selections/flags byte-preserved; exactly 5 operational gap markers + Opening PARTIAL notice removed, checked claims retained.
- [x] Gates green (214/214); fresh reviewer 21 (f370b26a) Accept, no findings at any tier; Jev suitable .98 / review .79. Alith plan coverage now complete; whole-guide destination proof remains serial close-out.

#### Package `zhao-route-three` — Commit 22: Complete Zhao's western-realm route

**Status:** Integrated
**Wave:** 10
**Depends on:** ["zhao-armies"]
**Write scope:** ["content/zhao-ming/routes/route-3.md"]
**Provisional commit:** `feat(content): complete Zhao's western-realm route`
**Work:** Full corridor-conquest route; its serial integration closes Zhao's plan coverage.
**Atomicity:** Province control, faction elimination, replacement/home defence and continuation reuse form one complete route with full-plan/link proof; approximately 15–40 counted frontmatter lines. Route-local proof is intrinsic; aggregate completion remains serial validation, not another implementation outcome.
**Out of scope:** Other content owners, new state and feature-level close-out/Git operations.
**Implementation packet:** Complete eight sections/five summaries and all four province/three faction records plus phase/use advice and both continuations. Preserve independent skill/capital priorities, control/elimination distinctions and post-victory capacity/tariff limits, established identity/selections/flags and transition slots. Remove only this route's partial notices/genuine operational gaps; inspect outgoing links to available frozen-base Openings or fallback. Report this route's coverage/exclusions, not completed siblings or whole-guide coverage.
**Files and responsibilities:** Route owns strategy/target/policy/continuation content and reports route-local coverage to the coordinator. No test files are owned.
**Tests and proof:** Existing plan/panel/phase/transition and confidence cases protect supplied behavior. Route-local CONTENT REVIEW maps full province/faction/phase/use/summary/continuation advice and inspects this route's sections/citations/outgoing links/variants/flags. The serial coordinator reconciles all Zhao material and final destinations after all route results integrate; Final validation retains six-route and thirty-template manual coverage. Automated tests do not pin those corpus counts or target/phase sets.
**Validation:** Common package gate; no new test cases or assets.
**Stop conditions:** Common stops; unrepresented owned meaningful Zhao route material or a correction changing corridor strategy. Expected sibling incompleteness on the frozen base is not a blocker.
**Review mandate:** Whole-province control and faction elimination are not friendship, one town or a wounded lord; all owned meaningful guidance remains visible without a premature whole-guide proof claim.
- [x] All eight sections and five phase summaries completed with full archive coverage; all four province/three faction records, phase/use advice and both continuations (III→I, III→II) in visible homes with anchors resolving on the candidate base.
- [x] Independent skill/capital priorities, control-versus-elimination distinctions and post-victory capacity/tariff limits preserved; established identity/selections/flags byte-preserved; only this route's operational partial notices removed, checked claims retained.
- [x] Gates green (214/214); fresh reviewer 22 (f518ad19) Accept, no findings at any tier; Jev suitable .99 / review .83. All 22 packages Integrated; whole-guide destination proof, aggregate reconciliation and browser validation remain serial close-out.

## Discoveries and replanning

- The developer rejected the unreviewed per-record graph before execution and authorized this clean migration-scale replacement. No integrated history/publication evidence exists to preserve from it.
- Publication prerequisite: the developer separately approved only a genuine PR template; the coordinator created `.github/pull_request_template.md` without CI/app/Git changes. Its existence resolves provisional classification, not committed execution authority.
- Verified scout corrections: actual `alith`/`zhao` character fields plus troop cores; real localisation-title attribution; transition registry slots depend on `gaps`; shared-only uncertainty is not flagged. Current source, not older pilot/scout shortcuts, informs the contracts above.
- Focused registration reconciliation also found the global Elspeth callout loop in `test/components.test.ts`; Commit 1 owns its accurate scoping with every Elspeth assertion retained.
- The developer's functional-proof clarification removes the two proposed migration suites from every package scope. Existing functional coverage is reused; Commit 1 owns only the three necessary pilot adaptations and the selected-card citation-resolution gap. Manual CONTENT REVIEW/mapping retains every migration/content-accuracy obligation. Package outcomes, IDs, dependencies, waves and publication boundary remain unchanged.
- After the original graph was independently reviewed and accepted but before commitment or execution, the developer approved drafting this bounded concurrency revision. Primary source inspection supports placing all six route outcomes in Wave 10: distinct owned files, integrated reference/condition prerequisites, and runtime-derived destination anchors/fallbacks. The four later-route edges were proof-order constraints, not campaign prerequisites; each now depends on its lord's complete army/reference chain. Aggregate mapping/transition/flag/selection proof moves to serial post-integration validation, while route-local CONTENT REVIEW and every integrated-prefix gate remain. The 22 outcomes, IDs, serial order, exact scopes, Planned statuses, first sixteen packages and one PR/publication boundary are unchanged. This revised draft requires fresh complete independent plan review and developer acceptance before commitment or execution.
- Registration coverage — Alith: archive identity/setup/version/date map to `guide.json` and `shared.md`, with installed patch/check date unverified and the archive-reported VCO value qualified. The archive crest symbol maps to `crest.svg` and the existing header; all 42 source records retain their IDs/titles/URLs/order/original annotations in `data/sources.json`, explicitly qualified as archival. Three route labels map to strategic subtitles with null official titles, visible partial Openings, genuine gaps and empty selections. Shared/reference/condition/operational material remains assigned to its later packages; only browser-local state and interaction machinery are excluded, not their unique guidance. No archive discrepancy or model limitation was established by registration.
- Registration coverage — Zhao: archive identity/setup/date/version map to `guide.json` and `shared.md`, with installed patch/check date unverified and the archive version qualified. The extracted crest maps to `crest.svg` and the header. All 33 source identities/URLs/order/full annotations map to `data/sources.json` as unchecked archive leads. Three route labels map to ordered strategic subtitles with null official titles; each partial Opening carries discoverable title-attribution uncertainty, and all plans/reference groups retain honest gap/empty states. Calculator/checkbox/notes/settings state is excluded; its unique guidance remains assigned to the shared, reference, VCO and complete-route packages. No discrepancy, model limitation or extra test ownership was established by registration.
- VCO coverage — Alith: all three published objective/reward sets map to route frontmatter and 12 semantic VCO rows. Route I separates `destroy-naggarond-faction` and `control-six-naggaroth-cities`; Route II separates `amulet-search-credit` from the explicitly non-guaranteed historical `seven-of-eight-region-proxy`; Route III has `construct-black-citadel-anlec`, `assassination-successes`, and six `wound-<lord>` rows. The author text names eight search candidates without a quota; the later search-route package owns their full location advice. Checks dated 2026-10-06 map to scoped `vco`, `vco-script`, `vco-names`, `vco-story` and added `vco-effects` notes. The public repository snapshot is historical v5.16.0 (2024-02-29), not the archive-reported 2026 build or installed mod. Official titles remain null because applicable live titles are unresolved; each route carries discoverable title/manual-ledger caveats. The author spelling `Har Gnaeth` is documented against the archive/historical `Har Ganeth` mapping. Historical Growth is province-scoped; current action/control/timing/wound persistence/reward grants remain actionable in-campaign checks. No strategy-changing conflict was established; operational chronology and non-VCO evidence remain with later owners.
- VCO coverage — Zhao: the three title/objective/reward sets map to route frontmatter and 16 semantic VCO rows (4/5/7). Route I separates `gross-income-25000`, `caravan-runs-9`, `goods-traded-13140`, `great-embassy-warpstone-desert`; Route II has five distinct `raze-or-conquer-<site>` rows; Route III separates four `control-province-<province>` rows and three `destroy-faction-<faction>` rows. Scoped 2026-10-06 checks cite author IE wording plus historical v5.16.0 missions/localization/caravan counters, with a new `vco-listener-general` source note. `vcoTitle` values are The Silver Tongue, All That Glitters Is Not Gold, Don't Tread on Ming; published wording is not live-installed certification. The author IE Route III faction list omits its predicate, so faction destruction remains explicitly historical/in-campaign qualified. Black Fortress's historical scripted dummy is contextual evidence, excluded as a seventeenth independent condition unless a live panel proves it. All 16 rows and six live-check callouts are discoverable flags with tests/fallbacks. Great Embassy is distinct from the economic House of Secrets; gross income, completed journeys and goods are independent, and credits/ownership/actions/grants remain unverified live. IE rather than different RoC location lists is migrated. No strategy-changing conflict was established; later packages own operational sequences and remaining guidance.
- Shared coverage — Alith: archive `smart`, `equipment`, `access`, `administration` map to `shared.md` sections Fight for the preview, Equip the role, Build the army you can recruit, Keep the next war affordable, plus the end-of-turn routine. All role/detail advice remains, including Shadow-walkers versus paid Warriors, optional naval units, free/paid lord boundaries, Elven Gardens versus teleportation, actual added upkeep, Control/prosperity and second-hub reasoning. Script budget/payback, Influence reserve/currency separation, global research queue/gate fallback, holdings labels and Hand-near-Alith safeguards have visible shared homes; exact tech/build/army/mechanic identities and route-specific chronology remain assigned to later family owners. Unsupported calculators/holdings/target-board/settings/saved notes are excluded as app machinery only after retaining their planning guidance. Route I's Opening preserves its title flag and adds four discoverable source-qualified live checks for Smart Autoresolve, roster access, budget/building assumptions and Hand location. Later route owners must retain these companions. No new source fetch or date/version advancement; source annotations remain archival, budgets indicative and live behavior untested. Shared is complete for common fundamentals, not a full route or campaign benchmark.
- Shared coverage — Zhao: archive `smart`, `equipment`, `access` map to shared roster/opening, Smart Autoresolve/manual fallback and equipment sections. Script formation/matchup/fire-lane/recovery advice, recurring upkeep/reserve/payback/gross-net-cargo distinctions and operation preparation/end-turn routine map to the shared budget and routine sections. Provincial building Harmony is distinct from battle proximity, not equal unit counts. House of Secrets' archive-reported 500-versus-300 disagreement is retained with actual-preview authority and neither value budgeted as guaranteed income. Route I preserves its historical and two existing live-check callouts and adds two discoverable live checks for Harmony and Smart Autoresolve; later route owners must retain them. Detailed recruitment/hero gates, seven recruitment notes, army templates, research/skill queues, Compass/caravan/Harmony operations and specific settlement/landmark plans remain named later family owners. Calculator/journal/checkbox/holdings/settings controls are excluded as interfaces after retaining unique decision guidance, not imported as player state. Sources/date/version unchanged and archive-qualified; no live behavior or benchmark claim. Access/income guidance carries current-screen fallbacks; final reconciliation must also inspect the owning recruitment/settlement/mechanics families' consequential flag visibility.
- Skills coverage — Alith: all eight archive skill builds map to eight `data/skills.json` Item records (`alith`, `princess`, `field-noble`, `agent-noble`, `shadow-caster`, `mist-mage`, `life-mage`, `light-mage`), six steps each (details 6/6/4/6/4/5/3/3), each carrying one resolving `verify-in-campaign` flag plus `src` so `getFlaggedEntries` discovers exactly eight deduped flags. All three routes select the full eight in archive order. Gates remain rank/prerequisite qualifiers only. Script role/effect/automatic-unlock cautions (tides/`alith-skill`/`noble-skill`/`mist-skill` automatic mounts, Sea Helm evidence) and the embedded-versus-detached split (`field-noble` versus `agent-noble`) are preserved under `verify-in-campaign`; live names/gates/scopes stay one-screen player checks, not campaign guarantees. No test files owned; existing seams (214/214) plus an ephemeral loader/panel/flag proof cover the data-only change.
- Skills coverage — Zhao: the seven base Zhao records and their route overrides map to nine `data/skills.json` records: three effective route-owned variants (`zhao-route-1`, `zhao-route-2`, `zhao-route-3`) in archive step order plus six common supporting builds (`celestial-general`, `alchemist`, `gate-master`, `caravan-master`, `astromancer`, `yin-shugengan`). Each route selects its own variant plus all six supports in archive order. Flags: the seven flat entries dedupe to Route I while the three route-owned variants each point at their own route (lord total 33 flags). Gates carry the house-style `Archive-reported gate: …; verify in the live tree` qualification, including the corrected Route I `Master of Metal: rank 9` gate — the original result omitted it and falsely claimed the Route I override lacked one; the read-only supplement exposed the mismatch and the same worker corrected it under this package (one gate field + one truthful reconciliation rewrite, no scope change), with the fresh reviewer independently re-auditing every base and override gate against the raw archive HTML and finding no further omission. Branch alternatives, Caravan Master rank ladder (10/11/15/16), Gate Master self-specialisation rank 12, Leader of Men rank 8, automatic-unlock cautions and personal-versus-own-army-versus-support distinctions (Celestial General inherits none of Zhao's personal effects) are preserved. No test files owned; existing seams (214/214) plus loader/flag probes cover the data-only change.
- Research coverage — Alith: four base groups (`opening`, `hunt`, `agents`, `industry`) plus the archive Route II `researchOverrides.hunt` as the distinct route-owned `hunt-route-2` (common `hunt` preserved and selected for I/III; non-overwrite proven by per-route panel probes). All twenty technology records' unique name/prerequisite/why guidance fold into selected steps/details; tracker `checkId` indexes and the duplicate all-tech index excluded only after guidance folded. Selections in archive order: I `opening, hunt, industry, agents`; II `opening, hunt-route-2, industry, agents`; III `opening, agents, hunt, industry`. Five deduped research flags (four Route I flat + `hunt-route-2` at Route II) keep uncertainty discoverable. Aislinn prerequisites explicitly excluded; per-entry "Archive scope and live check" detail carries the archival/verify-in-campaign posture. No test files owned; 214/214 plus loader/flag probes cover the data-only change.
- Research coverage — Zhao: four groups (`opening`, `road`, `arsenal`, `realm`) plus Route I's archive `researchOverrides.opening` as the distinct route-owned `opening-route-1` (missile-first Moon Reflecting lead) while common melee-first `opening` stays selected for II/III; non-overwrite proven by per-route panel probes. All thirty technology records' prerequisite/why guidance fold into named step/detail homes (verified item-by-item against the archive techs), the two distinct caravan-slot investments, Military-versus-Provinces scopes, blocked-node fallbacks, provincial Harmony distinctions and effect-not-title cautions are preserved. Selections: all three routes `opening, road, arsenal, realm` with the variant on Route I; five deduped research flags keep uncertainty discoverable. Tick-index machinery excluded only after guidance folded. No test files owned; 214/214 plus loader/flag probes cover the data-only change.
- Settlements coverage — Alith: all nine archive `builds` roles map to nine `data/buildings.json` Items (archive key renamed `builds` → `buildings` per packet) with complete queues, slot cautions and tier gates; per-route subsets in exact archive order (I hub/income/resource/frontier/occupation, II +port/temporary, III +anlec/agents). Anlec construction control/readiness (tier-5 gate, Tor Anlec owner, alliance access ≠ construction right, patron seat separate) and agent-centre distinctions (Elven Gardens first Noble/Influence vs Elven Court capacity; field Noble vs agent Nobles) preserved; zero Gardens-of-Morr/teleport duplication (shared.md owns the comparison); Route III income funding note folded into `income`. Nine deduped buildings flags; lord total 47. No test files owned; 214/214 plus loader/flag probes cover the data-only change.
- Settlements coverage — Zhao: nine archive `builds` role families map to `data/buildings.json` Items with meaningful base advice preserved, plus all three archive `buildsOverrides.shang` flattened to distinct route-owned effective variants (non-overwrite byte-verified; variant-specific gates R1 House of Secrets + Embassy tier 5 / R2 House of Secrets + tier 3 / R3 House of Secrets only). Per-route subsets in archive order with the variant first on each route; eleven deduped buildings dataset flags. All seven recruitment records' chain/capacity/substitution guidance carried into visible role details; scarce-slot cautions and Embassy-versus-House-of-Secrets distinction retained with the disputed 500-versus-300 income left unconfirmed and consistent with shared.md. No test files owned; 214/214 plus loader/VNode probes cover the data-only change. shared.md's "later content owners" sentence is partially stale post-11/12 and is deferred to the close-out whole-guide reconciliation.
- Mechanics coverage — Alith: all six archive mechanics (`shadow`, `marks`, `hand`, `influence`, `patrons`, `rites`) map to `data/mechanics.json` Items with their script-rendered operational guidance; every excluded calculator/ledger control's unique caution (influence wallet/reserve, deadline desk travel estimate, target board note-only, patron ledger record-not-automation, victory-credit caveats, end-of-turn checks) folds into the owning mechanic. Gold/Influence/Favour, ordinary actions versus named wounds, and optional marks versus VCO credit stay distinct; seat≠province and seat≠Anlec construction right preserved; the three archive route-priority headlines carry into `patrons`. Selections in archive order (III swaps hand/mark). Six deduped mechanics flags; concrete uncertain-interaction fallbacks throughout. No test files owned; 214/214 plus loader/WorkshopView probes cover the data-only change.
- Mechanics coverage — Zhao: all six archive mechanics (`caravans`, `compass`, `harmony`, `alchemy`, `ogres`, `govern`) map to `data/mechanics.json` Items with all four Compass records (desert, lake, bastion, wrath) folded into the compass mechanic with distinct guidance. Every planner/calculator/ledger caution folds into its owning mechanic: gross/net/cargo/credit distinctions, funded rotations and recovery, cooldown scope, net province changes, battle proximity kept separate from provincial building Harmony; no fictional timer (realignment shown as display-driven, base timer modifiable), no obsolete faction balance, no Iron Favour/Steel-and-Stone borrowing; shared.md's upkeep/Harmony basics neither duplicated nor contradicted. Selections `caravans, compass, harmony, alchemy, ogres, govern` on all three routes per archive panelOrder; six deduped mechanics flags. No test files owned; 214/214 plus loader/flag probes cover the data-only change.
- Armies coverage — Alith: all fifteen archive army templates (five per route: early, mid, late, specialist, home) normalize to the app's army shape as one progression/support family. Each legendary column combines actual `alith` characters with its troop core; generic variants combine `generic` characters with `genericUnits` falling back to shared `units`; per-column sum equals the intentional 20/12 sizes with one legal commander per displayed roster; access/substitution/readiness notes and manual plans retained; templates framed as alternatives, home purpose explicit. Fifteen flagged army entries resolve through the existing renderer; no absent-column markers needed (no legend-less Alith template). No test files owned; 214/214 plus actual-corpus probe cover the data-only change.
- Armies coverage — Zhao: all fifteen archive army templates (five per route: early, mid, late, specialist, home) normalize with complete columns; 20-slot field and 12-slot home forces preserved with one legal commander each. Genuinely generic-only home forces carry explicit absent legendary columns (Celestial-General-led homes never mislabelled as Zhao), with an added honest "Generic-led local relief" note; kind-label `hero`→`character` serialization adaptation documented; Ogre units access-gated per archive. Gates/substitutions/economic readiness/manual doctrine and field-versus-convoy roles retained; no padded home force, no personal effect borrowed by a General, no pre-victory reward budget. No test files owned; 214/214 plus actual-corpus probes cover the data-only change.
- During delivery the coordinator records the completed block-to-visible-target/exclusion map, actual condition IDs, scoped factual discrepancies and disproved assumptions from worker reports. A material outcome/scope/order change requires fresh review; preserve integrated IDs and add reviewed replacement packages only then.

## Final validation

1. On the actual integrated implementation run `npm run lint:content`, `npm test`, `npx tsc --noEmit`, and `npm run build`. Confirm existing functional coverage and retained Elspeth protection; no new migration suites/assets or editorial/game-strategy snapshots. No planning-time production pass is claimed.
2. After all six Wave 10 route results integrate, the serial coordinator reconciles both whole-guide maps from the package reports and performs required manual CONTENT REVIEW against DESIGN §7 and concrete mapping evidence: embedded/script-only material, all fifty tech records, sixteen evidence notes, seven recruitment notes, four Compass records, additional targets, six complete routes and thirty complete templates. Reconcile every applicable roster's full columns, coherence/legal commander/size, gates and substitutions; check recommendations/strategy, source accuracy, ordinary `sources` and confidence citations/shared callouts, effective selections/variants, actual semantic objective IDs and unchanged archive hashes. Counts supplement, not replace, meaningful coverage; green functional gates are not content acceptance.
3. Build, then inspect over HTTP with `PORT=0 LEDGER_ROOT=<absolute isolated temporary test-store path> npm run serve`. Verify the isolated root before any runtime write action. This is existing setup, not a server/configuration change. Runtime proof is serial; stop and clean up only the test server/store after capturing evidence.
4. After all route results integrate, the serial coordinator inspects home, both default desks/context/comparison/flags, all six full plans/phase summaries, every selected reference group and all thirty templates' complete applicable roster columns, sources/long lists, twelve same-lord Opening destinations, and deep-link reload at desktop and laptop widths. Check I → II, I → III, II → I, II → III, III → I and III → II for each lord against the actual final Opening H2s; partial-base anchors or route-top fallback do not satisfy final destination proof. Verify preserved shared flags/selections/citations and both declared transition slots with present bodies, without false gap markers. Record hidden/clipped content or unavailable browser evidence as gaps; a genuine UI/model limit requires separate approval, not content truncation or app edits.
5. Only in the isolated ledger store, exercise new-guide objective display, start/open/block with another active campaign including Elspeth, separate planning/game-confirmed tracks and reload persistence. A pre-existing isolated campaign remains intact after new content loads; confidence does not set completion. Existing synthetic `createCampaign`/`itemsFor` cases protect ID-keyed state. HTTP proof selects objective IDs from supplied new-guide data without hardcoded condition/strategy expectations and verifies unchanged runtime wiring, never player files.
6. Fresh feature review covers the exact implementation range and complete accepted contract, including functional-test value and required manual content/coverage evidence without editorial snapshots or per-record padding. Publish/merge only after current close-out, final gates/evidence and live exact-head checks/approvals. Website evidence is not campaign simulation, live trigger verification or an autoresolve benchmark.

**Serial close-out progress (coordinator, 2026-10-07):** All 22 packages Integrated; §1 PASS at HEAD 04cd69f (serial lint 0, test 214/214, tsc 0, build 0; retained Elspeth protection, 52 references; no new suites/fixtures). §2 PASS: aggregate reconciliation 133/133 assertions from the real node loader dump against the archive guide-data (sources 43/34 in archive order incl. only the two documented added VCO notes; 8 sections × 6 routes; 30 army templates with 20/12 column sums and the documented absent-column convention; all 50 tech (Alith 20 + Zhao 30, per DESIGN §known-archive-structure), 8+8 evidence, 7 recruitment, 4 Compass, cities/candidates/sites/provinces/targets have visible corpus homes; VCO substance prose-mapped; claims honest). §3 PASS: isolated build served over HTTP, every content surface 200. §4 PASS: isolated LEDGER_ROOT full lifecycle (seed → start → open → block → restart reload → Elspeth intact; escape attempts 404). §5 PASS: 40/40 pages rendered at 1440+1280 (two desks, six full plans with all sections, all 30 template names across six armies pages, settlements/workshop reference groups), ledger UI shows both objective tracks, 12/12 deep-linked Opening signatures at both widths; screenshots retained in .pi/work/alith-zhao-migration/browser-closeout/. shared.md stale-prose reconciliation committed as 04cd69f. §6 PASS: fresh feature reviewer d8a54e88-3ca0-405e-a701-71245a9644d0 (mode feature, range a542f3d..04cd69f plus ledger note 40a6051, brief review-final-feature.md) terminal Accept — no CRITICAL/HIGH/MEDIUM/NITPICK; gates re-run green at final head; scope/atomicity/test-portfolio/architectural conformance/project fit all conform; remaining risk = live game behavior unverified by design. (The "40 tech" in the §2 sentence was a loose count, corrected to 50 per DESIGN; the 133/133 reconciliation assertions were unaffected.) §7 IN PROGRESS: PR publication (alith-zhao-content → main; merge separately approved at exact head).

## Documentation impact

Retain DESIGN and IMPLEMENTATION in their native directory. During delivery the coordinator records minimal progress and material discoveries; workers report them. Final reconciliation updates the narrowest implemented-state documentation and TODO through separately bounded coordinator/steward authority, not implementation packages. No BACKLOG/ADR change is planned. Preserve active order 7 as these two lords, F6 at order 8, and Malakai/Mother Ostankya at order 9. Reconcile the tracked final merge self-reference in the next ordinary documentation update after verified integration.
