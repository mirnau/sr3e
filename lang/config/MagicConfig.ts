export const MAGIC_KEYS = [
  "magician", "archetype", "priority", "magicianType",
  "tradition", "drainResistanceAttribute", "canAstrallyProject", "totem", "shamannote", "aspect",
  "spellPoints", "powerPoints",
] as const;

export const ARCHETYPE_KEYS = ["adept", "magician"] as const;
export const MAGICIAN_TYPE_KEYS = ["fullmage", "aspectedmage"] as const;
export const ASPECT_KEYS = ["conjurer", "sorcerer", "elementalist", "custom"] as const;
export const RESISTANCE_ATTRIBUTE_KEYS = ["willpower", "charisma", "intelligence"] as const;
export const TRADITION_KEYS = ["hermetic", "shamanic", "other"] as const;
