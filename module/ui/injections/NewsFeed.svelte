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
   const service = getNewsService();

   let isOn = $state(true);
   let ticker: HTMLDivElement | undefined;
   let inner: HTMLDivElement | undefined;
   let measureRail: HTMLDivElement | undefined;
   let headlinePool: string[] = [];
   let nextIndex = 0;

   type Cart = { el: HTMLSpanElement; width: number };
   let carts: Cart[] = [];

   let offset = 0;
   let rafId: number | null = null;
   let running = false;
   let lastTick = 0;

   const FALLBACK = ["System: Please stand by.", "Waiting for broadcast...", "No active news sources."];
   const widthCache = new Map<string, number>();

   // Batch-measures all uncached texts in the hidden rail (outside rAF — no frame timing impact).
   function precacheWidths(texts: string[]): void {
      if (!measureRail) return;
      const uncached = texts.filter(t => !widthCache.has(t));
      if (uncached.length === 0) return;

      const spans = uncached.map(text => {
         const el = document.createElement("span");
         el.className = "marquee-item";
         el.textContent = text;
         measureRail!.appendChild(el);
         return { text, el };
      });
      for (const { text, el } of spans) {
         widthCache.set(text, el.getBoundingClientRect().width);
      }
      for (const { el } of spans) {
         measureRail!.removeChild(el);
      }
   }

   function nextHeadline(): string {
      const pool = headlinePool.length ? headlinePool : FALLBACK;
      const text: string = pool[nextIndex % pool.length] as string;
      nextIndex = (nextIndex + 1) % pool.length;
      return text;
   }

   function addCart(text: string) {
      if (!inner) return;
      const el = document.createElement("span");
      el.className = "marquee-item";
      el.textContent = text;
      inner.appendChild(el);
      const width = widthCache.get(text) ?? el.getBoundingClientRect().width;
      carts.push({ el, width });
   }

   function removeFirstCart() {
      const first = carts.shift();
      if (first) inner?.removeChild(first.el);
   }

   function seedTrain() {
      const initialOffset = ticker?.clientWidth ?? 400;
      offset = initialOffset;
      for (let i = 0; i < 3; i++) addCart(nextHeadline());
   }

   function step(now: number) {
      if (!lastTick) lastTick = now;
      // Cap at one frame: skip catch-up after GC pauses/dropped frames rather than lurching.
      const dt = Math.min((now - lastTick) / 1000, 1 / 60);
      lastTick = now;

      offset -= SCROLL_SPEED * dt;

      const firstWidth = carts[0]?.width ?? 0;
      if (firstWidth > 0 && offset + firstWidth < -GAP_PX) {
         offset += firstWidth + GAP_PX;
         removeFirstCart();
         addCart(nextHeadline());
      }

      if (carts.length < 3) addCart(nextHeadline());

      if (inner) inner.style.transform = `translate3d(${offset}px, 0, 0)`;

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
      headlinePool = frame.buffer.map((m) =>
         m?.sender && m?.headline ? `${m.sender}: "${m.headline}"` : String(m),
      );
      nextIndex = 0;
      precacheWidths(headlinePool);
   }

   function handleKeydown(event: KeyboardEvent) {
      if (event.key === "F2") {
         event.preventDefault();
         isOn = !isOn;
      }
   }

   $effect(() => {
      if (!inner) return;
      inner.style.visibility = isOn ? "visible" : "hidden";
   });

   onMount(() => {
      if (ticker) service.reportTickerWidth(ticker.clientWidth);

      const resizeObserver = new ResizeObserver(() => {
         if (ticker) service.reportTickerWidth(ticker.clientWidth);
      });
      if (ticker) resizeObserver.observe(ticker);

      const onVisibilityChange = () => { if (!document.hidden) lastTick = 0; };

      precacheWidths(FALLBACK);
      seedTrain();
      startLoop();

      const unsubscribe = currentDisplayFrame.subscribe(applyFrame);
      window.addEventListener("keydown", handleKeydown);
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
         unsubscribe();
         window.removeEventListener("keydown", handleKeydown);
         document.removeEventListener("visibilitychange", onVisibilityChange);
         resizeObserver.disconnect();
         stopLoop();
         carts = [];
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
      ></div>
      <div
         class="marquee-inner"
         bind:this={measureRail}
         aria-hidden="true"
         style="visibility:hidden;position:absolute;pointer-events:none;"
      ></div>
   </div>
</div>
