import CharacterSheetApp from "../../svelte/apps/CharacterSheetApp.svelte";
import NeonName from "../../svelte/apps/injections/NeonName.svelte";
import NewsFeed from "../../svelte/apps/injections/NewsFeed.svelte";
import SR3DLog from "../../../Log.js";
import { mount, unmount } from 'svelte';

export default class CharacterActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  #app;   // Svelte component instance
  #neon;  // NeonName injection instance

  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    id: "sr3e-character-sheet",
    classes: ["sr3e", "sheet", "actor", "character"],
    template: null,
    position: { width: 820, height: 820 },
    window: {
      resizable: true
    },
    tag: "form",
    submitOnChange: true,
    closeOnSubmit: false
  };

  _renderHTML() {
    return null;
  }
  

_replaceHTML(result, windowContent) {
  // 1. Clear existing content (safer than replaceChildren for Foundry dialogs)
  windowContent.innerHTML = "";

  // 2. Get the parent <form> (the sheet's root element)
  const form = windowContent.parentNode;

  // 3. Mount Svelte directly
  this.#app = mount(CharacterSheetApp, {
    target: windowContent,
    props: {
      actor: this.actor,
      config: CONFIG.sr3e,
      form: form // for ResizeObserver/layout logic
    }
  });

  // 4. Optional: Mount any "neon" or extra header component, if needed
  const header = form.querySelector("header.window-header");
  let neonSlot = header?.previousElementSibling;
  if (!neonSlot?.classList?.contains("neon-name-position")) {
    neonSlot = document.createElement("div");
    neonSlot.classList.add("neon-name-position");
    header.parentElement.insertBefore(neonSlot, header);
    
    this.#neon = mount(NeonName, {
      target: neonSlot,
      props: { actor: this.actor }
    });
  }

  // 5. Rip out the window title
  const title = form.querySelector(".window-title");
  title.remove();
  const svelteInejction = document.createElement("div");
  svelteInejction.classList.add("svelte-injection");
  header.prepend(svelteInejction);

  this.#app = mount(NewsFeed, {
    target: header,
    anchor: header.firstChild,
    props: {
      actor: this.actor,
    }
  });


  // 7. Add noise layer to background
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