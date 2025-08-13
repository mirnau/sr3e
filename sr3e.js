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
import { addOpposedResponseButton } from "@hooks/renderChatMessageHTML/addOpposedResponseButton.js";
import { addResistDamageButton } from "@hooks/renderChatMessageHTML/addResistDamageButton.js";

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

function chain(...fns) {
   return (...args) => {
      for (const fn of fns) fn?.(...args);
   };
}

function registerHooks() {
   Hooks.on(
      hooks.renderChatMessageHTML,
      chain(wrapChatMessage, applyAuthorColorToChatMessage, addResistDamageButton, addOpposedResponseButton)
   );

   Hooks.on(hooks.renderApplicationV2, chain(wrapApplicationContent, injectCssSelectors));
   Hooks.on(hooks.preCreateActor, chain(setFlagsOnCharacterPreCreate, stopDefaultCharacterSheetRenderOnCreation));
   Hooks.on(hooks.createActor, chain(debugFlagsOnActor, displayCreationDialog));
   Hooks.on(hooks.ready, initializeNewsService);
   Hooks.on(hooks.dropCanvasData, handleCanvasItemDrop);

   const DEBUG = false;
   if (DEBUG) {
      Hooks.once(hooks.ready, enableDebugHooks);
   }

   Hooks.once(hooks.init, initializeSystem);
}

registerHooks();