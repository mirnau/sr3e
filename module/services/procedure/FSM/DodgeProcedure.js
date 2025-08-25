// services/procedure/FSM/DodgeProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";
import { localize } from "@services/utilities.js";

const config = CONFIG.sr3e;

export default class DodgeProcedure extends AbstractProcedure {
   static kind = "dodge";

   #contestId = null;

   constructor(defender, _noItem = null, { contestId } = {}) {
      super(defender, null);

      this.title = localize(config.procedure.dodgetitle);
      this.#contestId = contestId ?? null;

      // Base TN 4
      this.targetNumberStore?.set?.(4);
   }

   // Flavor in the composer
   getKindOfRollLabel() {
      return localize(config.procedure.dodge);
   }
   getItemLabel() {
      return typeof this.title === "string" ? this.title : "";
   }
   getPrimaryActionLabel() {
      return localize(config.procedure.dodgebutton);
   }

   // Never start a new opposed flow from here
   get hasTargets() {
      return false;
   }

   shouldSelfPublish() {
      return false;
   }

   getChatDescription() {
      return localize(config.procedure.dodgedescription);
   }

   async execute({ OnClose, CommitEffects } = {}) {
      OnClose?.();

      const actor = this.caller;
      const formula = this.buildFormula(true);
      const baseRoll = SR3ERoll.create(formula, { actor });

      await this.onChallengeWillRoll?.({ baseRoll, actor });

      const roll = await baseRoll.evaluate(this);
      await baseRoll.waitForResolution();

      await CommitEffects?.();

      if (!this.#contestId) {
         console.warn("[sr3e] DodgeProcedure missing contestId; cannot deliver response");
      } else {
         OpposeRollService.deliverResponse(this.#contestId, roll.toJSON());
      }

      Hooks.callAll("actorSystemRecalculated", actor);
      await this.onChallengeResolved?.({ roll, actor });
      return roll;
   }
}
