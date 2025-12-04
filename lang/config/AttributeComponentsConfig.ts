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

export const MOVEMENT_KEYS = [
  "walking",
  "running"
] as const;

export const PROFILE_KEYS = [
  "names",
  "metaType",
  "age",
  "weight",
  "height",
  "quote",
  "isDetailsOpen",
] as const;

