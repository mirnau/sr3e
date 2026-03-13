# Phase 3 Plan 03: Skill Editor Karma Wiring Summary

**Staged karma wiring for all three skill editors + Karma.svelte redesign as StatCard pair (Movement.svelte pattern)**

## Performance
- **Duration:** ~30 min
- **Completed:** 2026-03-13T22:31:56Z
- **Tasks:** 2 + 1 checkpoint
- **Files modified:** 5

## Accomplishments
- All three skill editors (Active, Knowledge, Language) implement staged karma: snapshot on mount, accumulate localStagedSpent, commit on thumbs-up, revert on close without thumbs-up
- SpecializationCard receives `onincrement`/`ondecrement` in karma mode for staged spec improvement
- Karma.svelte redesigned following Movement.svelte pattern: two StatCards (Karma / Good Karma), live staged-deduction display
- Karma added to CharacterSheetApp alongside Movement, DicePools, etc.

## Files Created/Modified
- `module/ui/items/skill-editor/ActiveSkillEditorApp.svelte` — staged karma model wired (13 changes)
- `module/ui/items/skill-editor/KnowledgeSkillEditorApp.svelte` — staged karma model wired (isActive=false)
- `module/ui/items/skill-editor/LanguageSkillEditorApp.svelte` — staged karma model wired (isActive=false, readwrite field untouched)
- `module/ui/actors/actor-components/Karma.svelte` — rewritten as Movement.svelte-style StatCard pair
- `module/ui/actors/CharacterSheetApp.svelte` — Karma import uncommented, SheetCard added

## Decisions Made
- Karma.svelte shows `lifetimeKarma` (Karma) and `goodKarma` (Good Karma) — two cards matching the Walking/Running pattern from Movement.svelte
- `localStagedSpent` can go negative (when undoing purchases or refunding specs) — this is correct; negative delta means a net refund, and `commitSkillDelta` guards against `karmaDelta <= 0`

## Deviations from Plan
- `linkedAttribute` extraction in ActiveSkillEditorApp used `Record<string, unknown>` instead of `Record<string, any>` to satisfy strict mode — functionally identical
- Karma.svelte was entirely rewritten (not just the display formula) per user direction: Movement.svelte design pattern with StatCard components
- CharacterSheetApp Karma import was commented out (not merely missing) — uncommented and card added

## Issues Encountered
None — human verify approved on first attempt.

## Next Phase Readiness
Phase 3 complete. Full staged karma spending functional for attributes and skills. Ready for Phase 4+.

---
*Phase: 3-karma-experience-core*
*Completed: 2026-03-13*
