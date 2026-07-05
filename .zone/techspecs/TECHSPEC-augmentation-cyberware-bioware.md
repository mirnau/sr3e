# Augmentation (Cyberware / Bioware)

## Context

Cyberware and bioware are mechanically identical from a rules standpoint — both cost **Essence** (a permanent character-wide drain via the existing `registerItemEssenceEffectHook` pattern, already proven by `cyberdeckEssence.ts`/`vehicleControlRigEssence.ts`) and both are physically-installed augmentations. Unlike the adept-power split (which needed a genuinely different backend because Power Points and Essence are different economies), cyberware vs. bioware is purely a flavor/category distinction — so this ships as **one registered item type**, not two.

Split out of the original combined cyberware/bioware/adept-power spec — Adept Powers are tracked separately in `TECHSPEC-adept-powers.md` (already shipped).

## Design Decisions

| Decision | Outcome |
|---|---|
| Item type | Single registered type, `augmentation` — one `AugmentationModel`/`AugmentationSheet`/`AugmentationApp.svelte`. No separate `cyberware`/`bioware` document types. |
| Category | A `category: "cyberware" \| "bioware"` dropdown field on the item, purely descriptive — no behavioral branching in the model. |
| Schema fields | `category`, `essenceCost` (float), `portability` (`EmbeddedDataField(PortabilityModel)`), `commodity` (`EmbeddedDataField(CommodityModel)`), `tnModifiers: { targetKind: "skill"\|"attribute", targetId: string, modifier: number }[]` (identical shape to `AdeptPowerModel.tnModifiers`). No `grade`/`rating` fields (dropped from the earlier draft — not needed for this pass). |
| Essence integration | Reuses `registerItemEssenceEffectHook(typekeys.augmentation, ...)` exactly as-is — same mechanism already backing `cyberdeck`/`vehiclecontrolrig`. Reads `system.essenceCost`, bakes a transferred `ActiveEffect` reducing `system.attributes.essence.mod` on embed. |
| Passive stat bonuses | Same pattern as `AdeptPowerApp.svelte`: embed `ActiveEffectsViewer` on the item sheet — augmentations author their own native `.effects` (transfer:true), no bespoke draft-array/hook needed beyond the essence one above. |
| TN modifiers | Reuses the adept-power TN-modifier pipeline (`module/services/combat/adeptPowerModifiers.ts`-style scan) — extend the scan to also check owned `augmentation` items (no archetype gate needed, unlike adept powers; any character can own cyberware/bioware). |
| Sheet layout | Modeled on `WeaponApp.svelte`'s layout/structure (image+name header, stat grid, dropdowns, Commodity/Portability common-components, ActiveEffectsViewer, JournalViewer) rather than `AdeptPowerApp.svelte`'s triple-column layout — match whichever `csslayout` fits the field count best. |
| Gadget-moddability | Augmentation's numeric fields become gadget targets via a new `GADGET_TARGETS` entry (`augmentationProperties()`), mirroring `mechanicalProperties`/`medicalProperties`. |
| Augmentations tab | New character-sheet tab listing owned `augmentation` items as cards (same `InventoryCard`-in-tab pattern as Grimoire), filterable/groupable by `category` if useful. |

## MoSCoW

### MUST

1. `AugmentationModel`/`AugmentationSheet`/`AugmentationApp.svelte` — registered item type (`typekeys.augmentation`) with `category`, `essenceCost`, `portability`, `commodity`, `tnModifiers[]`.
2. Essence hook registration via `registerItemEssenceEffectHook(typekeys.augmentation, ...)`.
3. `ActiveEffectsViewer` embedded on the sheet for passive stat bonuses.
4. TN-modifier pipeline extended to scan owned `augmentation` items alongside `adeptpower` items.
5. New `Augmentations` tab on the character sheet, listing owned augmentation items as cards.
6. Gadget target registration (`augmentationProperties()` in `gadgetTargets.ts`).

### SHOULD

- None.

### COULD

- Grade/rating fields, if a future pass wants cost-scaling by SR3 grade.

### WON'T (this pass)

- Mount/weapon-style linkage between augmentations and other item types.

## Issues

Not yet published.
