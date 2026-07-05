import { mount, unmount } from "svelte";
import ActiveEffectsEditorApp from "../../ui/common-components/ActiveEffectsEditorApp.svelte";

type SvelteApp = Record<string, unknown>;

export default class ActiveEffectsEditor extends foundry.applications.api.ApplicationV2 {
    #app?: SvelteApp;
    #document: Item | Actor;
    #effect: ActiveEffect;

    static getAppIdFor(effectId: string): string {
        return `sr3e-active-effect-editor-${effectId}`;
    }

    static getExisting(effectId: string): foundry.applications.api.ApplicationV2 | undefined {
        const appId = ActiveEffectsEditor.getAppIdFor(effectId);
        return Object.values(ui.windows as unknown as Record<string, foundry.applications.api.ApplicationV2>)
            .find(app => app.id === appId);
    }

    static launch(document: Item | Actor, effect: ActiveEffect): ActiveEffectsEditor {
        const existing = ActiveEffectsEditor.getExisting(effect.id!);
        if (existing) { existing.bringToTop(); return existing as ActiveEffectsEditor; }
        const app = new ActiveEffectsEditor(document, effect);
        app.render(true);
        return app;
    }

    constructor(document: Item | Actor, effect: ActiveEffect) {
        super({ id: ActiveEffectsEditor.getAppIdFor(effect.id!) });
        this.#document = document;
        this.#effect = effect;
    }

    static override get DEFAULT_OPTIONS(): DeepPartial<foundry.applications.api.ApplicationV2.Configuration> {
        return {
            ...super.DEFAULT_OPTIONS,
            classes: ["sr3e", "active-effects-editor"],
            window: { title: "Edit Effect", resizable: true },
            position: { width: "auto" as unknown as number, height: "auto" as unknown as number },
        };
    }

    protected async _renderHTML(): Promise<unknown> { return ""; }

    override async close(options?: DeepPartial<foundry.applications.api.ApplicationV2.ClosingOptions>): Promise<this> {
        this.#hideImmediately();
        return super.close(options);
    }

    protected _replaceHTML(_result: unknown, windowContent: HTMLElement): void {
        if (this.#app) { unmount(this.#app); this.#app = undefined; }
        this.#app = mount(ActiveEffectsEditorApp, {
            target: windowContent,
            props: { document: this.#document, activeEffect: this.#effect },
        }) as SvelteApp;
    }

    protected async _tearDown(options: DeepPartial<RenderOptions>): Promise<void> {
        this.#hideImmediately();
        if (this.#app) { await unmount(this.#app); this.#app = undefined; }
        return super._tearDown(options);
    }

    #hideImmediately(): void {
        if (!this.element) return;
        this.element.style.visibility = "hidden";
        this.element.style.opacity = "0";
        this.element.style.pointerEvents = "none";
    }
}
