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

Phase: 3.2 — complete
Plan: 2 of 2 in phase 3.2 complete
Status: Phase 3.2 complete. KarmaDistributionService + KarmaManager + KarmaRow implemented. Ready for Phase 3.3.
Last activity: 2026-03-14 - Phase 3.2-02 complete: KarmaDistributionService, KarmaManager, KarmaRow, StorytellerScreenApp wired

Progress: █████████░ ~88%

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
| 2.4 | Hardcode Intelligence for knowledge/language editors | SR3e rules mandate Intelligence always; hardcoding is robust against item data defaults (SkillModel skillType defaults are unreliable) |
| 2.4 | All skill types use same linked-attr cost formula | Knowledge/language have Intelligence as threshold — same `value < linkedAttr ? 1 : 2` as active skills. Flat-cost assumption was wrong. |
| 3 | Staged karma spending model | Player can "play around" with changes before committing — attribute session commits when shopping cart toggles OFF; skill session commits via thumbs-up in editor header; sheet close or editor close without thumbs-up cancels (reverts changes, no GK debit) |
| 3 | Karma.svelte display: goodKarma - stagedSpent | Live formula instead of stale baseline — skill editor commits debit goodKarma directly, auto-reflecting in display without extra bookkeeping |

### Roadmap Evolution

- Phase 3.3 inserted after Phase 3.2: Time Manager — TimeService + TimeManager Svelte component for in-game world clock. Deferred from Phase 3.2 to keep it focused on karma distribution.
- Phase 3.2 inserted after Phase 3.1: Storyteller Screen actor — GM karma distribution dashboard (KarmaManager + search). Dice Pool Manager deferred to sockets/game loop phase. Unblocks Phase 3 karma spending verification.
- Phase 3.1 inserted after Phase 3: Svelte component debloat — normalize all 38 Svelte files to DicePools.svelte patterns (stores as top-level const, no redundant hooks, no localize wrappers, no ?? after stores, required actor props) (URGENT)
- Phase 2.1 inserted after Phase 2: Clean up functional bugs from 02-03 shopping mode integration (URGENT)
- Phase 2.2 inserted after Phase 2.1: Health component visual polish (URGENT)
- Phase 2.3 inserted after Phase 2.2: Skills component — required before karma shopping (Phase 3)
- Phase 2.4 inserted after Phase 2.3: Buying mechanics overhaul — SR3e rule compliance, creation point/buying relationship, unified IStoreManager usage (URGENT)
- Phase 2.5 inserted after Phase 2.4: Character sheet UX polish — lock modal timing, linked attr in SkillCard, Packery layout, duplicate skill prevention (URGENT)

### Deferred Issues

None yet.

### Blockers/Concerns Carried Forward

| Phase | Concern | Resolution |
|-------|---------|------------|
| 3 | Karma spending end-to-end not fully verified | Cannot test until storyteller screen (karma distribution UI) is implemented — characters have no Good Karma to spend without it. Verify Phase 3 once storyteller screen is built. |

## Project Alignment

Last checked: Project start
Status: ✓ Aligned
Assessment: No work done yet - baseline alignment with PROJECT.md vision
Drift notes: None

## Session Continuity

Last session: 2026-03-14
Stopped at: Phase 3.1 complete — all 4 plans done, all 38 Svelte files normalized, TypeScript build clean
Resume file: None
