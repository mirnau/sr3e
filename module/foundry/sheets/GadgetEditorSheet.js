import GadgetApp from "@apps/GadgetApp.svelte";
import WeaponModApp from "@apps/gadgets/WeaponModApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class GadgetEditorApp extends foundry.applications.api.ApplicationV2 {
   #app;
   #svelteapp;
   #document;
   #activeEffects;

   constructor(document, effects, config, options = {}) {
      super(options);
      this.#document = document;
      this.#activeEffects = effects;

      const primary = effects[0];
      const type = primary.flags.sr3e.gadget.gadgetType;

      const typeMap = {
         [localize(config.gadgettypes.weaponmod)]: WeaponModApp,
      };

      this.#svelteapp = typeMap[type];
   }

   static get DEFAULT_OPTIONS() {
      return {
         ...super.defaultOptions,
         id: `gadget-editor-${foundry.utils.randomID()}`,
         classes: ["sr3e", "sheet", "item", "gadget-editor"],
         title: "Gadget Editor",
         template: null,
         resizable: false,
         width: "auto",
         height: "auto",
      };
   }

   _renderHTML() {
      return null;
   }

   _replaceHTML(_, html) {
      if (this.#app) unmount(this.#app);

      this.#app = mount(this.#svelteapp, {
         target: html,
         props: {
            document: this.#document,
            activeEffects: this.#activeEffects,
            config: CONFIG.sr3e,
         },
      });

      return html;
   }

   close(options) {
      unmount(this.#app);
      return super.close(options);
   }
}
