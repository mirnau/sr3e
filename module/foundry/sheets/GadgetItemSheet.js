import GadgetApp from "@apps/GadgetApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class GadgetItemSheet extends foundry.applications.sheets.ItemSheetV2 {
   #gadget;

   get title() {
      return `${localize(CONFIG.sr3e.gadget.gadget)}: ${this.item.name}`;
   }

   static get DEFAULT_OPTIONS() {
      return {
         ...super.DEFAULT_OPTIONS,
         id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
         classes: ["sr3e", "sheet", "item", "gadget"],
         template: null,
         position: { width: "auto", height: "auto" },
         window: {
            resizable: false,
         },
         tag: "form",
         submitOnChange: true,
         closeOnSubmit: false,
      };
   }

   _renderHTML() {
      return null;
   }

   _replaceHTML(_, windowContent) {
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
