/**
 * CardiogramAnimationService - ECG waveform animation for health visualization.
 * Draws a scrolling ECG line with realistic P-Q-R-S-T wave pattern.
 */

/**
 * Linearly interpolate between two hex colors.
 */
function lerpColor(hex1: string, hex2: string, t: number): string {
	const parseHex = (hex: string): number => parseInt(hex.slice(1), 16);

	const c1 = parseHex(hex1);
	const c2 = parseHex(hex2);

	const r1 = (c1 >> 16) & 0xff;
	const g1 = (c1 >> 8) & 0xff;
	const b1 = c1 & 0xff;

	const r2 = (c2 >> 16) & 0xff;
	const g2 = (c2 >> 8) & 0xff;
	const b2 = c2 & 0xff;

	const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

	const r = Math.round(lerp(r1, r2, t));
	const g = Math.round(lerp(g1, g2, t));
	const b = Math.round(lerp(b1, b2, t));

	const toHex = (n: number): string => n.toString(16).padStart(2, "0");

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export interface EcgAnimatorOptions {
	freq?: number;
	amp?: number;
	lineWidth?: number;
	bottomColor?: string;
	topColor?: string;
}

/**
 * ECG Animator - renders animated cardiogram waveform on dual canvas setup.
 * Bottom canvas shows the scrolling ECG line, top canvas shows the moving point.
 */
export class CardiogramAnimationService {
	private lineCanvas: HTMLCanvasElement;
	private pointCanvas: HTMLCanvasElement;
	private lineCtx: CanvasRenderingContext2D;
	private pointCtx: CanvasRenderingContext2D;

	private width: number;
	private height: number;

	private phase: number = 0;
	private freq: number;
	private amp: number;
	private lineWidth: number;

	private _isAnimating: boolean = false;
	private _animFrame: number | null = null;

	private bottomColor: string;
	private topColor: string;

	private prevY: number | undefined;
	private prevHeartY: number | undefined;

	constructor(
		lineCanvas: HTMLCanvasElement,
		pointCanvas: HTMLCanvasElement,
		options: EcgAnimatorOptions = {}
	) {
		const {
			freq = 1.5,
			amp = 20,
			lineWidth = 2,
			bottomColor = "#00FFFF",
			topColor = "#0000FF"
		} = options;

		this.lineCanvas = lineCanvas;
		this.pointCanvas = pointCanvas;

		this.lineCtx = lineCanvas.getContext("2d", { willReadFrequently: true })!;
		this.pointCtx = pointCanvas.getContext("2d", { willReadFrequently: true })!;

		this.width = lineCanvas.width;
		this.height = lineCanvas.height;

		this.freq = freq;
		this.amp = amp;
		this.lineWidth = lineWidth;

		this.bottomColor = bottomColor;
		this.topColor = topColor;
	}

	get isAnimating(): boolean {
		return this._isAnimating;
	}

	start(): void {
		if (this._isAnimating) return;
		this._isAnimating = true;
		this._animate();
	}

	stop(): void {
		this._isAnimating = false;
		if (this._animFrame !== null) {
			cancelAnimationFrame(this._animFrame);
			this._animFrame = null;
		}
	}

	flatline(): void {
		this.stop();

		this.lineCtx.clearRect(0, 0, this.width, this.height);
		this.pointCtx.clearRect(0, 0, this.width, this.height);

		const centerY = this.height / 2;
		const xStart = 0;
		const xEnd = this.width;

		// Draw flat line
		this.lineCtx.beginPath();
		this.lineCtx.moveTo(xStart, centerY);
		this.lineCtx.lineTo(xEnd, centerY);
		this.lineCtx.strokeStyle = this.bottomColor;
		this.lineCtx.lineWidth = this.lineWidth;
		this.lineCtx.stroke();

		// Draw point at end
		const radius = 4;
		const x = this.width - 10;

		this.pointCtx.beginPath();
		this.pointCtx.arc(x, centerY, radius, 0, 2 * Math.PI);
		this.pointCtx.fillStyle = this.topColor;
		this.pointCtx.shadowBlur = 5;
		this.pointCtx.shadowColor = this.topColor;
		this.pointCtx.fill();
		this.pointCtx.shadowBlur = 0;
	}

	setFrequency(freq: number): void {
		this.freq = freq;
	}

	setAmplitude(amp: number): void {
		this.amp = amp;
	}

	setTopColor(color: string): void {
		this.topColor = color;
	}

	setBottomColor(color: string): void {
		this.bottomColor = color;
	}

	updateDimensions(width: number, height: number): void {
		this.width = Math.floor(width);
		this.height = Math.floor(height);
		// Reset previous values to avoid stale data
		this.prevY = undefined;
		this.prevHeartY = undefined;
	}

	private _animate = (): void => {
		if (!this._isAnimating) return;
		this._drawEcg();
		this._animFrame = requestAnimationFrame(this._animate);
	};

	private _drawEcg(): void {
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
		}

		// Gradient stroke based on wave height
		const prevHeartY = this.prevHeartY!;
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

		// Solid pixel for continuity
		this.lineCtx.fillStyle = lerpColor(this.bottomColor, this.topColor, t2);
		this.lineCtx.fillRect(x, y, 1, 1);

		// Draw needle/point on top canvas
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

		// Advance waveform phase
		this.phase += 0.04 * this.freq;
	}

	/**
	 * Generate Y value for heart waveform at given phase.
	 * Simulates P-Q-R-S-T wave pattern of real ECG.
	 */
	private _getHeartY(phase: number): number {
		const t = phase;
		const cycle = (t % (2 * Math.PI)) / (2 * Math.PI);

		let y = 0;

		// P wave (small bump)
		if (cycle < 0.1) {
			const alpha = cycle / 0.1;
			y = 0.1 * Math.sin(alpha * Math.PI) * this.amp;
		}
		// Q dip (small negative)
		else if (cycle < 0.15) {
			const alpha = (cycle - 0.1) / 0.05;
			y = -0.2 * Math.sin(alpha * Math.PI) * this.amp;
		}
		// R spike (large positive - main heartbeat)
		else if (cycle < 0.2) {
			const alpha = (cycle - 0.15) / 0.05;
			y = 0.8 * Math.sin(alpha * Math.PI) * this.amp;
		}
		// S dip (small negative after R)
		else if (cycle < 0.25) {
			const alpha = (cycle - 0.2) / 0.05;
			y = -0.2 * Math.sin(alpha * Math.PI) * this.amp;
		}
		// T wave (medium bump - recovery)
		else if (cycle < 0.55) {
			const alpha = (cycle - 0.4) / 0.15;
			y = 0.3 * Math.sin(alpha * Math.PI) * this.amp;
		}

		return y;
	}
}

export default CardiogramAnimationService;
