# TECHSPEC: Weapon Charging Mechanic

## Context

Firearms on the inventory card show a `ROUNDS: x/max` display (already implemented via `WeaponComponent.svelte`). The weapon data model already stores `ammoId` pointing to an ammo item in the actor's inventory. The reload button (`fa-repeat`) is already rendered for firearms and calls `reloadWeapon`. However:

- `reloadWeapon` silently auto-picks the first compatible ammo — no player choice.
- `findCompatibleAmmo` reads `as.ammunitionClass` but `AmmunitionModel` stores the field as `class` — live bug, filter never matches.
- No eject/unload workflow exists.

This feature delivers a proper reload dialog and fixes the data model mismatch.

---

## Design Decisions

| Decision | Outcome |
|---|---|
| Compatibility gate | `ammunitionClass` match (required) + `reloadMechanism` match (skipped if either is empty) |
| Who shows up in dialog | Equipped ammo only (`isEquipped` flag) |
| Dialog style | `DialogV2.prompt` with `<select>` dropdown |
| Eject option | "— Unloaded —" entry at top of dropdown |
| No-ammo case | Dialog opens; dropdown is empty except for the Unloaded entry |
| Old ammo on swap | Stays in inventory with remaining rounds intact |
| Chat on reload | None — player discloses in character |
| Rounds display | Already on the weapon card; NOT repeated in dialog |
| Field rename | `AmmunitionModel.class` → `AmmunitionModel.ammunitionClass` |

---

## MoSCoW

### MUST

1. Rename `AmmunitionModel` field `class` → `ammunitionClass` and update all references (model, type, Svelte sheets, ammo service).
2. Fix `findCompatibleAmmo` to match on `ammunitionClass` (required) and `reloadMechanism` (only when both weapon and ammo have a non-empty value).
3. Only include equipped ammo (`isEquipped` flag) in candidates.
4. Replace `reloadWeapon` with a dialog flow: open `DialogV2.prompt` with a `<select>` listing compatible ammo items plus an "— Unloaded —" sentinel at the top.
5. On confirm: if "Unloaded" selected, set `weapon.system.ammoId = ""`; otherwise set `weapon.system.ammoId = chosen.id`.
6. Dialog must open even when no compatible ammo exists (dropdown is empty save for the Unloaded option).

### SHOULD

7. Dropdown option label format: `{ammo.name} — {rounds}/{maxCapacity} rounds` — gives the player enough context to choose.
8. Dialog title: `Reload: {weapon.name}`.

### WON'T (this feature)

- Chat message on reload/eject.
- Data migration for existing world ammo items with the old `class` field (dev system, no live data).
- Encumbrance enforcement (noted for future run).

---

## Affected Files

| File | Change |
|---|---|
| `module/models/items/AmmunitionModel.ts` | Rename `class` → `ammunitionClass` in schema and type |
| `module/ui/items/AmmunitionApp.svelte` (or equivalent sheet) | Update any binding to `system.class` |
| `module/services/combat/procedures/ammoService.ts` | Fix `AmmoSystem` type, fix `findCompatibleAmmo`, replace `reloadWeapon` with dialog flow |
| `module/ui/actors/actor-components/inventory/InventoryCard.svelte` | No change — already wires reload button to `reloadWeapon` (rename TBD) |

---

## Compatibility Logic

```
function isCompatible(ammo, weapon):
  if ammo.system.ammunitionClass !== weapon.system.ammunitionClass: return false
  if weapon.system.reloadMechanism !== "" and ammo.system.reloadMechanism !== "":
    if ammo.system.reloadMechanism !== weapon.system.reloadMechanism: return false
  return ammo.isEquipped and ammo.system.rounds > 0
```

---

## Dialog Flow

```
onReloadClick(actor, weapon):
  candidates = findCompatibleAmmo(actor, weapon)
  chosen = await pickAmmoDialog(candidates, weapon)
  if chosen is null: return   // user cancelled
  if chosen is "__UNLOADED__": weapon.update({ "system.ammoId": "" })
  else: weapon.update({ "system.ammoId": chosen.id })
```

`pickAmmoDialog` uses `DialogV2.prompt` with:
- A `<select name="ammoId">` pre-populated with `<option value="__UNLOADED__">— Unloaded —</option>` followed by one `<option>` per candidate.
- `rejectClose: false` so closing the window returns `null` (no-op).
