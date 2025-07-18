import SimpleStat from "./SimpleStat";
export default class KarmaModel extends foundry.abstract.TypeDataModel {
   static defineSchema() {
      return {
         goodKarma: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
         }),
         karmaPool: new foundry.data.fields.SchemaField(SimpleStat.defineSchema()),

         //NOTE: Used to calculate the current karma pool reset, not exposed to the player
         karmaPoolCeiling: new foundry.data.fields.NumberField({
            required: true,
            initial: 1,
            integer: true,
         }),
         pendingKarmaReward: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
         }),
         readyForCommit: new foundry.data.fields.BooleanField({
            required: true,
            initial: false,
         }),
         //NOTE: Used to calculate the current karmaPoolCeiling, not exposed to the player
         lifetimeKarma: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
         }),
         spentKarma: new foundry.data.fields.NumberField({
            required: true,
            initial: 0,
            integer: true,
         }),
         miraculousSurvival: new foundry.data.fields.BooleanField({
            required: true,
            initial: false,
         }),
      };
   }
}
