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

## [deferred] Clickable dice in chat for karma re-rolls

After a roll, individual dice in the chat message should be clickable buttons. Pressing one re-rolls that specific die, deducts karma appropriately (incremental cost per re-roll), and updates the chat message in-place with the new result. Deferred: post-roll karma, separate UI surface from the composer.

New implementations not working correctly; circle back later, not now.

## [deferred] Spell sustaining modifiers

Spell Drain currently supports the base Drain roll. Sustaining modifiers may add +2 to Drain Power for each currently sustained spell. Keep this as a reminder only; the system is for ease of use, not complete automation, and this may be handled manually if that stays cleaner.

## [deferred] Elemental manipulation full defense and armor resolution

Elemental Manipulations are treated like ranged attacks, can be dodged, and use half Impact armor for resistance. Current spell infrastructure covers the main casting/resistance spine; full ranged-defense and armor automation can wait unless it becomes ergonomically necessary.

## [deferred] Direct spell damage application

Combat spell staging is shown in the flow, but direct target health application should remain optional until spell damage track semantics are explicit enough to avoid false automation. Honorary/manual resolution may be preferable for many spells.

## [deferred] Chat-card Drain prompt

Drain currently opens as the follow-up composer after spellcasting and posts its own chat outcome. The stricter chat-driven variant would post a spellcast card with a `Roll Drain` button and consume that button when resolved. Keep this only if table use shows the automatic follow-up composer is not enough.

## [done] Open test defaulting rule
Old code had this commented out mid-implementation. The rule modifies defaulting TN penalty into a pool subtraction (instead of TN add) for open tests. Source unclear — needs SR3E rulebook verification before implementing. Stub left in `defaultingRules.ts` with TODO. Do not guess. → Tracked in TECHSPEC-combat-architecture-decisions.md line 142.
