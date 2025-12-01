import { flags } from "@services/commonConsts.js";

interface DocumentRegistrationArgs {
  docClass: typeof foundry.abstract.Document;
  type: string;
  model: typeof foundry.abstract.DataModel;
  sheet: typeof foundry.applications.api.ApplicationV2;
}

interface RegisterDocumentTypesOptions {
  args: DocumentRegistrationArgs[];
}

/**
 * Register document types (Actor/Item) with their data models and sheets.
 * @param options - Configuration object containing registration arguments
 */
export function registerDocumentTypes({ args }: RegisterDocumentTypesOptions): void {
  args.forEach(({ docClass, type, model, sheet }) => {
    const docName = docClass.documentName;
    CONFIG[docName].dataModels ||= {};
    CONFIG[docName].dataModels[type] = model;
    foundry.applications.apps.DocumentSheetConfig.registerSheet(docClass, flags.sr3e, sheet, {
      types: [type],
      makeDefault: true,
    });
  });
}
