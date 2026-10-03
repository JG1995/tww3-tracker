# Planned Work

> **Authority:** This document owns work specifically planned for the near future — features and initiatives with committed or imminent delivery intent. It does not duplicate detailed implementation slices.

Items that are not actively planned but worth remembering belong in [BACKLOG.md](./BACKLOG.md).

## Active

- _None currently active — F2 (route-first rendering) merged to `main` 2026-10-03; next in sequence is F4 (Elspeth migration), see Next._

## Next

### Development sequence (approved 2026-06-07; provisional — revisit after the content model is specced)

Resolved at approval: pilot is **Elspeth von Draken**; the ledger tracks **one active campaign** (finished campaigns archived as plain files); **confidence states are in the content schema from day one** (F2 renders badges, F4 annotates in a single pass).

| Order | Feature | Confidence | Why this position |
| --- | --- | --- | --- |
| 1 | ~~**site-foundation**~~ — **Completed 2026-10-02** (see Completed below) | high | Everything else is content or rendering of this model; the model is CONCEPT risk 3 and must be designed before any migration |
| 2 | **F2 — route-first rendering** (views, tabs, dashboard panels, content-gap markers, confidence-state badges) | medium-high | Needs the schema; must exist before migration so content lands in a rendering target |
| 3 | **F4 — Elspeth migration** (content-only) | medium | First real validation of the model against actual content; model corrected once, before any second faction copies it |
| 4 | **F3 — verification notes UI** (version banner, source panels, flagged-items view) | medium | Small once badges render; after F4 so the re-check view has real flagged items to show |
| 5 | **F7 — route transitions** (bidirectional cross-links) | high | Mechanical; needs F2 route pages + F4 transition sections |
| 6 | **F5 — VCO campaign ledger** (types, logic, io, server PUT, ledger index; one active campaign) | medium | Should (not Must) and the only feature touching the write path; keeping it last leaves the entire Must path shippable without it |
| 7 (v1.1) | **F4 × 3 — Alith, Zhao, + one more** — start with the two shared-skeleton migrations | high | Cheapest; proves "second faction is content-only" |
| 8 (v1.1) | **F6 — cross-guide search** | medium | Meaningful only with ≥ 2 migrated guides; corpus exists in `query.ts` from order 1 |
| 9 (v1.1) | **F4 × 2 — Malakai, Mother Ostankya** | medium-low | Structurally different files; the model's real stress test, last so the model is corrected first |

Deferred by the PRD (not in this sequence): F8 (ledger database — needs a real campaign of ledger use), F9 (faction onboarding aid — needs the model proven across ≥ 3 factions), v2.0 candidates.

```text
site-foundation (scaffold, router, shell, content schema + loader + lint, local server)
   │   [enables F1]
   └─► F2 route-first rendering
         ├─► F4 Elspeth migration
         ├─► F3 verification notes
         ├─► F7 route transitions
         └─► F5 VCO ledger
F4 (Elspeth) + F4 (Alith or Zhao) + F2 ──► F6 cross-guide search          [v1.1]
```

**MVP spine:** scaffold → one Elspeth route renders end-to-end (identity → exact objectives → opening) with confidence badges and a version banner → tick one item in that route's ledger → the tick survives a reload.

**Parallel note:** solo project — after order 3, orders 4–6 are mutually independent and can be reordered around a live campaign (pull F5 forward if an Elspeth campaign starts mid-build). In v1.1, the Alith/Zhao migrations are independent of F6.

**Plan next:** F4 — Elspeth migration (order 3) is next; F2 (route-first rendering) was delivered and merged to `main` 2026-10-03 (see Completed below). site-foundation was proposed 2026-06-07, reviewed through three plan revisions, delivered 2026-10-02, and merged to `main` — see Completed. Provisional — revisit the order.

## Completed

- **route-first-rendering** (F2 — route-first content rendering) — delivered 2026-10-03 · [IMPLEMENTATION](features/route-first-rendering/ROUTE-FIRST-RENDERING-IMPLEMENTATION.md) · [DESIGN](features/route-first-rendering/ROUTE-FIRST-RENDERING-DESIGN.md) — route tab strip (hash-derived, keyboard), route identity card + optional VCO objectives, in-flow content-gap markers at the registry positions, the five-tab dashboard (component-local selection, explicit empty states, atlas anatomy), the Confidence Badge for all four states, and typed dataset schemas for the six structured datasets (committed Elspeth stays all-gap; F4 fills it). Eight reviewed package commits + close-out; merged to `main` (feature close `65384cf`); feature-mode review APPROVE with no blocking findings.
- **site-foundation** (F1 — guide site with shared structure) — delivered 2026-10-02 · [IMPLEMENTATION](features/site-foundation/SITE-FOUNDATION-IMPLEMENTATION.md) · [DESIGN](features/site-foundation/SITE-FOUNDATION-DESIGN.md) — Preact + Vite + TypeScript SPA shell, content model + loader + query, content lint, dependency-free static server, lint-clean Elspeth content skeleton. Seven reviewed package commits + close-out; merged to `main` (feature close `94fa333`); feature-mode review APPROVE with no blocking findings. Reading path: `npm run build` once, then `npm run serve` (the original `file://` claim was voided by a verified 2026-10-02 developer decision).

When multi-commit work begins, add a feature-level entry here that links to `features/<feature-name>/<FEATURE-NAME>-IMPLEMENTATION.md`; keep slice details in that ledger. Keep completed records in the same feature directory.
