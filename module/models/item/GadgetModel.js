import CommodityModel from "./components/Commodity.js";
import PortabilityModel from "./components/Portability.js";

export default class GadgetModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         ...PortabilityModel.defineSchema(),
         ...CommodityModel.defineSchema(),
      };
   }
}
