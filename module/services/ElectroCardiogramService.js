import EcgAnimator from "./CardiogramAnimationService.js";

export default class ElectroCardiogramService {
   #ecgCanvas;
   #ecgPointCanvas;
   #ctxLine;
   #ctxPoint;
   #actor;
   #html;
   #resizeObserver;
   ecgAnimator;
   #isResizing = false;

   constructor(actor, { find, html }) {
      this.#actor = actor;
      this.#html = { find };

      this.#ecgCanvas = this.#html.find("#ecg-canvas")[0];
      this.#ecgPointCanvas = this.#html.find("#ecg-point-canvas")[0];

      this.#ctxLine = this.#ecgCanvas.getContext("2d", {
         willReadFrequently: true,
      });
      this.#ctxPoint = this.#ecgPointCanvas.getContext("2d", {
         willReadFrequently: true,
      });

      this.#resizeObserver = new ResizeObserver((entries) => {
         // Debounce resize events
         if (this.#isResizing) return;
         this.#isResizing = true;

         requestAnimationFrame(() => {
            this.#resizeCanvas();
            this.#isResizing = false;
         });
      });

      DEBUG && LOG.inspect("ElectroCardiogramService html", [__FILE__, __LINE__], html);

      this.#resizeObserver.observe(html);

      // Initial resize
      this.#resizeCanvas();

      const highlightColorPrimary = getComputedStyle(document.documentElement)
         .getPropertyValue("--highlight-color-primary")
         .trim();

      const highlightColorTertiary = getComputedStyle(document.documentElement)
         .getPropertyValue("--accent-color-tertiary")
         .trim();

      this.ecgAnimator = new EcgAnimator(this.#ecgCanvas, this.#ecgPointCanvas, {
         freq: 2,
         amp: 30,
         lineWidth: 2,
         bottomColor: highlightColorPrimary,
         topColor: highlightColorTertiary,
      });

      this.ecgAnimator.start();
   }

   #resizeCanvas() {
      const wRatio = window.devicePixelRatio;

      // Store animation state
      const wasAnimating = this.ecgAnimator?._isAnimating;

      // Temporarily stop animation during resize
      if (this.ecgAnimator && wasAnimating) {
         this.ecgAnimator.stop();
      }

      const resize = (canvas, ctx) => {
         const displayWidth = canvas.offsetWidth;
         const displayHeight = canvas.offsetHeight;
         const width = displayWidth * wRatio;
         const height = displayHeight * wRatio;

         // Only resize if dimensions actually changed
         if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
         }

         // Reset transform and apply scaling
         ctx.setTransform(1, 0, 0, 1, 0, 0);
         ctx.scale(wRatio, wRatio);
      };

      resize(this.#ecgCanvas, this.#ctxLine);
      resize(this.#ecgPointCanvas, this.#ctxPoint);

      // Update animator dimensions
      if (this.ecgAnimator) {
         this.ecgAnimator.updateDimensions(this.#ecgCanvas.offsetWidth, this.#ecgCanvas.offsetHeight);

         // Restart animation if it was running
         if (wasAnimating) {
            // Small delay to ensure resize is complete
            setTimeout(() => {
               this.ecgAnimator.start();
            }, 10);
         }
      }
   }

   updateHealthOnStart() {
      const stun = this.#actor.system.health.stun ?? 0;
      const physical = this.#actor.system.health.physical ?? 0;
      const penalty = this.calculatePenalty(stun, physical);
      this.#html.find(".health-penalty").text(penalty);
   }

   calculatePenalty(stun, physical) {
      const maxDegree = Math.max(stun, physical);
      return this._calculateSeverity(maxDegree);
   }

   _calculateSeverity(degree = 0) {
      if (degree === 0) return this.#setPace(1.5, 20), 0;
      if (degree < 3) return this.#setPace(2, 20), 1;
      if (degree < 6) return this.#setPace(4, 25), 2;
      if (degree < 9) return this.#setPace(8, 35), 3;
      if (degree === 9) return this.#setPace(10, 40), 4;
      return this.#setPace(1, 8), 4;
   }

   #setPace(freq, amp) {
      if (this.ecgAnimator) {
         this.ecgAnimator.setFrequency(freq);
         this.ecgAnimator.setAmplitude(amp);
      }
   }
}
