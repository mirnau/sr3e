import { lerpColor } from "./utilities.js";

export default class CardiogramAnimationService {
    constructor(lineCanvas, pointCanvas, {
        freq = 1.5,
        amp = 20,
        color = 'lime',
        lineWidth = 2,
        bottomColor = '#00FFFF',
        topColor = '#0000FF'

    } = {}) {
        // Bottom canvas for ECG line
        this.lineCanvas = lineCanvas;
        this.lineCtx = lineCanvas.getContext('2d', { willReadFrequently: true });

        // Top canvas for cyan point
        this.pointCanvas = pointCanvas;
        this.pointCtx = pointCanvas.getContext('2d', { willReadFrequently: true });

        // Dimensions
        this.width = lineCanvas.width;
        this.height = lineCanvas.height;

        // Wave parameters
        this.phase = 0;
        this.freq = freq;
        this.amp = amp;

        this.color = color;
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

    setFrequency(freq) { this.freq = freq; }
    setAmplitude(amp) { this.amp = amp; }
    setTopColor(color) {this.topColor = color};
    setBottomColor(color) {this.bottomColor = color};

    _animate = () => {
        if (!this._isAnimating) return;
        this._drawEcg();
        this._animFrame = requestAnimationFrame(this._animate);
    }

    _drawEcg() {
        const offsetX = 10; // Offset by 10 pixels to the left
        const offsetY = 10; // Offset by 10 pixels to the left

        // 1) Scroll the existing line image on the bottom canvas
        const imageData = this.lineCtx.getImageData(1, 0, this.width - 1, this.height);
        this.lineCtx.clearRect(0, 0, this.width, this.height);
        this.lineCtx.putImageData(imageData, 0, 0);

        // 2) Calculate new point
        const x = this.width - 1 - offsetX; // Offset the x-coordinate
        const y = (this.height / 2) + offsetY - this._getHeartY(this.phase);

        if (this.prevY === undefined) {
            this.prevY = y;
        }

        // Normalize amplitude for color interpolation
        const normalizedAmp = (this._getHeartY(this.phase) + this.amp) / (2 * this.amp); // Normalize to [0, 1]
        const interpolatedColor = lerpColor(this.bottomColor, this.topColor, normalizedAmp); // Lime to Cyan

        // 3) Draw the green line on bottom canvas
        this.lineCtx.beginPath();
        this.lineCtx.moveTo(x - 1, this.prevY);
        this.lineCtx.lineTo(x, y);
        this.lineCtx.strokeStyle = interpolatedColor; // Apply interpolated color
        this.lineCtx.lineWidth = this.lineWidth;
        this.lineCtx.stroke();

        // 4) Clear top canvas, draw single cyan pixel
        this.pointCtx.clearRect(0, 0, this.width, this.height);

        // Draw a glowing cyan circle
        const radius = 4; // Adjust for size
        this.pointCtx.beginPath();
        this.pointCtx.arc(x, y, radius, 0, 2 * Math.PI); // Draw the circle
        
        this.pointCtx.fillStyle = this.topColor; // Circle color
        this.pointCtx.fill();

        this.prevY = y;
        this.phase += 0.04 * this.freq; // wave speed
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
