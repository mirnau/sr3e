export const ATTRIBUTES_KEYS = [
  "attributes",
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
  "dicePools",
  "combat",
  "astral",
  "hacking",
  "control",
  "spell",
] as const;

export const HEALTH_KEYS = [
  "health",
  "stun",
  "physical",
  "overflow",
  "penalty",
  "isAlive",
  "miraculousSurvival",
  "light",
  "medium",
  "serious",
  "deadly",
  "revive",
  "reviveConfirm",
] as const;

export const KARMA_KEYS = [
  "karma",
  "goodKarma",
  "karmaPool",
  "karmaPoolCeiling",
  "pendingKarmaReward",
  "readyForCommit",
  "lifetimeKarma",
  "spentKarma",
] as const;

export const MOVEMENT_KEYS = [
  "movement",
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

