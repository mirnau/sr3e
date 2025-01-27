import Log from "../../../Log.js";
import { getResizeObserver } from "./getResizeObserver.js";

/**
 * Observes and manages the resizing behavior for the masonry layout.
 * Sets up the observer to trigger grid adjustments on resize.
 * @param {Object} masonryResizeConfig - Configuration for the masonry layout.
 * @returns {ResizeObserver} - The resize observer instance.
 */
export function observeMasonryResize(masonryResizeConfig, isMainGrid = false) {
  const {
    jQueryObject,          // The jQuery object representing the sheet
    parentSelector,
    childSelector,
    gridSizerSelector,
    gutterSizerSelector,
    app
  } = masonryResizeConfig;

  const $grid = jQueryObject.find(parentSelector);

  Log.info("Grid", observeMasonryResize.name, $grid);

  // Store it back into the config so adjustMasonryOnResize can see it
  masonryResizeConfig.grid = $grid;

  const rawGrid = $grid[0]; // The raw DOM node
  if (!rawGrid) {
    Log.warn("No matching grid found in jQuery object", observeMasonryResize.name);
    return;
  }

  // If there's no masonryInstance, create one
  if (!rawGrid.masonryInstance) {
    const masonryInstance = new Masonry(rawGrid, {
      itemSelector: childSelector,
      columnWidth: gridSizerSelector,
      gutter: gutterSizerSelector,
      fitWidth: true
    });

    rawGrid.masonryInstance = masonryInstance;

    // Optionally watch layoutComplete
    if (isMainGrid) {
      masonryInstance.on("layoutComplete", function () {
        // do something if needed
      });
    }

    // The resize callback
    let resizeHandler = () => {
      adjustMasonryOnResize(masonryResizeConfig);
    };

    // If this is the "main" grid, also run the layoutStateMachine
    if (isMainGrid) {
      resizeHandler = () => {
        adjustMasonryOnResize(masonryResizeConfig);
        layoutStateMachine(app, $grid);
      };
    }

    // Attach the observer
    masonryResizeConfig.observer = getResizeObserver(masonryInstance, rawGrid, resizeHandler);
  }

  rawGrid.masonryInstance.layout();

  Log.success("Masonry Resize Observer Initialized", observeMasonryResize.name, masonryResizeConfig.observer);

  return masonryResizeConfig.observer;
}

/**
 * Adjusts grid items within the masonry layout on resize.
 * Ensures items fit perfectly within the parent container.
 * @param {Object} masonryResizeConfig - Configuration for the masonry layout.
 */
export function adjustMasonryOnResize(masonryResizeConfig) {
  const { grid, childSelector, gridSizerSelector, gutterSizerSelector } = masonryResizeConfig;
  // `grid` is a jQuery object
  if (!grid || !grid.length) return;

  const $gridItems = grid.find(childSelector);
  const $gridSizer = grid.find(gridSizerSelector);
  const $gutter = grid.find(gutterSizerSelector);

  if (!$gridSizer.length || !$gridItems.length) return;

  // Access the raw DOM nodes
  const rawGrid = grid[0];
  const rawSizer = $gridSizer[0];
  const rawGutter = $gutter[0];

  // Calculate sizes
  const parentPadding = parseFloat(getComputedStyle(rawGrid.parentNode).paddingLeft) || 0;
  const gridWidthPx = rawGrid.parentNode.offsetWidth - 2 * parentPadding;
  const gutterPx = parseFloat(getComputedStyle(rawGutter).width);
  const minItemWidthPx = parseFloat(getComputedStyle($gridItems[0]).minWidth);

  // Calculate columns
  let columnCount = Math.floor((gridWidthPx + gutterPx) / (minItemWidthPx + gutterPx));
  columnCount = Math.max(columnCount, 1);

  // Calculate item width
  const totalGutterWidthPx = gutterPx * (columnCount - 1);
  const itemWidthPx = (gridWidthPx - totalGutterWidthPx) / columnCount;
  const adjustedItemWidthPx = Math.floor(itemWidthPx);

  // Apply the new width to each item
  // jQuery .toArray() -> real array, so we can .forEach
  $gridItems.toArray().forEach((item) => {
    item.style.width = `${adjustedItemWidthPx}px`;
  });

  // Adjust the grid sizer
  rawSizer.style.width = `${adjustedItemWidthPx}px`;

  // Trigger layout if we have a masonry instance
  if (rawGrid.masonryInstance) {
    rawGrid.masonryInstance.layout();
  }
}

/**
 * Adjust sheet layout states using a jQuery object.
 * @param {ActorSheet} app - The Foundry sheet object
 * @param {JQuery} $html - jQuery object for the sheet's main container
 */
function layoutStateMachine(app, $html) {
  const sheetWidth = app.position?.width || 1400;
  const maxWidth = 1400;

  // Layout thresholds
  const lowerLimit = 0.5 * maxWidth;
  const middleLimit = 0.66 * maxWidth;

  // Determine layout state
  let layoutState = "small";
  if (sheetWidth > middleLimit) {
    layoutState = "wide";
  } else if (sheetWidth > lowerLimit) {
    layoutState = "medium";
  }

  // Column widths
  const columnWidthPercent = { small: 100, medium: 50, wide: 25 };
  const columnWidth = columnWidthPercent[layoutState];

  // Apply a custom CSS variable on the raw element
  const rawHtml = $html[0]; // raw DOM node
  rawHtml.style.setProperty("--column-width", `${columnWidth}%`);

  // Grab components with jQuery
  const $twoSpan = $html.find(".two-span-selectable");
  const $threeSpan = $html.find(".three-span-selectable");

  // We can convert them to arrays if we want .forEach:
  const twoSpanArray = $twoSpan.toArray();
  const threeSpanArray = $threeSpan.toArray();

  // Adjust widths
  switch (layoutState) {
    case "small":
      twoSpanArray.forEach((c) => c.style.width = `var(--column-width)`);
      threeSpanArray.forEach((c) => c.style.width = `var(--column-width)`);
      break;
    case "medium":
      twoSpanArray.forEach((c) => c.style.width = `calc(2 * var(--column-width) - 10px)`);
      threeSpanArray.forEach((c) => c.style.width = `var(--column-width)`);
      break;
    case "wide":
      twoSpanArray.forEach((c) => c.style.width = `calc(2 * var(--column-width) - 10px)`);
      threeSpanArray.forEach((c) => c.style.width = `calc(3 * var(--column-width) - 20px)`);
      break;
  }
}