# SR3E Rewrite Implementation Plan

**Strategy**: Layers-first, test-driven, with reference to existing JS implementation

## Phase 0: Preparation (Days 1-2)

### Setup

- [ ] Create `src/` directory for new TypeScript code
- [ ] Configure `tsconfig.json` for strict mode
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true
    }
  }
  ```
- [ ] Update Vite config to include `src/` in build
- [ ] Configure path aliases:
  - `@rules` → `src/rules`
  - `@foundry` → `src/foundry`
  - `@ui` → `src/ui`

### Documentation

- [ ] Create git branch: `feature/layered-rewrite`
- [ ] Ensure legacy code is on `legacy-js` branch
- [ ] Document migration plan in this vault
- [ ] Set up project board (optional)

**Deliverable**: Clean slate ready for new code, legacy code preserved

---

## Phase 1: Rules Layer Foundation (Week 1)

**Goal**: Core interfaces and base classes, fully tested, zero dependencies

### Day 1-2: Core Types & Interfaces

- [ ] Create `src/rules/types/`
  - [ ] `Modifier.ts` - modifier interface
  - [ ] `RollResult.ts` - result types
  - [ ] `Weapon.ts` - weapon data interface
  - [ ] `Skill.ts` - skill data interface

```typescript
// src/rules/types/Modifier.ts
export interface Modifier {
  readonly id: string;
  readonly name: string;
  readonly value: number;
  readonly source?: string;
  readonly locked?: boolean;
}
```

- [ ] Create `src/rules/rolls/RollProcedure.ts` - core interface
- [ ] Write JSDoc for all interfaces

**Tests**: Type compilation only (no runtime yet)

### Day 3-4: BaseRollProcedure

- [ ] Implement `src/rules/rolls/BaseRollProcedure.ts`
  - [ ] Constructor
  - [ ] Modifier management (add, remove, list)
  - [ ] Dice calculation (base + pool + karma)
  - [ ] TN calculation (base + modifiers)
  - [ ] Abstract methods: `execute()`, `canExecute()`

- [ ] Write tests: `tests/rules/BaseRollProcedure.test.ts`
  ```typescript
  describe('BaseRollProcedure', () => {
    it('calculates final dice correctly', () => {
      const proc = new TestProcedure(6, 4);
      proc.setPoolDice(2);
      proc.setKarmaDice(1);
      expect(proc.dice).toBe(9);  // 6 + 2 + 1
    });

    it('calculates final TN with modifiers', () => {
      const proc = new TestProcedure(6, 4);
      proc.addModifier({ id: 'test', name: 'Test', value: 2 });
      expect(proc.targetNumber).toBe(6);  // 4 + 2
    });

    it('prevents removing locked modifiers', () => {
      const proc = new TestProcedure(6, 4);
      proc.addModifier({ id: 'locked', name: 'Locked', value: 1, locked: true });
      expect(proc.removeModifier('locked')).toBe(false);
      expect(proc.modifiers.length).toBe(1);
    });
  });
  ```

**Deliverable**: 20+ passing tests, 0 dependencies on Foundry/Svelte

### Day 5-7: Concrete Procedures

- [ ] Implement `FirearmRollProcedure.ts`
  - Reference: `module/services/procedure/FSM/FirearmProcedure.js` (old code)
  - [ ] Constructor with weapon, mode, recoil
  - [ ] `execute()` - Shadowrun success counting
  - [ ] `canExecute()` - ammo check
  - [ ] `applyRecoil()` - auto-add recoil modifier
  - [ ] `getRangeModifier()` - calculate range penalty

- [ ] Tests: `tests/rules/FirearmRollProcedure.test.ts`
  - [ ] Recoil application
  - [ ] Ammo validation
  - [ ] Success counting algorithm
  - [ ] Burst/full-auto modes
  - [ ] Range modifiers

- [ ] Implement `SkillRollProcedure.ts`
  - Reference: `module/services/procedure/FSM/SkillProcedure.js`
  - [ ] Constructor with skill, specialization, defaulting
  - [ ] `execute()` - basic roll
  - [ ] `canExecute()` - always true (no resource cost)
  - [ ] Specialization bonus

- [ ] Tests: `tests/rules/SkillRollProcedure.test.ts`

- [ ] Implement `AttributeRollProcedure.ts`
  - Reference: `module/services/procedure/FSM/AttributeProcedure.js`

**Deliverable**: 50+ passing tests, core procedures working

**Checkpoint**: Can you roll dice using procedures in pure TS? ✅

---

## Phase 2: Foundry Integration Layer (Week 2)

**Goal**: Adapters that bridge Foundry ↔ Rules

### Day 8-9: Actor Adapter

- [ ] Create `src/foundry/adapters/FoundryActorAdapter.ts`
- [ ] Static factory methods:
  - [ ] `createFirearmProcedure(actor, weapon, mode)`
  - [ ] `createSkillProcedure(actor, skill, specialization?)`
  - [ ] `createAttributeProcedure(actor, attribute)`

```typescript
export class FoundryActorAdapter {
  static createFirearmProcedure(
    actor: SR3EActor,
    weapon: SR3EItem,
    mode: WeaponMode
  ): FirearmRollProcedure {
    // Extract data from Foundry documents
    const skill = actor.items.get(weapon.system.associatedSkill);
    const dice = skill?.system.rating ?? 0;
    const targetNumber = weapon.system.targetNumber ?? 4;

    const procedure = new FirearmRollProcedure(/* ... */);

    // Apply automatic modifiers (wounds, etc.)
    this.applyWoundModifiers(actor, procedure);

    return procedure;
  }
}
```

- [ ] Tests: Mock `SR3EActor` and `SR3EItem` (integration tests)

### Day 10-11: Execution Adapter

- [ ] Create `src/foundry/adapters/FoundryRollProcedureAdapter.ts`
- [ ] Methods:
  - [ ] `executeWithFoundry()` - calls `procedure.execute()`, creates ChatMessage
  - [ ] `renderRollCard(result)` - generates HTML for chat
  - [ ] `updateActorState(result)` - consume ammo, update recoil, etc.

```typescript
export class FoundryRollProcedureAdapter {
  async executeWithFoundry(): Promise<ChatMessage> {
    const result = this.procedure.execute();

    // Create chat message
    const msg = await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: await this.renderRollCard(result),
      rolls: [result.roll]
    });

    // Side effects (consume ammo, etc.)
    await this.updateActorState(result);

    return msg;
  }
}
```

- [ ] Tests: Mock ChatMessage.create

### Day 12-14: Sheet Bindings

- [ ] Create `src/foundry/sheets/RollComposerSheet.ts`
  - Extends `ApplicationV2`
  - Creates procedure stores
  - Binds Svelte component

```typescript
export class RollComposerSheet extends ApplicationV2 {
  private procedureStore: Writable<RollProcedure | null>;

  constructor(actor: SR3EActor) {
    super();
    this.procedureStore = writable(null);
  }

  openForFirearm(weapon: SR3EItem, mode: WeaponMode) {
    const procedure = FoundryActorAdapter.createFirearmProcedure(
      this.actor,
      weapon,
      mode
    );
    this.procedureStore.set(procedure);
    this.render(true);
  }
}
```

**Deliverable**: Can create procedures from Foundry actors and execute them to chat

**Checkpoint**: Click a weapon in old UI → create procedure → manual chat message ✅

---

## Phase 3: UI Layer Rebuild (Week 3-4)

**Goal**: Clean Svelte components with clear boundaries

### Day 15-17: Core Components

- [ ] Create `src/ui/components/RollComposer/`
  - [ ] `RollComposerComponent.svelte` (main container, <150 lines)
  - [ ] `TargetNumberDisplay.svelte` (TN + difficulty)
  - [ ] `ModifierPanel.svelte` (list of modifiers)
  - [ ] `DicePoolSelector.svelte` (pool + karma)
  - [ ] `RollButton.svelte` (primary action)

```svelte
<!-- RollComposerComponent.svelte -->
<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { RollProcedure } from '@rules/rolls/RollProcedure';
  import { FoundryRollProcedureAdapter } from '@foundry/adapters';

  interface Props {
    procedureStore: Writable<RollProcedure | null>;
    actor: SR3EActor;
  }

  let { procedureStore, actor }: Props = $props();

  // Local UI state (runes)
  let isRolling = $state(false);
  let poolDice = $state(0);
  let karmaDice = $state(0);

  // Shared state (writable)
  $: procedure = $procedureStore;

  async function handleRoll() {
    if (!procedure) return;

    isRolling = true;
    procedure.setPoolDice(poolDice);
    procedure.setKarmaDice(karmaDice);

    const adapter = new FoundryRollProcedureAdapter(procedure, actor);
    await adapter.executeWithFoundry();

    isRolling = false;
    poolDice = 0;
    karmaDice = 0;
  }
</script>

<div class="roll-composer">
  <TargetNumberDisplay {procedure} />
  <ModifierPanel {procedure} />
  <DicePoolSelector bind:poolDice bind:karmaDice max={actor.system.karma.pool} />
  <RollButton {procedure} {isRolling} onclick={handleRoll} />
</div>
```

**Rules**:
- ✅ Props use `Writable<T>` for shared state
- ✅ Local state uses runes (`$state`, `$derived`)
- ✅ No imports from `@rules` directly
- ✅ Components < 150 lines
- ✅ No business logic (that's in procedures)

### Day 18-20: Sub-Components

- [ ] `ModifierPanel.svelte`
  ```svelte
  <script lang="ts">
    interface Props {
      procedure: RollProcedure | null;
    }

    let { procedure }: Props = $props();

    let modifiers = $derived(procedure?.modifiers ?? []);
    let total = $derived(modifiers.reduce((sum, m) => sum + m.value, 0));
  </script>

  <div>
    <h4>Modifiers: {total}</h4>
    {#each modifiers as mod}
      <div>{mod.name}: {mod.value}</div>
    {/each}
  </div>
  ```

- [ ] `DicePoolSelector.svelte` - Counter for pool/karma
- [ ] `TargetNumberDisplay.svelte` - TN + difficulty label

### Day 21: Integration

- [ ] Wire up `RollComposerSheet` → `RollComposerComponent.svelte`
- [ ] Test in Foundry: click weapon → composer opens → roll works → chat message appears

**Deliverable**: Working roll composer with clean boundaries

**Checkpoint**: Full roll flow from UI → Rules → Foundry ✅

---

## Phase 4: Advanced Features (Week 4-5)

### Opposed Rolls

- [ ] Implement `OpposedRollProcedure.ts`
- [ ] Extend `FoundryRollProcedureAdapter` for opposed execution
- [ ] UI: Contested roll display

### Damage & Resistance

- [ ] Port damage calculation from `module/services/procedure/ResistanceEngine.js`
- [ ] Implement `DamageRollProcedure.ts`
- [ ] UI: Damage application

### Active Effects & Gadgets

- [ ] Port gadget logic from current system
- [ ] Adapter: Apply gadget modifiers to procedures
- [ ] UI: Gadget viewer in roll composer

---

## Phase 5: Feature Parity (Week 5-6)

### Remaining Sheets

- [ ] Character sheet (use new architecture)
- [ ] Weapon sheet
- [ ] Item sheets

### Rules Coverage

- [ ] Melee attacks
- [ ] Magic/spells
- [ ] Vehicle combat
- [ ] Matrix actions (if implemented)

### Polish

- [ ] Chat card styling
- [ ] Localization (all `messageKey` strings)
- [ ] Error handling
- [ ] Loading states

---

## Testing Strategy

### Unit Tests (Rules Layer)

```bash
npx vitest tests/rules/
```

**Target**: 80%+ coverage of `src/rules/`

### Integration Tests (Foundry Layer)

Mock Foundry APIs, test adapters

**Target**: 60%+ coverage of `src/foundry/`

### Manual Testing (UI Layer)

Checklist:
- [ ] Roll firearm (semi-auto, burst, full-auto)
- [ ] Roll skill (regular, specialized, defaulting)
- [ ] Roll attribute
- [ ] Opposed roll (attacker vs defender)
- [ ] Apply modifiers (range, wound, custom)
- [ ] Use dice pool
- [ ] Use karma
- [ ] Damage application
- [ ] Active effects

---

## Migration Checklist

### Before Merge

- [ ] All tests passing
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No `any` types (search codebase)
- [ ] All UI strings localized
- [ ] Documentation complete (this vault)
- [ ] Code review

### Deployment

- [ ] Merge to `main`
- [ ] Tag version (e.g., `v2.0.0-alpha.1`)
- [ ] Release notes
- [ ] Backup user data (if breaking changes)

---

## Rollback Plan

If rewrite fails or takes too long:

1. Cherry-pick working features from `feature/layered-rewrite`
2. Return to `legacy-js` branch
3. Document lessons learned
4. Attempt targeted refactor instead

---

## Success Criteria

✅ **Type Safety**: No `any`, all interfaces defined
✅ **Test Coverage**: 80%+ rules, 60%+ foundry
✅ **Clean Layers**: UI | Foundry | Rules with no circular deps
✅ **Feature Parity**: All existing functionality works
✅ **Performance**: No regressions in roll speed
✅ **Maintainability**: New developer can understand in <2 hours

---

## Time Estimates

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Preparation | 2 days | Clean slate |
| Rules Layer | 5 days | 50+ tests, core procedures |
| Foundry Layer | 5 days | Adapters working |
| UI Layer | 7 days | Clean components |
| Advanced Features | 5 days | Opposed, damage, gadgets |
| Feature Parity | 7 days | All sheets/rules |
| **Total** | **4-5 weeks** | Production-ready |

---

## Next Steps

1. Review this plan with stakeholders
2. Create git branch
3. Start Phase 0
4. Update this doc as you progress
