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

   let activePool: string[] = [];
   let pendingPool: string[] | null = null;
   let anim: Animation | null = null;

   const FALLBACK = ["System: Please stand by.", "Waiting for broadcast...", "No active news sources."];
   const widthCache = new Map<string, number>();

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
      for (const { text, el } of spans) widthCache.set(text, el.getBoundingClientRect().width);
      for (const { el } of spans) measureRail!.removeChild(el);
   }

   function totalContentWidth(pool: string[]): number {
      return pool.reduce((sum, t) => sum + (widthCache.get(t) ?? 0), 0)
         + GAP_PX * Math.max(0, pool.length - 1);
   }

   function buildContent(pool: string[]): void {
      if (!inner) return;
      const existing = inner.children;
      for (let i = 0; i < pool.length; i++) {
         if (i < existing.length) {
            (existing[i] as HTMLElement).textContent = pool[i]!;
         } else {
            const el = document.createElement("span");
            el.className = "marquee-item";
            el.textContent = pool[i]!;
            inner.appendChild(el);
         }
      }
      while (inner.children.length > pool.length) inner.removeChild(inner.lastChild!);
   }

   function runPass(pool: string[]): void {
      if (!inner || !ticker) return;
      const tickerW = ticker.clientWidth;
      const contentW = totalContentWidth(pool);
      const duration = ((tickerW + contentW) / SCROLL_SPEED) * 1000;

      // Pin off-screen right before cancelling so fill doesn't snap element away.
      inner.style.transform = `translateX(${tickerW}px)`;
      anim?.cancel();

      // Rebuild content while off-screen — no visible texture invalidation.
      buildContent(pool);
      activePool = pool;

      anim = inner.animate(
         [
            { transform: `translateX(${tickerW}px)` },
            { transform: `translateX(-${contentW}px)` },
         ],
         { duration, easing: "linear", fill: "none" },
      );

      anim.onfinish = () => {
         const next = pendingPool ?? activePool;
         pendingPool = null;
         runPass(next);
      };

      if (!isOn) anim.pause();
   }

   function applyFrame(frame: DisplayFrame) {
      if (!frame || !Array.isArray(frame.buffer)) return;
      if (frame.buffer.length === 0) return;
      const pool = frame.buffer.map((m) =>
         m?.sender && m?.headline ? `${m.sender}: "${m.headline}"` : String(m),
      );
      (window.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 0)))(() => {
         precacheWidths(pool);
         pendingPool = pool;
      });
   }

   function handleKeydown(event: KeyboardEvent) {
      if (event.key === "F2") {
         event.preventDefault();
         isOn = !isOn;
      }
   }

   $effect(() => {
      if (!anim) return;
      isOn ? anim.play() : anim.pause();
   });

   onMount(() => {
      if (ticker) service.reportTickerWidth(ticker.clientWidth);

      const resizeObserver = new ResizeObserver(() => {
         if (ticker) service.reportTickerWidth(ticker.clientWidth);
         // Queue a fresh pass so next loop picks up the new tickerW.
         pendingPool = activePool.length ? activePool : FALLBACK;
      });
      if (ticker) resizeObserver.observe(ticker);

      const restartIfFinished = () => {
         if (!isOn) return;
         if (!anim || anim.playState === "finished" || anim.playState === "idle") {
            const next = pendingPool ?? activePool;
            pendingPool = null;
            runPass(next.length ? next : FALLBACK);
         } else if (anim.playState === "paused") {
            anim.play();
         }
      };

      const onBlur = () => { if (isOn) anim?.pause(); };

      const onVisibilityChange = () => {
         if (!document.hidden) restartIfFinished();
      };

      precacheWidths(FALLBACK);
      runPass(FALLBACK);

      const unsubscribe = currentDisplayFrame.subscribe(applyFrame);
      window.addEventListener("keydown", handleKeydown);
      window.addEventListener("focus", restartIfFinished);
      window.addEventListener("blur", onBlur);
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
         anim?.cancel();
         unsubscribe();
         window.removeEventListener("keydown", handleKeydown);
         window.removeEventListener("focus", restartIfFinished);
         window.removeEventListener("blur", onBlur);
         document.removeEventListener("visibilitychange", onVisibilityChange);
         resizeObserver.disconnect();
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
