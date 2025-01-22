import Log from '../../../Log';
import CharacterSheetApp from '../../svelte/apps/CharacterSheetApp.svelte';

export default class CharacterActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['sr3e', 'sheet', 'character'],
      template: "/systems/sr3e/templates/sheet/actor/character-sheet.html",
      width: 800,
      height: 600,
    });
  }
}