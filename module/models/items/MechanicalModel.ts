import CommodityModel from "./item-components/Commodity";
import CustomTokenModel from "./item-components/CustomToken";

type MountsSchema = {
  firmpoints: NumberField;
  hardpoints: NumberField;
  turrets: NumberField;
  externalFixed: NumberField;
  internalFixed: NumberField;
  pintles: NumberField;
  miniTurrets: NumberField;
};

type MechanicalSchema = {
  category: StringField;
  power: StringField;
  handling: NumberField;
  speed: NumberField;
  accel: NumberField;
  body: NumberField;
  armor: NumberField;
  signature: NumberField;
  autonav: NumberField;
  pilot: NumberField;
  sensor: NumberField;
  cargo: NumberField;
  load: NumberField;
  speedTurbo: NumberField;
  accelTurbo: NumberField;
  seating: StringField;
  entryPoints: StringField;
  setupBreakdownMinutes: NumberField;
  landingTakeoff: StringField;
  riggerAdaptation: BooleanField;
  remoteControlInterface: BooleanField;
  mounts: SchemaField<MountsSchema>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
  customToken: EmbeddedDataField<typeof CustomTokenModel>;
};

export default class MechanicalModel extends DataModel<
  MechanicalSchema,
  BaseItem
> {
  static defineSchema(): MechanicalSchema {
    return {
      category: new StringField({
        initial: "car",
        choices: [
          "car",
          "truck",
          "bike",
          "hovercraft",
          "boat",
          "ship",
          "submarine",
          "fixedWing",
          "rotor",
          "vectoredThrust",
          "lta",
          "security",
          "military",
          "tBird",
          "drone",
        ],
      }),
      power: new StringField({
        initial: "petrochem",
        choices: ["electric", "petrochem", "methanol", "fusion", "sail", "other"],
      }),
      handling: new NumberField({ integer: true, min: 0, initial: 0 }),
      speed: new NumberField({ integer: true, min: 0, initial: 0 }),
      accel: new NumberField({ integer: true, min: 0, initial: 0 }),
      body: new NumberField({ integer: true, min: 0, initial: 0 }),
      armor: new NumberField({ integer: true, min: 0, initial: 0 }),
      signature: new NumberField({ integer: true, min: 0, initial: 0 }),
      autonav: new NumberField({ integer: true, min: 0, initial: 0 }),
      pilot: new NumberField({ integer: true, min: 0, initial: 0 }),
      sensor: new NumberField({ integer: true, min: 0, initial: 0 }),
      cargo: new NumberField({ integer: true, min: 0, initial: 0 }),
      load: new NumberField({ integer: true, min: 0, initial: 0 }),
      speedTurbo: new NumberField({
        integer: true,
        min: 0,
        nullable: true,
      }),
      accelTurbo: new NumberField({
        integer: true,
        min: 0,
        nullable: true,
      }),
      seating: new StringField({
        initial: "",
        blank: true,
      }),
      entryPoints: new StringField({
        initial: "",
        blank: true,
      }),
      setupBreakdownMinutes: new NumberField({
        integer: true,
        min: 0,
        initial: 0,
      }),
      landingTakeoff: new StringField({
        initial: "",
        blank: true,
        choices: ["", "VTOL", "VSTOL", "Runway", "LaunchRecovery"],
      }),
      riggerAdaptation: new BooleanField({ initial: false }),
      remoteControlInterface: new BooleanField({ initial: false }),
      mounts: new SchemaField({
        firmpoints: new NumberField({ integer: true, min: 0, initial: 0 }),
        hardpoints: new NumberField({ integer: true, min: 0, initial: 0 }),
        turrets: new NumberField({ integer: true, min: 0, initial: 0 }),
        externalFixed: new NumberField({
          integer: true,
          min: 0,
          initial: 0,
        }),
        internalFixed: new NumberField({
          integer: true,
          min: 0,
          initial: 0,
        }),
        pintles: new NumberField({ integer: true, min: 0, initial: 0 }),
        miniTurrets: new NumberField({ integer: true, min: 0, initial: 0 }),
      }),
      commodity: new EmbeddedDataField(CommodityModel),
      customToken: new EmbeddedDataField(CustomTokenModel),
    };
  }
}
