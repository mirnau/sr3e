import GadgetCreatorModel from "@models/item/GadgetCreatorModel.js";


export default class GadgetModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      _id: new foundry.data.fields.StringField({ required: true }),
      name: new foundry.data.fields.StringField({ required: true }),
      type: new foundry.data.fields.StringField({ required: true }),
      img: new foundry.data.fields.StringField(),
      system: new foundry.data.fields.SchemaField(GadgetCreatorModel.defineSchema()),
      effects: new foundry.data.fields.ArrayField(new foundry.data.fields.ObjectField()),
      flags: new foundry.data.fields.ObjectField({ initial: {} }),
    };
  }
}
