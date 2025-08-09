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

    let attributeKeyForChat =
      caller.linkedAttribute ??
      caller.attributeKey ??
      caller.attributeName ??
      (isAttr ? caller.key : undefined);

    const itemId = isItem ? (caller.item?.id ?? caller.key) : undefined;
    const weapon = isItem ? (actor?.items?.get(itemId) || game.items.get(itemId) || null) : null;

    const inCombat = FirearmService.inCombat?.() === true;
    const already = isItem && inCombat ? FirearmService.getPhaseShots(actor.id) : 0;
    const declaredRounds = weapon?.system?.declaredRounds ?? null;
    const ammoAvailable  = weapon?.system?.ammo ?? null;

    const plan = isItem && inCombat
      ? FirearmService.planFire({ weapon, phaseShotsFired: already, declaredRounds, ammoAvailable })
      : null;

    const recoilRow = plan?.attackerTNMod
      ? { id: "recoil", name: "Recoil", value: plan.attackerTNMod }
      : null;

    const mods = recoilRow ? [...modifiersArray, recoilRow] : modifiersArray;
    const tn   = modifiedTargetNumber + (plan?.attackerTNMod ?? 0);

    const options = {
      type,
      modifiers: mods,
      targetNumber: tn,
      itemId,
      itemName: isItem ? (caller.itemName ?? caller.name) : undefined,
      skillName: isItem ? caller.skillName : isSkill ? caller.name : undefined,
      specializationName: isItem
        ? (caller.specializationName ?? caller.specialization)
        : (type === "specialization" ? caller.specialization : undefined),
      attributeKey: attributeKeyForChat,
      attributeName: attributeKeyForChat,
      isDefaulting,
      opposed: true,
      roundsFired: plan?.roundsFired,
      powerDelta: plan?.powerDelta,
      levelDelta: plan?.levelDelta,
    };

    const baseRoll = SR3ERoll.create(
      SR3ERoll.buildFormula(totalDice, { targetNumber: tn, explodes: true }),
      { actor },
      options
    );

    const roll = await baseRoll.evaluate(options);
    await baseRoll.waitForResolution();

    if (plan?.roundsFired && inCombat) FirearmService.bumpPhaseShots(actor.id, plan.roundsFired);

    await CommitEffects?.();
    Hooks.callAll("actorSystemRecalculated", actor);
    OpposeRollService.expireContest(roll.options.contestId);
    OnClose?.();
  }
</script>

<button class="regular" type="button" onclick={Challenge} disabled={hasChallenged}>Challenge!</button>
