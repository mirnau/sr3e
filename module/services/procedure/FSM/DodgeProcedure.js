// services/procedure/FSM/DodgeProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import { localize } from "@services/utilities.js";

function RuntimeConfig() {
   return CONFIG?.sr3e || {};
}

export default class DodgeProcedure extends AbstractProcedure {
   static kind = "dodge";

   constructor(defender, _noItem = null, { contestId } = {}) {
      super(defender, null);

      this.title = localize(RuntimeConfig().procedure.dodgetitle);
      this.setContestId(contestId ?? null);

      this.targetNumberStore?.set?.(4);
   }

   // Flavor in the composer
   getKindOfRollLabel() {
      return localize(RuntimeConfig().procedure.dodge);
   }
   getItemLabel() {
      return typeof this.title === "string" ? this.title : "";
   }
   getPrimaryActionLabel() {
      return localize(RuntimeConfig().procedure.dodgebutton);
   }

   // Never start a new opposed flow from here
   get hasTargets() {
      return false;
   }

   shouldSelfPublish() {
      return false;
   }

   getChatDescription() {
      return localize(RuntimeConfig().procedure.dodgedescription);
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

      this.deliverContestResponse(roll);

      Hooks.callAll("actorSystemRecalculated", actor);
      await this.onChallengeResolved?.({ roll, actor });
      return roll;
   }
}
