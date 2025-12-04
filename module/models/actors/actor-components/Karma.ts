import SimpleStat from "./SimpleStat";

type KarmaSchema = {
  goodKarma: NumberField;
  karmaPool: EmbeddedDataField<typeof SimpleStat>;
  karmaPoolCeiling: NumberField;
  pendingKarmaReward: NumberField;
  readyForCommit: BooleanField;
  lifetimeKarma: NumberField;
  spentKarma: NumberField;
  miraculousSurvival: BooleanField;
};

export default class KarmaModel extends foundry.abstract.DataModel<
  KarmaSchema,
  BaseActor
> {
  static defineSchema(): KarmaSchema {
    return {
      goodKarma: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      karmaPool: new EmbeddedDataField(SimpleStat),
      //NOTE: Used to calculate the current karma pool reset, not exposed to the player
      karmaPoolCeiling: new NumberField({
        required: true,
        initial: 1,
        integer: true,
      }),
      pendingKarmaReward: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      readyForCommit: new BooleanField({
        required: true,
        initial: false,
      }),
      //NOTE: Used to calculate the current karmaPoolCeiling, not exposed to the player
      lifetimeKarma: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      spentKarma: new NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      miraculousSurvival: new BooleanField({
        required: true,
        initial: false,
      }),
    };
  }
}
