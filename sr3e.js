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

import { hooks, flags } from "@services/commonConsts.js";
import OpposeRollService from "@services/OpposeRollService.js";

import injectCssSelectors from "@hooks/renderApplicationV2/injectCssSelectors.js";
import displayCreationDialog from "@hooks/createActor/displayCreationDialogHook.js";
import stopDefaultCharacterSheetRenderOnCreation from "@hooks/preCreateActor/stopDefaultCharacterSheetRenderOnCreation.js";

import RollComposerComponent from "@sveltecomponent/RollComposerComponent.svelte";

import CharacterCreationDialogApp from "@apps/dialogs/CharacterCreationDialogApp.svelte";
import { mount, unmount } from "svelte";

import { debugActorPoolUpdates, debugAECreate } from "@root/DebugHookFuncs.js";

import "@registry/firearms.modes.js";
import "@registry/firearms.directives.js";
import "@registry/melee.directives.js";

import { configureThemes } from "./module/foundry/configure/configureThemes.js";
import { configureProject } from "./module/foundry/configure/configureProject.js";
import { configureQueries } from "./module/foundry/configure/configureQueries.js";
import { registerDocumentTypes } from "./module/foundry/configure/registerDocumentTypes.js";

import { handleCanvasItemDrop } from "@hooks/dropCanvasData/handleCanvasItemDrop.js";
import { wrapApplicationContent } from "@hooks/renderApplicationV2/wrapApplicationContent.js";
import { setFlagsOnCharacterPreCreate } from "@hooks/preCreateActor/setFlagsOnCharacterPreCreate.js";
import { applyAuthorColorToChatMessage } from "@hooks/renderChatMessageHTML/applyAuthorColorToChatMessage.js";
import { initializeNewsService } from "@hooks/ready/initializeNewsService.js";
import { wrapChatMessage } from "@hooks/renderChatMessageHTML/wrapChatMessage.js";

const { DocumentSheetConfig } = foundry.applications.apps;

function debugFlagsOnActor(actor, options, userId) {
   const actorFlags = actor.flags?.[flags.sr3e];
   if (!actorFlags) return console.warn("No sr3e flags found on actor:", actor);

   console.groupCollapsed(`Flags for actor "${actor.name}"`);
   for (const [key, value] of Object.entries(actorFlags)) {
      console.log(`→ ${key}:`, value);
   }
   console.groupEnd();
}

function addResistDamageButton(message, html) {
   const node = html.querySelector(".sr3e-resist-damage-button");
   if (!node || node.dataset.sr3eResistWired) return;

   node.dataset.sr3eResistWired = "1";

   const context = JSON.parse(decodeURIComponent(node.dataset.context || "%7B%7D"));
   const button = document.createElement("button");
   button.type = "button";
   button.className = "sr3e-resist";
   button.textContent = game.i18n.localize("sr3e.resist") || "Resist";

   button.addEventListener("click", async () => {
      const { contestId, initiatorId, defenderId, weaponId, prep } = context;

      const defender = game.actors.get(defenderId);
      if (!defender) throw new Error("sr3e: defender not found");

      const tn = Number(prep?.tn || 0) || 2;

      defender.sheet.setRollComposerData(
         {
            isResistingDamage: true,
            contestId,
            initiatorId,
            defenderId,
            weaponId,
            tn,
            prep,
            tnLabel: game.i18n.localize("sr3e.resistanceTN") || "Damage Resistance",
            explodes: true,
         },
         { visible: true }
      );
   });

   node.appendChild(button);
}

async function addOpposedResponseButton(message, html, data) {
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
}

function enableDebugHooks() {
   debugActorPoolUpdates();
   debugAECreate();
}

function initializeSystem() {
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
}

function registerHooks() {
   Hooks.on(hooks.renderApplicationV2, (app, element, data) => {
      wrapApplicationContent(app, element, data);
      injectCssSelectors(app, element, data);
   });

   Hooks.on(hooks.preCreateActor, (document, data, options, userId) => {
      setFlagsOnCharacterPreCreate(document, data, options, userId);
      stopDefaultCharacterSheetRenderOnCreation(document, data, options, userId);
   });

   Hooks.on(hooks.createActor, (actor, options, userId) => {
      debugFlagsOnActor(actor, options, userId);
      displayCreationDialog(actor, options, userId);
   });

   Hooks.on(hooks.renderChatMessageHTML, (message, html, data) => {
      wrapChatMessage(message, html, data);
      applyAuthorColorToChatMessage(message, html, data);
      addResistDamageButton(message, html, data);
      addOpposedResponseButton(message, html, data);
   });

   Hooks.on(hooks.ready, initializeNewsService);
   Hooks.on(hooks.dropCanvasData, handleCanvasItemDrop);

   const DEBUG = false;
   if (DEBUG) {
      Hooks.once(hooks.ready, enableDebugHooks);
   }

   Hooks.once(hooks.init, initializeSystem);
}

registerHooks();
