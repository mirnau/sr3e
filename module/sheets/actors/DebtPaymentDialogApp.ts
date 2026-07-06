import { mount } from "svelte";
import DebtPaymentDialog from "../../ui/actors/actor-components/rats-race/DebtPaymentDialog.svelte";
import { SvelteDialogApp } from "../../foundry/applications/SvelteDialogApp";

export class DebtPaymentDialogApp extends SvelteDialogApp {
    #debtRemaining: number;
    #sticks: Item[];
    #onConfirm: (stick: Item, amount: number) => void;

    constructor(debtRemaining: number, sticks: Item[], onConfirm: (stick: Item, amount: number) => void) {
        super();
        this.#debtRemaining = debtRemaining;
        this.#sticks = sticks;
        this.#onConfirm = onConfirm;
    }

    // No "sr3e" class — inherits the native-Foundry-window skin (foundry-apps.scss),
    // same as PurchaseDialogApp and the weapon reload prompt, rather than the
    // heavier sheet-card look.
    static override DEFAULT_OPTIONS = {
        id: "sr3e-debt-payment-dialog",
        tag: "form",
        window: {
            title: "Pay Debt",
            resizable: false,
        },
        position: {
            width: 360,
            height: "auto",
        },
    };

    protected mountSvelteApp(target: HTMLElement) {
        return mount(DebtPaymentDialog, {
            target,
            props: {
                debtRemaining: this.#debtRemaining,
                sticks: this.#sticks,
                onconfirm: (stick: Item, amount: number) => {
                    this.#onConfirm(stick, amount);
                    this.close();
                },
                oncancel: () => this.close(),
            },
        });
    }
}
