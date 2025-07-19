import { lerpColor } from "./utilities.js";

export default class EcgAnimator {
   constructor(
      lineCanvas,
      pointCanvas,
      { freq = 1.5, amp = 20, lineWidth = 2, bottomColor = "#00FFFF", topColor = "#0000FF" } = {}
   ) {
      // Bottom canvas for ECG line
      this.lineCanvas = lineCanvas;
      this.lineCtx = lineCanvas.getContext("2d", { willReadFrequently: true });

      // Top canvas for cyan point
      this.pointCanvas = pointCanvas;
      this.pointCtx = pointCanvas.getContext("2d", { willReadFrequently: true });

      // Dimensions
      this.width = lineCanvas.width;
      this.height = lineCanvas.height;

      // Wave parameters
      this.phase = 0;
      this.freq = freq;
      this.amp = amp;

      this.lineWidth = lineWidth;

      this._isAnimating = false;
      this._animFrame = null;

      // Store bottomColor and topColor
      this.bottomColor = bottomColor;
      this.topColor = topColor;
   }

   start() {
      if (this._isAnimating) return;
      this._isAnimating = true;
      this._animate();
   }

   flatline() {
      this.stop();

      this.lineCtx.clearRect(0, 0, this.width, this.height);
      this.pointCtx.clearRect(0, 0, this.width, this.height);

      const centerY = this.height / 2;
      const xStart = 0;
      const xEnd = this.width;

      this.lineCtx.beginPath();
      this.lineCtx.moveTo(xStart, centerY);
      this.lineCtx.lineTo(xEnd, centerY);
      this.lineCtx.strokeStyle = this.bottomColor;
      this.lineCtx.lineWidth = this.lineWidth;
      this.lineCtx.stroke();

      const radius = 4;
      const x = this.width - 10;
      const y = centerY;

      this.pointCtx.beginPath();
      this.pointCtx.arc(x, y, radius, 0, 2 * Math.PI);
      this.pointCtx.fillStyle = this.topColor;
      this.pointCtx.shadowBlur = 5;
      this.pointCtx.shadowColor = this.topColor;
      this.pointCtx.fill();
      this.pointCtx.shadowBlur = 0;
   }

   stop() {
      this._isAnimating = false;
      if (this._animFrame) cancelAnimationFrame(this._animFrame);
   }

   setFrequency(freq) {
      this.freq = freq;
   }
   setAmplitude(amp) {
      this.amp = amp;
   }
   setTopColor(color) {
      this.topColor = color;
   }
   setBottomColor(color) {
      this.bottomColor = color;
   }

   updateDimensions(width, height) {
      this.width = Math.floor(width);
      this.height = Math.floor(height);
   }

   _animate = () => {
      if (!this._isAnimating) return;
      this._drawEcg();
      this._animFrame = requestAnimationFrame(this._animate);
   };

   _drawEcg() {
      if (this.width <= 0 || this.height <= 0) return;

      const offsetX = 10;
      const offsetY = 10;
      const radius = 4;
      const x = this.width - offsetX - radius;

      // Scroll the line canvas left by 1px
      const imageData = this.lineCtx.getImageData(1, 0, this.width - 1, this.height);
      this.lineCtx.clearRect(0, 0, this.width, this.height);
      this.lineCtx.putImageData(imageData, 0, 0);

      const heartY = this._getHeartY(this.phase);
      const centerY = this.height / 2 + offsetY;
      const y = centerY - heartY;

      if (this.prevY === undefined) {
         this.prevY = y;
         this.prevHeartY = heartY;
         this.prevPhase = this.phase;
      }

      // --- Gradient stroke ---
      const prevHeartY = this.prevHeartY;
      const t1 = Math.min(1, Math.abs(prevHeartY) / this.amp);
      const t2 = Math.min(1, Math.abs(heartY) / this.amp);

      const gradient = this.lineCtx.createLinearGradient(x - 1, this.prevY, x, y);
      gradient.addColorStop(0, lerpColor(this.bottomColor, this.topColor, t1));
      gradient.addColorStop(1, lerpColor(this.bottomColor, this.topColor, t2));

      this.lineCtx.beginPath();
      this.lineCtx.moveTo(x - 1, this.prevY);
      this.lineCtx.lineTo(x, y);
      this.lineCtx.strokeStyle = gradient;
      this.lineCtx.lineWidth = this.lineWidth;
      this.lineCtx.stroke();

      // Optional: solid pixel to ensure continuity
      this.lineCtx.fillStyle = lerpColor(this.bottomColor, this.topColor, t2);
      this.lineCtx.fillRect(x, y, 1, 1);

      // Draw needle on top canvas
      this.pointCtx.clearRect(0, 0, this.width, this.height);
      this.pointCtx.beginPath();
      this.pointCtx.arc(x, y, radius, 0, 2 * Math.PI);
      this.pointCtx.fillStyle = this.topColor;
      this.pointCtx.shadowBlur = 5;
      this.pointCtx.shadowColor = this.topColor;
      this.pointCtx.fill();
      this.pointCtx.shadowBlur = 0;

      // Update previous state
      this.prevY = y;
      this.prevHeartY = heartY;
      this.prevPhase = this.phase;

      // Advance waveform
      this.phase += 0.04 * this.freq;
   }

   _getHeartY(phase) {
      const t = phase;
      const cycle = (t % (2 * Math.PI)) / (2 * Math.PI);

      let y = 0;

      // P wave
      if (cycle < 0.1) {
         const alpha = cycle / 0.1;
         y = 0.1 * Math.sin(alpha * Math.PI) * this.amp;
      }
      // Q dip
      else if (cycle < 0.15) {
         const alpha = (cycle - 0.1) / 0.05;
         y = -0.2 * Math.sin(alpha * Math.PI) * this.amp;
      }
      // R spike
      else if (cycle < 0.2) {
         const alpha = (cycle - 0.15) / 0.05;
         y = 0.8 * Math.sin(alpha * Math.PI) * this.amp;
      }
      // S dip
      else if (cycle < 0.25) {
         const alpha = (cycle - 0.2) / 0.05;
         y = -0.2 * Math.sin(alpha * Math.PI) * this.amp;
      }
      // T wave
      else if (cycle < 0.55) {
         const alpha = (cycle - 0.4) / 0.15;
         y = 0.3 * Math.sin(alpha * Math.PI) * this.amp;
      }

      return y;
   }
}
