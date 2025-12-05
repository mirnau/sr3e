import CharacterModel from "./module/models/actors/CharacterModel";
import { sr3e } from "./lang/config";
import { configkeys, hooks, typekeys } from "./types/configuration-keys";
import CharacterActorSheet from "./module/sheets/actors/CharacterSheet";
import SR3EActor from "./module/documents/SR3EActor";

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

      // Dynamic imports AFTER configure() has run

      registerDocumentTypes([
         {
            docClass: Actor,
            type: typekeys.character,
            model: CharacterModel,
            sheet: CharacterActorSheet,
         }
      ] satisfies SR3EDocumentRegistration[]
      );

      console.log("SR3E | CONFIG.SR3E initialized, localize() ready");
   });
}

// Execute in correct order
configure();
registerHooks();
