import ProfileModel from "./actor-components/Profile";
import AttributesModel from "./actor-components/Attributes";
import CreationModel from "./actor-components/Creation";
import KarmaModel from "./actor-components/Karma";
import HealthModel from "./actor-components/Health";
import DicePoolsModel from "./actor-components/DicePools";
import MovementModel from "./actor-components/Movement";

type CharacterSchema = {
  attributes: EmbeddedDataField<typeof AttributesModel>;
  dicePools: EmbeddedDataField<typeof DicePoolsModel>;
  movement: EmbeddedDataField<typeof MovementModel>;
  profile: EmbeddedDataField<typeof ProfileModel>;
  creation: EmbeddedDataField<typeof CreationModel>;
  karma: EmbeddedDataField<typeof KarmaModel>;
  health: EmbeddedDataField<typeof HealthModel>;
  journalEntryUuid: StringField;
};

export default class CharacterModel extends foundry.abstract.TypeDataModel<
  CharacterSchema,
  BaseActor
> {
  static defineSchema(): CharacterSchema {
    return {
      attributes: new EmbeddedDataField(AttributesModel),
      dicePools: new EmbeddedDataField(DicePoolsModel),
      movement: new EmbeddedDataField(MovementModel),
      profile: new EmbeddedDataField(ProfileModel),
      creation: new EmbeddedDataField(CreationModel),
      karma: new EmbeddedDataField(KarmaModel),
      health: new EmbeddedDataField(HealthModel),
      journalEntryUuid: new StringField({
        required: false,
        initial: "",
      }),
    };
  }
}
