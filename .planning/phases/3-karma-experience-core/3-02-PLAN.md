---
phase: 3-karma-experience-core
plan: 02
type: execute
---

<objective>
Wire the attribute karma session into the UI: ShoppingCart commit/cancel, AttributeCard staged chevrons, Karma.svelte display redesign (Movement.svelte pattern), and CharacterSheet teardown cancel.

Purpose: Make attribute karma buying functional — staged, committed when shopping cart toggles off, cancelled when sheet closes.
Output: Four updated files; attribute karma buying fully wired.
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
@.planning/phases/3-karma-experience-core/3-01-SUMMARY.md

**Prior decisions affecting this plan:**
- Phase 3-01: KarmaSpendingService provides `startAttrSession`, `canStageAttrIncrement/Decrement`, `stageAttrIncrement/Decrement`, `commitAttrSession`, `cancelAttrSession`
- Phase 3 staged model: attrs update immediately for display; goodKarma debited only on shopping cart toggle-off; sheet close cancels (reverts attrs)
- Karma.svelte must follow Movement.svelte pattern: `GetShallowStore` for `shoppingKarmaSession`, display = `goodKarma - stagedSpent` when session active
- User confirmed: "Karma.svelte can be based on the design of Movement.svelte"
- `isDerivedAttribute` already blocks reaction and essence — extend to also block magic and initiative for karma mode

**Relevant source files — read before implementing:**
@module/ui/actors/injections/ShoppingCart.svelte
@module/ui/actors/actor-components/AttributeCard.svelte
@module/ui/actors/actor-components/Karma.svelte
@module/ui/actors/actor-components/Movement.svelte
@module/sheets/actors/CharacterSheet.ts
@module/constants/flags.ts
@module/services/karma/KarmaSpendingService.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update ShoppingCart.svelte — session commit/start on toggle</name>
  <files>module/ui/actors/injections/ShoppingCart.svelte</files>
  <action>
Replace the non-creation toggle logic with explicit ON/OFF that manages the attr session.

**Current code (non-creation branch):**
```ts
async function handleToggle() {
    if ($isCharacterCreation) {
        await terminateCreation();
    } else {
        await isShoppingState.update((v) => !v);
    }
}
```

**New code:**
```ts
import { KarmaSpendingService } from "../../../services/karma/KarmaSpendingService";

async function handleToggle() {
    if ($isCharacterCreation) {
        await terminateCreation();
        return;
    }
    if ($isShoppingState) {
        // Turning OFF: commit staged attr changes, then deactivate
        KarmaSpendingService.Instance().commitAttrSession(actor);
        await isShoppingState.set(false);
    } else {
        // Turning ON: snapshot attrs, then activate
        KarmaSpendingService.Instance().startAttrSession(actor);
        await isShoppingState.set(true);
    }
}
```

No other changes to this file.
  </action>
  <verify>TypeScript compilation passes; no errors on ShoppingCart import</verify>
  <done>
- `handleToggle` calls `startAttrSession` when activating shopping (non-creation)
- `handleToggle` calls `commitAttrSession` then sets flag to false when deactivating
- Creation mode path unchanged
  </done>
</task>

<task type="auto">
  <name>Task 2: Update AttributeCard.svelte — karma mode staged chevrons</name>
  <files>module/ui/actors/actor-components/AttributeCard.svelte</files>
  <action>
Read the full file first. Then apply targeted changes to add karma mode routing.

**1. Add import:**
```ts
import { KarmaSpendingService } from "../../../services/karma/KarmaSpendingService";
```

**2. Add `isShoppingState` flag store** (after existing flag stores):
```ts
const isShoppingState = $derived(
    actor ? storeManager.GetFlagStore<boolean>(actor, FLAGS.ACTOR.IS_SHOPPING_STATE, false) : null
);
```

**3. Add `isKarmaMode` derived:**
```ts
const isKarmaMode = $derived(
    !!(isShoppingState && isCharacterCreation && $isShoppingState && !$isCharacterCreation)
);
```

**4. Update `isDerivedAttribute`** — extend to block magic and initiative (SR3e rules: magic/initiative cannot be karma-improved):
```ts
const isDerivedAttribute = $derived(
    attributeKey === "reaction" ||
    attributeKey === "essence" ||
    attributeKey === "magic" ||
    attributeKey === "initiative"
);
```

**5. Update `showChevrons`** — extend to also show in karma mode:
Read the current `showChevrons` derivation (it shows when in creation and attrs not locked). Add karma mode:
```ts
const showChevrons = $derived(
    !isDerivedAttribute && (
        (!!isCharacterCreation && !!attributeLocked && $isCharacterCreation && !$attributeLocked) ||
        isKarmaMode
    )
);
```
Preserve the exact existing creation mode logic — only add `|| isKarmaMode`.

**6. Update `canIncrease()`** — route to KarmaSpendingService in karma mode:
```ts
function canIncrease(): boolean {
    if (!actor || !attributeValueStore) return false;
    $attributeValueStore; // reactive touch
    if (isKarmaMode) {
        return KarmaSpendingService.Instance().canStageAttrIncrement(actor, attributeKey);
    }
    $creationPointsStore;
    return spendingService.canIncreaseAttribute(actor, attributeKey);
}
```

**7. Update `canDecrease()`** — route to KarmaSpendingService in karma mode:
```ts
function canDecrease(): boolean {
    if (!actor || !attributeValueStore) return false;
    $attributeValueStore; // reactive touch
    if (isKarmaMode) {
        return KarmaSpendingService.Instance().canStageAttrDecrement(actor, attributeKey);
    }
    return spendingService.canDecreaseAttribute(actor, attributeKey);
}
```

**8. Update `increaseAttribute()` and `decreaseAttribute()`** — route to staged methods:
```ts
function increaseAttribute(): void {
    if (!actor) return;
    if (isKarmaMode) {
        if (!KarmaSpendingService.Instance().canStageAttrIncrement(actor, attributeKey)) return;
        KarmaSpendingService.Instance().stageAttrIncrement(actor, attributeKey);
        return;
    }
    spendingService.increaseAttribute(actor, attributeKey);
}

function decreaseAttribute(): void {
    if (!actor) return;
    if (isKarmaMode) {
        if (!KarmaSpendingService.Instance().canStageAttrDecrement(actor, attributeKey)) return;
        KarmaSpendingService.Instance().stageAttrDecrement(actor, attributeKey);
        return;
    }
    spendingService.decreaseAttribute(actor, attributeKey);
}
```

**Do NOT change the template** — chevron buttons are already wired to `increaseAttribute`/`decreaseAttribute`.
  </action>
  <verify>TypeScript compilation passes; no errors</verify>
  <done>
- Karma mode chevrons appear on buyable attrs when shopping is active (non-creation)
- Chevrons absent on reaction, essence, magic, initiative
- Clicking increments/decrements stages the change (attr value changes, goodKarma does NOT yet change)
- Creation mode behavior completely unchanged
  </done>
</task>

<task type="auto">
  <name>Task 3: Redesign Karma.svelte — Movement.svelte pattern, display goodKarma - stagedSpent</name>
  <files>module/ui/actors/actor-components/Karma.svelte</files>
  <action>
Redesign following the Movement.svelte pattern. Key change: replace the `baseline` concept with live `goodKarma - stagedSpent` display.

**Current display formula:**
```ts
// if ($shopping && $session?.active) return ($session.baseline ?? 0) - ($session.stagedSpent ?? 0);
```

**New display formula:**
```ts
// if ($shopping && $session?.active) return ($good ?? 0) - ($session.stagedSpent ?? 0);
```
This means: the actual goodKarma value minus what's staged. When skill editors commit (`commitSkillDelta`), they debit goodKarma directly — this auto-reflects in the display without needing to update a stale baseline.

**Session shape** — update shallow store default to drop `baseline`, add `attrSnapshot`:
```ts
shoppingKarmaSession = storeManager.GetShallowStore<any>(
    actor,
    "shoppingKarmaSession",
    { active: false, stagedSpent: 0, attrSnapshot: {} }
);
```

**Update the derived display store:**
```ts
goodKarmaDisplay = derived(
    [isShoppingState, shoppingKarmaSession, goodKarmaStore],
    ([$shopping, $session, $good]) => {
        if ($shopping && $session?.active) {
            return ($good ?? 0) - ($session?.stagedSpent ?? 0);
        }
        return $good ?? 0;
    }
);
```

Remove the `import { derived } from "svelte/store"` if it's no longer needed elsewhere — but keep it since `derived` is still used in `goodKarmaDisplay`.

No template changes needed — `{$goodKarmaDisplay ?? 0}` already displays the value correctly.
  </action>
  <verify>TypeScript compilation passes; Karma component renders without errors</verify>
  <done>
- `shoppingKarmaSession` shallow store default no longer includes `baseline`
- Display formula uses `goodKarma - stagedSpent` (not `baseline - stagedSpent`)
- Karma display updates reactively as attrs are staged and as goodKarma is debited by skill commits
  </done>
</task>

<task type="auto">
  <name>Task 4: Update CharacterSheet.ts — cancel attr session on teardown</name>
  <files>module/sheets/actors/CharacterSheet.ts</files>
  <action>
Add session cancel to `_tearDown`. When the sheet closes while shopping mode is active (and not in creation mode), any staged attr changes must be reverted.

**Add import:**
```ts
import { KarmaSpendingService } from "../../services/karma/KarmaSpendingService";
```

**Update `_tearDown`:**
```ts
protected _tearDown(options: DeepPartial<RenderOptions>): void {
    // Cancel any staged attribute karma session (reverts attrs to snapshot, no GK debit)
    KarmaSpendingService.Instance().cancelAttrSession(this.document as Actor);
    this._unmountAllApps();
    super._tearDown(options);
}
```

`cancelAttrSession` is a no-op if no session is active — safe to call unconditionally.
  </action>
  <verify>TypeScript compilation passes; no errors on import</verify>
  <done>
- `_tearDown` calls `cancelAttrSession` before unmounting
- No other changes to CharacterSheet
  </done>
</task>

</tasks>

<verification>
Before declaring plan complete:
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] ShoppingCart.svelte starts/commits session correctly (no direct `isShoppingState.update(v => !v)` in non-creation branch)
- [ ] AttributeCard.svelte: `isKarmaMode` derived exists; `isDerivedAttribute` blocks magic and initiative
- [ ] Karma.svelte: display uses `goodKarma - stagedSpent` (not `baseline - stagedSpent`)
- [ ] CharacterSheet.ts: `_tearDown` calls `cancelAttrSession`
</verification>

<success_criteria>
- All four files updated and compiling cleanly
- Attribute karma session lifecycle: start on toggle-on → stage increments/decrements → commit on toggle-off → cancel on sheet close
- Karma display updates live as attrs are staged
- Creation mode completely unaffected
</success_criteria>

<output>
After completion, create `.planning/phases/3-karma-experience-core/3-02-SUMMARY.md`:

# Phase 3 Plan 02: Attribute Session UI Wiring Summary

**[Substantive one-liner]**

## Performance
- **Duration:** X min
- **Tasks:** 4
- **Files modified:** N

## Accomplishments
- [Key outcomes]

## Files Created/Modified
- `module/ui/actors/injections/ShoppingCart.svelte` — session start/commit on toggle
- `module/ui/actors/actor-components/AttributeCard.svelte` — karma mode staged chevrons
- `module/ui/actors/actor-components/Karma.svelte` — display redesigned (goodKarma - stagedSpent)
- `module/sheets/actors/CharacterSheet.ts` — cancelAttrSession on teardown

## Decisions Made
[Key decisions and rationale, or "None"]

## Deviations from Plan
[Any auto-fixed bugs or deferred items, or "None"]

## Issues Encountered
[Problems and resolutions, or "None"]

## Next Step
Ready for 3-03: Skill editor karma wiring + human verify checkpoint.
</output>
