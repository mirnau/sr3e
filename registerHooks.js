import displayCreationDialog from "@hooks/createActor/displayCreationDialogHook.js";
import stopDefaultCharacterSheetRenderOnCreation from "@hooks/preCreateActor/stopDefaultCharacterSheetRenderOnCreation.js";
import injectCssSelectors from "@hooks/renderApplicationV2/injectCssSelectors.js";
import BroadcasterModel from "@models/actor/BroadcasterModel.js";
import CharacterModel from "@models/actor/CharacterModel.js";
import StorytellerScreenModel from "@models/actor/StorytellerScreenModel.js";
import AmmunitionModel from "@models/item/AmmunitionModel.js";
import GadgetModel from "@models/item/GadgetModel.js";
import MagicModel from "@models/item/MagicModel.js";
import MetatypeModel from "@models/item/MetatypeModel.js";
import SkillModel from "@models/item/SkillModel.js";
import TransactionModel from "@models/item/TransactionModel.js";
import WeaponModel from "@models/item/WeaponModel.js";
import { hooks } from "@services/commonConsts.js";
import Log from "@services/Log.js";
import { getNewsService, broadcastNews } from "@services/NewsService.svelte.js";
import AmmunitionItemSheet from "@sheets/AmmunitionItemSheet.js";
import BroadcasterActorSheet from "@sheets/BroadcasterActorSheet.js";
import CharacterActorSheet from "@sheets/CharacterActorSheet.js";
import GadgetItemSheet from "@sheets/GadgetSheet.js";
import MagicItemSheet from "@sheets/MagicItemSheet.js";
import MetatypeItemSheet from "@sheets/MetatypeItemSheet.js";
import SkillItemSheet from "@sheets/SkillItemSheet.js";
import StorytellerScreenActorSheet from "@sheets/StorytellerScreenActorSheet.js";
import TransactionItemSheet from "@sheets/TransactionItemSheet.js";
import WeaponItemSheet from "@sheets/WeaponItemSheet.js";
import * as applications from "foundry/client-esm/applications/_module.mjs";
import * as utils from "foundry/client-esm/utils/_module.mjs";
import { wrapContent, setFlagsOnCharacterPreCreate, debugFlagsOnActor, wrapChatMessage, applyAuthorColorToChatMessage, configureProject, configureThemes, registerDocumentTypes } from "sr3e";
/**
 * Abstract class definitions for fundamental concepts used throughout the Foundry Virtual Tabletop framework.
 */

export import abstract = _abstract;

export function registerHooks() {
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

   function configurePrototypeItem() {
      const ItemClass = CONFIG.Item.documentClass;

      // Patch _initialize to inject embedded collection support
      const originalInit = ItemClass.prototype._initialize;
      ItemClass.prototype._initialize = function (data, context = {}) {
         const result = originalInit.call(this, data, context);

         // Only apply to certain item types if desired
         if (this.type !== "weapon") return result;

         // Create a dummy embedded collection of items
         this._embeddedItems = new foundry.abstract.EmbeddedCollection(CONFIG.Item.documentClass, [], this);

         // Optional: shortcut to access gadgets/etc
         Object.defineProperty(this, "items", {
            get() {
               return this._embeddedItems;
            },
         });

         // Hook into prepareEmbeddedDocuments to rehydrate children
         this.prepareEmbeddedDocuments = function () {
            const raw = this.getFlag("sr3e", "gadgets") ?? [];
            const docs = raw.map((data) => new CONFIG.Item.documentClass(data, { parent: this }));
            this._embeddedItems = new foundry.abstract.EmbeddedCollection(CONFIG.Item.documentClass, docs, this);
         };

         return result;
      };

      // Patch prepareData to apply embedded effects
      const originalPrepare = ItemClass.prototype.prepareData;
      ItemClass.prototype.prepareData = function () {
         originalPrepare.call(this);

         if (this.type !== "weapon") return;

         this.prepareEmbeddedDocuments?.();

         // Apply Active Effects from embedded items
         const effects = this.items.flatMap((i) => i.effects?.contents ?? []);
         for (const effect of effects) {
            if (!effect.transfer) continue;
            for (const change of effect.changes ?? []) {
               foundry.utils.setProperty(this.system, change.key, change.value);
            }
         }
      };
   }

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

   Hooks.once(hooks.init, () => {
      configurePrototypeItem();
      configureProject();
      configureThemes();
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
         ],
      });
      Log.success("Initialization Completed", "sr3e.js");
   });
}
