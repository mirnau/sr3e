<script lang="ts">
   import { getNewsService, currentDisplayFrame } from "../../services/news-service/NewsService.svelte";
   import { NewsConfig } from "../../services/news-service/NewsConfig";
   import { onMount } from "svelte";

   interface NewsMessage {
      sender: string;
      headline: string;
   }

   interface DisplayFrame {
      buffer: NewsMessage[];
      timestamp: number;
      duration?: number;
   }

   const SCROLL_SPEED = NewsConfig.SCROLL_SPEED;
   const GAP_PX = NewsConfig.GAP_PX;
   getNewsService();

   let isOn = $state(true);
   let ticker: HTMLDivElement | undefined = $state();
   let outer: HTMLDivElement | undefined = $state();
   let inner: HTMLDivElement | undefined = $state();
   let headlinePool: string[] = $state([]);
   let nextIndex = $state(0);
   let carts = $state<{ id: number; text: string }[]>([]);
   let offset = 0;
   let rafId: number | null = null;
   let lastTick = 0;
   let idCounter = 0;
   let lastFrameUpdate = 0;
   let cartUpdateThisFrame = false;

   const FALLBACK = ["System: Please stand by.", "Waiting for broadcast...", "No active news sources."];
   const RESYNC_COOLDOWN_MS = 500;

   function nextHeadline(): string {
      const pool = headlinePool.length ? headlinePool : FALLBACK;
      const text : string = pool[nextIndex % pool.length] as string;
      nextIndex = (nextIndex + 1) % pool.length;
      return text;
   }

   function seedTrain() {
      const initialOffset = ticker?.clientWidth ?? 400;
      offset = initialOffset;
      carts = [0, 1, 2].map(() => ({
         id: ++idCounter,
         text: nextHeadline(),
      }));
   }

   function step(now: number) {
      if (!lastTick) lastTick = now;
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      cartUpdateThisFrame = false;

      offset -= SCROLL_SPEED * dt;
      if (inner) {
         inner.style.transform = `translate3d(${offset}px, 0, 0)`;
      }

      // remove carts that are fully offscreen left
      if (!cartUpdateThisFrame && carts.length && inner?.firstElementChild instanceof HTMLElement) {
         const firstWidth = inner.firstElementChild.offsetWidth;
         if (firstWidth > 0 && offset + firstWidth < -GAP_PX) {
            offset += firstWidth + GAP_PX;
            // Apply transform immediately with adjusted offset BEFORE adding new cart
            if (inner) {
               inner.style.transform = `translate3d(${offset}px, 0, 0)`;
            }
            // Single atomic update: remove first, add last
            carts = [...carts.slice(1), { id: ++idCounter, text: nextHeadline() }];
            cartUpdateThisFrame = true;
         }
      }

      if (!cartUpdateThisFrame && carts.length < 3) {
         carts = [...carts, { id: ++idCounter, text: nextHeadline() }];
         cartUpdateThisFrame = true;
      }

      rafId = requestAnimationFrame(step);
   }

   function startLoop() {
      if (rafId) cancelAnimationFrame(rafId);
      lastTick = 0;
      rafId = requestAnimationFrame(step);
   }

   function stopLoop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
   }

   function applyFrame(frame: DisplayFrame) {
      if (!frame || !Array.isArray(frame.buffer)) return;
      if (frame.buffer.length === 0) return;
      const incoming = frame.buffer.map((m) =>
         m?.sender && m?.headline ? `${m.sender}: "${m.headline}"` : String(m),
      );
      headlinePool = incoming;
      nextIndex = 0;
      lastFrameUpdate = Date.now();

      game.socket.emit("module.sr3e", {
         type: "forceResync",
      });
   }

   function handleKeydown(event: KeyboardEvent) {
      if (event.key === "F2") {
         event.preventDefault();
         isOn = !isOn;
      }
   }

   onMount(() => {
      seedTrain();
      startLoop();

      const unsubscribe = currentDisplayFrame.subscribe(applyFrame);

      const handleResync = () => {
         const timeSinceLastUpdate = Date.now() - lastFrameUpdate;
         if (timeSinceLastUpdate < RESYNC_COOLDOWN_MS) {
            return;
         }
         seedTrain();
      };

      window.addEventListener("keydown", handleKeydown);
      Hooks.on("sr3e.forceResync", handleResync);

      return () => {
         unsubscribe();
         window.removeEventListener("keydown", handleKeydown);
         Hooks.off("sr3e.forceResync", handleResync);
         stopLoop();
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
         style={`animation: none; column-gap: ${GAP_PX}px; will-change: transform; backface-visibility: hidden;`}
      >
         {#if isOn}
            {#each carts as cart (cart.id)}
               <span class="marquee-item" style="transform: translateZ(0);">{cart.text}</span>
            {/each}
         {:else}
            <span> </span>
         {/if}
      </div>
   </div>
</div>
