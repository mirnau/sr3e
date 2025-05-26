import { localize } from "../../../svelteHelpers.js";

export default class SR3EComponentModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            components: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField({
                    id: new foundry.data.fields.StringField({ required: true }),
                    name: new foundry.data.fields.StringField({ initial: "Untitled Component" }),
                    type: new foundry.data.fields.StringField({ initial: "custom" }),
                    collapsed: new foundry.data.fields.BooleanField({ initial: false }),
                    SheetComponents: new foundry.data.fields.ArrayField(
                        new foundry.data.fields.SchemaField({
                            id: new foundry.data.fields.StringField({ required: true }),
                            name: new foundry.data.fields.StringField({ initial: "Untitled Stat" }),
                            type: new foundry.data.fields.StringField({
                                choices: ["text", "number", "boolean", "select", "textarea"],
                                initial: "text"
                            }),
                            value: new foundry.data.fields.JSONField({ initial: "" }),
                            options: new foundry.data.fields.ArrayField(
                                new foundry.data.fields.StringField(),
                                { initial: [] }
                            ),
                            description: new foundry.data.fields.StringField({ initial: "" }),
                            required: new foundry.data.fields.BooleanField({ initial: false })
                        })
                    ),
                    position: new foundry.data.fields.SchemaField({
                        x: new foundry.data.fields.NumberField({ initial: 0 }),
                        y: new foundry.data.fields.NumberField({ initial: 0 })
                    })
                })
            )
        };
    }

    addComponent(name = localize("sr3e.common.custom")) {
        const component = {
            id: foundry.utils.randomID(),
            name,
            type: "custom",
            collapsed: false,
            SheetComponents: [],
            position: { x: 0, y: 0 }
        };
    }

    // Remove a component
    removeComponent(componentId) {
        const index = this.components.findIndex(c => c.id === componentId);
        if (index >= 0) this.components.splice(index, 1);
    }

    // NOTE: the component is either the caller, or called by drag and drop
    addSheetComponent(name = localize("sr3e.component.untitledstat", type = "text")) {
        const component = this.components.find(c => c.id === this.id);

        if (!component) {
            throw new Error("Component not found");
        }

        const SheetComponent = {
            id: foundry.utils.randomID(),
            name,
            type,
            value: "",
            options: [],
            description: "",
            required: false
        };

        component.SheetComponents.push(SheetComponent);
        return SheetComponent.id;
    }

    // Move component to new position
    moveComponent(componentId, x, y) {
      const component = this.components.find(c => c.id === componentId);
      if (component) {
        component.position.x = x;
        component.position.y = y;
      }
    }
    // updateSheetComponent(componentId, SheetComponentId, updates) Removed, SheetComponent will handle its own updates
    // getDefaultValueForType(type)  Removed, SheetComponent will handle its own type
    //duplicateComponent(componentId) removed, duplication is not a common operation in SR3EComponentModel
} 
