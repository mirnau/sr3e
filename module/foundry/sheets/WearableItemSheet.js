import WearableApp from "@apps/WearableApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class WearableItemSheet extends foundry.applications.sheets
  .ItemSheetV2 {
  #wearable;

  get title() {
    return `${localize(CONFIG.sr3e.wearable.wearable)}: ${this.item.name}`;
  }

  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "wearable"],
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
    if (this.#wearable) {
      unmount(this.#wearable);
      this.#wearable = null;
    }

    this.#wearable = mount(WearableApp, {
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