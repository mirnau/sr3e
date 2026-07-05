# Adept Powers

## Context

Adept Powers are a fully independent backend from cyberware/bioware — they cost **Power Points** (`MagicModel.adeptData.powerPoints`, an existing but currently-unspent field), not Essence. Adept Powers piggyback on the existing **Grimoire** tab (`module/ui/actors/actor-components/Grimoire.svelte`, already type-agnostic — takes an `Item[]` prop, does its own favorites filtering, no internal type filter) rather than getting a dedicated tab — adept and magician are mutually exclusive archetypes in SR3E (`system.awakened.archetype`, values `"adept"`/`"magician"`), so no character ever needs both spells and powers surfaced simultaneously.

Split out of the original combined cyberware/bioware/adept-power spec — the cost mechanics diverge fundamentally enough that this is its own PLAN.md item. See `TECHSPEC-augmentation-cyberware-bioware.md` for the Essence-based cyberware/bioware backend.

## Design Decisions

| Decision | Outcome |
|---|---|
| AdeptPowerModel fields | `isActive: boolean` (passive vs. active), `hasDrain: boolean` (only meaningful when `isActive`), `powerPointCost: number`, `rating`/level (optional, for leveled powers), `tnModifiers: { targetKind: "skill"\|"attribute", targetId: string, modifier: number }[]`. |
| Passive stat bonuses | No bespoke draft schema — the item's own native `.effects` collection is authored directly via `ActiveEffectsViewer.svelte` (the same component used on the character sheet's Effects tab and on other item sheets like `WearableApp.svelte`). Effects default `transfer: true`, so Foundry's own `applyActiveEffects` pipeline applies them to the owning actor automatically once the power is embedded — no custom `createItem` hook needed (superseded the originally-planned gadget-style bake-in hook). |
| TN modifiers | New, roll-time-only infrastructure — no ActiveEffect path can reach a TN modifier (confirmed: `MatrixProgramModel.tnModifier` is the only precedent, an explicit stopgap noted in `composerService.svelte.ts`). `RollComposerComponent` gains a small addition: when building mods for a given skill/attribute, scan the actor's owned `adeptpower` items for `tnModifiers` entries matching `targetKind`/`targetId` and merge into the existing mods array — same insertion point where `programModifiers` currently merges in. |
| Adept detection | Gate the TN-modifier scan (and the Power Point drop gate) on `system.awakened.archetype === "adept"` from the character's owned Magic item (`ARCHETYPE_KEYS = ["adept", "magician"]`). Cheap guard clause — skip the scan entirely for non-adepts. |
| Attribute Boost / timed-duration powers | **Honorary**, matching the existing sustained-spell precedent (ADR-0009): activating rolls the Magic Test and applies the `ActiveEffect`/`tnModifiers`, but duration countdown, auto-expiry, and the follow-up Drain prompt are **manual** — no Combat-Turn scheduler in this pass. Player/GM removes the effect when they judge duration's up. |
| Drain button | `hasDrain` (only set on active powers) adds a dedicated roll button to the Grimoire power card, separate from the main activation-roll button. Icon: FontAwesome `tornado`. Clicking opens a roll (Willpower-based Drain Resistance Test) — TN entered manually at roll time (context-dependent per power, e.g. half the boosted attribute), not derived. |
| Power Point purchase gate | Reuses the purchase-on-drop pattern (`PurchaseDialog.svelte` + `_onDropItem` branch in `CharacterSheet.ts`, "block outright if insufficient" philosophy — no partial/overdraft). Swap credit-stick balance for `adeptData.powerPoints`, price = item's `powerPointCost`. Insufficient points → drop rejected, power not added. |
| Buy more Power Points | New dialog: "Buy Power Points" button in the Grimoire header, cost fixed at 20 Good Karma (`actor.system.karma.goodKarma`) per Power Point purchased. |
| Grimoire header additions | Add a search/filter bar (Grimoire currently has none — only a favorites `FilterToggle`) alongside a Power-Point-remaining counter (visible only for adept characters) and the "Buy Power Points" button. |
| Power card variants | Adept power cards render via the same `InventoryCard`-in-Grimoire pattern as spell cards. Passive powers: no roll die shown. Active powers: main roll button (Magic Test or whatever the power specifies) + conditional Drain (tornado icon) button if `hasDrain`. |

## MoSCoW

### MUST

1. `AdeptPowerModel`/`AdeptPowerSheet`/`AdeptPowerApp.svelte` — registered item type with `isActive`, `hasDrain`, `powerPointCost`, `rating`, `tnModifiers[]`.
2. `AdeptPowerApp.svelte` embeds `ActiveEffectsViewer` for authoring the power's own passive stat-bonus effects, relying on native Foundry `transfer: true` propagation to the owning actor.
3. `RollComposerComponent` TN-modifier scan: for adept characters (`system.awakened.archetype === "adept"`), merge matching `tnModifiers` entries from owned `adeptpower` items into the roll's mods, alongside existing `programModifiers` merge point.
4. Grimoire renders adept-power cards alongside spell cards (same `InventoryCard` component, just a differently-typed backing item); passive powers show no die; active powers show main roll button; `hasDrain` powers additionally show a `tornado`-icon Drain roll button (Willpower-based, manual TN entry).
5. Power Point purchase gate on drop: reuse `PurchaseDialog.svelte`/`_onDropItem` pattern, block outright if `powerPointCost` exceeds `adeptData.powerPoints`.
6. "Buy Power Points" dialog in Grimoire header: fixed 20 Good Karma per point, deducts from `karma.goodKarma`, credits `adeptData.powerPoints`.
7. Grimoire header gains a search/filter bar and (adept-only) Power-Point-remaining counter.

### SHOULD

- None.

### COULD

- Automated Combat-Turn duration tracking + forced Drain prompt for timed-active powers (currently honorary, matching sustained-spell precedent).

### WON'T (this pass)

- Rating cap enforcement against Magic Attribute (SR3 rule: power levels ≤ Magic Rating) — left as a manual GM/player judgment call, not validated in code.
- Mystic adept (dual magician+adept) special-casing beyond what the existing `magicianData`/`adeptData` sibling-object structure already allows.

## Issues

- #226 Adept Power item type — passive powers
- #227 Active adept power roll + TN-modifier pipeline
- #228 Adept power Drain button (hasDrain)
- #229 Power Point economy + Grimoire header
