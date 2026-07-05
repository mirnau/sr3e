import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

type CyberdeckSchema = {
  mpcp: NumberField;
  persona: SchemaField<{
    bod: NumberField;
    evasion: NumberField;
    masking: NumberField;
    sensor: NumberField;
  }>;
  sleazeRating: NumberField;
  essenceCost: NumberField;
  stats: SchemaField<{
    hardening: NumberField;
    ioSpeed: NumberField;
    responseIncrease: NumberField;
  }>;
  memory: SchemaField<{
    active: SchemaField<{ value: NumberField; max: NumberField }>;
    storage: SchemaField<{ value: NumberField; max: NumberField }>;
  }>;
  derived: SchemaField<{
    detectionFactor: NumberField;
    hackingPool: NumberField;
  }>;
  journalId: StringField;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
  jackedIn: BooleanField;
};

export default class CyberdeckModel extends foundry.abstract.TypeDataModel<CyberdeckSchema, BaseItem> {
  static defineSchema(): CyberdeckSchema {
    return {
      mpcp: ratingField(1),
      persona: new SchemaField({
        bod: ratingField(0),
        evasion: ratingField(0),
        masking: ratingField(0),
        sensor: ratingField(0),
      }),
      sleazeRating: ratingField(0),
      essenceCost: new NumberField({ required: true, initial: 0 }),
      stats: new SchemaField({
        hardening: ratingField(0),
        ioSpeed: positiveInteger(0),
        responseIncrease: new NumberField({ required: true, integer: true, min: 0, max: 3, initial: 0 }),
      }),
      memory: new SchemaField({
        active: memoryField(),
        storage: memoryField(),
      }),
      derived: new SchemaField({
        detectionFactor: positiveInteger(0),
        hackingPool: positiveInteger(0),
      }),
      journalId: new StringField({ required: true, initial: "" }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
      jackedIn: new BooleanField({ required: true, initial: false }),
    };
  }
}

function ratingField(initial: number): NumberField {
  return new NumberField({ required: true, integer: true, min: 0, initial });
}

function positiveInteger(initial: number): NumberField {
  return new NumberField({ required: true, integer: true, min: 0, initial });
}

function memoryField(): SchemaField<{ value: NumberField; max: NumberField }> {
  return new SchemaField({
    value: positiveInteger(0),
    max: positiveInteger(0),
  });
}
