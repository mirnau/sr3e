<script>
   let { procedureStore, OnClose, CommitEffects } = $props();
</script>

<button class="regular" type="button" onclick={async () => await $procedureStore.challenge({ OnClose, CommitEffects })}
   >Challenge!
</button>
