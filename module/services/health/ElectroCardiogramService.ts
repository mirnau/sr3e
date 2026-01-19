/**
 * ElectroCardiogramService - Orchestrates ECG canvas animation and health integration.
 * Manages canvas resizing, device pixel ratio scaling, and damage-to-pace mapping.
 */

import { CardiogramAnimationService, type EcgAnimatorOptions } from "./CardiogramAnimationService";

export interface ElectroCardiogramServiceOptions {
	highlightColor?: string;
	accentColor?: string;
}

/**
 * Service to manage ECG visualization tied to character health state.
 */
export class ElectroCardiogramService {
	private ecgCanvas: HTMLCanvasElement;
	private ecgPointCanvas: HTMLCanvasElement;
	private ctxLine: CanvasRenderingContext2D;
	private ctxPoint: CanvasRenderingContext2D;
	private resizeObserver: ResizeObserver;
	private isResizing: boolean = false;

	public ecgAnimator: CardiogramAnimationService;

	constructor(
		ecgCanvas: HTMLCanvasElement,
		ecgPointCanvas: HTMLCanvasElement,
		containerElement: HTMLElement,
		options: ElectroCardiogramServiceOptions = {}
	) {
		this.ecgCanvas = ecgCanvas;
		this.ecgPointCanvas = ecgPointCanvas;

		this.ctxLine = ecgCanvas.getContext("2d", { willReadFrequently: true })!;
		this.ctxPoint = ecgPointCanvas.getContext("2d", { willReadFrequently: true })!;

		// Get colors from CSS variables or use defaults
		const computedStyle = getComputedStyle(document.documentElement);
		const highlightColor = options.highlightColor
			?? (computedStyle.getPropertyValue("--health-highlight-color-primary").trim() || "#4bd0ff");
		const accentColor = options.accentColor
			?? (computedStyle.getPropertyValue("--accent-color-tertiary").trim() || "#0066ff");

		// Initialize the animator
		const animatorOptions: EcgAnimatorOptions = {
			freq: 1.5,
			amp: 20,
			lineWidth: 2,
			bottomColor: highlightColor,
			topColor: accentColor,
		};

		this.ecgAnimator = new CardiogramAnimationService(
			ecgCanvas,
			ecgPointCanvas,
			animatorOptions
		);

		// Setup resize observer
		this.resizeObserver = new ResizeObserver(() => {
			if (this.isResizing) return;
			this.isResizing = true;

			requestAnimationFrame(() => {
				this.resizeCanvas();
				this.isResizing = false;
			});
		});

		this.resizeObserver.observe(containerElement);

		// Initial resize
		this.resizeCanvas();

		// Start animation
		this.ecgAnimator.start();
	}

	/**
	 * Resize canvases to match display size with device pixel ratio scaling.
	 */
	private resizeCanvas(): void {
		const wRatio = window.devicePixelRatio || 1;

		// Store animation state
		const wasAnimating = this.ecgAnimator.isAnimating;

		// Temporarily stop animation during resize
		if (wasAnimating) {
			this.ecgAnimator.stop();
		}

		const resize = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void => {
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

		resize(this.ecgCanvas, this.ctxLine);
		resize(this.ecgPointCanvas, this.ctxPoint);

		// Update animator dimensions
		this.ecgAnimator.updateDimensions(
			this.ecgCanvas.offsetWidth,
			this.ecgCanvas.offsetHeight
		);

		// Restart animation if it was running
		if (wasAnimating) {
			setTimeout(() => {
				this.ecgAnimator.start();
			}, 10);
		}
	}

	/**
	 * Calculate penalty modifier based on damage levels.
	 * Also updates ECG pace to reflect health state.
	 */
	calculatePenalty(stun: number, physical: number): number {
		const maxDegree = Math.max(stun, physical);
		return this.calculateSeverity(maxDegree);
	}

	/**
	 * Calculate severity and set ECG pace based on damage degree.
	 * Returns the penalty modifier.
	 */
	private calculateSeverity(degree: number): number {
		if (degree === 0) {
			this.setPace(1.5, 20);
			return 0;
		}
		if (degree < 3) {
			this.setPace(2, 20);
			return 0;
		}
		if (degree < 6) {
			this.setPace(4, 25);
			return -1;
		}
		if (degree < 9) {
			this.setPace(8, 35);
			return -2;
		}
		if (degree === 9) {
			this.setPace(10, 40);
			return -3;
		}
		// degree >= 10 (dying/overflow)
		this.setPace(1, 8);
		return -3;
	}

	/**
	 * Set ECG animation frequency and amplitude.
	 */
	private setPace(freq: number, amp: number): void {
		this.ecgAnimator.setFrequency(freq);
		this.ecgAnimator.setAmplitude(amp);
	}

	/**
	 * Display flatline (character death).
	 */
	flatline(): void {
		this.ecgAnimator.flatline();
	}

	/**
	 * Resume normal ECG animation.
	 */
	resume(): void {
		this.ecgAnimator.start();
	}

	/**
	 * Clean up resources.
	 */
	destroy(): void {
		this.ecgAnimator.stop();
		this.resizeObserver.disconnect();
	}
}

export default ElectroCardiogramService;
