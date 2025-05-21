import JournalSearchApp from "../../svelte/apps/dialogs/JournalSearchModal.svelte";

export default class JournalSearchDialog extends foundry.applications.api.DialogV2 {
    #app;
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: `sr3e-journal-search-${foundry.utils.randomID()}`,
            title: "Journal Search",
            classes: ["sr3e", "dialog", "journal-search"],
            width: 600,
            height: "auto",
            window: { resizable: true },
            buttons: {
                cancel: { label: "Cancel", action: "close" }
            },
            svelte: {
                class: JournalSearchApp,
                props: {}
            }
        });
    }

    mount(html) {
        this.app = new JournalSearchApp({
            target: html.find(".dialog-content")[0],
            props: this.options.svelte.props
        });
    }

    unmount() {
        this.app.$destroy();
    }

    static prompt() {
        return new Promise(resolve => {
            const dialog = new this({
                svelte: { props: { resolve } }
            });
            dialog.render(true);
        });
    }
}
