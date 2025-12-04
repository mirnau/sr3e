declare global {
   type SR3EDocumentClass = typeof Actor | typeof Item;

   type SR3EDataModelConstructor = foundry.abstract.TypeDataModel.AnyConstructor;

   type SR3EDocumentRegistration<TDoc extends SR3EDocumentClass = SR3EDocumentClass> = {
      docClass: TDoc;
      type: string;
      model: SR3EDataModelConstructor;
      sheet: DocumentSheetV2;
   };
}

export {};
