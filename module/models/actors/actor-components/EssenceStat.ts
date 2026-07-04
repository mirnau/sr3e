export default class EssenceStat extends foundry.abstract.DataModel<
  EssenceStatSchema
> {
  static defineSchema(): EssenceStatSchema {
    return {
      // Essence is expressed to one decimal place per the book (e.g. 5.9,
      // 4.5) — unlike every other SimpleStat-backed attribute, it must not
      // be coerced to an integer.
      value: new NumberField({
        required: true,
        initial: 6,
      }),
      mod: new NumberField({
        required: true,
        initial: 0,
      }),
    };
  }
}

type EssenceStatSchema = {
  value: NumberField;
  mod: NumberField;
};
