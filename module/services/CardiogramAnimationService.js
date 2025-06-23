import { lerpColor } from "./utilities.js";

export default class EcgAnimator {
  constructor(
    lineCanvas,
    pointCanvas,
    {
      freq = 1.5,
      amp = 20,
      lineWidth = 2,
      bottomColor = "#00FFFF",
      topColor = "#0000FF",
    } = {}
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
    const offsetX = 10;
    const offsetY = 10;
    const radius = 4;
    const x = this.width - offsetX - radius;

    // Scroll the line canvas left by 1px
    const imageData = this.lineCtx.getImageData(
      1,
      0,
      this.width - 1,
      this.height
    );
    this.lineCtx.clearRect(0, 0, this.width, this.height);
    this.lineCtx.putImageData(imageData, 0, 0);

    // Calculate current point
    const y = this.height / 2 + offsetY - this._getHeartY(this.phase);

    if (this.prevY === undefined) {
      this.prevY = y;
    }

    // Color interpolation
    const normalizedAmp =
      (this._getHeartY(this.phase) + this.amp) / (2 * this.amp);
    const interpolatedColor = lerpColor(
      this.bottomColor,
      this.topColor,
      normalizedAmp
    );

    // Draw ECG curve
    this.lineCtx.beginPath();
    this.lineCtx.moveTo(x - 1, this.prevY);
    this.lineCtx.lineTo(x, y);
    this.lineCtx.strokeStyle = interpolatedColor;
    this.lineCtx.lineWidth = this.lineWidth;
    this.lineCtx.stroke();

    // Optionally fill a pixel in case line gaps happen
    this.lineCtx.fillStyle = interpolatedColor;
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

    // Save previous point and advance phase
    this.prevY = y;
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
