export const hooks = Object.freeze({
  init: "init",
  ready: "ready",
  preCreateActor: "preCreateActor",
  preCreateItem: "preCreateItem",
  createActor: "createActor",
} as const);

export const configkeys = Object.freeze({
  sr3e: "sr3e",
} as const);

export const typekeys = Object.freeze({
  character: "character",
  broadcaster: "broadcaster",
  gamemasterscreen: "gamemasterscreen",
  legacyStorytellerScreen: "storytellerscreen",
  mechanical: "mechanical",
  metatype: "metatype",
  skill: "skill",
  weapon: "weapon",
  ammunition: "ammunition",
  wearable: "wearable",
  transaction: "transaction",
  magic: "magic",
  spell: "spell",
  focus: "focus",
  gadget: "gadget",
  medical: "medical",
} as const);

export const flags = Object.freeze({
  hasAwakened: "hasAwakened"
} as const );
