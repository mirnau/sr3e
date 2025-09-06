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
    const minItem = firstItem
      ? parseFloat(getComputedStyle(firstItem).minWidth) || minItemWidth
      : minItemWidth;

    const columnCount = Math.max(Math.floor((parentWidth + gutterPx) / (minItem + gutterPx)), 1);
    const oneColPX = Math.floor((parentWidth - gutterPx * (columnCount - 1)) / columnCount);

    const sizer = container.querySelector(gridSizerSelector);
    const containerPX = oneColPX * columnCount + gutterPx * (columnCount - 1);

    if (sizer) {
      const sizerPct = (oneColPX / containerPX) * 100;
      sizer.style.width = `${sizerPct}%`;
    }

    container.querySelectorAll(itemSelector).forEach(el => {
      const m = el.className.match(/span-(\d)/);
      const span = m ? +m[1] : 1;
      const spanPX = oneColPX * span + gutterPx * (span - 1);
      const spanPct = (spanPX / containerPX) * 100;
      el.style.width = `min(${spanPct}%, 100%)`;
    });

    const state = columnCount >= 3 ? 'wide' : columnCount === 2 ? 'medium' : 'small';
    onLayoutStateChange(state);
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

  const mutationObserver = new MutationObserver((mutationsList) => {
    let shouldRelayout = false;

    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.matches(itemSelector)) {
            const obs = new ResizeObserver(() => {
              requestAnimationFrame(() => {
                msnry.reloadItems();
                msnry.layout();
              });
            });
            obs.observe(node);
            itemObservers.push(obs);
            shouldRelayout = true;
          }
        });
      }
    }

    if (shouldRelayout) {
      requestAnimationFrame(() => {
        applyWidths();
        msnry.reloadItems();
        msnry.layout();
      });
    }
  });

  mutationObserver.observe(container, {
    childList: true,
    subtree: false, // Adjust to true if item containers are nested
  });

  setTimeout(() => {
    applyWidths();
    msnry.reloadItems();
    msnry.layout();
  }, 100);

  const cleanup = () => {
    resizeObserver.disconnect();
    itemObservers.forEach((obs) => obs.disconnect());
    mutationObserver.disconnect();
    msnry.destroy();
  };

  return { masonryInstance: msnry, cleanup };
}
