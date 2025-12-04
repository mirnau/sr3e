import { mount, unmount } from "svelte";
import CharacterSheetApp from "../../ui/actors/CharacterSheetApp.svelte";

export default class CharacterActorSheet extends foundry.applications.sheets.ActorSheetV2 {

    #app?: object;

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "actor", "character", "ActorSheetV2"],
            template: null,
            position: { width: 820, height: 820 },
            window: {
                resizable: true,
            },
            tag: "form",
            submitOnChange: true,
            closeOnSubmit: false,
        };
    }

    protected async _renderHTML(_context: any, _options: DeepPartial<RenderOptions>): Promise<unknown> {
        // Skip default template rendering; Svelte takes over in _replaceHTML.
        return "";
    }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
        //Work in progress

        if (this.#app) {
            unmount(this.#app);
        }

        this.#app = mount(CharacterSheetApp, {
            target: windowContent,
            props: {
                actor: this.document as Actor,
                form: this.form as HTMLFormElement,
            },
        })
    }
}
