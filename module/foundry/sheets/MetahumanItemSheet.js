import { localize } from "../../svelteHelpers.js";
import MetaHumanApp from "../../svelte/apps/MetahumanApp.svelte";
import { mount, unmount } from "svelte";

export default class MetahumanItemSheet extends foundry.applications.sheets.ItemSheetV2 {

    #metahuman;

    get title() {
        return `${localize(CONFIG.sr3e.traits.metahuman)}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-item-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "item", "metahuman"],
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
        if (this.#metahuman) {
            unmount(this.#metahuman);
            this.#metahuman = null;
        }

        this.#metahuman = mount(MetaHumanApp, {
            target: windowContent,
            props: {
                item: this.document,
                config: CONFIG.sr3e
            }
        });

        return windowContent;
    }

    async _tearDown() {
        if (this.#metahuman) await unmount(this.#metahuman);
        this.#metahuman = null;
        return super._tearDown();
    }

    /** @override prevent submission, since Svelte is managing state */
    _onSubmit(event) { return; }
}