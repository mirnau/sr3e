<script>
    
  /**
   * @typedef {Object} Props
   * @property {string} [actorName] - Declare the props you want to receive - Fallback value if no prop is passed
   * @property {string} [message]
   */

  /** @type {Props} */
  let { actorName = "Default Name", message = "No message provided" } = $props();
  </script>
  
  <div class="partial-app-container">
    <h2>Nested Partial App</h2>
    <div>Actor Name: {actorName}</div> <!-- Display the actor's name -->
    <div>Message: {message}</div> <!-- Display the passed message -->
  </div>
  