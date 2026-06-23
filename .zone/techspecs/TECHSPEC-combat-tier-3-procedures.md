# Tier 3 — Procedure System

> Expanded. Seven procedure types, two family services. All pure setup functions — no classes, no state, no rolling. Execution lives in Tier 4.

## Core concept: setup vs. execute

The old system coupled setup and execution inside a class instance. Tier 3 only does **setup**: given an actor and weapon, compute the initial `RollState`, the `ContestExport`, and the post-roll side effects. The UI presents this state. Tier 4 orchestrates the actual roll.

```ts
type ProcedureSetup = {
  kind: string;
  title: string;
  rollState: RollState;           // initial dice/TN/modifiers for UI
  lockPriority: "simple" | "advanced";
  selfPublish: boolean;           // should procedure post its own chat message
  exportFn: () => ContestExport;  // called just before contest starts
  defenseHint: DefenseHint;
  commitFn: (roll: SR3ERoll, actor: SR3EActor) => Promise<void>; // post-roll side effects
};
```

Every procedure builder returns a `ProcedureSetup`. The UI binds to `rollState`. Tier 4 calls `exportFn()` and `commitFn()` at the right moments.

---

## Target path: `module/services/combat/procedures/`

---

## 1. Family services

### `firearmFamily.ts`

Port of `FirearmService.js`. Drop the delegation wrappers (old code had `FirearmService.resetRecoil` call `RecoilTracker.resetRecoil` — just call the tracker directly). Keep the planning and damage resolution logic.

```ts
type FirearmPlan = {
  mode: string;
  roundsFired: number;
  attackerTNMod: number;   // recoil TN penalty
  powerDelta: number;
  levelDelta: number;
  notes: string[];
};

function planFire(weapon: SR3EItem, opts: {
  phaseShotsFired?: number;
  declaredRounds?: number;
  ammoAvailable?: number | null;
}): FirearmPlan

function beginAttack(actor: SR3EActor, weapon: SR3EItem, opts: {
  declaredRounds?: number;
  ammoAvailable?: number | null;
  attackerToken?: Token | null;
  targetToken?: Token | null;
  rangeShiftLeft?: number;
}): { plan: FirearmPlan; damage: DamagePacket; ammoId: string }

function prepareFirearmResistance(
  defender: SR3EActor,
  plan: FirearmPlan,
  damage: DamagePacket,
  netAttackSuccesses?: number,
): ResistanceBuild

async function onFirearmAttackResolved(
  actor: SR3EActor,
  weapon: SR3EItem,
  plan: FirearmPlan,
): Promise<void>
// consumes ammo + bumps recoil tracker
```

### `meleeFamily.ts`

Port of `MeleeService.js`.

```ts
function planStrike(attacker: SR3EActor, weapon: SR3EItem, situational?: {
  calledShot?: boolean;
  calledShotStages?: number;
}): DamagePacket
// Power = STR + weapon.system.damage (non-obvious: damage field is the +X modifier, not total)
// Armor type forced to "impact" (melee always uses impact armor)

function prepareMeleeResistance(
  defender: SR3EActor,
  packet: DamagePacket,
  netAttackSuccesses?: number,
): ResistanceBuild
```

**Non-obvious melee rules:**
- `power = attacker.system.attributes.strength.total + weapon.system.damage`
- Armor type is always `"impact"` — directive `{ k: "armor.use", v: "impact" }` injected before packet build
- Called shot: adds `levelDelta`, notes `"called-shot"`

---

## 2. Procedure builders

### `buildSkillSetup(actor, skillId, specIndex?, title?): ProcedureSetup`

```ts
// dice = spec value if available, else skill value
// pool cap modifier if spec exists but skill has no spec-specific value: poolCap = ⌊skill.value / 2⌋
// lockPriority: "simple"
// selfPublish: true
// defenseHint: { type: "skill", key: skillId }
// commitFn: no-op (no side effects)
// exportFn: { familyKey: "skill", skillId, skillName, specName, poolKey, next: { kind: "skill-response", ui: ... } }
```

### `buildAttributeSetup(actor, attributeKey, title?): ProcedureSetup`

```ts
// dice = actor.system.attributes[attributeKey].total ?? .value
// lockPriority: "simple"
// selfPublish: true
// defenseHint: { type: "attribute", key: attributeKey }
// commitFn: no-op
```

### `buildFirearmSetup(actor, weapon, opts): ProcedureSetup`

```ts
type FirearmOpts = {
  declaredRounds?: number;
  ammoAvailable?: number | null;
  attackerToken?: Token | null;
  targetToken?: Token | null;
  rangeShiftLeft?: number;
};

// Calls beginAttack() to get plan + damage packet
// Initial modifiers: recoil mod + range mod (if tokens known)
// TN: base 4 (weapon difficulty), overridden by range band if target present
// dice: from weapon's linked skill (or defaulting rules if isDefaulting)
// lockPriority: "advanced"
// selfPublish: true
// commitFn: calls onFirearmAttackResolved (ammo + recoil)
// exportFn: builds ContestExport with plan, damage, next.kind = "dodge"
// defenseHint: { type: "attribute", key: "reaction" }
```

### `buildMeleeSetup(actor, weapon, opts?): ProcedureSetup`

```ts
// Calls planStrike() to snapshot a packet
// TN: base 4 (melee difficulty)
// dice: from weapon's linked skill (or defaulting)
// lockPriority: "advanced"
// selfPublish: true
// commitFn: no-op (no ammo/recoil for melee)
// exportFn: ContestExport with damage packet, next.kind = "melee-defense"
//   next.ui includes BOTH "standard" and "full" labels (not just yes/no)
// defenseHint: { type: "skill", key: "melee" }
```

### `buildDodgeSetup(defender, contestId): ProcedureSetup`

```ts
// dice: from reaction attribute (defender.system.attributes.reaction.total)
// TN: 4 (fixed — dodge is always TN 4 in SR3)
// lockPriority: "simple" (dodge doesn't block other advanced procedures)
// selfPublish: false (resolution message handles output)
// commitFn: calls contestCoordinator.deliverResponse(contestId, roll.toJSON())
// exportFn: no-op (dodge doesn't start a new contest)
// defenseHint: none
```

**Non-obvious:** Dodge never starts its own opposed flow. `hasTargets` = false always. Roll is delivered directly to the waiting contest via `deliverResponse`.

### `buildMeleeDefenseSetup(defender, basis, mode, contestId): ProcedureSetup`

```ts
type MeleeDefenseBasis = {
  type: "attribute" | "skill";
  key: string;
  name: string;
  dice: number;
  isDefaulting?: boolean;
  // skill-specific:
  id?: string;
  specialization?: string | null;
  specIndex?: number | null;
};

type MeleeDefenseMode = "standard" | "full";

// dice: from basis.dice (pre-resolved by the calling side before dispatch)
// TN: 4 base
// Full defense: no pool dice (poolForbidden implicitly — formula excludes pool)
// lockPriority: "advanced"
// selfPublish: false
// commitFn: deliverResponse(contestId, roll.toJSON())
```

**Non-obvious:** Full defense mode disallows pool contribution entirely. The `buildFormula` equivalent must exclude `poolDice` when mode is `"full"`.

### `buildResistanceSetup(defender, prep): ProcedureSetup`

```ts
// dice: defender.system.attributes.body.total ?? .value  (min 1)
// TN: prep.tnBase (already computed by ResistanceEngine.build)
// Initial modifiers: prep.tnMods (armor, etc.) pre-loaded — user cannot remove these
// lockPriority: "advanced"
// selfPublish: false
// commitFn: full damage resolution pipeline:
//   1. countSuccesses(roll, TN) → bodySuccesses
//   2. ResistanceEngine.resolve(prep, bodySuccesses) → outcome
//   3. apply boxes to defender health track
//   4. post result chat message
// defenseHint: { type: "attribute", key: "body" }
```

**Non-obvious:** `prep.tnMods` are locked — they represent armor calculation and must not be user-editable. Distinguish them from user-adjustable situational mods in the UI (different `source` field on `Modifier`).

---

## 3. Registration

All builders are registered in `module/sr3e.ts` at `Hooks.once("init")`:

```ts
registerProcedure("skill",         (ctx) => executeProcedure(buildSkillSetup(...), ctx));
registerProcedure("attribute",     (ctx) => executeProcedure(buildAttributeSetup(...), ctx));
registerProcedure("firearm",       (ctx) => executeProcedure(buildFirearmSetup(...), ctx));
registerProcedure("melee",         (ctx) => executeProcedure(buildMeleeSetup(...), ctx));
registerProcedure("dodge",         (ctx) => executeProcedure(buildDodgeSetup(...), ctx));
registerProcedure("melee-defense", (ctx) => executeProcedure(buildMeleeDefenseSetup(...), ctx));
registerProcedure("resistance",    (ctx) => executeProcedure(buildResistanceSetup(...), ctx));
```

`executeProcedure` is the Tier 4 orchestrator. Tier 3 knows nothing about it.

---

## 4. Non-obvious rules summary

| Procedure | Non-obvious |
|---|---|
| Firearm | Recoil accumulates across attacks this initiative pass; OOC uses time window (3s) |
| Melee | Power = STR + weapon damage bonus; armor type always impact |
| Dodge | Always TN 4; never starts new contest; delivers response directly |
| Melee defense full | No pool dice; no subsequent attack action (enforced by Tier 4 turn tracking) |
| Resistance | Prep TN mods are locked (armor calc); body min 1 die even if attribute is 0 |
| Skill | Spec without own value → pool cap = ⌊base rating / 2⌋ |

---

## Implementation order

1. `meleeFamily.ts` — depends on tier 1 (DamagePacket, DirectiveRegistry)
2. `firearmFamily.ts` — depends on tier 1 (same + RecoilTracker, RangeService, AmmoService)
3. All procedure builders — depend on tier 1 (RollState, modifierList), tier 2 (types, contestCoordinator), families above
4. Registration — last, in `sr3e.ts` init hook
