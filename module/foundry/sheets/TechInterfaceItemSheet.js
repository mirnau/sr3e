import TechInterfaceApp from "@apps/TechInterfaceApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class TechInterfaceItemSheet extends foundry.applications.sheets
  .ItemSheetV2 {
  #techinterface;

  get title() {
    return `${localize(CONFIG.sr3e.techinterface.techinterface)}: ${this.item.name}`;
  }

  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "techinterface"],
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
    if (this.#techinterface) {
      unmount(this.#techinterface);
      this.#techinterface = null;
    }

    this.#techinterface = mount(TechInterfaceApp, {
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