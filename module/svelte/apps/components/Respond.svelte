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
      const totalDice = Number(caller?.dice || 0) + Number(diceBought || 0) + Number(currentDicePoolAddition || 0);

      const isDodge = caller.type === "dodge";

      // If this is a Dodge and the user kept 0 dice, treat it as "no successes" cleanly.
      if (isDodge && totalDice <= 0) {
         const contest = OpposeRollService.getContestById(caller.contestId);
         const initiatorUser = OpposeRollService.resolveControllingUser(contest.initiator);

         await initiatorUser.query("sr3e.resolveOpposedRoll", {
            contestId: caller.contestId,
            rollData: {}, // empty → getSuccessCount = 0
         });

         await CommitEffects?.();
         Hooks.callAll("actorSystemRecalculated", actor);
         OpposeRollService.expireContest(caller.contestId);
         OnClose?.();
         return;
      }

      // Build the roll for Dodge or the legacy attribute-based response.
      const rollType = isDodge ? "dodge" : "attribute";
      const attributeKeyForChat = isDodge
         ? undefined // no attribute on Dodge
         : (caller.linkedAttribute ?? caller.attributeKey ?? caller.attributeName ?? caller.key);

      const roll = SR3ERoll.create(
         SR3ERoll.buildFormula(totalDice, { targetNumber: modifiedTargetNumber, explodes: true }),
         { actor },
         {
            type: rollType,
            modifiers: modifiersArray,
            targetNumber: modifiedTargetNumber,
            attributeKey: attributeKeyForChat,
            attributeName: attributeKeyForChat,
            opposed: true,
            explodes: true,
            isDefaulting,
            // Optional: pass a friendly label for chat when dodging
            label: isDodge ? caller?.name || "Dodge" : undefined,
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

<button class="regular" type="button" onclick={Respond}>
   {caller?.type === "dodge" ? "Dodge!" : "Respond!"}
</button>
