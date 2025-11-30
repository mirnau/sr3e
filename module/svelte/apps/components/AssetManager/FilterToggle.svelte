<script>
   let { checked = $bindable(), label = $bindable(), svgName, disabled = false, onChange = null } = $props();
   let icon = $state("");

   $effect(async () => {
      if (!svgName) {
         icon = "";
         return;
      }
      try {
         const res = await fetch(`systems/sr3e/textures/svgrepo/${svgName}`);
         icon = await res.text();
      } catch {
         icon = ""; // Silent fail is acceptable for icons
      }
   });

   const handleToggle = () => {
      if (disabled) return;
      checked = !checked;
      onChange?.({ target: { checked } });
   };

   const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         handleToggle();
      }
   };
</script>

<div
   class="toggle-card button"
   role="checkbox"
   aria-checked={checked}
   aria-label={label || "Toggle"}
   tabindex="0"
   onclick={handleToggle}
   onkeydown={handleKeyDown}
>
   <div class="stat-card-background"></div>
   <span class="svg-wrapper" data-active={checked}>
      {@html icon}
   </span>
   <h6 class="no-margin uppercase">{label}</h6>
</div>
