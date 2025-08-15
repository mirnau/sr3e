<script>
   import SR3ERoll from "@documents/SR3ERoll.js";
   import OpposeRollService from "@services/OpposeRollService.js";
   import FirearmService from "@families/FirearmService.js";

   let {
      procedureStore,
      OnClose,
      CommitEffects,
   } = $props();

   async function Challenge() {
      DEBUG && LOG.info("Challange combat flow initiated", [__FILE__, __LINE__, "Challenge"]);

      //Should be handled by the firearm
      //const ammoTN = Number(caller?.damagePacket?.attackTNAdd || 0);
      
      OnClose?.();
      
      const baseRoll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, { targetNumber: finalTN, explodes: true }),
         { actor },
         options
      );

      const weapon = actor?.items?.get(caller?.item?.id ?? caller?.key) ?? null;
      if (weapon && caller?.firearmPlan) {
         await FirearmService.onAttackResolved(actor, weapon, caller.firearmPlan);
      }

      const roll = await baseRoll.evaluate(options);
      await baseRoll.waitForResolution();

      await CommitEffects?.();
      Hooks.callAll("actorSystemRecalculated", actor);
      OpposeRollService.expireContest(roll.options.contestId);

   }
</script>

<button class="regular" type="button" onclick={Challenge}>Challenge!</button>
