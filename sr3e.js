import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import SR3EJournalEntry from "./module/foundry/sheets/SR3EJournalEntry.js";
import SR3EJournalEntryPage from "./module/foundry/sheets/SR3EJournalEntryPage.js";
import { sr3e } from "./module/foundry/config.js";
import {
  hooks,
  flags
} from "./module/foundry/services/commonConsts.js";
import { injectFooterIntoWindowApp } from "./module/foundry/hooks/renderApplicationV2/injectFooterIntoWindowApp.js";
import injectCssSelectors from "./module/foundry/hooks/renderApplicationV2/injectCssSelectors.js";

const { DocumentSheetConfig } = foundry.applications.apps;
const { JournalEntrySheet } = foundry.applications.sheets.journal;

function registerDocumentTypes({ args }) {
  args.forEach(({ docClass, type, model, sheet }) => {
    const docName = docClass.documentName;
    CONFIG[docName].dataModels ||= {};
    CONFIG[docName].dataModels[type] = model;
    DocumentSheetConfig.registerSheet(
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

  DocumentSheetConfig.unregisterSheet(Actor, flags.core, "ActorSheetV2");
  DocumentSheetConfig.unregisterSheet(Item, flags.core, "ItemSheetV2");
  //DocumentSheetConfig.unregisterSheet(JournalEntry, flags.core, JournalEntrySheet);
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

  Hooks.on(hooks.renderApplicationV2, (app, element, ctx, data) => {
    const typeSelectors = [
      { type: foundry.applications.api.DialogV2 },
      //{ type: foundry.applications.api.DocumentSheetV2 },
      // { type: foundry.applications.sheets.FolderConfig }
    ];
  
    const typeDeselectors = [
      { type: foundry.applications.sheets.ActorSheetV2 },
      { type: foundry.applications.sheets.ItemSheetV2 }
    ];
  
    if (typeDeselectors.some(entry => app instanceof entry.type)) return;
    if (!typeSelectors.some(entry => app instanceof entry.type)) return;
    if (element.classList.contains("sheet-component")) return;
  
    element.classList.add("sheet-component");
  
    const sr3einnerbackgroundcontainer = document.createElement("div");
    sr3einnerbackgroundcontainer.classList.add("sr3e-inner-background-container");
  
    const fakeShadow = document.createElement("div");
    fakeShadow.classList.add("fake-shadow");
  
    const sr3einnerbackground = document.createElement("div");
    sr3einnerbackground.classList.add("sr3e-inner-background");
  
    while (element.firstChild) {
      sr3einnerbackground.appendChild(element.firstChild);
    }
  
    sr3einnerbackgroundcontainer.appendChild(fakeShadow);
    sr3einnerbackgroundcontainer.appendChild(sr3einnerbackground);
    element.appendChild(sr3einnerbackgroundcontainer);
  });
  

  ///// TEST END ////
  console.log("TESTING ENDING");

  Hooks.on(hooks.renderApplicationV2, injectFooterIntoWindowApp);
  Hooks.on(hooks.renderApplicationV2, injectCssSelectors);
  
  Hooks.once(hooks.init, () => {

    configureProject();
    configureThemes();

    registerDocumentTypes({
      args: [
        { docClass: Actor, type: "character", model: CharacterModel, sheet: CharacterActorSheet },

      ]
    });

    // NOTE This is the Journal itself
    DocumentSheetConfig.registerSheet(JournalEntry, flags.sr3e, SR3EJournalEntry, {
      label: 'SR3E Journal Entry',
      makeDefault: true
    });

    
    DocumentSheetConfig.registerSheet(JournalEntryPage, flags.sr3e, SR3EJournalEntryPage, {
      label: 'SR3E Journal Entry Page',
      makeDefault: true
    });
    

    Log.success("Initialization Completed", "sr3e.js");
  });
}

registerHooks();