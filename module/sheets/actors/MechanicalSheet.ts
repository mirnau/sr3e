import { mount } from "svelte";
import MechanicalApp from "../../ui/actors/MechanicalApp.svelte";
import { localize } from "../../services/utilities";
import { SR3EActorBase } from "./SR3EActorBase";

export default class MechanicalSheet extends SR3EActorBase {
    #app?: SvelteApp;

    get title() {
        return `${localize(CONFIG.SR3E.MECHANICAL.mechanical)}: ${this.actor.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-mechanical-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "actor", "mechanical", "ActorSheetV2"],
            template: null,
            position: { width: 720, height: 760 },
            window: { resizable: true },
            tag: "form",
            submitOnChange: true,
            closeOnSubmit: false,
        };
    }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement): void {
        if (this.#app) return;

        this.#app = mount(MechanicalApp, {
            target: windowContent,
            props: {
                actor: this.document as Actor,
            },
        });
        this.apps.push(this.#app);
    }

    protected _tearDown(options: DeepPartial<RenderOptions>): void {
        this._unmountAllApps();
        this.#app = undefined;
        super._tearDown(options);
    }
}
