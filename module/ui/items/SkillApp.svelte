<script lang="ts">
   import { untrack } from "svelte";
   import { localize } from "../../services/utilities";
   import Image from "../common-components/Image.svelte";
   import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
   import StatCard from "../common-components/StatCard.svelte";
   import JournalViewer from "../common-components/JournalViewer.svelte";

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
      item.update({ "system.skillType": type });
   }
</script>

<ItemSheetWrapper csslayout="single">
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

      <div class="stat-grid single-column">
         <StatCard
            {item}
            key="skillType"
            label={localize(CONFIG.SR3E.SKILL?.skill)}
            value={skillType}
            type="select"
            options={typeOptions}
            onUpdate={(val) => updateSkillType(val as "active" | "knowledge" | "language")}
         />
         {#if skillType === "active"}
            <StatCard
               {item}
               key="linkedAttribute"
               label={localize(CONFIG.SR3E.SKILL?.linkedAttribute)}
               value={system.activeSkill.linkedAttribute}
               path="system.activeSkill"
               type="select"
               options={attributeOptions}
               placeholder={localize(CONFIG.SR3E.SKILL?.linkedAttribute)}
            />
            <StatCard
               {item}
               key="associatedDicePool"
               label={localize(CONFIG.SR3E.DICE_POOLS?.dicePools)}
               value={system.activeSkill.associatedDicePool}
               path="system.activeSkill"
               type="select"
               options={dicePoolOptions}
            />
         {/if}
      </div>
   </ItemSheetComponent>

   <JournalViewer document={item} config={CONFIG.SR3E} />
</ItemSheetWrapper>
