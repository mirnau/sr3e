# Phase 2: Character Creation Shopping Mode - Context

**Gathered:** 2026-01-14
**Status:** For planning

<phase_objectives>
## What This Phase Accomplishes

Complete the character creation workflow by implementing shopping mode - the second phase where players spend their attribute and skill creation points on the character sheet.

**Primary goal:**
After the character creation dialog, players use the character sheet to spend:
1. Attribute points first (via chevrons on attribute cards)
2. Skill points second (active/knowledge/language categories)

**Clarifications:**
- Shopping mode UI injections already exist (ShoppingCart, CharacterCreationManager, AttributePointsState, SkillPointsState)
- Focus is on making Attributes.svelte interactive with chevrons for point spending
- Attribute spending must be completed before skill spending unlocks
- Follow Phase 1 service patterns (singleton, delegation)

**Out of scope:**
- Karma-based shopping (post-creation advancement) - deferred to Phase 3
- Skill specializations during creation
- Equipment/resource spending
</phase_objectives>

<constraints>
## Constraints

**Technical:**
- Must integrate with existing CreationPointsService (from 02-01)
- Must follow Phase 1 patterns: singleton services, StoreManager reactivity
- Svelte 5 runes ($state, $derived, $effect)
- TypeScript strict mode, no `any` types
- Presentational-only components - all business logic in services

**Timeline:**
- Blocking Phase 3 (karma advancement requires completed character)

**Resources:**
None

**Dependencies:**
- Phase 1 complete (character creation dialog creates characters with flags set)
- Plan 02-01 complete (CreationPointsService, flag management)
- Injection components exist (ShoppingCart, CharacterCreationManager, point displays)

**Other:**
- SR3e creation rules: attributes start at 1, racial maximums apply
</constraints>

<risks>
## Risks and Mitigation

No major risks identified - straightforward implementation expected.

**Minor consideration: Reactivity chain complexity**
- **Likelihood:** Low
- **Impact:** Low
- **Mitigation:** Follow established StoreManager patterns from Phase 1
</risks>

<success_indicators>
## Success Indicators

**How we'll know this phase is complete:**

**Functional:**
- [ ] Attributes display shows chevrons during creation mode
- [ ] Up chevron increases attribute, consumes point
- [ ] Down chevron decreases attribute, refunds point
- [ ] Chevrons disabled at racial min/max boundaries
- [ ] Point pool display updates reactively
- [ ] "Complete Attributes" button locks attribute phase
- [ ] After locking, skill spending phase begins

**Quality:**
- [ ] No TypeScript errors
- [ ] Components follow presentational-only pattern
- [ ] Service layer handles all business logic

**User-facing:**
- [ ] Chevrons styled to match SR3e aesthetic (green/cyberpunk)
- [ ] Clear visual feedback on remaining points
- [ ] Intuitive workflow from attributes to skills
</success_indicators>

<codebase_context>
## Codebase State and Patterns

**Current state:**
Mid-phase - Plan 02-01 complete, injection components exist, Attributes.svelte needs enhancement.

**Relevant files/systems:**
- `module/ui/actors/actor-components/Attributes.svelte` - Needs chevrons for point spending
- `module/ui/actors/injections/CharacterCreationManager.svelte` - Manages point display switching
- `module/ui/actors/injections/AttributePointsState.svelte` - Shows remaining attribute points
- `module/services/character-creation/CreationPointsService.ts` - Point tracking (from 02-01)
- `module/constants/flags.ts` - Flag constants (isCharacterCreation, attributeAssignmentLocked)
- `module/utilities/StoreManager.svelte` - Reactivity system

**Patterns to follow:**
- Singleton services with static Instance() getters
- StoreManager.Subscribe(actor) for reactivity
- Flag stores via GetFlagStore(FLAGS.ACTOR.*)
- Presentational components delegate to services
- Svelte 5 runes: $props, $state, $derived, $effect

**External dependencies:**
- Foundry VTT v12+ API
- Svelte 5

**Known issues to address:**
None

**Prior decisions affecting this phase:**
- Phase 1: Singleton pattern for all services
- Phase 2: Skill point distribution 60/25/15 (active/knowledge/language)
- Phase 2: Minimum attribute value is 1
- Phase 2: Maximum skill rating is 6
- Phase 2: Flag namespace "sr3e"
</codebase_context>

<decisions_needed>
## Decisions That Will Affect Implementation

No open decisions - approach is clear from roadmap and context.

Implementation will:
1. Enhance Attributes.svelte with conditional chevrons (visible only in creation mode)
2. Chevrons call CreationPointsService methods for spending/refunding
3. Service enforces SR3e rules (racial min/max, available points)
</decisions_needed>

<notes>
## Additional Context

[Questions asked during intake:]
- Q: How should auto-enter shopping mode work?
- A: Shopping mode UI injections already exist and seem implemented

- Q: When attribute spending is complete, what happens?
- A: Attribute phase locks, then skill spending unlocks. Each phase independent.

- Q: What codebase patterns to examine?
- A: Phase 1 services - follow CharacterCreationService patterns

[Clarifications:]
- Focus is on attribute chevrons in Attributes.svelte
- Injection components (02-02-PLAN) appear to already exist
- User wants to see point spending work before moving to skills

[References:]
- Plan 02-01-SUMMARY.md (completed services)
- Plan 02-02-PLAN.md (UI injections - may be complete or partially complete)
</notes>

---

*Phase: 02-character-creation-shopping-mode*
*Context gathered: 2026-01-14*
*Ready for planning: yes*
