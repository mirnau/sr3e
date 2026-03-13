---
phase: 3-karma-experience-core
plan: 03
type: execute
---

<objective>
Wire KarmaSpendingService into all three skill editors (Active, Knowledge, Language) using the staged spending model, then verify the full karma spending flow end-to-end.

Purpose: Complete Phase 3 by making skill karma buying functional — staged per editor, committed on thumbs-up, reverted on close without commit.
Output: Three updated skill editor Svelte components; human verification checkpoint; Phase 3 complete.
</objective>

<execution_context>
./.claude/get-shit-done/workflows/execute-phase.md
./.claude/get-shit-done/templates/summary.md
./.claude/get-shit-done/references/checkpoints.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/3-karma-experience-core/3-CONTEXT.md
@.planning/phases/3-karma-experience-core/3-01-SUMMARY.md
@.planning/phases/3-karma-experience-core/3-02-SUMMARY.md

**Prior decisions:**
- Phase 2.4: Knowledge/language editors hardcode Intelligence as linked attr
- Phase 3-01: KarmaSpendingService provides `calcSkillCost`, `calcSpecCost`, `commitSkillDelta`
- Phase 3 staged model:
  - Editor opens → snapshot value + specs, localStagedSpent = 0, committed = false
  - increment/decrement/spec operations → update stores immediately (display changes) + accumulate localStagedSpent; do NOT touch goodKarma
  - `requestCommit` (thumbs-up button) → `commitSkillDelta(actor, localStagedSpent)` debits goodKarma, sets committed = true, closes editor
  - `onDestroy` without commit (karma mode) → restore snapshot (revert stores to saved values); no GK change
  - Decrement only undoes staged increments (cannot go below snapshot value in karma mode)
- `requestCommit` stub already exists in all three editors: `app.requestCommit = () => { /* Phase 3: karma commit hook */ }`
- `// Phase 3: karma shopping` guards in increment/decrement already present

**Relevant source files — read before implementing:**
@module/ui/items/skill-editor/ActiveSkillEditorApp.svelte
@module/ui/items/skill-editor/KnowledgeSkillEditorApp.svelte
@module/ui/items/skill-editor/LanguageSkillEditorApp.svelte
@module/ui/items/skill-editor/SpecializationCard.svelte
@module/services/karma/KarmaSpendingService.ts
@module/constants/flags.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wire ActiveSkillEditorApp.svelte for staged karma spending</name>
  <files>module/ui/items/skill-editor/ActiveSkillEditorApp.svelte</files>
  <action>
Read the full file first, then apply all changes.

**1. Add imports:**
```ts
import { KarmaSpendingService } from "../../../services/karma/KarmaSpendingService";
import { FLAGS } from "../../../constants/flags";
```

**2. Add flag stores** (after existing `isCreation` store):
```ts
const isShoppingState = storeManager.GetFlagStore<boolean>(actor, FLAGS.ACTOR.IS_SHOPPING_STATE, false);
const goodKarmaStore = storeManager.GetRWStore<number>(actor, "karma.goodKarma");
```
Subscribe actor to storeManager is already done — goodKarmaStore reads from the same subscription.

**3. Add `isKarmaMode` derived:**
```ts
const isKarmaMode = $derived(!$isCreation && $isShoppingState);
```

**4. Add snapshot and session state** (top-level, synchronous — runs once at component mount):
```ts
// Karma session state — captured once at mount
const snapshot = { value: $valueStore, specs: [...$specializationsStore] };
let localStagedSpent = 0;
let committed = false;
```

**5. Replace `requestCommit` stub** — commit debits goodKarma and closes editor:
```ts
$effect(() => {
    if (app) {
        app.requestCommit = () => {
            KarmaSpendingService.Instance().commitSkillDelta(actor, localStagedSpent);
            committed = true;
            app?.close();
        };
    }
});
```

**6. Replace `increment()` stub:**
```ts
function increment(): void {
    if (!$isCreation && !$isShoppingState) return;
    if (isKarmaMode) {
        const newRating = $valueStore + 1;
        const cost = KarmaSpendingService.Instance().calcSkillCost(newRating, linkedAttrRating, true);
        if ($goodKarmaStore - localStagedSpent < cost) return;
        $valueStore += 1;
        localStagedSpent += cost;
        return;
    }
    if (!spendingService.canIncrease(actor, skill, SKILL_CATEGORY, linkedAttrRating)) return;
    spendingService.increase(actor, skill, SKILL_CATEGORY, linkedAttrRating);
}
```

**7. Replace `decrement()` stub:**
```ts
function decrement(): void {
    if (!$isCreation && !$isShoppingState) return;
    if (isKarmaMode) {
        if ($valueStore <= snapshot.value) return; // can't undo pre-existing rating
        const cost = KarmaSpendingService.Instance().calcSkillCost($valueStore, linkedAttrRating, true);
        $valueStore -= 1;
        localStagedSpent -= cost;
        return;
    }
    if (!spendingService.canDecrease(actor, skill, SKILL_CATEGORY)) return;
    spendingService.decrease(actor, skill, SKILL_CATEGORY, linkedAttrRating);
}
```

**8. Replace `addSpecialization()` — add karma mode branch:**
```ts
function addSpecialization(): void {
    if (isKarmaMode) {
        if ($valueStore < 1) return;
        const newSpecRating = $valueStore + 1;
        // Spec ceiling: base=1 → max 3; otherwise base × 2
        const specCeiling = $valueStore === 1 ? 3 : $valueStore * 2;
        const existingMaxSpec = $specializationsStore.reduce((max, s) => Math.max(max, s.value), 0);
        if (existingMaxSpec >= specCeiling) {
            ui.notifications?.info("Cannot add specialization — spec ceiling reached.");
            return;
        }
        const cost = KarmaSpendingService.Instance().calcSpecCost(newSpecRating, linkedAttrRating, true);
        if ($goodKarmaStore - localStagedSpent < cost) {
            ui.notifications?.info("Not enough Good Karma.");
            return;
        }
        const newSpec = {
            name: localize(CONFIG.SR3E.SKILL?.newspecialization ?? "SR3E.skill.newspecialization"),
            value: newSpecRating,
        };
        $valueStore -= 1;
        $specializationsStore = [...$specializationsStore, newSpec];
        localStagedSpent += cost;
        return;
    }
    if (!$isCreation) return;
    // ... existing creation mode logic unchanged (one spec limit, etc.) ...
    if ($specializationsStore.length > 0) {
        ui.notifications?.info(localize(CONFIG.SR3E.SKILL?.onlyonespecializationatcreation ?? "sr3e.skill.onlyonespecializationatcreation"));
        return;
    }
    if ($valueStore <= 1) return;
    const newSpec = {
        name: localize(CONFIG.SR3E.SKILL?.newspecialization ?? "SR3E.skill.newspecialization"),
        value: $valueStore + 1,
    };
    $valueStore -= 1;
    $specializationsStore = [...$specializationsStore, newSpec];
}
```

**9. Replace `deleteSpecialization()` — add karma mode branch:**
In karma mode, removing a spec refunds its staged cost and restores base skill.
```ts
function deleteSpecialization(spec: { name: string; value: number }): void {
    if (isKarmaMode) {
        // Refund all levels of this spec
        let specRefund = 0;
        for (let r = 1; r <= spec.value; r++) {
            specRefund += KarmaSpendingService.Instance().calcSpecCost(r, linkedAttrRating, true);
        }
        $specializationsStore = $specializationsStore.filter((s) => s !== spec);
        $valueStore += 1; // restore base skill rating (spec was bought from base)
        localStagedSpent -= specRefund;
        return;
    }
    $specializationsStore = $specializationsStore.filter((s) => s !== spec);
    if ($isCreation) $valueStore += 1;
}
```

**10. Update `deleteSkill()` — add karma mode branch:**
In karma mode, deleting a skill after staged purchases simply reverts everything (snapshot restore will handle it) and closes. No karma debit needed since we haven't committed yet.
```ts
if (confirmed) {
    if (isKarmaMode) {
        // Revert staged changes (same as cancel path) then delete the item
        valueStore.set(snapshot.value);
        specializationsStore.set([...snapshot.specs]);
        committed = true; // prevent onDestroy from double-reverting
        await actor.deleteEmbeddedDocuments("Item", [skill.id!]);
    } else if ($isCreation) {
        await spendingService.deleteWithRefund(actor, skill, SKILL_CATEGORY, linkedAttrRating);
        ui.notifications?.info(localize("SR3E.notifications.skillpointsrefund"));
    } else {
        await actor.deleteEmbeddedDocuments("Item", [skill.id!]);
    }
    app?.close();
}
```

**11. Update `onDestroy` — restore snapshot on cancel:**
```ts
onDestroy(() => {
    if (isKarmaMode && !committed) {
        // Revert staged skill changes — no GK debit
        valueStore.set(snapshot.value);
        specializationsStore.set([...snapshot.specs]);
    }
    storeManager.Unsubscribe(actor);
    storeManager.Unsubscribe(skill);
    if (app?.requestCommit) {
        try { delete app.requestCommit; } catch { app.requestCommit = undefined; }
    }
});
```

**12. Update SpecializationCard bindings** — pass `onincrement`/`ondecrement` in karma mode.
In karma mode, SpecializationCard's +/− buttons improve/refund that spec's staged cost.
```svelte
<SpecializationCard
    bind:specialization={$specializationsStore[i]!}
    {actor}
    {skill}
    isCreationMode={$isCreation}
    ondelete={deleteSpecialization}
    onchange={() => { $specializationsStore = [...$specializationsStore]; }}
    onincrement={isKarmaMode ? (spec) => {
        const newSpecRating = spec.value + 1;
        const specCeiling = $valueStore === 1 ? 3 : $valueStore * 2;
        if (newSpecRating > specCeiling) return;
        const cost = KarmaSpendingService.Instance().calcSpecCost(newSpecRating, linkedAttrRating, true);
        if ($goodKarmaStore - localStagedSpent < cost) return;
        spec.value = newSpecRating;
        $specializationsStore = [...$specializationsStore];
        localStagedSpent += cost;
    } : undefined}
    ondecrement={isKarmaMode ? (spec) => {
        if (spec.value <= 1) return; // let deleteSpecialization handle full removal
        const refund = KarmaSpendingService.Instance().calcSpecCost(spec.value, linkedAttrRating, true);
        spec.value -= 1;
        $specializationsStore = [...$specializationsStore];
        localStagedSpent -= refund;
    } : undefined}
/>
```

**13. Update `disableValueControls`** — already correct (`$isCreation && specs.length > 0`). In karma mode, `$isCreation` is false so controls are never disabled by specs. No change needed.

**14. Update "add specialization" button** — currently `disabled={$valueStore <= 1 || $specializationsStore.length > 0}`. In karma mode, multiple specs are allowed (creation's one-spec limit doesn't apply):
```svelte
disabled={isKarmaMode
    ? $valueStore < 1
    : ($valueStore <= 1 || $specializationsStore.length > 0)}
```
  </action>
  <verify>TypeScript compilation passes; no `any` escape hatches</verify>
  <done>
- All `// Phase 3: karma shopping` stubs replaced
- `requestCommit` implemented (commit + close)
- `onDestroy` reverts snapshot when not committed in karma mode
- Creation mode behavior completely unchanged
- SpecializationCard receives `onincrement`/`ondecrement` in karma mode
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire KnowledgeSkillEditorApp.svelte and LanguageSkillEditorApp.svelte</name>
  <files>
    module/ui/items/skill-editor/KnowledgeSkillEditorApp.svelte,
    module/ui/items/skill-editor/LanguageSkillEditorApp.svelte
  </files>
  <action>
Apply identical changes as Task 1 to both editors. These editors always use Intelligence as the linked attribute (hardcoded per Phase 2.4 decision). Read each file fully before editing.

**Key differences from ActiveSkillEditorApp:**
- `SKILL_CATEGORY = "knowledge"` (or `"language"`)
- `linkedAttrRating` is already computed as `attrs["intelligence"]?.value + attrs["intelligence"]?.modifier` — no change needed
- `isActive = false` in calcSkillCost and calcSpecCost calls
- Creation mode already limits to one specialization — keep that guard in creation branch; karma mode allows multiple
- `LanguageSkillEditorApp` also has Read/Write field (`languageSkill.readwrite.value`) — leave it completely untouched; it has no karma cost rule in scope for Phase 3

Apply the same 12+ changes from Task 1 to each editor:
1. Add `KarmaSpendingService` + `FLAGS` imports
2. Add `isShoppingState` flag store and `goodKarmaStore`
3. Add `isKarmaMode` derived
4. Add snapshot state (`snapshot`, `localStagedSpent`, `committed`)
5. Fill `requestCommit` — commitSkillDelta + close
6. Replace `increment()` stub
7. Replace `decrement()` stub
8. Replace `addSpecialization()` — karma branch + creation branch
9. Replace `deleteSpecialization()` — karma branch
10. Update `deleteSkill()` — karma branch
11. Update `onDestroy` — restore snapshot in karma mode if not committed
12. Pass `onincrement`/`ondecrement` to SpecializationCard in karma mode
13. Update "add specialization" button disabled condition for karma mode

For knowledge/language editors, pass `isActive = false` to both `calcSkillCost` and `calcSpecCost`.
  </action>
  <verify>TypeScript compilation passes for both files; no errors</verify>
  <done>
- Both editors compile cleanly
- No remaining `// Phase 3:` stub comments
- Staged model implemented identically to ActiveSkillEditorApp
- Creation mode behavior in both editors unchanged
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Full Phase 3 karma spending implementation (staged model):
- KarmaSpendingService: attr session management + skill cost helpers
- AttributeCard: staged chevrons in karma mode
- ShoppingCart: start/commit attr session on toggle
- Karma.svelte: live display (goodKarma - stagedSpent)
- CharacterSheet: cancel attr session on teardown
- All three skill editors: staged spending, requestCommit on thumbs-up, snapshot revert on close
  </what-built>
  <how-to-verify>
1. Launch Foundry VTT; open a character sheet that has completed creation mode (`isCharacterCreation` = false)

**Attribute karma (staged session):**
2. Click the shopping cart icon — confirm it turns green/pulsing
3. Attribute chevrons (↑/↓) should appear on Body, Quickness, Strength, Charisma, Intelligence, Willpower
4. Chevrons should NOT appear on Reaction, Essence, Magic, Initiative
5. Click ↑ on an attribute — confirm value increments; confirm Good Karma display DECREASES by the staged amount (but goodKarma field itself is NOT yet debited — refresh sheet and check it's unchanged)
6. Click the shopping cart again to toggle OFF — confirm goodKarma is NOW debited (equals the amount staged)
7. Open the sheet again (re-open or refresh), click shopping cart ON again, stage some attr changes, then **close the sheet window** — confirm attrs are reverted to their original values and goodKarma is unchanged

**Skill karma (staged editor):**
8. Toggle shopping cart ON (non-creation mode)
9. Click the pen icon on a skill card — editor opens
10. Click + in the editor — skill value increments; Good Karma display decreases; but actual goodKarma not yet debited
11. Click − — confirm value decrements back (but cannot go below original rating)
12. Click + a few times, then click the **thumbs-up** button — confirm editor closes, goodKarma IS debited by the correct amount
13. Open another skill editor, click +, then **close without thumbs-up** — confirm skill rating reverts to original, goodKarma unchanged

**Spec karma (staged):**
14. In an editor (karma mode), click "Specialize" — spec appears at base+1; staged karma increases
15. Click + on the spec card — spec improves; staged karma increases
16. Click thumbs-up — goodKarma debited for all staged changes

**Insufficient karma guard:**
17. With low goodKarma, confirm + buttons in editors have no effect when cost exceeds available karma

**Creation mode unaffected:**
18. Create a new character, enter shopping mode (creation mode active) — confirm creation point spending works normally (no karma involved)
  </how-to-verify>
  <resume-signal>Type "approved" to continue, or describe issues to fix</resume-signal>
</task>

</tasks>

<verification>
Before declaring phase complete:
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No `// Phase 3:` stub comments remain in the three editor files
- [ ] Staged model: goodKarma only debited on explicit commit (toggle-off or thumbs-up)
- [ ] Cancel paths: attrs restored on sheet close; skill restored on editor close without thumbs-up
- [ ] Creation mode spending (creation points) completely unaffected
</verification>

<success_criteria>
- All tasks completed
- Human verification approved
- Zero TypeScript errors
- Staged karma spending functional for attributes and skills
- Commit/cancel lifecycle works correctly for both sessions
- Phase 3: Karma & Experience Core complete
</success_criteria>

<output>
After completion, create `.planning/phases/3-karma-experience-core/3-03-SUMMARY.md`:

# Phase 3 Plan 03: Skill Editor Karma Wiring Summary

**[Substantive one-liner]**

## Performance
- **Duration:** X min
- **Tasks:** 2 + 1 checkpoint
- **Files modified:** N

## Accomplishments
- [Key outcomes]

## Files Created/Modified
- `module/ui/items/skill-editor/ActiveSkillEditorApp.svelte` — staged karma model wired
- `module/ui/items/skill-editor/KnowledgeSkillEditorApp.svelte` — staged karma model wired
- `module/ui/items/skill-editor/LanguageSkillEditorApp.svelte` — staged karma model wired

## Decisions Made
[Key decisions and rationale, or "None"]

## Deviations from Plan
[Any auto-fixed bugs or deferred items, or "None"]

## Issues Encountered
[Problems and resolutions, or "None"]

## Next Phase Readiness
Phase 3 complete. Ready for Phase 4+: Skills System (karma-based skill tests, defaulting rules, specialization tests, etc.)
</output>
