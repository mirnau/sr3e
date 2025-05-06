import { mount, unmount } from 'svelte';
import JournalEntryApp from '../../svelte/apps/JournalEntryApp.svelte';

const { DocumentSheetV2 } = foundry.applications.api;

export default class SR3EJournalEntry extends DocumentSheetV2 {
  static DEFAULT_OPTIONS = {
    ...DocumentSheetV2.DEFAULT_OPTIONS,
    id: "sr3e-journal-sheet",
    classes: ["sr3e", "sheet", "journal-sheet", "journal-entry","expanded"],
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

  async _replaceHTML(_, content) {
    if (this.#app) return;

    await this.document.loadEmbeddedDocuments?.("JournalEntryPage");

    this.#app = mount(JournalEntryApp, {
      target: content,
      props: { doc: this.document }
    });
  }

  async _tearDown() {
    await unmount(this.#app);
    this.#app = null;
    return super._tearDown();
  }

  #app;
}