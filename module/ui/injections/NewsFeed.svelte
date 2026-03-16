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
   let ticker: HTMLDivElement | undefined;
   let inner: HTMLDivElement | undefined;
   let headlinePool: string[] = [];
   let nextIndex = 0;
   let carts = $state<{ id: number; text: string }[]>([]);
   let offset = 0;
   let rafId: number | null = null;
   let running = false;
   let lastTick = 0;
   let idCounter = 0;

   const FALLBACK = ["System: Please stand by.", "Waiting for broadcast...", "No active news sources."];

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

      offset -= SCROLL_SPEED * dt;
      if (inner) inner.style.transform = `translate3d(${offset}px, 0, 0)`;

      if (carts.length && inner?.firstElementChild instanceof HTMLElement) {
         const firstWidth = inner.firstElementChild.offsetWidth;
         if (firstWidth > 0 && offset + firstWidth < -GAP_PX) {
            const correction = firstWidth + GAP_PX;
            // Apply correction before mutating carts — both land in the same paint
            // (Svelte flushes the DOM removal as a microtask, before the browser paints)
            offset += correction;
            if (inner) inner.style.transform = `translate3d(${offset}px, 0, 0)`;
            carts = [...carts.slice(1), { id: ++idCounter, text: nextHeadline() }];
         }
      }

      if (carts.length < 3) {
         carts = [...carts, { id: ++idCounter, text: nextHeadline() }];
      }

      if (running) rafId = requestAnimationFrame(step);
   }

   function startLoop() {
      if (rafId) cancelAnimationFrame(rafId);
      running = true;
      lastTick = 0;
      rafId = requestAnimationFrame(step);
   }

   function stopLoop() {
      running = false;
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

      window.addEventListener("keydown", handleKeydown);

      return () => {
         unsubscribe();
         window.removeEventListener("keydown", handleKeydown);
         stopLoop();
      };
   });
</script>

<div class="ticker" bind:this={ticker}>
   <div class="marquee-outer">
      <div
         class="marquee-inner"
         bind:this={inner}
         role="status"
         style={`column-gap: ${GAP_PX}px;`}
      >
         {#if isOn}
            {#each carts as cart (cart.id)}
               <span class="marquee-item">{cart.text}</span>
            {/each}
         {:else}
            <span> </span>
         {/if}
      </div>
   </div>
</div>
