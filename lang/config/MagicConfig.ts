export const MAGIC_KEYS = [
  "magician", "archetype", "priority", "magicianType",
  "tradition", "drainResistanceAttribute", "canAstrallyProject", "totem", "shamannote", "aspect",
  "spellPoints", "powerPoints",
] as const;

export const SPELL_KEYS = [
  "spell", "casting", "targetingRules", "elementalRules",
  "thresholdRules", "drain", "effectRules",
  "type", "category", "manipulationSubtype", "duration", "rounds",
  "learnedForce", "range", "targeting", "targetAttribute", "staticTargetNumber",
  "resistanceAttribute", "thresholdMode", "thresholdAttribute", "thresholdDivisor",
  "thresholdValue", "attackTargetNumber", "canDodge", "armorMultiplier",
  "drainPowerModifier", "drainDamageLevel", "drainDamageLevelModifier",
  "fetishes", "fetishReady", "fetishMissing", "exclusiveCast",
  "effectAlgorithm", "effectTargetPath", "effectScope",
] as const;

export const FOCUS_KEYS = [
  "focus", "type", "force", "bonded", "active", "spell",
  "category", "spiritType", "reach", "spentDice", "expendable",
] as const;

export const ARCHETYPE_KEYS = ["adept", "magician"] as const;
export const MAGICIAN_TYPE_KEYS = ["fullmage", "aspectedmage"] as const;
export const ASPECT_KEYS = ["conjurer", "sorcerer", "elementalist", "custom"] as const;
export const RESISTANCE_ATTRIBUTE_KEYS = ["willpower", "charisma", "intelligence"] as const;
export const TRADITION_KEYS = ["hermetic", "shamanic", "other"] as const;
export const SPELL_TYPE_KEYS = ["mana", "physical"] as const;
export const SPELL_CATEGORY_KEYS = ["combat", "detection", "health", "illusion", "manipulation"] as const;
export const SPELL_MANIPULATION_SUBTYPE_KEYS = ["control", "elemental", "telekinetic", "transformation"] as const;
export const SPELL_DURATION_KEYS = ["instant", "sustained", "permanent"] as const;
export const SPELL_RANGE_KEYS = ["los", "touch"] as const;
export const SPELL_TARGETING_KEYS = ["attribute", "objectResistance", "static"] as const;
export const SPELL_THRESHOLD_MODE_KEYS = ["none", "halfAttribute", "static"] as const;
export const SPELL_DRAIN_LEVEL_KEYS = ["l", "m", "s", "d"] as const;
export const FOCUS_TYPE_KEYS = [
  "expendableSpell", "specificSpell", "spellCategory", "spirit",
  "power", "sustaining", "weapon",
] as const;
export const SPELL_EFFECT_ALGORITHM_KEYS = [
  "attributeModPerTwo", "tnPerSuccess", "tnPerSuccessCapped8", "tnPerTwoSuccesses",
  "barrierStep", "levitateSpeed", "magicFingers", "detectionRange", "permanentTimeDivisor",
] as const;
export const SPELL_EFFECT_SCOPE_KEYS = ["caster", "target"] as const;

export const ADEPT_POWER_KEYS = [
  "adeptpower", "isActive", "hasDrain", "powerPointCost", "rating",
  "tnModifiers", "addRow", "removeRow",
  "targetKind", "targetId", "modifier", "skill", "attribute", "passive",
  "buyPowerPoints", "spendPowerPoints", "powerPointsAvailable",
] as const;
