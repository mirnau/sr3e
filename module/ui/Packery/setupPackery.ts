import PackeryModule from "packery";
import type { Packery as PackeryInstance, PackeryOptions } from "packery";

type PackeryCtor = new (element: Element, options?: PackeryConfig) => PackeryInstance;
type PackeryConfig = Omit<PackeryOptions, "columnWidth" | "gutter"> & {
   columnWidth?: number | string | Element;
   gutter?: number | string | Element;
   itemSelector?: string;
};

export function setupPackery({
   container,
   itemSelector,
   gridSizerSelector,
   gutterSizerSelector,
   minItemWidth = 220,
   onLayoutStateChange = () => {},
}: {
   container: HTMLElement;
   itemSelector: string;
   gridSizerSelector: string;
   gutterSizerSelector: string;
   minItemWidth?: number;
   onLayoutStateChange?: (state: "wide" | "medium" | "small") => void;
}): { packeryInstance: PackeryInstance; cleanup: () => void } {
   const form = container.parentElement ?? container;
   const getLayoutState = (columnCount: number): "wide" | "medium" | "small" => {
      if (columnCount >= 3) return "wide";
      if (columnCount === 2) return "medium";
      return "small";
   };

   const applyWidths = () => {
      const style = getComputedStyle(form);
      const parentPadding = parseFloat(style.paddingLeft) || 0;
      const parentWidth = form.offsetWidth - 2 * parentPadding;

      const gutterEl = container.querySelector<HTMLElement>(gutterSizerSelector);
      const gutterPx = gutterEl ? parseFloat(getComputedStyle(gutterEl).width) : 20;

      const firstItem = container.querySelector<HTMLElement>(itemSelector);
      const minItem = firstItem ? parseFloat(getComputedStyle(firstItem).minWidth) || minItemWidth : minItemWidth;

      const columnCount = Math.max(Math.floor((parentWidth + gutterPx) / (minItem + gutterPx)), 1);
      const oneColPX = Math.floor((parentWidth - gutterPx * (columnCount - 1)) / columnCount);
      const sizer = container.querySelector<HTMLElement>(gridSizerSelector);
      const containerPX = oneColPX * columnCount + gutterPx * (columnCount - 1);

      if (sizer) {
         const sizerPct = (oneColPX / containerPX) * 100;
         sizer.style.width = `${sizerPct}%`;
      }

      container.querySelectorAll<HTMLElement>(itemSelector).forEach((el) => {
         const m = el.className.match(/span-(\d)/);
         const span = m ? Number(m[1]) : 1;
         const spanPX = oneColPX * span + gutterPx * (span - 1);
         const spanPct = (spanPX / containerPX) * 100;
         el.style.width = `min(${spanPct}%, 100%)`;
      });

      onLayoutStateChange(getLayoutState(columnCount));
   };

   const PackeryClass = (PackeryModule as any).default ?? (PackeryModule as any as PackeryCtor);
   const options: PackeryConfig = {
      itemSelector,
      // Packery prefers real elements/numbers over selectors; resolve to elements when available.
      columnWidth: container.querySelector(gridSizerSelector) ?? gridSizerSelector,
      gutter: container.querySelector(gutterSizerSelector) ?? gutterSizerSelector,
      percentPosition: true,
   };

   const pckry = new PackeryClass(container, options);

   const scheduleLayout = () => {
      requestAnimationFrame(() => {
         applyWidths();
         pckry.reloadItems();
         pckry.layout();
      });
   };

   const resizeObserver = new ResizeObserver(scheduleLayout);
   resizeObserver.observe(form);

   const itemObservers: ResizeObserver[] = [];
   container.querySelectorAll<HTMLElement>(itemSelector).forEach((item) => {
      const obs = new ResizeObserver(() => {
         requestAnimationFrame(() => {
            pckry.reloadItems();
            pckry.layout();
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
               if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLElement && node.matches(itemSelector)) {
                  const obs = new ResizeObserver(scheduleLayout);
                  obs.observe(node);
                  itemObservers.push(obs);
                  shouldRelayout = true;
               }
            });
         }
      }

      if (shouldRelayout) {
         scheduleLayout();
      }
   });

   mutationObserver.observe(container, {
      childList: true,
      subtree: false, // Adjust to true if item containers are nested
   });

   const initialTimeout = window.setTimeout(() => {
      applyWidths();
      pckry.reloadItems();
      pckry.layout();
   }, 100);

   const cleanup = () => {
      resizeObserver.disconnect();
      itemObservers.forEach((obs) => obs.disconnect());
      mutationObserver.disconnect();
      clearTimeout(initialTimeout);
      pckry.destroy();
   };

   return { packeryInstance: pckry, cleanup };
}
