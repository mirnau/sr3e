# TECHSPEC: Overflow Damage Rules

## Summary

Wire the existing overflow track to a reactive death-display state. Death = `overflow > body` — derived, never stored. EKG flatlines. Heart icon becomes the single miraculous-survival action gate. No modals block gameplay; all state is reversible by editing overflow.

---

## MoSCoW

### MUST

- **EKG condition**: Change `$effect` trigger from `!$isAlive` to `$overflow > $body`. Reactive — editing overflow back below body restores normal animation automatically.
- **Body store**: Subscribe `attributes.body.total` via StoreManager in `Health.svelte`. Derive `isDead = $overflow > $body`.
- **Heart icon states**:
  - Default: normal color, `tabindex=-1`, non-interactive
  - `isDead && !$miraculousSurvival`: `--accent-color` (rgb(255, 32, 144)), clickable
  - `$miraculousSurvival === true`: `.used` class, permanently disabled
- **`revive()` rewrite**: Remove `DialogV2.confirm`. On click: call `KarmaPoolBurnService.burnAll(actor)`, then `overflow.set(0)`, then `miraculousSurvival.set(true)`. Do not write `isAlive`.
- **`KarmaPoolBurnService.burnAll(actor)`**: Zero `karma.karmaPool.value` and `karma.goodKarma`. Post chat message (key: `CONFIG.SR3E.KARMA.miraculousSurvivalChat` — add to config if absent). Existing `burn()` / `spend()` untouched.
- **Overflow stat card display**: Show `$overflow / $body` when `$overflow > 0`, else show `0`.
- **Stop writing `isAlive`**: Remove `isAlive.set(true)` from `revive()`. Leave field on model — do not migrate, do not wire to new logic.

### SHOULD

- Chat message on miraculous survival includes actor name and confirms both karma pools were zeroed.

### WON'T (this feature)

- Bleed-out timer / periodic combat-turn ticks — removed by design decision.
- Death modal / confirmation dialog on death — gameplay decision belongs at the table.
- GM Revive button — overflow is editable directly; no special button needed.
- `isAlive` flag wiring — orphaned, left on model only.

---

## Affected Files

| File | Change |
|---|---|
| `module/ui/actors/actor-components/Health.svelte` | Body store, `isDead` derivation, EKG effect, heart icon conditions, revive fn, stat card display |
| `module/services/karma/KarmaPoolBurnService.ts` | Add `burnAll(actor)` |
| `module/config.ts` (or equivalent) | Add `miraculousSurvivalChat` i18n key if absent |

**No changes to:**
- `resistanceFlow.ts` — `applyDamageBoxes` already writes overflow correctly
- `HealthModel` — all fields already exist (`stun`, `physical`, `overflow`, `isAlive`, `miraculousSurvival`)
- `ElectroCardiogramService` — `flatline()` / `resume()` already exist

---

## Key Invariants

- Death state is always `$overflow > $body` — never stored, always derived.
- Miraculous survival is once-per-lifetime: `miraculousSurvival = true` permanently disables the heart icon.
- Karma cost: both `karmaPool.value` and `goodKarma` zeroed on survival.
- Revive resets `overflow = 0` only — stun and physical tracks stay maxed.
- `isAlive` field: leave on model, write nothing, read nothing.
