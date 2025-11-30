<script>
   let { checked = $bindable(), disabled = false, ariaLabel = "Toggle", onChange = null } = $props();
</script>
<div class="switch">
   <label class="sr3e-switch" aria-label={ariaLabel}>
      <input type="checkbox" bind:checked {disabled} onchange={onChange ? (e) => onChange(e) : null} />
      <span class="slider"></span>
   </label>
</div>
