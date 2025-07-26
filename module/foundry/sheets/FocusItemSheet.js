import FocusApp from "@apps/FocusApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class FocusItemSheet extends foundry.applications.sheets
  .ItemSheetV2 {
  #focus;

  get title() {
    return `${localize(CONFIG.sr3e.focus.focus)}: ${this.item.name}`;
  }

  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "focus"],
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
    if (this.#focus) {
      unmount(this.#focus);
      this.#focus = null;
    }

    this.#focus = mount(FocusApp, {
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