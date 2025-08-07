<script>
   import SR3ERoll from "@documents/SR3ERoll.js";
   import OpposeRollService from "@services/OpposeRollService.js";

   let {
      actor,
      caller,
      modifiersArray,
      targetNumber,
      modifiedTargetNumber,
      diceBought,
      currentDicePoolAddition,
      OnClose,
      CommitEffects
      
   } = $props();

   let hasChallenged = false;

   async function Challenge() {
      hasChallenged = true;
      console.warn("Challenge: Initiating opposed rolls.");

      const targets = [...game.user.targets].map((t) => t.actor).filter(Boolean);

      if (targets.length === 0) {
         console.warn("No targets selected for opposed roll");
         return;
      }

      const totalDice = caller.dice + diceBought + currentDicePoolAddition;

      const options = {
         attributeName: caller.key,
         skillName: caller.name,
         specializationName: caller.specialization,
         modifiers: modifiersArray,
         callerType: caller.type,
         targetNumber,
         opposed: true,
         itemId: caller.item?.id,
      };

      const baseRoll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: true,
         }),
         { actor },
         options
      );

      const roll = await baseRoll.evaluate(options);
      await baseRoll.waitForResolution();

      await CommitEffects?.();

      Hooks.callAll("actorSystemRecalculated", actor);
      OpposeRollService.expireContest(roll.options.contestId);

      OnClose?.();
   }
</script>

<button class="regular" type="button" onclick={Challenge} disabled={hasChallenged}>
   Challenge!
</button>