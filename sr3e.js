import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import MagicModel from "./module/models/item/MetahumanModel.js";
import MetahumanModel from "./module/models/item/MetahumanModel.js";
import MagicItemSheet from "./module/foundry/sheets/MagicItemSheet.js";
import MetahumanItemSheet from "./module/foundry/sheets/MagicItemSheet.js";
import MetahumanApp from "./module/svelte/apps/MetahumanApp.svelte";
import { mount, unmount } from "svelte";
import { sr3e } from "./module/foundry/config.js";
import {
  hooks,
  flags
} from "./module/foundry/services/commonConsts.js";
import { initMainMasonryGrid } from "./module/foundry/hooks/characterActorSheet/hooksRenderCharacterActorSheet.js";
import { closeMainMasonryGrid } from "./module/foundry/hooks/characterActorSheet/hooksCloseMainMasonryGrid.js";
import { renderCharacterCreationDialog } from "./module/foundry/hooks/characterActorSheet/hooksCharacterCreationDialog.js";

function onRenderMetahumanItemSheet(app, html, data) {

  if (app.svelteApp) {
    unmount(app.svelteApp);
  }

  const container = app.element[0].querySelector(".window-content");

  container.innerHTML = '';

  app.svelteApp = mount(MetahumanApp, {
    target: container,
    props: {
      item: app.item,
      config: CONFIG.sr3e,
    },
  });
}

function onCloseMetahumanItemSheet(app, html, data) {

  if (app.svelteApp) {
    unmount(app.svelteApp);
  }
}

function registerHooks() {

  Hooks.on(hooks.createActor, renderCharacterCreationDialog);
  Hooks.on(hooks.renderCharacterActorSheet, initMainMasonryGrid);
  Hooks.on(hooks.closeCharacterActorSheet, closeMainMasonryGrid);

  Hooks.on(hooks.renderMetahumanItemSheet, onRenderMetahumanItemSheet);
  Hooks.on(hooks.closeMetahumanItemSheet, onCloseMetahumanItemSheet); 


  Hooks.on(hooks.preCreateActor, (doc, actor, options, userId) => {
    if (actor.type === "character") { 
      options.renderSheet = false;
    }
  });

  

  Hooks.once(hooks.init, () => {

    configureProject();

    registerActorTypes([
      { type: "character", model: CharacterModel, sheet: CharacterActorSheet },
    ]);

    registerItemTypes([
      { type: "metahuman", model: MetahumanModel, sheet: MetahumanItemSheet },
      { type: "magic", model: MagicModel, sheet: MagicItemSheet},
    ]);

    Log.success("Initialization Completed", "sr3e.js");

  });
}

registerHooks();

function configureProject() {
  CONFIG.sr3e = sr3e;
  CONFIG.Actor.dataModels = {};
  CONFIG.Item.dataModels = {};
  CONFIG.canvasTextStyle.fontFamily= "VT323";
  CONFIG.defaultFontFamily = "VT323";

  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);
}

function registerActorTypes(actorsTypes) {
  actorsTypes.forEach(({ type, model, sheet }) => {
    CONFIG.Actor.dataModels[type] = model;
    Actors.registerSheet(flags.sr3e, sheet, { types: [type], makeDefault: true });
  });
}

function registerItemTypes(itemTypes) {
  itemTypes.forEach(({ type, model, sheet }) => {
    CONFIG.Item.dataModels[type] = model;
    Items.registerSheet(flags.sr3e, sheet, { types: [type], makeDefault: true });
  });
}