import GadgetApp from "@apps/GadgetApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class GadgetSheet extends foundry.applications.api.DocumentSheetV2 {
   #gadget;

   get title() {
      return `${localize(CONFIG.sr3e.gadget.gadget)}: ${this.document.name}`;
   }

   static get DEFAULT_OPTIONS() {
      return {
         ...super.DEFAULT_OPTIONS,
         id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
         classes: ["sr3e", "sheet", "item"],
         template: null,
         position: { width: "auto", height: "auto" },
         window: {
            resizable: false,
         },
         tag: "form",
         submitOnChange: false,
         closeOnSubmit: false,
      };
   }

   _onFirstRender() {
      return super._onFirstRender();
   }

   _renderHTML() {
      return null;
   }

   _replaceHTML(_, windowContent) {
      console.log("Gadget Sheet hit");

      if (this.#gadget) {
         unmount(this.#gadget);
         this.#gadget = null;
      }

      this.#gadget = mount(GadgetApp, {
         target: windowContent,
         props: {
            item: this.document,
            config: CONFIG.sr3e,
         },
      });

      return windowContent;
   }

   /** @override prevent submission, since Svelte is managing state */
   _onSubmit(event) {
      return;
   }
}
