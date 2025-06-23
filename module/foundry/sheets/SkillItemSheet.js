import SkillApp from "../../svelte/apps/SkillApp.svelte";
import { mount, unmount } from "svelte";
import { localize } from "../../services/utilities.js";

export default class SkillItemSheet extends foundry.applications.sheets.ItemSheetV2 {

    #skill

    get title() {
        const type = this.item.system.skillType ?? "active";
        const typeLabel = localize(CONFIG.sr3e.skill[type]);
        return `${typeLabel}: ${this.item.name}`;
    }

    static get DEFAULT_OPTIONS() {
        return {
            ...super.DEFAULT_OPTIONS,
            id: `sr3e-character-sheet-${foundry.utils.randomID()}`,
            classes: ["sr3e", "sheet", "item", "skill"],
            template: null,
            position: { width: 'auto', height: 'auto' },
            window: {
                resizable: false
            },
            tag: "form",
            submitOnChange: true,
            closeOnSubmit: false
        };
    }

    _renderHTML() {
        return null;
    }

    _replaceHTML(_, windowContent) {
        if (this.#skill) {
            unmount(this.#skill);
            this.#skill = null;
        }

        this.#skill = mount(SkillApp, {
            target: windowContent,
            props: {
                item: this.document,
                config: CONFIG.sr3e,
                onTitleChange: (newTitle) => {
                    const titleElement = this.element.querySelector('.window-title');
                    if (titleElement) {
                        titleElement.textContent = newTitle;
                    }
                }
            }
        });


        return windowContent;
    }

    /** @override prevent submission, since Svelte is managing state */
    _onSubmit(event) { return; }
}