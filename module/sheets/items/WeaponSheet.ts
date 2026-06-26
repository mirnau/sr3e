import { mount } from "svelte";
import WeaponApp from "../../ui/items/WeaponApp.svelte";
import { SR3EItemBase } from "./SR3EItemBase";

export default class WeaponSheet extends SR3EItemBase {
    #app?: SvelteApp;

    get title() {
        return `${localize(CONFIG.SR3E.WEAPON.weapon)}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-item-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "staticlayout", "weapon"],
            template: null,
            position: { width: "auto" as unknown as number, height: "auto" as unknown as number },
            window: { resizable: false },
            tag: "form",
            submitOnChange: true,
            closeOnSubmit: false,
        };
    }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
        this._unmountAllApps();
        this.#app = mount(WeaponApp, {
            target: windowContent,
            props: { item: this.document as Item },
        });
        this.apps.push(this.#app);
    }
}
