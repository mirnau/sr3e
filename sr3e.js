import Log from "@services/Log.js";

import CharacterModel from "@models/actor/CharacterModel.js";
import StorytellerScreenModel from "@models/actor/StorytellerScreenModel.js";
import BroadcasterModel from "@models/actor/BroadcasterModel.js";
import MetatypeModel from "@models/item/MetatypeModel.js";
import MagicModel from "@models/item/MagicModel.js";
import WeaponModel from "@models/item/WeaponModel.js";
import AmmunitionModel from "@models/item/AmmunitionModel.js";
import SkillModel from "@models/item/SkillModel.js";
import TransactionModel from "@models/item/TransactionModel.js";
import GadgetModel from "@models/item/GadgetModel.js";
import FocusModel from "@models/item/FocusModel.js";
import TechInterfaceModel from "@models/item/TechInterfaceModel.js";
import SpellModel from "@models/item/SpellModel.js";
import WearableModel from "@models/item/WearableModel.js";
import WearableItemSheet from "@sheets/WearableItemSheet.js";

import CharacterActorSheet from "@sheets/CharacterActorSheet.js";
import MetatypeItemSheet from "@sheets/MetatypeItemSheet.js";
import MagicItemSheet from "@sheets/MagicItemSheet.js";
import WeaponItemSheet from "@sheets/WeaponItemSheet.js";
import AmmunitionItemSheet from "@sheets/AmmunitionItemSheet.js";
import SkillItemSheet from "@sheets/SkillItemSheet.js";
import TransactionItemSheet from "@sheets/TransactionItemSheet.js";
import StorytellerScreenActorSheet from "@sheets/StorytellerScreenActorSheet.js";
import BroadcasterActorSheet from "@sheets/BroadcasterActorSheet.js";
import GadgetItemSheet from "@sheets/GadgetItemSheet.js";
import FocusItemSheet from "@sheets/FocusItemSheet.js";
import TechInterfaceItemSheet from "@sheets/TechInterfaceItemSheet.js";
import SpellItemSheet from "@sheets/SpellItemSheet.js";

import { sr3e } from "@config/config.js";

import { hooks, flags } from "@services/commonConsts.js";
import { localize } from "@services/utilities.js";
import { getNewsService, broadcastNews } from "@services/NewsService.svelte.js";
import OpposeRollService from "@services/OpposeRollService.js";

import injectCssSelectors from "@hooks/renderApplicationV2/injectCssSelectors.js";
import { attachLightEffect } from "@hooks/renderApplicationV2/attachLightEffect.js";
import displayCreationDialog from "@hooks/createActor/displayCreationDialogHook.js";
import stopDefaultCharacterSheetRenderOnCreation from "@hooks/preCreateActor/stopDefaultCharacterSheetRenderOnCreation.js";

import SR3EActor from "@documents/SR3EActor.js";
import SR3EItem from "@documents/SR3EItem.js";
import SR3ECombat from "@documents/SR3ECombat.js";
import SR3Edie from "@documents/SR3Edie.js";
import SR3ERoll from "@documents/SR3ERoll.js";
import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";

import CharacterCreationDialogApp from "@apps/dialogs/CharacterCreationDialogApp.svelte";
import { mount, unmount } from "svelte";

import { debugActorPoolUpdates, debugAECreate } from "@root/DebugHookFuncs.js";

const { DocumentSheetConfig } = foundry.applications.apps;

function registerDocumentTypes({ args }) {
   args.forEach(({ docClass, type, model, sheet }) => {
      const docName = docClass.documentName;
      CONFIG[docName].dataModels ||= {};
      CONFIG[docName].dataModels[type] = model;
      DocumentSheetConfig.registerSheet(docClass, flags.sr3e, sheet, {
         types: [type],
         makeDefault: true,
      });
   });
}

function configureProject() {
   SR3EActor.Register();
   SR3ECombat.Register();
   SR3Edie.Register();
   SR3ERoll.Register();
   SR3EItem.Register();

   CONFIG.sr3e = sr3e;
   CONFIG.Actor.dataModels = {};
   CONFIG.Item.dataModels = {};
   CONFIG.canvasTextStyle.fontFamily = "VT323";
   CONFIG.defaultFontFamily = "VT323";
   CONFIG.fontDefinitions["Neanderthaw"] = {
      editor: true,
      fonts: [
         {
            urls: ["systems/sr3e/fonts/Neonderthaw/Neonderthaw-Regular.ttf"],
            weight: 400,
            style: "normal",
         },
      ],
   };

   CONFIG.fontDefinitions["VT323"] = {
      editor: true,
      fonts: [
         {
            urls: ["systems/sr3e/fonts/VT323/VT323-Regular.ttf"],
            weight: 400,
            style: "normal",
         },
      ],
   };

   CONFIG.Actor.typeLabels = {
      broadcaster: localize(CONFIG.sr3e.broadcaster.broadcaster),
      character: localize(CONFIG.sr3e.sheet.playercharacter),
      storytellerscreen: localize(CONFIG.sr3e.storytellerscreen.storytellerscreen),
   };
   CONFIG.Item.typeLabels = {
      ammunition: localize(CONFIG.sr3e.ammunition.ammunition),
      magic: localize(CONFIG.sr3e.magic.magic),
      metatype: localize(CONFIG.sr3e.traits.metatype),
      skill: localize(CONFIG.sr3e.skill.skill),
      transaction: localize(CONFIG.sr3e.transaction.transaction),
      weapon: localize(CONFIG.sr3e.weapon.weapon),
      gadget: localize(CONFIG.sr3e.gadget.gadget),
   };

   DocumentSheetConfig.unregisterSheet(Actor, flags.core, "ActorSheetV2");
   DocumentSheetConfig.unregisterSheet(Item, flags.core, "ItemSheetV2");
}

function setupMouseLightSourceEffect(includedThemes) {
   Hooks.on(hooks.renderApplicationV2, (app, html) => {
      const activeTheme = game.settings.get("sr3e", "theme");
      console.log("active theme", activeTheme);
      if (includedThemes.includes(activeTheme)) {
         attachLightEffect(html, activeTheme);
      }
   });
}

function configureThemes() {
   game.settings.register("sr3e", "theme", {
      name: "Theme",
      hint: "Choose a UI theme.",
      scope: "world",
      config: true,
      type: String,
      choices: { defaultDark: "Chummer Dark", defaultLight: "Chummer Light" },
      default: "defaultDark",
   });
   Hooks.on("ready", () => {
      const theme = game.settings.get("sr3e", "theme");
      document.body.classList.remove("theme-chummer", "theme-steel");
      document.body.classList.add(`theme-${theme}`);
   });

   setupMouseLightSourceEffect(["defaultDark", "defaultLight"]);
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

function configureQueries() {
   CONFIG.queries ??= {};
   CONFIG.queries["sr3e.opposeRollPrompt"] = async ({ contestId, initiatorId, targetId, rollData, options }) => {
      console.log("[sr3e] Received opposeRollPrompt query", { contestId, initiatorId, targetId });

      const initiator = game.actors.get(initiatorId);
      const target = game.actors.get(targetId);

      if (!initiator || !target) {
         console.warn("[sr3e] Could not resolve actors for opposeRollPrompt");
         return;
      }

      OpposeRollService.registerContest({
         contestId,
         initiator,
         target,
         rollData,
         options,
      });

      // Re-render any associated chat message
      const msg = game.messages.find((m) => m.flags?.sr3e?.opposed === contestId);
      if (msg) msg.render(true);

      return { acknowledged: true }; // Future use
   };

   CONFIG.queries["sr3e.resolveOpposedRoll"] = async ({ contestId, rollData }) => {
      return OpposeRollService.resolveTargetRoll(contestId, rollData);
   };

   CONFIG.queries["sr3e.resolveOpposedRollRemote"] = async ({ contestId, rollData, initiatorId }) => {
      console.log(`[sr3e] Received resolveOpposedRollRemote on ${game.user.name}`, { contestId });

      return CONFIG.queries["sr3e.resolveOpposedRoll"]({
         contestId,
         rollData,
      });
   };

   CONFIG.queries["sr3e.abortOpposedRoll"] = async ({ contestId }) => {
      console.warn(`[sr3e] Received abortOpposedRoll for ${contestId}`);

      const contest = OpposeRollService.getContestById(contestId);
      if (!contest) return;

      OpposeRollService.abortOpposedRoll(contestId);

      const msg = game.messages.find((m) => m.flags?.sr3e?.opposed === contestId);
      if (msg) msg.render(true);
   };
}

function setFlagsOnCharacterPreCreate(document, data, options, userId) {
   // Define your flags array
   const flagsToSet = [
      {
         namespace: flags.sr3e,
         flag: flags.actor.isCharacterCreation,
         value: true,
      },
      { namespace: flags.sr3e, flag: flags.actor.hasAwakened, value: false },
      { namespace: flags.sr3e, flag: flags.actor.burntOut, value: false },
      {
         namespace: flags.sr3e,
         flag: flags.actor.attributeAssignmentLocked,
         value: false,
      },
      {
         namespace: flags.sr3e,
         flag: flags.actor.persistanceBlobCharacterSheetSize,
         value: {},
      },
      { namespace: flags.sr3e, flag: flags.actor.isShoppingState, value: true },
   ];

   // Build the update object by looping through the array
   const updateData = {};
   flagsToSet.forEach(({ namespace, flag, value }) => {
      updateData[`flags.${namespace}.${flag}`] = value;
   });

   // Apply all flags at once
   document.updateSource(updateData);
}

function debugFlagsOnActor(actor, options, userId) {
   const actorFlags = actor.flags?.[flags.sr3e];
   if (!actorFlags) return console.warn("No sr3e flags found on actor:", actor);

   console.groupCollapsed(`Flags for actor "${actor.name}"`);
   for (const [key, value] of Object.entries(actorFlags)) {
      console.log(`→ ${key}:`, value);
   }
   console.groupEnd();
}

function wrapChatMessage(message, html, context) {
   const isPopup = context?.canClose && !context?.canDelete;
   const wrapper = document.createElement("div");
   const dynamicBackground = document.createElement("div");
   const dynamicMessage = document.createElement("div");

   wrapper.classList.add("chat-message-wrapper");
   dynamicBackground.classList.add("chat-message-dynamic-background");
   dynamicMessage.classList.add("chat-message-dynamic");

   dynamicMessage.append(...html.childNodes);

   wrapper.append(dynamicBackground);
   wrapper.append(dynamicMessage);

   html.innerHTML = "";
   html.appendChild(wrapper);
}

function applyAuthorColorToChatMessage(message, html, context) {
   const color = message.author?.color;
   if (color) {
      html.style.setProperty("--author-color", color);
   }
}

function registerHooks() {
   Hooks.on(hooks.renderApplicationV2, (app, element) => {
      if (element.firstElementChild?.classList.contains("sheet-component")) return;

      //Note: to find classes, just walk the namespace

      const typeSelectors = [
         { type: foundry.applications.api.DialogV2 },
         { type: foundry.applications.api.CategoryBrowser },
         { type: foundry.applications.api.DocumentSheetV2 },
         { type: foundry.applications.api.CategoryBrowser },
         { type: foundry.applications.sheets.journal.JournalEntryPageSheet },
         { type: foundry.applications.sheets.ActiveEffectConfig },
         { type: foundry.applications.sheets.AdventureImporterV2 },
         { type: foundry.applications.sheets.AmbientLightConfig },
         { type: foundry.applications.sheets.AmbientSoundConfig },
         { type: foundry.applications.sheets.CardConfig },
         { type: foundry.applications.sheets.CardDeckConfig },
         { type: foundry.applications.sheets.CardHandConfig },
         { type: foundry.applications.sheets.CardPileConfig },
         { type: foundry.applications.sheets.CardsConfig },
         { type: foundry.applications.sheets.CombatantConfig },
         { type: foundry.applications.sheets.DrawingConfig },
         { type: foundry.applications.sheets.FolderConfig },
         { type: foundry.applications.sheets.MacroConfig },
         { type: foundry.applications.sheets.MeasuredTemplateConfig },
         { type: foundry.applications.sheets.NoteConfig },
         { type: foundry.applications.sheets.PlaylistConfig },
         { type: foundry.applications.sheets.PlaylistSoundConfig },
         { type: foundry.applications.sheets.PrototypeTokenConfig },
         { type: foundry.applications.sheets.RegionBehaviorConfig },
         { type: foundry.applications.sheets.RegionConfig },
         { type: foundry.applications.sheets.RollTableSheet },
         { type: foundry.applications.sheets.SceneConfig },
         { type: foundry.applications.sheets.TableResultConfig },
         { type: foundry.applications.sheets.TileConfig },
         { type: foundry.applications.sheets.TokenConfig },
         { type: foundry.applications.sheets.UserConfig },
         { type: foundry.applications.sheets.WallConfig },
         { type: foundry.applications.apps.CombatTrackerConfig },
         { type: foundry.applications.apps.FilePicker },
         { type: foundry.applications.apps.PermissionConfig },
         { type: foundry.applications.apps.ImagePopout },
         { type: foundry.applications.apps.DocumentOwnershipConfig },
         { type: foundry.applications.apps.CombatTrackerConfig },
         { type: foundry.applications.apps.CompendiumArtConfig },
         { type: foundry.applications.apps.DocumentSheetConfig },
         { type: foundry.applications.apps.GridConfig },
         { type: foundry.applications.apps.av.CameraPopout },
         { type: foundry.applications.apps.av.CameraViews },
         { type: foundry.applications.sidebar.apps.ControlsConfig },
         { type: foundry.applications.sidebar.apps.ModuleManagement },
         { type: foundry.applications.sidebar.apps.WorldConfig },
         { type: foundry.applications.sidebar.apps.ToursManagement },
         { type: foundry.applications.sidebar.apps.SupportDetails },
         { type: foundry.applications.sidebar.apps.InvitationLinks },
         { type: foundry.applications.sidebar.apps.FolderExport },
         { type: foundry.applications.settings.SettingsConfig },
      ];

      const typeDeselectors = [
         { type: foundry.applications.sheets.ActorSheetV2 },
         { type: foundry.applications.sheets.ItemSheetV2 },
      ];

      if (typeDeselectors.some((entry) => app instanceof entry.type)) return;
      if (!typeSelectors.some((entry) => app instanceof entry.type)) return;

      wrapContent(element);
   });

   Hooks.on(hooks.preCreateActor, setFlagsOnCharacterPreCreate);
   Hooks.on(hooks.createActor, debugFlagsOnActor);

   //INFO: Character Creation Hooks
   Hooks.on(hooks.preCreateActor, stopDefaultCharacterSheetRenderOnCreation);
   Hooks.on(hooks.createActor, displayCreationDialog);

   //INFO: Fancy Decorations
   Hooks.on(hooks.renderApplicationV2, injectCssSelectors);

   Hooks.on(hooks.renderChatMessageHTML, wrapChatMessage);
   Hooks.on(hooks.renderChatMessageHTML, applyAuthorColorToChatMessage);

   Hooks.on("ready", () => {
      getNewsService(); // forces initialization and sets CONFIG.sr3e.newsService
      const activeBroadcasters = game.actors.filter(
         (actor) => actor.type === "broadcaster" && actor.system.isBroadcasting
      );

      activeBroadcasters.forEach((actor) => {
         const headlines = actor.system.rollingNews ?? [];
         broadcastNews(actor.name, headlines);
      });
   });

   Hooks.on("dropCanvasData", async (_canvas, data) => {
      if (data.type !== "Item") return;

      const { x, y } = data;
      const targetToken = canvas.tokens.placeables.find((t) => t.bounds.contains(x, y));
      if (!targetToken) return;

      const item = await fromUuid(data.uuid);
      if (!item) return;

      const tokenDoc = targetToken.document;
      const worldActor = game.actors.get(tokenDoc.actorId);
      if (!worldActor) {
         console.warn("[SR3E] No base actor for token:", tokenDoc);
         return;
      }

      const confirmed = await foundry.applications.api.DialogV2.confirm({
         title: "Lend Item",
         content: `Transfer <strong>${item.name}</strong> to <strong>${worldActor.name}</strong>?`,
      });
      if (!confirmed) return;

      try {
         await worldActor.createEmbeddedDocuments("Item", [item.toObject()]);
         console.log("[SR3E] Item added to target:", worldActor.name);
         if (item.actor?.id !== worldActor.id) {
            await game.actors.get(item.actor.id).deleteEmbeddedDocuments("Item", [item.id]);
            console.log("[SR3E] Item removed from source:", item.actor.name);
         }
      } catch (err) {
         console.error("[SR3E] Transfer error:", err);
      }
   });

   Hooks.on("renderChatMessageHTML", async (message, html, data) => {
      const contestId = message.flags?.sr3e?.opposed;
      if (!contestId) return;

      const container = html.querySelector(".sr3e-response-button-container");
      if (!container) return;

      const btn = document.createElement("button");
      btn.classList.add("sr3e-response-button");
      btn.dataset.contestId = contestId;
      btn.innerText = game.i18n.localize("sr3e.chat.respond");

      const contest = OpposeRollService.getContestById(contestId);

      if (!contest) {
         btn.disabled = true;
         btn.title = game.i18n.localize("sr3e.chat.contestExpired");
         btn.classList.add("expired");
         container.appendChild(btn);
         return;
      }

      const actor = contest.target;
      const controllingUser = OpposeRollService.resolveControllingUser(actor);
      const isControllingUser = game.user.id === controllingUser?.id;
      const alreadyResponded = contest.targetRoll !== null || message.flags?.sr3e?.opposedResponded;

      if (!isControllingUser || alreadyResponded) return;

      btn.onclick = async () => {
         console.log(`[sr3e] Respond button clicked by ${game.user.name} for contest ${contestId}`);

         const contest = OpposeRollService.getContestById(contestId);

         if (!contest) {
            btn.disabled = true;
            btn.classList.add("expired");
            btn.innerText = game.i18n.localize("sr3e.chat.contestExpired");
            btn.title = game.i18n.localize("sr3e.chat.contestExpired");
            return;
         }

         btn.disabled = true;
         btn.classList.add("responded");
         btn.innerText = game.i18n.localize("sr3e.chat.responded");

         const actorSheet = contest.target.sheet;
         if (!actorSheet.rendered) await actorSheet.render(true);

         const caller = {
            key: contest.options.attributeName,
            type: contest.options.type,
            dice: 0,
            value: 0,
            responseMode: true,
            contestId,
         };

         actorSheet.setRollComposerData(caller);

         const rollData = await OpposeRollService.waitForResponse(contestId);

         await CONFIG.queries["sr3e.resolveOpposedRollRemote"]({
            contestId,
            rollData,
            initiatorId: contest.initiator.id,
         });
      };

      container.appendChild(btn);
   });

   Hooks.on("renderChatMessageHTML", (message, html) => {
      const flags = message.flags?.sr3e;
      if (!flags?.damageResistance) return;

      const container = html.querySelector(".sr3e-resist-damage-button");
      if (!container) {
         console.warn("[sr3e] Damage resistance container not found in HTML", html);
         return;
      }

      const button = document.createElement("button");
      button.textContent = game.i18n.localize("sr3e.resistDamage") || "Resist Damage";
      button.addEventListener("click", () => {
         try {
            const context = JSON.parse(decodeURIComponent(container.dataset.context));
            console.log("[sr3e] Resist button clicked", context);
            OpposeRollService.resolveDamageResistance(context);
         } catch (e) {
            console.error("[sr3e] Failed to parse damage resistance context", e);
         }
      });

      container.appendChild(button);
      console.log("[sr3e] Resist damage button injected into chat message");
   });

   const DEBUG = true;
   if (DEBUG) {
      Hooks.once("ready", () => {
         debugActorPoolUpdates();
         debugAECreate();
      });
   }

   Hooks.once(hooks.init, () => {
      configureProject();
      configureThemes();
      configureQueries();
      registerDocumentTypes({
         args: [
            {
               docClass: Actor,
               type: "character",
               model: CharacterModel,
               sheet: CharacterActorSheet,
            },
            {
               docClass: Actor,
               type: "storytellerscreen",
               model: StorytellerScreenModel,
               sheet: StorytellerScreenActorSheet,
            },
            {
               docClass: Actor,
               type: "broadcaster",
               model: BroadcasterModel,
               sheet: BroadcasterActorSheet,
            },
            {
               docClass: Item,
               type: "metatype",
               model: MetatypeModel,
               sheet: MetatypeItemSheet,
            },
            {
               docClass: Item,
               type: "magic",
               model: MagicModel,
               sheet: MagicItemSheet,
            },
            {
               docClass: Item,
               type: "weapon",
               model: WeaponModel,
               sheet: WeaponItemSheet,
            },
            {
               docClass: Item,
               type: "ammunition",
               model: AmmunitionModel,
               sheet: AmmunitionItemSheet,
            },
            {
               docClass: Item,
               type: "skill",
               model: SkillModel,
               sheet: SkillItemSheet,
            },
            {
               docClass: Item,
               type: "transaction",
               model: TransactionModel,
               sheet: TransactionItemSheet,
            },
            {
               docClass: Item,
               type: "gadget",
               model: GadgetModel,
               sheet: GadgetItemSheet,
            },
            {
               docClass: Item,
               type: "focus",
               model: FocusModel,
               sheet: FocusItemSheet,
            },
            {
               docClass: Item,
               type: "techinterface",
               model: TechInterfaceModel,
               sheet: TechInterfaceItemSheet,
            },
            {
               docClass: Item,
               type: "spell",
               model: SpellModel,
               sheet: SpellItemSheet,
            },
            {
               docClass: Item,
               type: "wearable",
               model: WearableModel,
               sheet: WearableItemSheet,
            },
         ],
      });

      Log.success("Initialization Completed", "sr3e.js");
   });
}

registerHooks();
