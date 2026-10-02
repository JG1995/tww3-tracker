# Architecture — [Product Name]

> Authority: This document describes the currently implemented system. It does not describe unimplemented proposals as current state.

This document describes how **[Product Name]** is constructed: the layers, the modules, the data flow, the build/test/gate pipeline, and the conventions enforced by tooling. It answers: where does this code belong, and how do these pieces talk to each other?

For the product purpose and domain model, see [CONCEPT.md](./CONCEPT.md). For the rationale behind key decisions, see the Notable Trade-offs section below or [Architecture Decision Records](adr/README.md).

---

## 1. Top-Level Shape

### 1.1 Target architecture (approved proposal)

> Status: approved 2026-10-02, **not yet implemented**. This subsection records the approved target stack and direction only; it does not describe the current system (see 1.2). Rationale: [ADR-0001](adr/0001-vite-preact-runtime-loaded-site.md), [ADR-0002](adr/0002-content-as-markdown-json.md).

A local, single-user web app. One Preact SPA in TypeScript, built by Vite, with no static site generator and no backend. Guide content is never compiled into the bundle — it is fetched at runtime from the repository as Markdown and JSON files.

| Layer | Choice |
| ----- | ------ |
| UI | Preact SPA, TypeScript, hash routing, single HTML shell |
| Runtime dependencies | `preact`, `markdown-it` |
| Dev tooling | `vite`, `typescript` (`tsc --noEmit`), small esbuild-based content lint script; Node ≥ 22 |
| Content | Markdown + YAML frontmatter (prose, confidence states) and JSON (structured dashboard data) in `content/`, git-versioned, loaded at runtime |
| Ledger state | JSON files in a gitignored local directory (e.g. `.local/state/ledgers/`); SQLite deferred per PRD F8 |
| Serving | Small dependency-free local server script (static files + ledger JSON writes); static `dist/` is readable with no server |
| Design system | `.wiki/DESIGN.md` oklch tokens as CSS custom properties; no UI library |
| Testing | Node built-in `node:test`; tests cover content-schema validation and ledger logic (pure functions) |

```text
 Browser (Preact SPA, static dist/ or Vite dev)
   │  HTTP fetch (local server; dist/ + content/ readable with none)
   ├──► content/<faction>/<lord>/   Markdown + JSON  (read path; git-versioned)
   └──► .local/state/ledgers/*.json (write path; gitignored; plain-text exportable)

 Local server: small dependency-free Node script — static serving +
 PUT .local/state/ledgers/<campaign>.json with a path-safety check. No other server code.

 Raw archive (read-only reference, gitignored): .work/references/*.html
```

#### Module layout

```text
app/
├── main.ts            # bootstrap: build the content tree, mount the router
├── router.ts          # hash router (~50 lines): #/faction/elspeth/route-ii → view
├── views/             # one file per page; owns layout and page-local state
│   ├── home.tsx  faction.tsx  lord.tsx  route.tsx
│   ├── dashboard.tsx  ledger.tsx  search.tsx
├── components/        # dumb reusable panels: TabStrip, Panel, ConfidenceBadge,
│                      # SourceChip, LedgerTable, SearchResults — plain props in, UI out
├── content/
│   ├── types.ts       # the content model: Faction, Lord, Route, Claim, Army, …
│   ├── load.ts        # side effect: fetch + parse Markdown/JSON → immutable ContentTree
│   └── query.ts       # pure selectors: byRoute(), flaggedClaims(), search corpus
├── ledger/
│   ├── types.ts
│   ├── logic.ts       # pure: tickItem(), markConfirmed(), newCampaign() — unit-tested
│   └── io.ts          # side effect: the only code that reads/writes .local/state
└── styles/            # tokens.css (DESIGN.md oklch tokens as custom properties), components.css
```

#### Readability rules

1. **Side effects only in `content/load.ts` and `ledger/io.ts`.** Everything else is pure functions or dumb components; those two files are the only places where "something else happens".
2. **State lives where it is rendered.** No state library, no global store. Tabs, sections, and search text are component-local. The only shared mutable documents are ledger documents (owned by `ledger/`) plus a small in-memory ledger index (id, lord, route, status, last updated) derived from them.
3. **Views compose, components do not decide.** Panels receive data and emit events; they know nothing about factions, routes, or VCO. Reusability across factions comes from rendering data, not topics.

#### Data flow

- **Boot (once):** fetch the manifest, fetch all guide files in one parallel pass, parse and validate, build the immutable `ContentTree` in memory (tens of ms over a few MB). Markdown is rendered to HTML once at load and cached in the tree.
- **After boot:** every page, tab, and search hit is a synchronous in-memory read — no per-view fetching, no loading states, no cache invalidation.
- **Ledgers load on demand**, never at boot: opening a campaign loads its document via `io.ts`. Boot cost is independent of the number of campaigns, so the file-based store stays adequate at 100+ campaigns.
- **Ledger write path:** `logic.ts` computes the next document → `io.ts` PUTs it → optimistic in-memory update, visible error and rollback on failure. Single user; no conflict handling.

#### Performance expectations

- One small bundle, no code splitting. Sub-100 ms in-browser search over the loaded corpus (naive tokenized matching in `query.ts`; MiniSearch is the named upgrade inside the same file).
- The expensive work (fetch + parse) happens once at boot; everything the user touches afterwards is memory-bound.

#### Deliberately absent

No service worker, virtualization, event bus, DI, ORM, WebSocket, code splitting, state library, or cross-campaign analytics layer. New-faction extensibility is met by the content schema, not by framework indirection.

#### When this direction stops being optimal

Cross-campaign querying/analysis (comparisons, history stats across many campaigns) is the trigger for the PRD F8 store step: the local server gains a local database and serves the same document-level get/put surface; `ledger/io.ts` internals change, and nothing above it does. Until that usage appears, the file-based design carries the project.

### 1.2 Current state

No application code exists. The repository contains this `.wiki/` documentation, `README.md`, the gitignored raw guide archive (`.work/references/`), and gitignored workflow scripts (`scripts/`). Sections 2–11 of this document are unfilled and will be written as implementation lands.

---

## 2. Project Layout

[Describe the top-level directory structure. Every project is different — adapt this template to yours.

Common categories to document:

- Application entry point(s)
- Domain / feature modules
- Shared libraries or utilities
- Configuration files
- Tooling and scripts
- Tests and test infrastructure

Name the path aliases or import conventions and the file that declares them.]

```text
[Directory tree showing the major branches of the project, annotated with what each directory contains and what its responsibilities are.]
```

### 2.1 Source layout rules

[Table of naming and placement conventions that shape the architecture:]

| Rule                               | Enforcement                                     | Effect on code                        |
| ---------------------------------- | ----------------------------------------------- | ------------------------------------- |
| [Rule description]                 | [Linter, type checker, or convention]           | [What happens when someone breaks it] |
| [Rule description]                 | [Linter, type checker, or convention]           | [What happens when someone breaks it] |

### 2.2 State and reactivity patterns

[Describe how the application manages state — the patterns and tools for each concern:]

- **Component-local state** — [pattern or tool for state scoped to one component]
- **Derived state** — [pattern for values computed from other state]
- **Server / remote state** — [caching layer, invalidation strategy, request lifecycle]
- **Client-only shared state** — [global stores, UI-only state, transient data]
- **Side effects** — [effect handling: subscriptions, listeners, timers. Cleanup rules.]

### 2.3 Interface contract

[Describe how the layers communicate — the boundary between the frontend and backend, or between modules. Name the transport, the data format, and where the contracts are defined.]

Every call follows this pattern:

- `[domain]_[action]` — [what it does]
- `[domain]_[action]` — [what it does]
- `[domain]_[action]` — [what it does]

[How you keep types in sync across the boundary: manual sync, code generation, shared schema.]

---

## 3. Build, Test, and Gate Pipeline

### 3.1 Build commands

[Table mapping each command to its purpose. Omit package manager prefixes.]

| Command | Purpose |
| ------- | ------- |
| `[command name]` | [Install dependencies] |
| `[command name]` | [Development server / watch mode] |
| `[command name]` | [Production build] |
| `[command name]` | [Run tests] |
| `[command name]` | [Lint / typecheck] |
| `[command name]` | [Format check] |

### 3.2 Validation gate

[Describe the gate phases in order. Every enforced check belongs here:]

1. **[Phase name]** — [what runs, what it checks, auto-fix or fail]
2. **[Phase name]** — [what runs, what it checks]
3. **[Phase name]** — [what runs, what it checks]

### 3.3 Commit message convention

[Convention, tool that enforces it, link to the spec, and any exceptions.]

---

## 4. Configuration Files Reference

[Map each configuration file to its role in the project.]

| File | Role |
| ---- | ---- |
| `[file path]` | [What it configures — build, lint, type system, runtime, etc.] |
| `[file path]` | [What it configures] |
| `[file path]` | [What it configures] |
| `[file path]` | [What it configures] |
| `[file path]` | [What it configures] |

---

## 5. Data Flow

### 5.1 Read path

[Trace one read from user action through the layers to the data source and back to the UI. Use a real example.]

```text
[Step-by-step trace with layer boundaries labelled]
```

### 5.2 Write path

[Trace one mutation the same way, including cache invalidation, optimistic updates, rollback, and user feedback.]

```text
[Step-by-step trace with layer boundaries labelled]
```

[Note any invalidation edge cases — mutations that must clear more than one cache key, and why.]

---

## 6. Testing Strategy

### 6.1 How tests are organised

[Describe where tests live relative to the source, what framework and environment each layer uses, and what coverage is expected.]

### 6.2 What each layer covers

- **[Layer / module type]** — [what kind of tests, what they assert, notable patterns (in-memory DB, mocking strategy, fixtures)]
- **[Layer / module type]** — [what kind of tests, what they assert]
- **[Layer / module type]** — [what kind of tests, what they assert]

### 6.3 Test quality guidelines

[State what tests should target: behaviour, not implementation; the surface the user sees, not internal state. State what to avoid: testing the framework, brittle mocks.]

---

## 7. Deployable Artifacts

- **Development** — [how to run locally: dependency setup, dev command, local data location]
- **Production build** — [build command and what it produces — platform-specific installer, container image, static bundle, etc.]
- **Deployment model** — [self-hosted, cloud, desktop installer, mobile store, etc.]
- **Network / telemetry policy** — [offline-first, online-only, optional sync. No telemetry or opt-in telemetry]

---

## 8. Lint & Architecture Enforcement Matrix

[Which rules each layer of tooling enforces, and where the gaps are.]

### 8.1 [Platform / language 1]

| Rule | Mechanism | Enforcement |
| ---- | --------- | ----------- |
| [Rule description] | [Tool and configuration] | [Hard error / Warning / Convention] |
| [Rule description] | [Tool and configuration] | [Hard error / Warning / Convention] |

### 8.2 [Platform / language 2]

| Rule | Mechanism | Enforcement |
| ---- | --------- | ----------- |
| [Rule description] | [Tool and configuration] | [Hard error / Warning / Convention] |
| [Rule description] | [Tool and configuration] | [Hard error / Warning / Convention] |

**Known tooling gaps:** [List rules that are convention-only — no linter enforces them — so reviewers know where to look manually.]

---

## 9. Notable Trade-offs and Decisions

- **[Decision]:** [What was chosen, the trade-off, and the concrete condition that would justify revisiting an intentional limit.]
- **[Decision]:** [What was chosen, the trade-off, and the upgrade trigger.]
- **[Decision]:** [What was chosen, the trade-off, and the upgrade trigger.]

---

## 10. Where to Look Next

- **[Common task 1]:** [Ordered steps across layers — which files to touch, what pattern to follow.]
- **[Common task 2]:** [Ordered steps across layers — which files to touch, what pattern to follow.]
- **[Common task 3]:** [Ordered steps across layers — which files to touch, what pattern to follow.]

---

## 11. Operational Notes

[Any environment-specific setup, troubleshooting tips, or operational constraints not covered above.]
