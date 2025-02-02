export default class MetahumanItemSheet extends ItemSheet {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/sr3e/default.html",
            width: "100%",
            height: "100%",
            left: 200,  
            top: 200,   
            classes: ["sr3e", "sheet", "item"],
            resizable: false
        });
    }

    /** @override prevent submission, since Svelte is managing state */
    _onSubmit(event) { return; }
}