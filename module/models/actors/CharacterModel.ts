import ProfileModel from "./actor-components/Profile";
import AttributesModel from "./actor-components/Attributes";
import CreationModel from "./actor-components/Creation";
import KarmaModel from "./actor-components/Karma";
import HealthModel from "./actor-components/Health";
import DicePoolsModel from "./actor-components/DicePools";
import MovementModel from "./actor-components/Movement";
import GarageEntryModel from "./actor-components/GarageEntry";

type CharacterSchema = {
  attributes: EmbeddedDataField<typeof AttributesModel>;
  dicePools: EmbeddedDataField<typeof DicePoolsModel>;
  movement: EmbeddedDataField<typeof MovementModel>;
  profile: EmbeddedDataField<typeof ProfileModel>;
  creation: EmbeddedDataField<typeof CreationModel>;
  karma: EmbeddedDataField<typeof KarmaModel>;
  health: EmbeddedDataField<typeof HealthModel>;
  journalEntryUuid: StringField;
  garage: ArrayField<EmbeddedDataField<typeof GarageEntryModel>>;
};

export default class CharacterModel extends foundry.abstract.TypeDataModel<
  CharacterSchema,
  BaseActor
> {
  // garage used to be a bare array of vehicle-actor UUID strings; it's now
  // an array of {uuid, seated, vcrId, jackedIn} entries. Without this,
  // pre-existing string entries fail EmbeddedDataField casting and the
  // whole array silently resets to [] on load — see the "drop does nothing"
  // bug in the vehicle-rigger feature.
  static migrateData(source: Record<string, unknown>): Record<string, unknown> {
    if (Array.isArray(source.garage)) {
      source.garage = source.garage.map((entry) =>
        typeof entry === "string" ? { uuid: entry, seated: false, vcrId: "", jackedIn: false } : entry
      );
    }
    return super.migrateData(source);
  }

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
      garage: new ArrayField(new EmbeddedDataField(GarageEntryModel), {
        initial: [],
      }),
    };
  }
}
