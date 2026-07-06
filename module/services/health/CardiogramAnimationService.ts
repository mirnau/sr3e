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
	private lineCtx: CanvasRenderingContext2D;
	private pointCtx: CanvasRenderingContext2D;

	private width: number;
	private height: number;

	private phase: number = 0;
	private freq: number;
	private amp: number;
	private targetAmp: number;
	private isFlatlined: boolean = false;
	private lineWidth: number;

	private _isAnimating: boolean = false;
	private _animFrame: number | null = null;
	private _lastTimestamp: number | null = null;
	private _samples: { t: number; heartY: number }[] = [];

	private static readonly SCROLL_PX_PER_SEC = 60;
	private static readonly PHASE_RAD_PER_SEC = 0.04 * 60;
	private static readonly AMP_SMOOTHING_PER_FRAME_AT_60FPS = 0.05;
	private static readonly MAX_DT_SEC = 0.1;
	// Fraction of `amp` the R-spike actually reaches (see _getHeartY) — used so
	// the accent color maxes out exactly at the true peak instead of at 80% of amp.
	private static readonly R_WAVE_PEAK_FRACTION = 0.8;

	private bottomColor: string;
	private topColor: string;

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

		// No willReadFrequently hint: we no longer read pixels back, so the
		// canvas stays eligible for GPU-accelerated rendering.
		this.lineCtx = lineCanvas.getContext("2d")!;
		this.pointCtx = pointCanvas.getContext("2d")!;

		this.width = lineCanvas.width;
		this.height = lineCanvas.height;

		this.freq = freq;
		this.amp = amp;
		this.targetAmp = amp;
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
		this._lastTimestamp = null;
		this._animFrame = requestAnimationFrame(this._animate);
	}

	stop(): void {
		this._isAnimating = false;
		this._lastTimestamp = null;
		if (this._animFrame !== null) {
			cancelAnimationFrame(this._animFrame);
			this._animFrame = null;
		}
	}

	/**
	 * Let the trace decay into a flatline instead of cutting to one.
	 * The scrolling loop keeps running so any in-flight heartbeat
	 * scrolls off naturally while the amplitude ramps down to zero.
	 */
	flatline(): void {
		this.isFlatlined = true;
		if (!this._isAnimating) this.start();
	}

	/**
	 * Ramp the amplitude back up from the flatline, resuming a beat
	 * seamlessly from wherever the trace currently sits.
	 */
	resume(): void {
		this.isFlatlined = false;
		if (!this._isAnimating) this.start();
	}

	setFrequency(freq: number): void {
		this.freq = freq;
	}

	setAmplitude(amp: number): void {
		this.targetAmp = amp;
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
		// Old samples were positioned for the previous canvas size — discard and let
		// the trace rebuild rather than have it jump or stretch.
		this._samples = [];
	}

	private _animate = (timestamp: number): void => {
		if (!this._isAnimating) return;

		const dt = this._lastTimestamp === null
			? 0
			: Math.min((timestamp - this._lastTimestamp) / 1000, CardiogramAnimationService.MAX_DT_SEC);
		this._lastTimestamp = timestamp;

		this._drawEcg(dt, timestamp / 1000);
		this._animFrame = requestAnimationFrame(this._animate);
	};

	/**
	 * Redraws the whole visible trace from a rolling buffer of {time, value}
	 * samples every frame instead of scrolling pixel data. Avoids
	 * getImageData/putImageData (a synchronous GPU readback — one of the most
	 * expensive things you can do on a canvas, and it forces software
	 * rendering for the whole context) in favor of a single smoothed path
	 * and one stroke() call.
	 */
	private _drawEcg(dt: number, nowSec: number): void {
		if (this.width <= 0 || this.height <= 0) return;

		const effectiveTargetAmp = this.isFlatlined ? 0 : this.targetAmp;
		// Reproduces the original per-frame-at-60fps smoothing factor at any frame rate.
		const ampSmoothing = 1 - Math.pow(1 - CardiogramAnimationService.AMP_SMOOTHING_PER_FRAME_AT_60FPS, dt * 60);
		this.amp += (effectiveTargetAmp - this.amp) * ampSmoothing;

		const offsetX = 10;
		const offsetY = 10;
		const radius = 4;
		const headX = this.width - offsetX - radius;
		const centerY = this.height / 2 + offsetY;

		const heartY = this._getHeartY(this.phase);
		this._samples.push({ t: nowSec, heartY });

		// Drop samples that have scrolled fully off the left edge.
		const toX = (t: number): number => headX - (nowSec - t) * CardiogramAnimationService.SCROLL_PX_PER_SEC;
		while (this._samples.length > 2 && toX(this._samples[1]!.t) < -radius) {
			this._samples.shift();
		}

		this.lineCtx.clearRect(0, 0, this.width, this.height);

		if (this._samples.length >= 2) {
			const points = this._samples.map((s) => ({
				x: toX(s.t),
				y: centerY - s.heartY,
				colorT: this._peakColorT(s.heartY),
			}));

			this.lineCtx.strokeStyle = this._buildTraceGradient(points);
			this.lineCtx.lineWidth = this.lineWidth;
			this.lineCtx.lineJoin = "round";
			this.lineCtx.lineCap = "round";

			// Smooth the polyline into a continuous quadratic-bezier path: each
			// segment curves through a sample toward the midpoint of the next one.
			this.lineCtx.beginPath();
			this.lineCtx.moveTo(points[0]!.x, points[0]!.y);
			for (let i = 1; i < points.length - 1; i++) {
				const cur = points[i]!;
				const next = points[i + 1]!;
				this.lineCtx.quadraticCurveTo(cur.x, cur.y, (cur.x + next.x) / 2, (cur.y + next.y) / 2);
			}
			const last = points[points.length - 1]!;
			this.lineCtx.lineTo(last.x, last.y);
			this.lineCtx.stroke();
		}

		// Draw needle/point on top canvas
		const headY = centerY - heartY;
		const headColor = lerpColor(this.bottomColor, this.topColor, this._peakColorT(heartY));
		this.pointCtx.clearRect(0, 0, this.width, this.height);
		this.pointCtx.beginPath();
		this.pointCtx.arc(headX, headY, radius, 0, 2 * Math.PI);
		this.pointCtx.fillStyle = headColor;
		this.pointCtx.shadowBlur = 5;
		this.pointCtx.shadowColor = headColor;
		this.pointCtx.fill();
		this.pointCtx.shadowBlur = 0;

		// Advance waveform phase
		this.phase += CardiogramAnimationService.PHASE_RAD_PER_SEC * this.freq * dt;
	}

	/**
	 * Maps a waveform height to how strongly the accent (top) color should show:
	 * a smooth gradient proportional to height, scaled against the R-spike's
	 * actual peak (see R_WAVE_PEAK_FRACTION) rather than raw amp so the true
	 * apex reaches full accent color instead of topping out at 80%.
	 */
	private _peakColorT(heartY: number): number {
		const safeAmp = Math.max(this.amp, 0.0001);
		const peakRelative = Math.abs(heartY) / (safeAmp * CardiogramAnimationService.R_WAVE_PEAK_FRACTION);
		return Math.min(1, peakRelative);
	}

	/**
	 * Builds the trace gradient from every sample rather than a subsampled
	 * handful — subsampling by index into a sliding window means "stop #12"
	 * refers to a different real sample each frame as the buffer scrolls,
	 * desyncing the color from the geometry it's supposed to track.
	 */
	private _buildTraceGradient(points: { x: number; colorT: number }[]): CanvasGradient {
		const x0 = points[0]!.x;
		const x1 = points[points.length - 1]!.x;
		const gradient = this.lineCtx.createLinearGradient(x0, 0, x1, 0);
		const span = Math.max(x1 - x0, 1);

		for (const p of points) {
			const offset = Math.min(1, Math.max(0, (p.x - x0) / span));
			gradient.addColorStop(offset, lerpColor(this.bottomColor, this.topColor, p.colorT));
		}

		return gradient;
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
			y = CardiogramAnimationService.R_WAVE_PEAK_FRACTION * Math.sin(alpha * Math.PI) * this.amp;
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
