<script>
  import { onMount } from "svelte";
  import { openFilePicker } from "@services/utilities.js";

  let { src = "", title = "", alt = "", entity = null } = $props();

  onMount(() => {
    if (entity) {
      src ||= entity.img;
      title ||= entity.name;
      alt ||= entity.name;
    }
  });

  async function handleClick(event) {
    if (entity) await openFilePicker(entity);
  }
</script>

<div class="image-mask">
  <img
    src={src}
    role="presentation"
    data-edit="img"
    title={title}
    alt={alt || title}
    onclick={handleClick}
  />
</div>