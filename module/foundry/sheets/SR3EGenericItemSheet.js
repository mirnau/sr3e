import ItemSheetApp from "../../svelte/apps/componentItemSystem/SR3EGenericItemSheetApp.svelte";
import { mount, unmount } from "svelte";

export default class SR3EGenericItemSheet extends foundry.applications.sheets.ItemSheetV2 {

    #app;

        get title() {
        return "Generic Item Sheet Prototype";
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "item", "generic"],
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
        if (this.#app) {
            unmount(this.#app);
            this.#app = null;
        }

        this.#app = mount(ItemSheetApp, {
            target: windowContent,
            props: {
                item: this.document,
                config: CONFIG.sr3e
            }
        });


        console.log("SR3EGenericItemSheet: Mounted Svelte app", this.#app);
        return windowContent;
    }

    /** @override prevent submission, since Svelte is managing state */
    _onSubmit(event) { return; }
}