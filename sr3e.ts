import {
   ATTRIBUTES,
   CREATION,
   DICE_POOLS,
   HEALTH,
   KARMA,
   MOVEMENT,
   PROFILE
} from './lang/config/AttributeComponentsConfig';

function registerHooks(): void {
   console.log("SR3E | Registering system hooks");

   // Initialize global utility functions
   Hooks.once('init', () => {
      // Initialize CONFIG.SR3E (merge to avoid clobbering on hot reload)
      CONFIG.SR3E = {
         ...CONFIG.SR3E,  // Preserve any existing properties
         ATTRIBUTES,
         CREATION,
         DICE_POOLS,
         HEALTH,
         KARMA,
         MOVEMENT,
         PROFILE
      };

      // Define global localize helper for convenience
      // @ts-ignore - Intentionally adding to globalThis
      globalThis.localize = (key: string): string => game.i18n.localize(key);

      console.log("SR3E | CONFIG.SR3E initialized, localize() ready");
   });
}

registerHooks();
