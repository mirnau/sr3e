// useMasonry.js
import Masonry from "masonry-layout";

export function setupMasonry({
  container,
  itemSelector,
  gridSizerSelector,
  gutterSizerSelector,
  minItemWidth = 220,
  stateMachineThresholds = { small: 0, medium: 800, wide: 1100 },
  onLayoutStateChange = () => {},
}) {
  if (!container) return () => {};

  const form = container.parentElement;

  const getLayoutState = (w) => {
    if (w > stateMachineThresholds.wide) return "wide";
    if (w > stateMachineThresholds.medium) return "medium";
    return "small";
  };

  const applyWidths = () => {
    const style = getComputedStyle(form);
    const parentPadding = parseFloat(style.paddingLeft) || 0;
    const parentWidth = form.offsetWidth - 2 * parentPadding;

    const gutterEl = container.querySelector(gutterSizerSelector);
    const gutterPx = gutterEl ? parseFloat(getComputedStyle(gutterEl).width) : 20;

    const firstItem = container.querySelector(itemSelector);
    const minItem = firstItem ? parseFloat(getComputedStyle(firstItem).minWidth) || minItemWidth : minItemWidth;

    let columnCount = Math.max(Math.floor((parentWidth + gutterPx) / (minItem + gutterPx)), 1);

    const totalGutter = gutterPx * (columnCount - 1);
    const itemWidth = Math.floor((parentWidth - totalGutter) / columnCount);

    container.querySelectorAll(itemSelector).forEach((item) => {
      item.style.width = `${itemWidth}px`;
    });

    const sizer = container.querySelector(gridSizerSelector);
    if (sizer) sizer.style.width = `${itemWidth}px`;

    const state = getLayoutState(parentWidth);
    onLayoutStateChange(state);
  };

  const msnry = new Masonry(container, {
    itemSelector,
    columnWidth: gridSizerSelector,
    gutter: gutterSizerSelector,
    percentPosition: true,
  });

  const resizeObserver = new ResizeObserver(() => {
    applyWidths();
    msnry.reloadItems();
    msnry.layout();
  });

  resizeObserver.observe(form);

  const itemObservers = [];
  container.querySelectorAll(itemSelector).forEach((item) => {
    const obs = new ResizeObserver(() => {
      msnry.reloadItems();
      msnry.layout();
    });
    obs.observe(item);
    itemObservers.push(obs);
  });

  // Initial apply
  applyWidths();
  msnry.reloadItems();
  msnry.layout();

  return () => {
    resizeObserver.disconnect();
    itemObservers.forEach((obs) => obs.disconnect());
    msnry.destroy();
  };
}
