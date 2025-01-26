<script>
  
  import { onMount } from "svelte";
  import Log from "../../../Log.js";
  import { initializeMasonryLayout } from "../../foundry/masonry/masonryInitMain.js";

  export let app;
  export let config;
  export let jQueryObject;
  
  let actor = app.actor;
  let name = actor?.name || "Unknown Actor";
  let test = game.i18n.localize(config.test);

  onMount(() => {
    
    const args = {
      jQueryObject: jQueryObject,
      parentSelector: ".character-sheet-masonry",
      childSelector: ".sheet-component",
      gridSizerSelector: ".layout-grid-sizer",
      gutterSizerSelector: ".layout-gutter-sizer",
      observer: actor.mainLayoutResizeObserver,
      app: app,
    };

    initializeMasonryLayout(args, true);

    Log.success("Masonry layout initialized", "CharacterSheetApp.svelte");
  });
</script>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <h1>{test}</h1>
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component two-span-selectable">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <h1>{test}</h1>
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <h1>{test}</h1>
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <h1>{test}</h1>
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <h1>{test}</h1>
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <h1>{test}</h1>
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <h1>{test}</h1>
        Testing Databind
      </div>
    </div>
  </div>

