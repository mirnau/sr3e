import CommodityModel from "./item-components/Commodity";
import PortabilityModel from "./item-components/Portability";

type LoadedProgramSchema = {
  uuid: StringField;
  kind: StringField;
  tag: StringField;
  rating: NumberField;
  active: BooleanField;
};

type TechInterfaceSchema = {
  subtype: StringField;
  matrix: SchemaField<{
    mpcp: NumberField;
    bod: NumberField;
    evasion: NumberField;
    masking: NumberField;
    sensor: NumberField;
    hardening: NumberField;
    activeMp: NumberField;
    storageMp: NumberField;
    ioMpPerCT: NumberField;
    responseIncrease: NumberField;
  }>;
  rigger: SchemaField<{
    rating: NumberField;
    fluxRating: NumberField;
    subscribers: ArrayField<StringField>;
  }>;
  loaded: SchemaField<{
    programs: ArrayField<SchemaField<LoadedProgramSchema>>;
    riggerModes: ArrayField<StringField>;
  }>;
  portability: EmbeddedDataField<typeof PortabilityModel>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
};

export default class TechnicalInterfaceModel extends DataModel<
  TechInterfaceSchema,
  BaseItem
> {
  static defineSchema(): TechInterfaceSchema {
    return {
      subtype: new StringField({
        required: true,
        initial: "cyberdeck",
        choices: ["cyberdeck", "rcdeck", "cyberterminal"],
      }),
      matrix: new SchemaField({
        mpcp: new NumberField({ integer: true, min: 0, initial: 0 }),
        bod: new NumberField({ integer: true, min: 0, initial: 0 }),
        evasion: new NumberField({ integer: true, min: 0, initial: 0 }),
        masking: new NumberField({ integer: true, min: 0, initial: 0 }),
        sensor: new NumberField({ integer: true, min: 0, initial: 0 }),
        hardening: new NumberField({ integer: true, min: 0, initial: 0 }),
        activeMp: new NumberField({ integer: true, min: 0, initial: 0 }),
        storageMp: new NumberField({ integer: true, min: 0, initial: 0 }),
        ioMpPerCT: new NumberField({ integer: true, min: 0, initial: 0 }),
        responseIncrease: new NumberField({
          integer: true,
          min: 0,
          max: 3,
          initial: 0,
        }),
      }),
      rigger: new SchemaField({
        rating: new NumberField({ integer: true, min: 0, initial: 0 }),
        fluxRating: new NumberField({ integer: true, min: 0, initial: 0 }),
        subscribers: new ArrayField(new StringField({ nullable: false }), {
          initial: [],
        }),
      }),
      loaded: new SchemaField({
        programs: new ArrayField(
          new SchemaField<LoadedProgramSchema>({
            uuid: new StringField({ required: true }),
            kind: new StringField({ initial: "operational" }),
            tag: new StringField({ initial: "" }),
            rating: new NumberField({ integer: true, min: 0, initial: 0 }),
            active: new BooleanField({ initial: true }),
          }),
          { initial: [] }
        ),
        riggerModes: new ArrayField(new StringField(), {
          initial: [],
        }),
      }),
      portability: new EmbeddedDataField(PortabilityModel),
      commodity: new EmbeddedDataField(CommodityModel),
    };
  }
}
