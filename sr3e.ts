import CharacterModel from "./module/models/actors/CharacterModel";
import CharacterActorSheet from "./module/sheets/actors/CharacterSheet";
import { sr3e } from "./lang/config";
import { hooks } from "./types/configuration-keys";

function configure(): void {
   CONFIG.SR3E = sr3e;
   globalThis.localize = (key: string): string => game.i18n.localize(key);
}

function registerDocumentTypes(registrations: SR3EDocumentRegistration[]): void {
   registrations.forEach(({ docClass, type, model, sheet }) => {
      const docName = docClass.name as keyof Pick<typeof CONFIG, 'Actor' | 'Item'>;
      CONFIG[docName].dataModels ||= {};
      CONFIG[docName].dataModels[type] = model as typeof DataModel;

      DocumentSheetConfig.registerSheet(docClass, "sr3e", sheet, {
         types: [type],
         makeDefault: true,
      });
   });
}

function registerHooks(): void {
   console.log("SR3E | Registering system hooks");
   
   Hooks.once(hooks.init, () => {
      registerDocumentTypes([
         {
            docClass: Actor,
            type: "character",
            model: CharacterModel,
            sheet: CharacterActorSheet,
         }
      ] satisfies SR3EDocumentRegistration[]
      );

      console.log("SR3E | CONFIG.SR3E initialized, localize() ready");
   });
}

configure();
registerHooks();
