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
      const totalDice = (caller.dice ?? 0) + (diceBought ?? 0) + (currentDicePoolAddition ?? 0);

      const type = "resistance";
      const isAttr = caller.type === "attribute";

      let attributeKeyForChat =
         caller.linkedAttribute ??
         caller.attributeKey ??
         caller.attributeName ??
         (isAttr ? caller.key : undefined);

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            targetNumber: modifiedTargetNumber,
            explodes: true
         }),
         { actor },
         {
            type,
            modifiers: modifiersArray,
            targetNumber: modifiedTargetNumber,
            attributeKey: attributeKeyForChat,
            attributeName: attributeKeyForChat,
            power: caller.power,
            stagedLevel: caller.stagedLevel,
            damageType: caller.damageType,
            weaponId: caller.weaponId,
            opposed: false,
            isDefaulting
         }
      );

      await roll.evaluate();

      await CommitEffects?.();

      OnClose?.();

      Hooks.callAll("actorSystemRecalculated", actor);
   }
</script>

<button class="regular" type="button" onclick={Resist}>
   {localize("Resist Damage!")}
</button>
