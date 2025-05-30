import { mount, unmount } from "svelte";
import CharacterCreationDialog from "../../svelte/apps/dialogs/CharacterCreationDialogApp.svelte";

export class CharacterCreationApp extends foundry.applications.api.ApplicationV2 {
    #actor;
    #onSubmit;
    #onCancel;
    #svelteApp;
    #wasSubmitted = false;

    constructor(actor, options = {}) {
        const mergedOptions = foundry.utils.mergeObject({
            onSubmit: null,
            onCancel: null
        }, options);

        super(mergedOptions);
        this.#actor = actor;
        this.#onSubmit = mergedOptions.onSubmit;
        this.#onCancel = mergedOptions.onCancel;
    }

    static DEFAULT_OPTIONS = {
        id: "sr3e-character-creation",
        classes: ["sr3e", "sheet", "charactercreation"],
        tag: "form",
        window: {
            title: "Character Creation",
            resizable: false
        },
        position: {
            width: 'auto',  
            height: 'auto'  
        }
    };

    _renderHTML() {
        return null;
    }

    _replaceHTML(_, windowContent) {
        if (this.#svelteApp) unmount(this.#svelteApp);

        this.#svelteApp = mount(CharacterCreationDialog, {
            target: windowContent,
            props: {
                actor: this.#actor,
                config: CONFIG.sr3e,
                onSubmit: (result) => {
                    this.#wasSubmitted = true;
                    this.#onSubmit?.(result);
                    this.close();
                },
                onCancel: () => {
                    this.#onCancel?.();
                    this.close();
                }
            }
        });
    }

    async close(options = {}) {
        if (this.#svelteApp) {
            unmount(this.#svelteApp);
            this.#svelteApp = null;
        }

        if (!this.#wasSubmitted) {
            this.#onCancel?.();
        }

        return super.close(options);
    }
}