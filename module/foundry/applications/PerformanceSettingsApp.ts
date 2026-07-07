import { mount, unmount } from "svelte";
import PerformanceSettings from "../../ui/settings/PerformanceSettings.svelte";

type SvelteApp = Record<string, unknown>;

export default class PerformanceSettingsApp extends foundry.applications.api.ApplicationV2 {
    #app?: SvelteApp;

    static override get DEFAULT_OPTIONS(): DeepPartial<foundry.applications.api.ApplicationV2.Configuration> {
        return {
            ...super.DEFAULT_OPTIONS,
            id: "sr3e-performance-settings",
            classes: ["sr3e-performance-settings"],
            window: { title: "SR3E Performance Impacting Settings", resizable: false },
            position: { width: 420, height: "auto" as unknown as number },
        };
    }

    protected async _renderHTML(): Promise<unknown> { return ""; }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement): void {
        if (this.#app) { unmount(this.#app); this.#app = undefined; }
        this.#app = mount(PerformanceSettings, { target: windowContent }) as SvelteApp;
    }

    protected async _tearDown(options: DeepPartial<RenderOptions>): Promise<void> {
        if (this.#app) { await unmount(this.#app); this.#app = undefined; }
        return super._tearDown(options);
    }
}
