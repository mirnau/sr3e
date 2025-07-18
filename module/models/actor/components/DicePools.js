import SimpleStat from "./SimpleStat.js";

export default class DicePoolsModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         combat: new foundry.data.fields.NumberField({
  initial: 0,
  required: true,
}),
         astral: new foundry.data.fields.NumberField({
  initial: 0,
  required: true,
}),
         hacking: new foundry.data.fields.NumberField({
  initial: 0,
  required: true,
}),
         control: new foundry.data.fields.NumberField({
  initial: 0,
  required: true,
}),
         spell: new foundry.data.fields.NumberField({
  initial: 0,
  required: true,
}),
      };
   }
}
