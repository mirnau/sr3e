# TECHSPEC: Weapons Item Migration

Migrate the weapon item from old_project into sr3e. The data model is already ported.
What remains: sheet class, Svelte app, shared components, i18n wiring, and registration.

## Source files (old_project/sr3e)

| Source | Destination |
|---|---|
| `module/foundry/sheets/WeaponItemSheet.js` | `module/sheets/items/WeaponSheet.ts` |
| `module/svelte/apps/WeaponApp.svelte` | `module/ui/items/WeaponApp.svelte` |
| `module/svelte/apps/components/Commodity.svelte` | `module/ui/common-components/Commodity.svelte` |
| `module/svelte/apps/components/Portability.svelte` | `module/ui/common-components/Portability.svelte` |
| `module/svelte/apps/components/basic/ComboSearch.svelte` | `module/ui/common-components/ComboSearch.svelte` |

## What already exists in sr3e

- `module/models/items/WeaponModel.ts` — complete, no changes needed
- `system.json` — `weapon` already in `documentTypes.Item`
- `ItemSheetComponent.svelte`, `ItemSheetWrapper.svelte`, `Image.svelte`, `JournalViewer.svelte`, `StatCard.svelte` — ported

## MoSCoW

### MUST

1. **`lang/config/WeaponConfig.ts`** — define weapon, commodity, portability i18n key arrays.
   Use `createCategory` pattern from `lang/config.ts`. Three arrays:
   - `WEAPON_KEYS`: `weapon`, `damage`, `damageType`, `mode`, `ammunitionClass`, `range`, `recoilCompensation`, `reloadMechanism`, `rangeband`, `rangebandshort`, `rangebandmedium`, `rangebandlong`, `rangebandextreme`
   - `COMMODITY_KEYS`: `commodity`, `days`, `cost`, `streetIndex`, `isBroken`, `legalstatus`, `legalpermit`, `legalenforcementpriority`
   - `PORTABILITY_KEYS`: `portability`, `concealability`, `weight`

2. **`lang/config.ts`** — add `WEAPON`, `COMMODITY`, `PORTABILITY` via `createCategory`.
   Also add select-option maps: `WEAPON_MODES`, `RELOAD_MECHANISMS`, `AMMO_CLASSES`, `LEGAL_STATUSES`, `LEGAL_PERMITS`, `LEGAL_PRIORITIES`.
   These are flat `Record<string, string>` (key → i18n token) for `<select>` options.

3. **`lang/en.json`** — add all weapon/commodity/portability strings + select option labels.
   Sourced from old_project `lang/en.json` sections: `weapon`, `commodity`, `portability`,
   `weaponMode`, `reloadMechanism`, `ammunitionClass`, `legalstatus`, `legalpermit`, `legalpriority`.

4. **`module/ui/common-components/ComboSearch.svelte`** — port from old.
   Modernise: replace `createEventDispatcher` with a `onselect` callback prop (`(value: string) => void`).
   Keep all keyboard/accessibility/dropdown-portal logic intact.
   Use Svelte 5 runes throughout.

5. **`module/ui/common-components/Commodity.svelte`** — port from old.
   Adapt: use `CONFIG.SR3E.COMMODITY` for labels, `CONFIG.SR3E.LEGAL_STATUSES` etc. for select options.
   Drop `config` prop — read from `CONFIG.SR3E` directly.
   Svelte 5 runes. Use `untrack` for item prop per CLAUDE.md pattern.

6. **`module/ui/common-components/Portability.svelte`** — port from old.
   Adapt: `CONFIG.SR3E.PORTABILITY` for labels. Drop `config` prop.
   Svelte 5 runes. `untrack` for item prop.

7. **`module/ui/items/WeaponApp.svelte`** — port from old `WeaponApp.svelte`.
   Key migration deltas:
   - Props: `{ item: Item }` only — no `config` prop; read `CONFIG.SR3E` directly.
   - Svelte 5 runes with `untrack` for item prop per CLAUDE.md.
   - `StoreManager` removed — `linkedSkillId` persisted via direct `item.update(...)`.
   - `ComboSearch` `on:select` event → `onselect` callback prop.
   - `kvOptions(obj)` inline fn: `Object.entries(obj).map(([value, token]) => ({ value, label: localize(token) }))`.
   - `GadgetViewer` and `ActiveEffectsViewer` excluded (gadget system is SHOULD, not in scope).
   - `JournalViewer` already exists at `../common-components/JournalViewer.svelte`.

8. **`module/sheets/items/WeaponSheet.ts`** — new, following `SkillSheet.ts` / `MetatypeSheet.ts` pattern.
   Extend `SR3EItemBase`. Mount `WeaponApp`. Title: `localize(CONFIG.SR3E.WEAPON.weapon): ${item.name}`.
   Classes: `["sr3e", "sheet", "staticlayout", "weapon"]`.

9. **`types/configuration-keys.ts`** — add `weapon: "weapon"` to `typekeys`.

10. **`sr3e.ts`** — import `WeaponModel` and `WeaponSheet`. Add registration entry:
    `{ docClass: Item, type: typekeys.weapon, model: WeaponModel, sheet: WeaponSheet }`.

## Out of scope

- `GadgetViewer` / gadget system — tracked as SHOULD in PLAN.md
- `ActiveEffectsViewer` — not yet implemented in new project
- `WeaponModApp.svelte` — weapon mod gadget UI, deferred with gadget system
- `WeaponComponent.svelte` (AssetManager) — deferred until Tier 5c

## Invariants

- `ComboSearch` must anchor its portal dropdown to `.item-sheet-component` ancestor,
  same as old implementation (line 121 in old ComboSearch).
- `linkedSkillId` skill-picker must support `skill.id::specIndex` compound IDs
  (same resolution as `resolveLinkedSkill` in the combat service).
- `item.parent?.items` collection listeners must be torn down in `onDestroy`.
