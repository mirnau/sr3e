import SkillProcedure from "./SkillProcedure.js";
import AttributeProcedure from "./AttributeProcedure.js";
import FirearmProcedure from "./FirearmProcedure.js";
import MeleeProcedure from "./MeleeProcedure.js";
import ExplosiveProcedure from "./ExplosiveProcedure.js";
import DodgeProcedure from "./DodgeProcedure.js";
import ResistanceProcedure from "./ResistanceProcedure.js";
import MeleeDefenseProcedure from "./MeleeDefenseProcedure.js";

/**
 * Create a procedure instance by kind. No extra logic.
 */
export default class ProcedureFactory {
   static type = Object.freeze({
      skill: "skill",
      attribute: "attribute",
      firearm: "firearm",
      melee: "melee",
      explosive: "explosive",
      dodge: "dodge",
      resistance: "resistance",
      meleeDefense: "melee-defense",
   });

   /**
    * @param {"skill"|"attribute"|"firearm"|"melee"|"explosive"|"dodge"|"resistance"|"melee-defense"} kind
    * @param {{ actor: Actor, item?: Item|null, args?: object }} opts
    * @returns {AbstractProcedure|null}
    */
   static Create(kind, { actor, item = null, args = {} } = {}) {
      const key = String(kind);
      if (!actor) return null;

      switch (key) {
         case this.type.skill:
            return new SkillProcedure(actor, null, args);
         case this.type.attribute:
            return new AttributeProcedure(actor, null, args);
         case this.type.firearm:
            return new FirearmProcedure(actor, item, args);
         case this.type.melee:
            return new MeleeProcedure(actor, item, args);
         case this.type.explosive:
            return ExplosiveProcedure ? new ExplosiveProcedure(actor, item, args) : null;
         case this.type.dodge:
            return new DodgeProcedure(actor, null, args);
         case this.type.resistance:
            return new ResistanceProcedure(actor, null, args);
         case this.type.meleeDefense:
            return new MeleeDefenseProcedure(actor, null, args);
         default:
            return null;
      }
   }

   static resolveProcedureType(weapon) {
      if (!weapon || weapon.type !== "weapon") return null;

      const family = String(weapon.system?.family ?? "").toLowerCase();
      const mode = String(weapon.system?.mode ?? "").toLowerCase();

      const FIREARM_MODES = new Set(["manual", "semiauto", "burst", "fullauto"]);
      const MELEE_MODES = new Set(["melee", "blade", "blunt", "polearm", "unarmed"]);
      const EXPLOSIVE_MODES = new Set(["explosive", "grenade", "launcher"]);

      if (family === this.type.firearm || FIREARM_MODES.has(mode)) return this.type.firearm;
      if (family === this.type.melee || MELEE_MODES.has(mode)) return this.type.melee;
      if (family === this.type.explosive || EXPLOSIVE_MODES.has(mode)) return this.type.explosive;

      return null;
   }
}
