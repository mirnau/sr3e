<script>
  import { onMount } from "svelte";
  import { initializeMasonryLayout } from "../../foundry/masonry/masonryInitMain.js";
  import Log from "../../../Log.js";
  import Dossier from "./components/Dossier.svelte";

  let { app, config, jQueryObject } = $props();

  let actor = app.actor;
  let test = game.i18n.localize(config.test);

  onMount(() => {
    const args = {
      jQueryObject: jQueryObject,
      parentSelector: ".window-content",
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

<div class="sheet-character-masonry-main">
  <div class="layout-grid-sizer"></div>
  <div class="layout-gutter-sizer"></div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
        <h1>{test}</h1>
        <Dossier {actor} {config} />
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
</div>
