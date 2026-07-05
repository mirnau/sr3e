import CharacterModel from "./module/models/actors/CharacterModel";
import BroadcasterModel from "./module/models/actors/BroadcasterModel";
import GameMasterScreenModel from "./module/models/actors/GameMasterScreenModel";
import MechanicalModel from "./module/models/actors/MechanicalModel";
import { sr3e } from "./lang/config";
import { configkeys, hooks, typekeys } from "./types/configuration-keys";
import CharacterActorSheet from "./module/sheets/actors/CharacterSheet";
import BroadcasterSheet from "./module/sheets/actors/BroadcasterSheet";
import GameMasterScreenSheet from "./module/sheets/actors/GameMasterScreenSheet";
import MechanicalSheet from "./module/sheets/actors/MechanicalSheet";
import SR3EActor from "./module/documents/SR3EActor";
import SR3EItem from "./module/documents/SR3EItem";
import SR3ECombat from "./module/documents/SR3ECombat";
import { getNewsService } from "./module/services/news-service/NewsService.svelte";
import MetatypeModel from "./module/models/items/MetatypeModel";
import MetatypeSheet from "./module/sheets/items/MetatypeSheet";
import SkillSheet from "./module/sheets/items/SkillSheet";
import WeaponModel from "./module/models/items/WeaponModel";
import WeaponSheet from "./module/sheets/items/WeaponSheet";
import AmmunitionModel from "./module/models/items/AmmunitionModel";
import AmmunitionSheet from "./module/sheets/items/AmmunitionSheet";
import WearableModel from "./module/models/items/WearableModel";
import WearableSheet from "./module/sheets/items/WearableSheet";
import TransactionModel from "./module/models/items/TransactionModel";
import TransactionSheet from "./module/sheets/items/TransactionSheet";
import MagicModel from "./module/models/items/MagicModel";
import MagicSheet from "./module/sheets/items/MagicSheet";
import SpellModel from "./module/models/items/SpellModel";
import SpellSheet from "./module/sheets/items/SpellSheet";
import FocusModel from "./module/models/items/FocusModel";
import FocusSheet from "./module/sheets/items/FocusSheet";
import GadgetModel from "./module/models/items/GadgetModel";
import GadgetItemSheet from "./module/sheets/items/GadgetItemSheet";
import MedicalModel from "./module/models/items/MedicalModel";
import MedicalSheet from "./module/sheets/items/MedicalSheet";
import VehicleControlRigModel from "./module/models/items/VehicleControlRigModel";
import VehicleControlRigSheet from "./module/sheets/items/VehicleControlRigSheet";
import CyberdeckModel from "./module/models/items/CyberdeckModel";
import CyberdeckSheet from "./module/sheets/items/CyberdeckSheet";
import MatrixProgramModel from "./module/models/items/MatrixProgramModel";
import MatrixProgramSheet from "./module/sheets/items/MatrixProgramSheet";
import { preCreateCharacterActor, patchActorCreateDialog } from "./module/foundry/hooks/displayCharacterCreationDialog";
import SkillModel from "./module/models/items/SkillModel";
import SR3Edie from "./module/foundry/documents/SR3Edie";
import { registerSocketHandlers, registerCombatTurnHook, registerPoolRefreshHook } from "./module/services/combat/orchestration/socketHandlers";
import { registerChatMessageHTMLHook } from "./module/foundry/hooks/chatMessageHTML";
import { registerMedicalTokenDropHook } from "./module/services/medical/applyMedical";
import { registerPurchaseTokenDropHook } from "./module/services/economy/purchaseTokenDropHook";
import { registerSellerMutationRelay } from "./module/services/economy/sellerMutationRelay";
import { registerDebtRepaymentRelay } from "./module/services/economy/debtRepaymentRelay";
import { registerWindowFocusDimHook } from "./module/foundry/hooks/windowFocusDim";
import { registerSustainedSpellCleanupHook } from "./module/services/spells/sustainedSpells";
import { registerDebtInterestHook } from "./module/services/economy/debtInterest";
import { registerDocumentTypeIconHooks } from "./module/foundry/documentTypeIcons";
import { registerSr3eDocumentTypeIcons } from "./module/foundry/registerSr3eDocumentTypeIcons";
import { registerVehicleControlRigEssenceHook } from "./module/foundry/vehicleControlRigEssence";
import { registerCyberdeckEssenceHook } from "./module/foundry/cyberdeckEssence";
import { applySheetColorSettings, registerSheetColorSettings } from "./module/services/settings/sheetColorSettings";
import { registerDicePoolVisibilitySettings } from "./module/services/settings/dicePoolVisibilitySettings";
import { applyRemSizeSetting, registerRemSizeSettings } from "./module/services/settings/remSizeSettings";


// Configure global aliases FIRST, before any model imports happen
function configure(): void {
   CONFIG.SR3E = sr3e;

   globalThis.localize = (key: string): string => game.i18n.localize(key);

   // Provide short aliases for frequently used Foundry constructors
   const { fields } = foundry.data;
   const abstracts = foundry.abstract;
   const documents = foundry.documents;

   Object.assign(globalThis, {
      BooleanField: fields.BooleanField,
      NumberField: fields.NumberField,
      StringField: fields.StringField,
      ArrayField: fields.ArrayField,
      SchemaField: fields.SchemaField,
      EmbeddedDataField: fields.EmbeddedDataField,
      HTMLField: fields.HTMLField,
      FilePathField: fields.FilePathField,
      TypeDataModel: abstracts.TypeDataModel,
      DataModel: abstracts.DataModel,
      BaseActor: documents.BaseActor,
      BaseItem: documents.BaseItem,
   });

   SR3EActor.Register();
   SR3EItem.Register();
   SR3ECombat.Register();
}

function registerDocumentTypes(registrations: SR3EDocumentRegistration[]): void {
   registrations.forEach(({ docClass, type, model, sheet }) => {
      const docName = docClass.name as keyof Pick<typeof CONFIG, 'Actor' | 'Item'>;
      CONFIG[docName].dataModels ||= {};
      CONFIG[docName].dataModels[type] = model as typeof DataModel;

      // Register ApplicationV2 sheets using DocumentSheetConfig
      // Type assertion needed as FoundryVTT types may not be fully updated
      (foundry.applications.apps.DocumentSheetConfig as any).registerSheet(
         docClass,
         configkeys.sr3e,
         sheet,
         {
            types: [type],
            makeDefault: true,
         }
      );
   });
}

async function registerHooks(): Promise<void> {
   console.log("SR3E | Registering system hooks");

   Hooks.once(hooks.init, async () => {
      // Configure custom fonts - must be done before 'setup' hook
      CONFIG.fontDefinitions = CONFIG.fontDefinitions || {};

      type FoundryFontDefinition = CONFIG.Font.Definition & { urls?: string[] };

      const vt323Fonts: FoundryFontDefinition[] = [
         {
            url: ["systems/sr3e/fonts/VT323/VT323-Regular.ttf"],
            urls: ["systems/sr3e/fonts/VT323/VT323-Regular.ttf"],
         }
      ];

      CONFIG.fontDefinitions["VT323"] = {
         editor: true,
         fonts: vt323Fonts,
      };

      const neonderthawFonts: FoundryFontDefinition[] = [
         {
            url: ["systems/sr3e/fonts/Neonderthaw/Neonderthaw-Regular.ttf"],
            urls: ["systems/sr3e/fonts/Neonderthaw/Neonderthaw-Regular.ttf"],
            weight: "700",
         }
      ];

      CONFIG.fontDefinitions["Neonderthaw"] = {
         editor: true,
         fonts: neonderthawFonts,
      };

      SR3Edie.Register();
      registerSheetColorSettings();
      registerRemSizeSettings();
      registerDicePoolVisibilitySettings();

      // Dynamic imports AFTER configure() has run

      registerDocumentTypes([
         {
            docClass: Actor,
            type: typekeys.character,
            model: CharacterModel,
            sheet: CharacterActorSheet,
         },
         {
            docClass: Actor,
            type: typekeys.broadcaster,
            model: BroadcasterModel,
            sheet: BroadcasterSheet,
         },
         {
            docClass: Actor,
            type: typekeys.gamemasterscreen,
            model: GameMasterScreenModel,
            sheet: GameMasterScreenSheet,
         },
         {
            docClass: Actor,
            type: typekeys.mechanical,
            model: MechanicalModel,
            sheet: MechanicalSheet,
         },
         {
            docClass: Item,
            type: typekeys.metatype,
            model: MetatypeModel,
            sheet: MetatypeSheet,
         },
         {
            docClass: Item,
            type: typekeys.skill,
            model: SkillModel,
            sheet: SkillSheet,
         },
         {
            docClass: Item,
            type: typekeys.weapon,
            model: WeaponModel,
            sheet: WeaponSheet,
         },
         {
            docClass: Item,
            type: typekeys.ammunition,
            model: AmmunitionModel,
            sheet: AmmunitionSheet,
         },
         {
            docClass: Item,
            type: typekeys.wearable,
            model: WearableModel,
            sheet: WearableSheet,
         },
         {
            docClass: Item,
            type: typekeys.transaction,
            model: TransactionModel,
            sheet: TransactionSheet,
         },
         {
            docClass: Item,
            type: typekeys.magic,
            model: MagicModel,
            sheet: MagicSheet,
         },
         {
            docClass: Item,
            type: typekeys.spell,
            model: SpellModel,
            sheet: SpellSheet,
         },
         {
            docClass: Item,
            type: typekeys.focus,
            model: FocusModel,
            sheet: FocusSheet,
         },
         {
            docClass: Item,
            type: typekeys.gadget,
            model: GadgetModel,
            sheet: GadgetItemSheet,
         },
         {
            docClass: Item,
            type: typekeys.medical,
            model: MedicalModel,
            sheet: MedicalSheet,
         },
         {
            docClass: Item,
            type: typekeys.vehiclecontrolrig,
            model: VehicleControlRigModel,
            sheet: VehicleControlRigSheet,
         },
         {
            docClass: Item,
            type: typekeys.cyberdeck,
            model: CyberdeckModel,
            sheet: CyberdeckSheet,
         },
         {
            docClass: Item,
            type: typekeys.matrixprogram,
            model: MatrixProgramModel,
            sheet: MatrixProgramSheet,
         },
      ] satisfies SR3EDocumentRegistration[]);

      CONFIG.Item.typeLabels = Object.fromEntries(
         Object.entries(CONFIG.SR3E.ITEM_TYPES).map(([key, token]) => [key, token as string])
      );
      CONFIG.Actor.typeLabels = Object.fromEntries(
         Object.entries(CONFIG.SR3E.ACTOR_TYPES).map(([key, token]) => [key, token as string])
      );
      registerSr3eDocumentTypeIcons();

      console.log("SR3E | CONFIG.SR3E initialized, localize() ready");
   });

   Hooks.once(hooks.ready, () => {
      applySheetColorSettings();
      applyRemSizeSetting();
      getNewsService();
      registerSocketHandlers();
      registerSellerMutationRelay();
      registerDebtRepaymentRelay();
      registerCombatTurnHook();
      registerPoolRefreshHook();
      registerWindowFocusDimHook();
      registerSustainedSpellCleanupHook();
      registerDebtInterestHook();

      console.log("SR3E | Ready");
   });

   registerChatMessageHTMLHook();
   registerMedicalTokenDropHook();
   registerPurchaseTokenDropHook();

   Hooks.on(hooks.preCreateActor, preCreateCharacterActor);
   registerDocumentTypeIconHooks();
   registerVehicleControlRigEssenceHook();
   registerCyberdeckEssenceHook();
   patchActorCreateDialog();
   console.log("SR3E | preCreateActor hook registered");

   // New scenes default to 1 meter per square (SR3E uses metric distances).
   // GMs can override per-scene as needed.
   Hooks.on("preCreateScene", (_scene: unknown, data: Record<string, unknown>) => {
      if (data.grid == null) data.grid = {};
      const grid = data.grid as Record<string, unknown>;
      if (grid.distance == null) grid.distance = 1;
      if (grid.units == null) grid.units = "m";
   });
}

// Execute in correct order
configure();
registerHooks();
