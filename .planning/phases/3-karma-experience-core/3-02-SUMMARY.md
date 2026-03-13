# Phase 3 Plan 02: Attribute Session UI Wiring Summary

**Wired the KarmaSpendingService attribute session into four UI components: ShoppingCart manages session start/commit, AttributeCard routes karma mode chevrons to staged service methods, Karma.svelte displays live goodKarma - stagedSpent, and CharacterSheet cancels staged changes on teardown.**

## Performance
- **Duration:** ~15 min
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments
- ShoppingCart.svelte now calls `startAttrSession` on toggle-ON and `commitAttrSession` on toggle-OFF (non-creation path only)
- AttributeCard.svelte has `isKarmaMode` derived that activates when shopping is ON and creation is OFF; `isDerivedAttribute` extended to block magic and initiative; `showChevrons` extended for karma mode; `canIncrease/canDecrease/increaseAttribute/decreaseAttribute` all route to KarmaSpendingService in karma mode
- Karma.svelte session default drops stale `baseline` field, adds `attrSnapshot: {}`; display formula changed from `baseline - stagedSpent` to `goodKarma - stagedSpent`
- CharacterSheet.ts calls `cancelAttrSession` in `_tearDown` before unmounting — staged attr changes are reverted when sheet closes without committing

## Files Created/Modified
- `module/ui/actors/injections/ShoppingCart.svelte` — session start/commit on toggle
- `module/ui/actors/actor-components/AttributeCard.svelte` — karma mode staged chevrons
- `module/ui/actors/actor-components/Karma.svelte` — display redesigned (goodKarma - stagedSpent)
- `module/sheets/actors/CharacterSheet.ts` — cancelAttrSession on teardown

## Decisions Made
- `isKarmaMode` derived uses double-negation `!!()` pattern to ensure boolean type; condition checks both stores exist AND shopping is ON AND creation is OFF — matches plan spec exactly.

## Deviations from Plan
None — all four tasks implemented exactly as specified.

## Issues Encountered
None — zero new TypeScript errors introduced. Pre-existing errors in unrelated files (item models, CardiogramAnimationService, BroadcastRegistry, CharacterSheet `_onDropItem` override) were all pre-existing before this plan.

## Next Step
Ready for 3-03: Skill editor karma wiring + human verify checkpoint.
