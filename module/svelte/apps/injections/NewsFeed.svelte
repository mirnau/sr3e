<script>
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte";
   import { onDestroy, onMount } from "svelte";

   let outer;
   let inner;
   const SCROLL_SPEED = 100; // pixels per second

   let { actor } = $props();

   let visible = $state(true);

   let messages = [
      "Welcome Chummer! You can toggle the newsfeed on and off using F2 on your keyboard...",
      "Attribute points are uncapped, consult your core rule-book to find out what applies to your character...",
      "GMs can create a broadcaster actor, to cusomize this news reel...",
   ];
   let newsFeed = $state([messages]);

   let storeManager = StoreManager.Subscribe(actor);
   const brooadCasters = storeManager.GetBroadcastStore(actor.id, "broadcasters", []);
   const unsubscribe = brooadCasters.onBroadcast((msgs) => {
      newsFeed = msgs;
   });

   onDestroy(() => {
      unsubscribe();
      StoreManager.Unsubscribe(actor);
   });

   let resizeDebounce;

   function debouncedSetOffsets() {
      clearTimeout(resizeDebounce);
      resizeDebounce = setTimeout(() => {
         setOffsets();
      }, 150);
   }

   function setOffsets() {
      if (!outer || !inner || messages.length === 0) return;

      const app = document.querySelector(".window-header") || outer.closest(".window-header");
      const appWidth = app?.offsetWidth ?? outer.offsetWidth;

      const halfWidth = inner.scrollWidth / 2;
      const duration = halfWidth / SCROLL_SPEED;

      const root = document.documentElement;
      root.style.setProperty("--marquee-half-width", `${halfWidth}px`);
      root.style.setProperty("--marquee-duration", `${duration}s`);
   }

   function handleKeyToggle(e) {
      // Ignore if something else is focused or if modifier keys are down
      if (e.code === "F2") {
         visible = !visible;
      }
   }

   onMount(() => {
      setOffsets();

      const appHeader = document.querySelector(".window-header") || outer.closest(".window-header");
      const resizeObserver = new ResizeObserver(debouncedSetOffsets);
      if (appHeader) resizeObserver.observe(appHeader);

      window.addEventListener("resize", debouncedSetOffsets);
      window.addEventListener("keydown", handleKeyToggle);

      return () => {
         resizeObserver.disconnect();
         window.removeEventListener("resize", debouncedSetOffsets);
         window.removeEventListener("keydown", handleKeyToggle);
      };
   });
</script>

<div class="ticker">
   <div class="left-gradient"></div>
   <div class="marquee-outer" bind:this={outer}>
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
         class="marquee-inner"
         bind:this={inner}
         onkeydown={(e) => {
            handleKeyToggle(e);
         }}
         role="status"
         aria-live="polite"
         ,
         area-label="News Feed"
      >
         {#if visible && newsFeed.length > 0}
            {#each [...newsFeed.flat(), ...newsFeed.flat()] as msg}
               <span class="marquee-item">
                  {msg}
               </span>
            {/each}
         {/if}
      </div>
   </div>
   <div class="right-gradient"></div>
</div>
