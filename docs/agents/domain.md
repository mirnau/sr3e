# Domain Docs

**Layout:** Single-context

## Files

| File | Purpose |
|------|---------|
| `CONTEXT.md` (repo root) | High-level project context, goals, constraints |
| `docs/adr/` | Architectural Decision Records |

## Rules for Agents

- Read `CONTEXT.md` before making architectural suggestions.
- New ADRs go in `docs/adr/` using the format defined in `docs/adr/0000-template.md`.
- Reference relevant ADRs in PR descriptions when a decision is load-bearing.
- When `CONTEXT.md` does not exist yet, do not assume defaults; ask the maintainer.
