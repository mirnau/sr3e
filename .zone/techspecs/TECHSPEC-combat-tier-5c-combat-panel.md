# Tier 5c — Combat Panel Integration

> Wire weapons in the inventory to the combat procedure. Three-part scope:
> (1) SR3E initiative pass engine, (2) actor initiative roll, (3) weapon Roll button
> that opens the composer and routes into the full contested flow.

---

## SR3E Combat Procedure (rules reference)

```
WHILE (combat_active) {
  // 1. All Dice Pools Refresh (SR3: p. 104)
  FOR_EACH(character) { refresh_all_pools(); }          // hook: round change

  // 2. Determine Initiative (SR3: p. 104)
  FOR_EACH(character) {
    initiative_score = reaction + sum(initiative_dice) - injury_modifiers;
  }

  // 3. Initiative Passes
  WHILE (any_character.initiative_score > 0) {
    SORT by initiative_score DESC;
    FOR_EACH(acting_character) {
      declare_actions();    // 1 Complex OR 2 Simple + free
      resolve_action();     // RANGED / MELEE / MAGIC / other
    }
    FOR_EACH(character) { initiative_score -= 10; }
  }
}

RESOLVE_RANGED (SR3: p. 109)
  1. range → base TN (Short=4, Med=5, Long=6, Extreme=9)
  2. situational mods (recoil, movement)
  3. attacker success test (skill + combat pool vs TN)
  4. defender dodge test (optional — combat pool vs TN 4)
  5. resistance test (body + combat pool vs Power − Armor)
  6. stage outcome (±1 level per 2 net successes)
  7. apply to condition monitor

RESOLVE_MELEE (SR3: p. 122)
  1. attacker success test (skill + combat pool vs TN 4 ± mods)
  2. defender success test (skill + combat pool vs TN 4 ± mods)
  3. compare — most successes hits; ties go to attacker
  4. stage damage (±1 level per 2 net successes)
  5. resistance test (body + combat pool vs Power − Impact Armor)
```

---

## MoSCoW

### MUST
- `SR3ECombat.ts` — initiative pass engine, port + TypeScript conversion from old_project
- `SR3EActor.rollInitiative()` — roll `{initiative}d6 + reaction`, post to chat, return total
- Register `SR3ECombat` via `SR3ECombat.Register()` in `sr3e.ts`
- `InventoryCard.svelte` Roll button: enabled only when weapon + in active combat + exactly one Foundry target selected
- Click handler: `buildWeaponAttack(actor, item)` → open roll composer via `composerService`
- Composer `onConfirm()` already passes `game.user.targets` to `executeProcedure` → routes to `executeContestedFlow` when `defenseHint` present and targets non-empty — no composer changes needed

### SHOULD
- Roll button tooltip when disabled: "No target selected" or "Not in combat"
- Button state updates reactively when combat starts/ends or target changes (Foundry hooks)

### WONT
- Custom `CombatTracker` UI injection
- Turn enforcement (only act on your own initiative)
- `RESOLVE_MAGIC()` flow — separate tier
- Simple/advanced rolls from weapon cards (players self-manage via skill cards)

---

## Architecture

### `SR3ECombat.ts` — `module/documents/SR3ECombat.ts`

Port directly from `old_project/module/foundry/documents/SR3ECombat.js`.
Remove `CombatService.Print` calls (debug logging only).

```ts
export default class SR3ECombat extends foundry.documents.Combat {
    async startCombat() {
        await this.setFlag("sr3e", "combatTurn", 1);
        await this.setFlag("sr3e", "initiativePass", 1);
        return super.startCombat();
    }

    async rollInitiative(ids: string[], opts = { updateTurn: true }) {
        const updates: { _id: string; initiative: number }[] = [];
        for (const id of ids) {
            const combatant = this.combatants.get(id);
            if (!combatant?.actor) continue;
            const total = await (combatant.actor as SR3EActor).rollInitiative();
            updates.push({ _id: id, initiative: total });
        }
        if (updates.length > 0) await this.updateEmbeddedDocuments("Combatant", updates);
        if (opts.updateTurn) await this.update({ turn: 0 });
        return this;
    }

    async nextTurn() {
        const result = await super.nextTurn();
        if (this.combatant && this.combatant.initiative < 1) {
            await this._advanceInitiativePass();
        }
        return result;
    }

    async _advanceInitiativePass() {
        const currentPass = (this.getFlag("sr3e", "initiativePass") as number) || 1;
        for (const c of this.combatants.contents) {
            if (c.initiative > 0) {
                await c.update({ initiative: Math.max(0, c.initiative - 10) });
            }
        }
        const stillActive = this.combatants.contents.some(c => c.initiative > 0);
        if (stillActive) {
            await this.setFlag("sr3e", "initiativePass", currentPass + 1);
            await this.update({ turn: 0 });
        } else {
            await this.nextRound();
        }
    }

    async nextRound() {
        const hasPositive = this.combatants.contents.some(c => c.initiative > 0);
        if (hasPositive) return this._advanceInitiativePass();

        const round = this.round + 1;
        game.time.advance(3);
        await this.setFlag("sr3e", "combatTurn", round);
        await this.setFlag("sr3e", "initiativePass", 1);
        await this.resetAll({ updateTurn: false });
        return super.nextRound();
    }

    static Register() {
        CONFIG.Combat.documentClass = SR3ECombat;
    }
}
```

### `SR3EActor.ts` — add `rollInitiative()`

Initiative formula: `(attributes.initiative.value + initiative.mod)d6 + (reaction.value + reaction.mod)`.
SR3E: p. 100, 102. Injury modifiers applied via Active Effects on `mod` fields — no special handling here.

```ts
async rollInitiative(): Promise<number> {
    const sys = this.system as CharacterSystem;
    const dice = Math.max(1, sys.attributes.initiative.value + sys.attributes.initiative.mod);
    const react = sys.attributes.reaction.value + sys.attributes.reaction.mod;
    const roll = await new foundry.dice.Roll(`${dice}d6 + ${react}`).evaluate();
    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `Initiative (${dice}d6 + ${react})`,
        rolls: [roll],
    });
    return roll.total ?? 0;
}
```

### `buildWeaponAttack` — `module/services/combat/procedures/weaponAttack.ts`

New pure function. Uses `weaponClassifier` to route to the correct setup builder.
Token resolution: attacker = `canvas.tokens?.controlled[0]`, target = `[...game.user.targets][0]`.

```ts
export function buildWeaponAttack(actor: SR3EActor, item: SR3EItem): ProcedureSetup {
    const ammoAvailable = resolveAmmoCount(actor, item);
    const cls = classifyWeapon(item, ammoAvailable);

    if (cls.isFirearm) {
        const attackerToken = canvas.tokens?.controlled[0] ?? null;
        const targetToken = [...((game.user as any)?.targets ?? [])][0] ?? null;
        return buildFirearmSetup(actor as never, item as never, {
            declaredRounds: cls.declaredRounds,
            ammoAvailable,
            attackerToken: attackerToken?.document ?? null,
            targetToken: targetToken?.document ?? null,
        });
    }

    return buildMeleeSetup(actor as never, item as never);
}

function resolveAmmoCount(actor: SR3EActor, item: SR3EItem): number | null {
    const ws = item.system as { ammoId?: string };
    if (!ws.ammoId) return null;
    const ammo = (actor as any).items?.get(ws.ammoId);
    return (ammo?.system as { quantity?: number })?.quantity ?? null;
}
```

### `InventoryCard.svelte` — Roll button wiring

Enable condition: weapon item type + active Foundry combat + exactly one target.
Button state must react to combat and targeting changes. Use Foundry hooks to invalidate.

```ts
// reactive enable state — add to script
let combatActive = $state(!!game.combat?.active);
let targetCount = $state(game.user?.targets?.size ?? 0);

const isWeapon = $derived(item.type === "weapon");
const isRollEnabled = $derived(isWeapon && combatActive && targetCount === 1);
const rollDisabledReason = $derived(
    !combatActive ? "Not in combat" : targetCount !== 1 ? "Select exactly one target" : ""
);

// hook cleanup in onDestroy
const combatHookId = Hooks.on("updateCombat", () => { combatActive = !!game.combat?.active; });
const targetHookId = Hooks.on("targetToken", () => { targetCount = game.user?.targets?.size ?? 0; });
onDestroy(() => {
    Hooks.off("updateCombat", combatHookId);
    Hooks.off("targetToken", targetHookId);
    // ... existing cleanup
});
```

```svelte
<button
    type="button"
    class="sr3e-toolbar-button fa-solid fa-dice"
    aria-label="Roll"
    title={rollDisabledReason}
    disabled={!isRollEnabled}
    onclick={onRollClick}
></button>
```

```ts
function onRollClick() {
    if (!isRollEnabled) return;
    const setup = buildWeaponAttack(actor as SR3EActor, item as SR3EItem);
    openComposer(actorId, setup);  // composerService.svelte.ts
}
```

`openComposer` = the `registerComposerForActor` / calling pattern already in `composerService.svelte.ts`.
Check that `InventoryCard` receives `actorId` prop or derives it from `(actor as any).id`.

### Composer → contested flow path (no changes)

When `onConfirm()` fires in `RollComposerComponent.svelte`:
```ts
const targets = Array.from(game.user?.targets ?? []);
await executeProcedure(setup, actor, { targets, rollState: finalState, poolKey, advanced: true });
```

`executeProcedure` routes to `executeContestedFlow` because:
- `setup.defenseHint` is set (both firearm and melee setups set this)
- `targets.length > 0`

Chat renderers used by contested + resistance flows (no changes needed):
- `renderRollSummary` — attacker roll summary
- `renderContestOutcome` — who wins the exchange
- `renderDefenderPrompt` — socket message prompting defender to roll
- `renderResistancePrompt` — prompts damage-taker for resistance roll
- `renderResistanceOutcome` — final damage level posted to chat

### Pool refresh (no changes)

`registerPoolRefreshHook()` in `socketHandlers.ts` fires on `round` change.
`SR3ECombat.nextRound()` calls `super.nextRound()` only when all passes exhausted → Foundry `round` increments exactly once per SR3E combat turn → pool refresh timing is correct.

---

## Registration in `sr3e.ts`

```ts
import SR3ECombat from "./documents/SR3ECombat";

// in Hooks.once("init"):
SR3ECombat.Register();
```

---

## Implementation Order

1. `SR3ECombat.ts` — port and register
2. `SR3EActor.ts` — add `rollInitiative()`
3. `weaponAttack.ts` — `buildWeaponAttack` helper
4. `InventoryCard.svelte` — enable logic, hooks, click handler
