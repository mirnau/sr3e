import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import MagicModel from "./module/models/item/MetahumanModel.js";
import MetahumanModel from "./module/models/item/MetahumanModel.js";
import MagicItemSheet from "./module/foundry/sheets/MagicItemSheet.js";
import MetahumanItemSheet from "./module/foundry/sheets/MagicItemSheet.js";
import MetahumanApp from "./module/svelte/apps/MetahumanApp.svelte";
import UserSettings from "./module/svelte/apps/injections/UserSettings.svelte";
import PauseAnimation from "./module/svelte/apps/injections/PauseAnimation.svelte";
import { mount, unmount } from "svelte";
import { sr3e } from "./module/foundry/config.js";
import {
  hooks,
  flags
} from "./module/foundry/services/commonConsts.js";
import { initMainMasonryGrid } from "./module/foundry/hooks/characterActorSheet/hooksRenderCharacterActorSheet.js";
import { closeMainMasonryGrid } from "./module/foundry/hooks/characterActorSheet/hooksCloseMainMasonryGrid.js";
import { renderCharacterCreationDialog } from "./module/foundry/hooks/characterActorSheet/hooksCharacterCreationDialog.js";
import { onRenderMetahumanItemSheet, onCloseMetahumanItemSheet } from "./module/foundry/hooks/metahumanItemSheet/hooksRenderMetahumanItemSheet.js";



function haltCharacterSheetRender(doc, actor, options, userId) {
  if (actor.type === "character") {
    options.renderSheet = false;
  }
}

function setChatMessageColorFromActorColor(message, html, data) {
  const sender = game.users.get(message.author?.id);
  if (!sender) return;
  const senderColor = sender.color;
  html[0].style.setProperty("--message-color", senderColor);
}

function addChatMessageShadow(message, html, data) {
  // The actual chat message <li> element
  const chatMessage = html[0];
  if (!chatMessage) return;

  // Prevent multiple modifications
  if (chatMessage.querySelector(".inner-background-container")) return;

  // 1. Create the new structure
  const wrapper = document.createElement("div");
  wrapper.classList.add("inner-background-container");

  const fakeShadow = document.createElement("div");
  fakeShadow.classList.add("fake-shadow");

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  // 2. Move all existing content into messageContainer
  while (chatMessage.firstChild) {
    messageContainer.appendChild(chatMessage.firstChild);
  }

  // 3. Build the new structure inside the <li>
  wrapper.appendChild(fakeShadow);
  wrapper.appendChild(messageContainer);
  chatMessage.appendChild(wrapper);
}

function wrapSidebarItems(app, html) {
  html.find(".directory-item.document").each((_, el) => {
    let $el = $(el);
    let img = $el.find("img.thumbnail");
    let h4 = $el.find("h4.entry-name");

    // Get the entry ID
    let entryId = $el.attr("data-entry-id");

    // Determine the document type from the class attribute
    let docType = $el.hasClass("actor") ? "Actor" :
                  $el.hasClass("item") ? "Item" :
                  $el.hasClass("journalentry") ? "JournalEntry" :
                  $el.hasClass("cards") ? "Cards" :
                  $el.hasClass("playlist") ? "PlayList" :
                  $el.hasClass("rolltable") ? "RollTable" :
                  $el.hasClass("compendium") ? "Compendium" :
                  $el.hasClass("scene") ? "Scene" : null;

    // If we couldn't determine a document type, skip
    if (!docType) return;

    // Use h4 when available, otherwise, for Scene use the element itself
    let target = h4.length ? h4 : (docType === "Scene" ? $el : null);
    if (!target) return;
    if (target.parent().hasClass("directory-post")) return;

    // Create a new wrapper for the directory-post
    let wrapper = $('<div class="directory-post"></div>');
    wrapper.attr("data-entry-id", entryId);
    wrapper.attr("data-document-type", docType);

    if (img.length && target[0] !== $el[0]) {
      img.add(target).wrapAll(wrapper);
    } else {
      target.wrap(wrapper);
    }
    
    // For PlayList type, add sound-controls and playlist-button class into the wrapper
    let $wrapper = target.closest('.directory-post');
    if (docType.toLowerCase() === "playlist") {
      let existingControls = $el.find(".sound-controls.playlist-controls").first();
      if (existingControls.length) {
        $wrapper.append(existingControls);
        console.log("Moved existing sound-controls to playlist entry", entryId);
      }
      $wrapper.addClass("playlist-button");
    }
    
    console.log(`Wrapped .directory-post for entry ID: ${entryId} (Type: ${docType})`);
  });

  // Click callback remains the same, with added support for Scene
  html.on("click", ".directory-post", (event) => {
    event.preventDefault();

    let $target = $(event.currentTarget);
    let entryId = $target.data("entry-id");
    let docType = $target.data("document-type");
    let doc;

    if (docType === "Actor") {
      doc = game.actors.get(entryId);
    } else if (docType === "Item") {
      doc = game.items.get(entryId);
    } else if (docType === "JournalEntry") {
      doc = game.journal.get(entryId);
    } else if (docType === "RollTable") {
      doc = game.tables.get(entryId);
    } else if (docType === "Compendium") {
      doc = game.packs.get(entryId);
    } else if (docType === "Scene") {
      doc = game.scenes.get(entryId);
    } else {
      console.warn("Unsupported document type:", docType);
      return;
    }

    if (doc) {
      doc.sheet.render(true);
    } else {
      console.warn("Document not found for ID:", entryId);
    }
  });
}

function registerHooks() {

  Hooks.on(hooks.createActor, renderCharacterCreationDialog);
  Hooks.on(hooks.renderCharacterActorSheet, initMainMasonryGrid);
  Hooks.on(hooks.closeCharacterActorSheet, closeMainMasonryGrid);

  Hooks.on(hooks.renderMetahumanItemSheet, onRenderMetahumanItemSheet);
  Hooks.on(hooks.closeMetahumanItemSheet, onCloseMetahumanItemSheet);

  Hooks.on(hooks.preCreateActor, haltCharacterSheetRender);

  Hooks.on(hooks.renderChatMessage, setChatMessageColorFromActorColor);
  Hooks.on(hooks.renderChatMessage, addChatMessageShadow);

  Hooks.on(hooks.renderSidebarTab, wrapSidebarItems);

  Hooks.on(hooks.renderChatLog, () => {
    const uiRight = document.getElementById("ui-right");
    if (!uiRight) return;
    uiRight.classList.add("noise-layer");
  });



  ////////////////////////////
  Hooks.on("renderUserConfig", (app, html, data) => {

    html.classList.remove("application", "user-config");
    html.classList.add("app", "window-app", "sr3e", "item", "playerconfig");

    Log.info("Modified Player Configuration form to inherit styles", "Userconfig Hack");
  });


  // Replace Userconfig with CustomUserconfig
  Hooks.on("renderUserConfig", (app, form, data) => {

    if (app.svelteApp) {
      unmount(app.svelteApp);
    }

    const container = form.querySelector(".window-content");

    container.innerHTML = '';

    app.svelteApp = mount(UserSettings, {
      target: container,
      props: {
        app: app,
        config: CONFIG.sr3e,
      },
    });

    Log.success("Svelte App Initialized", "UserSettings");

  });

  Hooks.on("closeUserConfig", async (app, html, data) => {

    if (app.svelteApp) {
      unmount(app.svelteApp);
    }

    // Force update each message's HTML by re-rendering all chat messages
    for (let message of game.messages.contents) {
      ui.chat.updateMessage(message);
    }
  });

  ///////////////////////////////////////////////////


  Hooks.once(hooks.init, () => {

    configureProject();

    registerActorTypes([
      { type: "character", model: CharacterModel, sheet: CharacterActorSheet },
    ]);

    registerItemTypes([
      { type: "metahuman", model: MetahumanModel, sheet: MetahumanItemSheet },
      { type: "magic", model: MagicModel, sheet: MagicItemSheet },
    ]);

    Log.success("Initialization Completed", "sr3e.js");

  });
}

registerHooks();

function configureProject() {
  CONFIG.sr3e = sr3e;
  CONFIG.Actor.dataModels = {};
  CONFIG.Item.dataModels = {};
  CONFIG.canvasTextStyle.fontFamily = "VT323";
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