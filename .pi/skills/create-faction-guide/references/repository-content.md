# Repository content contract

Read before writing guide files.
This reference describes the current content model; recheck the owning source if the schema changes.
All repository paths below are relative to the repository root.

## Authoritative files

| Question | Owner |
| --- | --- |
| Available commands and URL grammar | [README.md](../../../../README.md), [package.json](../../../../package.json) |
| Product defaults and guide purpose | [.wiki/CONCEPT.md](../../../../.wiki/CONCEPT.md) |
| Current architecture and content/state boundary | [.wiki/ARCHITECTURE.md](../../../../.wiki/ARCHITECTURE.md), [ADR-0002](../../../../.wiki/adr/0002-content-as-markdown-json.md) |
| Manifest, claims, datasets, and route fields | [app/content/types.ts](../../../../app/content/types.ts) |
| Accepted frontmatter syntax, headings, shapes, and cross-references | [app/content/lint.ts](../../../../app/content/lint.ts) |
| Markdown rendering and one-time content loading | [app/content/load.ts](../../../../app/content/load.ts) |
| Panel visibility, source resolution, and flagged claims | [app/content/query.ts](../../../../app/content/query.ts) |
| Army/item display anatomy | [app/components/deskPanel.ts](../../../../app/components/deskPanel.ts) |
| Page allocation and local tab behavior | [app/views/panels.ts](../../../../app/views/panels.ts) |
| Route sections, transitions, source panels, and objective display | [app/views/plan.ts](../../../../app/views/plan.ts) |
| Objective-ID reconciliation with saved progress | [app/ledger/logic.ts](../../../../app/ledger/logic.ts) |
| Filesystem content validation | [tools/content-lint.mjs](../../../../tools/content-lint.mjs) |

Read the types and relevant lint rules before creating a new guide.
For a targeted update, inspect the affected format and its renderer/selector rather than the whole app.
Documentation contains proposals and some template placeholders; executable behavior is authoritative.
The Elspeth guide demonstrates serialization, not a guarantee that its factual claims, gaps, or legacy prose are all correct.

## 1. File layout and manifests

```text
content/
├── index.json
└── <lord-slug>/
    ├── guide.json
    ├── shared.md
    ├── crest.svg                 # optional; only if guide.json names it
    ├── routes/
    │   ├── route-1.md
    │   ├── route-2.md
    │   └── route-3.md
    └── data/
        ├── armies.json
        ├── skills.json
        ├── research.json
        ├── buildings.json
        ├── mechanics.json
        ├── vco.json
        └── sources.json
```

`content/index.json` is `{ "lords": ["<lord-slug>", "<another-slug>"] }`.
Append a new unique slug without removing/reordering existing lords unless requested.
Use a stable lowercase hyphenated slug and the same value for `guide.json.id`.

The following examples are **synthetic serialization examples**, not researched game recommendations.
Replace identities, version placeholders, URLs, objectives, and all strategic text with actual researched content.

```json
{
  "id": "example-lord",
  "lord": "Example Lord",
  "faction": "Example Faction",
  "version": {
    "patch": "unverified",
    "vco": "unverified",
    "checked": "unverified"
  },
  "environment": "Normal / Normal · Smart Autoresolve · VCO · Immortal Empires",
  "routes": [
    { "id": "route-1", "file": "routes/route-1.md", "number": "I" },
    { "id": "route-2", "file": "routes/route-2.md", "number": "II" },
    { "id": "route-3", "file": "routes/route-3.md", "number": "III" }
  ],
  "shared": "shared.md",
  "datasets": ["armies", "skills", "research", "buildings", "mechanics", "vco", "sources"]
}
```

- Route order in the manifest determines navigation order and the default route.
  The supported display numerals are `I`, `II`, and `III`.
- `datasets` contains **names**, not filenames: `buildings`, not `builds` or `buildings.json`.
  Each name resolves to `data/<name>.json`.
- `shared` and route `file` paths are lord-directory-relative.
  Keep all paths inside that directory; never use absolute paths or `..` traversal.
- Every file under `content/` must be named by `index.json` or a guide manifest.
  Do not leave scratch exports, alternate drafts, unused images, source downloads, or README files there: the lint reports them as orphans.
- A complete guide normally supplies all six strategy datasets plus sources.
  The loader permits some missing datasets, but legal empty states are not evidence of comprehensive content.
- `crest` is optional and names an SVG inside the lord directory.
  If supplied, it must exist and contain an `<svg` start tag.
  Omit it when no suitable asset exists; do not expand guide research into an asset/design task.
- `version.patch`, `version.vco`, and `version.checked` are strings.
  Use the verified patch, a traceable mod release/build/commit, and the actual research date (`YYYY-MM-DD`) when known.
  A Workshop check date is not necessarily the installed mod version.
  If unresolved, use an explicit unverified label and explain the scope in source/shared notes.
  Do not advance the whole guide's checked date as though every section were revalidated after one local correction.

## 2. Shared fundamentals

`shared.md` is Markdown rendered on the reference desk.
It is not a route document and does not use the route heading registry.
Use it for advice that holds across the selected lord's routes: common opening constraints, ownership assumptions, core economy, basic army doctrine, universally useful unlocks, and evidence limits.
Keep it readable without swallowing the route-specific choices.

Claim callouts render here, but the current lint does **not** scan shared callout states/source IDs, and `getFlaggedEntries` does **not** include them.
Manually validate their syntax and sources.
Put important actionable uncertainties in an appropriate route callout or selected dataset entry as well, so they appear in the flagged review list.
Do not rely on unimplemented tracking or notes features mentioned in legacy shared prose.

## 3. Route frontmatter

Each route file starts with `---` frontmatter and then registered H2 sections.
Required fields:

- `id`: exactly the manifest's route ID.
- `number`: exactly its manifest numeral.
- `name`: guide-created thematic subtitle; a non-empty string.
- `vcoTitle`: exact official title if verified, otherwise `null`.
- `objective` and `reward`: each `{ text, state, src }` with one valid confidence state and a list of source IDs.

Optional fields include `interpretation`, `bottleneck`, `motto`, `transitions`, `phases`, `panelOrder`, and `gaps`.
`motto` and `transitions` are retained by the loader but currently unrendered; do not use them as the only home of player-facing guidance.
Use actual transition body sections for continuation plans.

```yaml
---
id: route-1
number: I
name: The Border Watch
vcoTitle: null
objective:
  text: "Placeholder: replace with the current route conditions."
  state: verify-in-campaign
  src: [vco-author]
reward:
  text: "Placeholder: replace with the reward and its verified scope."
  state: verify-in-campaign
  src: [vco-author]
interpretation: Hold a defensible core while the main host resolves the required threat.
bottleneck: A sustainable forward recovery base
phases:
  - { title: "Secure the departure base", note: "Leave only when income and homeland defence support the expedition." }
  - { title: "Resolve the target", note: "Check the mission before purchasing optional elite upgrades." }
panelOrder:
  armies: [field-host]
  skills: [commander-mobile]
  research: []
  buildings: []
  mechanics: []
gaps: []
---
```

The repository has a **custom YAML subset**, not a full YAML parser.
Prefer single-line quoted scalars, flow lists, one-level maps, and the existing flow-map list style.
Do not use block scalars (`|` or `>`), anchors, aliases, tags, inline comments after values, or arbitrary YAML constructs.
Quote values containing ambiguous punctuation; keep quoted strings on one line.
`phases` is an optional non-empty ordered list of `{ title, note }`; five phases fit the atlas's summary convention, but the schema does not require exactly five.
Do not replace a detailed route plan with those short phase notes.

### Panel visibility and variant scope

The only `panelOrder` keys are `armies`, `skills`, `research`, `buildings`, and `mechanics`.
Do **not** include `vco`, `sources`, `settlements`, or the old atlas key `builds`.

- `armies` IDs resolve within `armies[route.id]`.
- Other IDs resolve within the lord-wide flat dataset of that name.
- The listed order is the display order.
- Absent or empty lists yield empty panels, not an automatic display of every entry.
- Unlisted entries are not shown by these panels and are not gathered as dataset flags by the flagged selector.

For route-specific research/skill/building/mechanic variants, add distinct flat IDs such as `commander-mobile` and `commander-home`, then select the intended one in each route.
Share an entry only when its advice genuinely applies to every referencing route.
Give displayed entries distinct labels within their panel; render keys and reader navigation should not become ambiguous.

Current page allocation:

| Page | Data shown |
| --- | --- |
| Reference desk | Route overview, compact panel-entry index, shared fundamentals, version/flagged-claim information |
| Route plan | Objective/reward identity, objective rows, registered route sections, phases, transitions, and cited section notes |
| Armies & skills | Local tabs for armies, skills, and **research** |
| Settlements & economy | Buildings dataset |
| Faction workshop | Mechanics dataset |
| VCO ledger | Ordered VCO items and separate player progress state |
| Sources & settings | Source catalogue; appearance settings are currently deferred |
| Field notes | Currently a deferred empty state, not persistent notes |

If the allocation changes, follow the current views rather than inventing a content field to move material between pages.

## 4. Route body and claims

Use these four required headings in exactly this order:

```markdown
## Opening

## Early → Mid

## Mid → Late

## Victory push
```

Then normally include the optional headings `## Territory policy` and `## Diplomacy`, followed by a transition section for each other route:

```markdown
## Transition → route-2

## Transition → route-3
```

Transition suffixes may match another route's ID or `name`; prefer stable IDs.
The app derives the link to that route's actual opening section.
Do not hand-code legacy URLs or assume that the transition heading means the destination route has been completed.

Route-body rules:

- Begin immediately with a registered section; no H1 title or introductory paragraph before the first H2.
- Only registered H2 headings are accepted; **H3–H6 are also invalid**, not just extra H2s.
- Use **bold labels**, numbered steps, bullets, or tables for subsections.
- Keep required sections in order and all headings unique.
- Use the exact Unicode arrow `→`, not `->` or `Early/Mid`.
- A full guide should explain territory and diplomacy even though the schema makes those sections optional.

Declare genuinely omitted sections in `gaps`, with exact registry/transition titles, and explain what is missing in the delivery report.
The current required-heading order check does not skip a missing intermediate required section when later ones are present; include all four core headings for ordinary guide authoring instead of trying to use `gaps` as an arbitrary hole in the sequence.
Remove a gap declaration when its section is written.
Some migrated content retains stale transition gaps despite present sections; do not copy that inconsistency into new work.

A route claim uses a block callout:

```markdown
::claim verify-in-campaign src=vco-author,roster-data
The published description does not establish which alliance type credits this objective. Check the live mission after the first qualifying treaty before committing to the whole diplomatic plan.
::
```

- Use one exact confidence state per callout and a closing `::` on its own line.
- Source IDs in callout syntax can contain letters, numbers, underscores, and hyphens; separate multiple IDs with commas **without spaces**.
- Do not nest callouts or put section headings inside them.
- A section's source/verification panel is derived from its callout citations.
  A generic bibliography entry alone does not attribute the section's claims.
- Markdown supports normal text, lists, links, tables, and the custom claim blocks.
  Raw HTML is not enabled by the current `markdown-it` setup; do not migrate HTML fragments as if they will render.

## 5. Structured datasets

### Armies: route → entry ID → army

Required army fields are `label`, `name`, `units`, `legendary`, `generic`, `notes`, `plan`, `size`, and `sources`.
Optional fields are `supportName`, `context`, `state`, and `src`.

Each unit row is `{ n, name, role, kind }`.
Each note/plan row is a two-string pair `[title, body]`.
`plan` is the manual-battle doctrine; `notes` is the place for recruitment gates, substitutions, core/theme choices, and recovery/autoresolve cautions.

**Rendering caveat:** the current army component displays only `legendary` and `generic` as roster columns.
It does not render the shared `units` list or add it to either column.
The Elspeth migration retains a legacy shared-units/character-columns split; copying that split into a new guide would hide the troops from the detailed army view.

For new or revised templates, keep `units` as the shared troop core and serialize each applicable displayed column as the **complete army**: shared troops plus its commander, heroes, and any variant-specific troops.
Explain variant substitutions in `notes`.
If the two cores differ, record only their genuinely shared core in `units` and spell out the differences in the complete columns.
Do not add together all three arrays when counting slots.

```json
{
  "route-1": {
    "field-host": {
      "label": "Main host",
      "name": "The border expedition",
      "supportName": "Repeatable relief company",
      "units": [
        { "n": 16, "name": "Line infantry", "role": "Hold the frontage", "kind": "line" },
        { "n": 2, "name": "Missile infantry", "role": "Concentrate fire", "kind": "ranged" }
      ],
      "legendary": [
        { "n": 16, "name": "Line infantry", "role": "Hold the frontage", "kind": "line" },
        { "n": 2, "name": "Missile infantry", "role": "Concentrate fire", "kind": "ranged" },
        { "n": 1, "name": "Example Lord", "role": "Command", "kind": "character" },
        { "n": 1, "name": "Embedded hero", "role": "Army support", "kind": "character" }
      ],
      "generic": [
        { "n": 16, "name": "Line infantry", "role": "Hold the frontage", "kind": "line" },
        { "n": 2, "name": "Missile infantry", "role": "Concentrate fire", "kind": "ranged" },
        { "n": 1, "name": "Generic lord", "role": "Command", "kind": "character" },
        { "n": 1, "name": "Embedded hero", "role": "Army support", "kind": "character" }
      ],
      "context": "Synthetic 20-slot example; replace the whole roster with researched faction units.",
      "notes": [["Readiness", "Recruit this only when the economy and available buildings support it."]],
      "plan": [["Deployment", "Use a protected line, clear firing lanes, and a small reserve."]],
      "size": 20,
      "sources": ["roster-data"],
      "state": "inferred",
      "src": ["roster-data"]
    }
  }
}
```

For each non-empty column, verify `sum(row.n) === size` and a legal single commander.
Use positive integer counts and an integer `size` no greater than the normal 20-slot cap unless a verified mechanic justifies otherwise.
A deliberately smaller patrol/garrison is valid when explained.
For a generic-only home guard, `legendary: []` is valid and renders an explicit absent marker; do not put the Legendary Lord into every simultaneous army.
If variants need different intended sizes, use separate templates because an entry has only one `size`.

The lint checks shapes, not count sums, commander legality, integer counts, unique-character availability, or recruitment feasibility.
Check those separately.

### Skills, research, buildings, mechanics: flat entry ID → item

All four use the same shape:

```json
{
  "commander-mobile": {
    "label": "Mobile commander",
    "title": "Build for the expedition's actual role",
    "intro": "A priority queue, not a claim that each row consumes exactly one level.",
    "steps": [
      { "title": "Movement and core army support", "note": "Replace with verified skill names and prerequisites.", "gate": "Opening priority", "short": "Logistics first" },
      { "title": "Unique or role-specific branch", "note": "Interrupt the normal queue at the verified rank gate." }
    ],
    "details": [["Alternative", "A static home commander can have a separately selected priority queue."]],
    "sources": ["roster-data"],
    "state": "inferred",
    "src": ["roster-data"]
  }
}
```

Required fields: non-empty `label`, `title`, `intro`, an array of `steps`, and a `sources` array.
Each step requires non-empty `title` and `note`; `gate` and `short` are optional non-empty strings.
`details` is an optional array of `[title, body]` pairs.
`state` and `src` are optional in the schema, but add them to new/reworked entries to make the research/recommendation boundary visible.

The renderer treats these JSON strings as plain text, including notes, steps, details, objective text, and source notes.
Do not rely on HTML tags, Markdown links, `**bold**`, or claim markers inside JSON strings.
Use the structured fields to organize material and source IDs to create links.

### VCO: route → ordered objective rows

```json
{
  "route-1": [
    { "id": "hold-target-province", "text": "Placeholder: maintain the required province control under the verified ownership rule.", "state": "verify-in-campaign", "src": ["vco-author"] }
  ]
}
```

Each row requires `id`, `text`, and `state`; `src` is optional but should accompany a researched claim.
Use one stable, unique ID per actual condition within the route; never use an array index as identity.
Keep text operational without inventing new victory requirements.
A list of search candidates is not necessarily a requirement to complete every candidate; say so when listing them.
The route's objective/reward claims explain any rule or reward not expressible as one row.

### Sources: array of source records

```json
[
  { "id": "vco-author", "title": "Example VCO primary source", "url": "https://example.invalid/vco", "note": "Serialization example only. Replace with the exact source, version/check date, supported claim, and limitations." },
  { "id": "roster-data", "title": "Example extracted game data", "url": "https://example.invalid/roster", "note": "Serialization example only. Replace with a real versioned game-data source; do not claim an in-game test." }
]
```

Use unique stable source IDs within a lord.
`title`, `url`, and `note` are strings.
A source note should identify whether the source is primary/current data, extracted data, secondary interpretation, or archived material; record the precise scope and unresolved verification limits.
Prefer direct, versioned URLs to search pages.
Do not fabricate a URL or describe an unopened search result as a checked source.

`src` attributes confidence claims; `sources` supplies the ordinary links on army/item cards.
When both are present, resolve both lists against the same lord's sources catalogue and keep them consistent with their distinct roles.
If a dataset `src` field is present, the lint requires a **non-empty** list; omit it when no supporting source exists rather than writing `src: []` there.
Route objective/reward `src` lists are required and may be empty; body callouts may omit `src`.
Empty evidence is legal in some shapes but must be explained honestly, never labelled as source verification.
The lint resolves `src` IDs but does not resolve every `sources` list or reject all duplicate IDs; check those yourself.

## 6. Compatibility, state, and browser checks

Guide files are git-versioned **reference content**.
Player progress is a separate store at `.local/state/ledgers/<lord-slug>/<route-id>.json`, served only through the local server's ledger API.
Do not write, migrate, delete, reset, or fabricate that state as part of guide authoring.

Saved objective progress is keyed by objective ID under its lord/route.
Keeping the ID preserves its stored progress; renaming it produces a fresh row, removing it hides that row, and reusing it for a different condition can misapply old progress.
Preserve IDs when correcting wording for the same condition.
When the mod changes the condition itself, use a new ID and report the compatibility impact instead of carrying completion into a different objective.

Planning ticks do not imply game confirmation.
The ledger distinguishes objective appears complete, mission complete, victory registered, and reward received.
Guide confidence (`confirmed`) describes evidence about a claim, not the player's progress.

Current hash examples:

- `#/<lord>`: first route's reference desk.
- `#/<lord>/desk/<route-id>`: selected route's desk.
- `#/<lord>/plan/<route-id>/opening`: route plan at its opening.
- `#/<lord>/armies/<route-id>`: armies/skills/research tabs.
- `#/<lord>/settlements/<route-id>` and `#/<lord>/workshop/<route-id>`: buildings and mechanics.
- `#/<lord>/ledger/<route-id>`: campaign ledger.
- `#/<lord>/sources` and `#/<lord>/notes`: lord-scoped pages.

Old `#/<lord>/route/<route-id>` URLs are not supported.
Section anchors are supported only on `plan`, not army/item tabs.
The app loads content once at boot; reload the browser after editing Markdown/JSON.
Read over HTTP via `npm run serve` or `npm run dev`; a self-contained `file://` HTML export is not this app's reading path.
Runtime content is not bundled into `dist/`, but building and booting still check framework compatibility.

Run the content lint, test suite, TypeScript check, and build listed in the main skill.
For visual/runtime inspection, inspect full army columns, all selected panel entries, sources, Unicode headings, long prose, transition links, and objective rows.
Local army tabs are not persisted; field notes/settings/search are not automatically available because their labels or planned features exist.
Do not exercise ledger write actions against the player's real store.
