import { mount, unmount } from "svelte";
import BuyPowerPointsDialog from "../../ui/dialogs/BuyPowerPointsDialog.svelte";

export class BuyPowerPointsDialogApp extends foundry.applications.api.ApplicationV2 {
    #goodKarma: number;
    #onConfirm: (quantity: number) => void;
    #svelteApp: any; // Svelte mount returns any - acceptable for Svelte integration

    constructor(goodKarma: number, onConfirm: (quantity: number) => void) {
        super();
        this.#goodKarma = goodKarma;
        this.#onConfirm = onConfirm;
    }

    static override DEFAULT_OPTIONS = {
        id: "sr3e-buy-power-points-dialog",
        tag: "form",
        window: {
            title: "Buy Power Points",
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

        this.#svelteApp = mount(BuyPowerPointsDialog, {
            target: windowContent,
            props: {
                goodKarma: this.#goodKarma,
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
