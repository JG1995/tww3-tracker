# Planned Work

> **Authority:** This document owns work specifically planned for the near future — features and initiatives with committed or imminent delivery intent. It does not duplicate detailed implementation slices.

Items that are not actively planned but worth remembering belong in [BACKLOG.md](./BACKLOG.md).

## Active

- **alith-zhao-migration** (F4 × 2 — Alith Anar and Zhao Ming) — content-only plan and bounded concurrency revision reviewed and accepted; implementation not started · [IMPLEMENTATION](features/alith-zhao-migration/ALITH-ZHAO-MIGRATION-IMPLEMENTATION.md) · [DESIGN](features/alith-zhao-migration/ALITH-ZHAO-MIGRATION-DESIGN.md). Automated proof protects site functionality; required manual CONTENT REVIEW and mapping prove complete, accurate content. Planning does not authorize implementation or Git operations.

## Next

### Development sequence (approved 2026-06-07; provisional — revisit after the content model is specced)

Resolved at approval: pilot is **Elspeth von Draken**; the ledger tracks **one active campaign** (finished campaigns archived as plain files); **confidence states are in the content schema from day one** (F2 renders badges, F4 annotates in a single pass).

| Order | Feature | Confidence | Why this position |
| --- | --- | --- | --- |
| 1 | ~~**site-foundation**~~ — **Completed 2026-10-02** (see Completed below) | high | Everything else is content or rendering of this model; the model is CONCEPT risk 3 and must be designed before any migration |
| 2 | ~~**F2 — route-first rendering**~~ — **Completed 2026-10-03** (see Completed below) | medium-high | Needs the schema; must exist before migration so content lands in a rendering target |
| 3 | ~~**F4 — Elspeth migration** (content-only)~~ — **Completed 2026-10-03** (see Completed below) | medium | First real validation of the model against actual content; model corrected once, before any second faction copies it |
| 4 | ~~**F3 — verification notes UI**~~ — **Completed 2026-10-03** (see Completed below) | medium | Small once badges render; after F4 so the re-check view has real flagged items to show |
| 5 | ~~**F7 — route transitions** (bidirectional cross-links)~~ — **Completed 2026-10-03** (see Completed below) | high | Mechanical; needs F2 route pages + F4 transition sections |
| 6 | ~~**F5 — VCO campaign ledger**~~ — **Completed 2026-10-04** (see Completed below) | medium | Should (not Must) and the only feature touching the write path; keeping it last leaves the entire Must path shippable without it |
| 7 (v1.1) | **F4 × 2 — Alith Anar, Zhao Ming** — **Active: accepted plan** (see Active above) | high | Cheapest; proves "second faction is content-only" |
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

**Plan next:** Commit the reviewed and accepted Alith Anar/Zhao Ming DESIGN, revised IMPLEMENTATION, TODO reconciliation and separately approved PR template in an authorized operation before explicitly starting delivery (active order 7). The next feature is F6 cross-guide search (order 8), after this two-lord migration. Malakai and Mother Ostankya remain at order 9.

## Completed

- **atlas-ux-realignment** (F10 — atlas UX re-alignment) — delivered 2026-10-04 · [IMPLEMENTATION](features/atlas-ux-realignment/ATLAS-UX-REALIGNMENT-IMPLEMENTATION.md) · [DESIGN](features/atlas-ux-realignment/ATLAS-UX-REALIGNMENT-DESIGN.md) — re-aligned the site's chrome, eight-page IA, hash grammar, and visual system to the reference atlases; added optional crest/environment/phase content. Twelve implementation commits plus one reconciliation commit, integrated to `main` by fast-forward at `b2317f3031e7057c2de6ca7b8f4af91cda597527`. Feature review Needs fixes (2 MEDIUM, 2 LOW); all four findings were reconciled. Post-integration gates pass (213 tests, tsc, content lint, build).

- **vco-campaign-ledger** (F5 — VCO campaign ledger) — delivered 2026-10-04 · [IMPLEMENTATION](features/vco-campaign-ledger/VCO-CAMPAIGN-LEDGER-IMPLEMENTATION.md) · [DESIGN](features/vco-campaign-ledger/VCO-CAMPAIGN-LEDGER-DESIGN.md) — one active VCO campaign persists as JSON outside Git through the local server; its planning and game-confirmed tracks remain separate, with on-demand loading, optimistic writes and visible rollback, and confirmed complete/delete lifecycle actions. Twelve commits integrated to `main` by fast-forward at `70ac3083ffdae6c66a9e5f6919249c7545f8cb40`; feature review Accept, zero findings.

- **route-transitions** (F7 — route transition views) — delivered 2026-10-03 · [IMPLEMENTATION](features/route-transitions/ROUTE-TRANSITIONS-IMPLEMENTATION.md) · [DESIGN](features/route-transitions/ROUTE-TRANSITIONS-DESIGN.md) — each route's `Transition → <route>` section is a same-lord cross-link: `app/views/route.ts` exports the pure `transitionTarget` resolution (id-or-name match against the lord's manifest routes, mirroring the lint's `isKnownSectionTitle`) and `slotAt`'s present-section branch renders the transition H2 as an anchor — one token-only `.route-section__heading-link` class — into the target route's real `Opening` section id, with the route page top as the fallback when the target `Opening` is a declared gap, a plain-H2 guard for the lint-unreachable unresolvable title, and the inert F2 gap marker preserved for body-less declared transitions. Six committed anchors (two per route page) land on the existing section-anchor effect; zero content, model, lint, or router changes. One reviewed package commit + close-out; merged to `main` (feature close `a44e8c8`); feature-mode review Accept with no blocking findings.

- **verification-notes-ui** (F3 — research & verification notes) — delivered 2026-10-03 · [IMPLEMENTATION](features/verification-notes-ui/VERIFICATION-NOTES-UI-IMPLEMENTATION.md) · [DESIGN](features/verification-notes-ui/VERIFICATION-NOTES-UI-DESIGN.md) — the guide's research trail as first-class UI: route body callouts carry their section identity in the tree (`RouteCallout.sectionId/sectionTitle`), the single `getFlaggedEntries` selector defines the `verify-in-campaign` flagged set once (36 entries over the committed Elspeth guide: 6 identity + 5 callout + 22 dataset + 3 VCO), Source / Verification Note panels render under each citing route section, and the lord page closes with the grouped flagged-items section under the Version Banner (`VERIFIED AGAINST — patch 9.0 · VCO 2026.09.30.1` + `N OPEN FLAGS` chip anchoring the list, `ALL CLEARED` at zero). Five reviewed package commits + one reviewed correction (chip focus target made focusable) + close-out; merged to `main` (feature close `944fb4f`); feature-mode review Accept with no blocking findings.

- **elspeth-migration** (F4 — Elspeth migration (content-only)) — delivered 2026-10-03 · [IMPLEMENTATION](features/elspeth-migration/ELSPETH-MIGRATION-IMPLEMENTATION.md) · [DESIGN](features/elspeth-migration/ELSPETH-MIGRATION-DESIGN.md) — the read-only Elspeth VCO Expedition Atlas migrated into the committed content model with zero code change: `shared.md` intro + four shared blocks, the six typed datasets populated (15 armies, 10 skills, 8 research entries = 4 base groups + 4 per-route overrides, 9 building roles in per-route subsets, 5 mechanics with field-test/upgrade/Amethyst folds, 33 VCO items with states and `src`), and all three route bodies filled (eight registry sections each, `gaps` = the two transition titles, resolved `panelOrder`, `vcoTitle` null, atlas `::claim` callouts with the seven evidence notes folded). Eleven reviewed package commits + close-out; merged to `main` (feature close `cafe6a66`); feature-mode review Accept with no blocking findings (one advisory MEDIUM retained — a Helstorm test-assertion substring collision, content verified complete).
- **route-first-rendering** (F2 — route-first content rendering) — delivered 2026-10-03 · [IMPLEMENTATION](features/route-first-rendering/ROUTE-FIRST-RENDERING-IMPLEMENTATION.md) · [DESIGN](features/route-first-rendering/ROUTE-FIRST-RENDERING-DESIGN.md) — route tab strip (hash-derived, keyboard), route identity card + optional VCO objectives, in-flow content-gap markers at the registry positions, the five-tab dashboard (component-local selection, explicit empty states, atlas anatomy), the Confidence Badge for all four states, and typed dataset schemas for the six structured datasets (committed Elspeth stays all-gap; F4 fills it). Eight reviewed package commits + close-out; merged to `main` (feature close `65384cf`); feature-mode review APPROVE with no blocking findings.
- **site-foundation** (F1 — guide site with shared structure) — delivered 2026-10-02 · [IMPLEMENTATION](features/site-foundation/SITE-FOUNDATION-IMPLEMENTATION.md) · [DESIGN](features/site-foundation/SITE-FOUNDATION-DESIGN.md) — Preact + Vite + TypeScript SPA shell, content model + loader + query, content lint, dependency-free static server, lint-clean Elspeth content skeleton. Seven reviewed package commits + close-out; merged to `main` (feature close `94fa333`); feature-mode review APPROVE with no blocking findings. Reading path: `npm run build` once, then `npm run serve` (the original `file://` claim was voided by a verified 2026-10-02 developer decision).

When multi-commit work begins, add a feature-level entry here that links to `features/<feature-name>/<FEATURE-NAME>-IMPLEMENTATION.md`; keep slice details in that ledger. Keep completed records in the same feature directory.
