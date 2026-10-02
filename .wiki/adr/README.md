# Architecture Decision Records

Files in this directory record consequential decisions, alternatives, trade-offs, and consequences. They are not a log of routine refactoring or local implementation choices.

Create an ADR only when all of these are true:

1. The decision has durable structural or operational consequences.
2. Meaningful alternatives existed.
3. A future maintainer could reasonably ask why this option was chosen.

## Layout

```text
.wiki/adr/
├── README.md
├── templates/
│   └── ADR.md
└── 0001-decision-title.md
```

The numbered filename above illustrates naming; it is not an existing decision. Keep actual records directly in `adr/` and templates in `templates/`.

## Create a decision record

1. Copy [the ADR template](templates/ADR.md) to the next unused four-digit number followed by a short, lowercase, hyphen-separated title, such as `0001-use-sqlite.md`.
2. Replace placeholders, describe the actual alternatives and trade-offs, and remove unused optional entries. Include the number and decision title in the heading.
3. Start with `Proposed`. Set the status to `Accepted` or `Rejected` when the decision is made.
4. Add a link and its status under **Recorded decisions** below. List actual records only, not templates or empty placeholders.

When replacing an accepted decision, create a new ADR. Mark the old one `Superseded` and link the records through **Supersedes** and **Superseded by**. Keep the old record so its reasoning remains available; do not renumber existing records or rewrite their history to describe a different decision.

Use **Related work** to link relevant feature design and implementation documents, commits, and other ADRs. The project architecture document owns current implementation facts; ADRs explain why decisions were made.

## Recorded decisions

- [0001 — Vite + Preact SPA with runtime-loaded plain-text content](0001-vite-preact-runtime-loaded-site.md) — Accepted
- [0002 — Guide content as Markdown prose plus JSON structured data](0002-content-as-markdown-json.md) — Accepted
