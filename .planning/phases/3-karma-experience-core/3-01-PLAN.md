---
phase: 3-karma-experience-core
plan: 01
type: execute
---

<objective>
Create KarmaSpendingService: attribute session management + skill cost calculation helpers.

Purpose: Establish the karma spending engine. Attribute buying is staged (debit only on shopping cart toggle-off). Skill buying is staged per editor (debit only on thumbs-up commit). This plan builds the service only — no UI wiring yet.
Output: New `module/services/karma/KarmaSpendingService.ts` singleton.
</objective>

<execution_context>
./.claude/get-shit-done/workflows/execute-phase.md
./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/3-karma-experience-core/3-CONTEXT.md

**Prior decisions affecting this plan:**
- Phase 1: Singleton pattern — `static #instance` + `static Instance()` getter
- Phase 1: No exception handling — non-null assertions (!), let-it-fail
- Phase 2.4: Knowledge/language always use Intelligence as linked attr (hardcoded)
- Phase 2: `isCharacterCreation` separates creation from post-creation; `isShoppingState` toggles karma shopping
- Phase 2: StoreManager.Instance — all reactive reads/writes via GetRWStore, not actor.system
- Phase 3 (this session): **Staged model** — attribute session commits only when shopping cart toggles OFF; skill session commits only on thumbs-up; closing without commit cancels/reverts

**Staged model summary:**
- Attribute session: `shoppingKarmaSession` shallow store tracks `{ active, stagedSpent, attrSnapshot }`. Attrs update immediately (display changes), goodKarma is NOT debited until `commitAttrSession()`.
- Skill session: editors hold `localStagedSpent` + a snapshot. `commitSkillDelta(actor, delta)` debits goodKarma directly. Revert is done by the editor on close without commit.

**Relevant source files — read before implementing:**
@module/services/character-creation/AttributeSpendingService.ts
@module/services/character-creation/SkillSpendingService.ts
@module/models/actors/actor-components/Karma.ts
@module/models/items/MetatypeModel.ts
@module/constants/flags.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create KarmaSpendingService</name>
  <files>module/services/karma/KarmaSpendingService.ts</files>
  <action>
Create `module/services/karma/KarmaSpendingService.ts`. Create the `module/services/karma/` directory first if it does not exist.

Follow the exact singleton pattern from AttributeSpendingService/SkillSpendingService.

---

**PART A — Private cost helpers**

```ts
const KARMA_BLOCKED_ATTRS = ["reaction", "magic", "essence", "initiative"] as const;
type KarmaBlockedAttr = typeof KARMA_BLOCKED_ATTRS[number];

// Attribute karma cost (staged — debit happens at commit, not here)
#getRacialLimit(actor: Actor, attrKey: string): number {
    const metatype = actor.items.find((i: any) => i.type === "metatype") as any;
    return (metatype?.system?.attributeLimits?.[attrKey] as number | undefined) ?? 6;
}

#getAttrMax(actor: Actor, attrKey: string): number {
    return Math.floor(this.#getRacialLimit(actor, attrKey) * 1.5);
}

// Cost to buy UP to newRating (not from — this is the GK cost of that single step)
#attrBuyCost(newRating: number, racialLimit: number): number {
    return newRating <= racialLimit ? newRating * 2 : newRating * 3;
}
```

SR3e skill cost formula:
```ts
// isActive = true for active skills; false for knowledge/language
calcSkillCost(newRating: number, linkedAttrRating: number, isActive: boolean): number {
    if (newRating === 1) return 1; // new skill — flat 1 GK
    if (isActive) {
        if (newRating <= linkedAttrRating) return Math.ceil(newRating * 1.5);
        if (newRating <= linkedAttrRating * 2) return newRating * 2;
        return Math.ceil(newRating * 2.5);
    } else {
        // knowledge / language
        if (newRating <= linkedAttrRating) return newRating;
        if (newRating <= linkedAttrRating * 2) return Math.ceil(newRating * 1.5);
        return newRating * 2;
    }
}
```

SR3e spec cost formula:
```ts
calcSpecCost(newSpecRating: number, linkedAttrRating: number, isActive: boolean): number {
    if (isActive) {
        if (newSpecRating <= linkedAttrRating) return Math.ceil(newSpecRating * 0.5);
        if (newSpecRating <= linkedAttrRating * 2) return newSpecRating;
        return Math.ceil(newSpecRating * 1.5);
    } else {
        // knowledge / language
        if (newSpecRating <= linkedAttrRating) return Math.ceil(newSpecRating * 0.5);
        return newSpecRating; // <= 2 × Int (SR3e has no higher tier for K/L specs)
    }
}
```

Note: `calcSkillCost` and `calcSpecCost` are **public** — skill editors call them to accumulate `localStagedSpent`.

---

**PART B — Attribute session management**

Session shape (stored in `shoppingKarmaSession` shallow store on the actor):
```ts
interface KarmaAttrSession {
    active: boolean;
    stagedSpent: number;
    attrSnapshot: Record<string, number>; // attrKey → value at session start
}
```

Buyable attribute keys: `["body", "quickness", "strength", "charisma", "intelligence", "willpower"]`

```ts
readonly BUYABLE_ATTRS = ["body", "quickness", "strength", "charisma", "intelligence", "willpower"] as const;

#getSessionStore(actor: Actor): Writable<KarmaAttrSession> {
    return StoreManager.Instance.GetShallowStore<KarmaAttrSession>(
        actor,
        "shoppingKarmaSession",
        { active: false, stagedSpent: 0, attrSnapshot: {} }
    ) as Writable<KarmaAttrSession>;
}

#getGoodKarmaStore(actor: Actor): Writable<number> {
    return StoreManager.Instance.GetRWStore<number>(actor, "karma.goodKarma");
}
```

**`startAttrSession(actor: Actor): void`**
- For each key in `BUYABLE_ATTRS`: read `attributes.${key}.value` from GetRWStore, store in snapshot
- Set session: `{ active: true, stagedSpent: 0, attrSnapshot: { body: N, ... } }`
```ts
startAttrSession(actor: Actor): void {
    const snapshot: Record<string, number> = {};
    for (const key of this.BUYABLE_ATTRS) {
        const store = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${key}.value`);
        snapshot[key] = get(store);
    }
    this.#getSessionStore(actor).set({ active: true, stagedSpent: 0, attrSnapshot: snapshot });
}
```
(Import `get` from `svelte/store` for synchronous store reads.)

**`canStageAttrIncrement(actor: Actor, attrKey: string): boolean`**
```ts
canStageAttrIncrement(actor: Actor, attrKey: string): boolean {
    if ((KARMA_BLOCKED_ATTRS as readonly string[]).includes(attrKey)) return false;
    const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`);
    const currentVal = get(attrStore);
    const attrMax = this.#getAttrMax(actor, attrKey);
    if (currentVal + 1 > attrMax) return false;
    const racialLimit = this.#getRacialLimit(actor, attrKey);
    const cost = this.#attrBuyCost(currentVal + 1, racialLimit);
    const session = get(this.#getSessionStore(actor));
    const goodKarma = get(this.#getGoodKarmaStore(actor));
    return goodKarma - session.stagedSpent >= cost;
}
```

**`stageAttrIncrement(actor: Actor, attrKey: string): void`**
```ts
stageAttrIncrement(actor: Actor, attrKey: string): void {
    const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`);
    const currentVal = get(attrStore);
    const racialLimit = this.#getRacialLimit(actor, attrKey);
    const cost = this.#attrBuyCost(currentVal + 1, racialLimit);
    attrStore.set(currentVal + 1);
    this.#getSessionStore(actor).update(s => ({ ...s, stagedSpent: s.stagedSpent + cost }));
}
```

**`canStageAttrDecrement(actor: Actor, attrKey: string): boolean`**
- Decrement only undoes a staged increment (cannot sell pre-existing ratings in karma mode)
```ts
canStageAttrDecrement(actor: Actor, attrKey: string): boolean {
    if ((KARMA_BLOCKED_ATTRS as readonly string[]).includes(attrKey)) return false;
    const session = get(this.#getSessionStore(actor));
    if (!session.active) return false;
    const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`);
    const currentVal = get(attrStore);
    const snapshotVal = session.attrSnapshot[attrKey] ?? currentVal;
    return currentVal > snapshotVal;
}
```

**`stageAttrDecrement(actor: Actor, attrKey: string): void`**
```ts
stageAttrDecrement(actor: Actor, attrKey: string): void {
    const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`);
    const currentVal = get(attrStore);
    const racialLimit = this.#getRacialLimit(actor, attrKey);
    const refund = this.#attrBuyCost(currentVal, racialLimit); // cost of the last step purchased
    attrStore.set(currentVal - 1);
    this.#getSessionStore(actor).update(s => ({ ...s, stagedSpent: s.stagedSpent - refund }));
}
```

**`commitAttrSession(actor: Actor): void`**
- Debit goodKarma by `stagedSpent`, clear session
```ts
commitAttrSession(actor: Actor): void {
    const session = get(this.#getSessionStore(actor));
    if (!session.active) return;
    const goodKarmaStore = this.#getGoodKarmaStore(actor);
    goodKarmaStore.set(get(goodKarmaStore) - session.stagedSpent);
    this.#getSessionStore(actor).set({ active: false, stagedSpent: 0, attrSnapshot: {} });
}
```

**`cancelAttrSession(actor: Actor): void`**
- Restore all attrs to snapshot, clear session (no goodKarma change)
```ts
cancelAttrSession(actor: Actor): void {
    const session = get(this.#getSessionStore(actor));
    if (!session.active) return;
    for (const [key, snapshotVal] of Object.entries(session.attrSnapshot)) {
        const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${key}.value`);
        attrStore.set(snapshotVal);
    }
    this.#getSessionStore(actor).set({ active: false, stagedSpent: 0, attrSnapshot: {} });
}
```

---

**PART C — Skill delta commit**

`commitSkillDelta(actor: Actor, karmaDelta: number): void`
- Called by skill editors on thumbs-up: debit goodKarma by the editor's accumulated `localStagedSpent`
```ts
commitSkillDelta(actor: Actor, karmaDelta: number): void {
    if (karmaDelta <= 0) return;
    const goodKarmaStore = this.#getGoodKarmaStore(actor);
    goodKarmaStore.set(get(goodKarmaStore) - karmaDelta);
}
```

---

**Imports needed:**
```ts
import { get } from "svelte/store";
import type { Writable } from "svelte/store";
import { StoreManager } from "../../utilities/StoreManager.svelte";
```

No import from IStoreManager needed — use `StoreManager.Instance` directly (same pattern as other services).
  </action>
  <verify>`npx tsc --noEmit` passes with zero errors</verify>
  <done>
- `module/services/karma/KarmaSpendingService.ts` exists and compiles cleanly
- Singleton pattern: `static #instance` + `static Instance()`
- All session methods present: startAttrSession, canStageAttrIncrement, stageAttrIncrement, canStageAttrDecrement, stageAttrDecrement, commitAttrSession, cancelAttrSession
- Public cost helpers: calcSkillCost, calcSpecCost
- commitSkillDelta present
  </done>
</task>

</tasks>

<verification>
Before declaring plan complete:
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `module/services/karma/KarmaSpendingService.ts` exists
- [ ] All method signatures compile: no implicit `any`, no missing types
- [ ] `get` from `svelte/store` is imported for synchronous store reads
</verification>

<success_criteria>
- KarmaSpendingService compiles with zero TypeScript errors
- Singleton pattern matches existing services
- All staged attribute session methods present and correct
- Public cost helpers `calcSkillCost`/`calcSpecCost` available for skill editors
- `commitSkillDelta` available for skill editor commit flow
</success_criteria>

<output>
After completion, create `.planning/phases/3-karma-experience-core/3-01-SUMMARY.md`:

# Phase 3 Plan 01: KarmaSpendingService Summary

**[Substantive one-liner]**

## Performance
- **Duration:** X min
- **Tasks:** 1
- **Files modified:** N

## Accomplishments
- [Key outcomes]

## Files Created/Modified
- `module/services/karma/KarmaSpendingService.ts` — new staged karma service

## Decisions Made
[Key decisions and rationale, or "None"]

## Deviations from Plan
[Any auto-fixed bugs or deferred items, or "None"]

## Issues Encountered
[Problems and resolutions, or "None"]

## Next Step
Ready for 3-02: Attribute session UI wiring (ShoppingCart, AttributeCard, Karma.svelte, CharacterSheet teardown).
</output>
