import { mount, unmount } from "svelte";
import SpendPowerPointsDialog from "../../ui/dialogs/SpendPowerPointsDialog.svelte";

export class SpendPowerPointsDialogApp extends foundry.applications.api.ApplicationV2 {
    #powerPointsAvailable: number;
    #onConfirm: (quantity: number) => void;
    #svelteApp: any; // Svelte mount returns any - acceptable for Svelte integration

    constructor(powerPointsAvailable: number, onConfirm: (quantity: number) => void) {
        super();
        this.#powerPointsAvailable = powerPointsAvailable;
        this.#onConfirm = onConfirm;
    }

    static override DEFAULT_OPTIONS = {
        id: "sr3e-spend-power-points-dialog",
        tag: "form",
        window: {
            title: "Spend Power Points",
            resizable: false,
        },
        position: {
            width: 360,
            height: "auto",
        },
    };

    override async _renderHTML(_context: unknown, _options: DeepPartial<RenderOptions>): Promise<unknown> {
        return "";
    }

    override _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
        if (this.#svelteApp) {
            unmount(this.#svelteApp);
        }

        this.#svelteApp = mount(SpendPowerPointsDialog, {
            target: windowContent,
            props: {
                powerPointsAvailable: this.#powerPointsAvailable,
                onconfirm: (quantity: number) => {
                    this.#onConfirm(quantity);
                    this.close();
                },
                oncancel: () => this.close(),
            },
        });
    }

    override async close(options = {}): Promise<this> {
        if (this.#svelteApp) {
            unmount(this.#svelteApp);
            this.#svelteApp = null;
        }

        return super.close(options);
    }
}
