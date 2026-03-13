# Phase 3: Karma & Experience Core - Context

**Gathered:** 2026-03-13
**Status:** For planning

<phase_objectives>
## What This Phase Accomplishes

Implement Good Karma tracking and advancement spending on the character sheet using the established shopping mode toggle pattern.

**Primary goal:**
Characters track Good Karma (total earned + unspent balance). Players spend Good Karma to advance Attributes, Skills, and Specializations per SR3e rules, triggered via the existing shopping cart toggle.

**Clarifications:**
- Shopping mode toggle (`isShoppingState`) is reused: outside creation mode, toggling it enters karma spending mode
- Good Karma tracked as two fields: total earned (informational) and unspent (spendable pool)
- Karma spending covers Attributes, Active/Knowledge/Language Skills, and Specializations
- Fractional costs (×1.5, ×0.5 multipliers) round up (ceiling) per SR3e convention

**Out of scope:**
- storytellerscreen actor and GM karma distribution UI — deferred to later phase
- Karma Pool (session dice pool) — not implemented in this phase
- Combat Pool, Hacking Pool, or other derived pool advancement
- Essence, Magic, Reaction improvement (SR3e rules prohibit or auto-derive these)
</phase_objectives>

<constraints>
## Constraints

**Technical:**
- Must follow established service architecture: Svelte components are presentational-only, all logic in services
- SkillSpendingService already handles creation point spending — must be extended or adapted for karma mode without breaking creation mode
- Shopping cart toggle (`isShoppingState`) already exists with its Svelte injection; karma mode must differentiate itself from creation mode (`isCharacterCreation` flag indicates which mode is active)
- Attributes display already exists in Attributes.svelte — karma buy buttons must integrate without restructuring the component
- TypeScript strict mode: no `any` or `object` escape hatches (except `@ts-expect-error` with comment for Foundry API conflicts)
- Let-it-fail error philosophy: no convoluted error handling, use non-null assertions (!)

**Timeline:**
- Blocks Phase 4+ (skills system) and Phase 3's karma spending is the foundation for all future advancement

**Resources:**
- None

**Dependencies:**
- Phase 2.4 complete: SkillSpendingService exists and handles creation point buy/sell/delete
- Phase 2.5 complete: Shopping mode toggle infrastructure exists
- Phase 2.3 complete: SkillCard and SkillEditorApp exist
- CharacterModel must have karma fields (total earned, unspent) — may need schema addition

**Other:**
- None
</constraints>

<risks>
## Risks and Mitigation

**Risk 1: SkillSpendingService mode confusion (creation points vs karma)**
- **Likelihood:** Medium
- **Impact:** High (wrong currency spent, data corruption)
- **Mitigation:** Add explicit `mode: "creation" | "karma"` parameter to buy/sell methods. Service reads `isCharacterCreation` flag to gate which currency is debited. Never mix modes.

**Risk 2: Shopping toggle ambiguity (creation mode vs post-creation karma mode)**
- **Likelihood:** Medium
- **Impact:** Medium (UX confusion, wrong state shown)
- **Mitigation:** `isCharacterCreation` flag cleanly separates modes: if true → creation point spending; if false → karma spending. Shopping cart toggle only enables karma mode when not in creation.

**Risk 3: Attribute advancement touching racial max boundary**
- **Likelihood:** Low
- **Impact:** Medium (wrong karma cost calculated)
- **Mitigation:** Attributes.svelte or KarmaSpendingService must read metatype's racial modified limit and attribute maximum when computing cost. Validate against CharacterModel metatype data.

**Risk 4: Spec limit validation (cannot exceed 2× base skill)**
- **Likelihood:** Low
- **Impact:** Low (rule violation allowed silently)
- **Mitigation:** SkillEditorApp or KarmaSpendingService must enforce spec ceiling: `min(targetRating, baseSkillRating × 2)` with special case for base = 1 → max spec = 3.
</risks>

<success_indicators>
## Success Indicators

**How we'll know this phase is complete:**

**Functional:**
- [ ] Character sheet shows Good Karma (total earned + unspent) on sheet
- [ ] Shopping cart toggle outside creation mode enters karma spending mode
- [ ] Attributes show karma buy buttons in karma spending mode; clicking correctly debits Good Karma at SR3e costs
- [ ] Attributes respect racial modified limit (×2) and attribute maximum (×3) cost tiers
- [ ] Essence, Magic, and Reaction have no karma buy buttons
- [ ] Skills show karma buy buttons; new skill at Rating 1 costs 1 GK flat
- [ ] Active skill cost tiers (×1.5 / ×2 / ×2.5 relative to linked attr) applied correctly
- [ ] Knowledge/Language skill cost tiers (×1 / ×1.5 / ×2 relative to Intelligence) applied correctly
- [ ] Specialization buy: starts at base + 1, costs apply correct tier
- [ ] Spec cannot exceed 2× base skill rating (except base 1 → max spec 3)
- [ ] Insufficient karma prevented with warning; no negative unspent balance

**Quality:**
- [ ] TypeScript strict mode: zero errors
- [ ] No `any` escape hatches (except documented `@ts-expect-error`)
- [ ] Svelte components remain presentational-only

**User-facing:**
- [ ] Visual verification: karma totals update immediately after spending
- [ ] Creation mode unaffected — creation point spending still works correctly
</success_indicators>

<codebase_context>
## Codebase State and Patterns

**Current state:**
Established codebase — Phases 1 through 2.5 complete. Service architecture, shopping mode, skill editors, and SkillSpendingService are all in place.

**Relevant files/systems:**
- `module/services/SkillSpendingService.ts` — handles creation point buy/sell/delete for all skill types; needs karma mode extension
- `module/ui/actors/actor-components/attributes/Attributes.svelte` — renders attribute cards; will need karma buy buttons injected
- `module/ui/actors/actor-components/skills/SkillCard.svelte` — renders skill cards with shopping buttons; already calls SkillSpendingService
- `module/ui/actors/actor-components/skills/SkillEditorApp.ts` — skill editor (linked attr, specializations); will need karma spending wired in
- `module/ui/actors/injections/AttributePointsState.svelte` — creation attr point injection; karma display will follow similar injection pattern
- `module/ui/actors/injections/ShoppingCartIcon.svelte` — shopping cart toggle; must differentiate creation vs karma mode
- `module/models/CharacterModel.ts` — data model; needs `karma.total` and `karma.unspent` fields added to schema
- `module/models/MetatypeModel.ts` — metatype racial modified limit and attribute maximums (needed for attribute karma cost calculation)

**Patterns to follow:**
- Singleton services with `static Instance()` getter
- `IStoreManager` for all actor document updates
- Svelte 5 `$props()`, `$state()`, `$derived()`, `$effect()` runes
- `@ts-expect-error` with comment for unavoidable Foundry API type conflicts
- Let-it-fail: no try/catch, no defensive null checks — use `!` non-null assertions
- CSS: no inline styles, all rules in `styles/` SCSS files

**External dependencies:**
- Foundry VTT v13 framework
- Svelte 5

**Known issues to address:**
- None carried forward from Phase 2.5

**Prior decisions affecting this phase:**
- Phase 2.4: All skill types use same linked-attr cost formula (knowledge/language use Intelligence as threshold); this applies to karma costs too
- Phase 2.4: SkillModel skillType defaults are unreliable — knowledge/language skill type hardcoded from editor context rather than item data
- Phase 2: `isCharacterCreation` flag controls creation mode; `isShoppingState` flag controls shopping cart toggle
- Phase 1: No exception handling — code works or fails naturally
</codebase_context>

<decisions_needed>
## Decisions That Will Affect Implementation

**Decision 1: Extend SkillSpendingService vs create KarmaSpendingService**
- **Context:** SkillSpendingService handles creation points. Karma costs are different formulas and debit a different resource. Could extend with mode param, or build a separate KarmaSpendingService.
- **Options:** (a) Add `mode: "creation" | "karma"` to existing service; (b) New `KarmaSpendingService` that composes SkillSpendingService for non-monetary operations; (c) New `KarmaSpendingService` fully independent
- **When to decide:** During planning

**Decision 2: Where Good Karma lives in the data model**
- **Context:** CharacterModel may need new schema fields for `karma.total` and `karma.unspent`. Alternatively, use actor flags.
- **Options:** (a) Add to CharacterModel system schema (preferred — queryable, typed); (b) Actor flags (simpler but less typed)
- **When to decide:** During planning (affects CharacterModel changes)

**Decision 3: Attribute karma buy button placement**
- **Context:** Attributes.svelte renders attribute cards. Where/how do karma buy (+/−) buttons appear in karma spending mode?
- **Options:** (a) Same position as creation mode buttons (already have pattern); (b) Inject via separate Svelte component overlay; (c) Always-visible buttons that activate/deactivate based on shopping state
- **When to decide:** During planning
</decisions_needed>

<notes>
## Additional Context

**SR3e Karma Cost Rules (provided by user):**

**Attributes:**
- Up to Racial Modified Limit: `new rating × 2` GK
- Beyond limit up to Attribute Maximum (= 1.5 × limit): `new rating × 3` GK
- Cannot improve: Essence, Magic, Reaction

**Skills — Learning new (Rating 1):** flat `1` GK

**Active Skills improvement:**
- new rating ≤ linked attr: `⌈new rating × 1.5⌉` GK
- linked attr < new rating ≤ (2 × linked attr): `new rating × 2` GK
- new rating > (2 × linked attr): `⌈new rating × 2.5⌉` GK

**Knowledge/Language Skills improvement:**
- new rating ≤ Intelligence: `new rating × 1` GK
- Intelligence < new rating ≤ (2 × Intelligence): `⌈new rating × 1.5⌉` GK
- new rating > (2 × Intelligence): `new rating × 2` GK

**Active Specializations:**
- Start: must own base skill; spec purchased at `base skill rating + 1`
- new rating ≤ linked attr: `⌈new rating × 0.5⌉` GK
- new rating ≤ (2 × linked attr): `new rating × 1` GK
- new rating > (2 × linked attr): `⌈new rating × 1.5⌉` GK

**Knowledge/Language Specializations:**
- new rating ≤ Intelligence: `⌈new rating × 0.5⌉` GK
- new rating ≤ (2 × Intelligence): `new rating × 1` GK

**Spec limits:** rating cannot exceed `base skill rating × 2`; special case: base = 1 → max spec = 3

[Questions asked during intake:]
- Q: How does the GM distribute karma to characters?
- A: Defer distribution UI — Phase 3 only handles tracking and spending on the character sheet

- Q: Which karma concepts are in scope?
- A: Good Karma tracking + Karma spending (advancement). Karma Pool (dice pool) deferred.

- Q: Where should SR3e cost formulas come from?
- A: User provided the complete SR3e cost table (see above)

- Q: Which advancement targets are in scope?
- A: Attributes, Skills, Specializations

- Q: How should karma spending be triggered?
- A: Same shopping mode toggle (isShoppingState); reuse existing pattern
</notes>

---

*Phase: 3-karma-experience-core*
*Context gathered: 2026-03-13*
*Ready for planning: yes*
