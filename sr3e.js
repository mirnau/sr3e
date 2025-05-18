import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import { sr3e } from "./module/foundry/config.js";
import { hooks, flags } from "./module/foundry/services/commonConsts.js";
import { injectFooterIntoWindowApp } from "./module/foundry/hooks/renderApplicationV2/injectFooterIntoWindowApp.js";
import injectCssSelectors from "./module/foundry/hooks/renderApplicationV2/injectCssSelectors.js";

const { DocumentSheetConfig } = foundry.applications.apps;

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
}

function configureThemes() {
  game.settings.register("sr3e", "theme", {
    name: "Theme",
    hint: "Choose a UI theme.",
    scope: "world",
    config: true,
    type: String,
    choices: { chummer: "Chummer", steel: "Steel" },
    default: "chummer"
  });
  Hooks.on("ready", () => {
    const theme = game.settings.get("sr3e", "theme");
    document.body.classList.remove("theme-chummer", "theme-steel");
    document.body.classList.add(`theme-${theme}`);
  });
}

function wrapContent(root) {

  if (!root || root.firstElementChild?.classList.contains("sheet-component")) return;

  const existing = Array.from(root.children);

  const sheetComponent = document.createElement("div");
  sheetComponent.classList.add("sheet-component");

  const innerContainer = document.createElement("div");
  innerContainer.classList.add("sr3e-inner-background-container");

  const fakeShadow = document.createElement("div");
  fakeShadow.classList.add("fake-shadow");

  const innerBackground = document.createElement("div");
  innerBackground.classList.add("sr3e-inner-background");

  // Instead of moving nodes, just rewrap in place
  innerBackground.append(...existing);
  innerContainer.append(fakeShadow, innerBackground);
  sheetComponent.append(innerContainer);

  root.appendChild(sheetComponent);
}



function registerHooks() {
  Hooks.on(hooks.renderApplicationV2, (app, element) => {
    if (element.firstElementChild?.classList.contains("sheet-component")) return;

    const typeSelectors = [
      { type: foundry.applications.api.DialogV2 },
      { type: foundry.applications.api.DocumentSheetV2 },
      { type: foundry.applications.apps.CombatTrackerConfig },
      { type: foundry.applications.sidebar.apps.ControlsConfig },
      { type: foundry.applications.sidebar.apps.ModuleManagement },
      { type: foundry.applications.sidebar.apps.WorldConfig },
      { type: foundry.applications.sidebar.apps.ToursManagement },
      { type: foundry.applications.sidebar.apps.SupportDetails },
      { type: foundry.applications.sidebar.apps.InvitationLinks },
      { type: foundry.applications.sheets.FolderConfig },
      { type: foundry.applications.settings.SettingsConfig },
      { type: foundry.applications.sheets.UserConfig }
    ];

    const typeDeselectors = [
      { type: foundry.applications.sheets.ActorSheetV2 },
      { type: foundry.applications.sheets.ItemSheetV2 }
    ];

    if (typeDeselectors.some(entry => app instanceof entry.type)) return;
    if (!typeSelectors.some(entry => app instanceof entry.type)) return;

     wrapContent(element);

  });

  Hooks.on(hooks.renderApplicationV2, injectFooterIntoWindowApp);
  Hooks.on(hooks.renderApplicationV2, injectCssSelectors);

  Hooks.once(hooks.init, () => {
    configureProject();
    configureThemes();
    registerDocumentTypes({
      args: [
        { docClass: Actor, type: "character", model: CharacterModel, sheet: CharacterActorSheet }
      ]
    });
    Log.success("Initialization Completed", "sr3e.js");
  });
}

registerHooks();


