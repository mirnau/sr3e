import { flags } from "@services/commonConsts.js";

export function registerDocumentTypes({ args }) {
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
