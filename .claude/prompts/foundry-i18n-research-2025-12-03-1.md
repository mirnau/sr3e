<objective>
Research and document the optimal approach for implementing a type-safe localization (i18n) system in a Foundry VTT system using TypeScript.

This research will inform the implementation of a robust, maintainable localization architecture for the sr3e system that follows Foundry VTT best practices while leveraging TypeScript's type system for compile-time safety and improved developer experience.

The system currently has a basic language file at @lang/en.json (currently empty) and is configured in @system.json with English as the only language. The goal is to establish patterns and practices before scaling to full localization.
</objective>

<data_sources>
@system.json
@tsconfig.json
@lang/en.json

!Web search for Foundry VTT v13 localization documentation
!Web search for TypeScript i18n best practices 2025
!Web search for Foundry VTT system localization patterns
!Research existing popular Foundry VTT systems (dnd5e, pf2e) for localization patterns
</data_sources>

<research_objectives>
The research should answer these specific questions:

1. **Foundry VTT Localization Architecture**
   - How does Foundry VTT's `game.i18n` API work in v13?
   - What is the expected structure and format for language JSON files?
   - How should localization keys be namespaced for a system?
   - What are the conventions for organizing translation keys (flat vs nested)?
   - How does Foundry handle language fallback and missing translations?

2. **TypeScript Type Safety**
   - How can we generate TypeScript types from JSON language files?
   - What patterns exist for type-safe i18n key access (autocomplete + compile-time checking)?
   - Should we use template literal types for nested key paths?
   - How to handle parameterized strings with type-safe variable substitution?
   - What build-time tooling can validate translation completeness?

3. **File Organization & Structure**
   - Should we use a single monolithic JSON file or split by domain (actors, items, ui, etc.)?
   - What is the optimal nesting depth for translation keys?
   - How to organize keys for different document types (character, weapon, spell, etc.)?
   - Best practices for organizing UI labels, descriptions, error messages, etc.
   - How to handle pluralization and context-specific translations?

4. **Dynamic Content & Parameterization**
   - How does Foundry handle string interpolation in translations?
   - What is the syntax for variable substitution (Handlebars-style, named params)?
   - How to handle complex formatting (numbers, dates, currency)?
   - Patterns for gender/plural agreement in translations
   - How to localize content that comes from data models vs templates?

5. **Compile-Time vs Runtime Patterns**
   - When should translations be resolved at compile time vs runtime?
   - How to handle localization in Handlebars templates (.hbs files)?
   - Patterns for localizing DataModel field labels and hints
   - How to localize config objects and dropdown options
   - Best practices for localizing programmatically generated content

6. **Integration Points**
   - How to localize Application/FormApplication titles and labels?
   - Patterns for localizing DataModel schema fields
   - How to localize ActiveEffect labels and descriptions?
   - Best practices for localizing compendium content
   - How to handle localization in Svelte components (given this system uses Svelte)?

7. **Performance & Optimization**
   - Are there performance implications of deeply nested translation objects?
   - Should frequently accessed translations be cached?
   - How to lazy-load translations for large systems?
   - What is the memory footprint of translation data?
   - Best practices for avoiding redundant lookups?

8. **Common Pitfalls & Anti-Patterns**
   - What are common mistakes in Foundry VTT localization?
   - How to avoid hardcoded strings in code?
   - Patterns for detecting missing translations during development
   - How to maintain translation key consistency across updates?
   - What breaks when refactoring translation keys?
</research_objectives>

<scope>
**In Scope:**
- Foundry VTT v13+ localization APIs and patterns (minimum compatibility: 13.340)
- TypeScript-specific type safety approaches for i18n
- Integration with ES2022 modules and ESNext module resolution
- Svelte component localization patterns (system uses Svelte)
- Patterns from established Foundry systems that have proven scalable
- Build-time validation and tooling options
- Both JSON language file approaches and programmatic localization

**Out of Scope:**
- Translation management services/platforms (Crowdin, Lokalise, etc.)
- Automatic translation or AI translation services
- Runtime language switching UI implementation details
- Module-specific localization (focus on system localization)
- Community translation workflow/contribution processes
- Localization for Foundry core (focus on system-level)
</scope>

<deliverables>
Provide a comprehensive research report with the following sections:

1. **Foundry VTT Localization Overview**
   - Architecture diagram showing how game.i18n works
   - Code examples of basic usage patterns
   - Official API reference summary for key methods

2. **Recommended Architecture**
   - Proposed file structure for language files
   - Naming conventions for translation keys
   - Example of properly organized translation hierarchy
   - Rationale for single vs multiple file approach

3. **TypeScript Integration Strategy**
   - Concrete approach for type-safe translation keys
   - Code examples showing typed i18n helper functions
   - Build script or tooling recommendations for type generation
   - Example of autocomplete and type checking in action

4. **Implementation Patterns**
   - Code examples for each integration point (templates, data models, applications)
   - Patterns for parameterized strings with examples
   - Handlebars helper usage examples
   - Svelte component localization patterns

5. **Best Practices Guide**
   - Do's and don'ts for key naming
   - Recommended nesting depth with examples
   - Patterns for avoiding common pitfalls
   - Guidelines for when to localize vs when to hardcode

6. **Comparison Table**
   - Analysis of 2-3 established Foundry systems' localization approaches
   - Pros/cons of different organizational patterns
   - Performance characteristics of different approaches

7. **Recommended Implementation Roadmap**
   - Phase 1: Basic infrastructure setup
   - Phase 2: Type safety layer
   - Phase 3: Integration patterns
   - Phase 4: Validation and tooling
   - Specific tasks for each phase with code examples
</deliverables>

<evaluation_criteria>
Prioritize solutions based on:

1. **Type Safety** (Highest Priority)
   - Compile-time detection of invalid translation keys
   - Autocomplete support in IDE
   - Type-safe variable substitution

2. **Developer Experience**
   - Ease of adding new translations
   - Clear patterns that are easy to follow
   - Good error messages when translations are missing
   - Minimal boilerplate required

3. **Maintainability**
   - Clear organization that scales to hundreds of keys
   - Easy refactoring of translation keys
   - Self-documenting structure
   - Minimal risk of key collisions

4. **Performance**
   - Minimal runtime overhead
   - Efficient lookup patterns
   - No unnecessary rebuilding of translation objects

5. **Foundry VTT Alignment**
   - Follows official Foundry conventions
   - Compatible with Foundry's tooling and workflows
   - Works well with Foundry's template system
   - Compatible with existing modules and community expectations

**Must Have:**
- Works with TypeScript strict mode enabled
- Supports Foundry VTT v13.340+
- Handles parameterized strings
- Works in both .ts files and .hbs templates
- Provides clear error messages for missing keys

**Nice to Have:**
- Build-time validation of translation completeness
- Automated detection of unused translations
- Support for pluralization rules
- Hot-reload of translations during development
</evaluation_criteria>

<verification>
Validate research findings by:

1. **Cross-Reference Official Docs**
   - Verify all Foundry API methods against official v13 documentation
   - Confirm compatibility ranges and version-specific behavior
   - Check Foundry VTT Knowledge Base articles on localization

2. **Examine Real-World Implementations**
   - Review source code of dnd5e system on GitHub
   - Review source code of pf2e system on GitHub
   - Identify patterns used by 2-3 other popular systems
   - Note any patterns that appear consistently across multiple systems

3. **Test Key Assumptions**
   - If possible, create a minimal proof-of-concept to verify:
     - Type generation from JSON actually works with this tsconfig
     - Template literal types work for nested key paths
     - Handlebars integration works as expected
   - Document any assumptions that couldn't be directly tested

4. **Validate TypeScript Patterns**
   - Ensure suggested type patterns work with strict mode
   - Verify autocomplete works in VS Code
   - Test that type errors surface correctly for invalid keys

5. **Check Community Resources**
   - Review League of Foundry Developers resources
   - Check Foundry VTT Discord/Reddit for common localization questions
   - Identify frequently asked questions or common stumbling blocks
</verification>
