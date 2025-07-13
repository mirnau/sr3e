<script lang="ts">
   /*
   NewsFeed.svelte is a fully passive Svelte component that visually renders a synchronized, scrolling news ticker. It subscribes to a shared NewsService and displays a buffer of messages received via socket broadcast, ensuring consistent animation across all connected clients.
   */

   import { onMount } from "svelte";
   import { getNewsService, requestFrameSync } from "../../../services/NewsService.svelte.js";

   const SCROLL_SPEED = 100;
   const NewsService = getNewsService();

   let outer, inner;
   let buffer = $state([]);
   let animationStart = 0;
   let lastFrameTimestamp = 0;
   let frameDuration = 0;

   function restartAnimation() {
      if (!inner) return;
      inner.style.animation = "none";
      inner.offsetHeight;
      inner.style.animation = "";
      requestAnimationFrame(setOffsets);
   }

   function applyFrame(frame) {
      if (!frame || frame.timestamp === lastFrameTimestamp) return;
      lastFrameTimestamp = frame.timestamp;
      animationStart = frame.timestamp;
      frameDuration = frame.duration ?? 0;
      buffer = frame.buffer.map((m) => `${m.sender}: "${m.headline}"`);
      restartAnimation();
   }

   function setOffsets() {
      if (!inner || !outer) return;
      const fullWidth = inner.scrollWidth;
      const durationMS = frameDuration || (fullWidth / SCROLL_SPEED) * 1000;
      const elapsedMS = Date.now() - animationStart;
      const root = document.documentElement;
      root.style.setProperty("--marquee-width", `${fullWidth}px`);
      root.style.setProperty("--marquee-duration", `${durationMS / 1000}s`);
      root.style.setProperty("--marquee-delay", `-${elapsedMS}ms`);
   }

   onMount(() => {
      Hooks.on("sr3e.forceResync", restartAnimation);
      const unsub = NewsService.currentDisplayFrame.subscribe(applyFrame);
      requestFrameSync();
      return () => {
         unsub();
         Hooks.off("sr3e.forceResync", restartAnimation);
      };
   });
</script>

<div class="ticker">
   <div class="marquee-outer" bind:this={outer}>
      <div class="marquee-inner" bind:this={inner} role="status" aria-live="polite" aria-label="News Feed">
         {#each buffer as line}
            <span class="marquee-item">{line}</span>
         {/each}
      </div>
   </div>
</div>
