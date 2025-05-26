export default class StatCardTypeRegistryService {

    static SheetComponentTypes = [
        {
            type: "text",
            name: "Text",
            default: ""
        },
        {
            type: "number",
            name: "Number",
            default: 0
        },
        {
            type: "boolean",
            name: "Boolean",
            default: false
        },
        {
            type: "image",
            name: "Image",
            path: "",
            default: false
        },
        {
            type: "select",
            name: "Select",
            selection: "",
            options: []
        },
        {
            type: "multiselect",
            name: "Multi-Select",
            selections: [],
            options: []
        }
    ];

    static getAll() {
        return Object.entries(this.registry).map(([key, config]) => ({
            id: key,
            ...config
        }));
    }

    static get(type) {
        return this.registry[type];
    }
}