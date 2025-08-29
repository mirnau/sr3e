1. Philosophy

Fail loud, fail fast – No silent fallbacks, no “magic defaults.” Errors must be visible and intentional.

Clarity over cleverness – Code should be easy to read, never obfuscated.

Single source of truth – The config object (sr3e.\*) defines canonical labels, damage types, and weapon modes. These may never be remapped or re-invented.

Respect the system’s era – Shadowrun 3E is crunchy, simulationist, and table-driven. Our code should embrace that by being transparent and rules-faithful.

2. Coding Standards
   Language and Framework

JavaScript only (strict ESNext).

Svelte 5 in strict runes mode.

CSS is written in LESS, no inline hacks unless absolutely necessary.

Style Rules

No abbreviation creep: storeManager not sm, attributeMaximum not attrMax.

One purpose per class/module – do not overload files.

Imports: always explicit and from @models/, @services/, @sheets/, @sveltecomponent/, etc.

Logs: Debug logs are discouraged unless explicitly requested. No console.log left in PRs.

Error Handling

Throw explicit errors.

Never silently catch unless instructed.

No hidden fallbacks.

3. System Rules

Actor / Item sheets – Always extend DocumentSheetV2 or ApplicationV2.

Data Models – Extend Foundry v13+ models cleanly, never patch prototypes.

Procedures – All roll/resolution logic flows through AbstractProcedure and its children (FirearmProcedure, MeleeProcedure, etc.). Locks are centralized.

Effects / Gadgets – Gadgets are implemented as specialized ActiveEffects with flags.sr3e.gadget metadata.

4. Contributions

Humans: open PRs, document intent clearly.

Agents (AI, bots):

Must follow this document as source of truth.

Must not invent new conventions.

PRs should be complete, not stubs or speculative patches.

5. Localization

All player-facing strings must pass through localize(config.\*).

English is the base language; other languages may extend.

Do not hardcode strings.

6. Commit Rules

Use descriptive commit messages (feat: add Karma Shopping flow, fix: reset stale attribute procedure).

Avoid squashing architectural commits; history should show intent.

7. Shadowrun Respect

Do not rewrite rules unless the official SR3 mechanics explicitly require interpretation.

Use tables as given (see GM Screen PDF).

Meta-house rules must be flagged and documented separately.

8. When in Doubt

Prefer generalized solutions in AbstractProcedure over one-off hacks.

Ask: “Does this preserve clarity, consistency, and SR3 authenticity?”

If not sure, stop. Open an issue instead of guessing.
