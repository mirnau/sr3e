import { unmount } from "svelte";

type SvelteApp = Record<string, unknown>;

// ApplicationV2 windows steal focus on open but never give it back on close,
// so the actor sheet underneath is left with nothing focused. Capturing the
// previously focused element up front and restoring it in _tearDown fixes
// that for every Svelte-backed dialog that extends this class.
export abstract class SvelteDialogApp extends foundry.applications.api.ApplicationV2 {
    #svelteApp?: SvelteApp;
    #priorFocus: HTMLElement | null;

    constructor(options = {}) {
        super(options);
        this.#priorFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    protected abstract mountSvelteApp(target: HTMLElement): SvelteApp;

    override async _renderHTML(_context: unknown, _options: DeepPartial<RenderOptions>): Promise<unknown> {
        return "";
    }

    override _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
        if (this.#svelteApp) {
            unmount(this.#svelteApp);
        }

        this.#svelteApp = this.mountSvelteApp(windowContent);
    }

    override async _tearDown(options: DeepPartial<RenderOptions>): Promise<void> {
        if (this.#svelteApp) {
            unmount(this.#svelteApp);
            this.#svelteApp = undefined;
        }

        await super._tearDown(options);
        this.#priorFocus?.focus();
    }
}
