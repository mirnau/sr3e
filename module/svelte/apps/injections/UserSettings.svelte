<script>
  import { onMount } from "svelte";
  import { localize } from "../../../foundry/SvelteHelpers";
  // Props
  export let app;
  export let config;

  // Svelte state variables
let playerName = "";  // Should be a string
let playerAvatar = "";  // Should be a string
let playerColor = "#ffffff";  // Default color
let playerPronoun = "";  // Should be a string
let mainCharacter = "";  // Should be a string (not an object)
let characterOptions = [];  // Should be an empty array
let user = null;  // Should be null (not an empty object)


  // Reactive variable for main character image.
  // If a main character is selected, find its image from the game actors.
  // Otherwise, use the default image.
  $: mainCharacterImage = mainCharacter
  ? game.actors.find(actor => actor.id === mainCharacter)?.img || "defaultCharacter.jpg"
  : "defaultCharacter.jpg";



  // Initialize user settings on component mount
  onMount(() => {
    const userId = app.id.split(".")[1];
    user = game.users.find((u) => u.id === userId);

    playerName = user.name || "fallback";
    playerAvatar = user.avatar;
    playerColor = user.color;
    playerPronoun = user.getFlag("sr3e", "pronoun") || "";
    mainCharacter = user.getFlag("sr3e", "mainCharacter") || "";

    // Fetch characters the user can observe
    characterOptions = game.actors
      .filter((actor) => actor.testUserPermission(user, "OBSERVER"))
      .map((actor) => ({ id: actor.id, name: actor.name }));
  });

  async function saveSettings() {
    if (app.element) {
      app.element.style.display = "none";
    }

    await game.user.update({
      name: playerName,
      avatar: playerAvatar,
      color: playerColor,
    });

    await game.user.setFlag("sr3e", "pronoun", playerPronoun);
    await game.user.setFlag("sr3e", "mainCharacter", mainCharacter);

    ui.notifications.info("User settings updated!");

    if (app._onSubmit) {
      await app._onSubmit(new Event("submit"));
    }

    app.close();
  }

  // Open File Picker to change the avatar image
  function openFilePicker() {
    new FilePicker({
      type: "image",
      callback: (path) => (playerAvatar = path),
    }).render(true);
  }

  // (Optional) Action when clicking the main character image
  function openCharacterSelector() {
    // You could focus the select element or open a custom dialog here.
    console.log("Main character image clicked");
  }
</script>

<!-- User Settings -->
<div class="item-sheet-component">
  <div class="sr3e-inner-background-container">
    <div class="fake-shadow"></div>
    <div class="sr3e-inner-background">
      <div class="config-columns">
        <div>
          <h1 class="no-margin">{localize(config.userconfig.setPlayerName)}</h1>
        </div>
        <input
          id="player-name"
          type="text"
          bind:value={playerName}
          aria-label={localize(config.userconfig.playerName)}
        />
      </div>

      <!-- Avatar is now just an image -->
      <div class="config-columns">
        <h1 class="no-margin">
          {localize(config.userconfig.choosePlayerColor)}
        </h1>
        <!-- Color container with an overlaid invisible input -->
        <div class="colorpicker" style="background-color: {playerColor}">
          <input
            id="player-color"
            type="color"
            bind:value={playerColor}
            aria-label="Player color"
            style="opacity: 0; position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; cursor: pointer;"
          />
        </div>
      </div>
      <div class="config-columns">
        <div>
          <h1 class="no-margin">
            {localize(config.userconfig.playersPreferredPronoun)}
          </h1>
        </div>
        <input
          id="player-pronoun"
          type="text"
          bind:value={playerPronoun}
          placeholder={localize(config.userconfig.playersPreferredPronoun)}
          aria-label={localize(config.userconfig.playersPreferredPronoun)}
        />
      </div>
    </div>
  </div>
</div>

<!-- Display the avatar and main character images -->
<div class="main-character-portrait">
  <!-- User Avatar Section -->
  <div class="sr3e-inner-background-container">
    <div class="fake-shadow"></div>
    <div class="sr3e-inner-background">
      <img
        role="none"
        src={playerAvatar}
        alt="User Avatar"
        on:click={openFilePicker}
        style="cursor: pointer;"
      />
      <div><h3>{playerName}</h3></div>
    </div>
  </div>

  <!-- Main Character Section -->
  <div class="sr3e-inner-background-container">
    <div class="fake-shadow"></div>
    <div class="sr3e-inner-background">
      <img src={mainCharacterImage} alt="Main Character Portrait" />
      <div><h3>Main Character Name</h3></div>
    </div>
  </div>
</div>

<!-- Main Character selection (dropdown) -->
<div class="item-sheet-component">
  <div class="sr3e-inner-background-container">
    <div class="fake-shadow"></div>
    <div class="sr3e-inner-background">
      <div class="config-columns">
        <label for="main-character">
          {localize(config.userconfig.selectMainCharacter)}
        </label>
        <select
          id="main-character"
          bind:value={mainCharacter}
          aria-label={localize(config.userconfig.selectMainCharacter)}
        >
          <option value="">None</option>
          {#each characterOptions as { id, name }}
            <option value={id}>{name}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>

<!-- Save Button -->
<div class="item-sheet-component">
  <div class="sr3e-inner-background-container">
    <div class="fake-shadow"></div>
    <div class="sr3e-inner-background">
      <button
        type="button"
        on:click={saveSettings}
        aria-label={localize(config.userconfig.saveUserSettings)}
      >
        {localize(config.userconfig.saveSettings)}
      </button>
    </div>
  </div>
</div>
