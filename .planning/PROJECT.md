# Shadowrun 3e TypeScript Migration

## Vision

This project is the complete architectural migration of a 20,000-line Foundry VTT system for Shadowrun 3rd Edition from JavaScript to TypeScript. This is not simply a language port - it's a fundamental transformation from ad-hoc, loosely-structured code into a clean, layered, maintainable architecture that properly leverages TypeScript's type system and SOLID principles.

The existing JavaScript codebase has served its purpose but has become brittle and difficult to maintain. Business logic is scattered throughout Svelte components (200+ lines per component), static service classes directly access Foundry globals without abstraction, and there's no clear separation of concerns. The code works, but every change risks breaking something else.

The TypeScript version establishes a proper layered architecture: Foundry layer handles framework integration, Rules layer contains game logic strictly adhering to SR3e mechanics, and UI layer (Svelte) is purely presentational. Services are properly scoped with clear responsibilities, data access is centralized through a repository pattern (IStoreManager), and components focus solely on user interaction and display.

This migration is being done piece-by-piece, one major system at a time, allowing the old JavaScript version to serve as a reference while the new TypeScript architecture emerges. Each migration phase not only ports functionality but improves it - extracting business logic from components into services, establishing proper type safety, and creating patterns that future features can follow.

## Problem

The current JavaScript implementation has accumulated technical debt that makes it increasingly difficult to maintain and extend:

**Architectural Issues:**
- No separation of concerns - business logic mixed with presentation in Svelte components
- Static service classes act as function namespaces rather than proper OO design
- Direct coupling to Foundry VTT globals (`game.items`, `CONFIG.sr3e`) throughout the codebase
- Type safety is non-existent, leading to runtime errors that could be caught at compile time
- No dependency injection or inversion of control - everything is tightly coupled

**Specific Pain Points:**
- Components like `DicePools.svelte` contain 200+ lines of complex calculations and business logic
- Changing one piece of logic requires understanding scattered code across multiple files
- No clear pattern for how services should be structured or how they should interact
- Foundry API calls are scattered throughout with no abstraction layer
- Testing is nearly impossible due to tight coupling
- Adding new features requires navigating fragile, interconnected code

**Impact:**
- Development velocity has slowed as codebase complexity increased
- Bug fixes in one area often break functionality in another
- New features take longer to implement than they should
- Code reviews are difficult because there's no consistent pattern to follow
- Onboarding contributors would be extremely challenging

**Who This Affects:**
Primarily the solo developer (user) maintaining this system, but also the players using it who experience bugs and lack of new features. The Shadowrun 3e community on Foundry VTT deserves a robust, well-maintained system.

## Success Criteria

How we know this migration succeeded:

- [ ] All features from JavaScript version work in TypeScript version with equal or better performance
- [ ] Clean layered architecture: UI (Svelte) → Service Layer → IStoreManager → Foundry VTT
- [ ] Svelte components are presentational only (~80-100 lines), no business logic
- [ ] All business logic lives in properly scoped services
- [ ] TypeScript strict mode enabled with no `any` or `object` escape hatches
- [ ] Code follows SOLID principles throughout
- [ ] Data models strictly adhere to Shadowrun 3e core rulebook rules
- [ ] No direct Foundry API calls in Svelte components (only in services/repositories)
- [ ] Store-first reactive model with proper lifecycle management via IStoreManager
- [ ] Errors fail visibly and traceably (no convoluted error handling)
- [ ] Can confidently delete the old JavaScript codebase

## Scope

### Building

**Phase 1: Character Creation Migration**
- Priority-based character creation system (A-E priorities for metatype, magic, attributes, skills, resources)
- Metatype selection with age/height/weight ranges
- Magic/Awakened character support
- Weighted randomization algorithm
- Character initialization with proper attribute and item setup
- Service architecture: CharacterCreationService singleton with composed repositories and validators

**Phase 2: Combat System Migration**
- Initiative tracking and rolling
- Damage application and healing
- Condition monitors (stun/physical)
- Combat pools and modifiers
- Combat tracker integration

**Phase 3: Skills System Migration**
- Active skills, knowledge skills, language skills
- Skill tests with target numbers
- Defaulting rules for untrained skills
- Specializations
- Skill improvement during character advancement

**Phase 4: Magic System Migration**
- Spell management and spell inventory
- Spell casting mechanics
- Drain resistance calculations
- Astral projection and astral combat
- Spirit summoning and binding

**Phase 5: Equipment & Resources Migration**
- Equipment inventory and management
- Weapon statistics and modifications
- Cyberware with essence tracking
- Lifestyle and resource tracking
- Nuyen management

**Phase 6: Advanced Features Migration**
- Contact system
- Karma-based advancement
- Edge and special abilities
- Journal integration
- Any remaining features and polish

### Not Building

- New features not in the JavaScript version (this is migration, not expansion)
- Compatibility layer for old character data (fresh start in TypeScript version)
- Automated migration scripts (manual recreation of characters acceptable)
- Support for other Shadowrun editions (SR3e only)
- Multiplayer-specific features beyond what Foundry provides
- Mobile/touch optimization (Foundry VTT standard only)

## Context

**Current State:**
- JavaScript version is complete and functional with ~20,000 lines of code
- TypeScript version has basic foundation established
- First character sheet is partially migrated
- Old JS project serves as reference: `C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\old_project\sr3e\`
- New TS project in active development: `C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\sr3e\`

**Architectural Patterns Established:**
- **Services:** Singleton pattern with static `Instance` getters (e.g., StoreManager, NewsService)
- **Composition:** Services compose collaborators via constructor injection
- **Data Access:** IStoreManager interface provides store-based reactive data synchronization
- **Components:** Props-based Svelte components using $effect for lifecycle, $derived for reactivity
- **Store Types:** RW stores (bidirectional sync), RO stores (read-only), Flag stores (persistent), Shallow stores (transient UI state)

**Technology Stack:**
- TypeScript with strict mode
- Svelte 5 for UI components
- Foundry VTT v13 framework
- No external dependencies beyond Foundry and Svelte

**Development Environment:**
- Foundry VTT local installation for testing
- Git for version control (branch: TO-TS-Migration)
- Reference implementation available in parallel directory structure

## Constraints

- **Platform**: Must work within Foundry VTT framework constraints and APIs
- **TypeScript Strict**: No `any` or `object` types as escape hatches - proper typing required
- **SR3e Rules Compliance**: All game mechanics must accurately implement Shadowrun 3rd Edition core rulebook rules
- **Error Philosophy**: Let it fail - no try/catch wrapping, no Result types, no exceptions, errors must be visible and traceable
- **No Convoluted Code**: Pragmatic over academic, KISS principle applies
- **Migration Strategy**: Parallel development - old JS remains as reference while new TS evolves feature by feature
- **Performance**: Equal or better performance than JavaScript version
- **Foundry Compatibility**: Must remain compatible with Foundry VTT v13 APIs and update patterns
- **Git Workflow**: Never commit independently - only commit when part of plan execution with SUMMARY.md, user controls all git operations outside of plan execution flow

## Decisions Made

Key decisions from architectural exploration:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Service Pattern | Singleton with static Instance getters | Matches established pattern (StoreManager, NewsService), easy global access, single instance manages state |
| Data Access for Sheets | All through IStoreManager with stores | Sheets need continuous reactive sync, StoreManager provides lifecycle management and prevents circular updates |
| Data Access for Dialogs | Direct Foundry API for one-time operations | Character creation is initialization, not continuous editing - StoreManager would be over-engineering |
| Form State Management | Plain Svelte $state for transient forms | Dialog state is temporary, no need to persist or sync with documents |
| Service Composition | Coordinator pattern with composed collaborators | CharacterCreationService composes repositories/validators, follows NewsService pattern |
| Migration Order | Services first, then Foundry wrapper, then Svelte refactor | Bottom-up ensures business logic is solid before UI depends on it |
| Error Handling | Let it fail, no wrapping | Simple, visible errors in console, no obfuscation |
| Type Safety | Strict TypeScript, no escape hatches | Full leverage of type system prevents runtime errors |
| Styling Architecture | Skinning vs. Domain split — strictly DRY | See below |

### Styling Architecture: Skinning vs. Domain

Two distinct purposes, two distinct locations. Never mix them.

**Skinning** (`styles/skinning/`, `styles/sheetcard.scss`, `styles/statcard.scss`):
- Global reskin of Foundry's own elements: buttons, inputs, headings (h1–h6), dialogs, tooltips
- Design tokens: CSS variables (`--highlight-color-primary`, `--background-color`, `--component-width`, etc.)
- Base typographic scale — font sizes and weights for all heading levels defined once here
- The neon-border technique, card shadow animations, `clipped-corners` mixin
- **Rule**: if a style applies to an element type in all contexts, it lives here

**Domain** (`styles/actor/`, `styles/items/`, `styles/injections/`, etc.):
- Context-specific overrides only — delta on top of skinning
- Layout and positioning unique to a specific component or sheet
- **Rule**: never re-declare what skinning already defines (no `font-size` on headings, no `color` on generic buttons unless overriding for a specific reason)

**Enforcement:**
- Before adding a style to a domain file, ask: "does this apply only in this context?" If no → it belongs in skinning
- Never set `font-size` or `font-weight` on heading elements in domain files — let `skinning/fonts.scss` own that
- No duplicate declarations: if a rule already exists in skinning, domain files must not repeat it

## Open Questions

Things to figure out during execution:

- [ ] Testing strategy - start with manual testing, add unit tests if valuable patterns emerge
- [ ] Localization approach - continue with `CONFIG.sr3e` global or refactor to service?
- [ ] Data model definitions - create shared TypeScript interfaces for SR3e data structures?
- [ ] Performance profiling - when to measure and optimize reactive store updates?
- [ ] Component pattern library - establish reusable UI components as patterns emerge?

---
*Initialized: 2025-12-16*
