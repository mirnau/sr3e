import { localize } from "@services/utilities.js";
import metatypeApp from "../../svelte/apps/metatypeApp.svelte";
import { mount, unmount } from "svelte";

export default class MetatypeItemSheet extends foundry.applications.sheets.ItemSheetV2 {

    #metatype;

    get title() {
        return `${localize(CONFIG.sr3e.traits.metatype)}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-item-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "item", "metatype"],
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
        if (this.#metatype) {
            unmount(this.#metatype);
            this.#metatype = null;
        }

        this.#metatype = mount(metatypeApp, {
            target: windowContent,
            props: {
                item: this.document,
                config: CONFIG.sr3e
            }
        });

        return windowContent;
    }

    async _tearDown() {
        if (this.#metatype) await unmount(this.#metatype);
        this.#metatype = null;
        return super._tearDown();
    }

    /** @override prevent submission, since Svelte is managing state */
    _onSubmit(event) { return; }
}