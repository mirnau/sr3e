import CommodityModel from "@models/CommodityModel.js";

export default class GadgetEffect extends ActiveEffect {
  static get documentName() {
    return "Custom Gadget";
  }

  get isGadget() {
    return true;
  }
}