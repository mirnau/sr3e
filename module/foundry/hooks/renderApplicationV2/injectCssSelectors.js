export default function injectCssSelectors(app, element, ctx, data) {
  
  const header = element.querySelector(".window-header");
  if (!header) return;
   
  const typeSelectors = [
    { type: foundry.applications.api.DialogV2, tag: "dialog" },
    { type: foundry.applications.sheets.ActorSheetV2, tag: "actor" },
    { type: foundry.applications.sheets.ItemSheetV2, tag: "item" }
  ];
  
  for (const { type, tag } of typeSelectors) {
    if (app instanceof type) {
      header.classList.add(`sr3e-${tag}-header`);
      return;
    }
  }
  
  if (app instanceof foundry.applications.api.DocumentSheetV2) {
    header.classList.add("sr3e-document-header");
  }
}