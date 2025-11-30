import { flags } from "@services/commonConsts.js";

export function setFlagsOnCharacterPreCreate(document, data, options, userId) {
   const flagsToSet = [
      {
         namespace: flags.sr3e,
         flag: flags.actor.isCharacterCreation,
         value: true,
      },
      { namespace: flags.sr3e, flag: flags.actor.hasAwakened, value: false },
      { namespace: flags.sr3e, flag: flags.actor.burntOut, value: false },
      {
         namespace: flags.sr3e,
         flag: flags.actor.attributeAssignmentLocked,
         value: false,
      },
      {
         namespace: flags.sr3e,
         flag: flags.actor.persistanceBlobCharacterSheetSize,
         value: {},
      },
      { namespace: flags.sr3e, flag: flags.actor.isShoppingState, value: true },
   ];

   const updateData = {};
   flagsToSet.forEach(({ namespace, flag, value }) => {
      updateData[`flags.${namespace}.${flag}`] = value;
   });

   document.updateSource(updateData);
}
