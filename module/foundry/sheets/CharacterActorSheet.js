
export default class CharacterActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sr3e', 'sheet', 'character'],
      template: "systems/sr3e/default.html",
      left: 200,  
      top: 200,  
    });
  }
}