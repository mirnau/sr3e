import { createCategory } from "../config";

export const ATTRIBUTES_KEYS = [
  "body",
  "quickness",
  "strength",
  "charisma",
  "intelligence",
  "willpower",
  "reaction",
  "magic",
  "essence",
  "initiative",
  "isBurnedOut",
] as const;

export const CREATION_KEYS = [
  "attributePoints",
  "activePoints",
  "knowledgePoints",
  "languagePoints",
] as const;

export const DICE_POOLS_KEYS = [
  "combat",
  "astral",
  "hacking",
  "control",
  "spell",
] as const;

export const HEALTH_KEYS = [
  "stun",
  "physical",
  "overflow",
  "penalty",
  "isAlive",
] as const;

export const KARMA_KEYS = [
  "goodKarma",
  "karmaPool",
  "karmaPoolCeiling",
  "pendingKarmaReward",
  "readyForCommit",
  "lifetimeKarma",
  "spentKarma",
  "miraculousSurvival",
] as const;

export const MOVEMENT_KEYS = ["walking", "running"] as const;

export const PROFILE_KEYS = [
  "names",
  "metaType",
  "age",
  "weight",
  "height",
  "quote",
  "isDetailsOpen",
] as const;

export const ATTRIBUTES = createCategory("attributes", ATTRIBUTES_KEYS);
export const CREATION = createCategory("creation", CREATION_KEYS);
export const DICE_POOLS = createCategory("dicePools", DICE_POOLS_KEYS);
export const HEALTH = createCategory("health", HEALTH_KEYS);
export const KARMA = createCategory("karma", KARMA_KEYS);
export const MOVEMENT = createCategory("movement", MOVEMENT_KEYS);
export const PROFILE = createCategory("profile", PROFILE_KEYS);

// Type for extending Foundry's CONFIG.SR3E
export type SR3EConfig = {
  ATTRIBUTES: typeof ATTRIBUTES;
  CREATION: typeof CREATION;
  DICE_POOLS: typeof DICE_POOLS;
  HEALTH: typeof HEALTH;
  KARMA: typeof KARMA;
  MOVEMENT: typeof MOVEMENT;
  PROFILE: typeof PROFILE;
};