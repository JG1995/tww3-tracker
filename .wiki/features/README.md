# Feature Documents

Keep each feature's design and implementation plan together in a named directory. Include the feature name in both filenames so file reads and search results are identifiable without the parent path.

## Layout

```text
.wiki/features/
├── README.md
├── templates/
│   ├── DESIGN.md
│   └── IMPLEMENTATION.md
└── user-auth/
    ├── USER-AUTH-DESIGN.md
    └── USER-AUTH-IMPLEMENTATION.md
```

Use a lowercase, hyphen-separated directory name and the same name in uppercase for the file prefix. For example, `user-auth` becomes `USER-AUTH`. The example above illustrates naming; it is not an existing feature.

## Create a feature

Use `/skill:jay-pi-design-feature <feature>` to shape the user-facing contract before delivery planning. It resolves repository facts, inherits routine conventions, and asks only about consequential choices with no safe default.

1. Create `.wiki/features/<feature-name>/` when the feature needs a design.
2. Copy the Markdown block from the [design template](templates/DESIGN.md) into `<FEATURE-NAME>-DESIGN.md`. Replace placeholders with the feature's requirements and open questions.
3. When planning implementation, copy the Markdown block from the [implementation template](templates/IMPLEMENTATION.md) into `<FEATURE-NAME>-IMPLEMENTATION.md`. Follow the accompanying delivery guidance and link to the design.

Keep template instructions in `templates/`; do not copy their surrounding guidance into feature documents.

## Document ownership

- **Design:** intended behavior, user journeys, constraints, interfaces, and acceptance criteria.
- **Implementation:** stable boundary/package graph, exact scopes, validation contracts, minimal progress, and discoveries that change the plan. Reference the design rather than maintaining a competing specification.

Routine interaction mechanics inherit current product components, accessibility requirements, and platform conventions. A feature design specifies consequential user outcomes, state transitions, and deliberate deviations. Require exact copy only when its wording is part of the product contract.

When an accepted requirement changes, update the design and affected implementation work together. Keep both documents in the same feature directory through completion or abandonment. Record the outcome in the implementation document and update `.wiki/TODO.md`; do not move files between status directories. Reconcile permanent current-state documentation before closing the feature.

The implementation template uses one schema-4 graph for Pi-coordinated `jay-pi-*` delivery. Validators live under `scripts/`. Plan GitHub PRs or manual-provider reviews as publication boundaries; use `Local` for a separately approved local-Git integration boundary. Packages remain atomic code commits and waves remain independent implementation groups. A tracked wiki records accepted plans in Git; an ignored wiki requires reviewed local acceptance with `scripts/local_delivery.py`, a verified worker snapshot, and an external backup of the wiki and accepted run state. Keep the required machine-readable fields unchanged. Put behavior flow, sequencing, local analogues, constraints, and sibling-independence reasoning inside the package's **Implementation packet** only when they materially affect safe execution; do not repeat the structured wave, dependency, or write-scope fields in prose. Invoke the [Pi delivery coordinator](../../.pi/skills/jay-pi-deliver-feature/SKILL.md) explicitly after acceptance. Use the [build procedure](../../.pi/skills/jay-pi-build/SKILL.md) only through a focused recovery path. Each package has exact file ownership and integrated prerequisites, and starts in a Paseo-managed worktree; only the coordinator integrates results and updates minimal ledger progress.
