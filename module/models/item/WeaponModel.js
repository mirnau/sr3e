import CommodityModel from "./components/Commodity.js";
import PortabilityModel from "./components/Portability.js";

export default class WeaponModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            damage: new foundry.data.fields.StringField({
                required: true,
                initial: "N/A",
            }),
            mode: new foundry.data.fields.StringField({
                required: true,
                initial: "semi-automatic",
            }),
            range: new foundry.data.fields.NumberField({
                required: true,
                initial: 0,
                integer: true,
            }),
            recoilComp: new foundry.data.fields.NumberField({
                required: true,
                initial: 0.0,
            }),
            currentClipId: new foundry.data.fields.StringField({
                required: false,
                nullable: true,
            }),
            ...PortabilityModel.defineSchema(),
            ...CommodityModel.defineSchema(),
        };
    }
}