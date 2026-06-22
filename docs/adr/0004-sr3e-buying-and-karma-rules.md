# ADR 0004: SR3e Buying and Karma Rules

## Status

Accepted

## Context

Character creation and advancement need to match Shadowrun 3rd Edition rules while still allowing players to preview changes before committing resources.

## Decision

Use staged spending sessions for karma purchases. Players can preview changes, then commit or cancel the session. Cancelling reverts the staged changes without debiting Good Karma.

Keep these SR3e rule decisions explicit:

- Minimum attribute rating is 1.
- Maximum skill rating during character creation is 6.
- Delete skill items when their rating reaches 0.
- Knowledge and language skills use Intelligence as their relevant threshold in buying flows.
- Karma pool starts with a free point.
- Earned karma pool ceiling is `floor(lifetimeKarma * factor)`.
- Total karma pool value is `1 + earned ceiling`.
- Standard metatype karma factor fallback is `0.05`; humans use `0.1`.

## Consequences

Buying services must distinguish character-creation point spending from karma-funded advancement even when both are entered through shopping UI.

UI controls should make staged state visible enough for manual Foundry playtesting, but the debit/revert behaviour belongs in services.
