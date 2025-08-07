<script>
   import SR3ERoll from "@documents/SR3ERoll.js";
   import { localize } from "@services/utilities.js";

   let {
      actor,
      caller,
      modifiersArray,
      targetNumber,
      modifiedTargetNumber,
      diceBought,
      currentDicePoolAddition,
      isDefaulting,
      OnClose,
      CommitEffects,
   } = $props();

   async function HandleRoll(e) {
      e?.preventDefault?.();
      console.warn("HandleRoll triggered");

      const totalDice = caller.dice + diceBought + currentDicePoolAddition;

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: !isDefaulting,
         }),
         { actor },
         {
            attributeName: caller.key,
            skillName: caller.name,
            specializationName: caller.specialization,
            modifiers: modifiersArray,
            callerType: caller.type,
            targetNumber,
            opposed: false,
         }
      );

      await roll.evaluate();
      await CommitEffects?.();

      OnClose?.();

      Hooks.callAll("actorSystemRecalculated", actor);
   }
</script>

<button class="regular" type="button" onclick={HandleRoll}>
   {localize("Roll!")}
</button>
