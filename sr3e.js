import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import { sr3e } from "./module/foundry/config.js";
import {
  hooks,
  flags
} from "./module/foundry/services/commonConsts.js";
import { injectFooterIntoWindowApp } from "./module/foundry/hooks/renderApplicationV2/injectFooterIntoWindowApp.js";

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
  docs.unregisterSheet(Item, "core", "ItemSheetV2");
}

function configureThemes() {
  game.settings.register("sr3e", "theme", {
    name: "Theme",
    hint: "Choose a UI theme.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "chummer": "Chummer",
      "steel": "Steel"
    },
    default: "chummer"
  });

  Hooks.on("ready", () => {
    const theme = game.settings.get("sr3e", "theme");
    document.body.classList.remove("theme-chummer", "theme-steel");
    document.body.classList.add(`theme-${theme}`);
  });
}

function registerHooks() {

  console.log("TESTING BEGINNING");
  ////// TESTING ONLY //////

    
  ///// TEST END ////
  console.log("TESTING ENDING");
  
  Hooks.on(hooks.renderApplicationV2, injectFooterIntoWindowApp);

  Hooks.once(hooks.init, () => {
    
    configureProject();
    configureThemes();

    registerDocumentTypes({
      args: [
        { docClass: Actor, type: "character", model: CharacterModel, sheet: CharacterActorSheet },

      ]
    });

    Log.success("Initialization Completed", "sr3e.js");
  });
}

registerHooks();