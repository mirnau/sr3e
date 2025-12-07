import type { Writable } from "svelte/store";
import { get } from "svelte/store";
import { DurationEstimator } from "./DurationEstimator";
import { NewsMessage } from "./NewsMessage";
import { DisplayFrame } from "./DisplayFrame";
import { BroadcastRegistry } from "./BroadcastRegistry";
import { NewsConfig } from "./NewsConfig";

type SocketEmitter = any;

/**
 * Schedules frame generation when acting as controller.
 */
export class FrameScheduler {
	#nextTick: ReturnType<typeof setTimeout> | null = null;
	#controllerId: string | null = null;

	constructor(
		private readonly registry: BroadcastRegistry,
		private readonly currentDisplayFrame: Writable<DisplayFrame>,
		private readonly durationEstimator: DurationEstimator,
		private readonly socket: SocketEmitter,
		private readonly beforeFrame?: () => void
	) {}

	start(controllerId: string): void {
		this.#controllerId = controllerId;
		this.stop();
		this.#scheduleNextFrame();
	}

	stop(): void {
		if (this.#nextTick) clearTimeout(this.#nextTick);
		this.#nextTick = null;
	}

	handleFrameUpdate(
		buffer: NewsMessage[],
		timestamp: number,
		duration?: number,
		controllerId?: string,
		expectedControllerId?: string | null
	): void {
		const current = get(this.currentDisplayFrame);
		if (!Array.isArray(buffer)) return;
		if (!timestamp) return;
		if (expectedControllerId && controllerId !== expectedControllerId) return;
		if (controllerId && this.#controllerId && controllerId !== this.#controllerId) return;

		// Allow ±1 second tolerance to prevent rejecting frames due to network/processing delays
		if (timestamp + NewsConfig.FRAME_TIMESTAMP_TOLERANCE_MS < current.timestamp) return;

		this.currentDisplayFrame.set({ buffer, timestamp, duration });
	}

	destroy(): void {
		this.stop();
	}

	#scheduleNextFrame(): void {
		if (!this.#controllerId) return;

		this.beforeFrame?.();
		const buffer = this.registry.getFeedBuffer(10);

		if (buffer.length === 0) {
			this.#nextTick = setTimeout(() => this.#scheduleNextFrame(), 1000);
			return;
		}

		const duration = this.durationEstimator.estimate(buffer);
		const startTime = Date.now() + 200;
		const frame: DisplayFrame = { buffer, timestamp: startTime, duration };

		this.currentDisplayFrame.set(frame);

		this.socket?.emit("module.sr3e", {
			type: "frameUpdate",
			buffer,
			timestamp: startTime,
			duration,
			controllerId: this.#controllerId,
		});

		this.#nextTick = setTimeout(() => this.#scheduleNextFrame(), duration || NewsConfig.DEFAULT_MS);
	}
}
