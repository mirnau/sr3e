# sr3e Migration Plan

## MoSCoW

[x] MUST: Karma shopping UI wiring → .zone/techspecs/TECHSPEC-karma-shopping-ui.md
[x] MUST: Combat architecture decisions → .zone/techspecs/TECHSPEC-combat-architecture-decisions.md
[x] MUST: Tier 1 — combat utilities → .zone/techspecs/TECHSPEC-combat-tier-1-utilities.md
[x] MUST: Tier 2 — engine core + circular import fix → .zone/techspecs/TECHSPEC-combat-tier-2-engine-core.md
[x] MUST: Tier 3 — procedure system → .zone/techspecs/TECHSPEC-combat-tier-3-procedures.md
[x] MUST: Tier 4 — orchestration → .zone/techspecs/TECHSPEC-combat-tier-4-orchestration.md
[x] MUST: SR3E dice accumulation engine → .zone/techspecs/TECHSPEC-dice-accumulation-engine.md
[x] MUST: Tier 5a — simple rolls (click-to-roll on skills, attributes, pools)
[x] MUST: Tier 5b — advanced rolls (roll composer wiring + data model) → .zone/techspecs/TECHSPEC-combat-tier-5b-advanced-rolls.md
[x] MUST: Tier 5b.2 — roll composer styling
[x] MUST: Weapons item — migrate from old_project (sister folder)
[x] MUST: Ammunition item — port from old_project (Svelte app + sheet + data model, WeaponApp style)
[x] MUST: Wearable item — port from old_project (Svelte app + sheet + data model, WeaponApp style)
[x] MUST: Transaction item — port from old_project (Svelte app + sheet + data model, WeaponApp style)
[x] MUST: Magic items — complete half-done port from old_project (Svelte app + sheet + data model, WeaponApp style)
[x] MUST: Inventory / AssetManager → .zone/techspecs/TECHSPEC-inventory-assetmanager.md
[x] MUST: Tier 5c — combat panel integration (deferred: requires inventory/asset manager)
[x] MUST: Weapon charging mechanic
[x] SHOULD: Clickable dice in chat for karma re-rolls
[x] SHOULD: Gadget system + item sheets → .zone/techspecs/TECHSPEC-gadget-system.md
[x] MUST: Overflow damage rules (stun→physical conversion, bleeding out, death threshold)
[x] MUST: First Aid items (trauma patch, medkit — depends on overflow)
[x] MUST: Economy and transactions (general, not vehicle-specific) -> .zone/techspecs/TECHSPEC-economy-and-transactions.md
[x] MUST: Purchase on drop (commodity purchase dialog + credit-stick transfer) -> .zone/techspecs/TECHSPEC-purchase-on-drop.md
[x] COULD: Magic Level 1 — spell/focus item substrate -> .zone/techspecs/TECHSPEC-magic-system.md
[x] COULD: Magic Level 2 — focus activation infrastructure -> .zone/techspecs/TECHSPEC-magic-system.md
[x] COULD: Magic Level 3 — spellcasting infrastructure -> .zone/techspecs/TECHSPEC-magic-system.md
[x] COULD: Magic Level 4 — drain chat flow -> .zone/techspecs/TECHSPEC-magic-system.md
[x] COULD: Magic Level 5 — sustaining and advanced magic hooks -> .zone/techspecs/TECHSPEC-magic-system.md
[x] COULD: Chat / socket challenge–response flows -> .zone/techspecs/TECHSPEC-chat-socket-challenge-response.md
[x] COULD: Vehicle → .zone/techspecs/TECHSPEC-vehicle.md
[x] COULD: Vehicle rigger — seated/jacked-in garage flow → .zone/techspecs/TECHSPEC-vehicle-rigger.md
[wontfix] COULD: Uncapped roll as system setting → .zone/techspecs/TECHSPEC-uncapped-roll-system-setting.md
[x] MUST: Cyberdeck + Hacker Pool (jacked-in, VCR-parallel; Matrix deferred) → .zone/techspecs/TECHSPEC-cyberdeck-hacker-pool.md
[x] SHOULD: Strip data-migration code (alpha, no players, no back-compat obligation yet) → .zone/techspecs/TECHSPEC-strip-migration-code.md
[x] MUST: Adept powers — Power Points, active/passive powers, TN modifiers, Grimoire integration → .zone/techspecs/TECHSPEC-adept-powers.md
[ ] MUST: Cyberware, bioware — shared Augmentation backend, Augmentations tab → .zone/techspecs/TECHSPEC-augmentation-cyberware-bioware.md

