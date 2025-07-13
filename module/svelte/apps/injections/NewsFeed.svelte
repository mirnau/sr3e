<script lang="ts">
   import { onMount, tick } from "svelte";
   import { getNewsService } from "../../../services/NewsService.svelte.js";

   const SCROLL_SPEED = 100;
   const NewsService = getNewsService();

   let measurer;
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

      tick().then(() => {
         
         const outerWidth = outer.clientWidth;
         document.documentElement.style.setProperty("--marquee-outer-width", `${outerWidth}px`);
         
         if (!measurer) return;
         
         const fullText = buffer.join("   "); // add spacing between items
         measurer.textContent = fullText;

         const totalPx = measurer.scrollWidth;
         const duration = Math.max((totalPx / SCROLL_SPEED) * 1000, 5000); // or your DEFAULT_MS

         document.documentElement.style.setProperty("--marquee-width", `${totalPx}px`);
         document.documentElement.style.setProperty("--marquee-duration", `${duration / 1000}s`);
         document.documentElement.style.setProperty("--marquee-delay", `-${Date.now() - animationStart}ms`);

         restartAnimation();
      });
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

<div class="ticker">
   <div class="marquee-outer" bind:this={outer}>
      <div class="marquee-inner" bind:this={inner} role="status" aria-live="polite" aria-label="News Feed">
         <div class="marquee-measurer" bind:this={measurer} aria-hidden="true"></div>
         {#each buffer as line}
            <span class="marquee-item">{line}</span>
         {/each}
      </div>
   </div>
</div>
