# 0001 — Vite + Preact SPA with runtime-loaded plain-text content

## Status

Accepted

## Context

The site is a local, single-user web app that hosts route-first VCO campaign guides plus a campaign ledger (PRD F1–F7). The governing constraints, from CONCEPT and PRD:

- Reading the site must not require a running server or a build step.
- All guide content is git-versioned plain text, editable without running anything.
- Ledger state lives in gitignored local storage, survives browser resets, and exports as plain text.
- No backend services. One user. No hosting.
- Adding a faction must be achievable as content-only work.
- The content model is still being validated by the Elspeth pilot and will churn during v1.0.

The UI is tab-heavy by requirement (route tabs, dashboard section tabs, ledger tables, search results) and is built from many reusable stateful panels, not just static pages.

## Decision

Use a **Vite + Preact single-page application in TypeScript** with **no static site generator**. Guide content is never compiled into the bundle: it is fetched at runtime from the repository as Markdown and JSON files, rendered by markdown-it, and shaped by shared TypeScript types.

Concretely:

- Runtime dependencies: `preact`, `markdown-it`. Dev tooling: `vite`, `typescript`, a small esbuild-based content lint script.
- A production build produces a static `dist/` that is readable in a browser with no server.
- A one-line local static server is used for development and for the ledger write path (browser `fetch` of local files requires an HTTP origin).
- Rebuilding happens only when application *code* changes; content edits require only a page reload.

## Alternatives considered

### Static site generator (Astro content collections, Eleventy)

Plausible because both are actively maintained (verified 2026-10-02) and offer schema-validated Markdown collections. Not chosen because a build event is required on every content edit, which conflicts with the read-loop constraint and with a content model that is expected to change during the pilot. **Revisit trigger:** if the corpus grows beyond roughly 15–20 factions or the content model proves stable and schema validation becomes the main maintenance cost, migrate to Astro content collections; the Markdown/JSON content files largely carry over.

### Framework-free vanilla TypeScript

Plausible for a small site, and zero-framework purity has real appeal. Not chosen because the required UI is a set of reusable stateful components (tab strips, panels, confidence badges, ledger tables); hand-rolling state management for those means maintaining a framework with worse ergonomics and no docs.

## Consequences

### Positive

- The repository is the site: content edits are instant, fully git-diffable, and never a build event.
- Real component model for the tab/panel UI at a ~4 KB runtime.
- A static `dist/` satisfies "read with no server"; the local server is only needed for development and ledger writes.
- The toolchain (Vite + tsc) provides fast HMR and a hard type gate without platform opinions.

### Negative

- App code changes require a rebuild; the read loop is build-free only while code is stable.
- No build-time schema validation of content; the content model is enforced by shared TypeScript types and the lint script instead.
- Two dev dependencies (Vite, Preact) and a build pipeline exist that a pure-static site would not.

### Follow-up

- Ship the content lint script with the pilot so the content conventions (file layout, frontmatter schema, confidence-state markers) are enforced from day one.
- Search starts as in-browser naive search; MiniSearch is the named upgrade path (ADR-0002 covers the content side).
- Ledger storage is JSON files now; PRD F8 defers a local-database swap until the shape has survived one real campaign.

## Related work

- Feature design: (Elspeth pilot — not yet created)
- Implementation ledger: (not yet created)
- Commits:
- Supersedes:
- Superseded by:
