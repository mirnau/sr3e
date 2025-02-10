import Log from "./Log.js";
import CharacterModel from "./module/models/actor/CharacterModel.js";
import CharacterActorSheet from "./module/foundry/sheets/CharacterActorSheet.js";
import MagicModel from "./module/models/item/MetahumanModel.js";
import MetahumanModel from "./module/models/item/MetahumanModel.js";
import MagicItemSheet from "./module/foundry/sheets/MagicItemSheet.js";
import MetahumanItemSheet from "./module/foundry/sheets/MagicItemSheet.js";
import MetahumanApp from "./module/svelte/apps/MetahumanApp.svelte";
import UserSettings from "./module/svelte/apps/injections/UserSettings.svelte";
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

function wrapCharactersAndItemsForSidebar(app, html) {
html.find(".directory-item.document").each((_, el) => {
  let $el = $(el);
  let img = $el.find("img.thumbnail");
  let h4 = $el.find("h4.entry-name");

  // Get the entry ID
  let entryId = $el.attr("data-entry-id");

  // Determine the document type from the class attribute
  let docType = $el.hasClass("actor") ? "Actor" :
    $el.hasClass("item") ? "Item" : null;

  // If we couldn't determine a document type, skip
  if (!docType) return;

  // Wrap if not already wrapped
  if (img.length && h4.length && !img.parent().hasClass("directory-post")) {
    let wrapper = $('<div class="directory-post"></div>');
    wrapper.attr("data-entry-id", entryId);
    wrapper.attr("data-document-type", docType);

    img.add(h4).wrapAll(wrapper);
    console.log(`Wrapped elements in .directory-post with entry ID: ${entryId} (Type: ${docType})`);
  }
});

// Add a click callback to open the correct document sheet
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
  
  Hooks.on("renderChatMessage", setChatMessageColorFromActorColor);
  Hooks.on("renderChatMessage", addChatMessageShadow);

  Hooks.on("renderSidebarTab", wrapCharactersAndItemsForSidebar)
    

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


  ////////////////////////////

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