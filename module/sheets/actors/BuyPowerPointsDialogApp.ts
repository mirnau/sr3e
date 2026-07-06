import { mount } from "svelte";
import BuyPowerPointsDialog from "../../ui/dialogs/BuyPowerPointsDialog.svelte";
import { SvelteDialogApp } from "../../foundry/applications/SvelteDialogApp";

export class BuyPowerPointsDialogApp extends SvelteDialogApp {
    #goodKarma: number;
    #onConfirm: (quantity: number) => void;

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

    protected mountSvelteApp(target: HTMLElement) {
        return mount(BuyPowerPointsDialog, {
            target,
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
}
