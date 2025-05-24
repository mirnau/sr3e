import AmmunitionApp from "../../svelte/apps/AmmunitionApp.svelte";
import { mount, unmount } from "svelte";

export default class AmmunitionItemSheet extends foundry.applications.sheets.ItemSheetV2 {

    #ammunition

        get title() {
        return `${game.i18n.localize(CONFIG.sr3e.ammunition.ammunition)}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "item", "ammunition"],
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
        if (this.#ammunition) {
            unmount(this.#ammunition);
            this.#ammunition = null;
        }

        this.#ammunition = mount(AmmunitionApp, {
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