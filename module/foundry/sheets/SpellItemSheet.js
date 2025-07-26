import SpellApp from "@apps/SpellApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class SpellItemSheet extends foundry.applications.sheets
  .ItemSheetV2 {
  #spell;

  get title() {
    return `${localize(CONFIG.sr3e.spell.spell)}: ${this.item.name}`;
  }

  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "item", "spell"],
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
    if (this.#spell) {
      unmount(this.#spell);
      this.#spell = null;
    }

    this.#spell = mount(SpellApp, {
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