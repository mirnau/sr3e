import Log from "./Log.js";
import { sr3e } from "./module/foundry/config.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import { 
  closeMainMasonryGrid, 
  initMainMasonryGrid } from "./module/foundry/hooks/renderCharacterActorSheet/onRenderCharacterActorSheet.js";

const hooks = {
  renderCharacterActorSheet: "renderCharacterActorSheet",
  closeCharacterActorSheet: "closeCharacterActorSheet",
  init: "init",
  ready: "ready"
}

function registerHooks() {

  Hooks.on(hooks.renderCharacterActorSheet, initMainMasonryGrid);
  Hooks.on(hooks.closeCharacterActorSheet, closeMainMasonryGrid);


  Hooks.once(hooks.init, () => {

    CONFIG.sr3e = sr3e;

    Actors.unregisterSheet("core", ActorSheet);

    CONFIG.Actor.dataModels = {
      "character": CharacterModel,
    };

    Actors.registerSheet("sr3e", CharacterActorSheet, { types: ["character"], makeDefault: true });

    Log.success("Hooks Registered", "sr3e.js");
    Log.success("Initialization Completed", "sr3e.js");

  });
}

registerHooks();