<script lang="ts">
   let { checked = $bindable(), disabled = false, ariaLabel = "Toggle", onChange = null } = $props<{
      checked?: boolean;
      disabled?: boolean;
      ariaLabel?: string;
      onChange?: ((e: Event) => void) | null;
   }>();
</script>

<div class="switch">
   <label class="sr3e-switch" aria-label={ariaLabel}>
      <input type="checkbox" bind:checked {disabled} onchange={onChange ? (e) => onChange(e) : null} />
      <span class="slider"></span>
   </label>
</div>
