# TECHSPEC: Gadget System + Item Sheets

## Context

Foundry VTT has no native concept of "item modifies another item." Gadgets are a deliberate hack: they are a first-class item type (`gadget`) whose effects are expressed as `ActiveEffect` documents embedded on the **target document** (weapon, actor) rather than on themselves. The gadget item is a template — drag it onto a weapon and it stamps one or more `ActiveEffect` records carrying all their configuration in `flags.sr3e.gadget.*`.

This is brittle by nature. The TECHSPEC captures the full working model from the old project so the port is faithful and nothing is accidentally simplified away.

---

## Old Project: Complete Context Analysis

### File Inventory

| File | Role |
|---|---|
| `module/models/item/GadgetModel.js` | TypeDataModel for the gadget item: `type`, `portability`, `commodity` |
| `module/models/effects/Gadget.js` | `GadgetEffect extends ActiveEffect` — adds `isGadget` getter; minimal |
| `module/foundry/sheets/GadgetItemSheet.js` | `ItemSheetV2` subclass, mounts `GadgetApp.svelte` |
| `module/foundry/sheets/GadgetEditorSheet.js` | `ApplicationV2`, dispatches to type-specific Svelte editor via gadgetType map |
| `module/foundry/applications/ActiveEffectsEditor.js` | `ApplicationV2`, per-effect fine-grained editor, mounts `ActiveEffectsEditorApp.svelte` |
| `module/svelte/apps/GadgetApp.svelte` | Item sheet UI: name, type dropdown, commodity, slim `ActiveEffectsViewer` |
| `module/svelte/apps/gadgets/WeaponModApp.svelte` | Type-specific editor: commodity fields + child-effects table, add/edit/delete effects |
| `module/svelte/apps/components/GadgetViewer.svelte` | Drop zone on weapon/actor; groups effects by origin; renders `GadgetRow` per group |
| `module/svelte/apps/components/ActiveEffects/GadgetRow.svelte` | One row per logical gadget; enable toggle, edit/delete/detach buttons |
| `module/svelte/apps/components/ActiveEffects/ActiveEffectsViewer.svelte` | Generic AE panel (non-gadget effects + transferred effects from items) |
| `module/svelte/apps/components/ActiveEffects/ActiveEffectsRow.svelte` | One row per regular `ActiveEffect` in the viewer |
| `module/svelte/apps/components/ActiveEffects/ActiveEffectsEditorApp.svelte` | Full per-effect editor: name, target, duration, `changes[]` table with ComboSearch |
| `module/svelte/apps/components/AssetManager/Effects.svelte` | Thin wrapper: `ActiveEffectsViewer` on the actor |
| `WeaponApp.svelte` | Includes both `GadgetViewer` (gadgets) and `ActiveEffectsViewer` (raw AEs) |

### Data Model

**GadgetModel** (item type `"gadget"`):
```ts
{
  type: StringField,         // gadget type key, e.g. "weaponmod"
  portability: PortabilityModel,
  commodity: CommodityModel,
}
```

**GadgetEffect** extends `ActiveEffect` — adds only `isGadget: true`. No extra data fields.

**Flag schema on each `ActiveEffect` that represents a gadget effect:**
```ts
flags.sr3e.gadget = {
  name: string,          // display name in GadgetRow
  img: string,           // icon url
  isEnabled: boolean,    // master enable toggle state
  type: "gadget",        // discriminator — separates from regular AEs
  origin: string,        // source gadget item id — groups all effects from the same gadget
  gadgetType: string,    // e.g. "weaponmod" — routes GadgetEditorSheet to the right Svelte app
  commodity: {           // cost/availability; stored here, not in item system
    days: number, cost: number, streetIndex: number, isBroken: boolean,
    legality: { status: string, permit: string, priority: string }
  }
}
flags.sr3e.target: "self" | "character"  // per-effect; controls transfer and allowed paths
```

### Attaching a Gadget (the critical flow)

1. User drag-drops a gadget item onto `GadgetViewer` (on a weapon or actor).
2. `GadgetViewer.handleDrop` validates: item type must be `"gadget"`, `system.type` must not be `""`.
3. `addEffect(sourceItem)` runs:
   - Copies all embedded `ActiveEffect` docs from the gadget item, stamping `flags.sr3e.gadget` onto each.
   - If the gadget item has no embedded effects, creates one empty placeholder effect with the flags.
   - `createEmbeddedDocuments("ActiveEffect", effectsToAdd)` on the target weapon/actor.
4. All effects from the same gadget share the same `flags.sr3e.gadget.origin` (= source item id). This is the grouping key.

### Effect Targets and How Foundry Applies Them

- `target: "self"` → `transfer: false`, paths scoped to the item's own `system.*` (e.g. `system.damage.mod`, `system.roll.targetNumber.mod`). Effect stays on the weapon. Applied during item `prepareData`.
- `target: "character"` → `transfer: true`, paths scoped to actor's `system.attributes.*.mod`, `system.dicePools.*.mod`, `system.movement.*.mod`, `system.karma.mod`. Foundry copies these to the actor during `prepareData → applyActiveEffects`.

**Critical**: the ComboSearch in `ActiveEffectsEditorApp` enumerates only paths ending in `.mod` from the flattened schema. This means every stat that gadgets can modify must have a `.mod` field in its data model.

### GadgetViewer (weapon sheet surface)

- Full drag-drop zone. Shows two sections:
  - "Attached gadgets": effects with `flags.sr3e.gadget.type === "gadget"` on the document itself, grouped by origin.
  - "Transferred gadgets" (actor only): effects on the actor's gadget items.
- Refreshes on `actorSystemRecalculated` hook.

### GadgetRow (per-gadget controls)

- **Enable toggle**: updates `disabled` on all effects in the group simultaneously + `flags.sr3e.gadget.isEnabled`.
- **Edit (pencil)**: opens `GadgetEditorSheet(document, effectGroup, config)`. Sheet dispatches to Svelte app based on `gadgetType`. Currently only `"weaponmod"` → `WeaponModApp`.
- **Delete (trash)**: `deleteEmbeddedDocuments` for all effect ids in the group.
- **Detach (link-slash)**: `createEmbeddedGadget` — clones effects into a new `gadget` item on the actor, deletes originals from the weapon. Only enabled when `document.isEmbedded && document.parent instanceof Actor`.

### WeaponModApp (GadgetEditorSheet content)

- Manages the commodity fields for the gadget group (stored in `flags.sr3e.gadget.commodity` on the primary effect, propagated to all sibling effects on update).
- Shows a table of child effects (one `ActiveEffectsRow` per `ActiveEffect` with the same origin).
- "+" button → creates a new sibling effect → immediately opens `ActiveEffectsEditor` on it.
- Closes automatically when `effectsList.length === 0`.

### ActiveEffectsEditorApp (per-effect editor)

- Target selector: `self` or `character` (vehicle/item disabled).
- Duration: `none` (permanent) / turns / rounds / seconds / minutes / hours / days.
- Changes table: rows of `{ key, mode, value, priority }`. Key uses `ComboSearch` against `.mod` paths from the target schema.
- Modes: all `CONST.ACTIVE_EFFECT_MODES` except CUSTOM and MULTIPLY.
- Commits on blur/destroy (`commitChanges`).

### ActiveEffectsViewer (generic, non-gadget)

- Surfaces on: weapon item sheet, gadget item sheet (slim), character sheet Effects tab.
- Filters to `!e.flags?.sr3e?.gadget` — gadget effects do NOT appear here.
- On actor: also shows `transfer: true` effects from all items.
- "+" creates a plain `ActiveEffect` (not a gadget) on the document.

### Registration (sr3e.js entry point)

```js
// Item type registration
{ type: "gadget", model: GadgetModel, sheet: GadgetItemSheet }
```

`GadgetEffect` extends `ActiveEffect` — unclear from the grep if it is registered as `CONFIG.ActiveEffect.documentClass` or is unused in practice. The old code uses plain `ActiveEffect` document creation everywhere (`createEmbeddedDocuments("ActiveEffect", ...)`) — `GadgetEffect` may be vestigial.

### config.js keys

```js
CONFIG.sr3e.gadget = { gadget: "sr3e.gadget.gadget", type: "sr3e.gadget.type" }
CONFIG.sr3e.gadgettypes = { weaponmod: "sr3e.gadgettypes.weaponmod" }
CONFIG.sr3e.notifications.warnnogadgettypeselected = "..."
CONFIG.sr3e.effects = { name, durationType, enabled, disabled, actions, effectscomposer,
                        changesHeader, addChange, attributeKey, changeMode, value, priority,
                        target, permanent, selectProperty, noMatch }
```

---

## Design Decisions (Port)

| Decision | Outcome |
|---|---|
| Storage mechanism | Keep flags hack. No alternative within Foundry constraints. |
| GadgetEffect class | Port but treat as vestigial — use plain `ActiveEffect` creation, keep class for forward compat |
| Gadget item sheet | Port `GadgetItemSheet` + `GadgetApp.svelte` in new project style |
| GadgetEditorSheet | Port as `ApplicationV2`; keep type-dispatch map |
| WeaponModApp | Port as Svelte 5 runes; StoreManager wiring via new project's IStoreManager |
| ActiveEffectsEditorApp | Port; ComboSearch must enumerate `.mod` paths dynamically from schemas |
| GadgetViewer placement | Weapon item sheet only (first). Actor-level later. |
| ActiveEffectsViewer placement | Character sheet Effects tab + weapon sheet |
| Detach flow | Port — creates gadget item on actor, deletes from weapon |

---

## MoSCoW

### MUST

1. Register `gadget` item type with `GadgetModel` (TypeDataModel: `type`, `portability`, `commodity`) and `GadgetItemSheet`.
2. `GadgetApp.svelte` — item sheet: name input, type dropdown (from `CONFIG.SR3E.gadgettypes`), commodity section, slim `ActiveEffectsViewer`.
3. `GadgetViewer.svelte` — drag-drop zone rendering gadget groups, used on `WeaponApp.svelte` (weapon item sheet).
4. `GadgetRow.svelte` — enable toggle, edit/delete/detach per gadget group; grouping by `flags.sr3e.gadget.origin`.
5. `GadgetEditorSheet` — `ApplicationV2` dispatching by `gadgetType` to Svelte app.
6. `WeaponModApp.svelte` — commodity editor + child-effects table for `"weaponmod"` gadget type.
7. `ActiveEffectsEditor` — `ApplicationV2` + `ActiveEffectsEditorApp.svelte`: name, target, duration, changes table with ComboSearch on `.mod` paths.
8. `ActiveEffectsViewer.svelte` — generic non-gadget AE panel, used on weapon sheet and character sheet Effects tab.
9. `ActiveEffectsRow.svelte` — row component for generic AEs.
10. Wire `GadgetViewer` and `ActiveEffectsViewer` into the new project's `WeaponApp.svelte` equivalent.
11. Wire `ActiveEffectsViewer` (as `Effects.svelte` thin wrapper) into character sheet.

### SHOULD

12. ComboSearch component (or equivalent autocomplete) for the attribute key field in `ActiveEffectsEditorApp`.
13. Detach flow (`createEmbeddedGadget` in `GadgetRow`) — promotes weapon effects back to a gadget item on actor.
14. `actorSystemRecalculated` hook integration for reactive gadget panel refresh.

### COULD

15. Additional `gadgetType` editors beyond `"weaponmod"`.
16. Transferred gadget display on the actor (actor-level `GadgetViewer`).

### WON'T (this feature)

- Vehicle or magical gadget types.
- Gadget compendium or global gadget library.

---

## Affected Files (new project)

| File | Change |
|---|---|
| `module/models/items/GadgetModel.ts` | New — TypeDataModel |
| `module/sheets/items/GadgetItemSheet.ts` | New — `ItemSheetV2` subclass |
| `module/ui/items/GadgetApp.svelte` | New — item sheet Svelte app |
| `module/ui/items/gadgets/WeaponModApp.svelte` | New — type-specific gadget editor |
| `module/ui/items/gadgets/GadgetEditorSheet.ts` | New — `ApplicationV2` dispatcher |
| `module/ui/common-components/GadgetViewer.svelte` | New — drop zone + grouped gadget rows |
| `module/ui/common-components/GadgetRow.svelte` | New — per-gadget-group row |
| `module/ui/common-components/ActiveEffectsViewer.svelte` | New — generic AE panel |
| `module/ui/common-components/ActiveEffectsRow.svelte` | New — per-AE row |
| `module/foundry/applications/ActiveEffectsEditor.ts` | New — ApplicationV2 + Svelte mount |
| `module/ui/common-components/ActiveEffectsEditorApp.svelte` | New — per-effect editor |
| `module/ui/items/WeaponApp.svelte` | Add: `GadgetViewer` + `ActiveEffectsViewer` sections |
| `module/ui/actors/actor-components/Effects.svelte` | New — thin wrapper for actor AE viewer |
| `sr3e.ts` | Register gadget item type |
| `CONFIG.SR3E` | Add `gadget`, `gadgettypes`, `effects` keys |

---

## Critical Invariants

- Gadget effects are grouped by `flags.sr3e.gadget.origin`. Do not use any other grouping key.
- `flags.sr3e.gadget.type === "gadget"` is the discriminator between gadget effects and regular AEs. `ActiveEffectsViewer` filters these OUT; `GadgetViewer` filters them IN.
- `transfer: true` must be set on effects with `target: "character"` or Foundry will not apply them to the actor.
- Only `.mod`-suffixed paths from the flattened schema are valid change targets. Data models must expose `.mod` fields for every stat that gadgets should be able to modify.
- `WeaponModApp` closes itself when `effectsList.length === 0` — this is intentional (deleting last effect is equivalent to deleting the gadget).
- Commodity data lives in `flags.sr3e.gadget.commodity` on the primary effect, propagated to all siblings on every update. It does NOT live in the gadget item's `system.commodity` after attachment.
