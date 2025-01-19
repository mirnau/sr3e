import CharacterSheetApp from '../../svelte/apps/CharacterSheetApp.svelte';

export default class CharacterActorSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ['sr3e', 'sheet', 'character'],
            template: 'systems/sr3e/templates/sheet/actor/character-sheet.html',
            width: 800,
            height: 600,
        });
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        const selector = ".window-content";

        const container = document.querySelector(selector);
        container.innerHTML = '';

        if (container) {
            console.log("Mounting Svelte app...");
            this.svelteApp = new CharacterSheetApp({
                target: container,
                props: { actor: { name: "Test Actor", type: "Test Type" } },
            });

        } else {
            console.warn(`Container not found. Ensure ${selector} exists in the template.`);
        }

        console.log("End of Activate Listeners");
    }

    /** @override */
    close(options) {
        if (this.svelteApp) {
            console.log("Destroying Svelte app...");
            this.svelteApp.$destroy();
            this.svelteApp = null;
        }
        return super.close(options);
    }
}
