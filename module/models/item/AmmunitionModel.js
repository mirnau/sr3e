import CommodityModel from "@models/item/components/Commodity.js";
import PortabilityModel from "@models/item/components/Portability.js";

export default class AmmunitionModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            class: new foundry.data.fields.StringField({
                required: true,
                initial: "regular",
            }),
            type: new foundry.data.fields.StringField({
                required: true,
                initial: "lightPistol",
            }),
            rounds: new foundry.data.fields.NumberField({
                required: true,
                initial: 10,
                integer: true,
            }),
            compatibleWeaponIds: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField()),
                
            commodity: CommodityModel.defineSchema(),
            portability: PortabilityModel.defineSchema(),
        };
    }
}
