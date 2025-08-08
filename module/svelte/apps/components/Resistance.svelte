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
      CommitEffects
   } = $props();

   async function Resist() {
      const totalDice = caller.dice + diceBought + currentDicePoolAddition;

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: true,
         }),
         { actor },
         {
            attributeName: caller.key,
            type: "resistance",
            modifiers: modifiersArray,
            targetNumber,
            power: caller.power,
            stagedLevel: caller.stagedLevel,
            damageType: caller.damageType,
            weaponId: caller.weaponId,
            opposed: false,
            isDefaulting: isDefaulting
            
         }
      );

      await roll.evaluate();

      await CommitEffects?.();

      OnClose?.({
         type: "resistance",
         successes: roll.successes,
         stagedLevel: caller.stagedLevel,
         damageType: caller.damageType,
         defenderId: actor.id,
         weaponId: caller.weaponId,
      });

      Hooks.callAll("actorSystemRecalculated", actor);
   }
</script>

<button class="regular" type="button" onclick={Resist}>
   {localize("Resist Damage!")}
</button>
