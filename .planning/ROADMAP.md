# Roadmap: Shadowrun 3e TypeScript Migration

## Overview

This roadmap guides the migration of a 20,000-line Shadowrun 3e Foundry VTT system from JavaScript to TypeScript with full architectural refactoring. The migration follows an adaptive planning approach: detailed planning for immediate phases (1-3), with later phases re-evaluated after each major milestone based on lessons learned.

The strategy is **character-first**: establish the character creation and advancement systems before tackling combat, magic, equipment, and other features. This ensures we have a solid foundation of character mechanics before building systems that interact with them.

**Adaptive Planning Gates:**
- After Phase 1 → Review and detail Phases 2-3
- After Phase 3 → Re-evaluate and break down Phases 4-10
- After each phase → Adjust roadmap based on architectural insights

## Domain Expertise

None - Foundry VTT system development patterns are project-specific.

## Phases

**Concrete Phases (Detailed):**
- [ ] **Phase 1: Character Creation Foundation** - Priority-based creation with point distribution
- [ ] **Phase 2: Character Sheet & Permissions** - Player restrictions, GM manual editing
- [ ] **Phase 3: Karma & Experience Core** - Karma pools, storytellerscreen, advancement

**Tentative Phases (Re-evaluate after Phase 3):**
- [ ] **Phase 4+: Skills System** - Skills buying, progression, tests
- [ ] **Phase 5+: Active Effects & Gadgets** - Effects architecture, item extensions
- [ ] **Phase 6+: Chat & Socket Communication** - Challenge/response flows, client sync
- [ ] **Phase 7+: Combat Resolution** - Initiative, damage, combat pools
- [ ] **Phase 8+: Magic System** - Spells, foci, drain, astral
- [ ] **Phase 9+: Equipment & Inventory** - Weapons, gear, cyberware
- [ ] **Phase 10+: Vehicles & Economy** - Mechanical actors, transactions

## Phase Details

### Phase 1: Character Creation Foundation

**Goal**: Migrate the SR3e priority-based character creation system with full architectural refactoring. Deliver a working character creation dialog that produces complete, playable characters.

**Scope**:
- Priority selection system (A-E for metatype, magic, attributes, skills, resources)
- Mutual exclusivity validation (can't select same priority twice)
- Metatype integration with age/height/weight ranges
- Magic/Awakened character support
- Creation point distribution for attributes and skills
- Weighted randomization algorithm
- Character initialization (set attributes, create embedded items)
- Service architecture: CharacterCreationService singleton with composed repositories

**Depends on**: Nothing (first phase)

**Research**: Unlikely (have reference implementation in old JS code, internal patterns)

**Plans**: TBD (will break down during phase planning)

**Item types involved**: metatype, magic (basic integration)

**Success criteria**:
- User can create complete SR3e character via dialog
- Priority validation works correctly
- Metatype affects age/height/weight ranges
- Randomization uses weighted priorities
- Both awakened and mundane characters initialize correctly
- Svelte component is ~80-100 lines (presentation only)
- All business logic in services
- TypeScript strict mode passes with no `any` types

---

### Phase 2: Character Creation Shopping Mode

**Goal**: Complete the character creation workflow by implementing shopping mode - the second phase where players spend their attribute and skill creation points on the character sheet.

**Scope**:
- Shopping cart icon injection (top bar toggle for shopping mode)
- Character creation manager injection (left side point pool displays)
- Creation point calculation services (attribute points, active/knowledge/language skill points)
- Two-phase point spending: attributes first → skills second (controlled by `attributeAssignmentLocked` flag)
- Point pool displays: AttributePointsState and SkillPointsState components
- Auto-enter shopping mode when opening sheet after character creation dialog
- Point spending validation and completion logic
- Integration with existing Attributes and DicePools components

**Depends on**: Phase 1 (character creation dialog creates characters ready for shopping mode)

**Research**: Unlikely (have reference implementation in old JS code with shopping mode patterns)

**Plans**:
1. Creation Point Services & Flag Management - Services for tracking/calculating points and flag state
2. Shopping Mode UI Injections - Shopping cart toggle and point pool display components
3. Shopping Mode Integration & Completion Logic - Wire services to UI, implement workflows
4. Health Component Styling & ECG Animation - Clean up layout, bring in cardiogram animation service

**Flags involved**:
- `isCharacterCreation`: Indicates character is in creation mode
- `attributeAssignmentLocked`: Controls transition from attribute to skill spending phase
- `isShoppingState`: Shopping cart toggle state (for later karma-based shopping)

**Success criteria**:
- Character sheet auto-enters shopping mode after creation dialog
- Shopping cart icon appears in header and toggles shopping mode
- Point pool displays show remaining attribute and skill points
- Players can spend attribute points in phase 1 (before skills unlock)
- After attribute assignment complete, skill point spending unlocks
- Point calculations follow SR3e creation rules
- Shopping mode components follow presentational-only pattern
- TypeScript strict mode maintained throughout

---

### Phase 2.1: Clean Up Functional Bugs from 02-03 Shopping Mode Integration (INSERTED)

**Goal:** Fix functional bugs discovered after executing the shopping mode integration plan (02-03).

**Depends on:** Phase 2

**Plans:** 0 plans (run `/gsd:plan-phase 2.1` to break down)

Plans:
- [ ] TBD

**Details:**
[To be added during planning]

---

### Phase 2.2: Health Component Visual Polish (INSERTED)

**Goal:** Visual adjustments and polish for the Health component — layout, spacing, ECG presentation, and condition monitor appearance.

**Depends on:** Phase 2.1
**Plans:** 0 plans

Plans:
- [ ] TBD (run `/gsd:plan-phase 2.2` to break down)

**Details:**
[To be added during planning]

---

### Phase 2.3: Skills Component (INSERTED)

**Goal:** Build the Skills component for the character sheet — the UI and service layer for displaying, buying, and managing active, knowledge, and language skills outside of character creation mode.

**Depends on:** Phase 2.2
**Plans:** 1 plan

Plans:
- [ ] 2.3-01: Skills UI — tab container, skill cards, category grouping, shopping mode integration, styles

**Details:**
- Tab structure: Active / Knowledge / Language
- Active tab groups by linkedAttribute (attribute headers, flex-wrap cards)
- Knowledge and Language are flat lists
- SkillCard shows name, rating, specializations (read-only), R/W for language
- Shopping buttons (+ / −) wired to existing SkillSpendingService — only shown in creation mode
- Phase 3 adds karma-based buying; this phase is display + creation-mode spending only

---

### Phase 2.4: Buying Mechanics Overhaul (INSERTED)

**Goal:** Overhaul skill buying mechanics to comply with SR3e game rules, clarify the relationship between creation points and buying, and enforce unified IStoreManager usage across all buying flows.

**Depends on:** Phase 2.3
**Plans:** 0 plans

Plans:
- [ ] 2.4-01: Fix routing (category param) + rules-compliant pools (Int-derived) + flat knowledge/language cost
- [ ] 2.4-02: Extract buying logic to SkillSpendingService — editors become presentational only

**Details:**
- **Routing fix**: `SkillEditorApp` opens wrong editor for knowledge/language when `skillType` not set — fix by passing `category` from `SkillCard` explicitly
- **Rules compliance**: knowledge pool = `Int × 5`, language pool = `floor(Int × 1.5)`, both calculated at attribute-lock time. Knowledge/language cost is flat 1 CP (not the 1/2 linked-attr formula)
- **Architecture**: All buy/sell/delete logic moves to `SkillSpendingService` — Svelte editors are display-only

---

### Phase 3: Karma & Experience Core

**Goal**: Implement karma management and character advancement system, including storytellerscreen actor for karma distribution.

**Scope**:
- Karma pool tracking and management
- storytellerscreen actor type implementation
- GM distributes karma rewards to characters
- Players spend karma on improvements
- Character advancement rules (SR3e karma costs)
- Experience point tracking
- Karma spending validation

**Depends on**: Phase 2 (need character sheet and permissions)

**Research**: Unlikely (have karma mechanics in reference code, SR3e rules are established)

**Plans**: TBD

**Actor types involved**: character (karma tracking), storytellerscreen

**Success criteria**:
- GM can distribute karma via storytellerscreen
- Players can spend karma on improvements
- Karma costs follow SR3e rules
- Validation prevents invalid purchases
- Karma pool updates correctly

---

### Phase 4+: Skills System (Tentative)

**Goal**: Complete skills implementation - buying, progression, testing, specializations.

**Note**: Details TBD after Phase 3 complete. Will need to consider:
- Skill item type implementation
- Active, knowledge, language skills
- Skill tests and target numbers
- Defaulting rules
- Specializations
- Integration with karma spending

**Depends on**: Phase 3 (karma system for buying skills)

**Research**: TBD

---

### Phase 5+: Active Effects & Gadgets (Tentative)

**Goal**: Active effects architecture and gadget system for item extensions.

**Note**: Details TBD. The gadget system (inverted class concept) needs architectural design:
- How do gadgets extend items (weapon scopes, car mods)?
- Active effects for perks and bonuses
- Integration with character stats
- UI for managing effects and gadgets

**Depends on**: TBD (possibly Phase 4)

**Research**: TBD

---

### Phase 6+: Chat & Socket Communication (Tentative)

**Goal**: Implement chat-based challenge/response system for opposed tests.

**Note**: This is a multi-phase effort. The old JS implementation has intricate flows:
- Challenge initiated → opponent responds → resolution
- Client-to-client socket communication
- State management across challenge lifecycle
- Integration with combat and skill tests

Will need to break this down into sub-phases after understanding scope better.

**Depends on**: TBD (likely Phase 4+ for skill tests, Phase 7 for combat)

**Research**: Likely (socket patterns, state synchronization across clients)

---

### Phase 7+: Combat Resolution (Tentative)

**Goal**: Combat mechanics - initiative, damage, condition monitors.

**Note**: Details TBD. Depends on chat/socket system for opposed tests.

**Research**: TBD

---

### Phase 8+: Magic System (Tentative)

**Goal**: Spell management, casting, drain, astral projection.

**Item types**: spell, focus

**Research**: TBD

---

### Phase 9+: Equipment & Inventory (Tentative)

**Goal**: Equipment management - weapons, gear, cyberware.

**Item types**: weapon, ammunition, wearable, techinterface

**Note**: Comes later because it depends on many other item types being implemented first.

**Research**: TBD

---

### Phase 10+: Vehicles & Economy (Tentative)

**Goal**: Vehicles, drones, transactions, economy.

**Actor types**: mechanical

**Item types**: transaction

**Research**: TBD

---

## Progress

**Execution Strategy**: Adaptive roadmap with review gates after Phases 1 and 3.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Character Creation Foundation | 3/3 | Complete | 2025-12-18 |
| 2. Character Creation Shopping Mode | 4/4 | Complete | 2026-03-03 |
| 2.1. Shopping Mode Bug Fixes (INSERTED) | 0/? | Not started | - |
| 2.2. Health Component Visual Polish (INSERTED) | 0/? | Not started | - |
| 2.3. Skills Component (INSERTED) | 1/1 | Complete | 2026-03-08 |
| 2.4. Buying Mechanics Overhaul (INSERTED) | 1/2 | In progress | - |
| 3. Karma & Experience Core | 0/? | Not started | - |
| 4+. Skills System | TBD | Planning deferred | - |
| 5+. Active Effects & Gadgets | TBD | Planning deferred | - |
| 6+. Chat & Socket Communication | TBD | Planning deferred | - |
| 7+. Combat Resolution | TBD | Planning deferred | - |
| 8+. Magic System | TBD | Planning deferred | - |
| 9+. Equipment & Inventory | TBD | Planning deferred | - |
| 10+. Vehicles & Economy | TBD | Planning deferred | - |

---

## Review Gates

### After Phase 1
- Review character creation architecture
- Detail plans for Phases 2-3 based on patterns established
- Assess service architecture effectiveness
- Identify any architectural adjustments needed

### After Phase 3
- Comprehensive review of character foundation (creation + sheet + advancement)
- Break down Phases 4-10 into concrete phases with detailed goals
- Prioritize remaining work based on dependencies and complexity
- Re-evaluate chat/socket system scope
- Update roadmap with refined phase structure

### Ongoing
- After each phase completion, assess if roadmap adjustments needed
- Document architectural decisions and patterns
- Track deferred issues and technical debt
