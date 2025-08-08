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
      CommitEffects,
      isDefaulting,
      OnClose,
   } = $props();

   async function Respond() {
      const totalDice = caller.dice + diceBought + currentDicePoolAddition;

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: true,
         }),
         { actor },
         {
            attributeName: caller.key,
            skillName: caller.name,
            specializationName: caller.specialization,
            modifiers: modifiersArray,
            type: caller.type,
            targetNumber,
            opposed: true,
            itemId: caller.item?.id,
            explodes: true,
            isDefaulting: isDefaulting,
         }
      );

      await roll.evaluate({ suppressMessage: true });

      const contest = OpposeRollService.getContestById(caller.contestId);
      const initiatorUser = OpposeRollService.resolveControllingUser(contest.initiator);

      await initiatorUser.query("sr3e.resolveOpposedRoll", {
         contestId: caller.contestId,
         rollData: roll.toJSON(),
      });

      await CommitEffects?.();

      Hooks.callAll("actorSystemRecalculated", actor);
      OpposeRollService.expireContest(caller.contestId);

      OnClose?.();
   }
</script>

<button class="regular" type="button" onclick={Respond}> Respond! </button>
