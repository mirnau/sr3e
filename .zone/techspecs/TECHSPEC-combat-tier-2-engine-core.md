# Tier 2 — Engine Core + Circular Import Fix

> Expanded. Infrastructure layer — types, registry, serialization, lock, contest bookkeeping. No game rules here. No HTML. No Svelte.

## The circular import problem (and the fix)

Old system had a hard circular dependency:

```
AbstractProcedure.js  →  OpposeRollService.js  (deliverResponse, expireContest)
OpposeRollService.js  →  AbstractProcedure.js  (fromJSON to rehydrate initiator)
```

Fix: split responsibilities so the dependency graph is a DAG.

```
procedureSerializer.ts   (no upstream deps in combat/)
        ↓
contestCoordinator.ts    (imports serializer, not registry)
        ↓
tier 3 procedures        (import registry + coordinator)
```

`procedureSerializer.ts` knows how to hydrate a procedure from JSON. `contestCoordinator.ts` uses it. Neither imports the other. No cycle.

---

## Target path: `module/services/combat/engine/`

---

## 1. `types.ts`

Shared types used across tiers. Single source of truth.

```ts
// From tier 1 — defined here, imported by diceFormula.ts
type RollState = {
  dice: number;
  poolDice: number;
  karmaDice: number;
  targetNumber: number | null;
  modifiers: Modifier[];       // Modifier defined in modifierList.ts
};

// Passed into every procedure execution
type CombatContext = {
  attacker: SR3EActor;
  weapon: SR3EItem | null;
  targets: Token[];
  rollState: RollState;
  directives: Directive[];     // Directive defined in damagePacket.ts
};

// Returned from every procedure execution
type CombatResult = {
  roll: SR3ERoll;
  netSuccesses: number;
  damagePacket: DamagePacket | null;
  resistancePrep: ResistancePrep | null;
  chatHtml: string;
};

// What the initiator sends to the defender's client
type ContestStub = {
  contestId: string;
  initiator: { actorId: string; userId: string };
  target: { actorId: string; name: string; tokenId: string | null; sceneId: string | null };
  initiatorRoll: RollSnapshot;
  procedureKind: string;       // registry key
  exportCtx: ContestExport;
  defenseHint: DefenseHint;
};

// What a procedure exports before the contest starts
type ContestExport = {
  familyKey: string;
  weaponId: string | null;
  weaponName: string;
  plan: AttackPlan | null;
  damage: DamagePacket | null;
  tnBase: number;
  tnMods: Modifier[];
  next: {
    kind: string;              // defender procedure kind
    ui: Record<string, string>; // prompt/button labels
    args: Record<string, unknown>;
  };
};

type DefenseHint = {
  type: "attribute" | "skill";
  key: string;
  tnMod: number;
  tnLabel: string;
};

type RollSnapshot = {
  // Foundry Roll.toJSON() shape + sr3e metadata
  terms: unknown[];
  options: { targetNumber?: number; [k: string]: unknown };
  meta: { flavor: string; procedureKind: string };
};

type ResistancePrep = {
  familyKey: string;
  weaponId: string | null;
  weaponName: string;
  tnBase: number;
  tnMods: Modifier[];
  stagedStepBeforeResist: DamageStep;
  trackKey: DamageTrack;
};

type AttackPlan = {
  modeName?: string;
  declaredRounds?: number;
  powerDelta?: number;
  levelDelta?: number;
  notes?: string[];
};
```

---

## 2. `procedureRegistry.ts`

Replaces `AbstractProcedure.#registry`. Standalone Map. No class.

```ts
type ProcedureBuilder = (ctx: CombatContext) => Promise<CombatResult>;

// module-level Map
const registry = new Map<string, ProcedureBuilder>();

function registerProcedure(kind: string, builder: ProcedureBuilder): void
// throws if kind already registered (dev guard)

function getProcedure(kind: string): ProcedureBuilder
// throws if not found — caller must register before use

function listKinds(): string[]

// Known kinds — register at system init:
// "skill" | "attribute" | "firearm" | "melee" | "explosive"
// | "dodge" | "resistance" | "melee-defense"
```

Builders are registered in `module/sr3e.ts` (the system init hook), not in the procedure files themselves. Avoids eager imports pulling in the whole combat tree at startup.

---

## 3. `procedureSerializer.ts`

Replaces `AbstractProcedure.toJSON()` / `fromJSON()`. Pure functions. No class.

Procedures in the new system are functions, not stateful objects — so "serialization" means capturing the inputs needed to rehydrate context on a remote client.

```ts
type SerializedProcedure = {
  schema: 2;               // bump from old schema 1 — breaking change, not backwards-compatible
  kind: string;
  actor: { id: string; uuid: string };
  item: { id: string | null; uuid: string | null };
  rollState: RollState;
  exportCtx: ContestExport;
};

function serializeProcedure(
  kind: string,
  actor: SR3EActor,
  item: SR3EItem | null,
  rollState: RollState,
  exportCtx: ContestExport,
): SerializedProcedure

async function deserializeProcedure(
  json: SerializedProcedure,
  opts?: { resolveActor?: (ref) => Promise<SR3EActor>; resolveItem?: (ref, actor) => Promise<SR3EItem | null> }
): Promise<{ kind: string; actor: SR3EActor; item: SR3EItem | null; rollState: RollState; exportCtx: ContestExport }>
```

Default resolvers use `fromUuid()` then fall back to `game.actors.get()` — same pattern as old code, but not buried in the base class.

**Schema 2 note:** Old serialized procedures (schema 1) are not compatible. Contest stubs are ephemeral (in-flight only), so no migration needed.

---

## 4. `procedureLock.ts`

Port of `ProcedureLock.js`. Already clean — minimal changes. One module-level variable, no class.

```ts
type LockPriority = "simple" | "advanced";  // simple=1, advanced=10

type LockRecord = {
  id: string;
  ownerKey: string;
  priority: number;
  ts: number;
};

// module-level state
let currentLock: LockRecord | null = null;

function acquireLock(ownerKey: string, priority?: LockPriority): string | null
// returns lock id on success; null if blocked by higher-priority holder

function releaseLock(ownerKeyOrId: string): boolean

function assertLock(ownerKey: string, priority?: LockPriority): string | false
// convenience: acquire or return false (no callback needed)

function isLocked(): boolean
function currentOwner(): string | null
```

**Rule:** `firearm` and `melee` procedures use `"advanced"`. Skill/attribute rolls use `"simple"`. Advanced blocks simple but not vice versa. Prevents a quick skill roll opening during an active combat exchange.

---

## 5. `contestCoordinator.ts`

Replaces `OpposeRollService.js`. Split into two concerns:

- **Bookkeeping** (this file): Map management, promise resolution, user resolution, stub transport
- **Outcome rendering** (tier 5 / chat renderers): HTML, ChatMessage.create

```ts
// module-level state
const activeContests = new Map<string, ContestRecord>();
const pendingResponses = new Map<string, (data: RollSnapshot) => void>();

type ContestRecord = {
  id: string;
  initiator: { actorId: string; userId: string };
  target: SR3EActor;
  initiatorRoll: RollSnapshot;
  targetRoll: RollSnapshot | null;
  procedure: SerializedProcedure;
  exportCtx: ContestExport;
  defenseHint: DefenseHint;
  phase: "awaiting-response" | "resolved" | "cancelled";
  tokenRef: { tokenId: string | null; sceneId: string | null };
};

// --- lifecycle ---

function startContest(
  serialized: SerializedProcedure,
  exportCtx: ContestExport,
  defenseHint: DefenseHint,
  targetActor: SR3EActor,
  targetToken: Token | null,
  initiatorRoll: RollSnapshot,
): string
// returns contestId; registers locally; sends stub to remote clients via game.socket

function registerContestStub(stub: ContestStub): ContestRecord
// called on receiving client; resolves actor from actorId; stores contest locally

function waitForResponse(contestId: string): Promise<RollSnapshot>
// returns promise that resolves when defender's roll arrives

function deliverResponse(contestId: string, rollData: RollSnapshot): void
// resolves the waiting promise; cleans up pendingResponses

function expireContest(contestId: string): void
// cancels timer, delivers __aborted sentinel, removes from Map

function abortContest(contestId: string, reason: string): void
// expireContest + updates chat message flags + fires Hook

function getContest(contestId: string): ContestRecord | undefined

// --- utilities ---

function computeNetSuccesses(initiatorRoll: RollSnapshot, targetRoll: RollSnapshot): number

function countSuccesses(rollData: RollSnapshot): number
// term.results filtered by r.active && r.result >= targetNumber

function resolveControllingUser(actor: SR3EActor): User | null
// priority: active assigned user → active non-GM owner → active GM
```

**What this module does NOT do:**
- Create `ChatMessage` — that's the caller's job (tier 4 orchestrator or chat renderer)
- Render HTML — tier 5
- Apply damage — tier 4
- Run the defender's procedure — tier 4

---

## Dependency graph (this tier)

```
types.ts
   ↓
modifierList.ts (tier 1)    damageMath.ts (tier 1)
   ↓                               ↓
procedureSerializer.ts ─────────────────────────────┐
procedureRegistry.ts                                 │
procedureLock.ts                                     │
contestCoordinator.ts  ←─────────────────────────────┘
```

No cycles. `contestCoordinator` imports `procedureSerializer` (to deserialize initiator procedure on resolution). `procedureSerializer` imports nothing from this tier.

---

## Implementation order

1. `types.ts` — no deps, defines all shared shapes
2. `procedureLock.ts` — no deps inside combat/
3. `procedureRegistry.ts` — no deps inside combat/
4. `procedureSerializer.ts` — imports `types.ts` only
5. `contestCoordinator.ts` — imports 1, 4

Write 1–4 before touching any tier 3 procedure code.
