import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import MetahumanModel from "./module/models/item/MetahumanModel.js";
import MetahumanItemSheet from "./module/foundry/sheets/MetahumanItemSheet.js";
import MetahumanApp from "./module/svelte/apps/MetahumanApp.svelte";
import { mount, unmount } from "svelte";
import { sr3e } from "./module/foundry/config.js";
import { 
  hooks, 
  flags 
} from "./module/foundry/services/commonConsts.js";
import {
  closeMainMasonryGrid,
  initMainMasonryGrid
} from "./module/foundry/hooks/renderCharacterActorSheet/onRenderCharacterActorSheet.js";

function registerHooks() {

  Hooks.on(hooks.renderCharacterActorSheet, initMainMasonryGrid);
  Hooks.on(hooks.closeCharacterActorSheet, closeMainMasonryGrid);

  Hooks.on(hooks.renderMetahumanItemSheet, (app, html, data) => {

      if(app.svelteApp) {
        unmount(app.svelteApp);
      }

      let container = app.element[0].querySelector(".window-content");

      container.innerHTML = '';
  
      app.svelteApp = mount(MetahumanApp, {
        target: container,
        props: {
          item: app.item,
          config: CONFIG.sr3e,
        },
      });
  });

  Hooks.once(hooks.init, () => {
    
    configureProject();
    
    registerActorTypes([
      { type: "character", model: CharacterModel, sheet: CharacterActorSheet },
    ]);

    registerItemTypes([
      { type: "metahuman", model: MetahumanModel, sheet: MetahumanItemSheet },
    ]);
    
    Log.success("Initialization Completed", "sr3e.js");
    
  });
}

registerHooks();

function configureProject() {
  CONFIG.sr3e = sr3e;
  CONFIG.Actor.dataModels = {};
  CONFIG.Item.dataModels = {};

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