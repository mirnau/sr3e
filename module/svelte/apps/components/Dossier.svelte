<script>
    // Declare the props you want to receive
    export let actorName = "Default Name"; // Fallback value if no prop is passed
    export let message = "No message provided";
  </script>
  
  <div class="partial-app-container">
    <h2>Nested Partial App</h2>
    <div>Actor Name: {actorName}</div> <!-- Display the actor's name -->
    <div>Message: {message}</div> <!-- Display the passed message -->
  </div>
  