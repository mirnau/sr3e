# Tier 4 — Orchestration

> Expanded. The glue layer. Takes a confirmed `ProcedureSetup` + final `RollState` from the UI, runs the correct flow, and drives all downstream effects. No rules logic here — imports tiers 1–3 only.

## Responsibilities

- Acquire / release the procedure lock
- Route to the correct flow (simple / contested / resistance)
- Drive the network round-trip for contested rolls
- Trigger side effects in the right order (ammo, recoil, health, hooks, chat)
- Never render HTML directly — pass data to chat renderer (tier 5)

---

## Target path: `module/services/combat/orchestration/`

---

## 1. Entry point: `executeProcedure`

Called by tier 5 when the user confirms the roll dialog. This is the single seam between UI and engine.

```ts
async function executeProcedure(
  setup: ProcedureSetup,
  finalState: RollState,  // user-adjusted from the dialog
  actor: SR3EActor,
  targets: Token[],       // game.user.targets at confirm time
): Promise<CombatResult>
```

**Steps:**

1. `assertLock(ownerKey, setup.lockPriority)` — reject if blocked, surface UI warning
2. Build formula: `buildFormula(finalState)`
3. Create and evaluate roll: `SR3ERoll.create(formula, { actor })`
4. Attach roll metadata (TN breakdown, pool contributions, skill/attribute info) to `roll.options` via `buildRollSnapshot`
5. `await roll.evaluate()`
6. Branch on `targets.length > 0`:
   - Yes → `executeContestedFlow(setup, finalState, roll, actor, targets)`
   - No → `executeSimpleFlow(setup, finalState, roll, actor)`
7. Release lock in `finally` block — never leak it
8. `Hooks.callAll("actorSystemRecalculated", actor)`
9. Return `CombatResult`

---

## 2. Simple flow

```ts
async function executeSimpleFlow(
  setup: ProcedureSetup,
  state: RollState,
  roll: SR3ERoll,
  actor: SR3EActor,
): Promise<void>
```

1. `await setup.commitFn(roll, actor)` — ammo, recoil, etc.
2. If `setup.selfPublish`: call chat renderer → `ChatMessage.create`
3. Done.

No network. No waiting. No damage.

---

## 3. Contested flow

```ts
async function executeContestedFlow(
  setup: ProcedureSetup,
  state: RollState,
  roll: SR3ERoll,
  actor: SR3EActor,
  targets: Token[],
): Promise<void>
```

For each target (SR3 usually 1, but design for N):

```
a. exportCtx    = setup.exportFn()
b. initiatorRoll = buildRollSnapshot(roll, setup, state)
c. serialized   = serializeProcedure(setup.kind, actor, weapon, state, exportCtx)
d. contestId    = startContest(serialized, exportCtx, setup.defenseHint,
                               targetActor, targetToken, initiatorRoll)
e. post "awaiting response" whisper chat
f. defenderRoll = await waitForResponse(contestId)
g. if defenderRoll.__aborted → treat as 0 defense successes
h. netSuccesses = computeNetSuccesses(initiatorRoll, defenderRoll)
i. post contest outcome chat (via renderer)
j. if netSuccesses > 0 AND exportCtx.damage:
     resistPrep = buildResistancePrep(exportCtx, targetActor, netSuccesses)
     await promptResistance(resistPrep, targetActor)
k. await setup.commitFn(roll, actor)   // ammo consume, recoil bump
```

**Abort handling:** If defender never responds, a timeout in `contestCoordinator` fires `expireContest` → delivers `{ __aborted: true }`. Orchestrator treats as 0 defense successes — attack lands at base damage level.

**Multiple targets:** Each target gets its own `contestId`. Contests run sequentially — SR3 is turn-based.

---

## 4. Defender response flow

Runs on the **defender's client** after receiving a `ContestStub` via socket.

```ts
async function handleContestStub(stub: ContestStub): Promise<void>
```

1. `registerContestStub(stub)` → stores contest locally
2. Resolve defender actor from `stub.target.actorId`
3. Build the defense `ProcedureSetup`:
   - `kind = stub.exportCtx.next.kind` (e.g. `"dodge"`, `"melee-defense"`)
   - Args from `stub.exportCtx.next.args` + `contestId`
   - For melee defense: pass `defenseHint` from stub to `buildMeleeDefenseSetup`
4. Open defender roll dialog (tier 5) with the setup
5. When defender confirms → `executeProcedure(defenseSetup, finalState, defender, [])`
   - defense `commitFn` calls `deliverResponse(contestId, roll.toJSON())`
6. If defender declines: `expireContest(contestId)` → resolves waiter with `__aborted`

**Melee defense basis resolution (non-obvious):** `DefenseHint` names a skill/attribute. Defender's client resolves actual dice from actor data. `buildMeleeDefenseSetup` does this lookup — not the orchestrator.

---

## 5. Resistance flow

```ts
async function promptResistance(
  prep: ResistanceBuild & ResistancePrep,
  defender: SR3EActor,
): Promise<void>
```

Posts a whispered `ChatMessage` to the defender's controlling user with:
- Damage level + track ("Serious Physical")
- Resistance TN breakdown (from `prep.tnMods`)
- A button that opens the resistance roll dialog

When defender clicks "Roll Resistance":

```ts
async function executeResistanceRoll(
  prep: ResistancePrep,
  defender: SR3EActor,
  finalState: RollState,
): Promise<void>
```

1. Roll body dice at resistance TN
2. `bodySuccesses = countSuccesses(roll, prep.tn)`
3. `outcome = ResistanceEngine.resolve(prep, bodySuccesses)`
4. Apply boxes to health track: `defender.update({ [trackPath]: next })`
5. Overflow: if physical track full → `system.health.overflow.value += overflow`
6. Post result chat (via renderer)
7. `Hooks.callAll("actorSystemRecalculated", defender)`

**Health track paths:**
- Physical: `system.health.physical.value`
- Stun: `system.health.stun.value`
- Overflow (physical only): `system.health.overflow.value`

---

## 6. Full defense tracking

Melee full defense costs the defender's next attack action. Track via actor flag:

```ts
// Set when defender uses full defense:
await defender.setFlag("sr3e", "fullDefenseUntil", { round, pass });

// Checked at executeProcedure entry for attack procedures:
const flag = actor.getFlag("sr3e", "fullDefenseUntil");
if (flag && matchesCurrentPhase(flag)) {
  // reject attack, post UI warning
}
```

Flag clears at start of the next initiative pass (`Hooks.on("combatTurn")`).

---

## 7. Roll snapshot helper

```ts
function buildRollSnapshot(
  roll: SR3ERoll,
  setup: ProcedureSetup,
  state: RollState,
): RollSnapshot
```

Attaches to `roll.options`:
- `targetNumber` — `computeFinalTN(state, 2)`
- `tnBase`, `tnMods` — for renderer
- `baseDice`, `poolDice`, `karmaDice`
- `type` — `"skill"` | `"attribute"` | `"item"`
- `skill` / `attributeKey` / `pools` — family-specific

Mirrors old `AbstractProcedure.onChallengeWillRoll` — now a pure fn, no `this`.

---

## 8. Socket wiring

Registered in `module/sr3e.ts` at `Hooks.once("ready")`:

```ts
game.socket.on("system.sr3e", (msg) => {
  switch (msg.type) {
    case "contestStub":   handleContestStub(msg.data);        break;
    case "resistPrompt":  handleResistancePrompt(msg.data);   break;
    case "contestAbort":  expireContest(msg.data.contestId);  break;
  }
});
```

`startContest` emits `"contestStub"`. `promptResistance` emits `"resistPrompt"` if defender is on a different client. All socket payloads are id-only — docs resolved locally on receiving client.

---

## 9. `classifyWeapon`

Port of `ComposerAttackController.classifyWeapon`. Lives in `orchestration/weaponClassifier.ts`. Routes entry to the correct `buildXxxSetup` call.

```ts
type WeaponClass = {
  isFirearm: boolean;
  isMelee: boolean;
  mode: string;
  ammoAvailable: number | null;
  declaredRounds: number;
};

function classifyWeapon(weapon: SR3EItem): WeaponClass
// Firearm signals: ammoId/ammunitionClass present, or known firearm mode
// Burst default rounds: min(3, ammoAvailable)
// Full-auto default rounds: clamp(max(3, ammoAvailable ?? 6), 3, 10)
```

---

## Implementation order

1. `weaponClassifier.ts` — no upstream combat deps
2. `rollSnapshot.ts` — tier 1 (diceFormula, modifierList)
3. `simpleFlow.ts` — tier 2 + tier 3
4. `resistanceFlow.ts` — tier 1 (ResistanceEngine) + tier 3
5. `defenderFlow.ts` — tier 2 (contestCoordinator, serializer) + tier 3
6. `contestedFlow.ts` — tier 2 (all) + tier 3 + resistanceFlow
7. `executeProcedure.ts` — assembles all flows; wired last
