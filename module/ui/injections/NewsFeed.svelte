<script lang="ts">
   import { getNewsService, currentDisplayFrame } from "../../services/news-service/NewsService.svelte";
   import type { Writable } from "svelte/store";

   interface NewsMessage {
      sender: string;
      headline: string;
   }

   interface DisplayFrame {
      buffer: NewsMessage[];
      timestamp: number;
      duration?: number;
   }

   const SCROLL_SPEED = 100;
   const newsService = getNewsService();

   let isOn = $state(true);
   let ticker: HTMLDivElement | undefined = $state();
   let outer: HTMLDivElement | undefined = $state();
   let inner: HTMLDivElement | undefined = $state();
   let buffer = $state<string[]>([]);
   let lastFrameTimestamp = $state(0);
   let frameDuration = $state(0);
   let animationStart = $state(0);

   function restartAnimation() {
      if (!inner || !outer) return;

      // Reset animation cleanly
      inner.style.animation = "none";
      inner.offsetHeight; // force reflow

      requestAnimationFrame(() => {
         requestAnimationFrame(() => {
            if (!inner) return;

            const fullWidth = inner.scrollWidth;
            frameDuration = Math.max((fullWidth / SCROLL_SPEED) * 1000, 5000);
            const elapsed = Date.now() - animationStart;

            document.documentElement.style.setProperty(
               "--marquee-width",
               `${fullWidth}px`,
            );
            document.documentElement.style.setProperty(
               "--marquee-duration",
               `${frameDuration / 1000}s`,
            );
            document.documentElement.style.setProperty(
               "--marquee-delay",
               `-${elapsed}ms`,
            );

            inner.style.animation = "";
         });
      });
   }

   function applyFrame(frame: DisplayFrame) {
      if (!frame || !Array.isArray(frame.buffer)) return;
      if (frame.buffer.length === 0) return;
      if (frame.timestamp <= lastFrameTimestamp) return;

      lastFrameTimestamp = frame.timestamp;
      animationStart = frame.timestamp;
      buffer = frame.buffer.map((m) =>
         m?.sender && m?.headline ? `${m.sender}: "${m.headline}"` : String(m),
      );

      game.socket.emit("module.sr3e", {
         type: "forceResync",
      });

      if (!ticker) return;
      const tickerWidth = ticker.clientWidth;
      document.documentElement.style.setProperty(
         "--ticker-width",
         `${tickerWidth}px`,
      );

      restartAnimation();
   }

   function handleKeydown(event: KeyboardEvent) {
      if (event.key === "F2") {
         event.preventDefault();
         isOn = !isOn;
      }
   }

   $effect(() => {
      const unsubscribe = currentDisplayFrame.subscribe(applyFrame);

      const handleResync = () => {
         restartAnimation();
      };

      window.addEventListener("keydown", handleKeydown);
      Hooks.on("sr3e.forceResync", handleResync);

      return () => {
         unsubscribe();
         window.removeEventListener("keydown", handleKeydown);
         Hooks.off("sr3e.forceResync", handleResync);
      };
   });
</script>

<div class="ticker" bind:this={ticker}>
   <div class="marquee-outer" bind:this={outer}>
      <div
         class="marquee-inner"
         bind:this={inner}
         role="status"
         aria-live="polite"
         aria-label="News Feed"
      >
         {#if isOn}
            {#each buffer as line}
               <span class="marquee-item">{line}</span>
            {/each}
         {:else}
            <span> </span>
         {/if}
      </div>
   </div>
</div>
