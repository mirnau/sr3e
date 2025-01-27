import { observeMasonryResize } from "../services/observeMasonryLayout.js";
import Log from "../../../Log.js";

export function initializeMasonryLayout(masonryResizeConfig) {

    const actor = masonryResizeConfig.app.actor;

    if (actor.mainLayoutResizeObserver) {
        // Also remove it from the rawGrid DOM node
        const rawGrid = actor.mainLayoutResizeObserver.masonryInstance.element;
        if (rawGrid.masonryInstance) {
          rawGrid.masonryInstance = null; 
        }
        actor.mainLayoutResizeObserver.masonryInstance.destroy();
        actor.mainLayoutResizeObserver.disconnect();
        actor.mainLayoutResizeObserver = null;
      
      }

    actor.mainLayoutResizeObserver = observeMasonryResize(masonryResizeConfig, true);
}