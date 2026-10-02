# Backlog

Ideas, improvements, and tasks worth remembering but not scheduled for the near term. When something moves from "we should do this eventually" to "we plan to do this soon", it graduates to [TODO.md](./TODO.md).

This is the parking lot — aspirational work, deferred features, technical debt, investigations, and anything else that would be useful but has no committed delivery window.

---

## High

[Feasible and valuable, but not yet planned. These would move to TODO.md Next if priorities shift or capacity opens up.]

## Medium

[Worth doing, but lower impact or higher uncertainty. Triage when High items are cleared or promoted.]

## Low / Icebox

[Interesting ideas, speculative improvements, or items blocked on external factors. Review periodically — most will stay here.]

## Technical Debt

[Architecture, tooling, or code-quality issues that add friction. These are not scheduled but should be tracked so the cost is visible.]

Each debt entry should capture the current evidence, the target state, the risk of leaving it, and the completion criteria. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the current system description.

- **2026-10-02 — site-foundation accepted NITPICK debt (5 items, non-blocking, recorded during delivery).** Evidence: five NITPICKs from the feature's independent commit reviews + feature review (all recorded as accepted debt, feature verdict APPROVE): dead calc-less `max-width` declaration in `app/styles/app.css` (~line 465, no-op either way); dead duplicate guard in `app/router.ts` (~line 54, subsumed by line 49); version formatter duplicated in `app/views/lord.ts` (~line 39) vs the exported `versionContext` in `app/views/home.ts` (~line 35); raw `60ch` line length in `app/styles/app.css` (~line 335) outside the token rule; stale `file://` comment in `vite.config.ts` (lines 3-5) — should read "relative asset URLs so the built `dist/` serves cleanly from any local origin path". Risk: cosmetic/confusion only, zero behavior impact; the `vite.config.ts` comment actively misleads (direct `file://` open gives a blank page). Completion criteria: all five removed or corrected in one small commit with `npm test` + `npx tsc --noEmit` green. Best folded into the first F2 commit that touches those files (the views and CSS are F2's main surface).

---

## Maintenance

- **Promote** entries to TODO.md when they become planned work — move the item text, don't duplicate it.
- **Demote** entries from TODO.md here when planned work gets deprioritised.
- **Prune** entries that are no longer relevant. The backlog is not a landfill.
- **Review** the backlog every few cycles to promote, prune, or re-prioritise.