import { mount } from "svelte";
import GuideDialog from "../../ui/dialogs/GuideDialog.svelte";
import { SvelteDialogApp } from "./SvelteDialogApp";

export class GuideDialogApp extends SvelteDialogApp {
    static #instance: GuideDialogApp | null = null;

    static toggle(): void {
        if (this.#instance?.rendered) {
            void this.#instance.close();
            return;
        }
        this.#instance ??= new GuideDialogApp();
        void this.#instance.render(true);
    }

    static override DEFAULT_OPTIONS = {
        id: "sr3e-guide-dialog",
        classes: ["sr3e", "sheet", "staticlayout", "guide-dialog"],
        tag: "form",
        window: {
            title: "SR3E Guide",
            resizable: true,
        },
        position: {
            width: 640,
            height: 720,
        },
    };

    protected mountSvelteApp(target: HTMLElement) {
        return mount(GuideDialog, { target });
    }

    override async _tearDown(options: DeepPartial<RenderOptions>): Promise<void> {
        await super._tearDown(options);
        GuideDialogApp.#instance = null;
    }
}
