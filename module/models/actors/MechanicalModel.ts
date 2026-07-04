import CommodityModel from "../items/item-components/Commodity";
import CustomTokenModel from "../items/item-components/CustomToken";
import SimpleStat from "./actor-components/SimpleStat";

export default class MechanicalModel extends foundry.abstract.TypeDataModel<
  MechanicalSchema,
  BaseActor
> {
  // speed was split into three concepts: currentSpeed (live speed during a
  // chase, e.g. for Maneuver Score's Speed Points), speedRating (the rated
  // safe top speed — SR3's stat-block "Speed"), and maxSpeed (renamed from
  // speedMax, the absolute technical ceiling above the safe rating).
  static migrateData(source: Record<string, unknown>): Record<string, unknown> {
    if (source.speed !== undefined && source.currentSpeed === undefined) {
      source.currentSpeed = source.speed;
    }
    if (source.speedMax !== undefined && source.maxSpeed === undefined) {
      source.maxSpeed = source.speedMax;
    }
    return super.migrateData(source);
  }

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
      vehicleType: new StringField({
        initial: "ground",
        choices: ["ground", "marine", "aviation"],
      }),
      handling: new EmbeddedDataField(SimpleStat),
      handlingRoad: new EmbeddedDataField(SimpleStat),
      handlingOffRoad: new EmbeddedDataField(SimpleStat),
      currentSpeed: new EmbeddedDataField(SimpleStat),
      speedRating: new EmbeddedDataField(SimpleStat),
      maxSpeed: new EmbeddedDataField(SimpleStat),
      speedStall: new EmbeddedDataField(SimpleStat),
      accel: new EmbeddedDataField(SimpleStat),
      body: new EmbeddedDataField(SimpleStat),
      armor: new EmbeddedDataField(SimpleStat),
      signature: new EmbeddedDataField(SimpleStat),
      autonav: new EmbeddedDataField(SimpleStat),
      pilot: new EmbeddedDataField(SimpleStat),
      sensor: new EmbeddedDataField(SimpleStat),
      ecm: new EmbeddedDataField(SimpleStat),
      eccm: new EmbeddedDataField(SimpleStat),
      flux: new EmbeddedDataField(SimpleStat),
      cargo: new EmbeddedDataField(SimpleStat),
      load: new EmbeddedDataField(SimpleStat),
      speedTurbo: new EmbeddedDataField(SimpleStat),
      accelTurbo: new EmbeddedDataField(SimpleStat),
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
        firmpoints: new EmbeddedDataField(SimpleStat),
        hardpoints: new EmbeddedDataField(SimpleStat),
        turrets: new EmbeddedDataField(SimpleStat),
        externalFixed: new EmbeddedDataField(SimpleStat),
        internalFixed: new EmbeddedDataField(SimpleStat),
        pintles: new EmbeddedDataField(SimpleStat),
        miniTurrets: new EmbeddedDataField(SimpleStat),
      }),
      condition: new EmbeddedDataField(SimpleStat),
      commodity: new EmbeddedDataField(CommodityModel),
      customToken: new EmbeddedDataField(CustomTokenModel),
      journalId: new StringField({
        required: true,
        initial: "",
      }),
    };
  }
}
type MountsSchema = {
  firmpoints: EmbeddedDataField<typeof SimpleStat>;
  hardpoints: EmbeddedDataField<typeof SimpleStat>;
  turrets: EmbeddedDataField<typeof SimpleStat>;
  externalFixed: EmbeddedDataField<typeof SimpleStat>;
  internalFixed: EmbeddedDataField<typeof SimpleStat>;
  pintles: EmbeddedDataField<typeof SimpleStat>;
  miniTurrets: EmbeddedDataField<typeof SimpleStat>;
};

type MechanicalSchema = {
  category: StringField;
  power: StringField;
  vehicleType: StringField;
  handling: EmbeddedDataField<typeof SimpleStat>;
  handlingRoad: EmbeddedDataField<typeof SimpleStat>;
  handlingOffRoad: EmbeddedDataField<typeof SimpleStat>;
  currentSpeed: EmbeddedDataField<typeof SimpleStat>;
  speedRating: EmbeddedDataField<typeof SimpleStat>;
  maxSpeed: EmbeddedDataField<typeof SimpleStat>;
  speedStall: EmbeddedDataField<typeof SimpleStat>;
  accel: EmbeddedDataField<typeof SimpleStat>;
  body: EmbeddedDataField<typeof SimpleStat>;
  armor: EmbeddedDataField<typeof SimpleStat>;
  signature: EmbeddedDataField<typeof SimpleStat>;
  autonav: EmbeddedDataField<typeof SimpleStat>;
  pilot: EmbeddedDataField<typeof SimpleStat>;
  sensor: EmbeddedDataField<typeof SimpleStat>;
  ecm: EmbeddedDataField<typeof SimpleStat>;
  eccm: EmbeddedDataField<typeof SimpleStat>;
  flux: EmbeddedDataField<typeof SimpleStat>;
  cargo: EmbeddedDataField<typeof SimpleStat>;
  load: EmbeddedDataField<typeof SimpleStat>;
  speedTurbo: EmbeddedDataField<typeof SimpleStat>;
  accelTurbo: EmbeddedDataField<typeof SimpleStat>;
  seating: StringField;
  entryPoints: StringField;
  setupBreakdownMinutes: NumberField;
  landingTakeoff: StringField;
  riggerAdaptation: BooleanField;
  remoteControlInterface: BooleanField;
  mounts: SchemaField<MountsSchema>;
  condition: EmbeddedDataField<typeof SimpleStat>;
  commodity: EmbeddedDataField<typeof CommodityModel>;
  customToken: EmbeddedDataField<typeof CustomTokenModel>;
  journalId: StringField;
};
