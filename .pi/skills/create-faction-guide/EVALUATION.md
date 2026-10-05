# Skill evaluation cases

Authoring/maintenance notes, not a required runtime reference.
The target environment is Pi operating in `tww3-tracker` with repository read/write/command access and web research when available.

## Evidence boundary

Static validation and a serialization smoke test can establish that the skill's file paths, examples, and commands match this repository.
They do not establish improved guide quality, reliable natural skill activation, or better campaign/autoresolve results.
Behavioral comparisons require fresh sessions using the same model, harness, tool permissions, source access, and equivalent workspace state.
Do not call a self-review an A/B evaluation.

## Checks performed for this revision

- The installed Pi skill loader discovered exactly `create-faction-guide` under the project skill directory, with no diagnostics.
- Frontmatter/name/description limits, all 23 local Markdown links, five JSON examples, and whitespace checks passed.
- The examples were assembled into a synthetic three-route **in-memory** content tree and passed the actual repository lint and loader.
- The smoke test checked panel selection, both complete 20-slot army variants in VNode output, claim rendering/source IDs, transition targeting, and unchanged-versus-new objective-ID reconciliation.
- Negative examples for obsolete panel keys, missing selected entries, unsupported nested headings, and dangling sources were rejected by the actual lint.
- Repository gates passed: `npm run lint:content`, `npm test` (213 passing tests), `npx tsc --noEmit`, and `npm run build`.

These are static and deterministic contract checks, not a generated-guide trial.
Natural activation, paired skill execution, browser inspection, and live campaign/Smart Autoresolve evaluation were **not run**.
No guide content or player ledger state was changed.

## Discovery cases

| Request | Expected routing |
| --- | --- |
| “Add a researched Malakai VCO guide to this site.” | Load this skill; new-guide content workflow |
| “Migrate the Alith Anar HTML atlas into our guide framework.” | Load this skill; archive stays unchanged, Markdown/JSON output |
| “Give Route II a cheaper home guard and adjust its skill build.” | Load this skill; targeted strategy/content update |
| “Recheck this guide for the new patch and WH3 DLC units.” | Load this skill; bounded evidence revalidation |
| “Which lord skills support this route's expedition?” | Load this skill; advice only unless file edits requested |
| “Fix keyboard navigation in the route tabs.” | UI/debugging workflow, not guide authoring |
| “Create a standalone HTML dashboard for a different game.” | Do not route to this repository-specific skill |
| “Configure a Pi theme.” | Pi/theme workflow, not this skill |

Test realistic paraphrases and overlapping skills as well as these exact requests.
Measure missed activation and unwanted activation separately from artifact quality.

## Execution cases and acceptance checks

### New complete guide

Request a guide for a supported lord not yet present, under the repository defaults.

- Adds only the intended content subtree, the index entry, and any warranted content-test expectations; does not introduce a new HTML atlas or app-specific faction branches.
- Supplies the three independent routes and shared fundamentals, with registered headings, transitions, selected panels, and exact source/confidence attribution.
- Uses actual researched versions, not the Elspeth version/date or synthetic examples.
- Gives thematic army jobs, full displayed Legendary/generic rosters, correct slot totals, role-specific skills, tech/build gates, affordable infrastructure, and stopping rules.
- Passes the repository checks and reports actual browser/in-game evidence limits.

### Archive migration

Use an existing non-Elspeth archive containing old field names, HTML fragments, and localStorage code.

- Leaves the archive byte-identical.
- Maps old lord-specific army columns and `builds` keys to current fields without hiding shared troops.
- Preserves useful strategic material, attributes historical/generated evidence honestly, and researches consequential discrepancies.
- Does not copy legacy persistence code, promise implemented notes/search, or invent official route titles.

### Targeted route correction

Change one route's army/research priorities where other routes share a flat item.

- Creates/selects a variant rather than overwriting shared advice for unrelated routes.
- Updates dependent skills/builds/notes only where required by the approved change.
- Preserves route and unchanged objective IDs; leaves unrelated files and player ledgers untouched.
- Verifies both roster counts and panel visibility.

### Unavailable source or opaque trigger

Use an objective whose alliance test or search trigger cannot be verified from accessible evidence.

- Does not invent the trigger or mark mere publication as tested behavior.
- Keeps traceable evidence, uses `verify-in-campaign`, gives a representative observation and a safe fallback, and identifies the missing evidence.
- Asks the user only if the gap blocks a usable plan; otherwise delivers an honestly labelled draft.

### Ownership and mod boundary

A request changes DLC ownership or supplies a different Smart Autoresolve version.

- Checks older paid-DLC dependencies and faction access, not merely WH3 ownership.
- Supplies legal role substitutions and adjusts recruitment/skills/tech dependencies.
- Does not import vanilla ranged-bias assumptions or claim untested ability credit/win percentages.

### Objective identity change

A VCO update replaces one actual condition while a saved campaign has progress under the old ID.

- Preserves an ID for wording-only corrections, but does not reuse it for a different condition.
- Reports the new condition's compatibility impact.
- Never mutates the player's saved state or conflates guide confidence with campaign completion.

## Comparison procedure

Run representative cases without this skill, with the previous skill, and with the candidate when time and budget permit.
Use separate fresh sessions and equivalent workspaces; inspect actions and produced artifacts, not only final summaries.
Record case-level correctness, scope violations, omitted requirements, unresolved evidence, unnecessary actions, elapsed time, and token/cost data.
Reserve meaningfully different cases for a final check rather than repeatedly tuning to these examples.
A few successful smoke cases do not establish general effectiveness; report behavioral evaluation as not run when it has not been performed.
