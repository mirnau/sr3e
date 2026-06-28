# TECHSPEC: Ammunition Item Port

## Source
`old_project/sr3e/module/models/item/AmmunitionModel.js`
`old_project/sr3e/module/svelte/apps/AmmunitionApp.svelte`
`old_project/sr3e/module/foundry/sheets/AmmunitionItemSheet.js`

## Reference implementation
`module/sheets/items/WeaponSheet.ts` + `module/ui/items/WeaponApp.svelte` + `module/models/items/WeaponModel.ts`

---

## MoSCoW

### MUST

- **M1**: Add `"ammunition"` to `typekeys` in `types/configuration-keys.ts`
- **M2**: Create `AmmunitionModel.ts` at `module/models/items/AmmunitionModel.ts`
  - Fields: `class: StringField`, `type: StringField`, `reloadMechanism: StringField`, `rounds: NumberField (initial 10, integer)`, `maxCapacity: NumberField (initial 10, integer)`
  - Embedded: `portability: EmbeddedDataField(PortabilityModel)`, `commodity: EmbeddedDataField(CommodityModel)`
  - Extends `TypeDataModel<AmmunitionSchema, BaseItem>`
- **M3**: Create `AmmunitionSheet.ts` at `module/sheets/items/AmmunitionSheet.ts`
  - Extends `SR3EItemBase`
  - Class list: `["sr3e", "sheet", "staticlayout", "ammunition"]`
  - Title from `CONFIG.SR3E.AMMUNITION.ammunition` + item name
  - Mounts `AmmunitionApp.svelte`; pushes to `this.apps`
- **M4**: Create `AmmunitionApp.svelte` at `module/ui/items/AmmunitionApp.svelte`
  - Svelte 5 runes + TypeScript; `untrack` pattern for `item` prop
  - `system` typed as `Record<string, any>` via `item.system`
  - Local `kvOptions` fn (same as WeaponApp)
  - Three stat sections:
    1. **Ammo stats** (single-column `stat-grid`): class (select, `CONFIG.SR3E.AMMO_CLASSES`), type (select, `CONFIG.SR3E.AMMO_TYPES`), reloadMechanism (select, `CONFIG.SR3E.RELOAD_MECHANISMS`)
    2. **Capacity** (two-column `stat-grid`): rounds (number), maxCapacity (number)
  - Name input uses `large-input-wrapper` / `large-input-background` / `large` class pattern
  - Panels: `<Commodity>`, `<Portability>`, `<JournalViewer>` — no props beyond `{item}` (current project style)
  - `ItemSheetWrapper csslayout="double"` wrapping `ItemSheetComponent` + standalone panels
- **M5**: Register in `sr3e.ts` — add entry to `registerDocumentTypes` array:
  ```ts
  { docClass: Item, type: typekeys.ammunition, model: AmmunitionModel, sheet: AmmunitionSheet }
  ```
- **M6**: Add `AMMUNITION` config block to `lang/config.ts`
  - Keys at minimum: `ammunition`, `class`, `type`, `rounds`, `maxcapacity`
  - Verify `AMMO_TYPES` exists or add it (old project had `config.ammunitionType`; current project only has `AMMO_CLASSES`)
- **M7**: Add `"ammunition"` to `CONFIG.SR3E.ITEM_TYPES` in lang/config so Foundry shows the type label

### SHOULD

- **S1**: Check `system.json` `documentTypes.Item` array — add `"ammunition"` if not present
- **S2**: Verify `CONFIG.SR3E.AMMO_TYPES` exists; if not, define it alongside `AMMO_CLASSES`

### COULD

- **C1**: AmmunitionComponent.svelte in AssetManager — defer; depends on Inventory feature

---

## Data model

```ts
type AmmunitionSchema = {
  class: StringField;
  type: StringField;
  reloadMechanism: StringField;
  rounds: NumberField;
  maxCapacity: NumberField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};
```

---

## UI layout (WeaponApp style)

```
ItemSheetWrapper [double]
  ItemSheetComponent
    Image
    large-input-wrapper > input[name]
    ItemSheetComponent > h3 "Ammo Stats"
      stat-grid single-column
        StatCard: class (select)
        StatCard: type (select)
        StatCard: reloadMechanism (select)
      stat-grid two-column
        StatCard: rounds (number)
        StatCard: maxCapacity (number)
  Commodity {item}
  Portability {item}
  JournalViewer document={item}
```

---

## Files to create / modify

| Action | Path |
|--------|------|
| Create | `module/models/items/AmmunitionModel.ts` |
| Create | `module/sheets/items/AmmunitionSheet.ts` |
| Create | `module/ui/items/AmmunitionApp.svelte` |
| Modify | `types/configuration-keys.ts` — add `ammunition` to typekeys |
| Modify | `lang/config.ts` — add AMMUNITION block + AMMO_TYPES if missing |
| Modify | `sr3e.ts` — register model + sheet |
| Verify | `system.json` — `documentTypes.Item` includes `"ammunition"` |

---

## Constraints

- No `config` prop on AmmunitionApp — use `CONFIG.SR3E.*` directly (WeaponApp style, not old AmmunitionApp style)
- No linked skill (unlike weapon)
- No `$state(item.system)` — read from `item.system` directly; updates via `item.update({...})`
- StatCard `{item}` not `{item, ...entry}` spread — pass each prop explicitly (current project convention in WeaponApp)
