<script lang="ts">
   import { untrack } from "svelte";
   import { localize } from "../../services/utilities";
   import Image from "../common-components/Image.svelte";
   import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
   import JournalViewer from "../common-components/JournalViewer.svelte";
   import LabeledDropdown from "./LabeledDropdown.svelte";

   let { item: _item }: { item: Item } = $props();
   const item = untrack(() => _item);

   const system = item.system as {
      skillType: "active" | "knowledge" | "language";
      activeSkill: { linkedAttribute: string; associatedDicePool: string };
   };

   let skillType = $state<"active" | "knowledge" | "language">(system.skillType);
   let name = $state(item.name as string);

   const attributeKeys = ["body", "quickness", "strength", "charisma", "intelligence", "willpower", "reaction"];
   const dicePoolKeys = ["astral", "combat", "hacking", "control", "spell"];
   const iconRoot = "systems/sr3e/textures/svgrepo";
   const defaultSkillIcons = new Set([
      "icons/svg/item-bag.svg",
      `${iconRoot}/action-solid-svgrepo-com.svg`,
      `${iconRoot}/lightbulb-power-svgrepo-com.svg`,
      `${iconRoot}/language-svgrepo-com.svg`,
   ]);

   const skillIcons = {
      active: `${iconRoot}/action-solid-svgrepo-com.svg`,
      knowledge: `${iconRoot}/lightbulb-power-svgrepo-com.svg`,
      language: `${iconRoot}/language-svgrepo-com.svg`,
   };
   const sheetLayout = $derived(skillType === "active" ? "double" : "single");

   const typeOptions = [
      { value: "active",    label: localize(CONFIG.SR3E.SKILL?.active) },
      { value: "knowledge", label: localize(CONFIG.SR3E.SKILL?.knowledge) },
      { value: "language",  label: localize(CONFIG.SR3E.SKILL?.language) },
   ];

   const attributeOptions = attributeKeys.map((key) => ({
      value: key,
      label: localize((CONFIG.SR3E.ATTRIBUTES as Record<string, string>)[key] ?? `SR3E.attributes.${key}`),
   }));

   const dicePoolOptions = dicePoolKeys.map((key) => ({
      value: key,
      label: localize((CONFIG.SR3E.DICE_POOLS as Record<string, string>)[key] ?? `SR3E.dicepools.${key}`),
   }));

   function updateSkillType(type: "active" | "knowledge" | "language") {
      skillType = type;
      const updates: Record<string, string> = { "system.skillType": type };
      if (!item.img || defaultSkillIcons.has(item.img)) updates.img = skillIcons[type];
      item.update(updates);
   }
</script>

<ItemSheetWrapper csslayout={sheetLayout}>
   <ItemSheetComponent>
      <Image entity={item} />
      <div class="large-input-wrapper">
         <div class="large-input-background"></div>
         <input
            class="large"
            name="name"
            type="text"
            value={name}
            onchange={(e) => item.update({ name: (e.target as HTMLInputElement).value })}
         />
      </div>

      <LabeledDropdown
         {item}
         key="skillType"
         label={localize(CONFIG.SR3E.SKILL?.skill)}
         value={skillType}
         path="system"
         options={typeOptions}
         onUpdate={(val) => updateSkillType(val as "active" | "knowledge" | "language")}
      />
   </ItemSheetComponent>

   {#if skillType === "active"}
      <ItemSheetComponent>
         <h3>{localize(CONFIG.SR3E.SKILL?.active)}</h3>
         <div class="stat-grid single-column">
            <LabeledDropdown
               {item}
               key="linkedAttribute"
               label={localize(CONFIG.SR3E.SKILL?.linkedAttribute)}
               value={system.activeSkill.linkedAttribute}
               path="system.activeSkill"
               options={attributeOptions}
            />
            <LabeledDropdown
               {item}
               key="associatedDicePool"
               label={localize(CONFIG.SR3E.DICE_POOLS?.dicePools)}
               value={system.activeSkill.associatedDicePool}
               path="system.activeSkill"
               options={dicePoolOptions}
            />
         </div>
      </ItemSheetComponent>
   {/if}

   <JournalViewer document={item} config={CONFIG.SR3E} />
</ItemSheetWrapper>
