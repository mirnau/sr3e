import MagicApp from "../../svelte/apps/MagicApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "@services/utilities.js";

export default class MagicItemSheet extends foundry.applications.sheets.ItemSheetV2 {

    #magic

    get title() {
        return `${localize(CONFIG.sr3e.magic.magician)}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "item", "magic"],
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
        if (this.#magic) {
            unmount(this.#magic);
            this.#magic = null;
        }

        this.#magic = mount(MagicApp, {
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