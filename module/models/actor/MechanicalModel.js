import CommodityModel from "@models/item/components/Commodity.js";
import CustomToken from "@models/item/components/CustomToken.js";

// Mechanical actor schema (vehicle/drone)
// Mirrors the item variant fields so the actor fully exposes its data.
export default class MechanicalModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const f = foundry.data.fields;
    return {
      // Classification
      category: new f.StringField({
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
      power: new f.StringField({
        initial: "petrochem",
        choices: ["electric", "petrochem", "methanol", "fusion", "sail", "other"],
      }),

      // Core stats
      handling: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      speed: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      accel: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      body: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      armor: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      signature: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      autonav: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      pilot: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      sensor: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      cargo: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      load: new f.NumberField({ integer: true, min: 0, initial: 0 }),

      // Optional alternate performance rows (e.g., Std/Turbo)
      speedTurbo: new f.NumberField({ integer: true, min: 0, nullable: true }),
      accelTurbo: new f.NumberField({ integer: true, min: 0, nullable: true }),

      // Cabin & access
      seating: new f.StringField({ initial: "", blank: true }),
      entryPoints: new f.StringField({ initial: "", blank: true }),

      // Drone ops notes
      setupBreakdownMinutes: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      landingTakeoff: new f.StringField({
        initial: "",
        blank: true,
        choices: ["", "VTOL", "VSTOL", "Runway", "LaunchRecovery"],
      }),

      // Rigger capability flags
      riggerAdaptation: new f.BooleanField({ initial: false }),
      remoteControlInterface: new f.BooleanField({ initial: false }),

      // Weapon mount bookkeeping (explicit counts; no derivations)
      mounts: new f.SchemaField({
        firmpoints: new f.NumberField({ integer: true, min: 0, initial: 0 }),
        hardpoints: new f.NumberField({ integer: true, min: 0, initial: 0 }),
        turrets: new f.NumberField({ integer: true, min: 0, initial: 0 }),
        externalFixed: new f.NumberField({ integer: true, min: 0, initial: 0 }),
        internalFixed: new f.NumberField({ integer: true, min: 0, initial: 0 }),
        pintles: new f.NumberField({ integer: true, min: 0, initial: 0 }),
        miniTurrets: new f.NumberField({ integer: true, min: 0, initial: 0 }),
      }),

      // Pricing and legality
      commodity: new f.SchemaField(CommodityModel.defineSchema()),

      // Optional custom token footprint/art for scenes
      customToken: new f.SchemaField(CustomToken.defineSchema()),

      // Journal link (optional)
      journalEntryUuid: new f.StringField({ initial: "" }),
    };
  }
}
