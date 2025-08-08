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

      const callerType = caller.callerType ?? caller.type; // tolerate old callers
      const isItem = callerType === "item";
      const isSkill = callerType === "skill" || callerType === "specialization";
      const isAttr = callerType === "attribute";

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: !isDefaulting,
         }),
         { actor },
         {
            callerType,
            modifiers: modifiersArray,
            targetNumber: modifiedTargetNumber, // <- use modified TN

            // item path
            itemId: isItem ? caller.key : undefined,
            itemName: isItem ? (caller.itemName ?? caller.name) : undefined,
            skillName: isItem ? caller.skillName : isSkill ? caller.name : undefined,
            specializationName: isItem
               ? caller.specializationName
               : callerType === "specialization"
                 ? caller.specialization
                 : undefined,

            // attribute path
            attributeKey: isAttr ? caller.key : undefined,
            attributeName: isAttr ? caller.key : undefined,

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
