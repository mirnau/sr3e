// module/models/MechanicalModel.js
const { fields } = foundry.data;
import CommodityModel from "@models/item/components/Commodity.js";
import CustomToken from "@models/item/components/CustomToken.js";

/**
 * MechanicalModel — unified vehicle/drone schema (SR3E pp. 308–312).
 * No business logic. No derived fields. Data only.
 */
export default class MechanicalModel extends foundry.abstract.DataModel {
   static defineSchema() {
      return {
         // Classification
         category: new fields.StringField({
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
         power: new fields.StringField({
            initial: "petrochem",
            choices: ["electric", "petrochem", "methanol", "fusion", "sail", "other"],
         }),

         // Core stats
         handling: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         speed: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         accel: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         body: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         armor: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         signature: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         autonav: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         pilot: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         sensor: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         cargo: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         load: new fields.NumberField({ integer: true, min: 0, initial: 0 }),

         // Optional alternate performance rows (e.g., Std/Turbo or Elec/Meth)
         speedTurbo: new fields.NumberField({ integer: true, min: 0, nullable: true }),
         accelTurbo: new fields.NumberField({ integer: true, min: 0, nullable: true }),

         // Cabin & access
         seating: new fields.StringField({ initial: "", blank: true }), // e.g., "2 bucket + 1 bench"
         entryPoints: new fields.StringField({ initial: "", blank: true }), // e.g., "2+1t"

         // Drone ops notes
         setupBreakdownMinutes: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         landingTakeoff: new fields.StringField({
            initial: "",
            blank: true,
            choices: ["", "VTOL", "VSTOL", "Runway", "LaunchRecovery"],
         }),

         // Rigger capability flags
         riggerAdaptation: new fields.BooleanField({ initial: false }),
         remoteControlInterface: new fields.BooleanField({ initial: false }),

         // Weapon mount bookkeeping (explicit counts; no derivations)
         mounts: new fields.SchemaField({
            firmpoints: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            hardpoints: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            turrets: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            externalFixed: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            internalFixed: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            pintles: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
            miniTurrets: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
         }),

         // Pricing and legality
         commodity: new fields.SchemaField(CommodityModel.defineSchema()),

         // Optional custom token footprint/art for scenes
         customToken: new fields.SchemaField(CustomToken.defineSchema()),
      };
   }
}
