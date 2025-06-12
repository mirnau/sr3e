export const hooks = {
  renderCharacterActorSheet: "renderCharacterActorSheet",
  closeCharacterActorSheet: "closeCharacterActorSheet",
  renderMetahumanItemSheet: "renderMetahumanItemSheet",
  closeMetahumanItemSheet: "closeMetahumanItemSheet",
  renderSidebarTab: "renderSidebarTab",
  preCreateActor: "preCreateActor",
  renderChatMessageHTML: "renderChatMessageHTML",
  renderChatLog: "renderChatLog",
  createActor: "createActor",
  init: "init",
  ready: "ready",
  renderApplicationV2: "renderApplicationV2"
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
    persistanceBlobCharacterSheetSize: "persistanceBlobCharacterSheetSize"
  }
};

export const tags = {
  skill: {
    active: "active",
    knowledge: "knowledge",
    language: "language",
    activeTab: "activeTab",
    knowledgeTab: "knowledgeTab",
    languageTab: "languageTab"
  }
}

export const masonryMinWidthFallbackValue = {
  characterSheet: 12,
  attributeGrid: 13,
  skillCategoryGrid: 10,
  skillGrid: 4.5,
}