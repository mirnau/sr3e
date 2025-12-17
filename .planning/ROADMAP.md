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

### Phase 2: Character Sheet & Permissions

**Goal**: Migrate character sheet UI with proper permission enforcement - players can only buy with points, GMs can manually edit any stat.

**Scope**:
- Character sheet layout and component structure
- Permission system: player vs GM capabilities
- Player mode: buying improvements with karma/points only
- GM mode: manual editing of any character stat
- Sheet reactivity through StoreManager
- Proper separation: presentation in Svelte, logic in services

**Depends on**: Phase 1 (need character creation to have characters to edit)

**Research**: Unlikely (Foundry permission API is established, have UI patterns from partial migration)

**Plans**: TBD

**Success criteria**:
- Players see sheet with purchase-only controls
- GMs see sheet with full edit capabilities
- Permission enforcement works correctly
- Sheet updates reactively when data changes
- Component architecture follows established patterns

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
| 1. Character Creation Foundation | 2/3 | In progress | - |
| 2. Character Sheet & Permissions | 0/? | Not started | - |
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
