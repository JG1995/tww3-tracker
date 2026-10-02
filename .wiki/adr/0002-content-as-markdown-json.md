# 0002 — Guide content as Markdown prose plus JSON structured data

## Status

Accepted

## Context

PRD F3 and F4 require the guide's research trail to be part of the product: per-guide patch/VCO version context, four claim confidence states (confirmed, historical, inferred, verify-in-campaign), and sources recorded next to the claims. PRD technical constraints require all guide content to be git-versioned plain text, editable without running the site, and added per faction as content-only work.

The guide content has two distinct shapes: long-form prose (route plans, openings, transition sections, verification notes) and structured reference data (army templates, skill orders, research priorities, settlement role lists, route metadata, ledger schema).

## Decision

Store guide content in a `content/` directory in the repository as:

- **Markdown with YAML frontmatter** for prose sections. Frontmatter carries machine-readable metadata (route objectives, reward, patch and VCO version, sources). Confidence states are explicit markers on claims — readable in plain text and parseable by the site and the content lint script.
- **JSON** for structured dashboard data (armies, skills, research, settlements, mechanics) and per-faction metadata.
- The content lint script validates file layout, frontmatter schema, JSON schema, and that every claim requiring a confidence state carries exactly one of the four states.
- Content is loaded at runtime (ADR-0001); these files are the single source of truth, and the raw generated atlases in `.work/references/` remain an untouched archive for migration disputes.

## Alternatives considered

### A single content format (all-JSON or all-MDX)

Plausible for uniformity. Not chosen: JSON for prose sections is unreadable to edit; MDX pulls in a build step, which ADR-0001 rejects for the read loop.

### A database as the content store

Plausible for query power. Not chosen: it violates the plain-text-in-repo constraint, and the corpus (five factions) is far below the scale where it would pay. Revisit only with a large corpus growth, after the local-database decision for ledger state (PRD F8).

## Consequences

### Positive

- Every byte of guide content survives `git blame`, is reviewable in diffs, and editable with no tool running — the PRD's core constraint.
- The four confidence states are first-class, machine-checkable markers rather than prose style.
- Migration discrepancies resolve in favor of the raw archive, and the diff between archive and content/ is inspectable.

### Negative

- Two file shapes (Markdown, JSON) must stay consistent; consistency is enforced by the lint script and review, not by the format itself.
- Frontmatter/JSON schemas are conventions until the pilot fixes them; the schema is a living document through v1.0.

### Follow-up

- The frontmatter and JSON schemas are fixed as they stabilize during the Elspeth pilot and recorded in `.wiki/DESIGN.md` (content model) and `.wiki/ARCHITECTURE.md` (enforcement).
- The lint script must exist before the second faction is migrated, so the "new faction is content-only" claim is verifiable.

## Related work

- Feature design: (Elspeth pilot — not yet created)
- Implementation ledger: (not yet created)
- Commits:
- Supersedes:
- Superseded by:
