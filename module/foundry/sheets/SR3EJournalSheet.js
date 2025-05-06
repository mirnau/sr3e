class SR3EJournalEntry {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["my-journal-sheet"],
            template: "modules/my-module/templates/my-journal-sheet.html",
        });
    }

    getData(options) {
        const data = super.getData(options);
        // Add custom data here
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        // Add event listeners here
    }
}

Hooks.once("init", () => {
    Journal.registerSheet("my-module", MyJournalSheet, {
        types: ["base"], // or your custom types
        makeDefault: false,
    });
});
