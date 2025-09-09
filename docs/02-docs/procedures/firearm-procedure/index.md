---
title: Firearm Procedure
parent: Procedures
grand_parent: Documentation
nav_order: 2
---

# FirearmProcedure

`FirearmProcedure` is the concrete subclass of `AbstractProcedure` for firearm attacks.  
It drives the entire ranged attack sequence: assembling dice pools, applying recoil/range modifiers, executing the roll, and exporting contest information for the defender.

---

## Role in the system

- **Attacker-side only.** Represents the shooter’s action. The defender is usually a `DodgeProcedure`.  
- **Extended flow.** In addition to the base roll lifecycle, firearm attacks manage recoil, ammo, range, and pre-computed attack contexts.  
- **Contest integration.** Exports a responder prompt (`Dodge? Yes/No`) and builds resistance-prep data if the attack succeeds.  
- **Locking.** Uses `lockPriority: "advanced"` so only one firearm attack per actor runs at a time.

---

## Responsibilities

- **Precompute context.**
  - Call into `FirearmService.beginAttack()` to snapshot plan/damage and ammo state.
  - Maintain `#attackCtx` with plan/damage/ammoId for later resolution.
- **Modifiers.**
  - Sync recoil modifiers (`syncRecoil`) and reset recoil state (`resetRecoil`).
  - Apply range modifiers with `primeRangeForWeapon`.
- **Execution.**
  - Standard roll lifecycle: `execute → onChallengeWillRoll → SR3ERoll.evaluate → onChallengeResolved`.
  - On resolution, commits effects (ammo, recoil) and clears local contests.
- **Contest export.**
  - `exportForContest()` builds defender prompt (kind: `"dodge"`).
  - Includes attack plan, damage snapshot, TN base/modifiers, and prompt text.
- **Resistance prep.**
  - `buildResistancePrep()` returns a structure for `ResistanceProcedure`, including base TN (attack power) and resistance modifiers.

---

## Typical flow

1. **Setup.** Attacker + weapon item bound.  
2. **Precompute.** Call `precompute()` with situational data (rounds, ammo, tokens, range).  
3. **Compose.** Recoil and range modifiers are upserted automatically.  
4. **Execute.** Attacker rolls, results published to chat/log.  
5. **Contest.** If targets are present, `exportForContest()` builds a Dodge defense prompt.  
6. **Resolution.** On success, `buildResistancePrep()` creates the resistance step for the target.

---

## State model (additions)

Besides the `AbstractProcedure` stores, `FirearmProcedure` introduces:

| Store/Field | Purpose |
|-------------|---------|
| `weaponModeStore: Writable<string>` | Tracks current fire mode (`semiauto`, `burst`, etc.). |
| `ammoAvailableStore: Writable<number>` | Tracks remaining ammo in the weapon. |
| `#attackCtx` (private) | Snapshot of plan/damage/ammo for resolution. |
| `#selectedPoolKey` (private) | Override for which pool key contributes. |

---

## Roll lifecycle

```text
execute({ OnClose?, CommitEffects? })
  ├─ OnClose?.()
  ├─ baseRoll = SR3ERoll.create(buildFormula(true), { actor })
  ├─ onChallengeWillRoll({ baseRoll, actor })
  ├─ roll = await baseRoll.evaluate(this)
  ├─ await baseRoll.waitForResolution()
  ├─ CommitEffects?.()
  ├─ expire local contests (if any)
  ├─ Hooks.callAll("actorSystemRecalculated", actor)
  ├─ onChallengeResolved({ roll, actor }) → FirearmService.onAttackResolved
  └─ return roll
````

---

## API reference

### Modifiers & recoil

* `resetRecoil()` – Reset all recoil for the actor via `FirearmService`.
* `syncRecoil({ declaredRounds, ammoAvailable? })` – Compute recoil modifier and update `tnModifiers`.
* `primeRangeForWeapon(attackerToken, targetToken, rangeShiftLeft?)` – Compute and apply range modifiers.
* `tnModifiers` – Alias of `modifiersArrayStore` for recoil/range.

### Precompute & context

* `precompute({ declaredRounds?, ammoAvailable?, attackerToken?, targetToken?, rangeShiftLeft? })` – Build plan/damage context for the shot and seed ammo/mode stores.
* `weaponModeStore` – Writable fire mode state.
* `ammoAvailableStore` – Writable ammo state.

### Roll orchestration

* `async execute({ OnClose?, CommitEffects? })` – Standard lifecycle; commits ammo/recoil effects and expires contests.
* `async onChallengeResolved({ roll, actor })` – If no `#attackCtx`, recomputes; then calls `FirearmService.onAttackResolved`.

### Contest & resistance

* `getPrimaryActionLabel()` – Returns “Fire \[Weapon]” or generic fire label.
* `getKindOfRollLabel()` – Returns localized “Challenge” or “Roll”.
* `exportForContest()` – Exports contest payload (attacker, weapon, TNs, plan/damage, prompt for Dodge).
* `getResponderPromptHTML(exportCtx)` – Builds the Dodge prompt (Yes/No).
* `buildDefenseProcedure(exportCtx, { defender, contestId })` – Instantiates a `DodgeProcedure` for the target.
* `buildResistancePrep(exportCtx, { initiator, target })` – Returns TN base (attack power) + resistance mods for damage soak.
* `renderContestOutcome(exportCtx, ctx)` – Custom contested outcome: attacker vs. defender with TN breakdown and pools.

---

## Scope of this documentation

This page describes the **attacker-side firearm flow**.
Defender-side (`DodgeProcedure`) and damage resolution (`ResistanceProcedure`) are documented separately.