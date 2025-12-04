  <script lang="ts">
    const { actor, form } = $props<{
      actor: Actor;
      form: HTMLFormElement;
    }>();
  </script>

<div> BBBBBBBBBBBBAAAAAAAAAAAAAAAAAAAA{actor.name} - {form}</div>
