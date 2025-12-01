<script lang="ts">
   let {
      text = "",
      onblur = () => {},
      oninput = () => {},
      onkeydown = () => {},
      children,
      // Optional styling hooks
      containerClass = "",
      textClass = "",
      hideBackground = false,
   } = $props();

   let editableEl;

   $effect(() => {
      if (editableEl && editableEl.innerText !== text) {
         editableEl.innerText = text ?? "";
      }
   });

   function handleInput(e) {
      text = editableEl.innerText;
      oninput(e);
   }
   
</script>

<div class={`input-component-container ${containerClass}`}>
   {#if !hideBackground}
   <div class="input-component-container-background"></div>
   {/if}
   <div
      bind:this={editableEl}
      class={`input-container-text ${textClass}`}
      contenteditable
      role="textbox"
      aria-multiline="false"
      tabindex="0"
      spellcheck="false"
      {onblur}
      oninput={handleInput}
      {onkeydown}
   ></div>
   {@render children?.()}
</div>
