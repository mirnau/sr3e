import { mount, unmount } from "svelte";
import WindowFocusBlurSettings from "../../ui/settings/WindowFocusBlurSettings.svelte";

type SvelteApp = Record<string, unknown>;

export default class WindowFocusBlurSettingsApp extends foundry.applications.api.ApplicationV2 {
    #app?: SvelteApp;

    static override get DEFAULT_OPTIONS(): DeepPartial<foundry.applications.api.ApplicationV2.Configuration> {
        return {
            ...super.DEFAULT_OPTIONS,
            id: "sr3e-window-focus-blur-settings",
            classes: ["sr3e-window-focus-blur-settings"],
            window: { title: "SR3E Window Focus Effects", resizable: false },
            position: { width: 420, height: "auto" as unknown as number },
        };
    }

    protected async _renderHTML(): Promise<unknown> { return ""; }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement): void {
        if (this.#app) { unmount(this.#app); this.#app = undefined; }
        this.#app = mount(WindowFocusBlurSettings, { target: windowContent }) as SvelteApp;
    }

    protected async _tearDown(options: DeepPartial<RenderOptions>): Promise<void> {
        if (this.#app) { await unmount(this.#app); this.#app = undefined; }
        return super._tearDown(options);
    }
}
