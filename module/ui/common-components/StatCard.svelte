<script lang="ts">
   import SR3EItem from "../../documents/SR3EItem";
   import Switch from "./Switch.svelte";

   let {
      item,
      key,
      label,
      value = $bindable(),
      path,
      type = "text",
      options = [],
      placeholder,
      onUpdate,
      disabled = false,
   }: {
      item?: SR3EItem;
      key: string;
      label: string;
      value: any;
      path?: string;
      type?: "text" | "number" | "checkbox" | "select";
      options?: Array<{ value: any; label: string }>;
      placeholder?: string;
      onUpdate?: (value: any) => void;
      disabled?: boolean;
   } = $props();

   function update(e: Event) {
      const target = e.target as HTMLInputElement | HTMLSelectElement;
      let val: any;

      if (type === "checkbox") {
         val = (target as HTMLInputElement).checked;
      } else {
         val = target.value;
         if (type === "number") val = Number(val);
      }

      if (onUpdate) {
         onUpdate(val);
      } else if (item && path) {
         item.update({ [`${path}.${key}`]: val }, { render: false });
      }
      value = val;
   }
</script>

<div class="stat-card stat-field-card" class:inactive={disabled}>
   <div class="stat-card-background"></div>
   <div class="title-container">
      <h4 class="no-margin uppercase">{label}</h4>
   </div>

   {#if type === "checkbox"}
      <Switch
         bind:checked={value}
         ariaLabel={label}
         onChange={update}
         {disabled}
      />
   {:else if type === "select"}
      <select value={value ?? ""} onchange={update} {disabled}>
         <option
            value=""
            disabled
            selected={value == null || value === ""}
            hidden
         >
            {placeholder ?? game.i18n.localize("sr3e.placeholders.selectanoption")}
         </option>
         {#each options as option}
            <option value={option.value} selected={value === option.value}>
               {option.label}
            </option>
         {/each}
      </select>
   {:else}
      <input
         {type}
         step={type === "number" ? "any" : undefined}
         {value}
         onchange={update}
         {disabled}
      />
   {/if}
</div>
