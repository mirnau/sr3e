<script lang="ts">
   import SR3EItem from "../../documents/SR3EItem";

   let {
      item,
      key,
      label,
      value = $bindable(),
      path,
      type = "text",
      options = [],
      onUpdate,
   }: {
      item?: SR3EItem;
      key: string;
      label: string;
      value: any;
      path?: string;
      type?: "text" | "number" | "checkbox" | "select";
      options?: Array<{ value: any; label: string }>;
      onUpdate?: (value: any) => void;
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

      // Update bindable value
      value = val;
   }
</script>

<div class="stat-card">
   <div class="stat-card-background"></div>
   <div class="title-container">
      <h4 class="no-margin uppercase">{label}</h4>
   </div>

   {#if type === "checkbox"}
      <input
         type="checkbox"
         checked={value}
         onchange={update}
         aria-label={label}
      />
   {:else if type === "select"}
      <select value={value ?? ""} onchange={update}>
         <option
            value=""
            disabled
            selected={value == null || value === ""}
            hidden
         >
            {game.i18n.localize("sr3e.placeholders.selectanoption")}
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
      />
   {/if}
</div>