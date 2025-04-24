import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import { sr3e } from "./module/foundry/config.js";
import {
  hooks,
  flags
} from "./module/foundry/services/commonConsts.js";

const docs = foundry.applications.apps.DocumentSheetConfig;


function registerDocumentTypes({ args }) {
  args.forEach(({ docClass, type, model, sheet }) => {
    const docName = docClass.documentName;
    CONFIG[docName].dataModels ||= {};
    CONFIG[docName].dataModels[type] = model;
    docs.registerSheet(
      docClass,
      flags.sr3e,
      sheet,
      { types: [type], makeDefault: true }
    );
  });
}

function configureProject() {
  CONFIG.sr3e = sr3e;
  CONFIG.Actor.dataModels = {};
  CONFIG.Item.dataModels = {};
  CONFIG.canvasTextStyle.fontFamily = "VT323";
  CONFIG.defaultFontFamily = "VT323";

  docs.unregisterSheet(Actor, "core", "ActorSheetV2");
  docs.unregisterSheet(Item,  "core", "ItemSheetV2");
}

function registerHooks() {
  Hooks.once(hooks.init, () => {

    configureProject();

    registerDocumentTypes({
      args: [
        { docClass: Actor, type: "character", model: CharacterModel, sheet: CharacterActorSheet },
    
      ]
    });

    Log.success("Initialization Completed", "sr3e.js");
  });
}

registerHooks();
