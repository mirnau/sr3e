import MechanicalApp from "@apps/MechanicalApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class MechanicalActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  #app;

  get title() {
    return `${localize(CONFIG.sr3e.mechanical?.mechanical ?? "sr3e.mechanical.mechanical")}: ${this.actor.name}`;
  }

  static get DEFAULT_OPTIONS() {
    return {
      ...super.DEFAULT_OPTIONS,
      id: `sr3e-mechanical-sheet-${foundry.utils.randomID()}`,
      classes: ["sr3e", "sheet", "actor", "mechanical"],
      template: null,
      position: { width: "auto", height: "auto" },
      window: { resizable: true },
      tag: "form",
      submitOnChange: true,
      closeOnSubmit: false,
    };
  }

  _renderHTML() { return null; }

  _replaceHTML(_, windowContent) {
    if (this.#app) {
      unmount(this.#app);
      this.#app = null;
    }
    this.#app = mount(MechanicalApp, {
      target: windowContent,
      props: {
        actor: this.document,
        config: CONFIG.sr3e,
        form: windowContent.parentNode,
      },
    });
    return windowContent;
  }

  _onSubmit(event) { return; }
}
