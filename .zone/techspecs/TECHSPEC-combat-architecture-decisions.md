# Combat Architecture Decisions

> Expanded. Read before touching any combat tier.

## Decision 1: Composition over inheritance

The old system used `AbstractProcedure` (919 lines) as a base class for all procedure types. This failed:

- All shared logic concentrated in the base class → bloat
- Subclasses duplicated logic anyway (`#summarizeRollGeneric`, `#resolveItemSkillAndSpec`, `#cap` copied verbatim into both `FirearmProcedure` and `MeleeProcedure`)
- Defaulting logic ended up commented out mid-file, broken, too coupled to fix

**Rule:** No abstract base class for procedures. Compose behavior from typed building blocks.

```ts
// NOT this:
abstract class AbstractProcedure { ... }
class FirearmProcedure extends AbstractProcedure { ... }

// THIS:
type CombatProcedure = (ctx: CombatContext) => Promise<CombatResult>;

const firearmAttack: CombatProcedure = (ctx) => pipe(
  resolveRange(ctx),
  applyRecoil(ctx),
  buildFormula,
  rollDice,
  resolveContest,
)(ctx);
```

Shared behavior = shared **functions**, imported where needed. Not inherited.

---

## Decision 2: Separate what AbstractProcedure mixed

The old base class owned eight distinct responsibilities. In the rewrite, each is a separate module:

| Old (AbstractProcedure) | New (separate module) |
|---|---|
| Static registry (`#registry`, `getCtor`) | `ProcedureRegistry.ts` — standalone Map + register/get fns |
| Serialization (`toJSON`, `fromJSON`) | `ProcedureSerializer.ts` — pure functions, no class required |
| Roll state (10+ private stores) | `RollState.ts` — typed object, passed explicitly |
| Modifier management (`upsertMod`, etc.) | `ModifierList.ts` — pure fns over `Modifier[]` |
| Dice formula building (`buildFormula`) | `DiceFormula.ts` — pure fn: `(state: RollState) => string` |
| Defaulting rules | `DefaultingRules.ts` — pure fns |
| Lock management (`ProcedureLock`) | `ProcedureLock.ts` — already separate, keep as-is |
| Contest coordination | `ContestCoordinator.ts` — orchestrates oppose roll flow |

---

## Decision 3: Domain math = pure functions, not classes

Three files in the old system are already correctly designed — stateless, no side effects. Port them as pure TS functions (not classes):

**`DamageMath`** → `src/combat/rules/damageMath.ts`
- `boxesForLevel(step: DamageStep): number` — L=1, M=3, S=6, D=10
- `stageStep(step, delta)` — move up/down the L/M/S/D ladder
- `applyAttackStaging(baseStep, netSuccesses, extraDelta?)` — every 2 net successes = +1 stage
- `applyResistanceStaging(step, bodySuccesses)` — every 2 body successes = −1 stage
- `computeResistanceTN(packet, effArmor)` — TN = Power − effective armor, min 2

**`DamagePacket`** → `src/combat/rules/damagePacket.ts`
- `buildDamagePacket(weapon, plan, directives, rangeBand?)` — pure fn
- Keep the directive key system: `"damage.powerAdd"`, `"armor.mult.ballistic"`, etc. Proven extensible.

**`ArmorResolver`** → `src/combat/rules/armorResolver.ts`
- `computeEffectiveArmor(defender, packet)` — layered armor: highest + ⌊rest/2⌋
- Handles ballistic vs impact, multipliers from directives

---

## Decision 4: HTML rendering is a necessary evil — isolate it

Foundry chat messages require HTML strings. This cannot be avoided. However, HTML generation must **not** live on procedure objects.

**Rule:** HTML for chat = dedicated renderer functions, one per combat family.

```ts
// NOT this (old system):
class FirearmProcedure extends AbstractProcedure {
  async renderContestOutcome(...) { return `<p>...</p>`; }
  #tnBreakdownFromRoll(...) { ... }
  #summarizeRollGeneric(...) { ... }
}

// THIS:
// src/combat/chat/firearmChatRenderer.ts
export function renderFirearmContestOutcome(ctx: FirearmContestCtx): string { ... }
export function renderTNBreakdown(tnBase: number, mods: Modifier[]): string { ... }
// shared:
// src/combat/chat/shared.ts
export function renderRollSummary(roll: SR3ERoll): string { ... }
```

Svelte components handle interactive UI (roll dialog, composer). Chat renderers handle Foundry output. Never mix.

---

## Decision 5: Procedure = context in, result out

A procedure is not a stateful object that lives across turns. It is a function that takes a context and returns a result. Reactive state for the UI (the roll dialog) is separate from the procedure execution itself.

```ts
type CombatContext = {
  attacker: SR3EActor;
  weapon: SR3EItem;
  targets: Token[];
  rollState: RollState;       // dice, TN, modifiers — built by UI
  directives: Directive[];    // from weapon mode / ammo / situational
};

type CombatResult = {
  roll: SR3ERoll;
  netSuccesses: number;
  damagePacket: DamagePacket | null;
  resistancePrep: ResistancePrep | null;
  chatHtml: string;
};
```

---

## Decision 6: Procedure kinds registry stays

`ProcedureFactory` from the old system was actually clean. Keep the concept: a registry mapping `kind` strings to constructor/builder fns. Rename to `ProcedureRegistry`.

Known kinds: `skill`, `attribute`, `firearm`, `melee`, `explosive`, `dodge`, `resistance`, `melee-defense`

---

## Non-obvious rule interpretations (from old system, verified)

- **Defaulting to attribute:** TN +4, pool forbidden (`poolCap: 0`, `forbidPool: true`)
- **Defaulting to related skill:** TN +2, pool capped at `⌊skill rating / 2⌋`
- **Defaulting to specialization:** TN +3, pool capped at `⌊base skill rating / 2⌋`
- **Defaulting disallowed** when: item has `noDefault: true`, OR pre-default TN ≥ 8
- **Melee defense choices:** Standard (reaction-based) vs Full Defense (no attack next action)
- **Layered armor stacking:** sorted descending, highest full + each subsequent × 0.5, floored
- **Resistance TN:** `max(2, Power − effectiveArmor + resistTNAdd)`
- **Open test defaulting:** TN modifier becomes a pool subtraction, not TN add (commented out in old code, rule book source needed)
