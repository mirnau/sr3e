import { mount } from "svelte";
import MetatypeApp from "../../ui/items/MetatypeApp.svelte";
import { SR3EItemBase } from "./SR3EItemBase";

export default class MetatypeSheet extends SR3EItemBase {
    #metatype?: SvelteApp;
    
    get title() {
        const metatypeLabel = localize(CONFIG.SR3E.METATYPE.metatype);
        return `${metatypeLabel}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-item-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "item", "metatype"],
            template: null,
            position: { width: "auto", height: "auto" },
            window: {
                resizable: false,
            },
            tag: "form",
            submitOnChange: true,
            closeOnSubmit: false,
        };
    }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
        // Clean up existing apps before mounting new ones
        this._unmountAllApps();

        this.#metatype = mount(MetatypeApp, {
            target: windowContent,
            props: {
                item: this.document as Item,
            },
        });
        this.apps.push(this.#metatype);
    }
}
