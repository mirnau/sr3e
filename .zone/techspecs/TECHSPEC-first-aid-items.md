# TECHSPEC: Medical Items

## Summary

A new `medical` item type. Commodity + portability like all other items. Effects defined via native Foundry AEs on the item (consumable path) and/or a gadget slot (renewable kit path). Activated by dragging from inventory and dropping on a canvas token. No roll gate — table handles that. Token-only drop path solves the self-treatment edge case naturally.

---

## MoSCoW

### MUST

**Data model (`MedicalModel`)**
- Fields: `portability` (EmbeddedDataField), `commodity` (EmbeddedDataField) — same pattern as all other items
- No extra domain fields. Behavior is entirely carried by AEs and gadgets.
- Register in `system.json` as `"medical": {}`

**Item sheet (`MedicalSheet` + `MedicalApp.svelte`)**
- Follows the `AmmunitionSheet` → `AmmunitionApp.svelte` pattern exactly
- App sections: image, name, commodity, portability, ActiveEffectsViewer, GadgetViewer
- GadgetViewer's `document` prop receives the medical item — allows a "Medical Supplies" gadget to attach

**Gadget target: `medical`**
- Add `medical` entry to `GADGET_TARGETS` in `gadgetTargets.ts`
- `itemType: "medical"`
- Properties exposed to the structured picker:

| Group | Change key | Label |
|---|---|---|
| Health | `system.health.stun.value` | Stun |
| Health | `system.health.physical.value` | Physical |
| Health | `system.health.overflow.value` | Overflow |
| Health | `system.health.penalty.value` | Wound Penalty |
| Attributes | `system.attributes.body.mod` | Body |
| Attributes | `system.attributes.quickness.mod` | Quickness |
| Attributes | `system.attributes.strength.mod` | Strength |
| Attributes | `system.attributes.charisma.mod` | Charisma |
| Attributes | `system.attributes.intelligence.mod` | Intelligence |
| Attributes | `system.attributes.willpower.mod` | Willpower |
| Attributes | `system.attributes.reaction.mod` | Reaction |
| Movement | `system.movement.walking.mod` | Walking |
| Movement | `system.movement.running.mod` | Running |
| Dice Pools | `system.dicePools.combat.mod` | Combat Pool |
| Dice Pools | `system.dicePools.astral.mod` | Astral Pool |
| Dice Pools | `system.dicePools.hacking.mod` | Hacking Pool |
| Dice Pools | `system.dicePools.control.mod` | Control Pool |
| Dice Pools | `system.dicePools.spell.mod` | Spell Pool |

**Use mechanic (`applyMedical` service)**
- Triggered when a `medical` item is dropped onto a canvas token
- Hook: `Hooks.on("dropCanvasData", ...)` — intercept drops on `Token` targets
- Identify source item from drag payload UUID; identify target actor from token
- Apply all native AEs from the medical item to the target actor (`createEmbeddedDocuments("ActiveEffect", ...)`)
- **Consumable path** (no gadget on item): after AEs applied, delete the medical item from source actor's inventory
- **Renewable path** (gadget present — `flags.sr3e.gadget.type === "gadget"` on item):
  - Apply gadget AEs to the target actor
  - Roll `1d6` in the background (no UI)
  - If result === 1: delete the gadget's AEs from the medical item (depleted), whisper depletion message to controlling player + GM
  - If result > 1: item stays unchanged

**Inventory integration**
- Add `"medical"` to `INVENTORY_TYPES` in `Inventory.svelte`
- Add `MedicalComponent.svelte` branch in `InventoryCard.svelte` — shows depletion state: "Supplied" (gadget present) / "Depleted" (no gadget, but item exists) / blank (consumable, no gadget slot used)
- No new filter toggle — medical items appear in the unfiltered inventory

**i18n**
- Add `"medical"` to `ITEM_TYPES` in `en.json` and `AttributeComponentsConfig.ts`
- Add `"medical"` section keys: `medical`, `depleted`, `supplied`
- Add `"medicalDepletedChat"` to a new `MEDICAL` config key: `"{name}'s medical supplies are depleted."`

### SHOULD

- `MedicalComponent.svelte` shows a subtle "depleted" visual state (greyed icon or label) when renewable kit has no gadget

### WON'T (this feature)

- Roll gate (TN / dice pool) — handled at the table
- Quantity field — consumable = delete on use; renewable = gadget presence tracks state
- New inventory filter tab — medical goes in the main unfiltered grid
- Sheet-drop path — token-only by design

---

## Affected Files

| File | Change |
|---|---|
| `system.json` | Add `"medical": {}` to Item types |
| `module/models/items/MedicalModel.ts` | New file |
| `module/sheets/items/MedicalSheet.ts` | New file |
| `module/ui/items/MedicalApp.svelte` | New file |
| `module/ui/actors/actor-components/inventory/components/MedicalComponent.svelte` | New file |
| `module/services/gadgets/gadgetTargets.ts` | Add `medical` target + properties |
| `module/services/medical/applyMedical.ts` | New service — core use logic |
| `module/ui/actors/actor-components/inventory/Inventory.svelte` | Add `"medical"` to `INVENTORY_TYPES` |
| `module/ui/actors/actor-components/inventory/InventoryCard.svelte` | Add `medical` branch |
| `lang/en.json` | Add medical i18n keys |
| `lang/config/AttributeComponentsConfig.ts` | Add MEDICAL_KEYS |
| `sr3e.ts` (or config entry point) | Register `MedicalSheet`, expose `CONFIG.SR3E.MEDICAL` |

---

## Key Invariants

- Renewable vs consumable is implicit: gadget present = renewable, no gadget = consumable.
- Token drop only — no sheet drop path.
- AEs on the item define all effects; no hardcoded stat changes in the service.
- 1d6 depletion: only whispers, never blocks the use action.
- `applyMedical` is purely synchronous from the player's perspective — apply + roll + whisper, no modals.
