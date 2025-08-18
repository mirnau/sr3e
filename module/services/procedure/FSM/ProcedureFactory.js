import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import FirearmProcedure from "@services/procedure/FSM/FirearmProcedure.js";
import DodgeProcedure from "./DodgeProcedure";
import MeleeProcedure from "./MeleeProcedure";
import ResistanceProcedure from "./ResistanceProcedure";
import ExplosiveProcedure from "./ExplosiveProcedure";
import MeleeStandardDefenseProcedure from "./MeleeStandardDefenseProcedure";
import MeleeFullDefenseProcedure from "./MeleeFullDefenseProcedure";

/**
 * ProcedureFactory
 * @param {Actor} actor              The acting actor (attacker or defender depending on context)
 * @param {Item|null} item           The weapon item for attack flows (null for response flows)
 * @param {AbstractProcedure|null} procedure  The initiator's procedure in response flows (optional)
 * @param {string|null} responseType One of: "dodge", "resist", "melee-standard", "melee-full" (case-insensitive)
 */
export function ProcedureFactory(actor, item = null, procedure = null, responseType = null) {
   // ---------- ATTACKER FLOW: build from weapon item ----------
   if (item && (item instanceof Item || (item?.type && item?.system))) {
      if (item.type !== "weapon") {
         DEBUG &&
            LOG.warn(`ProcedureFactory: item.type "${item.type}" is not "weapon"`, { file: __FILE__, line: __LINE__ });
         return null;
      }

      const family = String(item.system?.family ?? "").toLowerCase();
      const mode = String(item.system?.mode ?? "").toLowerCase();

      // Heuristics (support both family and mode-based dispatch)
      const FIREARM_MODES = new Set(["manual", "semiauto", "burst", "fullauto"]);
      const MELEE_MODES = new Set(["melee", "blade", "blunt", "polearm", "unarmed"]);
      const EXPLOSIVE_MODS = new Set(["explosive", "grenade", "launcher"]);

      const isFirearm = family === "firearm" || FIREARM_MODES.has(mode);
      const isMelee = family === "melee" || MELEE_MODES.has(mode);
      const isExplosive = family === "explosive" || EXPLOSIVE_MODS.has(mode);

      if (isFirearm) return new (AbstractProcedure.getCtor?.("firearm") ?? FirearmProcedure)(actor, item);
      if (isMelee) return new (AbstractProcedure.getCtor?.("melee") ?? MeleeProcedure)(actor, item);
      if (isExplosive && ExplosiveProcedure) return new ExplosiveProcedure(actor, item);

      DEBUG &&
         LOG.warn(`ProcedureFactory: attack mode/family not implemented (family="${family}", mode="${mode}")`, {
            file: __FILE__,
            line: __LINE__,
         });
      return null;
   }

   // ---------- DEFENDER/RESPONSE FLOW ----------
   if (responseType && (procedure || actor)) {
      const key = String(responseType).toLowerCase();

      switch (key) {
         case "dodge":
            // Preserve your existing signature (you previously did `new DodgeProcedure(procedure)`)
            return new (AbstractProcedure.getCtor?.("dodge") ?? DodgeProcedure)(procedure);

         case "resist":
         case "resistance":
            return new (AbstractProcedure.getCtor?.("resistance") ?? ResistanceProcedure)(procedure);

         case "melee-standard":
         case "standard":
            // Defender procedure: expects the defender actor
            return new (AbstractProcedure.getCtor?.("melee-standard") ?? MeleeStandardDefenseProcedure)(actor, null, {
               contestId: procedure?.contestId,
            });

         case "melee-full":
         case "full":
            return new (AbstractProcedure.getCtor?.("melee-full") ?? MeleeFullDefenseProcedure)(actor, null, {
               contestId: procedure?.contestId,
            });

         default:
            DEBUG &&
               LOG.warn(`ProcedureFactory: unknown responseType="${responseType}"`, { file: __FILE__, line: __LINE__ });
            return null;
      }
   }

   DEBUG &&
      LOG.error("ProcedureFactory: insufficient inputs (need a weapon item OR a responseType+context)", {
         file: __FILE__,
         line: __LINE__,
      });
   return null;
}
