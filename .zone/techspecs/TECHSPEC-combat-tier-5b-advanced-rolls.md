# Tier 5b — Advanced Rolls (Roll Composer)

> Roll composer: the pre-roll configuration panel for skills, attributes, and pools.
> Shift+click on any skill/attribute card opens it. Player adjusts TN, modifiers, pool dice, karma dice, then confirms.

---

## MoSCoW

### MUST
- New `DicePoolStat` data model (extends `SimpleStat`, adds `spent: NumberField`)
- Update `DicePoolsModel` to use `DicePoolStat` for all 5 pools
- Roll composer as injected, absolutely-positioned panel in `CharacterSheetApp.svelte` (not overlay/modal)
- Per-sheet composer instance via `bind:this` + `setContext`; removes global `composerService.ts` singleton
- `DicePools.svelte` pool cards animate (metallic border sheen) when composer is open
- Mutually exclusive pool selection: click pool card → static active highlight, others keep animating
- Composer panel: TN adjust, named modifiers (add/remove), pool dice (capped by selected pool available), karma dice (capped, cost shown)
- Close button (discard), Reset button (clean slate: TN=4, no mods, poolDice=0, karmaDice=0, no pool selected), Roll button (execute + close)
- Pool dice deduction on confirm: `dicePools.X.spent += poolDice`
- `updateCombat` Foundry hook: reset `dicePools.X.spent = 0` for all 5 pools at combat turn start
- Karma dice deduction on confirm: `karma.karmaPool.value -= karmaCost`; capped at `min(maxAffordable, setup.rollState.dice)`
- Storyteller screen: "Refresh Karma" button per character entry → resets `karma.karmaPool.value` to `karma.karmaPoolCeiling`

### SHOULD
- Pool card animation stops when composer closes
- Karma balance displayed in composer (current karmaPool.value)

### WONT (deferred)
- Post-roll karma (re-roll failures, buy successes, avoid Oops, Hooper-Nelson, Hand of God) — separate UI surface
- Combat panel weapon integration (Tier 5c)

---

## Data Model

### `DicePoolStat` — `module/models/actors/actor-components/DicePoolStat.ts`

Extends `SimpleStat` concept. Three fields:
- `value: NumberField` — computed max (set by DicePools.svelte `$effect` each session)
- `mod: NumberField` — Active Effect modifier
- `spent: NumberField` — dice used this combat turn; available = `value + mod - spent`

Refresh: `spent = 0`.

### `DicePoolsModel` update

Replace `EmbeddedDataField(SimpleStat)` with `EmbeddedDataField(DicePoolStat)` for all 5 pools.

---

## Architecture

### Per-sheet context

`CharacterSheetApp.svelte`:
```ts
let composer: RollComposerComponent;
setContext('sr3e:composer', { open: (setup: ProcedureSetup) => composer.open(setup) });
```

`SkillCard`, `AttributeCard`, `DicePools` shift+click:
```ts
const { open } = getContext('sr3e:composer');
open(buildXxxSetup(...));
```

### Shared composer state via `$state` context

A second context key `'sr3e:composer-state'` carries a `$state` object shared between composer and DicePools:
```ts
type ComposerState = {
    isOpen: boolean;
    selectedPoolKey: string | null;
    poolSpent: number;
};
```
- Composer writes `isOpen = true/false`
- DicePools reads `isOpen` → triggers animation
- DicePools writes `selectedPoolKey` on card click
- Composer reads `selectedPoolKey` to know which pool and its available dice

### Positioning

```scss
.roll-composer-panel {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 10;
}
```

`CharacterSheetApp.svelte` root element needs `position: relative`.

---

## Roll Composer Component

### State (runes)
```ts
let visible = $state(false);
let setup: ProcedureSetup | null = $state(null);
let targetNumber = $state(4);
let modifiers: Modifier[] = $state([]);
let poolDice = $state(0);
let karmaDice = $state(0);

const composerState = getContext('sr3e:composer-state');
const modifiersTotal = $derived(sumMods(modifiers));
const finalTN = $derived(Math.max(2, targetNumber + modifiersTotal));
const difficulty = $derived(difficultyLabel(finalTN));
const canSubmit = $derived(finalTN >= 2 && !!setup);
const karmaCost = $derived(Math.round(0.5 * karmaDice * (karmaDice + 1)));
```

### `open(newSetup: ProcedureSetup)` — exported function

1. `setup = newSetup`
2. Reset to clean slate (targetNumber=4, modifiers=[], poolDice=0, karmaDice=0)
3. `visible = true`
4. `composerState.isOpen = true`
5. `composerState.selectedPoolKey = null`

### `onReset()`
Restore clean slate. Clear `composerState.selectedPoolKey`.

### `onClose()`
`visible = false`, `composerState.isOpen = false`.

### `onConfirm()`
```ts
async function onConfirm() {
    if (!setup || !canSubmit) return;
    const finalState: RollState = {
        dice: setup.rollState.dice,
        poolDice,
        karmaDice,
        targetNumber,
        modifiers,
    };
    visible = false;
    composerState.isOpen = false;
    // deduct pool
    if (composerState.selectedPoolKey && poolDice > 0) {
        await actor.update({ [`system.dicePools.${composerState.selectedPoolKey}.spent`]: currentSpent + poolDice });
    }
    // deduct karma
    if (karmaDice > 0) {
        await actor.update({ "system.karma.karmaPool.value": currentKarma - karmaCost });
    }
    const targets = Array.from((game.user as any)?.targets ?? []);
    await executeProcedure(setup, currentActor as never, { targets: targets as never[], rollState: finalState });
}
```

### Pool dice cap

```ts
const poolKey = $derived(composerState.selectedPoolKey);
const poolAvailable = $derived(
    poolKey ? Math.max(0, actor.system.dicePools[poolKey].value + actor.system.dicePools[poolKey].mod - actor.system.dicePools[poolKey].spent) : 0
);
// clamp poolDice when pool changes or available drops
$effect(() => { if (poolDice > poolAvailable) poolDice = poolAvailable; });
```

### Karma cap

```ts
const karmaBalance = $derived((actor.system as any).karma?.karmaPool?.value ?? 0);
const maxAffordable = $derived(
    karmaBalance > 0 ? Math.floor((-1 + Math.sqrt(1 + 8 * karmaBalance)) * 0.5) : 0
);
const karmaCap = $derived(Math.min(maxAffordable, setup?.rollState.dice ?? 0));
$effect(() => { if (karmaDice > karmaCap) karmaDice = karmaCap; });
```

---

## DicePools Animation

When `composerState.isOpen`:
- All pool cards get CSS class `pool-card--pick-me` → metallic sheen animation on border (CSS only, `@keyframes`, repeats every 2–3s)
- On click: write `composerState.selectedPoolKey = poolKey`
- Selected card gets class `pool-card--active` (static highlight, no animation)
- Non-selected keep animating

When `composerState.isOpen === false`: remove all animation classes.

---

## `updateCombat` hook

In `module/sr3e.ts` (or a dedicated hook file):
```ts
Hooks.on("updateCombat", async (combat, changed) => {
    if (!("turn" in changed) && !("round" in changed)) return;
    for (const combatant of combat.combatants) {
        const actor = combatant.actor;
        if (!actor) continue;
        await actor.update({
            "system.dicePools.combat.spent": 0,
            "system.dicePools.astral.spent": 0,
            "system.dicePools.hacking.spent": 0,
            "system.dicePools.control.spent": 0,
            "system.dicePools.spell.spent": 0,
        });
    }
});
```

---

## Storyteller Screen Karma Refresh

In `StorytellerScreenApp.svelte` (or its sub-component): one button per character entry.

```ts
async function refreshKarma(actor: SR3EActor) {
    const ceiling = actor.system.karma.karmaPoolCeiling;
    await actor.update({ "system.karma.karmaPool.value": ceiling });
}
```

---

## Implementation Order

1. `DicePoolStat` model + `DicePoolsModel` migration
2. Per-sheet context wiring in `CharacterSheetApp.svelte`
3. `RollComposerComponent.svelte` rewrite (positioning, new state, open/close/reset/confirm)
4. `DicePools.svelte` animation + pool selection → context write
5. `updateCombat` hook for pool refresh
6. Storyteller screen karma refresh button
