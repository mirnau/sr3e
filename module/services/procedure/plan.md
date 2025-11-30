# TypeScript Migration Plan for Procedure System

## Executive Summary

This plan outlines the conversion of the SR3E procedure system from JavaScript to TypeScript, focusing on type safety, code deduplication, and architectural improvements. The migration will introduce strong typing through interfaces, generics, and discriminated unions while preserving the existing Svelte store reactivity and serialization patterns.

---

## 1. Core Type Definitions

### 1.1 File: `types/procedure.types.ts`

```typescript
// ============ FOUNDRY DOCUMENT REFERENCES ============
export interface ActorRef {
  id: string | null;
  uuid: string | null;
}

export interface ItemRef {
  id: string | null;
  uuid: string | null;
}

// ============ MODIFIER SYSTEM ============
export interface Modifier {
  id: string;
  name: string;
  value: number;
  source?: 'auto' | 'manual';
  meta?: {
    userTouched?: boolean;
    distance?: number;
    [key: string]: unknown;
  };
  poolCap?: number;
  forbidPool?: boolean;
  openSubtract?: number;
  weaponId?: string;
}

// ============ RESPONSE BASIS (DISCRIMINATED UNION) ============
export type ResponseBasis =
  | AttributeBasis
  | SkillBasis
  | ItemBasis;

export interface AttributeBasis {
  type: 'attribute';
  key: string;
  name?: string;
  dice: number;
  isDefaulting?: boolean;
}

export interface SkillBasis {
  type: 'skill';
  id: string;
  name: string;
  dice: number;
  specialization?: string | null;
  specIndex?: number | null;
  poolKey?: string | null;
}

export interface ItemBasis {
  type: 'item';
  id: string;
  name?: string;
  dice: number;
}

// ============ CONTEST EXPORT (DISCRIMINATED UNION BY FAMILY) ============
export type ContestExport =
  | SkillContestExport
  | AttributeContestExport
  | FirearmContestExport
  | MeleeContestExport;

export interface BaseContestExport {
  familyKey: string;
  next: {
    kind: string;
    ui?: ResponderUI;
    args?: Record<string, unknown>;
  };
}

export interface ResponderUI {
  prompt: string;
  yes?: string;
  no?: string;
  standard?: string;
  full?: string;
}

export interface SkillContestExport extends BaseContestExport {
  familyKey: 'skill';
  skillId: string | null;
  skillName: string;
  specName: string | null;
  poolKey: string | null;
}

export interface AttributeContestExport extends BaseContestExport {
  familyKey: 'attribute';
  attributeKey: string;
}

export interface FirearmContestExport extends BaseContestExport {
  familyKey: 'firearm';
  weaponId: string | null;
  weaponName: string;
  plan: FirearmPlan | null;
  damage: DamagePacketData | null;
  tnBase: number;
  tnMods: Modifier[];
}

export interface MeleeContestExport extends BaseContestExport {
  familyKey: 'melee';
  weaponId: string | null;
  weaponName: string;
  plan: null;
  damage: DamagePacketData | null;
  tnBase: number;
  tnMods: Modifier[];
}

// ============ SERIALIZATION ============
export interface ProcedureJSON {
  schema: number;
  kind: ProcedureKind;
  actor: ActorRef;
  item: ItemRef;
  state: ProcedureState;
  extra: unknown;
}

export interface ProcedureState {
  title: string;
  targetNumber: number | null;
  modifiers: Modifier[];
  dice: number;
  poolDice: number;
  karmaDice: number;
  isDefaulting: boolean;
  linkedAttribute: string | null;
  contestIds: string[];
}

// ============ PROCEDURE KINDS (DISCRIMINATED UNION TAG) ============
export type ProcedureKind =
  | 'skill'
  | 'attribute'
  | 'firearm'
  | 'melee'
  | 'explosive'
  | 'dodge'
  | 'resistance'
  | 'melee-defense'
  | 'skill-response'
  | 'attribute-response';

// ============ DAMAGE & COMBAT ============
export interface DamagePacketData {
  power: number;
  damageType: string;
  levelDelta: number;
  attackTNAdd: number;
  resistTNAdd: number;
  armorUse: 'ballistic' | 'impact';
  armorMult: { ballistic: number; impact: number };
  notes: string[];
}

export interface FirearmPlan {
  mode: string;
  modeName?: string;
  roundsFired: number;
  declaredRounds: number;
  attackerTNMod: number;
  powerDelta: number;
  levelDelta: number;
  notes: string[];
}

export interface ResistancePrep {
  familyKey: string;
  weaponId: string | null;
  weaponName: string;
  trackKey: string;
  tnBase: number;
  tnMods: Modifier[];
  stagedStepBeforeResist: string;
  boxesIfUnresisted: number;
  armor: ArmorInfo;
}

export interface ArmorInfo {
  effective: number;
  armorType: string;
  ballisticBase?: number;
  impactBase?: number;
}

// ============ DEFENSE HINT ============
export interface DefenseHint {
  type: 'attribute' | 'skill';
  key: string;
  tnMod: number;
  tnLabel: string;
  id?: string;
  skillId?: string;
  isDefaulting?: boolean;
  specialization?: string;
  specIndex?: number;
}

// ============ EXECUTION CALLBACKS ============
export interface ExecuteCallbacks {
  OnClose?: () => void;
  CommitEffects?: () => Promise<void>;
}

// ============ ROLL OPTIONS ============
export interface RollOptions {
  baseDice?: number;
  dice?: number;
  karmaDice?: number;
  pools?: PoolContribution[];
  tnBase?: number | null;
  tnMods?: Modifier[];
  targetNumber?: number | null;
  type?: 'skill' | 'attribute' | 'item';
  skill?: { id: string | null; name: string };
  specialization?: string;
  attributeKey?: string;
  defaulting?: boolean;
  meleeDefenseMode?: 'standard' | 'full';
  testName?: string;
  [key: string]: unknown;
}

export interface PoolContribution {
  name: string;
  key: string;
  dice: number;
}

// ============ DIRECTIVE SYSTEM ============
export interface Directive {
  k: string;
  v: string | number;
}

export type DirectiveProvider = (ctx: DirectiveContext) => Directive[];

export interface DirectiveContext {
  weapon: Item | null;
  ammo: Item | null;
  situational: Record<string, unknown>;
}
```

---

## 2. Abstract Base Classes

### 2.1 File: `FSM/AbstractProcedure.ts`

```typescript
import type { Writable, Readable } from 'svelte/store';
import type {
  ProcedureKind,
  ProcedureJSON,
  ProcedureState,
  Modifier,
  ContestExport,
  ResponseBasis,
  ExecuteCallbacks,
  RollOptions,
  ResistancePrep,
  DefenseHint
} from '../types/procedure.types';

// Generic type for subclass-specific extra data
export interface ProcedureConstructor<T extends AbstractProcedure = AbstractProcedure> {
  new (caller: Actor, item: Item | null, args?: Record<string, unknown>): T;
  kind?: ProcedureKind;
}

export interface DeserializeOptions {
  resolveActor?: (ref: ActorRef) => Promise<Actor | null>;
  resolveItem?: (ref: ItemRef, actor: Actor) => Promise<Item | null>;
}

export abstract class AbstractProcedure {
  // Static registry with proper typing
  private static readonly SCHEMA_VERSION = 1;
  private static registry = new Map<ProcedureKind, ProcedureConstructor>();

  static registerSubclass<T extends AbstractProcedure>(
    kind: ProcedureKind,
    Ctor: ProcedureConstructor<T>
  ): void { /* ... */ }

  static getCtor(kind: ProcedureKind): ProcedureConstructor | null { /* ... */ }

  // Instance stores with proper Svelte store typing
  protected readonly targetNumberStore: Writable<number | null>;
  protected readonly modifiersArrayStore: Writable<Modifier[]>;
  protected readonly titleStore: Writable<string>;
  protected readonly diceStore: Writable<number>;
  protected readonly poolDiceStore: Writable<number>;
  protected readonly karmaDiceStore: Writable<number>;
  protected readonly linkedAttributeStore: Writable<string | null>;
  protected readonly finalTNStore: Readable<number | null>;
  protected readonly modifiersTotalStore: Readable<number>;
  protected readonly difficultyStore: Readable<string>;
  protected readonly hasTargetsStore: Readable<boolean>;

  // Protected for subclass access
  protected caller: Actor;
  protected item: Item | null;
  protected isDefaultingFlag: boolean = false;
  protected contestIds: string[] = [];
  protected responseBasis: ResponseBasis | null = null;
  protected associatedPoolKey: string | null = null;

  constructor(
    caller: Actor | null,
    item: Item | null,
    options?: { lockPriority?: 'simple' | 'normal' | 'advanced' }
  );

  // Abstract methods that subclasses must implement
  abstract execute(callbacks?: ExecuteCallbacks): Promise<Roll>;
  abstract getFlavor(): string;
  abstract getChatDescription(): string;

  // Template methods with default implementations (can be overridden)
  exportForContest(): ContestExport { /* default implementation */ }

  // Serialization hooks for subclasses
  protected toJSONExtra(): unknown { return null; }
  protected async fromJSONExtra(extra: unknown, context: { opts: DeserializeOptions; payload: ProcedureJSON }): Promise<void> {}

  // Lifecycle hooks
  async onChallengeWillRoll(context: { baseRoll: Roll; actor: Actor }): Promise<void>;
  async onChallengeResolved(context: { roll: Roll; actor: Actor }): Promise<void>;

  // Modifier management
  upsertMod(mod: Partial<Modifier> & { name: string }): void;
  removeModByIndex(index: number): void;
  protected _removeModById(id: string): void;
  markModTouchedAt(index: number): void;

  // Utility methods
  buildFormula(explodes?: boolean): string;
  finalTN(options?: { floor?: number }): number | null;
  getTotalDiceBreakdown(): { baseDice: number; poolDice: number; karmaDice: number; totalDice: number };

  // Contest/Response methods
  setContestId(id: string | null): void;
  setResponseBasis(basis: ResponseBasis | null): void;
  resetResponseBasis(): void;
  getResponseBasis(): ResponseBasis | null;
  deliverContestResponse(rollOrJson: Roll | object): void;

  // Cleanup
  onDestroy(): void;
}
```

---

## 3. Procedure Family Base Classes

### 3.1 Attack Procedures Base: `FSM/base/AttackProcedure.ts`

```typescript
import { AbstractProcedure } from '../AbstractProcedure';
import type { ContestExport, ResistancePrep, DefenseHint, Modifier } from '../../types/procedure.types';

/**
 * Base class for all attack procedures (Firearm, Melee, Explosive)
 * Handles common attack patterns: contest export, defense hints, resistance prep
 */
export abstract class AttackProcedure extends AbstractProcedure {
  // Common attack context that subclasses will populate
  protected attackContext: unknown = null;

  constructor(caller: Actor, item: Item, options?: { lockPriority?: 'simple' | 'normal' | 'advanced' }) {
    super(caller, item, { lockPriority: options?.lockPriority ?? 'advanced' });
  }

  // Template method pattern for attack flow
  async execute(callbacks?: ExecuteCallbacks): Promise<Roll> {
    callbacks?.OnClose?.();

    const actor = this.caller;
    const formula = this.buildFormula(true);
    const baseRoll = SR3ERoll.create(formula, { actor });

    await this.onChallengeWillRoll({ baseRoll, actor });
    const roll = await baseRoll.evaluate(this);
    await baseRoll.waitForResolution();

    await callbacks?.CommitEffects?.();
    await this.cleanupContests();

    Hooks.callAll('actorSystemRecalculated', actor);
    await this.onChallengeResolved({ roll, actor });

    return roll;
  }

  // Common cleanup for contested rolls
  protected async cleanupContests(): Promise<void> {
    const ids = this.contestIds;
    if (ids?.length) {
      for (const id of ids) {
        OpposeRollService.expireContest(id);
      }
      this.clearContests();
    }
  }

  // Abstract methods for subclass-specific behavior
  abstract getDefenseHint(): DefenseHint;
  abstract buildResistancePrep(exportCtx: ContestExport, context: { initiator: Actor; target: Actor }): ResistancePrep;
  abstract precompute(options?: Record<string, unknown>): void;

  // Shared rendering utilities
  protected summarizeRoll(actor: Actor, rollJson: object): string { /* common implementation */ }
  protected resolveItemSkillAndSpec(): { skillName: string; specName: string | null; isDefault: boolean } | null { /* common */ }
  protected capitalize(s: string): string { /* common */ }
}
```

### 3.2 Defense Procedures Base: `FSM/base/DefenseProcedure.ts`

```typescript
import { AbstractProcedure } from '../AbstractProcedure';
import type { ResponseBasis } from '../../types/procedure.types';

/**
 * Base class for defense/response procedures (Dodge, MeleeDefense, SkillResponse, AttributeResponse)
 */
export abstract class DefenseProcedure extends AbstractProcedure {
  protected contestId: string | null = null;

  constructor(
    defender: Actor,
    item: Item | null,
    options?: { contestId?: string; lockPriority?: 'simple' | 'normal' | 'advanced' }
  ) {
    super(defender, item, options);
    this.setContestId(options?.contestId ?? null);
  }

  // Defense procedures don't start new contests
  get hasTargets(): boolean {
    return false;
  }

  // Defense responses shouldn't self-publish (they reply to a contest)
  shouldSelfPublish(): boolean {
    return false;
  }

  // Common execute pattern for defense
  async execute(callbacks?: ExecuteCallbacks): Promise<Roll> {
    callbacks?.OnClose?.();

    const actor = this.caller;
    const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });

    await this.onChallengeWillRoll({ baseRoll, actor });
    const roll = await baseRoll.evaluate(this);
    await roll.waitForResolution();

    await callbacks?.CommitEffects?.();
    this.deliverContestResponse(roll);

    Hooks.callAll('actorSystemRecalculated', actor);
    await this.onChallengeResolved({ roll, actor });

    return roll;
  }

  // Abstract: subclasses define how to hydrate from contest export
  abstract fromContestExport(exportCtx: ContestExport, context: { contestId?: string }): Promise<void>;
}
```

### 3.3 Simple Test Procedures: `FSM/base/SimpleTestProcedure.ts`

```typescript
import { AbstractProcedure } from '../AbstractProcedure';

/**
 * Base for non-combat tests (Skill, Attribute checks)
 */
export abstract class SimpleTestProcedure extends AbstractProcedure {
  constructor(caller: Actor, item: Item | null, options?: { lockPriority?: 'simple' | 'normal' | 'advanced' }) {
    super(caller, item, { lockPriority: options?.lockPriority ?? 'simple' });
  }

  shouldSelfPublish(): boolean {
    return true;
  }

  async execute(callbacks?: ExecuteCallbacks): Promise<Roll> {
    callbacks?.OnClose?.();

    const actor = this.caller;
    const baseRoll = SR3ERoll.create(this.buildFormula(true), { actor });

    await this.onChallengeWillRoll({ baseRoll, actor });
    await this.populateRollOptions(baseRoll);

    const roll = await baseRoll.evaluate(this);
    await baseRoll.waitForResolution();

    await callbacks?.CommitEffects?.();
    await this.onChallengeResolved({ roll, actor });

    return roll;
  }

  // Subclasses populate roll.options with their specific data
  protected abstract populateRollOptions(roll: Roll): void;
}
```

---

## 4. Concrete Procedure Implementations

### 4.1 `FSM/FirearmProcedure.ts`

```typescript
import { AttackProcedure } from './base/AttackProcedure';
import type { FirearmContestExport, FirearmPlan, DamagePacketData, DefenseHint, ResistancePrep } from '../types/procedure.types';
import { writable, get, type Writable } from 'svelte/store';

export default class FirearmProcedure extends AttackProcedure {
  static readonly kind: ProcedureKind = 'firearm';

  // Firearm-specific stores
  readonly weaponModeStore: Writable<string>;
  readonly ammoAvailableStore: Writable<number>;

  // Typed attack context
  protected attackContext: {
    plan: FirearmPlan;
    damage: DamagePacketData;
    ammoId: string;
  } | null = null;

  private selectedPoolKey: string | null = null;

  constructor(caller: Actor, item: Item) {
    super(caller, item, { lockPriority: 'advanced' });
    this.weaponModeStore = writable(item?.system?.mode ?? 'semiauto');
    this.ammoAvailableStore = writable(this.getAmmoCount());
  }

  // Implement abstract methods
  getFlavor(): string {
    return `${this.item?.name ?? 'Firearm'} Attack`;
  }

  getChatDescription(): string {
    return `<div>${this.item?.name ?? 'Firearm'}</div>`;
  }

  getDefenseHint(): DefenseHint {
    return {
      type: 'attribute',
      key: 'reaction',
      tnMod: 0,
      tnLabel: localize(RuntimeConfig().procedure.weapondifficulty),
    };
  }

  precompute(options: {
    declaredRounds?: number;
    ammoAvailable?: number | null;
    attackerToken?: Token | null;
    targetToken?: Token | null;
    rangeShiftLeft?: number;
  } = {}): void {
    const { plan, damage, ammoId } = FirearmService.beginAttack(this.caller, this.item!, options);
    this.attackContext = { plan, damage, ammoId };
    // ... update stores
  }

  buildResistancePrep(exportCtx: FirearmContestExport, context: { initiator: Actor; target: Actor }): ResistancePrep {
    const plan = exportCtx.plan ?? this.attackContext?.plan ?? {};
    const damage = exportCtx.damage ?? this.attackContext?.damage ?? {};
    const prep = FirearmService.prepareDamageResolution(context.target, { plan, damage });
    // ... build full prep
    return prep;
  }

  exportForContest(): FirearmContestExport {
    // ... implementation
  }

  // Firearm-specific methods
  syncRecoil(options: { declaredRounds?: number; ammoAvailable?: number | null }): void { /* ... */ }
  primeRangeForWeapon(attackerToken: Token, targetToken: Token, rangeShiftLeft?: number): void { /* ... */ }
  resetRecoil(): void { /* ... */ }

  private getAmmoCount(): number {
    return Number(this.item?.system?.ammo?.value ?? 0);
  }
}

// Register
AbstractProcedure.registerSubclass('firearm', FirearmProcedure);
```

### 4.2 `FSM/SkillProcedure.ts`

```typescript
import { SimpleTestProcedure } from './base/SimpleTestProcedure';
import type { SkillContestExport, ProcedureKind } from '../types/procedure.types';

export default class SkillProcedure extends SimpleTestProcedure {
  static readonly KIND: ProcedureKind = 'skill';

  private skillId: string | null = null;
  private skillName: string = 'Skill';
  private specName: string | null = null;
  private poolKey: string | null = null;

  constructor(
    caller: Actor,
    _item: Item | null,
    args: { skillId?: string; specIndex?: number | null; title?: string | null } = {}
  ) {
    super(caller, null, { lockPriority: 'simple' });
    // ... initialize from skill
  }

  getFlavor(): string {
    return `${this.title} Test`;
  }

  getChatDescription(): string {
    return `<div>${this.title}${this.specName ? ` (${this.specName})` : ''}</div>`;
  }

  protected populateRollOptions(roll: Roll): void {
    roll.options ??= {};
    roll.options.type = 'skill';
    roll.options.skill = { id: this.skillId, name: this.skillName };
    if (this.specName) roll.options.specialization = this.specName;
    if (this.poolKey) roll.options.pools = [{ key: this.poolKey, name: this.poolKey, dice: this.poolDice }];
  }

  exportForContest(): SkillContestExport {
    return {
      familyKey: 'skill',
      skillId: this.skillId,
      skillName: this.skillName,
      specName: this.specName,
      poolKey: this.poolKey,
      next: {
        kind: 'skill-response',
        ui: { /* ... */ },
        args: {}
      }
    };
  }

  // Serialization
  protected toJSONExtra(): { skillId: string | null; specName: string | null; poolKey: string | null; skillName: string } {
    return { skillId: this.skillId, specName: this.specName, poolKey: this.poolKey, skillName: this.skillName };
  }

  protected async fromJSONExtra(extra: { skillId?: string; specName?: string; poolKey?: string; skillName?: string } | null): Promise<void> {
    this.skillId = extra?.skillId ?? this.skillId;
    this.specName = extra?.specName ?? this.specName;
    this.poolKey = extra?.poolKey ?? this.poolKey;
    this.skillName = extra?.skillName ?? this.skillName;
  }
}

AbstractProcedure.registerSubclass('skill', SkillProcedure);
```

### 4.3 `FSM/DodgeProcedure.ts`

```typescript
import { DefenseProcedure } from './base/DefenseProcedure';
import type { ContestExport, ProcedureKind } from '../types/procedure.types';

export default class DodgeProcedure extends DefenseProcedure {
  static readonly kind: ProcedureKind = 'dodge';

  constructor(defender: Actor, _noItem: Item | null = null, args: { contestId?: string } = {}) {
    super(defender, null, { contestId: args.contestId });
    this.title = localize(RuntimeConfig().procedure.dodgetitle);
    this.targetNumberStore?.set?.(4);
  }

  getFlavor(): string { return String(this.title); }
  getChatDescription(): string { return localize(RuntimeConfig().procedure.dodgedescription); }
  getKindOfRollLabel(): string { return localize(RuntimeConfig().procedure.dodge); }
  getPrimaryActionLabel(): string { return localize(RuntimeConfig().procedure.dodgebutton); }

  async fromContestExport(_exportCtx: ContestExport, context: { contestId?: string }): Promise<void> {
    this.setContestId(context.contestId ?? null);
    // Dodge doesn't need much from the export - just the contest ID
  }
}

AbstractProcedure.registerSubclass('dodge', DodgeProcedure);
```

---

## 5. Utility Types and Helpers

### 5.1 `types/guards.ts` - Type Guards

```typescript
import type { ContestExport, SkillContestExport, FirearmContestExport, MeleeContestExport, AttributeContestExport } from './procedure.types';

export function isSkillContestExport(exp: ContestExport): exp is SkillContestExport {
  return exp.familyKey === 'skill';
}

export function isFirearmContestExport(exp: ContestExport): exp is FirearmContestExport {
  return exp.familyKey === 'firearm';
}

export function isMeleeContestExport(exp: ContestExport): exp is MeleeContestExport {
  return exp.familyKey === 'melee';
}

export function isAttributeContestExport(exp: ContestExport): exp is AttributeContestExport {
  return exp.familyKey === 'attribute';
}
```

### 5.2 `types/utility.ts` - Utility Types

```typescript
// Make specific properties required
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep partial for nested objects
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Extract procedure kind from constructor
export type ProcedureKindOf<T extends AbstractProcedure> = T extends { constructor: { kind: infer K } } ? K : never;

// Procedure factory signature
export type ProcedureFactoryFn<T extends AbstractProcedure> = (
  actor: Actor,
  item: Item | null,
  args?: Record<string, unknown>
) => T;
```

---

## 6. Rules Module Types

### 6.1 `rules/DamagePacket.ts`

```typescript
import type { DamagePacketData, Directive, FirearmPlan } from '../types/procedure.types';

export interface DamagePacketBuildOptions {
  weapon: Item;
  plan: FirearmPlan;
  directives?: Directive[];
  rangeBand?: RangeBand | null;
}

export interface RangeBand {
  name: string;
  powerAdd?: number;
  levelDelta?: number;
}

export default class DamagePacket {
  static build(options: DamagePacketBuildOptions): DamagePacketData {
    // ... implementation with full typing
  }
}
```

### 6.2 `rules/DirectiveRegistry.ts`

```typescript
import type { Directive, DirectiveProvider, DirectiveContext } from '../types/procedure.types';

export default class DirectiveRegistry {
  private static providers = new Map<string, DirectiveProvider[]>();

  static register(familyKey: string, fn: DirectiveProvider): void {
    if (!familyKey || typeof fn !== 'function') {
      throw new Error('sr3e: invalid directive provider');
    }
    if (!this.providers.has(familyKey)) {
      this.providers.set(familyKey, []);
    }
    this.providers.get(familyKey)!.push(fn);
  }

  static collect(context: DirectiveContext & { familyKey: string }): Directive[] {
    const { familyKey, ...ctx } = context;
    const out: Directive[] = [];
    const arr = this.providers.get(familyKey) || [];
    for (const fn of arr) {
      const part = fn(ctx) || [];
      out.push(...part);
    }
    return out;
  }
}
```

---

## 7. ProcedureLock with Types

### 7.1 `FSM/ProcedureLock.ts`

```typescript
export type LockPriority = 'simple' | 'advanced';

export interface LockEntry {
  id: string;
  ownerKey: string;
  priority: number;
  tag: string;
  ts: number;
}

export interface AcquireOptions {
  ownerKey: string;
  priority?: LockPriority | number;
  tag?: string;
}

export interface AssertEnterOptions extends AcquireOptions {
  onDenied?: (lock: LockEntry) => void;
}

export default class ProcedureLock {
  static readonly PRIORITY: Readonly<Record<LockPriority, number>> = Object.freeze({
    simple: 1,
    advanced: 10
  });

  private static lock: LockEntry | null = null;

  static current(): LockEntry | null { return this.lock; }
  static isLocked(): boolean { return !!this.lock; }
  static hasHigherThan(p: number): boolean { return !!this.lock && this.lock.priority > p; }

  static acquire(options: AcquireOptions): string | null {
    const { ownerKey, priority = 'advanced', tag = '' } = options;
    const pr = typeof priority === 'number' ? priority : (this.PRIORITY[priority] ?? 0);

    if (this.lock && this.lock.ownerKey !== ownerKey && this.lock.priority > pr) {
      return null;
    }

    this.lock = {
      id: foundry.utils.randomID(8),
      ownerKey,
      priority: pr,
      tag,
      ts: Date.now()
    };
    return this.lock.id;
  }

  static release(ownerOrId: string): boolean {
    if (!this.lock) return true;
    if (ownerOrId === this.lock.ownerKey || ownerOrId === this.lock.id) {
      this.lock = null;
      return true;
    }
    return false;
  }

  static assertEnter(options: AssertEnterOptions): string | false {
    const id = this.acquire(options);
    if (!id) {
      options.onDenied?.(this.lock!);
      return false;
    }
    return id;
  }
}
```

---

## 8. ProcedureFactory with Types

### 8.1 `FSM/ProcedureFactory.ts`

```typescript
import type { ProcedureKind } from '../types/procedure.types';
import { AbstractProcedure } from './AbstractProcedure';

// Import all procedures
import SkillProcedure from './SkillProcedure';
import AttributeProcedure from './AttributeProcedure';
import FirearmProcedure from './FirearmProcedure';
import MeleeProcedure from './MeleeProcedure';
import ExplosiveProcedure from './ExplosiveProcedure';
import DodgeProcedure from './DodgeProcedure';
import ResistanceProcedure from './ResistanceProcedure';
import MeleeDefenseProcedure from './MeleeDefenseProcedure';

export interface CreateOptions {
  actor: Actor;
  item?: Item | null;
  args?: Record<string, unknown>;
}

export default class ProcedureFactory {
  static readonly type: Readonly<Record<string, ProcedureKind>> = Object.freeze({
    skill: 'skill',
    attribute: 'attribute',
    firearm: 'firearm',
    melee: 'melee',
    explosive: 'explosive',
    dodge: 'dodge',
    resistance: 'resistance',
    meleeDefense: 'melee-defense',
  });

  static Create(kind: ProcedureKind, options: CreateOptions): AbstractProcedure | null {
    const { actor, item = null, args = {} } = options;
    if (!actor) return null;

    const Ctor = AbstractProcedure.getCtor(kind);
    if (!Ctor) return null;

    return new Ctor(actor, item, args);
  }

  static resolveProcedureType(weapon: Item): ProcedureKind | null {
    if (!weapon || weapon.type !== 'weapon') return null;

    const family = String(weapon.system?.family ?? '').toLowerCase();
    const mode = String(weapon.system?.mode ?? '').toLowerCase();

    const FIREARM_MODES = new Set(['manual', 'semiauto', 'burst', 'fullauto']);
    const MELEE_MODES = new Set(['melee', 'blade', 'blunt', 'polearm', 'unarmed']);
    const EXPLOSIVE_MODES = new Set(['explosive', 'grenade', 'launcher']);

    if (family === 'firearm' || FIREARM_MODES.has(mode)) return 'firearm';
    if (family === 'melee' || MELEE_MODES.has(mode)) return 'melee';
    if (family === 'explosive' || EXPLOSIVE_MODES.has(mode)) return 'explosive';

    return null;
  }
}
```

---

## 9. Migration Steps

### Phase 1: Foundation
1. Create `types/` directory with all type definitions
2. Convert `ProcedureLock.ts` and `ProcedureFactory.ts`
3. Set up TypeScript config with strict mode

### Phase 2: Base Classes
1. Convert `AbstractProcedure.ts` with full typing
2. Create base class hierarchy: `AttackProcedure`, `DefenseProcedure`, `SimpleTestProcedure`
3. Ensure all stores are properly typed with Svelte store types

### Phase 3: Simple Procedures
1. Convert `SkillProcedure`, `AttributeProcedure`
2. Convert `DodgeProcedure`, `SkillResponseProcedure`, `AttributeResponseProcedure`
3. Test serialization/deserialization

### Phase 4: Combat Procedures
1. Convert `FirearmProcedure`, `MeleeProcedure`
2. Convert `MeleeDefenseProcedure`, `ResistanceProcedure`
3. Convert `ExplosiveProcedure`

### Phase 5: Rules & Support
1. Convert all rules modules: `DamagePacket`, `DirectiveRegistry`, `ResistanceEngine`, etc.
2. Convert family services: `FirearmService`, `MeleeService`
3. Convert registry files

### Phase 6: Testing & Refinement
1. Add unit tests with Vitest using typed mocks
2. Integration testing with Foundry
3. Clean up any remaining `any` types

---

## 10. Key Benefits of This Architecture

### Type Safety
- Discriminated unions for `ContestExport` and `ResponseBasis` enable exhaustive pattern matching
- Generic base classes reduce code duplication while maintaining type safety
- Strict typing on stores prevents runtime errors

### Code Deduplication
- `AttackProcedure` base eliminates ~50% duplicated code between Firearm/Melee/Explosive
- `DefenseProcedure` base consolidates defense patterns
- Shared utility methods in base classes

### Improved Modularity
- Clear separation between procedure families
- Plugin system (`DirectiveRegistry`) fully typed
- Easy to add new procedure types by extending base classes

### Better Developer Experience
- IntelliSense support for all procedure methods and properties
- Compile-time errors for incorrect API usage
- Self-documenting interfaces

---

## 11. File Structure

```
module/services/procedure/
├── types/
│   ├── procedure.types.ts    # All core type definitions
│   ├── guards.ts             # Type guard functions
│   └── utility.ts            # Utility types
├── FSM/
│   ├── base/
│   │   ├── AttackProcedure.ts
│   │   ├── DefenseProcedure.ts
│   │   └── SimpleTestProcedure.ts
│   ├── AbstractProcedure.ts
│   ├── ProcedureLock.ts
│   ├── ProcedureFactory.ts
│   ├── SkillProcedure.ts
│   ├── AttributeProcedure.ts
│   ├── FirearmProcedure.ts
│   ├── MeleeProcedure.ts
│   ├── ExplosiveProcedure.ts
│   ├── DodgeProcedure.ts
│   ├── ResistanceProcedure.ts
│   ├── MeleeDefenseProcedure.ts
│   ├── SkillResponseProcedure.ts
│   └── AttributeResponseProcedure.ts
├── rules/
│   ├── ArmorResolver.ts
│   ├── DamageMath.ts
│   ├── DamagePacket.ts
│   ├── DirectiveRegistry.ts
│   ├── RangeService.ts
│   ├── RecoilTracker.ts
│   ├── ResistanceEngine.ts
│   └── WeaponModePlanners.ts
├── families/
│   ├── FirearmService.ts
│   └── MeleeService.ts
├── registry/
│   ├── firearms.directives.ts
│   ├── firearms.modes.ts
│   └── melee.directives.ts
├── game/
│   └── AmmoService.ts
└── common/
    └── DefenseHint.ts
```
