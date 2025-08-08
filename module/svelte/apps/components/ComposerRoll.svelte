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
    const totalDice = (caller.dice ?? 0) + (diceBought ?? 0) + (currentDicePoolAddition ?? 0);

    const type = caller.type ?? caller.type; // tolerate old callers
    const isItem = type === "item";
    const isSkill = type === "skill" || type === "specialization";
    const isAttr  = type === "attribute";

    // Always try to surface a meaningful attribute key for the chat message.
    // Priority: linkedAttribute (from RollComposer) → explicit attribute fields → attribute caller key.
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

        // Item / skill labeling
        itemId:   isItem ? caller.key : undefined,
        itemName: isItem ? (caller.itemName ?? caller.name) : undefined,
        skillName: isItem ? caller.skillName
                 : isSkill ? caller.name
                 : undefined,
        specializationName: isItem
          ? caller.specializationName
          : (type === "specialization" ? caller.specialization : undefined),

        // Always pass attribute info if we have it; renderer will decide whether to use it.
        attributeKey: attributeKeyForChat,
        attributeName: attributeKeyForChat,

        // Whether this roll was marked as defaulting in the UI
        isDefaulting,

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
