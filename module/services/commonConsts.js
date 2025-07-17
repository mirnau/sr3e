export const hooks = {
  renderCharacterActorSheet: "renderCharacterActorSheet",
  closeCharacterActorSheet: "closeCharacterActorSheet",
  renderMetatypeItemSheet: "renderMetatypeItemSheet",
  closeMetatypeItemSheet: "closeMetatypeItemSheet",
  renderSidebarTab: "renderSidebarTab",
  preCreateActor: "preCreateActor",
  renderChatMessageHTML: "renderChatMessageHTML",
  renderChatLog: "renderChatLog",
  createActor: "createActor",
  init: "init",
  ready: "ready",
  renderApplicationV2: "renderApplicationV2",
  renderChatMessageHTML: "renderChatMessageHTML"
};

export const flags = {
  sr3e: "sr3e",
  core: "core",
  actor: {
    isCharacterCreation: "isCharacterCreation",
    isShoppingState: "isShoppingState",
    isDossierDetailsOpen: "isDossierDetailsOpen",
    hasAwakened: "hasAwakened",
    burntOut: "burntOut",
    attributeAssignmentLocked: "attributeAssignmentLocked",
    persistanceBlobCharacterSheetSize: "persistanceBlobCharacterSheetSize",
    shouldDisplaySheen: "shouldDisplaySheen"
  },
  effect: {
    contributes: "contributes"
  }
};

export const masonryMinWidthFallbackValue = {
  characterSheet: 12,
  attributeGrid: 13,
  skillCategoryGrid: 10,
  skillGrid: 4.5,
}

export const inventory = {
  arsenal: "arsenal",
  garage: "garage",
  effects: "effects"
}