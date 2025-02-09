<script>
    import { onMount } from "svelte";
    import { localize } from "../../../foundry/SvelteHelpers";
  
    // Svelte 5 state variables
    let playerName;
    let playerAvatar;
    let playerColor;
    let playerPronoun;
    let mainCharacter;
    let characterOptions = [];
    let user = {};
  
    // Props
    export let app;
    export let config;
  
    // Initialize user settings
    onMount(() => {
      const userId = app.id.split(".")[1];
      user = game.users.find((u) => u.id === userId);
  
      playerName = user.name;
      playerAvatar = user.avatar;
      playerColor = user.color;
      playerPronoun = user.getFlag("sr3e", "pronoun") || "";
      mainCharacter = user.getFlag("sr3e", "mainCharacter") || "";
  
      // Fetch characters the user can observe
      characterOptions = game.actors
        .filter((actor) => actor.testUserPermission(user, "OBSERVER"))
        .map((actor) => ({ id: actor.id, name: actor.name }));
    });
  
    // Handle Save Button Click
    async function saveSettings() {
      await game.user.update({
        name: playerName,
        avatar: playerAvatar,
        color: playerColor,
      });
  
      await game.user.setFlag("sr3e", "pronoun", playerPronoun);
      await game.user.setFlag("sr3e", "mainCharacter", mainCharacter);
  
      ui.notifications.info("User settings updated!");
      app.close();
    }
  
    // Open File Picker for Avatar
    function openFilePicker() {
      new FilePicker({
        type: "image",
        callback: (path) => (playerAvatar = path),
      }).render(true);
    }
  </script>
  
  <!-- UI Layout -->
  <div class="item-sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <div>
          <h1>{localize(config.userconfig.setPlayerName)}</h1>
        </div>
        <input
          id="player-name"
          type="text"
          bind:value={playerName}
          aria-label={localize(config.userconfig.playerName)}
        />
        <label for="player-avatar">
          <h1>{localize(config.userconfig.avatar)}</h1>
        </label>
        <div class="config-columns">
          <input
            id="player-avatar"
            type="text"
            bind:value={playerAvatar}
            placeholder={config.userconfig.imageFile}
            aria-label={config.userconfig.imageFile}
          />
  
          <button
            type="button"
            on:click={openFilePicker}
            aria-label={localize(config.userconfig.openFilePicker)}
          >
            {localize(config.userconfig.openFilePicker)}
          </button>
  
          <h1>{localize(config.userconfig.choosePlayerColor)}</h1>
  
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
  
        <div>
          <h1>{localize(config.userconfig.playersPreferredPronoun)}</h1>
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
  
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
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
  
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
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
  
  <style>
    .colorpicker {
      position: relative;
      width: 100px;
      height: 100px;
      border: dashed 4px gray;
      cursor: pointer;
    }
  </style>
  