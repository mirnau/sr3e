export function injectFooterIntoWindowApp(app, element, ctx, data) {
  const rawTypes = [
    foundry.applications.api.DialogV2,
    foundry.applications.sheets.ActorSheetV2,
    foundry.applications.sheets.ItemSheetV2,
    foundry.applications.sheets.JournalSheetV2,
    foundry.applications.sheets.CardsSheetV2,
  ];

  const allowedTypes = rawTypes.filter(t => typeof t === "function");

  if (!allowedTypes.some(type => app instanceof type)) return;

  const el = element?.nodeType === 1 ? element : element?.[0];
  if (!el) return;

  if (el.querySelector('.window-app-footer')) return;

  const isNested = el.parentElement?.closest('.application') !== null;
  if (isNested) return;

  const footer = document.createElement('div');
  footer.classList.add('window-app-footer');

  const resizeHandle = el.querySelector('.window-resize-handle');
  if (resizeHandle?.parentNode) {
    resizeHandle.parentNode.insertBefore(footer, resizeHandle.nextSibling);
  } else {
    el.appendChild(footer);
  }
}
