import Log from "../../../../Log.js";
import CharacterActorSheet from "../../sheets/CharacterActorSheet.js";
import CharacterSheetApp from "../../../svelte/apps/CharacterSheetApp.svelte";
import NeonName  from "../../../svelte/apps/injections/NeonName.svelte"
import { mount, unmount } from "svelte";

export function initMainMasonryGrid(app, html, data) {

  if(app.svelteApp) {
    unmount(app.svelteApp);
  }

  if(app.neonInjection) {
    unmount(app.neonInjection);
  }
  
  _initSheet(app);
  _injectNeonName(app);
}

function _initSheet(app) {
  const container = app.element[0].querySelector(".window-content");

  container.innerHTML = '';

  app.svelteApp = mount(CharacterSheetApp, {
    target: container,
    props: {
      app: app,
      config: CONFIG.sr3e,
      jQueryObject: app.element
    },
  });

  Log.success("Svelte App Initialized", CharacterActorSheet.name);
}

function _injectNeonName(app) {
  const header = app.element[0].querySelector("header.window-header");
  const placeholder = document.createElement("div");
  placeholder.classList.add("neon-name-position");
  header.insertAdjacentElement("afterend", placeholder);


  app.neonInjection =  mount(NeonName, {
    target: placeholder,
    props: {
      actor: app.actor,
    },
  })

  Log.success("Neon Name Initialized", CharacterActorSheet.name);
}