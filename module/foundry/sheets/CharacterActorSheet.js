import CharacterSheetApp from "../../svelte/apps/CharacterSheetApp.svelte";
import NeonName from "../../svelte/apps/injections/NeonName.svelte";
import NewsFeed from "../../svelte/apps/injections/NewsFeed.svelte";
import SR3DLog from "../../../Log.js";
import { mount, unmount } from 'svelte';
import { DocumentSheetV2 } from "#runtime/sheets/document/sheet-v2.js";

export default class CharacterActorSheet extends DocumentSheetV2 {
  #app;
  #neon;

  _renderHTML() {
    return null;
  }

  _replaceHTML(result, windowContent) {
    windowContent.innerHTML = "";
    const form = windowContent.parentNode;

    this.#app = mount(CharacterSheetApp, {
      target: windowContent,
      props: {
        actor: this.document,
        config: CONFIG.sr3e,
        form: form
      }
    });

    const header = form.querySelector("header.window-header");
    let neonSlot = header?.previousElementSibling;
    if (!neonSlot?.classList?.contains("neon-name-position")) {
      neonSlot = document.createElement("div");
      neonSlot.classList.add("neon-name-position");
      header.parentElement.insertBefore(neonSlot, header);

      this.#neon = mount(NeonName, {
        target: neonSlot,
        props: { actor: this.document }
      });
    }

    const title = form.querySelector(".window-title");
    title.remove();
    const svelteInejction = document.createElement("div");
    svelteInejction.classList.add("svelte-injection");
    header.prepend(svelteInejction);

    this.#app = mount(NewsFeed, {
      target: header,
      anchor: header.firstChild,
      props: {
        actor: this.document
      }
    });

    windowContent.classList.add("noise-layer");

    SR3DLog.success("Svelte mounted", this.constructor.name);
    return windowContent;
  }

  async _tearDown() {
    if (this.#app) await unmount(this.#app);
    if (this.#neon) await unmount(this.#neon);
    this.#app = this.#neon = null;
    return super._tearDown();
  }

  _onSubmit() {
    return false;
  }
}
