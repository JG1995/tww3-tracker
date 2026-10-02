# Project Wiki

This directory contains durable knowledge about this repository. Projects may track `.wiki/` in Git or explicitly exclude it; in the latter case the canonical wiki and accepted local delivery snapshots require an external backup. Temporary investigation notes belong in `.pi/work/` and are not project truth.

## Document map

- [Product concept](CONCEPT.md) owns the template's purpose, intended users, principles, and boundaries. It does not own implementation plans or current architecture.
- [Architecture](ARCHITECTURE.md) owns the currently implemented repository structure, data flows, and operational constraints. It does not describe proposals as current state.
- [Design system](DESIGN.md) owns the visual language, component tokens, and UI design decisions. It does not describe user research or product strategy.
- [Planned work](TODO.md) owns features and initiatives with committed or imminent delivery intent. It does not track aspirational or unscheduled ideas.
- [Backlog](BACKLOG.md) owns aspirational, deferred, or unscheduled work — ideas worth remembering but not planned for the near term. It does not track committed delivery work.
- [Decision records](adr/README.md) own consequential decisions and their alternatives. They are not a log of routine implementation choices.
- [Feature documents](features/README.md) keep each feature's named design and implementation files together. Designs own requirements; schema-4 implementation ledgers own the Pi-coordinated package graph, minimal progress, validation contracts, and material discoveries. Completed records remain in the same feature directory.

## Documentation lifecycle

1. Shape broad, risky, architectural, or multi-session work before implementation.
2. Explicitly invoke the [Pi coordinator](../.pi/skills/jay-pi-deliver-feature/SKILL.md) for an accepted ledger. It verifies the committed plan or an accepted local-only snapshot, executes the first unintegrated boundary and lowest wave with `Planned` packages, and uses a separate Paseo-managed worktree workspace for each initial package, including a singleton. Integrate, review, and commit one package at a time.
3. Update documentation that is intrinsic to an atomic implementation slice.
4. Reconcile durable documentation at a significant milestone or feature completion.
5. Reconcile the completed feature's design and implementation ledger in place, and record completion in `TODO.md`.
6. Remove disposable notes from `.pi/work/`. Do not delete the accepted snapshots or journal of an ignored wiki until their outcome is verified and backed up.

Update durable documentation only when an externally meaningful behavior, command, configuration, contract, or persistent-data assumption changes.

## Source of truth

When documentation and repository evidence disagree, implementation and passing tests describe executable behavior. Documentation must be reconciled. Accepted ADRs explain consequential choices. Active feature plans are proposals and progress records, not guarantees of future implementation.
