# Karma Shopping UI Wiring

## What this is

Wire the three skill editor apps (Active, Knowledge, Language) to support karma spending mode. `KarmaSpendingService` already has cost calculation (`calcSkillCost`, `calcSpecCost`, `commitSkillDelta`). This feature adds skill session management to the service and connects the editors to it.

Attribute karma shopping is already complete. This spec covers skills and specializations only.

---

## MoSCoW

### MUST

**M1 — Skill karma registry store**

Add a shallow store on the actor: `skillKarmaRegistry: Record<skillId, SkillSession>`.

```ts
interface SkillSession {
    stagedSpent: number;
    snapshot: {
        value: number;
        specializations: Array<{ name: string; value: number }>;
    };
}
```

`Karma.svelte` reads this store and sums all `stagedSpent` values alongside the attr session for `goodKarmaDisplay`.

**M2 — KarmaSpendingService skill session methods**

All methods operate on the `skillKarmaRegistry` shallow store. Methods mirror the attr session pattern.

| Method | Description |
|---|---|
| `startSkillSession(actor, skill)` | Snapshot current value + specs into registry; zero `stagedSpent`. Idempotent. |
| `cancelSkillSession(actor, skill)` | Restore value + specs from registry snapshot to their respective stores; zero and remove registry entry. |
| `commitSkillSession(actor, skillId)` | Call `commitSkillDelta(actor, stagedSpent)`; zero and remove registry entry. |
| `canStageSkillIncrement(actor, skill, linkedAttrRating, isActive)` | `remainingKarma >= calcSkillCost(value+1, linkedAttrRating, isActive)`. Remaining = `goodKarma − totalRegistryStagedSpent − attrSessionStagedSpent`. |
| `stageSkillIncrement(actor, skill, linkedAttrRating, isActive)` | `valueStore.set(v+1)`; accumulate cost in registry. |
| `canStageSkillDecrement(actor, skill)` | `currentValue > snapshotValue`. |
| `stageSkillDecrement(actor, skill, linkedAttrRating, isActive)` | `valueStore.set(v−1)`; refund cost of that step from registry. |
| `canAddSpec(actor, skill)` | `specCount < currentValue` (max specs = current base rating, SR3 p.245). |
| `stageSpecAdd(actor, skill, specName, linkedAttrRating, isActive)` | Add spec at `currentValue + 1`; accumulate `calcSpecCost(currentValue+1, linkedAttr, isActive)`. Does NOT reduce skill value (post-creation rule, SR3 p.82). |
| `canStageSpecIncrement(actor, skill, specIndex, linkedAttrRating, isActive)` | Karma check + ceiling check: `spec.value + 1 <= specCeiling(skillValue)` AND remaining karma covers cost. |
| `stageSpecIncrement(actor, skill, specIndex, linkedAttrRating, isActive)` | `spec.value += 1`; accumulate cost. |
| `canDeleteSessionSpec(actor, skill, specIndex)` | Spec was not present in snapshot (session-added). Pre-session specs are not deletable. |
| `stageSpecDelete(actor, skill, specIndex, linkedAttrRating, isActive)` | Remove spec from store; refund all spend accumulated for that spec's steps this session. Only callable for session-added specs. |

**Spec ceiling (SR3 p.82, p.245):**
```ts
function specCeiling(skillValue: number): number {
    return skillValue === 1 ? 3 : skillValue * 2;
}
```
`canStageSpecIncrement` must check `spec.value + 1 <= specCeiling(currentSkillValue)` before the karma check. `stageSpecAdd` starting rating `skillValue + 1` is always within ceiling (verified: `skillValue+1 ≤ max(3, skillValue*2)` for all `skillValue ≥ 1`).

Pre-session specs: increment only. They cannot be decremented or deleted mid-session — only rolled back via `cancelSkillSession`.

Session-added specs: increment allowed; delete allowed with full GK refund. No decrement below their initial added rating (treat as delete when `spec.value` would reach `currentSkillValue + 1 − 1 = currentSkillValue`... actually, decrement is not supported for specs — delete-and-re-add if needed).

**M3 — Skill editors — karma mode path (all three)**

All three editors (`ActiveSkillEditorApp`, `KnowledgeSkillEditorApp`, `LanguageSkillEditorApp`) need a karma mode branch. Current code guards all mutations behind `if (!$isCreation) return`.

On editor mount in karma mode (`$isShoppingState && !$isCreation`):
- Call `KarmaSpendingService.Instance().startSkillSession(actor, skill)`.

On `requestCommit` (thumbs-up):
- Call `commitSkillSession(actor, skill.id!)`.
- Close editor.

On `onDestroy` without commit (X close or sheet close):
- Call `cancelSkillSession(actor, skill)`.
- This restores stores to snapshot; Foundry persists the rollback via store write → `item.update()`.

Skill `increment()` in karma mode:
- Guard: `canStageSkillIncrement(...)`.
- Action: `stageSkillIncrement(...)`.

Skill `decrement()` in karma mode:
- Guard: `canStageSkillDecrement(...)`.
- Action: `stageSkillDecrement(...)`.

`addSpecialization()` in karma mode:
- Guard: `canAddSpec(...)`.
- Action: `stageSpecAdd(...)` — no skill value reduction.

`deleteSpecialization(spec)` in karma mode:
- Only callable for session-added specs (`canDeleteSessionSpec`).
- Action: `stageSpecDelete(...)`.

Spec increment / decrement in karma mode:
- Pass `onincrement` / `ondecrement` callbacks to `SpecializationCard` when `isKarmaMode`.
- Increment callback: `stageSpecIncrement(...)`.
- Decrement: not supported (pre-session specs immutable, session-added specs are delete-only to undo).

Delete skill button in karma mode:
- Show with modal confirmation dialog (no GK refund; GM refunds manually).
- On confirm: call `cancelSkillSession` to clean up registry, then `actor.deleteEmbeddedDocuments("Item", [skill.id!])`.

**M4 — SpecializationCard karma mode**

Add props:
- `isKarmaMode: boolean`
- `isDeletable: boolean` — false for pre-session specs in karma mode

Behaviour:
- `+` / `−` buttons: enabled when `isKarmaMode && onincrement/ondecrement provided`.
- Delete button: disabled when `isKarmaMode && !isDeletable`.
- Name editing (`contenteditable`): disable in karma mode (name is set at spec creation, not changeable during spending).

**M5 — Karma.svelte goodKarmaDisplay**

Extend the derived store to also subtract sum of all `stagedSpent` values in `skillKarmaRegistry`:

```ts
const goodKarmaDisplay = derived(
    [isShoppingState, shoppingKarmaSession, skillKarmaRegistry, goodKarmaStore],
    ([$shopping, $attrSession, $skillRegistry, $good]) => {
        if (!$shopping) return $good ?? 0;
        const attrSpend = $attrSession?.active ? ($attrSession.stagedSpent ?? 0) : 0;
        const skillSpend = Object.values($skillRegistry ?? {}).reduce((sum, s) => sum + s.stagedSpent, 0);
        return ($good ?? 0) - attrSpend - skillSpend;
    }
);
```

### SHOULD

**S1 — Disable increment controls when karma insufficient**

- Skill `+` button: `disabled={isKarmaMode && !canStageSkillIncrement(...)}`.
- Spec `+` button: `disabled={isKarmaMode && !canStageSpecIncrement(...)}`.
- Add spec button: `disabled={isKarmaMode && !canAddSpec(...)}`.

**S2 — Running karma cost display in editor**

Show the current session's `stagedSpent` for this skill inside the editor UI (e.g. a small badge "−X GK"). Lets the player see accumulated spend before committing.

### COULD

**C1 — Per-step cost tooltip**

Tooltip on `+` button showing the GK cost of the next step.

---

## Affected files

| File | Change |
|---|---|
| `module/services/karma/KarmaSpendingService.ts` | Add M2 skill session methods |
| `module/ui/actors/actor-components/Karma.svelte` | M5 goodKarmaDisplay |
| `module/ui/items/skill-editor/ActiveSkillEditorApp.svelte` | M3 karma mode path |
| `module/ui/items/skill-editor/KnowledgeSkillEditorApp.svelte` | M3 karma mode path |
| `module/ui/items/skill-editor/LanguageSkillEditorApp.svelte` | M3 karma mode path |
| `module/ui/items/skill-editor/SpecializationCard.svelte` | M4 karma mode props |

No new files required.

---

## SR3e rule references

| Rule | Source |
|---|---|
| Skill karma costs | SR3 p.244 |
| Spec karma costs | SR3 p.244–245 |
| Multiple specs post-creation | SR3 p.245 |
| Max specs = skill base rating | SR3 p.245 |
| New spec starts at skillRating + 1 | SR3 p.245 |
| Post-creation spec does not reduce base skill | SR3 p.82 |
| Spec gameplay ceiling: `skillValue * 2` (exception: skillValue=1 → cap 3) | SR3 p.82, p.245 |
| Staged spending session model | ADR 0004 |
