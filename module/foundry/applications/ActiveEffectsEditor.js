import ActiveEffectsEditorApp from "../../svelte/apps/components/ActiveEffects/ActiveEffectsEditorApp.svelte";
import { mount, unmount } from "svelte";

export default class ActiveEffectsEditor extends foundry.applications.api.ApplicationV2 {
   #app;

   constructor(document, effect, config) {
		const appId = ActiveEffectsEditor.getAppIdFor(effect.id);
		super({ id: appId });

      this.document = document;
      this.effect = effect;
      this.config = config;
   }

   static getAppIdFor(docId) {
      return `sr3e-active-skill-editor-${docId}`;
   }

   static getExisting(docId) {
      const appId = this.getAppIdFor(docId);
      return Object.values(ui.windows).find((app) => app.id === appId);
   }

   static launch(document, config) {
      const existing = this.getExisting(document.id);
      if (existing) {
         existing.bringToTop();
         return existing;
      }
      const sheet = new this(document, config);
      sheet.render(true);
      return sheet;
   }

   static DEFAULT_OPTIONS = {
      classes: ["sr3e", "active-effects-editor"],
      window: {
         title: "Edit Active Effects",
         resizable: true,
      },
      position: {
         width: "auto",
         height: "auto",
      },
   };

   _renderHTML() {
      return null;
   }

   _replaceHTML(_, windowContent) {
      if (this.#app) {
         unmount(this.#app);
      }

      this.#app = mount(ActiveEffectsEditorApp, {
         target: windowContent,
         props: {
            item: this.document,
            effect: this.effect,
            config: this.config,
         },
      });

      return windowContent;
   }

   async _tearDown() {
      if (this.#app) await unmount(this.#app);
      this.#app = null;
      return super._tearDown();
   }
}