# Architecture — [Product Name]

> Authority: This document describes the currently implemented system. It does not describe unimplemented proposals as current state.

This document describes how **[Product Name]** is constructed: the layers, the modules, the data flow, the build/test/gate pipeline, and the conventions enforced by tooling. It answers: where does this code belong, and how do these pieces talk to each other?

For the product purpose and domain model, see [CONCEPT.md](./CONCEPT.md). For the rationale behind key decisions, see the Notable Trade-offs section below or [Architecture Decision Records](adr/README.md).

---

## 1. Top-Level Shape

[Describe the stack, the process model, the layers, and how they communicate. Add a diagram that shows the system structure.]

```text
[ASCII diagram or text outline that shows:
 - layers (frontend, backend, data store, third-party services)
 - communication boundaries and protocols (IPC, HTTP, shared memory, message queue)
 - process boundaries (single binary, client-server, edge workers)
 - deployment boundary (desktop, web, mobile, embedded)]
```

[State the architecture rules for dependency direction, interface boundaries, and layer separation. Note which rules are enforced by tooling.]

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
