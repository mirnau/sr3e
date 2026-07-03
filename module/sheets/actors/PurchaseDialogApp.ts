import { mount, unmount } from "svelte";
import PurchaseDialog from "../../ui/dialogs/PurchaseDialog.svelte";

export class PurchaseDialogApp extends foundry.applications.api.ApplicationV2 {
    #buyer: Actor;
    #item: Item;
    #seller?: Actor;
    #svelteApp: any; // Svelte mount returns any - acceptable for Svelte integration

    constructor(buyer: Actor, item: Item, seller?: Actor) {
        super();
        this.#buyer = buyer;
        this.#item = item;
        this.#seller = seller;
    }

    static override DEFAULT_OPTIONS = {
        id: "sr3e-purchase-dialog",
        tag: "form",
        window: {
            title: "Purchase Item",
            resizable: false,
        },
        position: {
            width: 400,
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

        this.#svelteApp = mount(PurchaseDialog, {
            target: windowContent,
            props: {
                buyer: this.#buyer,
                item: this.#item,
                seller: this.#seller,
                onClose: () => this.close(),
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
