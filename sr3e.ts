import { sr3e } from "./lang/config";

function registerHooks(): void {
   console.log("SR3E | Registering system hooks");

   // Initialize global utility functions
   Hooks.once('init', () => {
      // Initialize CONFIG.SR3E (merge to avoid clobbering on hot reload)
      CONFIG.SR3E = sr3e;

      // Define global localize helper for convenience
      // @ts-ignore - Intentionally adding to globalThis
      globalThis.localize = (key: string): string => game.i18n.localize(key);

      console.log("SR3E | CONFIG.SR3E initialized, localize() ready");
   });
}

registerHooks();
