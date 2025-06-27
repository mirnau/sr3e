<script>
   import { localize, openFilePicker } from "../../services/utilities.js";
   import JournalViewer from "./components/JournalViewer.svelte";
   import Image from "./components/basic/Image.svelte";
   import ItemSheetComponent from "./components/basic/ItemSheetComponent.svelte";
   import StatCard from "./components/basic/StatCard.svelte";

   let { item, config } = $props();

   let layoutMode = $state("single");

   let value = $state(item.system.skillType);

   let formattedAmount = $state(`${item.system.amount} ¥`);

   const selectOptions = [
      { value: "active", label: localize(config.skill.active) },
      { value: "knowledge", label: localize(config.skill.knowledge) },
      { value: "language", label: localize(config.skill.language) },
   ];

   const baseAttributeKeys = ["body", "quickness", "strength", "charisma", "intelligence", "willpower", "reaction"];

   const attributeOptions = baseAttributeKeys.map((key) => ({
      value: key,
      label: localize(config.attributes[key]),
   }));

   function updateSkillType(type) {
      value = type;
      item.update({ "system.skillType": type });
   }

   function handleInput(e) {
      const inputValue = e.target.value.trim();

      if (!inputValue) {
         item.system.amount = 0;
         formattedAmount = `0 ¥`;
         return;
      }

      const raw = inputValue.replace(/[^\d]/g, "");
      const parsed = parseInt(raw, 10) || 0;

      item.system.amount = parsed;
      formattedAmount = `${parsed} ¥`;
   }

   function handleKeyDown(e) {
      if (
         [8, 9, 27, 13, 46].includes(e.keyCode) || // Backspace, Tab, etc.
         (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) || // Ctrl+A/C/V/X
         (e.keyCode >= 35 && e.keyCode <= 39) // Home, End, Arrows
      ) {
         return;
      }

      if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
         e.preventDefault();
      }
   }

   function handleFocus(e) {
      e.target.select();
   }

   function handleBlur(e) {
      const raw = e.target.value.replace(/[^\d]/g, "");
      const parsed = parseInt(raw, 10) || 0;
      item.system.amount = parsed;
      formattedAmount = `${parsed} ¥`;
   }
</script>

<div class="sr3e-waterfall-wrapper">
   <div class={`sr3e-waterfall sr3e-waterfall--${layoutMode}`}>
      <ItemSheetComponent>
         <Image src={item.img} title={item.name} />
         <div class="stat-grid single-column">
            <StatCard>
               <div class="stat-card-background"></div>
               <input
                  class="large"
                  name="name"
                  type="text"
                  value={item.name}
                  onchange={(e) => item.update({ name: e.target.value })}
               />
            </StatCard>

            <StatCard>
               <select {value} onchange={(e) => updateSkillType(e.target.value)}>
                  {#each selectOptions as option}
                     <option value={option.value}>{option.label}</option>
                  {/each}
               </select>
            </StatCard>

            {#if value === "active"}
               <StatCard>
                  <select
                     value={item.system.activeSkill.linkedAttribute}
                     onchange={(e) =>
                        item.update({
                           "system.activeSkill.linkedAttribute": e.target.value,
                        })}
                  >
                     <option disabled value="">
                        {localize(config.skill.linkedAttribute)}
                     </option>
                     {#each attributeOptions as option}
                        <option value={option.value}>{option.label}</option>
                     {/each}
                  </select>
               </StatCard>
            {/if}
         </div>
      </ItemSheetComponent>
      <JournalViewer {item} {config} />
   </div>
</div>
