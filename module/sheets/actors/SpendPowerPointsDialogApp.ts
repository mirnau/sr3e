import { mount } from "svelte";
import SpendPowerPointsDialog from "../../ui/dialogs/SpendPowerPointsDialog.svelte";
import { SvelteDialogApp } from "../../foundry/applications/SvelteDialogApp";

export class SpendPowerPointsDialogApp extends SvelteDialogApp {
    #powerPointsAvailable: number;
    #onConfirm: (quantity: number) => void;

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

    protected mountSvelteApp(target: HTMLElement) {
        return mount(SpendPowerPointsDialog, {
            target,
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
}
