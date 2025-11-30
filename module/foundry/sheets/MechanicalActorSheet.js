import MechanicalApp from "@apps/MechanicalApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class MechanicalActorSheet extends foundry.applications.sheets.ActorSheetV2 {
  #app;
  #resizeObserver;

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

    // Apply saved window size and start observing for changes
    this.#applySavedWindowSize(windowContent);
    return windowContent;
  }

  _onSubmit(event) { return; }

  async #applySavedWindowSize(windowContent) {
    const root = windowContent?.closest?.(".window-app") ?? windowContent?.closest?.(".app");
    if (!root) return;

    const size = await this.document.getFlag("sr3e", "windowSize");
    if (size && Number.isFinite(size.width) && Number.isFinite(size.height)) {
      root.style.width = `${Math.round(size.width)}px`;
      root.style.height = `${Math.round(size.height)}px`;
    }

    // Observe and persist size changes (debounced)
    if (this.#resizeObserver) {
      try { this.#resizeObserver.disconnect(); } catch {}
      this.#resizeObserver = null;
    }
    let saveTimeout = null;
    this.#resizeObserver = new ResizeObserver((entries) => {
      const entry = entries?.[0];
      if (!entry) return;
      const { width, height } = entry.contentRect ?? {};
      if (!Number.isFinite(width) || !Number.isFinite(height)) return;
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        this.document.setFlag("sr3e", "windowSize", { width: Math.round(width), height: Math.round(height) });
      }, 200);
    });
    this.#resizeObserver.observe(root);
  }

  async close(options) {
    if (this.#resizeObserver) {
      try { this.#resizeObserver.disconnect(); } catch {}
      this.#resizeObserver = null;
    }
    return super.close(options);
  }
}
