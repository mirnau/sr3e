import KarmaApp from "../../svelte/apps/KarmaApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "../../svelteHelpers.js";

export default class KarmaItemSheet extends foundry.applications.sheets.ItemSheetV2 {

    #karma

        get title() {
        return `${localize(CONFIG.sr3e.karma.karma)}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "item", "karma"],
            template: null,
            position: { width: 'auto', height: 'auto' },
            window: {
                resizable: false
            },
            tag: "form",
            submitOnChange: true,
            closeOnSubmit: false
        };
    }

    _renderHTML() {
        return null;
    }

    _replaceHTML(_, windowContent) {
        if (this.#karma) {
            unmount(this.#karma);
            this.#karma = null;
        }

        this.#karma = mount(KarmaApp, {
            target: windowContent,
            props: {
                item: this.document,
                config: CONFIG.sr3e
            }
        });

        return windowContent;
    }

    /** @override prevent submission, since Svelte is managing state */
    _onSubmit(event) { return; }
}