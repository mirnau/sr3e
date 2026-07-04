type GarageEntrySchema = {
  uuid: StringField;
  seated: BooleanField;
  vcrId: StringField;
  jackedIn: BooleanField;
};

export default class GarageEntryModel extends foundry.abstract.DataModel<
  GarageEntrySchema
> {
  static defineSchema(): GarageEntrySchema {
    return {
      uuid: new StringField({
        required: true,
        nullable: false,
        initial: "",
      }),
      seated: new BooleanField({
        required: true,
        initial: false,
      }),
      vcrId: new StringField({
        required: true,
        initial: "",
      }),
      jackedIn: new BooleanField({
        required: true,
        initial: false,
      }),
    };
  }
}
