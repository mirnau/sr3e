import Log from "./Log.js";
import { sr3e } from "./module/foundry/config.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import { initActorFlags } from "./module/foundry/hooks/preCreateActor/onPreCreateActor.js";
import {
  closeMainMasonryGrid,
  initMainMasonryGrid
} from "./module/foundry/hooks/renderCharacterActorSheet/onRenderCharacterActorSheet.js";
import { hooks } from "./module/foundry/services/commonConsts.js";


function registerHooks() {

  //Hooks.on(hooks.ceateActor, initActorFlags);

  Hooks.on(hooks.renderCharacterActorSheet, initMainMasonryGrid);
  Hooks.on(hooks.closeCharacterActorSheet, closeMainMasonryGrid);

  Hooks.once(hooks.init, () => {

    console.log("✅ INIT Hook Fired: Registering Custom Sheets");

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