<script lang="ts">
   import { localize } from "../../services/utilities";
   import Image from "../common-components/Image.svelte";
   import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
   import JournalViewer from "../common-components/JournalViewer.svelte";

   let { item }: { item: Item } = $props();

   const system = item.system as {
      skillType: "active" | "knowledge" | "language";
      activeSkill: { linkedAttribute: string; associatedDicePool: string };
   };

   let skillType = $state<"active" | "knowledge" | "language">(system.skillType);

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
      <div class="stat-grid single-column">
<div class="stat-card">
            <input
               class="large"
               name="name"
               type="text"
               value={item.name}
               onchange={(e) => item.update({ name: (e.target as HTMLInputElement).value })}
            />
         </div>
<div class="stat-card">
            <select value={skillType} onchange={(e) => updateSkillType((e.target as HTMLSelectElement).value as "active" | "knowledge" | "language")}>
               {#each typeOptions as opt}
                  <option value={opt.value}>{opt.label}</option>
               {/each}
            </select>
         </div>
{#if skillType === "active"}
            <div class="stat-card">
               <select
                  value={system.activeSkill.linkedAttribute}
                  onchange={(e) => item.update({ "system.activeSkill.linkedAttribute": (e.target as HTMLSelectElement).value })}
               >
                  <option disabled value="">
                     {localize(CONFIG.SR3E.SKILL?.linkedAttribute)}
                  </option>
                  {#each attributeOptions as opt}
                     <option value={opt.value}>{opt.label}</option>
                  {/each}
               </select>
            </div>
<div class="stat-card">
               <select
                  value={system.activeSkill.associatedDicePool}
                  onchange={(e) => item.update({ "system.activeSkill.associatedDicePool": (e.target as HTMLSelectElement).value })}
               >
                  <option value="">
                     {localize(CONFIG.SR3E.DICE_POOLS?.associateselect)}
                  </option>
                  {#each dicePoolOptions as opt}
                     <option value={opt.value}>{opt.label}</option>
                  {/each}
               </select>
            </div>
         {/if}
      </div>
   </ItemSheetComponent>

   <JournalViewer document={item} config={CONFIG.SR3E} />
</ItemSheetWrapper>
