/**
 * Console-toggled diagnostics for the news ticker.
 * Enable in DevTools:  sr3eTickerDebug.start()   Stop:  sr3eTickerDebug.stop()
 *
 * Samples three signals every rAF while a pass is running:
 *  - rAF cadence        -> main-thread jank
 *  - anim.currentTime   -> animation clock integrity (jumps = logic bug)
 *  - rendered translateX -> what the eye actually sees (uneven deltas = presentation stutter)
 */

export interface PassInfo {
   poolSize: number;
   contentW: number;
   tickerW: number;
   durationMs: number;
}

const JANK_THRESHOLD_MS = 25;
const REPORT_INTERVAL_MS = 2000;

export function installTickerDiagnostics(
   getAnim: () => Animation | null,
   getInner: () => HTMLElement | undefined,
): () => void {
   let rafId: number | null = null;
   let last = 0;
   let lastTx: number | null = null;
   let lastCt: number | null = null;
   let lastAnim: Animation | null = null;
   let lastPlayState = "";
   let rafDeltas: number[] = [];
   let posDeltas: number[] = [];
   let ctDrift = { ct: 0, wall: 0 };
   let loafObserver: PerformanceObserver | null = null;

   function readTx(): number | null {
      const inner = getInner();
      if (!inner) return null;
      const t = getComputedStyle(inner).transform;
      if (!t || t === "none") return null;
      return new DOMMatrixReadOnly(t).m41;
   }

   function report(): void {
      if (rafDeltas.length === 0) return;
      const jank = rafDeltas.filter((d) => d > JANK_THRESHOLD_MS).length;
      const rafAvg = rafDeltas.reduce((s, d) => s + d, 0) / rafDeltas.length;

      let posLine = "pos: n/a";
      if (posDeltas.length > 2) {
         const mags = posDeltas.map(Math.abs);
         const mean = mags.reduce((s, d) => s + d, 0) / mags.length;
         const sorted = [...mags].sort((a, b) => a - b);
         const median = sorted[Math.floor(sorted.length / 2)]!;
         const zeros = mags.filter((d) => d < 0.01).length;
         const jumps = mags.filter((d) => median > 0.01 && d > median * 2).length;
         const worstJump = Math.max(...mags);
         posLine =
            `pos Δ mean ${mean.toFixed(2)}px median ${median.toFixed(2)}px | ` +
            `zero-frames ${zeros} | jumps>2×median ${jumps} | worst ${worstJump.toFixed(2)}px`;
      }

      const drift = ctDrift.wall > 0 ? (ctDrift.ct / ctDrift.wall).toFixed(3) : "n/a";
      console.log(
         `[sr3e ticker] rAF ${rafAvg.toFixed(1)}ms janks ${jank}/${rafDeltas.length} | ${posLine} | clock ratio ${drift}`,
      );
      rafDeltas = [];
      posDeltas = [];
      ctDrift = { ct: 0, wall: 0 };
   }

   function tick(now: number): void {
      const anim = getAnim();

      if (anim !== lastAnim) {
         console.log(`[sr3e ticker] animation replaced (playState ${anim?.playState ?? "none"})`);
         lastAnim = anim;
         lastTx = null;
         lastCt = null;
      }
      const playState = anim?.playState ?? "none";
      if (playState !== lastPlayState) {
         console.log(`[sr3e ticker] playState: ${lastPlayState || "(init)"} -> ${playState}`);
         lastPlayState = playState;
      }

      if (last > 0 && now - last < REPORT_INTERVAL_MS) {
         rafDeltas.push(now - last);

         if (anim && playState === "running") {
            const tx = readTx();
            if (tx !== null && lastTx !== null) posDeltas.push(tx - lastTx);
            lastTx = tx;

            const ct = Number(anim.currentTime ?? 0);
            if (lastCt !== null) {
               ctDrift.ct += ct - lastCt;
               ctDrift.wall += now - last;
            }
            lastCt = ct;
         } else {
            lastTx = null;
            lastCt = null;
         }
      }
      last = now;
      if (rafDeltas.reduce((s, d) => s + d, 0) >= REPORT_INTERVAL_MS) report();
      rafId = requestAnimationFrame(tick);
   }

   function observeLongFrames(): void {
      if (typeof PerformanceObserver === "undefined") return;
      if (!PerformanceObserver.supportedEntryTypes?.includes("long-animation-frame")) return;
      loafObserver = new PerformanceObserver((list) => {
         for (const entry of list.getEntries() as any[]) {
            const scripts = (entry.scripts ?? [])
               .map((s: any) => `${s.name ?? s.invoker ?? "?"}:${Math.round(s.duration)}ms`)
               .join(", ");
            console.warn(
               `[sr3e ticker] long frame ${Math.round(entry.duration)}ms` + (scripts ? ` — ${scripts}` : ""),
            );
         }
      });
      loafObserver.observe({ type: "long-animation-frame", buffered: false });
   }

   const api = {
      start() {
         if (rafId !== null) return;
         last = 0;
         lastTx = null;
         lastCt = null;
         lastPlayState = "";
         rafDeltas = [];
         posDeltas = [];
         ctDrift = { ct: 0, wall: 0 };
         observeLongFrames();
         rafId = requestAnimationFrame(tick);
         console.log("[sr3e ticker] diagnostics started");
      },
      stop() {
         if (rafId !== null) cancelAnimationFrame(rafId);
         rafId = null;
         loafObserver?.disconnect();
         loafObserver = null;
         console.log("[sr3e ticker] diagnostics stopped");
      },
      logPass(info: PassInfo) {
         if (rafId === null) return;
         const speed = (info.tickerW + info.contentW) / (info.durationMs / 1000);
         console.log(
            `[sr3e ticker] pass: ${info.poolSize} items, content ${Math.round(info.contentW)}px, ` +
               `ticker ${Math.round(info.tickerW)}px, duration ${Math.round(info.durationMs)}ms => ${speed.toFixed(1)}px/s`,
         );
      },
   };

   (globalThis as any).sr3eTickerDebug = api;
   return () => {
      api.stop();
      if ((globalThis as any).sr3eTickerDebug === api) delete (globalThis as any).sr3eTickerDebug;
   };
}
