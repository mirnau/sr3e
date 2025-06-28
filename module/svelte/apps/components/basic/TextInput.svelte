<script>
   let { text = "", onblur = () => {}, oninput = () => {}, onkeydown = () => {}, children } = $props();

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

<div class="input-component-container">
   <div class="input-component-container-background"></div>
   <div
      bind:this={editableEl}
      class="input-container-text"
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
