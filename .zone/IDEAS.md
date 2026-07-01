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

## [done] Overflow damage rules

SR3E Condition Monitor overflow mechanics — not yet planned.

**Stun overflow → Physical:**
- Stun track full (10 boxes) → excess Stun converts 1:1 into Physical boxes.
- Character falls unconscious immediately; stays unconscious until Stun healed below Deadly.
- Black IC mental damage follows same overflow path.

**Physical overflow → Death:**
- Physical track full (10 boxes) → overflow tracked separately.
- Safe overflow capacity = Body Rating boxes. Exceed that → instant death.
- While in overflow: character "bleeding out" — takes 1 box additional damage every (Body Rating) Combat Turns.
- If bleeding-out boxes push total past Body Rating → death.

**Stabilization options:**
- Biotech First Aid: TN 10 test. Success stops bleed-out.
- Self-stabilization: Body (10) test if first aid fails.
- Trauma patch: Body (4 + modifiers) test.
- Stabilize spell: Force ≥ current overflow damage.
- Hand of God (optional): burn entire Karma Pool + Good Karma; once per lifetime.

**Optional — Deadlier Over-Damage:**
- Trigger: attack Power > Body × 1.5.
- Every 2 extra successes past Deadly staging → +1 overflow box.

Scope: requires new overflow track on actor (separate from the existing 10-box Physical), bleed-out timer tied to Combat Turn hooks, stabilization test flows. Non-trivial; plan separately.

## [in-plan] First Aid item (Trauma Patch / Medkit)

Special item that enables stabilization tests for characters in Physical overflow.

**Trauma patch:** consumable item; applying it lets the patient attempt Body (4 + modifiers) test to stabilize bleed-out. One-shot use — decrement quantity on use.
**Medkit / Biotech kit:** enables the Biotech TN 10 stabilization test (possibly already covered by skill roll, but item could gate the option or provide dice pool bonus).

Scope: new item type or sub-type of existing consumable; activation triggers a stabilization roll flow; probably integrates with overflow rules above. Stub until overflow is specced.

## [in-plan] Clickable dice in chat for karma re-rolls

After a roll, individual dice in the chat message should be clickable buttons. Pressing one re-rolls that specific die, deducts karma appropriately (incremental cost per re-roll), and updates the chat message in-place with the new result. Deferred: post-roll karma, separate UI surface from the composer.

## [done] Open test defaulting rule
Old code had this commented out mid-implementation. The rule modifies defaulting TN penalty into a pool subtraction (instead of TN add) for open tests. Source unclear — needs SR3E rulebook verification before implementing. Stub left in `defaultingRules.ts` with TODO. Do not guess. → Tracked in TECHSPEC-combat-architecture-decisions.md line 142.
