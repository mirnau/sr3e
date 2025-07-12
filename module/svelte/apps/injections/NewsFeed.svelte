<script>
   import { onMount, tick } from "svelte";
   import { getNewsService } from "../../../services/NewsService.svelte.js";

   let outer, inner;
   let buffer = $state([]);
   let animationStart = Date.now();
   let lastFrameTimestamp = 0;

   const SCROLL_SPEED = 100;
   const NewsService = getNewsService();

   function applyFrame(frame) {
      if (!frame || frame.timestamp === lastFrameTimestamp) return;

      console.log("📡 New frame received:", frame);

      lastFrameTimestamp = frame.timestamp;
      buffer = frame.buffer.map((m) => `${m.sender}: "${m.headline}"`);
      animationStart = frame.timestamp;

      // Reset animation so every feed restarts cleanly
      if (inner) {
         inner.style.animation = "none";
         inner.offsetHeight; // force reflow
         inner.style.animation = "";
      }

      tick().then(() => inner && requestAnimationFrame(setOffsets));
   }

   function setOffsets() {
      if (!inner || !outer) return;

      const fullWidth = inner.scrollWidth;
      const duration = fullWidth / SCROLL_SPEED;
      const root = document.documentElement;

      const now = Date.now();
      const elapsed = now - animationStart;
      const remaining = Math.max(duration * 1000 - elapsed, 0);

      root.style.setProperty("--marquee-width", `${fullWidth}px`);
      root.style.setProperty("--marquee-duration", `${duration}s`);
      root.style.setProperty("--marquee-delay", `-${elapsed}ms`);

      // If we're the driver, schedule the next frame
      if (NewsService.TryClaimBroadcast && NewsService.TryClaimBroadcast()) {
         console.log("🟢 Driver scheduling next frame in", remaining, "ms");
         setTimeout(() => {
            game.socket.emit("module.sr3e", { type: "requestFrameSync" });
         }, remaining);
      }
   }

   function handleFrameUpdate(data) {
      if (data.type === "frameUpdate") {
         console.log("📡 Socket frame update received");
         applyFrame({ buffer: data.buffer, timestamp: data.timestamp });
      }
   }

   onMount(() => {
      console.log("🚀 NewsFeed mounted");

      game.socket.on("module.sr3e", handleFrameUpdate);

      const unsubscribe = NewsService.currentDisplayFrame.subscribe((frame) => {
         applyFrame(frame);
      });

      // Force a manual kickoff
      const claimed = NewsService.TryClaimBroadcast?.();
      console.log("🔑 Claimed ticker lock on mount?", claimed);
      if (claimed) {
         console.log("📤 Sending first frame manually");
         NewsService.sendNextFrame();
      } else {
         console.log("⏳ Waiting for broadcast owner to push first frame...");
      }

      return () => {
         unsubscribe();
         game.socket.off("module.sr3e", handleFrameUpdate);
      };
   });
</script>

<div class="ticker">
   <div class="marquee-outer" bind:this={outer}>
      <div class="marquee-inner" bind:this={inner} role="status" aria-live="polite" aria-label="News Feed">
         {#each buffer as message}
            <span class="marquee-item">{message}</span>
         {/each}
      </div>
   </div>
</div>
