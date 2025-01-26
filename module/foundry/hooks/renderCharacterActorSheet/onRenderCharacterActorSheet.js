import Log from "../../../../Log";
import CharacterActorSheet from "../../sheets/CharacterActorSheet.js";
import CharacterSheetApp from "../../../svelte/apps/CharacterSheetApp.svelte";
import { mount } from "svelte";

export function initMainMasonryGrid(app, html, data) {
  if (!(app instanceof CharacterActorSheet)) return;

  const container = document.querySelector(".window-content");

  container.innerHTML = '';

  app.svelteApp = mount(CharacterSheetApp, {
      target: container,
      props: {
        app: app,
        config: CONFIG.sr3e,
        jQueryObject: html
      },
    });

  Log.success("Svelte App Initialized", CharacterActorSheet.name);
}

export function closeMainMasonryGrid(app) {
  if (!(app instanceof CharacterActorSheet)) return;

  if (app.svelteApp) {
    console.info("Actor", CharacterActorSheet.name, app.actor.mainLayoutResizeObserver);

    app.actor.mainLayoutResizeObserver?.disconnect();
    app.actor.mainLayoutResizeObserver = null;

    console.info("Masonry observer disconnected.", CharacterActorSheet.name);
    app.svelteApp.$destroy();
    app.svelteApp = null;

    console.info("Svelte App Destroyed.", CharacterActorSheet.name);
  }
}