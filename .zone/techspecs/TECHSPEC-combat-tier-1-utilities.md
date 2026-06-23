# Tier 1 — Combat Utilities

> Expanded. These are the pure-function building blocks for all combat tiers. Implement these first; nothing above depends on anything below this tier.

## Overview

All modules in this tier are pure functions or isolated stateful singletons with no Foundry UI dependencies. Each file stays under 100 lines. No classes unless the old code had a justified reason — and in most cases it didn't.

Target path: `module/services/combat/`

---

## 1. `damageMath.ts`

Port of `DamageMath.js`. Pure functions only.

```ts
type DamageStep = "l" | "m" | "s" | "d";
type DamageTrack = "physical" | "stun";

function boxesForLevel(step: DamageStep): number
// l=1, m=3, s=6, d=10

function splitDamageType(t: string): { step: DamageStep; track: DamageTrack }
// "m" | "mstun" | "l" | "lstun" etc.
// "stun" in string → stun track; otherwise physical

function stageStep(step: DamageStep, delta: number): DamageStep | null
// Move up/down the L→M→S→D ladder. null = staged off (no damage)

function applyAttackStaging(base: DamageStep, netSuccesses: number, extraDelta?: number): DamageStep
// Every 2 net attack successes = +1 stage up

function applyResistanceStaging(step: DamageStep, bodySuccesses: number): DamageStep | null
// Every 2 body successes = −1 stage. null = staged off

function computeResistanceTN(power: number, effectiveArmor: number, resistTNAdd?: number): number
// max(2, power − effectiveArmor + resistTNAdd)
```

---

## 2. `damagePacket.ts`

Port of `DamagePacket.js`. Builder fn — no class.

```ts
type Directive = { k: string; v: string | number };

// AttackPlan — output of planFire / WeaponModePlanners.plan
type AttackPlan = {
  modeName?: string;       // e.g. "semiauto", "burst"
  declaredRounds?: number;
  roundsFired: number;     // actual rounds consumed (burst/FA can differ from declared)
  attackerTNMod: number;   // recoil penalty already applied to attacker's TN
  powerDelta: number;      // burst/FA power bonus added to base weapon power
  levelDelta: number;      // damage staging level shifts
  notes: string[];         // e.g. ["BF"], ["FA 10"]
};

type DamagePacket = {
  power: number;
  damageType: string;       // raw string, splitDamageType parses it
  levelDelta: number;
  attackTNAdd: number;
  resistTNAdd: number;
  armorUse: "ballistic" | "impact";
  armorMult: { ballistic: number; impact: number };
  notes: string[];          // special flags e.g. "flechette"
};

function buildDamagePacket(
  weapon: SR3EItem,
  plan: AttackPlan,
  directives?: Directive[],
  rangeBand?: RangeBand | null,   // band string only — RangeBandData was a dead-code stub
): DamagePacket
```

**Directive key system** (keep verbatim — proven extensible):
- `"damage.powerAdd"` — adds to power
- `"damage.levelDelta"` — shifts staging level
- `"damage.type"` — overrides damage type string
- `"attack.tnAdd"` — adds to attack TN
- `"resist.tnAdd"` — adds to resistance TN
- `"armor.use"` — `"ballistic"` | `"impact"`
- `"armor.mult.ballistic"` — multiplies ballistic armor (multiplicative stacking)
- `"armor.mult.impact"` — multiplies impact armor
- `"special.*"` — appends to `notes[]`

---

## 3. `armorResolver.ts`

Port of `ArmorResolver.js`. Pure fn.

```ts
type EffectiveArmor = {
  armorType: "ballistic" | "impact" | "flechette" | "flechette-unarmored";
  base: number;
  effective: number;
  ballisticBase: number;
  impactBase: number;
};

function computeEffectiveArmor(defender: SR3EActor, packet: DamagePacket): EffectiveArmor
```

**Layering rule:** Collect all equipped wearables' ratings for the relevant type. Sort descending. `total = highest + ∑⌊rest[i] / 2⌋`. Then apply `packet.armorMult`.

Flechette handling is in `resistanceEngine.ts` — keep it out of here.

---

## 4. `resistanceEngine.ts`

Port of `ResistanceEngine.js`. Orchestrates damageMath + armorResolver. Two-phase: `build` then `resolve`.

```ts
type ResistanceBuild = {
  trackKey: DamageTrack;
  tnBase: number;
  tnMods: Modifier[];       // [{id, name, value}] for chat rendering
  tn: number;               // final, min 2
  armor: EffectiveArmor;
  stagedStepBeforeResist: DamageStep;
  boxesIfUnresisted: number;
};

type ResistanceResult = {
  applied: boolean;
  finalStep: DamageStep | null;
  trackKey: DamageTrack;
  boxes: number;
  notes: string[];
};

function buildResistance(
  defender: SR3EActor,
  packet: DamagePacket,
  netAttackSuccesses: number,
): ResistanceBuild

function resolveResistance(build: ResistanceBuild, bodySuccesses: number): ResistanceResult
```

**Flechette special case** (non-obvious — verified from old code):
- No armor at all → staged step +1 before resist, armor excluded from TN
- Armored → `effectiveArmor = max(ballistic, ⌊2 × impact⌋)`

---

## 5. `rangeService.ts`

Port of `RangeService.js` + helpers. Pure fns (Foundry `canvas.grid.measurePath` is a dependency, mock it in tests).

```ts
type RangeBand = "short" | "medium" | "long" | "extreme";

type RangeResolution = {
  distance: number;
  rawBand: RangeBand | null;
  band: RangeBand | null;   // after left-shift
  baseTN: number | null;    // null = out of range
};

const BASE_TN: Record<RangeBand, number> = {
  short: 4, medium: 5, long: 6, extreme: 9,
};

function resolveRange(
  weapon: SR3EItem,
  attackerToken: Token,
  targetToken: Token,
  shiftLeft?: number,
): RangeResolution

function rangeTNDelta(band: RangeBand): number
// delta from short (base 4): short=0, medium=1, long=2, extreme=5

function rangeModifier(resolution: RangeResolution): Modifier | null
// null if short (no mod); value=999 if out of range
```

**Left-shift:** Weapon mods (e.g. laser sight) can shift the effective band toward shorter. `shiftLeft=1` on `long` → treated as `medium`.

---

## 6. `recoilTracker.ts`

Port of `RecoilTracker.js`. Stateful singleton — module-level Maps, no class needed.

**Two tracking contexts:**
- **In combat:** keyed by `"${round}:${pass}:${actorId}"`. Phase key changes when round/pass advances → stale entries auto-cleared on next read.
- **Out of combat (OOC):** windowed by timestamp. Default window = 3000ms. Shots older than the window don't count.

```ts
function inCombat(): boolean

function getPhaseShots(actorId: string): number
function bumpPhaseShots(actorId: string, count?: number): void

function getOOCShots(actorId: string): number
function bumpOOCShots(actorId: string, count?: number): void

function resetRecoil(actorId: string): void         // current phase/window only
function resetAllRecoil(actorId: string): void       // clears all phases + OOC

function recoilModifier(actorId: string, weapon: SR3EItem, declaredRounds: number): Modifier | null
// Returns a TN modifier; null if no accumulated recoil
// Recoil = prior shots fired this phase (not counting this burst)
```

**Recoil formula by firing mode (SR3 pp. 110–115):**

| Mode | Penalty |
|---|---|
| SS | 0 — no recoil |
| SA 1st shot | 0 |
| SA 2nd shot | +1 |
| BF | +3 per burst, cumulative |
| FA | +1 per round fired, cumulative across all bursts this phase |
| Short burst (2 rounds left) | +2 flat |

**Multipliers:**
- Heavy weapons (LMG, MMG, HMG, Assault Cannon): all recoil × 2 (SR3 p. 111)
- Shotgun in BF: recoil × 2 (SR3 p. 111)
- Mounted weapon: recoil ÷ 2 before other factors — cancels heavy weapon doubling (SR3 p. 151)
- Dual wield: uncompensated recoil from one weapon applies as penalty to the other (SR3 p. 112)

---

## 7. `modifierList.ts`

New module — extracts modifier management from AbstractProcedure. Pure fns over `Modifier[]`.

```ts
type Modifier = {
  id?: string;
  name: string;
  value: number;
  poolCap?: number;       // caps pool dice to this
  forbidPool?: boolean;   // ban pool dice entirely
  meta?: Record<string, unknown>;
};

function upsertMod(mods: Modifier[], mod: Modifier): Modifier[]
// immutable: match by id (if present) else name; replace or append

function removeMod(mods: Modifier[], id: string): Modifier[]

function sumMods(mods: Modifier[]): number

function poolCap(mods: Modifier[]): number
// min of all poolCap values; Infinity if none present

function poolForbidden(mods: Modifier[]): boolean
// true if any mod has forbidPool: true
```

---

## 8. `defaultingRules.ts`

New module — extracted from AbstractProcedure (was partially commented out, now clean). Pure fns.

```ts
type DefaultingMode = "attribute" | "skill" | "specialization" | "none";

type DefaultingResult = {
  mode: DefaultingMode;
  dice: number;
  mods: Modifier[];
};

function computeDefaulting(
  skill: SR3EItem | null,
  specIndex: number | null,
  linkedAttributeKey: string | null,
  caller: SR3EActor,
): DefaultingResult
```

**Rules (non-obvious — verified from old code):**

| Defaulting to | TN mod | Pool cap | Pool forbidden |
|---|---|---|---|
| Attribute | +4 | — | yes |
| Related skill | +2 | ⌊skill rating / 2⌋ | no |
| Specialization | +3 | ⌊base skill rating / 2⌋ | no |

**Guard conditions** (defaulting disallowed):
- Item has `system.noDefault === true`
- Pre-default TN (base + non-defaulting mods) ≥ 8

**Open test defaulting:** Rulebook source needed before implementing. Old code had it commented out. Do not guess. Leave a `TODO` stub.

---

## 9. `diceFormula.ts`

New module — extracted from AbstractProcedure. Pure fn.

```ts
type RollState = {
  dice: number;         // skill/attribute base dice
  poolDice: number;     // user-selected pool contribution
  karmaDice: number;    // karma dice added
  targetNumber: number | null;
  modifiers: Modifier[];
};

function buildFormula(state: RollState, explodes?: boolean): string
// e.g. "8d6x5" — totalDice = dice + clampedPool + karma, x = finalTN
// if TN null → "Nd6x" (no threshold, for open tests)
// if totalDice ≤ 0 → "0d6"

function computeFinalTN(state: RollState, floor?: number): number | null
// base TN + sum of modifiers; null if targetNumber null; floor applied after

function computePoolDice(state: RollState, available: number): number
// min(poolDice, poolCap(mods), available); 0 if poolForbidden
```

---

## Implementation order

1. `damageMath.ts` — no deps
2. `modifierList.ts` — no deps
3. `damagePacket.ts` — no deps (weapon + plan are plain data)
4. `armorResolver.ts` — no deps
5. `resistanceEngine.ts` — depends on 1, 4
6. `rangeService.ts` — depends on Foundry canvas (inject/mock)
7. `recoilTracker.ts` — depends on Foundry game.combat
8. `diceFormula.ts` — depends on 2
9. `defaultingRules.ts` — depends on 2

All nine files are independently testable with plain data. Write unit tests alongside each file.
