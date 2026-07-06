import { mount } from "svelte";
import PurchaseDialog from "../../ui/dialogs/PurchaseDialog.svelte";
import { SvelteDialogApp } from "../../foundry/applications/SvelteDialogApp";

export class PurchaseDialogApp extends SvelteDialogApp {
    #buyer: Actor;
    #item: Item;
    #seller?: Actor;

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

    protected mountSvelteApp(target: HTMLElement) {
        return mount(PurchaseDialog, {
            target,
            props: {
                buyer: this.#buyer,
                item: this.#item,
                seller: this.#seller,
                onClose: () => this.close(),
            },
        });
    }
}
