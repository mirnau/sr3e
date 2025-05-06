// systems/sr3e/apps/sheets/sr3e-journal-sheet.js
import { mount, unmount }     from 'svelte';
import JournalEntryApp        from '../../svelte/apps/JournalEntryApp.svelte';

const { DocumentSheetV2 } = foundry.applications.api;

export default class SR3EJournalEntry extends DocumentSheetV2 {
  static DEFAULT_OPTIONS = {
    ...DocumentSheetV2.DEFAULT_OPTIONS,
    id:      'sr3e-journal-sheet',
    classes: ['sr3e', 'journal', 'v2'],
    width:   640,
    height:  720,
    title:   'SR3E Journal'
  };

  async _renderHTML() {
    const form  = document.createElement('form');
    form.dataset.documentId = this.document.id;
    const root  = document.createElement('div');
    root.id     = 'svelte-root';
    form.append(root);
    return form;
  }

  _replaceHTML(result, content) {
    content.replaceChildren(result);
  }

  async _onRender() {
    if (this.#app) return;
    this.#app = mount(JournalEntryApp, {
      target: this.element.querySelector('#svelte-root'),
      props:  { doc: this.document }
    });
  }

  async _onClose() {
    await unmount(this.#app);
    this.#app = null;
  }

  #app;
}