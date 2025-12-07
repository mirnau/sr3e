console.log(
	"%cNewsService module evaluated →",
	"color:#ff66aa;font-weight:bold;",
	import.meta.url,
	performance.now().toFixed(1)
);

import { writable, get, derived } from "svelte/store";
import type { Writable, Readable } from "svelte/store";

interface NewsMessage {
	sender: string;
	headline: string;
}

interface DisplayFrame {
	buffer: NewsMessage[];
	timestamp: number;
	duration?: number;
}

interface SocketData {
	type: string;
	actorName?: string;
	headlines?: string[];
	buffer?: NewsMessage[];
	timestamp?: number;
	userId?: string;
	broadcasters?: Record<string, string[]>;
	duration?: number;
	controllerId?: string;
	targetId?: string;
}

export class NewsService {
	activeBroadcasters: Writable<Map<string, string[]>> = writable(new Map());
	allFeeds: Writable<Record<string, NewsMessage[]>> = writable({});
	currentDisplayFrame: Writable<DisplayFrame> = writable({ buffer: [], timestamp: 0 });

	#feedBuffer: NewsMessage[] = [];
	#currentIndices = new Map<string, number>();
	#maxVisible = 5;
	#lastBroadcasterIndex = -1;
	#frameUpdateInterval: ReturnType<typeof setInterval> | null = null;
	#initialized = false;
	#nextTick: ReturnType<typeof setTimeout> | null = null;
	#broadcastController: string | null = null;
	#isController = false;
	#controllerHeartbeat: ReturnType<typeof setInterval> | null = null;
	#lastHeartbeat = 0;
	#syncRequestTimeout: ReturnType<typeof setTimeout> | null = null;
	#electionCandidates = new Set<string>();
	#electionInProgress = false;

	AVG_CHAR_PX = 12;
	SCROLL_SPEED = 100;
	DEFAULT_MS = 10000;
	CONTROLLER_TIMEOUT = 15000;
	HEARTBEAT_INTERVAL = 5000;
	ELECTION_DELAY = 1000;
	ESTIMATED_TICKER_WIDTH = 400;

	#defaultMessages: NewsMessage[] = [
		{ sender: "System", headline: "Please stand by." },
		{ sender: "System", headline: "Waiting for broadcast..." },
		{ sender: "System", headline: "No active news sources." },
	];

	static #instance: NewsService | null = null;

	static Instance(): NewsService {
		if (!this.#instance) {
			this.#instance = new NewsService();
		}
		return this.#instance;
	}

	initialize(): void {
		if (this.#initialized) return;
		this.#initialized = true;

		this.#setupSocket();
		this.#loadActiveBroadcasters();
		this.#requestControllerElection();
		this.#startControllerHealthCheck();

		CONFIG.sr3e = CONFIG.sr3e || {};
		CONFIG.sr3e.newsService = this;
	}

	#loadActiveBroadcasters(): void {
		const allBroadcasters = game.actors.filter(
			(actor: any) => actor.type === "broadcaster" && actor.system.isBroadcasting
		);

		allBroadcasters.forEach((broadcaster: any) => {
			const headlines = broadcaster.system.rollingNews || [];
			this.#receiveBroadcastSync(broadcaster.name, headlines);
		});
	}

	#startControllerHealthCheck(): void {
		setInterval(() => this.#checkControllerHealth(), this.HEARTBEAT_INTERVAL);
	}

	#setupSocket(): void {
		game.socket.on("module.sr3e", (data: SocketData) => {
			const {
				type,
				actorName,
				headlines,
				buffer,
				timestamp,
				userId,
				broadcasters,
				duration,
				controllerId,
				targetId,
			} = data;

			switch (type) {
				case "syncBroadcast":
					if (actorName && headlines) {
						this.#receiveBroadcastSync(actorName, headlines);
					}
					break;
				case "stopBroadcast":
					if (actorName) {
						this.#stopBroadcaster(actorName);
					}
					break;
				case "frameUpdate":
					if (buffer && timestamp !== undefined) {
						this.#receiveFrameUpdate(buffer, timestamp, duration);
					}
					break;
				case "controllerElection":
					if (userId) {
						this.#handleControllerElection(userId);
					}
					break;
				case "controllerHeartbeat":
					if (userId) {
						this.#handleControllerHeartbeat(userId);
					}
					break;
				case "requestStateSync":
					if (userId) {
						this.#handleStateSyncRequest(userId);
					}
					break;
				case "stateSyncResponse":
					if (broadcasters) {
						this.#handleStateSyncResponse(broadcasters);
					}
					break;
				case "controllerAnnouncement":
					if (userId) {
						this.#handleControllerHeartbeat(userId);
					}
					break;
				case "controllerStatusRequest":
					if (userId) {
						this.#handleControllerStatusRequest(userId);
					}
					break;
				case "controllerStatusResponse":
					if (controllerId && targetId) {
						this.#handleControllerStatusResponse(controllerId, targetId);
					}
					break;
				case "forceResync":
					Hooks.callAll("sr3e.forceResync");
					break;
			}
		});
	}

	#requestControllerElection(): void {
		if (this.#electionInProgress) return;
		this.#electionInProgress = true;
		this.#electionCandidates.clear();
		this.#electionCandidates.add(game.user?.id || "");

		game.socket.emit("module.sr3e", {
			type: "controllerElection",
			userId: game.user?.id,
		});

		if (this.#syncRequestTimeout) clearTimeout(this.#syncRequestTimeout);
		this.#syncRequestTimeout = setTimeout(() => {
			this.#resolveElection();
		}, this.ELECTION_DELAY);
	}

	#resolveElection(): void {
		const sorted = Array.from(this.#electionCandidates).sort();
		const winner = sorted[0];
		this.#electionInProgress = false;

		if (winner === game.user?.id) {
			this.#becomeController();
		} else {
			this.#broadcastController = winner;
		}
	}

	#handleControllerElection(userId: string): void {
		this.#electionCandidates.add(userId);
		if (!this.#electionInProgress) {
			this.#requestControllerElection();
		}
	}

	#becomeController(): void {
		if (this.#isController) return;

		this.#announceController();
		this.#isController = true;
		this.#broadcastController = game.user?.id || null;
		this.#startControllerHeartbeat();
		this.#loadActiveBroadcasters();
		this.#scheduleNextFrame();
	}

	#announceController(): void {
		game.socket.emit("module.sr3e", {
			type: "controllerAnnouncement",
			userId: game.user?.id,
		});
	}

	#requestControllerStatus(): void {
		game.socket.emit("module.sr3e", {
			type: "controllerStatusRequest",
			userId: game.user?.id,
		});

		if (this.#syncRequestTimeout) clearTimeout(this.#syncRequestTimeout);
		this.#syncRequestTimeout = setTimeout(() => {
			this.#requestControllerElection();
		}, 2000);
	}

	#handleControllerStatusRequest(requesterId: string): void {
		if (!this.#isController) return;
		game.socket.emit("module.sr3e", {
			type: "controllerStatusResponse",
			controllerId: game.user?.id,
			targetId: requesterId,
		});
	}

	#handleControllerStatusResponse(controllerId: string, targetId: string): void {
		if (targetId !== game.user?.id) return;
		this.#broadcastController = controllerId;
		this.#lastHeartbeat = Date.now();
	}

	#startControllerHeartbeat(): void {
		if (this.#controllerHeartbeat) clearInterval(this.#controllerHeartbeat);
		this.#controllerHeartbeat = setInterval(() => {
			if (this.#isController) {
				game.socket.emit("module.sr3e", {
					type: "controllerHeartbeat",
					userId: game.user?.id,
				});
			}
		}, this.HEARTBEAT_INTERVAL);
	}

	#handleControllerHeartbeat(userId: string): void {
		this.#broadcastController = userId;
		this.#lastHeartbeat = Date.now();

		if (userId === game.user?.id) return;

		if (this.#isController) {
			this.#isController = false;
			if (this.#controllerHeartbeat) clearInterval(this.#controllerHeartbeat);
			if (this.#nextTick) clearTimeout(this.#nextTick);
		}
	}

	#checkControllerHealth(): void {
		if (this.#isController) return;
		const now = Date.now();
		const elapsed = now - this.#lastHeartbeat;
		if (elapsed > this.CONTROLLER_TIMEOUT + 200) {
			this.#requestControllerElection();
		}
	}

	#scheduleNextFrame(): void {
		if (!this.#isController) return;

		this.#loadActiveBroadcasters();
		this.#fillFeedBuffer(10);

		if (this.#feedBuffer.length === 0) {
			if (this.#nextTick) clearTimeout(this.#nextTick);
			this.#nextTick = setTimeout(() => {
				this.#scheduleNextFrame();
			}, 1000);
			return;
		}

		const buffer = [...this.#feedBuffer];
		const duration = this.#guessDuration(buffer);
		const startTime = Date.now() + 200;
		const frame: DisplayFrame = { buffer, timestamp: startTime, duration };

		this.currentDisplayFrame.set(frame);

		game.socket.emit("module.sr3e", {
			type: "frameUpdate",
			buffer,
			timestamp: startTime,
			duration,
		});

		if (this.#nextTick) clearTimeout(this.#nextTick);
		this.#nextTick = setTimeout(() => {
			this.#scheduleNextFrame();
		}, duration);
	}

	#receiveFrameUpdate(buffer: NewsMessage[], timestamp: number, duration?: number): void {
		const current = get(this.currentDisplayFrame);
		if (!Array.isArray(buffer)) return;
		if (!timestamp) return;
		if (timestamp <= current.timestamp) return;

		this.currentDisplayFrame.set({ buffer, timestamp, duration });
	}

	#guessDuration(buffer: NewsMessage[]): number {
		if (!Array.isArray(buffer) || buffer.length === 0) return this.DEFAULT_MS;

		const FONT_SIZE_PX = 24; // 1.5rem = 24px typically

		const calculateTextWidth = (text = ""): number => {
			let totalWidth = 0;

			for (const char of text) {
				const code = char.codePointAt(0);
				if (!code) continue;

				// CJK (Chinese, Japanese, Korean) - full width
				if (
					(code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
					(code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
					(code >= 0x3040 && code <= 0x309f) || // Hiragana
					(code >= 0x30a0 && code <= 0x30ff) || // Katakana
					(code >= 0xac00 && code <= 0xd7af) // Hangul
				) {
					totalWidth += FONT_SIZE_PX * 1.0; // Full width
				}
				// Cyrillic
				else if (code >= 0x0400 && code <= 0x04ff) {
					totalWidth += FONT_SIZE_PX * 0.75; // Similar to Latin
				}
				// Arabic/Hebrew (RTL)
				else if (
					(code >= 0x0590 && code <= 0x05ff) || // Hebrew
					(code >= 0x0600 && code <= 0x06ff) // Arabic
				) {
					totalWidth += FONT_SIZE_PX * 0.65; // Often condensed
				}
				// Thai, Devanagari, etc.
				else if (code >= 0x0e00 && code <= 0x0e7f) {
					// Thai
					totalWidth += FONT_SIZE_PX * 0.6;
				} else if (code >= 0x0900 && code <= 0x097f) {
					// Devanagari
					totalWidth += FONT_SIZE_PX * 0.7;
				}
				// Latin narrow characters
				else if ("iltfj".includes(char)) {
					totalWidth += FONT_SIZE_PX * 0.4;
				}
				// Latin wide characters
				else if ("wmMW".includes(char)) {
					totalWidth += FONT_SIZE_PX * 1.2;
				}
				// Default Latin
				else if (code < 0x0080) {
					totalWidth += FONT_SIZE_PX * 0.75;
				}
				// Fallback for other scripts
				else {
					totalWidth += FONT_SIZE_PX * 0.8;
				}
			}

			return totalWidth;
		};

		// Calculate total content width
		const marqueeWidth = buffer.reduce((sum, msg) => {
			const senderWidth = calculateTextWidth(msg.sender);
			const headlineWidth = calculateTextWidth(msg.headline);
			const itemPadding = 64; // 2rem left + 2rem right
			return sum + senderWidth + headlineWidth + itemPadding;
		}, 0);

		// Estimated ticker container width
		const estimatedTickerWidth = this.ESTIMATED_TICKER_WIDTH || 400;

		// Total animation distance: from ticker-width to -marquee-width
		const totalDistance = estimatedTickerWidth + marqueeWidth;

		const duration = (totalDistance / this.SCROLL_SPEED) * 1000;

		return Math.max(Math.ceil(duration), this.DEFAULT_MS);
	}

	#handleStateSyncRequest(requestingUserId: string): void {
		if (requestingUserId === game.user?.id) return;
		const broadcasters = get(this.activeBroadcasters);
		if (broadcasters.size === 0) return;
		const broadcastersData: Record<string, string[]> = {};
		broadcasters.forEach((headlines, actorName) => {
			broadcastersData[actorName] = headlines;
		});
		game.socket.emit("module.sr3e", {
			type: "stateSyncResponse",
			broadcasters: broadcastersData,
		});
	}

	#handleStateSyncResponse(broadcastersData: Record<string, string[]>): void {
		Object.entries(broadcastersData).forEach(([actorName, headlines]) => {
			this.#receiveBroadcastSync(actorName, headlines);
		});
	}

	#receiveBroadcastSync(actorName: string, headlines: string[]): void {
		const broadcasters = get(this.activeBroadcasters);
		if (!headlines || headlines.length === 0) {
			broadcasters.delete(actorName);
			this.#currentIndices.delete(actorName);
		} else {
			broadcasters.set(actorName, headlines);
			const currentIndex = this.#currentIndices.get(actorName) || 0;
			this.#currentIndices.set(actorName, currentIndex % headlines.length);
		}
		this.activeBroadcasters.set(new Map(broadcasters));
		this.#updateFeedBuffer();
	}

	#stopBroadcaster(actorName: string): void {
		const broadcasters = get(this.activeBroadcasters);
		broadcasters.delete(actorName);
		this.#currentIndices.delete(actorName);
		this.activeBroadcasters.set(new Map(broadcasters));
		this.#updateFeedBuffer();
	}

	#pumpNextHeadline(): NewsMessage | null {
		const broadcasters = get(this.activeBroadcasters);
		if (broadcasters.size === 0) return null;
		const broadcasterNames = Array.from(broadcasters.keys());
		for (let offset = 0; offset < broadcasterNames.length; offset++) {
			const index = (this.#lastBroadcasterIndex + offset + 1) % broadcasterNames.length;
			const broadcasterName = broadcasterNames[index];
			const headlines = broadcasters.get(broadcasterName);
			if (!headlines || headlines.length === 0) continue;
			const currentIndex = this.#currentIndices.get(broadcasterName) || 0;
			const headline = headlines[currentIndex];
			this.#currentIndices.set(broadcasterName, (currentIndex + 1) % headlines.length);
			this.#lastBroadcasterIndex = index;
			return { sender: broadcasterName, headline };
		}
		return null;
	}

	#fillFeedBuffer(minLength = 10): void {
		const buffer = [...this.#feedBuffer];
		const broadcasters = get(this.activeBroadcasters);

		while (buffer.length < minLength) {
			const nextHeadline = this.#pumpNextHeadline();
			if (!nextHeadline) break;
			buffer.push(nextHeadline);
		}

		// ⛔ No broadcasters, inject default system messages
		if (buffer.length === 0 && broadcasters.size === 0) {
			for (let i = 0; i < minLength; i++) {
				const msg = this.#defaultMessages[i % this.#defaultMessages.length];
				buffer.push(msg);
			}
		}

		this.#feedBuffer = buffer.slice(-this.#maxVisible);
		this.#publishFeed();
	}

	#updateFeedBuffer(): void {
		const broadcasters = get(this.activeBroadcasters);
		if (broadcasters.size === 0) {
			this.#feedBuffer = [];
			this.#publishFeed();
			return;
		}
		this.#feedBuffer = this.#feedBuffer.filter(
			(message) =>
				broadcasters.has(message.sender) &&
				(broadcasters.get(message.sender) || []).includes(message.headline)
		);
		this.#fillFeedBuffer(this.#maxVisible);
	}

	#publishFeed(): void {
		const feeds: Record<string, NewsMessage[]> = {};
		this.#feedBuffer.forEach((message) => {
			feeds[message.sender] = feeds[message.sender] || [];
			feeds[message.sender].push(message);
		});
		this.allFeeds.set(feeds);
	}

	requestFullResync(): void {
		this.#requestControllerStatus();
		game.socket.emit("module.sr3e", {
			type: "requestStateSync",
			userId: game.user?.id,
		});
	}

	destroy(): void {
		game.socket.off("module.sr3e");
		this.#initialized = false;
		if (this.#nextTick) clearTimeout(this.#nextTick);
		if (this.#controllerHeartbeat) clearInterval(this.#controllerHeartbeat);
		if (this.#syncRequestTimeout) clearTimeout(this.#syncRequestTimeout);
		this.#isController = false;
		if (CONFIG.sr3e?.newsService === this) CONFIG.sr3e.newsService = null;
	}
}

let newsServiceInstance: NewsService | null = null;

export const getNewsService = (): NewsService => {
	if (!newsServiceInstance) {
		newsServiceInstance = NewsService.Instance();
		newsServiceInstance.initialize();
	}
	return newsServiceInstance;
};

export const broadcastNews = (actorName: string, headlines: string[]): void => {
	game.socket.emit("module.sr3e", {
		type: "syncBroadcast",
		actorName,
		headlines,
	});
};

export const stopBroadcast = (actorName: string): void => {
	game.socket.emit("module.sr3e", {
		type: "stopBroadcast",
		actorName,
	});
};

export const currentDisplayFrame = derived(
	() => CONFIG.sr3e?.newsService?.currentDisplayFrame,
	($store: any, set: (value: DisplayFrame) => void) => {
		if (!$store?.subscribe) {
			set({ buffer: [], timestamp: 0 });
			return;
		}

		return $store.subscribe(set);
	}
);
