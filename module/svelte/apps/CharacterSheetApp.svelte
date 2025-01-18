<script>
    export let actor;
  
    // Log the actor prop to the console
    console.log("Actor in Svelte App:", actor);
  
    // Fallbacks to ensure rendering does not break
    let name = actor?.name || "Unknown Actor";
    let type = actor?.type || "Unknown Type";
  </script>
  
  <div>
    <h1>{name}</h1>
    <p>Type: {type}</p>
  </div>
  