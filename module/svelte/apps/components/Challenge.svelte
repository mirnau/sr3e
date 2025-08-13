<script>
   import SR3ERoll from "@documents/SR3ERoll.js";
   import OpposeRollService from "@services/OpposeRollService.js";
   import FirearmService from "@families/FirearmService.js";

   let {
      actor,
      caller,
      modifiersArray,
      targetNumber,
      modifiedTargetNumber,
      diceBought,
      currentDicePoolAddition,
      OnClose,
      isDefaulting,
      CommitEffects,
   } = $props();

   async function Challenge() {
      DEBUG && LOG.info("Challange combat flow initiated", [__FILE__, __LINE__, "Challenge"]);

      const targets = [...game.user.targets].map((t) => t.actor).filter(Boolean);
      if (targets.length === 0) return;

      const totalDice = (caller.dice ?? 0) + (diceBought ?? 0) + (currentDicePoolAddition ?? 0);

      const type = caller.type ?? caller.type;
      const isItem = type === "item";
      const isSkill = type === "skill" || type === "specialization";
      const isAttr = type === "attribute";

      const attributeKeyForChat =
         caller.linkedAttribute ?? caller.attributeKey ?? caller.attributeName ?? (isAttr ? caller.key : undefined);

      const ammoTN = Number(caller?.damagePacket?.attackTNAdd || 0);
      const finalTN = Math.max(2, Number(modifiedTargetNumber) + ammoTN);

      const options = {
         type,
         modifiers: modifiersArray,
         targetNumber: finalTN,
         itemId: isItem ? (caller.item?.id ?? caller.key) : undefined,
         itemName: isItem ? (caller.itemName ?? caller.name) : undefined,
         skillName: isItem ? caller.skillName : isSkill ? caller.name : undefined,
         specializationName: isItem
            ? (caller.specializationName ?? caller.specialization)
            : type === "specialization"
              ? caller.specialization
              : undefined,
         attributeKey: attributeKeyForChat,
         attributeName: attributeKeyForChat,
         isDefaulting,
         opposed: true,
         firearm:
            isItem && caller?.firearmPlan && caller?.damagePacket
               ? {
                    itemId: caller.item?.id ?? caller.key,
                    ammoId: caller.ammoId || "",
                    plan: caller.firearmPlan,
                    damage: caller.damagePacket,
                 }
               : undefined,
      };

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

      OnClose?.();
   }
</script>

<button class="regular" type="button" onclick={Challenge}>Challenge!</button>
