import { mount, unmount } from "svelte";
import DebtPaymentDialog from "../../ui/actors/actor-components/rats-race/DebtPaymentDialog.svelte";

export class DebtPaymentDialogApp extends foundry.applications.api.ApplicationV2 {
    #debtRemaining: number;
    #sticks: Item[];
    #onConfirm: (stick: Item, amount: number) => void;
    #svelteApp: any; // Svelte mount returns any - acceptable for Svelte integration

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

    override async _renderHTML(_context: unknown, _options: DeepPartial<RenderOptions>): Promise<unknown> {
        return "";
    }

    override _replaceHTML(_result: unknown, windowContent: HTMLElement, _options: DeepPartial<RenderOptions>): void {
        if (this.#svelteApp) {
            unmount(this.#svelteApp);
        }

        this.#svelteApp = mount(DebtPaymentDialog, {
            target: windowContent,
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

    override async close(options = {}): Promise<this> {
        if (this.#svelteApp) {
            unmount(this.#svelteApp);
            this.#svelteApp = null;
        }

        return super.close(options);
    }
}
