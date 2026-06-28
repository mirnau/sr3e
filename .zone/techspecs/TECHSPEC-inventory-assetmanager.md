# TECHSPEC: Inventory / AssetManager

## Goal
Port the AssetManager component from old_project into the new system, wiring it into the CharacterSheet as a `span="dynamic"` card. Provides the primary inventory UI: filterable item grid, per-card type-specific stats, flag-persisted filter state, and real carried-weight sum.

## MoSCoW

### MUST
- `AssetManager.svelte` — tab shell with three tabs: Inventory (active), Garage (stub), Effects (stub)
- `Inventory.svelte` — Packery card grid (same pattern as `SkillsActive`), 7 filter toggles, real weight sum
- `InventoryCard.svelte` — per-item card: image, name, linked skill subtitle, type sub-component, action buttons, favorite/equipped toggles
- `FilterToggle.svelte` — SVG toggle button (fetches from `systems/sr3e/textures/svgrepo/${svgName}`, ports directly from old project)
- `WeaponComponent.svelte` — cost + mode + clip status (subscribes to linked ammo item's `rounds`/`maxCapacity` via StoreManager)
- `AmmunitionComponent.svelte` — cost + ammo type + rounds/maxCapacity
- `WearableComponent.svelte` — cost + impact + ballistic
- `InventoryConfig.ts` — new lang config keys: `inventory`, `garage`, `effects`, `favourites`, `equipped`
- Wire `InventoryConfig` into `lang/config.ts` as `INVENTORY: createCategory("inventory", INVENTORY_KEYS)`
- Add `sr3e.inventory.*` entries to `lang/en.json`
- Wire `<AssetManager {actor} />` into `CharacterSheetApp.svelte` as `<SheetCard span="dynamic">`
- Carried weight = `actor.items.filter(inventoryTypes).reduce((sum, i) => sum + (i.system.portability?.weight ?? 0), 0)` — displayed as `X kg`

### SHOULD
- Gadget and techinterface appear in the item list (no type-specific sub-component; show name + image only)
- Roll button on weapon cards renders as disabled — no handler (Tier 5c wires it)
- Reload button renders for firearm weapons (`mode` in `manual | semiauto | burst | fullauto`) — calls `ammoService` directly (already implemented)
- Drag-start on InventoryCard sets `text/plain` JSON payload (`{ type: "Item", uuid: item.uuid }`) for Foundry drop compatibility
- Trash button on InventoryCard — `DialogV2.confirm` before `deleteEmbeddedDocuments`

### COULD
- Active Effects tab: wire `ActiveEffectsViewer` if/when one exists in the new system
- Garage tab: wire vehicle items when vehicle economy feature is implemented

## Architecture

### Component tree
```
CharacterSheetApp.svelte
  └─ SheetCard span="dynamic"
       └─ AssetManager.svelte          ← tab state ($state activeTab)
            ├─ Inventory.svelte        ← PackeryGrid + filters + weight
            │    └─ InventoryCard.svelte (×N)
            │         ├─ FilterToggle.svelte (favorite, equipped)
            │         ├─ WeaponComponent.svelte
            │         ├─ AmmunitionComponent.svelte
            │         └─ WearableComponent.svelte
            ├─ [Garage stub]
            └─ [Effects stub]
```

### File locations
```
module/ui/actors/actor-components/inventory/
  AssetManager.svelte
  Inventory.svelte
  InventoryCard.svelte
  FilterToggle.svelte
  components/
    WeaponComponent.svelte
    AmmunitionComponent.svelte
    WearableComponent.svelte
lang/config/InventoryConfig.ts
```

### StoreManager wiring
- `Inventory.svelte`: `Subscribe(actor)` / `Unsubscribe(actor)` on mount/destroy. 7 flag stores on the actor for filter state: `isFavorite`, `isEquipped`, `isAmmunition`, `isWeapon`, `isWorn`, `isGadget`, `isTech` — all `GetFlagStore<boolean>(actor, name, false)`.
- `InventoryCard.svelte`: `Subscribe(item)` / `Unsubscribe(item)`. Flag stores `isFavorite` and `isEquipped` on the item. `GetRWStore<string>(item, "linkedSkillId")` for linked skill resolution.
- `WeaponComponent.svelte`: `Subscribe(item)` / `Unsubscribe(item)`. `GetRWStore<string>(item, "ammoId")`. When `ammoId` is non-empty, dynamically `Subscribe(ammoItem)` and `GetRWStore<number>(ammoItem, "rounds")` + `GetRWStore<number>(ammoItem, "maxCapacity")`. Clean up ammoItem subscription on destroy.

### Prop patterns
All components use the CLAUDE.md `untrack` pattern for one-time init:
```ts
const p = $props<{ actor: SR3EActor }>();
const actor = untrack(() => p.actor);
```

### Inventory item types in scope
`["weapon", "ammunition", "wearable", "gadget", "techinterface"]`

### Filter logic
- Type filters (isWeapon, isAmmunition, isWorn, isGadget, isTech): OR within type group; if none active, all types pass.
- State filters (isFavorite, isEquipped): each independently AND-ed against type result.
- Derived in `Inventory.svelte` via `$derived`.

### Localization
Use `localize(CONFIG.SR3E.INVENTORY.inventory)` etc. — never raw `game.i18n.localize()`.
Sub-component labels reuse existing categories: `CONFIG.SR3E.AMMUNITION.rounds`, `CONFIG.SR3E.WEAPON.mode`, `CONFIG.SR3E.WEARABLE.ballistic`, `CONFIG.SR3E.WEARABLE.impact`, `CONFIG.SR3E.COMMODITY.cost`.

### Packery grid (Inventory inner grid)
Same pattern as `SkillsActive.svelte`:
```svelte
<PackeryGrid gridPrefix="inventory" itemSelector="asset-card-container">
  {#each filteredItems as item (item.id)}
    <div class="asset-card-container">
      <InventoryCard {actor} {item} />
    </div>
  {/each}
</PackeryGrid>
```

### Weight sum
```ts
const INVENTORY_TYPES = ["weapon", "ammunition", "wearable", "gadget", "techinterface"];

const carriedWeight = $derived(
  [...(actor.items ?? [])]
    .filter(i => INVENTORY_TYPES.includes(i.type))
    .reduce((sum, i) => sum + ((i.system as any).portability?.weight ?? 0), 0)
);
```

### isFirearm check
```ts
const FIREARM_MODES = new Set(["manual", "semiauto", "burst", "fullauto"]);
const isFirearm = $derived(item.type === "weapon" && FIREARM_MODES.has((item.system as any).mode ?? ""));
```

## Out of scope
- Roll button wiring (Tier 5c)
- Active Effects viewer implementation
- Garage / vehicle tab
- Weight capacity limit / encumbrance rules
- Item sorting / drag-to-reorder within the grid
