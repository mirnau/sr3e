import { mount, unmount } from "svelte";
import WeaponModApp from "../../ui/items/gadgets/WeaponModApp.svelte";

type SvelteApp = Record<string, unknown>;

const TYPE_MAP: Record<string, unknown> = {
    weaponmod: WeaponModApp,
};

export default class GadgetEditorSheet extends foundry.applications.api.ApplicationV2 {
    #app?: SvelteApp;
    #document: Item | Actor;
    #effects: ActiveEffect[];

    constructor(document: Item | Actor, effects: ActiveEffect[]) {
        super({ id: `sr3e-gadget-editor-${foundry.utils.randomID()}` });
        this.#document = document;
        this.#effects = effects;
    }

    static override get DEFAULT_OPTIONS(): DeepPartial<foundry.applications.api.ApplicationV2.Configuration> {
        return {
            ...super.DEFAULT_OPTIONS,
            classes: ["sr3e", "gadget-editor"],
            window: { title: "Gadget Editor", resizable: false },
            position: { width: "auto" as unknown as number, height: "auto" as unknown as number },
        };
    }

    protected async _renderHTML(): Promise<unknown> { return ""; }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement): void {
        if (this.#app) { unmount(this.#app); this.#app = undefined; }
        const gadgetType = (this.#effects[0] as any).flags?.sr3e?.gadget?.gadgetType as string;
        const SvelteComponent = (TYPE_MAP[gadgetType] ?? WeaponModApp) as Parameters<typeof mount>[0];
        this.#app = mount(SvelteComponent, {
            target: windowContent,
            props: { document: this.#document, activeEffects: this.#effects, sheet: this },
        }) as SvelteApp;
    }

    protected async _tearDown(options: DeepPartial<RenderOptions>): Promise<void> {
        if (this.#app) { await unmount(this.#app); this.#app = undefined; }
        return super._tearDown(options);
    }
}
