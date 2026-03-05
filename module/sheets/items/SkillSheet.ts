import { mount } from "svelte";
import SkillApp from "../../ui/items/SkillApp.svelte";
import { SR3EItemBase } from "./SR3EItemBase";

export default class SkillSheet extends SR3EItemBase {
    #app?: SvelteApp;

    get title() {
        const skillLabel = localize(CONFIG.SR3E.SKILL?.skill ?? "SR3E.skill.skill");
        return `${skillLabel}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-item-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "staticlayout", "skill"],
            template: null,
            position: { width: 360, height: "auto" },
            window: {
                resizable: false,
            },
            tag: "form",
            submitOnChange: true,
            closeOnSubmit: false,
        };
    }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
        this._unmountAllApps();

        this.#app = mount(SkillApp, {
            target: windowContent,
            props: {
                item: this.document as Item,
            },
        });
        this.apps.push(this.#app);
    }
}
