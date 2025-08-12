<script>
  import SR3ERoll from "@documents/SR3ERoll.js";
  import { localize } from "@services/utilities.js";
  import FirearmService from "@families/FirearmService.js";

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

    const roll = SR3ERoll.create(
      SR3ERoll.buildFormula(totalDice, {
        targetNumber: modifiedTargetNumber,
        explodes: true,
      }),
      { actor },
      {
        type,
        modifiers: modifiersArray,
        targetNumber: modifiedTargetNumber,
        itemId:   isItem ? (caller.item?.id ?? caller.key) : undefined,
        itemName: isItem ? (caller.itemName ?? caller.name) : undefined,
        skillName: isItem ? caller.skillName : isSkill ? caller.name : undefined,
        specializationName: isItem
          ? (caller.specializationName ?? caller.specialization)
          : (type === "specialization" ? caller.specialization : undefined),
        attributeKey: attributeKeyForChat,
        attributeName: attributeKeyForChat,
        isDefaulting,
        opposed: false,
      }
    );

    await roll.evaluate();

    if (isItem) {
      const itemId = caller.item?.id ?? caller.key;
      const weapon = actor?.items?.get(itemId) || game.items.get(itemId) || null;
      if (weapon) {
        const rounds = Number(caller.rounds ?? caller.value ?? 1);
        FirearmService.bumpOnShot({ actor, weapon, declaredRounds: rounds });
        Hooks.callAll("sr3e.recoilRefresh");
      }
    }

    await CommitEffects?.();
    OnClose?.();
    Hooks.callAll("actorSystemRecalculated", actor);
  }
</script>

<button class="regular" type="button" onclick={HandleRoll}>
  {localize("Roll!")}
</button>
