# TECHSPEC: Magic System

## Summary

Build the SR3E magic system only after compiling a local, page-indexed rule section. Existing code already has basic `magic`, `spell`, and `focus` item type scaffolding plus astral/spell dice pool fields. The missing work is rules-first: spellcasting, drain, foci, astral activity, and related edge cases must be imported into `.rules/raw/` before implementation issues are sliced.

---

## Rule Section

Status: rule collection complete for infrastructure scope. Player-created spell formulas are in scope; bundled spell catalog is out of scope. Do not implement spell effects beyond generic infrastructure unless backed by item data supplied by the player.

Required source imports:

| Rule area | Required coverage | Source status |
|---|---|---|
| Magic eligibility | Awakened archetypes, full/aspected magician limits, adept boundaries, priority effects | Missing |
| Spell data | Spell type/category/range/duration/force/drain code/targeting semantics | Partial: spell types, categories, and duration taxonomy in `.rules/raw/178.md`; category detail in `.rules/raw/192.md`, `.rules/raw/193.md`, `.rules/raw/195.md`, `.rules/raw/196.md`; Force selection in `.rules/raw/181.md`; Drain Code structure and examples in `.rules/raw/162.md`, `.rules/raw/191.md`, and `.rules/raw/194.md`; full spell catalog still missing |
| Spellcasting procedure | Dice source, spell pool use, target numbers, opposed/static tests, success effects | Partial: combat action timing in `.rules/raw/100.md`, `.rules/raw/102.md`, `.rules/raw/104.md`, `.rules/raw/107.md`, and `.rules/raw/181.md`; preparation/targeting in `.rules/raw/181.md`; LOS/barriers in `.rules/raw/104.md`; Sorcery Test in `.rules/raw/182.md`; TN modifiers/spell defense in `.rules/raw/107.md` and `.rules/raw/183.md`; resistance/effect in `.rules/raw/183.md`; non-combat timing in `.rules/raw/39.md`; Spell Pool refresh in `.rules/raw/180.md` |
| Drain procedure | Drain target number, drain level, resistance dice, stun vs physical, staging | Partial: general Drain and Drain Code structure in `.rules/raw/162.md`; limited spell Drain modifiers in `.rules/raw/180.md`; sorcery Drain in `.rules/raw/183.md`; conjuring Drain in `.rules/raw/187.md`; Drain Level rules and examples in `.rules/raw/191.md` and `.rules/raw/194.md`; full spell catalog still missing |
| Spell fetishes | Fetish-limited spell requirement, attunement, physical contact, replacement, notice modifier, cost/legal source | Imported from `.rules/raw/161.md`, `.rules/raw/180.md`, and `.rules/raw/305.md` |
| Sustained spells | Duration, sustaining penalties, ending conditions, interaction with damage/overflow | Partial: duration taxonomy, +2 sustaining TN penalty, and Sorcery-skill simultaneous-sustain cap in `.rules/raw/178.md`; sustaining foci in `.rules/raw/189.md` and `.rules/raw/191.md`; +2 TN per sustained spell in `.rules/raw/107.md`; +2 Drain Power for new magic in `.rules/raw/162.md`; drop timing in `.rules/raw/106.md`; effect magnitude formulas in `.rules/raw/181.md` (area radius), `192.md` (detection range), `193.md`/`194.md` (attribute mod, permanent time divisor), `195.md`/`196.md` (Confusion/Silence), `197.md`/`198.md` (Levitate, Magic Fingers, Shadow, Barrier, Ice Sheet); ending conditions (caster incapacitation/death) still missing |
| Foci | Focus types, ratings, bonding/activation, dice or TN effects, limits, deactivation | Imported from `.rules/raw/54.md`, `.rules/raw/60.md`, `.rules/raw/106.md`, `.rules/raw/189.md`, `.rules/raw/190.md`, and `.rules/raw/191.md` |
| Astral | Astral perception/projection eligibility, astral combat hooks, astral pool use | Partial: active foci astral properties in `.rules/raw/189.md` and `.rules/raw/190.md`; focus tracking in `.rules/raw/191.md` |
| Spirits/conjuring | Summoning/banishing/binding scope decision, drain/resistance interaction | Partial: conjuring Drain in `.rules/raw/187.md`; spirit/power focus interactions in `.rules/raw/189.md` |
| Edge cases | Stabilize spell vs overflow damage, background/domain modifiers, armor/visibility modifiers if relevant | Partial: Sorcery Rule of One Drain TN modifier in `.rules/raw/182.md`; background count Drain modifier in `.rules/raw/183.md` |

Rule import process:
- User supplies source text and page number/range.
- Import each page into `.rules/raw/<first-page>.md` with `import-sr3e-rule`.
- Add concise, operational paraphrases here only after source import exists.
- Any ambiguous or conflicting source interpretation blocks implementation slicing.

---

## Current Code Substrate

### Present

- `system.json` has item types: `magic`, `spell`, `focus`.
- `module/models/items/MagicModel.ts` stores awakened archetype/priority, magician type/tradition/aspect, drain resistance attribute, astral projection flag, totem, spell points, and adept power points.
- `module/models/items/SpellModel.ts` stores spell type, category, duration, learned force, targeting, and drain.
- `module/ui/items/MagicApp.svelte` exposes basic magic item fields.
- Character creation can embed selected magic items and set Magic attribute to 6 for priority A/B paths.
- Actor dice pools include `astral` and `spell`; pool refresh already resets both.

### Missing

- `SpellApp.svelte` and `FocusApp.svelte` are not present in current project.
- No spellcasting procedure exists.
- No drain procedure exists.
- No foci mechanics exist.
- No astral perception/projection workflow exists.
- No magic-specific chat output, roll composer setup, or resistance flow exists.
- `FocusModel.ts` exists but has an empty schema.
- `SpellModel.ts` exists but only has primitive `drain: number`; it cannot represent Drain Code Power modifier + Damage Level.
- `system.json` declares `spell` and `focus`, but `sr3e.ts` does not register spell/focus models and sheets.

---

## Architecture Decisions

### Spell is a first-class item

`spell` remains an item that can be embedded on a character. The player creates spell items manually; system infrastructure reads their fields to drive casting and Drain. No bundled spell catalog in this feature.

Recommended `SpellModel` shape:

| Field | Purpose |
|---|---|
| `type` | `mana` or `physical` |
| `category` | combat, detection, health, illusion, manipulation |
| `manipulationSubtype` | control, elemental, telekinetic, transformation; blank for non-manipulation |
| `duration.type` | instant, sustained, permanent |
| `duration.rounds` | required sustain period for permanent spells, if relevant |
| `learnedForce` | maximum Force known by caster |
| `range` | LOS, touch, self, or item-defined value |
| `targeting.kind` | attribute, object-resistance, static |
| `targeting.attribute` | willpower/body/other targeted attribute |
| `targeting.staticTargetNumber` | item-defined TN where rules need fixed TN |
| `resistance.attribute` | attribute used by unwilling living targets |
| `drain.powerModifier` | modifier added to floor(Force / 2) |
| `drain.damageLevel` | L/M/S/D or "chosen" for combat spells |
| `drain.damageLevelModifier` | level delta such as +1 for area combat spell examples |
| `limits.fetish` | applies the fetish limit and requires an attuned spell fetish for casting |
| `limits.exclusive` | applies -2 Force for Drain calculation and makes casting/sustaining Exclusive |

### Spell fetishes are not foci

Spell fetishes are reusable enchanted objects required by fetish-limited spells. They are not focus dice pools and should not use focus activation, bonding, or active focus limits. From the Foundry implementation perspective, they may use the gadget/ActiveEffect substrate because their behavior is mostly an item-carried requirement/effect marker rather than an independent roll procedure.

Operational implications:
- A fetish-limited spell cannot be cast unless the magician has physical contact with an attuned fetish for that specific spell.
- A spell fetish is tied to one spell category and attuned to the magician and specific spell during learning.
- If lost, the limited spell cannot be cast until a replacement fetish is attuned through meditation for hours equal to the spell Force.
- Fetish casting applies -1 to observer target numbers for noticing the magic.
- Fetish infrastructure should prefer a gadget-compatible item/effect marker if that fits the existing gadget editor, because the runtime requirement is "caster has usable attuned fetish in physical contact" rather than a separate focus dice pool.
- Do not model spell fetishes as foci.

### Focus is a first-class item, not a gadget

`focus` should be a real item because rules give it identity: Force, type, bonding, activation, ownership, active limit, astral signature, legality, and consumption. Gadget system deletes/embeds inventory gadgets into a target's ActiveEffects; that is wrong for foci because active foci stay owned items and can be dropped, snatched, deactivated, or consumed.

Mechanically, most foci behave like specialized dice pools attached to inventory items. Do not add arbitrary dynamic keys to `actor.system.dicePools`; that model currently has fixed pools (`combat`, `astral`, `hacking`, `control`, `spell`) and refresh logic hardcodes those paths. Instead, treat active focus dice as **item-backed virtual pools**:

- Each active focus exposes an available dice pool named after the focus item.
- Available focus dice = `system.force - system.dice.spent`.
- Focus dice refresh by resetting `system.dice.spent` on active focus items at the beginning of each Combat Turn.
- Spellcasting and Drain composer flows can list eligible active foci next to Spell Pool.
- Spending focus dice updates the focus item, not actor `system.dicePools`.
- The focus item's type/scope decides which tests can use that virtual pool.

Use ActiveEffects only as a projection layer when an active focus produces a persistent mechanical modifier. Examples:
- Power focus active -> actor ActiveEffect for Magic Attribute modifier, if we need totals to include it.
- Weapon focus active -> item/actor effect if combat skill bonus is later implemented.
- Sustaining focus active -> ActiveEffect or flag that records sustained spell custody.

Do not use `GadgetViewer` as the focus mechanism. Reuse editor patterns where useful, but focus activation should be managed by a dedicated focus service.

Recommended `FocusModel` shape:

| Field | Purpose |
|---|---|
| `focusType` | expendableSpell, specificSpell, spellCategory, spirit, power, sustaining, weapon |
| `force` | focus Force |
| `bonded` | whether bonded |
| `active` | activation state |
| `scope.spellItemId` | specific spell focus binding to an embedded spell item |
| `scope.category` | spell category focus binding |
| `scope.spiritType` | spirit focus binding |
| `weapon.reach` | weapon focus bonding cost |
| `commodity` | shared cost/availability/legality component |
| `portability` | shared concealability/weight component |
| `dice.spent` | focus dice spent this Combat Turn |

Runtime invariants:
- Active focus count <= Intelligence.
- Activation requires bonded focus and Simple Action context.
- Dropped/snatch-away UI can be explicit manual deactivation for now.
- Focus dice are per-test resources refreshing at beginning of next Combat Turn, not permanent pool values.
- Only one actor can be bonded to a focus at a time; re-bonding severs previous ownership.
- In this implementation, focus owner is implicit from the carrier actor; do not store `bondedActorUuid`.
- Expendable spell foci are deleted on use; do not store a persistent consumed flag.
- RAW limits active foci, not total bonded foci. If we want "bonded foci <= Intelligence" instead, record it as a house rule before implementation.

### Sustained spell effect magnitude: algorithm dispatch, not formula strings

Sustained and health/illusion/manipulation/detection spells scale their effect off Sorcery Test successes and Force using a small closed set of formulas (SR3 pp.178, 181, 192-198). A free-text formula field would require players to write expressions; instead each spell picks a named **effect algorithm** from a dropdown, mirroring the existing `spellDamageStaging` dispatch-by-category pattern in `spellCombat.ts`.

**`SpellModel` additions:**

| Field | Purpose |
|---|---|
| `effect.algorithm` | One of the enum keys below, or `""` for spells with no computed magnitude (combat/detection spells use existing damage staging / range display instead) |
| `effect.targetPath` | Actor-relative update path the computed magnitude is applied to (e.g. `system.attributes.reaction.mod`), only meaningful for actor-scoped algorithms |
| `effect.scope` | `caster` or `target` — who the computed ActiveEffect attaches to |

**Algorithm catalog** (`module/services/spells/spellEffectMagnitude.ts`, pure functions, one per key, inputs `{ force, successes, magic }`):

| Key | Formula | Cap | Source |
|---|---|---|---|
| `attributeModPerTwo` | `floor(successes / 2)` | Force | p.193-194 |
| `tnPerSuccess` | `successes` | Force | p.195 (Confusion) |
| `tnPerSuccessCapped8` | `min(successes, 8, Force)` | 8 and Force | p.198 (Shadow) |
| `tnPerTwoSuccesses` | `floor(successes / 2)` | Force | p.198 (Ice Sheet) |
| `barrierStep` | `Force + floor((successes - 1) / 2)`, 0 if successes < 1 | none beyond formula | p.198 |
| `levitateSpeed` | `magic * min(successes, Force)` | Force applied to successes term | p.197 |
| `magicFingers` | `min(successes, Force)` | Force | p.197 |
| `detectionRange` | `force * magic` | none (uses Force directly, not successes) | p.192 |
| `permanentTimeDivisor` | `baseTimeTurns / max(1, successes)` | none | p.194, p.178 |

**Actor-effect auto-application is scoped to `attributeModPerTwo` only in this pass.** It is the sole algorithm with an unambiguous single-actor target and an existing numeric stat path (`system.attributes.*.mod`, `system.dicePools.*.mod`) to write into. The remaining eight algorithms compute a magnitude and post it to the spellcasting chat card for the GM/table to apply manually, because they target things this system does not yet model as addressable entities: perception-category-scoped TN mods (Confusion/Silence/Shadow), a zone or wall (Barrier/Ice Sheet), a per-action movement rate (Levitate), an unowned telekinetic manipulator (Magic Fingers), or a pre-cast time budget rather than a persistent effect (permanentTimeDivisor, detectionRange). Widening auto-application beyond `attributeModPerTwo` requires those addressable-entity systems to exist first — out of scope here per the existing "no astral map/scene layer" WON'T.

**Data flow for `attributeModPerTwo` spells:**
1. Spellcasting roll resolves; `spellDamageStaging`-equivalent success count is already available from the contest.
2. On sustained-spell commit (`spellcastingSetup.ts`), if `effect.algorithm === "attributeModPerTwo"` and `effect.targetPath` is set, compute magnitude via `spellEffectMagnitude.attributeModPerTwo({ force, successes, magic })`.
3. Create one ActiveEffect via `createEmbeddedDocuments` on the actor at `effect.scope` (caster or resolved target actor) with a single change at `effect.targetPath`, value = computed magnitude, flagged `flags.sr3e.sustainedSpellId = <sustained entry id>`.
4. Extend `SustainedSpell` (`sustainedSpells.ts`) with `appliedEffectUuid: string | null` so `dropSustainedSpell` can delete the matching ActiveEffect when the entry is removed.
5. All other algorithms: compute magnitude, include it in the existing spellcasting chat summary text (`renderRollSummary`-family), no ActiveEffect created.

### Drain is chat-driven

Spellcasting should always produce a chat card with a mandatory Drain prompt. This mirrors existing damage resistance: chat card flags hold enough context, `renderChatMessageHTML` wires the button, handler consumes the card, then executes the follow-up roll.

Recommended flow:
1. Cast spell via roll composer.
2. Post spellcasting outcome chat with `flags.sr3e.spellDrain`.
3. Chat card shows `Roll Drain`.
4. Clicking consumes card and opens/executes Drain Resistance.
5. Drain result applies Stun/Physical boxes through existing health paths.

This makes Drain hard to forget and keeps post-roll work attached to the originating chat message.

---

## Implementation Levels

### Level 1: Spell and Focus Item Substrate

- Register `spell` and `focus` in `typekeys` and `sr3e.ts`.
- Replace `SpellModel.drain: number` with Drain Code fields.
- Expand empty `FocusModel`.
- Add `SpellSheet.ts`, `FocusSheet.ts`, `SpellApp.svelte`, and `FocusApp.svelte`.
- Make both item types visible/addable in character inventory.

### Level 2: Focus Activation Infrastructure

- Add focus service for bonding state, activation/deactivation, active-count limit, expendable consumption, and Combat Turn dice refresh.
- Use item flags or model fields for active/bonded state.
- Represent focus dice as item-backed virtual pools named after the focus item.
- Add ActiveEffect projection only where a focus changes persistent actor/item totals, such as active power focus Magic bonus.
- Do not attach foci through gadget slots.

### Level 3: Spellcasting Infrastructure

- Add spellcasting setup/service using existing `ProcedureSetup`, `SR3ERoll`, roll composer, and Spell Pool mechanics.
- Compute casting TN from spell item data, target type, situational modifiers, sustained spell penalties, and focus dice.
- Produce generic spellcasting chat output; player/table handles spell-specific effects unless item data maps to existing damage/healing/effect paths.

### Level 4: Drain Chat Flow

- Add `renderDrainPrompt`, `spellDrain` chat flags, and `handleDrainClick`.
- Implement Drain Power calculation: floor(Force / 2), item modifier, limits, sustaining, multiple spells, Rule of One, background modifier.
- Implement Drain Level staging and Stun/Physical routing through existing health values.

### Level 5: Sustaining and Advanced Magic Hooks

- Track sustained spells, +2 sustaining TN penalty, +2 Drain Power for new magic, and drop timing. **Done** — `module/services/spells/sustainedSpells.ts`, wired into `spellcastingSetup.ts` and `spellDrain.ts`.
- Add sustaining focus custody for sustained spells. **Done** — `sustainSpellInFocus`, Force-capacity checked, excluded from caster's own TN/Drain penalty.
- Add `effect.algorithm` / `effect.targetPath` / `effect.scope` to `SpellModel`; add dropdown UI on `SpellApp.svelte`.
- Add `module/services/spells/spellEffectMagnitude.ts` with the nine pure algorithm functions (see Architecture Decisions). **Done** — GH #184, 16 tests.
- SpellModel `effect.{algorithm,targetPath,scope}` fields + SpellApp picker UI. **Done** — GH #185.
- Wire `attributeModPerTwo` to auto-create/remove a tagged ActiveEffect on sustain/drop; all other algorithms compute-and-post to chat only. **Done** — GH #186 (auto-effect, `spellEffectApplication.ts`), #187 (chat tag for the other eight algorithms, `renderRollSummary.ts` spellLine).
- Defer astral/conjuring/spirit mechanics beyond foci and Drain unless promoted into later PLAN items.
- Defer turn/round lifecycle hooks (auto-drop on caster incapacitation/death, free-action drop timing gate) to a follow-up pass — not yet scoped.

---

## MoSCoW

### MUST

**Level 1: Spell and Focus Item Substrate**
- Register `spell` and `focus` models/sheets.
- Add model fields and sheets for player-authored spell/focus data.

**Level 2: Focus Activation Infrastructure**
- Implement focus activation as item state plus optional ActiveEffect projection.
- Enforce bonded/active/count/refresh constraints.
- Expose active focus dice as item-backed virtual pools usable by spellcasting, Drain, Spell Defense, Conjuring, or other eligible procedures.

**Level 3: Spellcasting Infrastructure**
- Implement generic spellcasting roll setup and chat outcome.
- Use player-authored spell item data; no bundled catalog.

**Level 4: Drain Chat Flow**
- Implement mandatory chat-driven Drain prompt and resolution.
- Apply Drain damage to existing health fields.

**Level 5: Sustaining and Advanced Magic Hooks**
- Implement sustained spell state, sustaining penalties, and sustaining focus custody.
- Implement the nine-algorithm effect magnitude catalog as pure, independently tested functions.
- Auto-apply `attributeModPerTwo` as a tagged ActiveEffect on sustain, removed on drop.
- Post computed magnitude to chat for the remaining eight algorithms (no auto ActiveEffect).
- Keep astral/conjuring as later promoted work unless required by focus/drain interactions.

### SHOULD

- Use old_project as migration reference for basic UI shape only; old focus app is a placeholder.
- Add chat summaries for spellcasting and drain using existing combat chat style.
- Add targeted tests around drain staging, spell pool spending, and foci activation.

### COULD

- Include sustained spell tracking if source-backed mechanics can map cleanly to Active Effects.
- Promote astral/conjuring/spirit systems to later PLAN items.

### WON'T

- No house-rule defaults.
- No broad magic compendium import in this feature.
- No astral map/scene layer unless separately specced.
- No bundled spell catalog.

---

## Affected Files

| File | Change |
|---|---|
| `.rules/raw/*.md` | Add source-backed magic rules before implementation |
| `.zone/techspecs/TECHSPEC-magic-system.md` | Maintain rule section and implementation scope |
| `module/models/items/SpellModel.ts` | Adjust only if imported rules require schema changes |
| `module/models/items/MagicModel.ts` | Adjust only if imported rules require schema changes |
| `module/models/items/FocusModel.ts` | Add or port after rule source exists |
| `module/sheets/items/SpellSheet.ts` | Add or complete sheet registration |
| `module/sheets/items/FocusSheet.ts` | Add or complete sheet registration |
| `module/ui/items/SpellApp.svelte` | Add spell editor app |
| `module/ui/items/FocusApp.svelte` | Add focus editor app |
| `module/services/combat/procedures/*` | Add spellcasting/drain setups using existing procedure patterns |
| `module/services/spells/sustainedSpells.ts` | Sustained spell tracking, TN/Drain penalties, focus custody, tagged ActiveEffect cleanup on drop |
| `module/services/spells/spellEffectMagnitude.ts` | Nine-algorithm effect magnitude catalog |
| `module/services/combat/orchestration/*` | Add spellcasting/drain orchestration only where reusable flows do not fit |
| `module/ui/combat/chat/*` | Add spell/drain chat renderers |
| `lang/en.json` | Add labels/messages |
| `sr3e.ts` | Register sheets/hooks if needed |

---

## Key Invariants

- Source text governs mechanics; old_project governs migration shape only.
- Spellcasting and drain are separate procedure phases.
- Drain never bypasses existing health invariants: use `system.health.stun.value`, `system.health.physical.value`, and `system.health.overflow.value`.
- Spell Pool and Astral Pool use existing pool spend/reset semantics.
- Unsourced rule area remains explicitly missing, not silently approximated.
