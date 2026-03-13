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
- Must work within Foundry VTT v13 framework
- Parallel development - old JS remains as reference
- SR3e rules compliance required
- Pragmatic over academic - KISS principle

## Current Position

Phase: 2.3 of 10+ (Skills Component — COMPLETE)
Plan: 1 of 1 (complete — SUMMARY.md written)
Status: Phase complete — ready for Phase 3
Last activity: 2026-03-08 - 2.3-01 complete (Skills card built + skill editor polished + style architecture enforcement audit)

Progress: ██████░░░░ ~40%

## Performance Metrics

**Velocity:**
- Total plans completed: 9 (Phase 1: 3, Phase 2: 4, Phase 2.1: 1, Phase 2.3: 1)
- Average duration: ~10 min
- Total execution time: ~1.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 3 | 28 min | 9 min |
| 2 | 4 | ~40 min | ~10 min |
| 2.1 | 1 | ~60 min | 60 min |
| 2.3 | 1 | unknown | — |

**Recent Trend:**
- Last 5 plans: 02-03 (?m), 02-04 (15m), 2.1-01 (60m), 2.3-01 (undocumented), style audit (this session)
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

### Roadmap Evolution

- Phase 2.1 inserted after Phase 2: Clean up functional bugs from 02-03 shopping mode integration (URGENT)
- Phase 2.2 inserted after Phase 2.1: Health component visual polish (URGENT)
- Phase 2.3 inserted after Phase 2.2: Skills component — required before karma shopping (Phase 3)
- Phase 2.4 inserted after Phase 2.3: Buying mechanics overhaul — SR3e rule compliance, creation point/buying relationship, unified IStoreManager usage (URGENT)

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

Last session: 2026-03-08
Stopped at: 2.3 complete — skill editor polish, style architecture enforcement, SUMMARY written
Resume file: None
