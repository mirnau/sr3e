# Tier 5 — Combat UI

> Expanded. Four concerns: roll composer, defender prompt, resistance prompt, chat renderers. Design copies the old system almost exactly. Svelte 4 → Svelte 5 runes. LESS → SCSS. Procedure class API → ProcedureSetup API.

---

## 1. Roll Composer — `RollComposerComponent.svelte`

### What it is

Embedded panel inside `CharacterSheetApp.svelte` — not a popup window. Always mounted, `visible = false` until triggered. Escape closes. Mirrors the old `RollComposerComponent.svelte` design exactly.

### Trigger mechanism

Skills, attributes, and weapons in the character sheet have click handlers:
- **Left-click** → roll immediately with default state (no composer)
- **Shift+click** → open composer with full customization

**Confirm from old code before implementing**: check `ActiveSkillCard.svelte` and `WeaponComponent.svelte` click handlers in the old project — the exact modifier key is there.

The click handler calls:
```ts
composer.open(buildXxxSetup(actor, item, opts));
```

`open()` is an exported function on the composer component (same pattern as old `setCallerData`).

### Props

```svelte
<script lang="ts">
  const p = $props<{ actor: SR3EActor }>();
  const actor = untrack(() => p.actor);
</script>
```

### State (Svelte 5 runes replacing old writable stores)

```ts
let visible = $state(false);
let setup: ProcedureSetup | null = $state(null);

// User-adjustable RollState (clone of setup.rollState on open)
let targetNumber = $state(4);
let modifiers: Modifier[] = $state([]);
let poolDice = $state(0);
let karmaDice = $state(0);

// Derived
let modifiersTotal = $derived(sumMods(modifiers));
let finalTN = $derived(Math.max(2, targetNumber + modifiersTotal));
let difficulty = $derived(difficultyLabel(targetNumber));
let canSubmit = $derived(finalTN > 1);
let hasTargets = $state(false);     // updated by targetToken Hook

// Firearm-specific
let weaponMode = $state("");
let declaredRounds = $state(1);
let ammoAvailable: number | null = $state(null);

// Pool
let currentPoolKey = $state("");
let poolAvailable = $state(0);

// Karma
let karmaCost = $derived(Math.round(0.5 * karmaDice * (karmaDice + 1)));
let maxAffordableDice = $state(0);

// Defaulting
let isDefaulting = $state(false);
```

### `open(newSetup: ProcedureSetup)` — exported function

Replaces old `setCallerData`. No class instance check.

1. `setup = newSetup`
2. Clone `newSetup.rollState` into local state (targetNumber, modifiers, poolDice, karmaDice)
3. Seed firearm fields from setup if kind is `"firearm"`
4. `visible = true`

**Defender basis case** (existing contest + skill/attribute picked): if `setup.kind` is `"melee-defense"` or `"dodge"` and a contest is already active, update the basis on the existing setup rather than replacing it. Same logic as old `setCallerData` CASE 1.

### Hooks (onMount / onDestroy)

```ts
onMount(() => {
  // Refresh recoil when initiative phase changes
  unhook = Hooks.on("updateCombat", () => {
    if (setup?.kind === "firearm") syncRecoil();
  });

  // Auto-prime range modifier on target change
  targetHook = Hooks.on("targetToken", (user, token, targeted) => {
    if (user?.id !== game.user.id) return;
    hasTargets = (game.user.targets?.size ?? 0) > 0;
    if (setup?.kind === "firearm" && hasTargets) primeRangeModifier();
    syncRecoil();
  });
});

onDestroy(() => {
  Hooks.off("updateCombat", unhook);
  Hooks.off("targetToken", targetHook);
});
```

### Effects

```ts
// Auto-remove range modifier if no targets
$effect(() => {
  if (!hasTargets) modifiers = modifiers.filter(m => m.id !== "range");
});

// Clamp declaredRounds to weapon mode limits
$effect(() => {
  const cap = weaponMode === "burst" ? 3 : weaponMode === "fullauto" ? 10 : 1;
  const mag = Number(ammoAvailable ?? cap);
  const min = weaponMode === "fullauto" ? 3 : 1;
  declaredRounds = Math.max(min, Math.min(declaredRounds, Math.min(cap, mag)));
});

// Keep karma pool affordability current
$effect(() => {
  const sum = /* read karmaPool sum from StoreManager */ 0;
  maxAffordableDice = sum > 0 ? Math.floor((-1 + Math.sqrt(1 + 8 * sum)) * 0.5) : 0;
});
```

### Template structure (copy old design exactly)

```
roll-composer-container
  roll-composer-card          ← title + defaulting select
  roll-composer-card          ← TN counter + difficulty label + final TN
  roll-composer-card          ← TN modifiers list (add/remove/name/value)
  roll-composer-card?         ← pool dice counter (hidden if defaulting or no pool)
  roll-composer-card?         ← karma dice counter (hidden if defaulting)
  [firearm only]
    roll-composer-card?       ← rounds counter (burst/fullauto only)
    roll-composer-card?       ← "Clear Recoil" button (if shots > 0)
  button.primary              ← primary action label from setup
```

### On confirm (Roll button click)

```ts
async function onConfirm() {
  if (!setup || !canSubmit) return;
  const finalState: RollState = {
    dice: setup.rollState.dice,  // base dice not user-adjustable
    poolDice: isDefaulting ? 0 : poolDice,
    karmaDice: isDefaulting ? 0 : karmaDice,
    targetNumber,
    modifiers,
  };
  visible = false;
  await CommitPoolAndKarma();
  await executeProcedure(setup, finalState, actor, Array.from(game.user.targets));
}
```

### LESS → SCSS

Port `roll-composer-container`, `roll-composer-card`, `array`, `mod-name`, `sr3e-response-button*` class styles verbatim. Attach via `CharacterSheetApp.svelte`'s SCSS import chain.

---

## 2. Defender Prompt

When a `ContestStub` arrives via socket, Foundry renders a whispered chat message with a `data-contest-id` attribute and response buttons (Dodge / Don't Dodge, or Standard / Full for melee).

Wire the button click handler in `module/sr3e.ts`:

```ts
Hooks.on("renderChatMessage", (msg, html) => {
  if (msg.flags?.sr3e?.opposed) {
    const contestId = msg.flags.sr3e.opposed;
    html.querySelector("[data-responder]")?.addEventListener("click", (e) => {
      const key = e.currentTarget.dataset.responder;
      handleDefenderChoice(contestId, key);
    });
  }
});
```

`handleDefenderChoice(contestId, responderKey)`:
1. Look up contest from `getContest(contestId)`
2. Build defense setup: `buildDodgeSetup` or `buildMeleeDefenseSetup(mode = responderKey)`
3. Open the roll composer on the defender's character sheet: `defenderSheet.composer.open(setup)`

**If defender clicks "No" / "Don't Dodge"**: call `expireContest(contestId)` directly — delivers `__aborted`.

---

## 3. Resistance Prompt

Whispered chat message from `promptResistance`. Contains a "Roll Resistance" button.

```ts
Hooks.on("renderChatMessage", (msg, html) => {
  if (msg.flags?.sr3e?.damageResistance) {
    const ctx = msg.flags.sr3e.damageResistance;
    html.querySelector(".sr3e-resist-damage-button")?.addEventListener("click", () => {
      handleResistanceClick(ctx);
    });
  }
});
```

`handleResistanceClick(ctx)`:
1. Resolve defender actor
2. `setup = buildResistanceSetup(defender, ctx.prep)`
3. Open composer on defender's sheet: `defenderSheet.composer.open(setup)`

The resistance roll's `commitFn` calls `executeResistanceRoll` (Tier 4) which applies damage and posts the result message.

---

## 4. Chat renderers

HTML generation for Foundry chat. Lives in `module/ui/combat/chat/`. Pure functions — no Svelte, no class state.

### `renderContestOutcome(ctx: ContestRenderCtx): string`

```ts
type ContestRenderCtx = {
  initiator: SR3EActor;
  target: SR3EActor;
  weaponName: string;
  initiatorRoll: RollSnapshot;
  targetRoll: RollSnapshot;
  netSuccesses: number;
  familyKey: string;
};
```

Outputs: attacker vs defender header, roll summaries for both sides, winner line.

### `renderRollSummary(actor: SR3EActor, roll: RollSnapshot): string`

Shared between firearm and melee. Extracts from `roll.options`:
- Skill name + specialization + defaulting flag
- OR attribute key
- TN breakdown (base + mods list)
- Pool contributions

Replaces the duplicated `#summarizeRollGeneric` / `#tnBreakdownFromRoll` / `#contribLineFromRoll` in old `FirearmProcedure` and `MeleeProcedure`. Single fn, shared.

### `renderResistancePrompt(prep: ResistancePrep, defender: SR3EActor, weaponName: string): string`

Damage level + track, TN breakdown, "Roll Resistance" button div.

### `renderResistanceOutcome(outcome: ResistanceResult, prep: ResistancePrep, bodySuccesses: number, tn: number): string`

Successes vs TN, pre-resist level, final level, boxes applied, overflow if any.

---

## 5. What is NOT in tier 5

- Any game rules — no staging, no TN math, no armor
- Chat message routing (which users get whispered) — that's tier 4
- Socket emission — tier 4
- Health track updates — tier 4

---

## Implementation order

1. Chat renderers — pure fns, no deps on Svelte
2. `RollComposerComponent.svelte` — depends on tier 1 (modifierList, diceFormula), tier 3 (ProcedureSetup type)
3. `renderChatMessage` hooks for defender + resistance prompts — wired last in `sr3e.ts`
