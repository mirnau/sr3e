// src/module/journal/SR3EJournalEntryPage.js

import { mount, unmount } from "svelte";
import JournalEntryPageApp from "../../svelte/apps/JournalEntryPageApp.svelte";
const { JournalEntryPageSheet } = foundry.applications.sheets.journal;

export default class SR3EJournalEntryPage extends JournalEntryPageSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["sr3e", "sheet", "journal-sheet", "journal-entry-page", "expanded"],
            submitOnChange: true,
            closeOnSubmit: false,
            resizable: true,
        });
    }

    _renderHTML() {
        // Required for ApplicationV2
        return null;
    }

    async _replaceHTML(_, content) {
        if (this.#app) return;

        console.log("Attempting to wrap existing HTML...");

        // Capture the final generated HTML
        const rawHTML = content.innerHTML;
        console.log("Captured HTML:", rawHTML);

        // Clear the existing content
        content.innerHTML = "";

        // Mount the Svelte app around the captured content
        this.#app = mount(JournalEntryPageApp, {
            target: content,
            props: {
                doc: this.document,
                initialContent: rawHTML
            }
        });
    }

    async close(options) {
        if (this.#app) {
            await unmount(this.#app);
            this.#app = null;
        }

        if (this.#editorApp) {
            await unmount(this.#editorApp);
            this.#editorApp = null;
        }

        return super.close(options);
    }

    #app;
    #editorApp;
}
