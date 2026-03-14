export const hooks = Object.freeze({
  init: "init",
  ready: "ready",
  preCreateActor: "preCreateActor",
  createActor: "createActor",
} as const);

export const configkeys = Object.freeze({
  sr3e: "sr3e",
} as const);

export const typekeys = Object.freeze({
  character: "character",
  broadcaster: "broadcaster",
  storytellerscreen: "storytellerscreen",
  metatype: "metatype",
  skill: "skill"
} as const);

export const flags = Object.freeze({
  hasAwakened: "hasAwakened"
} as const );