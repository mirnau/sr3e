<script>
   import { onMount, tick } from "svelte";
   import { getNewsService } from "../../../services/NewsService.svelte.js";

   let outer, inner;
   let buffer = $state([]);
   let animationStart = Date.now();
   let lastFrameTimestamp = 0;

   const SCROLL_SPEED = 100;

   function applyFrame(frame) {
      if (!frame || frame.timestamp === lastFrameTimestamp) return;
      lastFrameTimestamp = frame.timestamp;
      buffer = frame.buffer.map((m) => `${m.sender}: "${m.headline}"`);
      animationStart = frame.timestamp;
      tick().then(() => inner && requestAnimationFrame(setOffsets));
   }

   function setOffsets() {
      if (!inner || !outer) return;
      const fullWidth = inner.scrollWidth;
      const duration = fullWidth / SCROLL_SPEED;
      const root = document.documentElement;

      root.style.setProperty("--marquee-width", `${fullWidth}px`);
      root.style.setProperty("--marquee-duration", `${duration}s`);
      root.style.setProperty("--marquee-delay", `-${Date.now() - animationStart}ms`);
   }

   function handleFrameUpdate(data) {
      if (data.type === "frameUpdate") {
         applyFrame({ buffer: data.buffer, timestamp: data.timestamp });
      }
   }

   onMount(() => {
      console.log("NewsFeed mounted, setting up listeners");
      
      // Listen for socket events
      game.socket.on("module.sr3e", handleFrameUpdate);
      
      // Get initial frame from service
      const newsService = getNewsService();
      const currentFrame = newsService.currentDisplayFrame;
      
      if (currentFrame) {
         // Subscribe to frame updates
         const unsubscribe = currentFrame.subscribe((frame) => {
            console.log("Frame update received:", frame);
            applyFrame(frame);
         });
         
         // Clean up subscription on destroy
         return () => {
            unsubscribe();
            game.socket.off("module.sr3e", handleFrameUpdate);
         };
      }
      
      // Request initial sync
      game.socket.emit("module.sr3e", { type: "requestFrameSync" });
   });
</script>

<div class="ticker">
   <div class="marquee-outer" bind:this={outer}>
      <div
         class="marquee-inner"
         bind:this={inner}
         onanimationiteration={() => game.socket.emit("module.sr3e", { type: "requestFrameSync" })}
         role="status"
         aria-live="polite"
         aria-label="News Feed"
      >
         {#each buffer as message}
            <span class="marquee-item">{message}</span>
         {/each}
      </div>
   </div>
</div>