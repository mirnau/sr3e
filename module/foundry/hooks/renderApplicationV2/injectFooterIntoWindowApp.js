export function injectFooterIntoWindowApp(app, element, ctx, data) {
  const typeSelectors = [
    { type: foundry.applications.sheets.ActorSheetV2, selector: ".actor-footer" },
    { type: foundry.applications.sheets.ItemSheetV2, selector: ".item-footer" },
    //{ type: foundry.applications.api.DocumentSheetV2, selector: ".document-footer" }
  ];

  const match = typeSelectors.find(entry => app instanceof entry.type);
  if (!match) return;

  const el = element?.nodeType === 1 ? element : element?.[0];
  if (!el) return;

  // Use the dynamic selector for the footer
  if (el.querySelector(match.selector)) return;

  const isNested = el.parentElement?.closest('.application') !== null;
  if (isNested) return;

  const footer = document.createElement('div');
  footer.classList.add(match.selector.replace('.', ''));

  const resizeHandle = el.querySelector('.window-resize-handle');
  if (resizeHandle?.parentNode) {
    resizeHandle.parentNode.insertBefore(footer, resizeHandle.nextSibling);
  } else {
    el.appendChild(footer);
  }
}
