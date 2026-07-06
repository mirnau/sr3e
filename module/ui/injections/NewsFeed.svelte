<script lang="ts">
   import { getNewsService, currentDisplayFrame } from "../../services/news-service/NewsService.svelte";
   import { NewsConfig } from "../../services/news-service/NewsConfig";
   import { installTickerDiagnostics } from "./tickerDiagnostics";
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

   interface RenderFrame {
      pool: string[];
   }

   const SCROLL_SPEED = NewsConfig.SCROLL_SPEED;
   const service = getNewsService();

   let isOn = $state(true);
   let ticker: HTMLDivElement | undefined;
   let inner: HTMLDivElement | undefined;

   let activePool: string[] = [];
   let activeFrame: RenderFrame | null = null;
   let pendingFrame: RenderFrame | null = null;
   let anim: Animation | null = null;
   let retryRafId: number | null = null;
   let pendingRetryFrame: RenderFrame | null = null;

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

   function runPass(frame: RenderFrame): void {
      const pool = frame.pool;
      if (!inner || !ticker || pool.length === 0) return;
      const tickerW = ticker.clientWidth;

      // Window not yet laid out — defer until next frame to avoid zero-duration cycle
      if (tickerW === 0) {
         pendingRetryFrame = frame;
         if (retryRafId === null) {
            retryRafId = requestAnimationFrame(() => {
               retryRafId = null;
               const toRun = pendingRetryFrame;
               pendingRetryFrame = null;
               if (toRun) runPass(toRun);
            });
         }
         return;
      }

      if (retryRafId !== null) {
         cancelAnimationFrame(retryRafId);
         retryRafId = null;
         pendingRetryFrame = null;
      }

      // Move off-screen right before cancelling fill so no visible snap
      inner.style.transform = `translateX(${tickerW}px)`;
      anim?.cancel();

      // Build content first, then read scrollWidth — one layout flush vs N getBoundingClientRect calls.
      // scrollWidth gives actual flex rendered width including column-gap, no manual gap arithmetic needed.
      buildContent(pool);
      activePool = pool;
      activeFrame = frame;
      // Measured width at constant SCROLL_SPEED — never the controller's estimate.
      // Integer px-per-frame steps; fractional speeds crawl across the device-pixel grid.
      const contentW = inner.scrollWidth;
      const duration = ((tickerW + contentW) / SCROLL_SPEED) * 1000;

      (globalThis as any).sr3eTickerDebug?.logPass({
         poolSize: pool.length,
         contentW,
         tickerW,
         durationMs: duration,
      });

      const thisAnim = (anim = inner.animate(
         [
            { transform: `translateX(${tickerW}px)` },
            { transform: `translateX(-${contentW}px)` },
         ],
         { duration, easing: "linear", fill: "forwards" },
      ));

      // .finished resolves as a microtask — fires before the next rendered frame,
      // eliminating the blank-ticker gap that onfinish (macrotask) produces.
      // No pending frame yet -> loop the current pool until the controller ships one.
      thisAnim.finished.then(() => {
         if (anim !== thisAnim) return;
         const next = pendingFrame ?? activeFrame;
         pendingFrame = null;
         if (next) runPass(next);
      }).catch(() => {});
   }

   function applyFrame(frame: DisplayFrame) {
      if (!frame || !Array.isArray(frame.buffer) || frame.buffer.length === 0) return;
      const pool = frame.buffer.map((m) =>
         m?.sender && m?.headline ? `${m.sender}: "${m.headline}"` : String(m),
      );
      const renderFrame = { pool };
      if (!isOn) {
         pendingFrame = renderFrame;
         return;
      }
      if (!anim || anim.playState === "finished" || anim.playState === "idle") {
         runPass(renderFrame);
      } else {
         pendingFrame = renderFrame;
      }
   }

   function handleKeydown(event: KeyboardEvent) {
      if (event.key === "F2") {
         event.preventDefault();
         isOn = !isOn;
      }
   }

   $effect(() => {
      if (isOn) {
         if (!anim || anim.playState === "idle" || anim.playState === "finished") {
            const frame = pendingFrame ?? activeFrame ?? (activePool.length ? { pool: activePool } : null);
            if (frame) { pendingFrame = null; runPass(frame); }
         }
      } else {
         anim?.cancel();
         anim = null;
         if (inner) inner.style.transform = `translateX(${ticker?.clientWidth ?? 9999}px)`;
      }
   });

   onMount(() => {
      const removeDiagnostics = installTickerDiagnostics(() => anim, () => inner);
      if (ticker) service.reportTickerWidth(ticker.clientWidth);

      const resizeObserver = new ResizeObserver(() => {
         if (ticker) service.reportTickerWidth(ticker.clientWidth);
         if (activeFrame) pendingFrame = activeFrame;
      });
      if (ticker) resizeObserver.observe(ticker);

      const restartIfFinished = () => {
         if (!isOn) return;
         if (!anim || anim.playState === "finished" || anim.playState === "idle") {
            if (pendingFrame) {
               const next = pendingFrame;
               pendingFrame = null;
               runPass(next);
            }
         } else if (anim.playState === "paused") {
            anim.play();
         }
      };

      let blurTimer: ReturnType<typeof setTimeout> | null = null;

      const onBlur = () => {
         blurTimer = setTimeout(() => {
            if (!document.hasFocus() && isOn) anim?.pause();
         }, 150);
      };

      const onFocus = () => {
         if (blurTimer) { clearTimeout(blurTimer); blurTimer = null; }
         restartIfFinished();
      };

      const onVisibilityChange = () => {
         if (document.hidden) {
            if (isOn) anim?.pause();
         } else {
            restartIfFinished();
         }
      };

      const unsubscribe = currentDisplayFrame.subscribe(applyFrame);
      window.addEventListener("keydown", handleKeydown);
      window.addEventListener("blur", onBlur);
      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
         removeDiagnostics();
         anim?.cancel();
         if (retryRafId !== null) { cancelAnimationFrame(retryRafId); retryRafId = null; }
         if (blurTimer) clearTimeout(blurTimer);
         unsubscribe();
         window.removeEventListener("keydown", handleKeydown);
         window.removeEventListener("blur", onBlur);
         window.removeEventListener("focus", onFocus);
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
         style={`column-gap: ${NewsConfig.GAP_PX}px;`}
      ></div>
   </div>
</div>
