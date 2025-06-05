import Masonry from "masonry-layout";

export function setupMasonry({
  container,
  itemSelector,
  gridSizerSelector,
  gutterSizerSelector,
  minItemWidth = 220,
  onLayoutStateChange = () => {},
}) {
  if (!container) return () => {};

  const form = container.parentElement;

  const getLayoutState = (columnCount) => {
    if (columnCount >= 3) return "wide";
    if (columnCount === 2) return "medium";
    return "small";
  };

  const applySpanWidths = (columnCount, itemWidth, gutterPx) => {
    const items = container.querySelectorAll(itemSelector);

    items.forEach((el) => {
      const spanMatch = el.className.match(/span-(\d)/);
      const span = spanMatch ? parseInt(spanMatch[1]) : 1;
      const spanWidth = itemWidth * span + gutterPx * (span - 1);
      el.style.width = `${spanWidth}px`;
    });

    const state = getLayoutState(columnCount);
    onLayoutStateChange(state);
  };

  const applyWidths = () => {
    const style = getComputedStyle(form);
    const parentPadding = parseFloat(style.paddingLeft) || 0;
    const parentWidth = form.offsetWidth - 2 * parentPadding;

    const gutterEl = container.querySelector(gutterSizerSelector);
    const gutterPx = gutterEl ? parseFloat(getComputedStyle(gutterEl).width) : 20;

    const firstItem = container.querySelector(itemSelector);
    const minItem = firstItem ? parseFloat(getComputedStyle(firstItem).minWidth) || minItemWidth : minItemWidth;

    const columnCount = Math.max(Math.floor((parentWidth + gutterPx) / (minItem + gutterPx)), 1);
    const totalGutter = gutterPx * (columnCount - 1);
    const itemWidth = Math.floor((parentWidth - totalGutter) / columnCount);

    const sizer = container.querySelector(gridSizerSelector);
    if (sizer) sizer.style.width = `${itemWidth}px`;

    applySpanWidths(columnCount, itemWidth, gutterPx);
  };

  const msnry = new Masonry(container, {
    itemSelector,
    columnWidth: gridSizerSelector,
    gutter: gutterSizerSelector,
    percentPosition: true,
  });

  const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(() => {
      applyWidths();
      msnry.reloadItems();
      msnry.layout();
    });
  });

  resizeObserver.observe(form);

  const itemObservers = [];
  container.querySelectorAll(itemSelector).forEach((item) => {
    const obs = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        msnry.reloadItems();
        msnry.layout();
      });
    });
    obs.observe(item);
    itemObservers.push(obs);
  });

  setTimeout(() => {
    applyWidths();
    msnry.reloadItems();
    msnry.layout();
  }, 100);

  const cleanup = () => {
    resizeObserver.disconnect();
    itemObservers.forEach((obs) => obs.disconnect());
    msnry.destroy();
  };

  return { masonryInstance: msnry, cleanup };
}
