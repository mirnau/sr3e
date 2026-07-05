# Cyberware, Bioware — shared Augmentation backend

## Context

Cyberware and Bioware cost **Essence** — a permanent character-wide drain via the existing `registerItemEssenceEffectHook` pattern (`module/foundry/itemEssenceEffect.ts`), already proven by `cyberdeckEssence.ts`/`vehicleControlRigEssence.ts`. They share a common `Augmentation` schema component and a new **Augmentations** tab on the character sheet.

Split out of the original combined cyberware/bioware/adept-power spec — Adept Powers have a fundamentally different cost economy (Power Points, not Essence) and are tracked separately in `TECHSPEC-adept-powers.md`.

## Design Decisions

| Decision | Outcome |
|---|---|
| Shared backend scope | `Augmentation` component = `essenceCost` (float, manually entered — no grade→cost formula this pass), `grade` (standard/alpha/beta/delta/gamma, display/flavor only for now), `rating`, `source`. Embedded in `CyberwareModel` + `BiowareModel` only. |
| Essence integration | Cyberware and bioware each register their own call to `registerItemEssenceEffectHook(typekeys.cyberware, ...)` / `(typekeys.bioware, ...)`, identical to the cyberdeck/vehicle-control-rig precedent — reads `system.essenceCost` (via the `Augmentation` component), bakes a transferred `ActiveEffect` reducing `system.attributes.essence.mod`. |
| Gadget-moddability | Cyberware/bioware numeric fields become gadget targets via new `GADGET_TARGETS` entries (`cyberwareProperties()`/`biowareProperties()`), mirroring `mechanicalProperties`/`medicalProperties`. |
| Cost model — grade/rating scaling | Flat manually-entered `essenceCost` per item instance. No auto-derivation from grade × base cost. Matches how other item stats (e.g. `WeaponModel.damage`) are authored directly rather than computed. |

## MoSCoW

### MUST

1. `Augmentation` component (`module/models/items/item-components/Augmentation.ts`): `essenceCost` (float), `grade` (enum: standard/alpha/beta/delta/gamma), `rating`, `source`.
2. `CyberwareModel`/`CyberwareSheet`/`CyberwareApp.svelte` — registered item type embedding `Augmentation`.
3. `BiowareModel`/`BiowareSheet`/`BiowareApp.svelte` — registered item type embedding `Augmentation`.
4. Essence hook registration for both new types via `registerItemEssenceEffectHook`.
5. New `Augmentations` tab on the character sheet (replaces nothing — net-new), listing owned cyberware + bioware items as cards.
6. Gadget target registration for cyberware and bioware (`cyberwareProperties()`/`biowareProperties()` in `gadgetTargets.ts`).

### SHOULD

- None.

### COULD

- Grade → essence cost auto-derivation (currently flat manual entry).

### WON'T (this pass)

- Mount/weapon-style linkage between cyberware/bioware and other item types.

## Issues

Not yet published — pending a later pass.
