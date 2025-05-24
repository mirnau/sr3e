import CommodityModel from "./components/Commodity.js";
import PortabilityModel from "./components/Portability.js";

export default class AmmunitionModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            type: new foundry.data.fields.StringField({
                required: true,
                initial: "regular",
            }),
            rounds: new foundry.data.fields.NumberField({
                required: true,
                initial: 10,
                integer: true,
            }),
            compatibleWeaponIds: new foundry.data.fields.ArrayField(
                new foundry.data.fields.StringField()),
                
            ...PortabilityModel.defineSchema(),
            ...CommodityModel.defineSchema(),
        };
    }
}
