import Masonry from "masonry-layout";

export function setupMasonry({
  container,
  itemSelector,
  gridSizerSelector,
  gutterSizerSelector,
  minItemWidth = 220,
  onLayoutStateChange = () => { },
}) {
  if (!container) return () => { };

  const form = container.parentElement;

  const getLayoutState = (columnCount) => {
    if (columnCount >= 3) return "wide";
    if (columnCount === 2) return "medium";
    return "small";
  };

  const applySpanWidths = (columnCount, itemWidth, gutterPx) => {
    const twoSpan = container.querySelectorAll(".two-span-selectable");
    const threeSpan = container.querySelectorAll(".three-span-selectable");

    // Compute true span widths in px
    const twoSpanWidth = columnCount >= 2 ? itemWidth * 2 + gutterPx : itemWidth;
    const threeSpanWidth = columnCount >= 3 ? itemWidth * 3 + gutterPx * 2 : itemWidth;

    twoSpan.forEach((el) => {
      el.style.width = `${twoSpanWidth}px`;
    });

    threeSpan.forEach((el) => {
      el.style.width = `${threeSpanWidth}px`;
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

    container.querySelectorAll(itemSelector).forEach((item) => {
      item.style.width = `${itemWidth}px`;
    });

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

  // Initial apply
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