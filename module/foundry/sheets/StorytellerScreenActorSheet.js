import StoryeerScreenApp from "../../svelte/apps/StorytellerScreenApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "../../svelteHelpers.js";

export default class StorytellerScreenActorSheet extends foundry.applications
  .sheets.ActorSheetV2 {
  #app;

  get title() {
    return `${localize(CONFIG.sr3e.storytellerscreen.storytellerscreen)}`;
  }

  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "storytellerscreen", "ActorSheetV2"],
      template: null,
      position: { width: 820, height: 820 },
      window: {
        resizable: true,
      },
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

    this.#app = mount(StoryeerScreenApp, {
      target: windowContent,
      props: {
        actor: this.document,
        config: CONFIG.sr3e,
      },
    });
  }

  async _tearDown() {
    if (this.#app) await unmount(this.#app);
    this.#app = null;
    return super._tearDown();
  }
}