import { NewsConfig } from "./NewsConfig";
import type { SocketData } from "./SocketData";

type Callbacks = {
	onBecomeController: () => void;
	onLoseController: () => void;
	onRequestElection: () => void;
};

/**
 * Handles controller election, heartbeat, and health checks.
 */
export class ControllerCoordinator {
	#isController = false;
	#broadcastController: string | null = null;
	#lastHeartbeat = 0;
	#controllerHeartbeat: ReturnType<typeof setInterval> | null = null;
	#controllerHealthCheck: ReturnType<typeof setInterval> | null = null;
	#electionCandidates = new Set<string>();
	#electionInProgress = false;
	#syncRequestTimeout: ReturnType<typeof setTimeout> | null = null;
	#statusRequestTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor(
		private readonly getUserId: () => string,
		private readonly socket: any,
		private readonly callbacks: Callbacks
	) {}

	initialize(): void {
		this.#startControllerHealthCheck();
		this.requestControllerElection();
	}

	isController(): boolean {
		return this.#isController;
	}

	controllerId(): string | null {
		return this.#broadcastController;
	}

	handleSocketMessage(data: SocketData): void {
		const { type, userId, controllerId, targetId } = data;

		switch (type) {
			case "controllerElection":
				if (userId) this.#handleControllerElection(userId);
				break;
			case "controllerHeartbeat":
			case "controllerAnnouncement":
				if (userId) this.#handleControllerHeartbeat(userId);
				break;
			case "controllerStatusRequest":
				if (userId) this.#handleControllerStatusRequest(userId);
				break;
			case "controllerStatusResponse":
				if (controllerId && targetId) this.#handleControllerStatusResponse(controllerId, targetId);
				break;
		}
	}

	emitHeartbeat(): void {
		if (!this.#isController) return;
		const userId = this.getUserId();
		if (!userId) return;
		if (!this.socket) return;

		this.socket.emit("module.sr3e", {
			type: "controllerHeartbeat",
			userId,
		});
	}

	requestControllerElection(): void {
		const userId = this.getUserId();
		if (!userId) return;
		if (this.#electionInProgress) return;
		this.#electionInProgress = true;
		this.#electionCandidates.clear();
		this.#electionCandidates.add(userId);

		if (!this.socket) {
			this.#electionInProgress = false;
			return;
		}

		this.socket.emit("module.sr3e", {
			type: "controllerElection",
			userId,
		});

		if (this.#syncRequestTimeout) clearTimeout(this.#syncRequestTimeout);
		this.#syncRequestTimeout = setTimeout(() => {
			this.#resolveElection();
		}, NewsConfig.ELECTION_DELAY);
	}

	destroy(): void {
		if (this.#controllerHeartbeat) clearInterval(this.#controllerHeartbeat);
		if (this.#controllerHealthCheck) clearInterval(this.#controllerHealthCheck);
		if (this.#syncRequestTimeout) clearTimeout(this.#syncRequestTimeout);
		if (this.#statusRequestTimeout) clearTimeout(this.#statusRequestTimeout);
		this.#isController = false;
	}

	#startControllerHealthCheck(): void {
		if (this.#controllerHealthCheck) clearInterval(this.#controllerHealthCheck);
		this.#controllerHealthCheck = setInterval(
			() => this.#checkControllerHealth(),
			NewsConfig.HEARTBEAT_INTERVAL
		);
	}

	requestControllerStatus(): void {
		const userId = this.getUserId();
		if (!userId || !this.socket) return;

		this.socket.emit("module.sr3e", {
			type: "controllerStatusRequest",
			userId,
		});

		if (this.#statusRequestTimeout) clearTimeout(this.#statusRequestTimeout);
		this.#statusRequestTimeout = setTimeout(
			() => this.requestControllerElection(),
			2000
		);
	}

	#startControllerHeartbeat(): void {
		if (this.#controllerHeartbeat) clearInterval(this.#controllerHeartbeat);
		this.#controllerHeartbeat = setInterval(() => this.emitHeartbeat(), NewsConfig.HEARTBEAT_INTERVAL);
	}

	#announceController(): void {
		const userId = this.getUserId();
		if (!userId || !this.socket) return;
		this.socket.emit("module.sr3e", {
			type: "controllerAnnouncement",
			userId,
		});
	}

	#handleControllerElection(userId: string): void {
		this.#electionCandidates.add(userId);
		if (!this.#electionInProgress) {
			this.requestControllerElection();
		}
	}

	#resolveElection(): void {
		const sorted = Array.from(this.#electionCandidates).sort();
		const winner = sorted[0];
		this.#electionInProgress = false;

		if (winner === this.getUserId()) {
			this.#becomeController();
		} else {
			this.#broadcastController = winner as string;
		}
	}

	#becomeController(): void {
		if (this.#isController) return;
		const userId = this.getUserId();
		if (!userId) return;

		this.#announceController();
		this.#isController = true;
		this.#broadcastController = userId;
		this.#startControllerHeartbeat();
		this.callbacks.onBecomeController();
	}

	#handleControllerHeartbeat(userId: string): void {
		this.#broadcastController = userId;
		this.#lastHeartbeat = Date.now();

		if (userId === this.getUserId()) return;

		if (this.#isController) {
			this.#isController = false;
			if (this.#controllerHeartbeat) clearInterval(this.#controllerHeartbeat);
			this.callbacks.onLoseController();
		}
	}

	#checkControllerHealth(): void {
		if (this.#isController) return;
		const now = Date.now();
		const elapsed = now - this.#lastHeartbeat;
		if (elapsed > NewsConfig.CONTROLLER_TIMEOUT + 200) {
			this.callbacks.onRequestElection();
		}
	}

	#handleControllerStatusRequest(requesterId: string): void {
		const userId = this.getUserId();
		if (!this.#isController || !userId || !this.socket) return;

		this.socket.emit("module.sr3e", {
			type: "controllerStatusResponse",
			controllerId: userId,
			targetId: requesterId,
		});
	}

	#handleControllerStatusResponse(controllerId: string, targetId: string): void {
		if (targetId !== this.getUserId()) return;
		this.#broadcastController = controllerId;
		this.#lastHeartbeat = Date.now();
	}
}
