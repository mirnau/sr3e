export default class KarmaModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return {
        goodKarma: new foundry.data.fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        karmaPool: new foundry.data.fields.NumberField({
          required: true,
          initial: 1,
          integer: true,
        }),
        //NOTE: Used to calculate the current karma pool, not exposed to the player
        lifetimeKarma: new foundry.data.fields.NumberField({
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