import CharacterCreation from "../../svelte/apps/dialogs/CharacterCreationDialogApp.svelte";
import { mount, unmount } from "svelte";

export default class CharacterCreationDialog extends Dialog {
    constructor(actor, resolve) {
        super({
            title: "Character Creation",
            content: "<p>If this displays, there was an issue with the Svelte component in CharacterCreationDialog.js</p>",
            default: "ok",
            buttons: {
                ok: {
                    label: "OK",
                    callback: async (html) => console.log("OK clicked")
                },
                cancel: {
                    label: "Cancel",
                    callback: () => console.log("Cancel clicked")
                }
            },
            render: (html) => {

                this.element.addClass("sr3e");

                const container = this.element[0].querySelector(".window-content");
                container.innerHTML = '';
                //classes: ["sr3e", "sheet", "item"],

                this.svelteApp = mount(CharacterCreation, {
                    target: container,
                    props: {
                        actor: actor,
                        resolve: resolve,
                    },
                });
            }
        });
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: "100%",
            height: "100%",
            left: 200,  
            top: 200,   
            resizable: false
        });
    }

     /** @override */ close(options = {}) {

        if (this.svelteApp) {
            unmount(this.svelteApp)
        }

        return super.close(options);
    }
}