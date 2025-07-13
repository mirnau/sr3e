<script lang="ts">
   /*
   NewsFeed.svelte - Synchronized scrolling news ticker that waits for scheduled frame start times
   */

   import { onMount } from "svelte";
   import { getNewsService } from "../../../services/NewsService.svelte.js";

   const SCROLL_SPEED = 100;
   const NewsService = getNewsService();

   let outer, inner;
   let buffer = $state([]);
   let currentFrame = null;
   let animationTimeout = null;

   function scheduleFrameDisplay(frame) {
      if (!frame || frame === currentFrame) return;
      
      currentFrame = frame;
      const now = Date.now();
      const delay = Math.max(0, frame.timestamp - now);
      
      clearTimeout(animationTimeout);
      animationTimeout = setTimeout(() => {
         applyFrame(frame);
      }, delay);
   }

   function applyFrame(frame) {
      if (!frame) return;
      
      buffer = frame.buffer.map((m) => `${m.sender}: "${m.headline}"`);
      
      requestAnimationFrame(() => {
         if (!inner || !outer) return;
         
         const fullWidth = inner.scrollWidth;
         const durationMS = frame.duration || (fullWidth / SCROLL_SPEED) * 1000;
         
         // Reset animation
         inner.style.animation = "none";
         inner.offsetHeight; // Force reflow
         
         // Set CSS properties for synchronized animation
         const root = document.documentElement;
         root.style.setProperty("--marquee-width", `${fullWidth}px`);
         root.style.setProperty("--marquee-duration", `${durationMS / 1000}s`);
         root.style.setProperty("--marquee-delay", "0s");
         
         // Start animation
         inner.style.animation = "";
      });
   }

   onMount(() => {
      const unsub = NewsService.currentDisplayFrame.subscribe(scheduleFrameDisplay);
      
      return () => {
         unsub();
         clearTimeout(animationTimeout);
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