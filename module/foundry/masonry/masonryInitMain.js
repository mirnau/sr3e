import { observeMasonryResize } from "../services/observeMasonryLayout.js";

export function initializeMasonryLayout(masonryResizeConfig) {

    const actor = masonryResizeConfig.app.actor;

    if (actor.mainLayoutResizeObserver) {
        actor.mainLayoutResizeObserver.disconnect();
        actor.mainLayoutResizeObserver = null;
    }

    actor.mainLayoutResizeObserver?.disconnect();
    actor.mainLayoutResizeObserver = observeMasonryResize(masonryResizeConfig, true);
}