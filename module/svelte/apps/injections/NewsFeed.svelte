<script lang="ts">
   import { onMount } from "svelte";
   import { getNewsService } from "../../../services/NewsService.svelte.js";

   const SCROLL_SPEED = 100;
   const NewsService = getNewsService();

   let ticker;
   let outer;
   let inner;
   let buffer = $state([]);
   let lastFrameTimestamp = 0;
   let frameDuration = 0;
   let animationStart = 0;

   function restartAnimation() {
      if (!inner || !outer) return;

      // Reset animation cleanly
      inner.style.animation = "none";
      inner.offsetHeight; // force reflow

      requestAnimationFrame(() => {
         requestAnimationFrame(() => {
            const fullWidth = inner.scrollWidth;
            frameDuration = Math.max((fullWidth / SCROLL_SPEED) * 1000, 5000);
            const elapsed = Date.now() - animationStart;

            document.documentElement.style.setProperty("--marquee-width", `${fullWidth}px`);
            document.documentElement.style.setProperty("--marquee-duration", `${frameDuration / 1000}s`);
            document.documentElement.style.setProperty("--marquee-delay", `-${elapsed}ms`);

            inner.style.animation = "";
         });
      });
   }

   function applyFrame(frame) {
      if (!frame || !Array.isArray(frame.buffer)) return;
      if (frame.buffer.length === 0) return;
      if (frame.timestamp <= lastFrameTimestamp) return;

      lastFrameTimestamp = frame.timestamp;
      animationStart = frame.timestamp;
      buffer = frame.buffer.map((m) => (m?.sender && m?.headline ? `${m.sender}: "${m.headline}"` : String(m)));

      if (NewsService.isController) {
         game.socket.emit("module.sr3e", {
            type: "forceResync",
         });
      }

      const tickerWidth = ticker.clientWidth;
      document.documentElement.style.setProperty("--ticker-width", `${tickerWidth}px`);

      restartAnimation();
   }

   onMount(() => {
      console.log("NewsFeed: Mounted");
      const unsub = NewsService.currentDisplayFrame.subscribe(applyFrame);

      const handleResync = () => {
         console.log("NewsFeed: Force resync triggered");
         restartAnimation();
      };
      Hooks.on("sr3e.forceResync", handleResync);

      return () => {
         unsub();
         Hooks.off("sr3e.forceResync", handleResync);
      };
   });
</script>

<div class="ticker"bind:this={ticker}>
   <div class="marquee-outer" bind:this={outer}>
      <div class="marquee-inner" bind:this={inner} role="status" aria-live="polite" aria-label="News Feed">
         {#each buffer as line}
            <span class="marquee-item">{line}</span>
         {/each}
      </div>
   </div>
</div>
