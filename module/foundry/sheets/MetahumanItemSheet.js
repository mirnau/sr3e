export default class MetahumanItemSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/sr3e/default.html",
            width: "auto",
            height: "auto",
            classes: ["sr3e", "sheet", "item"],
            resizable: false
        });
    }
}
