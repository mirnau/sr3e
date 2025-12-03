# Localization Refactor - Implementation Plan

## Context

**Scope:** Proof of concept with Attributes only
**Goal:** Improve developer experience through DRY principles and automatic scaffolding
**Consumers:** Future Svelte components
**Approach:** Array-based config + build-time JSON generation

## Current State

- **Attributes defined in:** `module/models/actors/actor-components/Attributes.ts`
  - 10 attributes: body, quickness, strength, charisma, intelligence, willpower, reaction, magic, essence, initiative
- **Localization files:**
  - `lang/en.json` - empty
  - `lang/config.ts` - has timing issue (calls `localize` at module load)
  - `lang/config/AttributeConfig.ts` - defines attributes with redundancy
- **Global helper:** `globalThis.localize()` defined in `sr3e.ts` on 'init' hook
- **Build system:** Vite with Svelte plugin, no custom plugins yet

## Problems with Current Approach

1. ❌ **Timing issue:** `lang/config.ts` calls `localize()` before it's defined
2. ❌ **Redundancy:** i18n keys repeat information already in the code
3. ❌ **Manual sync:** JSON files must be manually kept in sync with config
4. ❌ **Type safety lost:** Transformation loses TypeScript types
5. ❌ **Dead code:** `abbr` field defined but never used

## Proposed Architecture

### 1. Config Structure (Single Source of Truth)

**File:** `lang/config/AttributeConfig.ts`

```typescript
/**
 * Canonical list of all attributes in SR3E.
 * This is the single source of truth for attribute definitions.
 */
export const ATTRIBUTES = [
  'body',
  'quickness',
  'strength',
  'charisma',
  'intelligence',
  'willpower',
  'reaction',
  'magic',
  'essence',
  'initiative'
] as const;

export type AttributeKey = typeof ATTRIBUTES[number];

/**
 * Generates i18n key for an attribute.
 * Format: SR3E.ATTRIBUTE.{Capitalized}
 */
export const attrKey = (attr: AttributeKey): string =>
  `SR3E.ATTRIBUTE.${attr.charAt(0).toUpperCase() + attr.slice(1)}`;
```

**Benefits:**
- ✅ Zero redundancy - attribute name appears once
- ✅ Type-safe iteration via `ATTRIBUTES` array
- ✅ Type-safe access via `AttributeKey` union type
- ✅ Clear helper function for i18n key generation
- ✅ Self-documenting with JSDoc

### 2. Re-export Layer

**File:** `lang/config.ts`

```typescript
/**
 * Main export point for localization configuration.
 * Provides unified namespace for all localized game data.
 */
export { ATTRIBUTES, attrKey, type AttributeKey } from './config/AttributeConfig';

// Future expansions:
// export { SKILLS, skillKey, type SkillKey } from './config/SkillConfig';
// export { ITEMS, itemKey, type ItemKey } from './config/ItemConfig';
```

**Benefits:**
- ✅ Clean import path: `import { ATTRIBUTES, attrKey } from '@root/lang/config'`
- ✅ Prepared for expansion beyond attributes
- ✅ Single import point for consumers

### 3. JSON Structure

**File:** `lang/en.json`

```json
{
  "SR3E": {
    "ATTRIBUTE": {
      "Body": "Body",
      "Quickness": "Quickness",
      "Strength": "Strength",
      "Charisma": "Charisma",
      "Intelligence": "Intelligence",
      "Willpower": "Willpower",
      "Reaction": "Reaction",
      "Magic": "Magic",
      "Essence": "Essence",
      "Initiative": "Initiative"
    }
  }
}
```

**Benefits:**
- ✅ Nested structure mirrors key paths
- ✅ Follows Foundry VTT conventions
- ✅ Easy for translators to understand
- ✅ Namespace isolation (SR3E)

### 4. Vite Plugin Architecture

**File:** `vite-plugins/i18n-scaffold.ts`

- Uses Vite's built-in watcher (`server.watcher`) to monitor `lang/config/**/*.ts` in dev; no extra chokidar/gulp process.
- Debounce + content-hash guard on change events to avoid write/rebuild loops.
- Dev-only: trigger when `lang/config/**/*.ts` changes (manual edits); no build-time auto-run.
- Discover locales by scanning `lang/*.json` (no explicit list).

**Plugin Behavior:**
1. **Dev mode:** Watch `lang/config/**/*.ts` via Vite server watcher (debounced + hashed); scaffold only on detected changes.
2. **On change:** Parse config exports to extract keys (ts-morph/TS compiler API).
3. **Merge strategy:**
   - Read existing JSON per discovered locale
   - Add missing keys with default English value (capitalized name)
   - Preserve existing translations
   - Prune orphaned keys silently
   - Sort keys alphabetically for consistency
4. **Validation:** Log parse/write errors; no warnings for pruned orphans

**File Structure:**
```
vite-plugins/
└── i18n-scaffold.ts         # Plugin implementation
    ├── parser.ts             # TypeScript AST parsing
    ├── merger.ts             # JSON merge logic
    └── types.ts              # Shared types
```

### 5. Consumption Pattern (Svelte Components)

```svelte
<script lang="ts">
  import { ATTRIBUTES, attrKey } from '@root/lang/config';

  // Get single attribute label
  const bodyLabel = localize(attrKey('body'));

  // Iterate all attributes
  ATTRIBUTES.forEach(attr => {
    const label = localize(attrKey(attr));
    console.log(attr, label);
  });
</script>

<div class="attributes">
  {#each ATTRIBUTES as attr}
    <div class="attribute">
      <label>{localize(attrKey(attr))}</label>
      <input type="number" value={character.attributes[attr].value} />
    </div>
  {/each}
</div>
```

**Benefits:**
- ✅ Type-safe attribute names (autocomplete works)
- ✅ Clear, readable code
- ✅ No runtime transformation overhead
- ✅ Localization happens at render time

## Implementation Steps

### Phase 1: Config Cleanup (Foundation)

1. **Update AttributeConfig.ts**
   - Remove `label` and `abbr` fields (dead code)
   - Convert to array-based structure
   - Add `attrKey()` helper function
   - Add TypeScript types (`AttributeKey`)
   - Add JSDoc comments

2. **Update config.ts**
   - Remove transformation logic (Object.fromEntries)
   - Change to simple re-exports
   - Remove `localize()` call (timing issue)
   - Add JSDoc comments

3. **Validate**
   - Run `npm run typecheck` to ensure no TypeScript errors
   - Verify no imports broken (grep for imports from lang/config)

### Phase 2: Vite Plugin Implementation

1. **Create plugin structure**
   - Create `vite-plugins/` directory
   - Create `i18n-scaffold.ts` with plugin skeleton
   - Create supporting files (parser, merger, types)

2. **Implement core functionality**
   - **Parser:** Extract array values from TypeScript AST (ts-morph or TS compiler API; no regex fallback)
   - **Merger:**
     - Read existing JSON
     - Compute diff (missing keys, orphaned keys)
     - Merge preserving existing values, pruning orphans
     - Sort keys alphabetically
     - Write back to file
   - **Watcher:** Use Vite server watcher with debounce + hash guard; no chokidar/gulp

3. **Integrate with Vite config**
   - Update `vite.config.ts` to use plugin
   - Configure paths and options
   - Test in dev mode

4. **Error handling**
   - Validate TypeScript parse success
   - Validate JSON parse/write success
   - Log clear error messages
   - Prune orphans silently

### Phase 3: JSON Scaffolding

1. **Generate initial en.json**
   - Run plugin to scaffold from current AttributeConfig
   - Verify nested structure is correct
   - Add English translations for all attributes

2. **Test merge behavior (manual sanity)**
   - Manually edit a translation in en.json
   - Add a new attribute to AttributeConfig
   - Verify existing translation preserved
   - Verify new key added with default value

3. **Validation**
   - Verify JSON is valid
   - Verify all keys present
   - Verify Foundry can load translations

### Phase 4: Documentation & Examples

1. **Developer documentation**
   - Update existing docs with new pattern
   - Add examples of consumption in Svelte
   - Document Vite plugin behavior
   - Document how to add new attributes

2. **Code comments**
   - Ensure all public APIs have JSDoc
   - Add inline comments for complex logic
   - Add usage examples in JSDoc

3. **Testing (optional)**
   - No automated tests planned now; rely on manual sanity checks while developing
   - If needed later, add lightweight Vitest coverage for parser and merge behavior

## Migration Path (Future Expansion)

When expanding beyond attributes:

1. **Create new config file** (e.g., `SkillConfig.ts`)
   - Follow same pattern: array + helper
2. **Re-export from `config.ts`**
   - Keep organized by domain
3. **Plugin auto-detects** new config
   - Scaffolds new keys in JSON
   - Uses file name for namespace

**Example:**
```typescript
// lang/config/SkillConfig.ts
export const SKILLS = ['firearms', 'unarmed', 'etiquette'] as const;
export const skillKey = (skill: SkillKey) =>
  `SR3E.SKILL.${skill.charAt(0).toUpperCase() + skill.slice(1)}`;

// Generates in JSON:
// SR3E.SKILL.Firearms
// SR3E.SKILL.Unarmed
// SR3E.SKILL.Etiquette
```

## Technical Considerations

### TypeScript AST Parsing

**Challenge:** Parse TypeScript to extract array values
**Solution:** Use a robust parser (ts-morph or TS compiler API) to read exported const arrays
**Tradeoff:** Adds dependency/startup cost but resilient to formatting/comments/refactors

**Recommendation:** Implement with ts-morph or TS compiler API from the start; no regex fallback

### JSON Merge Algorithm

- Discover locales by reading `lang/*.json` and scaffold each.
- Add missing keys with default English value (capitalized name).
- Preserve existing translations.
- Prune orphaned keys silently.
- Keep keys sorted for stable diffs.

### Watch Performance

**Challenge:** Avoid unnecessary rebuilds
**Solution:**
- Use Vite server watcher (already available) for dev
- Debounce file changes (~300ms) and hash file content before writing
- Skip writes if merge output is unchanged to prevent rebuild loops

## Success Criteria

- All 10 attributes defined in single array
- Zero redundancy in config code
- en.json auto-scaffolds with all attribute keys; additional locales discovered via lang/*.json
- Existing translations preserved on config changes
- New attributes automatically added to JSON; orphaned keys pruned
- TypeScript types work with autocomplete
- No timing issues with localize()
- Clear developer documentation
- Pattern ready to expand to skills, items, etc.

## Questions to Resolve

- None currently; scaffold runs in dev on config changes only

## Next Steps After Approval

1. Create todo list with granular tasks
2. Implement Phase 1 (config cleanup)
3. Test and validate Phase 1
4. Implement Phase 2 (plugin)
5. Test and validate Phase 2
6. Generate en.json and validate
7. Document and create examples



