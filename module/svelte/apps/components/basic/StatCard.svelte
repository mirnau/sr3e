<script>
   import { localize } from "@services/utilities.js";
   import Switch from "@sveltecomponent/Switch.svelte";

   let { item, key, label, value, path, type = "text", options = [], onUpdate } = $props();

   function update(e) {
      let val;
      if (type === "checkbox") {
         val = e.target.checked;
      } else {
         val = e.target.value;
         if (type === "number") val = Number(val);
      }

      // Use onUpdate callback if provided, otherwise fall back to direct item update
      if (onUpdate) {
         onUpdate(val);
      } else {
         item.update({ [`${path}.${key}`]: val });
      }

      console.log(`Updated ${key} to`, val);
   }
</script>

<div class="stat-card">
   <div class="stat-card-background"></div>
   <div class="title-container">
      <h4 class="no-margin uppercase">{label}</h4>
   </div>
   {#if type === "checkbox"}
      <Switch ariaLabel={"button"} checked={value} disabled={false} onChange={(e) => update(e)} />
   {:else if type === "select"}
      <select {value} onchange={update}>
         <option value="" disabled selected hidden>{game.i18n.localize(CONFIG.sr3e.placeholders.selectanoption)}</option
         >
         {#each options as option}
            <option value={option} selected={value === option}>{option}</option>
         {/each}
      </select>
   {:else}
      <input {type} step={type === "number" ? "any" : undefined} {value} onchange={update} />
   {/if}
</div>
