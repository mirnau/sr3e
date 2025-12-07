import { readable, writable, get } from "svelte/store";
import type { Writable, Readable } from "svelte/store";
import { BroadcastRegistry } from "./BroadcastRegistry";
import { ControllerCoordinator } from "./ControllerCoordinator";
import { FrameScheduler } from "./FrameScheduler";
import { DurationEstimator } from "./DurationEstimator";
import { NewsMessage } from "./NewsMessage";
import { DisplayFrame } from "./DisplayFrame";
import { BroadcasterActor } from "./BroadcasterActor";
import { NewsSocket } from "./NewsSocket";
import { NewsConfig } from "./NewsConfig";

/**
 * Socket message types for news synchronization
 */
export type SocketMessageType =
	| "syncBroadcast"
	| "stopBroadcast"
	| "frameUpdate"
	| "controllerElection"
	| "controllerHeartbeat"
	| "requestStateSync"
	| "stateSyncResponse"
	| "controllerAnnouncement"
	| "controllerStatusRequest"
	| "controllerStatusResponse"
	| "forceResync";

/**
 * Facade for the news ticker system. Coordinates broadcasters, controller election,
 * frame scheduling, and socket wiring.
 */
export class NewsService {
	readonly registry = new BroadcastRegistry(NewsConfig.MAX_VISIBLE);
	readonly activeBroadcasters = this.registry.activeBroadcasters;
	readonly allFeeds = this.registry.allFeeds;
	readonly currentDisplayFrame: Writable<DisplayFrame> = writable({ buffer: [], timestamp: 0 });

	#initialized = false;
	#durationEstimator = new DurationEstimator();
	#scheduler = new FrameScheduler(
		this.registry,
		this.currentDisplayFrame,
		this.#durationEstimator,
		game.socket,
		() => this.#loadActiveBroadcasters()
	);
	#controller = new ControllerCoordinator(
		() => this.#getUserId(),
		game.socket as any,
		{
			onBecomeController: () => this.#handleBecomeController(),
			onLoseController: () => this.#handleLoseController(),
			onRequestElection: () => this.#controller.requestControllerElection(),
		}
	);
	#socketManager = new NewsSocket(game.socket ?? null, {
		syncBroadcast: (actorName, headlines) => this.registry.receiveBroadcastSync(actorName, headlines),
		stopBroadcast: (actorName) => this.registry.stopBroadcaster(actorName),
		frameUpdate: (data) =>
			this.#scheduler.handleFrameUpdate(
				data.buffer || [],
				data.timestamp || 0,
				data.duration,
				data.controllerId,
				this.#controller.controllerId()
			),
		controller: (data) => this.#controller.handleSocketMessage(data),
		requestStateSync: (userId) => this.#handleStateSyncRequest(userId),
		stateSyncResponse: (broadcasters) => this.registry.handleStateSyncResponse(broadcasters),
		forceResync: () => Hooks.callAll("sr3e.forceResync"),
	});

	static #instance: NewsService | null = null;

	static Instance(): NewsService {
		if (!this.#instance) this.#instance = new NewsService();
		return this.#instance;
	}

	initialize(): void {
		if (this.#initialized) return;
		this.#initialized = true;

		this.#socketManager.bind();
		this.#loadActiveBroadcasters();
		this.#controller.initialize();

		CONFIG.SR3E.newsService = this;
	}

	requestFullResync(): void {
		this.#controller.requestControllerStatus();
		if (!game.socket) return;

		game.socket.emit("module.sr3e", {
			type: "requestStateSync",
			userId: this.#getUserId(),
		});
	}

	destroy(): void {
		this.#socketManager.unbind();
		this.#controller.destroy();
		this.#scheduler.destroy();
		this.#initialized = false;
		if (CONFIG.SR3E?.newsService === this) CONFIG.SR3E.newsService = null;
	}

	#getUserId(): string {
		return (game.user as any)?.id || "";
	}

	#handleBecomeController(): void {
		const controllerId = this.#getUserId();
		if (!controllerId) return;
		this.#loadActiveBroadcasters();
		this.#scheduler.start(controllerId);
	}

	#handleLoseController(): void {
		this.#scheduler.stop();
	}

	#loadActiveBroadcasters(): void {
		if (!game.actors) return;
		const actors: BroadcasterActor[] = game.actors.filter(
			(actor: any): actor is BroadcasterActor =>
				actor.type === "broadcaster" && !!actor.system?.isBroadcasting
		);
		this.registry.loadFromActors(actors);
	}

	#handleStateSyncRequest(requestingUserId: string): void {
		if (requestingUserId === this.#getUserId() || !game.socket) return;

		const broadcastersData: Record<string, string[]> = {};
		const broadcasters = get(this.activeBroadcasters);
		if (broadcasters.size === 0) return;

		broadcasters.forEach((headlines, actorName) => {
			broadcastersData[actorName] = headlines;
		});

		game.socket.emit("module.sr3e", {
			type: "stateSyncResponse",
			broadcasters: broadcastersData,
		});
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
	if (!game.socket) {
		console.warn("NewsService: Cannot broadcast news - socket not available");
		return;
	}

	game.socket.emit("module.sr3e", {
		type: "syncBroadcast",
		actorName,
		headlines,
	});
};

export const stopBroadcast = (actorName: string): void => {
	if (!game.socket) {
		console.warn("NewsService: Cannot stop broadcast - socket not available");
		return;
	}

	game.socket.emit("module.sr3e", {
		type: "stopBroadcast",
		actorName,
	});
};

export const currentDisplayFrame: Readable<DisplayFrame> = readable<DisplayFrame>(
	{ buffer: [] as NewsMessage[], timestamp: 0 },
	(set) => getNewsService().currentDisplayFrame.subscribe(set)
);
