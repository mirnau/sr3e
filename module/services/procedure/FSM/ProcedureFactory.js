// module/services/procedure/FSM/ProcedureFactory.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import FirearmProcedure from "@services/procedure/FSM/FirearmProcedure.js";
import DodgeProcedure from "./DodgeProcedure";
import MeleeProcedure from "./MeleeProcedure";
import ResistanceProcedure from "./ResistanceProcedure";
import ExplosiveProcedure from "./ExplosiveProcedure";
import MeleeDefenseProcedure from "./MeleeDefenseProcedure"; // <-- unified defender proc

import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
import { get } from "svelte/store";

/**
 * ProcedureFactory
 * @param {Actor} actor              The acting actor (attacker or defender depending on context)
 * @param {Item|null} item           The weapon item for attack flows (null for response flows)
 * @param {AbstractProcedure|null} procedure  The initiator's procedure in response flows (optional)
 * @param {string|null} responseType One of: "dodge", "resist", "melee-standard", "melee-full", "melee-defense" (case-insensitive)
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

   // ---------- DEFENDER / RESPONSE FLOW ----------
   if (responseType && (procedure || actor)) {
      const key = String(responseType).toLowerCase();

      switch (key) {
         case "dodge":
            // Preserve signature (previously: new DodgeProcedure(procedure))
            return new (AbstractProcedure.getCtor?.("dodge") ?? DodgeProcedure)(procedure);

         case "resist":
         case "resistance":
            return new (AbstractProcedure.getCtor?.("resistance") ?? ResistanceProcedure)(procedure);

         // Unified melee defense: "standard" or "full" → single class + mode
         case "melee-standard":
         case "standard":
         case "melee-full":
         case "full":
         case "melee-defense":
         case "defense": {
            if (!actor) {
               DEBUG &&
                  LOG.warn(`ProcedureFactory: defender actor missing for responseType="${responseType}"`, {
                     file: __FILE__,
                     line: __LINE__,
                  });
               return null;
            }

            const resolvedMode = key === "melee-full" || key === "full" ? "full" : "standard";

            // Hydrate a safe default basis via StoreManager (Strength) so we never roll 0d6
            let basis = null;
            try {
               const sm = StoreManager.Subscribe(actor);
               const st = sm.GetSumROStore("attributes.strength");
               const snap = get(st) || {};
               const dice = Math.max(0, Number(snap.sum) || 0);
               basis = { type: "attribute", key: "strength", name: "Strength", isDefaulting: true, dice };
               StoreManager.Unsubscribe(actor);
            } catch (e) {
               DEBUG &&
                  LOG.warn("ProcedureFactory: failed to hydrate Strength basis for defender; defaulting to 0", {
                     file: __FILE__,
                     line: __LINE__,
                     e,
                  });
               basis = { type: "attribute", key: "strength", name: "Strength", isDefaulting: true, dice: 0 };
            }

            // Instantiate unified defender procedure
            const MeleeDefCtor = AbstractProcedure.getCtor?.("melee-defense") ?? MeleeDefenseProcedure;
            return new MeleeDefCtor(actor, null, {
               contestId: procedure?.contestId,
               basis,
               mode: resolvedMode,
            });
         }

         default:
            DEBUG &&
               LOG.warn(`ProcedureFactory: unknown responseType="${responseType}"`, {
                  file: __FILE__,
                  line: __LINE__,
               });
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
