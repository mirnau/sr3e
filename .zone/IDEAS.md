# Ideas
> Captured during work. No commitment. Review with zone:review.

## [done] Uncapped roll as system setting

Single-click sheet rolls (skill/spec) currently use uncapped `d6x` (infinite chain). This could be a system-level setting:
- **On** (default): single-click uses uncapped flow, results shown raw, GM interprets.
- **Off**: any dice interaction on the sheet opens the advanced roll dialog (shift-click equivalent, always). No uncapped rolls ever.

Scope: system settings UI + one branch in the single-click handler. Low effort, high configurability.

## [done] SR3E dice accumulation engine — port SR3Edie behavior

Old system had `SR3Edie.js` — custom Foundry Die that disables native `x` explode and implements accumulation per die position: roll 6 → add another d6 to the SAME result slot, repeat until non-6 OR accumulated total >= cap. Result stored as a single integer (e.g., 6+6+3=15), not three separate pool dice.

**Two cap modes to preserve:**
- `d6x${TN}` — cap=TN. Chain stops once total >= TN (no point rolling past success). Correct for most combat rolls.
- `d6x` / Infinity cap — chain as long as 6s come up, no ceiling. Enables totals in the 30s–40s. Cool flavour, should be opt-in.

**Our current `d6x6` is wrong**: Foundry's native engine spawns new pool dice rather than accumulating. `countSuccesses` then counts them individually — a chain of 6→4 is two results (6 and 4) not one result of value 10.

**Design freedom**: implement as a pure TS accumulation loop wired as the default evaluator inside `SR3ERoll.evaluate()`. No Foundry subclass required — the injectable evaluator pattern already supports this cleanly. Register a lightweight Foundry Die shim only if the visual chat renderer needs it.

## [in-plan] Clickable dice in chat for karma re-rolls

After a roll, individual dice in the chat message should be clickable buttons. Pressing one re-rolls that specific die, deducts karma appropriately (incremental cost per re-roll), and updates the chat message in-place with the new result. Deferred: post-roll karma, separate UI surface from the composer.

## [done] Open test defaulting rule
Old code had this commented out mid-implementation. The rule modifies defaulting TN penalty into a pool subtraction (instead of TN add) for open tests. Source unclear — needs SR3E rulebook verification before implementing. Stub left in `defaultingRules.ts` with TODO. Do not guess. → Tracked in TECHSPEC-combat-architecture-decisions.md line 142.
