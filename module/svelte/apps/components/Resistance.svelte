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

   async function Resist() {
      // Let the player decide pools in the composer UI:
      // totalDice = base + any optional pool dice they added in the panel.
      const totalDice = (caller.dice ?? 0) + (diceBought ?? 0) + (currentDicePoolAddition ?? 0);

      // We expect promptDamageResistance to have put `prep` and `weaponId` on caller.
      const prep = caller.prep;
      const weaponId = caller.weaponId || caller?.context?.weaponId;

      if (!prep || !weaponId) {
         throw new Error("sr3e: Resistance composer missing prep or weaponId");
      }

      const type = "resistance";
      const isAttr = caller.type === "attribute";
      const attributeKeyForChat =
         caller.linkedAttribute ?? caller.attributeKey ?? caller.attributeName ?? (isAttr ? caller.key : undefined);

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, {
            // Show the correct TN in the composer UI; the resolver will still enforce prep.tn.
            targetNumber: modifiedTargetNumber ?? prep.tn,
            explodes: true,
         }),
         { actor },
         {
            type,
            modifiers: modifiersArray,
            targetNumber: modifiedTargetNumber ?? prep.tn,
            attributeKey: attributeKeyForChat,
            attributeName: attributeKeyForChat,
            opposed: false,
            isDefaulting,
         }
      );

      await roll.evaluate({ async: true });

      // Send the composed roll to the resolver (runs on this client via your CONFIG.queries handler)
      await game.user.query("sr3e.resolveResistanceRoll", {
         defenderId: actor.id,
         weaponId,
         prep,
         rollData: roll.toJSON(),
      });

      await CommitEffects?.();
      OnClose?.();
      Hooks.callAll("actorSystemRecalculated", actor);
   }
</script>

<button class="regular" type="button" onclick={Resist}>
   {localize("Resist Damage!")}
</button>
