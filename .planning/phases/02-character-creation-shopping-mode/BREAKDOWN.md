# Phase 2: Character Creation Shopping Mode - Plan Breakdown

## Overview

Phase 2 completes the character creation workflow by implementing shopping mode - where players spend their attribute and skill creation points. This phase adds UI injections to the character sheet and services to track/validate point spending.

**Architecture Pattern**: Services → UI Injections → Integration

## Plan 1: Creation Point Services & Flag Management

**Goal**: Implement services for tracking and calculating creation points (attribute points, skill points) and flag management for character creation state.

**Scope**:
- `CreationPointsService` - Calculate remaining attribute/skill points based on priority selections
- `AttributeSpendingService` - Handle attribute point spending during character creation
- `SkillSpendingService` - Handle skill point spending (active/knowledge/language categories)
- Flag constant definitions (`isCharacterCreation`, `attributeAssignmentLocked`, `isShoppingState`)
- Point calculation formulas from SR3e rules (30/27/24/21/18 for attributes, 50/40/34/30/27 for skills)

**Dependencies**: Phase 1 complete

**Files to create**:
- `module/services/character-creation/CreationPointsService.ts`
- `module/services/character-creation/AttributeSpendingService.ts`
- `module/services/character-creation/SkillSpendingService.ts`
- `module/constants/flags.ts` (or extend existing constants)

**Key methods**:
- `CreationPointsService.getRemainingAttributePoints(actor)` - Calculate unspent attribute points
- `CreationPointsService.getRemainingSkillPoints(actor, category)` - Calculate unspent skill points by category
- `AttributeSpendingService.canSpendPoint(actor, attributeKey)` - Validate attribute purchase
- `SkillSpendingService.canSpendPoint(actor, skillId, category)` - Validate skill purchase
- Flag helpers: `setCharacterCreationMode()`, `lockAttributeAssignment()`, `isInCreationMode()`

**Testing checkpoint**:
- Services can calculate remaining points correctly
- Flag management works with StoreManager
- Point spending validation follows SR3e rules

---

## Plan 2: Shopping Mode UI Injections

**Goal**: Create Svelte components for shopping mode UI - shopping cart toggle and point pool displays.

**Scope**:
- `ShoppingCart.svelte` - Top bar icon injection (terminates creation mode OR toggles karma shopping)
- `CharacterCreationManager.svelte` - Left side injection that manages point pool display
- `AttributePointsState.svelte` - Display remaining attribute points
- `SkillPointsState.svelte` - Display remaining skill points (active/knowledge/language)
- Warning dialog when terminating creation with unspent points
- Integration with CharacterSheet.ts injection system
- Styling for shopping cart pulsing animation and point pool displays

**Dependencies**: Plan 1 (need services for point calculations)

**Files to create**:
- `module/ui/actors/injections/ShoppingCart.svelte`
- `module/ui/actors/injections/CharacterCreationManager.svelte`
- `module/ui/actors/injections/AttributePointsState.svelte`
- `module/ui/actors/injections/SkillPointsState.svelte`

**Files to modify**:
- `module/sheets/actors/CharacterSheet.ts` - Add injection methods for shopping cart and creation manager
- `styles/apps/character-sheet.scss` - Add shopping mode styles

**Component pattern**:
```svelte
<script lang="ts">
   import { StoreManager } from "@helpers/StoreManager.svelte";

   const { actor, config } = $props<{ actor: Actor; config: any }>();
   const storeManager = StoreManager.Subscribe(actor);
   const isCharacterCreation = storeManager.GetFlagStore("isCharacterCreation");
   const isShoppingState = storeManager.GetFlagStore("isShoppingState");

   async function handleToggle() {
      if ($isCharacterCreation) {
         // Terminating character creation - check for unspent points
         const hasUnspentPoints = /* check services */;
         if (hasUnspentPoints) {
            const confirmed = await showWarningDialog();
            if (!confirmed) return;
         }
         // Clear creation flag, unspent points are discarded
         await isCharacterCreation.update(() => false);
      } else {
         // Normal karma shopping toggle
         await isShoppingState.update(v => !v);
      }
   }
</script>

<div>
   <button
      type="button"
      class={`header-control icon fa-solid fa-cart-shopping ${$isShoppingState || $isCharacterCreation ? "pulsing-green-cart" : ""}`}
      onclick={handleToggle}
   />
</div>
```

**Testing checkpoint**:
- Shopping cart icon appears in header and toggles state
- CharacterCreationManager shows correct point pool based on phase (attributes vs skills)
- Point displays update reactively when points are spent
- Components follow presentational-only pattern

---

## Plan 3: Shopping Mode Integration & Completion Logic

**Goal**: Wire shopping mode into the character creation workflow - auto-enter shopping mode after creation dialog, integrate point spending with attribute/skill components, and implement completion logic.

**Scope**:
- Auto-enter shopping mode when opening sheet after character creation
- Set `isCharacterCreation` flag in `CharacterInitializer.initializeNewCharacter()`
- Integrate point spending with `Attributes.svelte` component (allow buying during creation)
- Integrate point spending with `DicePools.svelte` or create Skills component (allow buying during creation)
- Implement attribute phase completion logic (lock attributes, unlock skills)
- Implement creation completion logic (clear `isCharacterCreation` flag)
- Point validation in UI (disable buttons when no points remaining)

**Dependencies**: Plan 2 (need UI components)

**Files to modify**:
- `module/services/character-creation/CharacterInitializer.ts` - Set creation flags on initialization
- `module/ui/actors/actor-components/Attributes.svelte` - Add creation mode buying
- `module/ui/actors/actor-components/DicePools.svelte` - Add creation mode skill buying (or create separate Skills component)
- `module/foundry/hooks/displayCharacterCreationDialog.ts` - Ensure shopping mode entered after creation

**Key features**:
1. **Auto-enter creation mode**: When character sheet opens after creation dialog, `isCharacterCreation` flag is set, shopping cart icon shows pulsing
2. **Attribute phase**: Player can spend attribute points, UI shows remaining points, "Complete Attributes" button locks phase
3. **Skills phase**: After attributes locked, skill point spending unlocks, three categories visible (active/knowledge/language)
4. **Early termination**: Shopping cart button can terminate creation early - warns if unspent points exist, discards them if confirmed
5. **Normal completion**: After all points spent, clicking shopping cart clears `isCharacterCreation` flag without warning

**Testing checkpoint**:
- Full creation workflow: dialog → sheet opens in creation mode → spend attribute points → lock attributes → spend skill points → finish creation
- Early termination workflow: dialog → sheet opens → click shopping cart → warning appears if points unspent → confirm → creation ends with points discarded
- Normal completion workflow: spend all points → click shopping cart → no warning → creation ends
- Point spending works correctly (can't overspend)
- UI updates reactively as points are spent
- Character can be played normally after finishing creation

---

## Notes

**Design decisions**:
- Character creation shopping uses creation points (from priority selection)
- Karma shopping is a completely separate system for post-creation advancement (Phase 3+)
- Shopping cart button dual purpose: terminate creation mode OR toggle karma shopping (mutually exclusive)
- Two-phase creation structure: attributes must be completed before skills can be purchased
- Early termination allowed: players can exit creation with unspent points (with warning)
- Services follow singleton pattern established in Phase 1
- Components are presentational-only, delegating to services
- Flag-based state management through StoreManager for reactivity

**SR3e rules reference**:
- Attribute point pools: 30/27/24/21/18 (priority A-E)
- Skill point pools: 50/40/34/30/27 (priority A-E)
- Skills divided into: active skills, knowledge skills, language skills
- Attribute costs: 1 point per rating increase during creation
- Skill costs: 1 point per rating increase during creation (simpler than karma costs)
