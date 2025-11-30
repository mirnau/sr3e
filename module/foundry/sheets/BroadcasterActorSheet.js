import BroadcasterApp from "../../svelte/apps/BroadcasterApp.svelte";
import { mount, unmount } from "svelte";

export default class BroadcasterActorSheet extends foundry.applications.sheets.ActorSheetV2 {
   #app;
   #footer;

   static get DEFAULT_OPTIONS() {
      return {
         ...super.DEFAULT_OPTIONS,
         id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
         classes: ["sr3e", "sheet", "actor", "ActorSheetV2"],
         template: null,
         position: { width: 820, height: 'auto' },
         window: { resizable: true },
         tag: "form",
         submitOnChange: true,
         closeOnSubmit: false,
      };
   }

   _renderHTML() {
      return null;
   }

   _replaceHTML(_, windowContent) {
      if (this.#app) {
         unmount(this.#app);
         this.#app = null;
      }

      if (this.#footer) {
         unmount(this.#footer);
         this.#footer = null;
      }

      windowContent.innerHTML = "";
      const form = windowContent.parentNode;

      this.#app = mount(BroadcasterApp, {
         target: windowContent,
         props: {
            actor: this.document,
            config: CONFIG.sr3e,
            form: form,
         },
      });

      this._injectFooter(form);

      return windowContent;
   }

   _injectFooter(form) {
      if (form.querySelector(".actor-footer")) return;

      const footer = document.createElement("div");
      footer.classList.add("actor-footer");

      const resizeHandle = form.querySelector(".window-resize-handle");
      if (resizeHandle?.parentNode) {
         resizeHandle.parentNode.insertBefore(footer, resizeHandle.nextSibling);
      } else {
         form.appendChild(footer);
      }
   }

   async _tearDown() {
      if (this.#app) await unmount(this.#app);
      this.#app = this.#footer = null;
      return super._tearDown();
   }

   _onSubmit() {
      return false;
   }

   async _onDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
   }
}
