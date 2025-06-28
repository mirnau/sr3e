<script>
   let { text = $bindable(""), config = {}, onblur = () => {}, oninput = () => {}, onkeydown = () => {} } = $props();
</script>

<div class="input-component-container">
   <div class="input-component-container-background"></div>
   <div
      class="input-container-text"
      bind:innerText={text}
      contenteditable
      role="textbox"
      aria-multiline="false"
      tabindex="0"
      {onblur}
      {oninput}
      {onkeydown}
      spellcheck="false"
   ></div>
</div>
