<script>
  import SR3ERoll from "@documents/SR3ERoll.js";
  import OpposeRollService from "@services/OpposeRollService.js";
  import FirearmService from "@services/FirearmService.js";

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

  let hasChallenged = false;

  async function Challenge() {
    hasChallenged = true;

    const targets = [...game.user.targets].map(t => t.actor).filter(Boolean);
    if (targets.length === 0) return;

    const totalDice = (caller.dice ?? 0) + (diceBought ?? 0) + (currentDicePoolAddition ?? 0);

    const type = caller.type ?? caller.type;
    const isItem = type === "item";
    const isSkill = type === "skill" || type === "specialization";
    const isAttr  = type === "attribute";

    const attributeKeyForChat =
      caller.linkedAttribute ?? caller.attributeKey ?? caller.attributeName ?? (isAttr ? caller.key : undefined);

    const tn = modifiedTargetNumber;

    const options = {
      type,
      modifiers: modifiersArray,
      targetNumber: tn,
      itemId: isItem ? (caller.item?.id ?? caller.key) : undefined,
      itemName: isItem ? (caller.itemName ?? caller.name) : undefined,
      skillName: isItem ? caller.skillName : isSkill ? caller.name : undefined,
      specializationName: isItem
        ? (caller.specializationName ?? caller.specialization)
        : (type === "specialization" ? caller.specialization : undefined),
      attributeKey: attributeKeyForChat,
      attributeName: attributeKeyForChat,
      isDefaulting,
      opposed: true,
    };

    const baseRoll = SR3ERoll.create(
      SR3ERoll.buildFormula(totalDice, { targetNumber: tn, explodes: true }),
      { actor },
      options
    );

    const roll = await baseRoll.evaluate(options);
    await baseRoll.waitForResolution();

    // Recoil stack bump: only when in combat & firing an item
    if (FirearmService.inCombat?.() && isItem) {
      const itemId = caller.item?.id ?? caller.key;
      const weapon = actor?.items?.get(itemId) || game.items.get(itemId) || null;

      if (weapon) {
        const plan = FirearmService.planFire({
          weapon,
          phaseShotsFired: FirearmService.getPhaseShots(actor.id),
        });

        if (plan?.roundsFired) {
          FirearmService.bumpPhaseShots(actor.id, plan.roundsFired);
          // Optional: notify composer to recalc if it might still be open
          Hooks.callAll("sr3e.recoilRefresh");
        }
      }
    }

    await CommitEffects?.();
    Hooks.callAll("actorSystemRecalculated", actor);
    OpposeRollService.expireContest(roll.options.contestId);

    OnClose?.();
  }
</script>

<button class="regular" type="button" onclick={Challenge} disabled={hasChallenged}>Challenge!</button>
