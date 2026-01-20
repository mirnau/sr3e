# Project State

## Project Summary

**Building:** Complete architectural migration of 20,000-line Foundry VTT Shadowrun 3e system from JavaScript to TypeScript with SOLID refactoring.

**Core requirements:**
- Clean layered architecture: UI (Svelte) → Service Layer → IStoreManager → Foundry VTT
- Character-first migration: creation → sheet → advancement → skills → combat → magic → equipment
- TypeScript strict mode with no `any` or `object` escape hatches
- Let-it-fail error philosophy (no convoluted error handling)
- Store-first reactive model with proper lifecycle management
- Data models strictly adhere to SR3e core rulebook rules

**Constraints:**
- Must work within Foundry VTT v12+ framework
- Parallel development - old JS remains as reference
- SR3e rules compliance required
- Pragmatic over academic - KISS principle

## Current Position

Phase: 2 of 10+ (Character Creation Shopping Mode)
Plan: 3 of 4 complete in current phase
Status: In progress
Last activity: 2026-01-19 - Completed 02-04-PLAN.md (Health Component Styling & ECG Animation)

Progress: █████░░░░░ ~25%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 10 min
- Total execution time: 0.8 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 3 | 28 min | 9 min |
| 2 | 2 | 22 min | 11 min |

**Recent Trend:**
- Last 5 plans: 01-02 (6m), 01-03 (8m), 02-01 (20m), 02-02 (2m)
- Trend: Variable (service work is complex, UI integration is quick)

*Updated after each plan completion*

## Accumulated Context

### Decisions Made

| Phase | Decision | Rationale |
|-------|----------|-----------|
| Planning | Adaptive roadmap with review gates | Project too large to plan perfectly upfront, re-evaluate after Phases 1 and 3 |
| Planning | Character-first migration order | Character creation/sheet/advancement must be solid before combat/magic/equipment |
| Planning | Chat/socket as multi-phase effort | Challenge/response flows are complex, defer detailed planning until Phase 3 complete |
| 1 | Singleton pattern for all services | Follow NewsService pattern with static Instance() getters for consistency |
| 1 | Type Safety over Foundry API | Use @ts-expect-error for createEmbeddedDocuments conflicts, maintain strict typing everywhere else |
| 1 | Hardcoded SR3e priority tables | Embed 30/27/24/21/18 (attr) and 50/40/34/30/27 (skills) directly in CharacterInitializer |
| 1 | Default data in service methods | Implement getDefaultHuman() and getDefaultMagic() with hardcoded defaults (CONFIG.SR3E.placeholders doesn't exist) |
| 1 | Type narrowing for game.items | Use Record<string, unknown> assertions for filter operations to satisfy TypeScript strict mode |
| 1 | No exception handling | Removed all throw statements - code works or fails naturally, no defensive checks, use non-null assertions (!) for TypeScript |
| 1 | Weighted randomization | CharacterCreationService uses SR3e-specific weights: metatype favors E (64%), magic favors C/D/E (32% each) |
| 1 | ApplicationV2 integration | CharacterCreationApp extends foundry.applications.api.ApplicationV2, async _renderHTML() returns empty string for Svelte |
| 1 | Service delegation pattern | CharacterCreationService delegates to composed services rather than implementing logic directly |
| 1 | Actor interception architecture | preCreateActor hook returns false to prevent creation, actor created programmatically only after dialog submission |
| 1 | Default item bootstrap | ensureDefaultItemsExist() creates Human + Full Shaman if world empty - ensures minimum viable product |
| 1 | CSS semantic naming | Renamed "item" class to "staticlayout" for static layout sheets - clearer semantic meaning |
| 1 | Component size pragmatism | Final component 323 lines (not 80-100 target) but maintains presentational-only pattern - size due to comprehensive UI |
| 2 | Skill point distribution: 60/25/15 | Active skills are primary focus (60%), knowledge/language are secondary (25%/15%) in SR3e gameplay |
| 2 | Minimum attribute value is 1 | SR3e rule - all attributes start at 1 during creation |
| 2 | Maximum skill rating is 6 | SR3e rule - skills cap at 6 during character creation |
| 2 | Delete skill items when rating reaches 0 | Clean up actor inventory, avoid clutter |
| 2 | Flag namespace "sr3e" | Follows Foundry convention for system flags |
| 2 | Racial max default to 6 | Safe fallback if metatype not found |
| 2 | Scoped Svelte styles for chevrons | Keeps styles co-located with component, avoids global CSS pollution |

### Deferred Issues

None yet.

### Blockers/Concerns Carried Forward

None yet.

## Project Alignment

Last checked: Project start
Status: ✓ Aligned
Assessment: No work done yet - baseline alignment with PROJECT.md vision
Drift notes: None

## Session Continuity

Last session: 2026-01-14 19:47
Stopped at: Completed 02-02-PLAN.md - Attribute chevrons for point spending
Resume file: None
