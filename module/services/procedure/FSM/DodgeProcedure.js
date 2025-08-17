// services/procedure/FSM/DodgeProcedure.js
import AbstractProcedure from "@services/procedure/FSM/AbstractProcedure";
import SR3ERoll from "@documents/SR3ERoll.js";
import OpposeRollService from "@services/OpposeRollService.js";

export default class DodgeProcedure extends AbstractProcedure {
   static kind = "dodge";

   #contestId = null;

   constructor(defender, _noItem = null, { contestId } = {}) {
      super(defender, null);

      this.title = game?.i18n?.localize?.("sr3e.dodge.title") ?? "Dodge";
      this.#contestId = contestId ?? null;

      // Base TN 4
      this.targetNumberStore?.set?.(4);

      // No targeting from the defender side; this is a standalone roll.
      // (You can hard-disable if you want.)
   }

   // Flavor in the composer
   getKindOfRollLabel() {
      return game?.i18n?.localize?.("sr3e.label.dodge") ?? "Dodge";
   }
   getItemLabel() {
      return typeof this.title === "string" ? this.title : "";
   }
   getPrimaryActionLabel() {
      return game?.i18n?.localize?.("sr3e.button.dodge") ?? "Dodge!";
   }

   // Never start a new opposed flow from here
   get hasTargets() {
      return false;
   }

   shouldSelfPublish() {
      return false;
   }

   getChatDescription() {
      return "Dodge the incoming attack.";
   }

   async execute({ OnClose, CommitEffects } = {}) {
      try {
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
      } catch (err) {
         DEBUG && LOG.error("Challenge flow failed", [__FILE__, __LINE__, err]);
         ui.notifications.error(game.i18n.localize?.("sr3e.error.challengeFailed") ?? "Challenge failed");
         throw err;
      }
   }
}
