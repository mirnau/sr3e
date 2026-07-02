import { ATTRIBUTES_KEYS, CREATION_KEYS, DICE_POOLS_KEYS, HEALTH_KEYS, KARMA_KEYS, MOVEMENT_KEYS, PROFILE_KEYS } from "./config/AttributeComponentsConfig";
import { CHARACTER_KEYS, GMSCREEN_KEYS, ACTOR_TYPE_KEYS } from "./config/ActorConfig";
import { METATYPE_KEYS } from "./config/MetaTypeConfig";
import { COMMON_KEYS, MODAL_KEYS } from "./config/CommonConfig";
import { SKILL_KEYS } from "./config/SkillConfig";
import {
  WEAPON_KEYS, COMMODITY_KEYS, PORTABILITY_KEYS,
  WEAPON_MODE_KEYS, RELOAD_MECHANISM_KEYS, AMMO_CLASS_KEYS, DAMAGE_TYPE_KEYS,
  LEGAL_STATUS_KEYS, LEGAL_PERMIT_KEYS, LEGAL_PRIORITY_KEYS, ITEM_TYPE_KEYS,
} from "./config/WeaponConfig";
import { AMMUNITION_KEYS, AMMO_TYPE_KEYS } from "./config/AmmunitionConfig";
import { WEARABLE_KEYS } from "./config/WearableConfig";
import { TRANSACTION_KEYS, TRANSACTION_TYPE_KEYS } from "./config/TransactionConfig";
import {
  MAGIC_KEYS, SPELL_KEYS, FOCUS_KEYS, ARCHETYPE_KEYS, MAGICIAN_TYPE_KEYS, ASPECT_KEYS,
  RESISTANCE_ATTRIBUTE_KEYS, TRADITION_KEYS, SPELL_TYPE_KEYS, SPELL_CATEGORY_KEYS,
  SPELL_MANIPULATION_SUBTYPE_KEYS,
  SPELL_DURATION_KEYS, SPELL_RANGE_KEYS, SPELL_TARGETING_KEYS,
  SPELL_THRESHOLD_MODE_KEYS, SPELL_DRAIN_LEVEL_KEYS, FOCUS_TYPE_KEYS,
  SPELL_EFFECT_ALGORITHM_KEYS, SPELL_EFFECT_SCOPE_KEYS,
} from "./config/MagicConfig";
import { INVENTORY_KEYS } from "./config/InventoryConfig";
import { GADGET_KEYS, GADGET_TYPE_KEYS, EFFECTS_KEYS } from "./config/GadgetConfig";
import { MEDICAL_KEYS } from "./config/MedicalConfig";

const SYSTEM_NAMESPACE = "sr3e";

function createI18nMapping<T extends readonly string[]>(
  namespace: string,
  keys: T
): Record<T[number], string> {
  return Object.fromEntries(
    keys.map(k => [k, `${namespace}.${k}`])
  ) as Record<T[number], string>;
}

export function createCategory<T extends readonly string[]>(category: string, keys: T) {
  const namespace = `${SYSTEM_NAMESPACE}.${category}`;
  return createI18nMapping(namespace, keys);
}

export const sr3e = {
  ATTRIBUTES: createCategory("attributes", ATTRIBUTES_KEYS),
  CHARACHTER: createCategory("character", CHARACTER_KEYS),
  CREATION: createCategory("creation", CREATION_KEYS),
  COMMON: createCategory("common", COMMON_KEYS),
  DICE_POOLS: createCategory("dicePools", DICE_POOLS_KEYS),
  HEALTH: createCategory("health", HEALTH_KEYS),
  KARMA: createCategory("karma", KARMA_KEYS),
  MOVEMENT: createCategory("movement", MOVEMENT_KEYS),
  PROFILE: createCategory("profile", PROFILE_KEYS),
  METATYPE: createCategory("metatype", METATYPE_KEYS),
  SKILL: createCategory("skill", SKILL_KEYS),
  MODAL: createCategory("modal", MODAL_KEYS),
  GMSCREEN: createCategory("GMSCREEN", GMSCREEN_KEYS),
  WEAPON: createCategory("weapon", WEAPON_KEYS),
  COMMODITY: createCategory("commodity", COMMODITY_KEYS),
  PORTABILITY: createCategory("portability", PORTABILITY_KEYS),
  WEAPON_MODES: createCategory("weaponMode", WEAPON_MODE_KEYS),
  RELOAD_MECHANISMS: createCategory("reloadMechanism", RELOAD_MECHANISM_KEYS),
  AMMO_CLASSES: createCategory("ammunitionClass", AMMO_CLASS_KEYS),
  DAMAGE_TYPES: createCategory("damageType", DAMAGE_TYPE_KEYS),
  LEGAL_STATUSES: createCategory("legalstatus", LEGAL_STATUS_KEYS),
  LEGAL_PERMITS: createCategory("legalpermit", LEGAL_PERMIT_KEYS),
  LEGAL_PRIORITIES: createCategory("legalpriority", LEGAL_PRIORITY_KEYS),
  ITEM_TYPES: createCategory("itemTypes", ITEM_TYPE_KEYS),
  ACTOR_TYPES: createCategory("actorTypes", ACTOR_TYPE_KEYS),
  AMMUNITION: createCategory("ammunition", AMMUNITION_KEYS),
  AMMO_TYPES: createCategory("ammunitionType", AMMO_TYPE_KEYS),
  WEARABLE: createCategory("wearable", WEARABLE_KEYS),
  TRANSACTION: createCategory("transaction", TRANSACTION_KEYS),
  TRANSACTION_TYPES: createCategory("transactionType", TRANSACTION_TYPE_KEYS),
  MAGIC: createCategory("magic", MAGIC_KEYS),
  SPELL: createCategory("spell", SPELL_KEYS),
  FOCUS: createCategory("focus", FOCUS_KEYS),
  ARCHETYPES: createCategory("archetypes", ARCHETYPE_KEYS),
  MAGICIAN_TYPES: createCategory("magicianTypes", MAGICIAN_TYPE_KEYS),
  ASPECTS: createCategory("aspects", ASPECT_KEYS),
  RESISTANCE_ATTRIBUTES: createCategory("resistanceAttributes", RESISTANCE_ATTRIBUTE_KEYS),
  TRADITIONS: createCategory("traditions", TRADITION_KEYS),
  SPELL_TYPES: createCategory("spellTypes", SPELL_TYPE_KEYS),
  SPELL_CATEGORIES: createCategory("spellCategories", SPELL_CATEGORY_KEYS),
  SPELL_MANIPULATION_SUBTYPES: createCategory("spellManipulationSubtypes", SPELL_MANIPULATION_SUBTYPE_KEYS),
  SPELL_DURATIONS: createCategory("spellDurations", SPELL_DURATION_KEYS),
  SPELL_RANGES: createCategory("spellRanges", SPELL_RANGE_KEYS),
  SPELL_TARGETING: createCategory("spellTargeting", SPELL_TARGETING_KEYS),
  SPELL_THRESHOLD_MODES: createCategory("spellThresholdModes", SPELL_THRESHOLD_MODE_KEYS),
  SPELL_DRAIN_LEVELS: createCategory("spellDrainLevels", SPELL_DRAIN_LEVEL_KEYS),
  FOCUS_TYPES: createCategory("focusTypes", FOCUS_TYPE_KEYS),
  SPELL_EFFECT_ALGORITHMS: createCategory("spellEffectAlgorithms", SPELL_EFFECT_ALGORITHM_KEYS),
  SPELL_EFFECT_SCOPES: createCategory("spellEffectScopes", SPELL_EFFECT_SCOPE_KEYS),
  INVENTORY: createCategory("inventory", INVENTORY_KEYS),
  GADGET: createCategory("gadget", GADGET_KEYS),
  GADGET_TYPES: createCategory("gadgetTypes", GADGET_TYPE_KEYS),
  EFFECTS: createCategory("effects", EFFECTS_KEYS),
  MEDICAL: createCategory("medical", MEDICAL_KEYS),
} as const;

export type localizations = typeof sr3e;
