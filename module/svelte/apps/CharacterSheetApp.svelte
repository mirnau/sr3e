<script>
  import { onMount } from "svelte";
  import { initializeMasonryLayout } from "../../foundry/masonry/masonryInitMain.js";
  import Log from "../../../Log.js";
  import Dossier from "./components/Dossier.svelte";

  let { app, config, jQueryObject } = $props();

  let actor = app.actor;

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
       
        <Dossier actor={actor} config={config} />
        
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component two-span-selectable">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component two-span-selectable">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
  <div class="sheet-component">
    <div class="inner-background-container">
      <div class="fake-shadow"></div>
      <div class="inner-background">
       
        Testing Databind
      </div>
    </div>
  </div>
</div>
