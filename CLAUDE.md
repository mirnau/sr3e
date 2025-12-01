# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SR3E is an unofficial Shadowrun 3rd Edition homebrew system for Foundry VTT v13. It uses Svelte 5 (with runes), Vite bundler, LESS for styling, and Gulp for automated build/watch.

## Project Locations

- **sr3e2** (`C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\sr3e2`) - Legacy JavaScript version (this folder)
- **sr3e** (`C:\Users\mikae\AppData\Local\FoundryVTT\Data\systems\sr3e`) - New TypeScript iteration (empty, ready for setup)

## Resources

### Foundry VTT API Documentation
When in doubt about Foundry VTT API types, methods, or patterns, consult the official API documentation:
- **v13 API Docs**: https://foundryvtt.com/api/
- Use this as the authoritative source for method signatures, class structures, and API behavior
- The community types package (`@league-of-foundry-developers/foundry-vtt-types`) may be incomplete for v13

## Development Commands

```bash
npm ci                    # Install dependencies (Node 22.x required)
gulp                      # Start development - auto-builds on save (LESS + Svelte)
npm run build             # Manual build (rarely needed - gulp handles this)
npx vitest                # Run tests
npx vitest --coverage     # Run tests with coverage
```

## Architecture

### Entry Point & Build
- `sr3e.js` - Main entry point, registers all documents, sheets, and procedures
- `vite.config.js` - Build config with path aliases and custom `__FILE__`/`__LINE__`/`__DIR__` injection
- Output: `build/bundle.js`

### Core Structure

**Documents** (`module/foundry/documents/`)
- `SR3EActor.js`, `SR3EItem.js` - Extended Foundry document classes
- `SR3ERoll.js`, `SR3ECombat.js` - Custom roll and combat handling

**Data Models** (`module/models/`)
- Actor models: `CharacterModel`, `BroadcasterModel`, `MechanicalModel`, `StorytellerScreenModel`
- Item models: `WeaponModel`, `SkillModel`, `MagicModel`, `SpellModel`, etc.
- Models are **registration only** - define schema, defaults, constraints. Keep behavior in services.

**Sheets** (`module/foundry/sheets/`)
- Extend `DocumentSheetV2`/`ApplicationV2` (Foundry V2 patterns)
- Each sheet loads a Svelte component from `module/svelte/apps/`

**Services** (`module/services/`)
- `Log.js` - Gated logging system
- `OpposeRollService.js`, `RollService.svelte.js` - Roll handling
- `ActorDataService.js`, `ItemDataService.js` - Data manipulation

**Procedures** (`module/services/procedure/FSM/`)
- State-machine-like roll procedures (attack, defense, skill checks)
- Subclass `AbstractProcedure` and register in `sr3e.js`
- Respect `ProcedureLock` for concurrency control

### Vite Path Aliases
```javascript
@services     → module/services
@sheets       → module/foundry/sheets
@models       → module/models
@documents    → module/foundry/documents
@apps         → module/svelte/apps
@hooks        → module/foundry/hooks
@config       → module/foundry
// ... see vite.config.js for full list
```

## Key Patterns

### Config System
`sr3e.*` config keys are the baseline reference. Add new options in config first, then add matching i18n keys in `lang/en.json`. Use keys directly - changing them without updating all call sites breaks UI.

### Logging
Use DEBUG-gated logging:
```javascript
DEBUG && LOG.info("Message", [__FILE__, __LINE__], { data });
```

### i18n
All UI strings through `localize(config.sr3e.*)`. Define keys in `lang/en.json`.

### Gadgets & Active Effects
- Active Effects for temporary/toggleable gameplay state
- Gadgets are specialized Active Effects for attachments/modifications
- Canonical flags: `flags.sr3e.gadget.{origin,gadgetType,commodity,isEnabled}`

## Testing

Tests use Vitest with jsdom environment:
```bash
npx vitest                           # Run all tests
npx vitest tests/mytest.test.js      # Run single test file
```
Tests in `tests/**/*.{test,spec}.js` and `module/**/*.{test,spec}.js`

## Git Conventions

- Branch naming: `feature/short-name` or `fix/short-name`
- Conventional Commits: `feat(scope):`, `fix(scope):`, `docs(scope):`, etc.
- Include SR3 page references in commits (e.g., "SR3 p. 115")
- Releases via `npm run release:alpha|beta|release`

## Legal

Contributors must own SR3E materials. Reference page numbers only - no reproduction of rules text or tables.
