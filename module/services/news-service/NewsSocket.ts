import type { SocketData } from "./SocketData";

type Handlers = {
	syncBroadcast: (actorName: string, headlines: string[]) => void;
	stopBroadcast: (actorName: string) => void;
	frameUpdate: (data: SocketData) => void;
	controller: (data: SocketData) => void;
	requestStateSync: (userId: string) => void;
	stateSyncResponse: (broadcasters: Record<string, string[]>) => void;
	forceResync: () => void;
};

/**
 * Centralizes socket binding/unbinding.
 */
export class NewsSocket {
	constructor(private readonly socket: any, private readonly handlers: Handlers) {}

	bind(): void {
		if (!this.socket) return;
		this.socket.on("module.sr3e", (data: SocketData) => this.#handle(data));
	}

	unbind(): void {
		this.socket?.off("module.sr3e");
	}

	#handle(data: SocketData): void {
		const {
			type,
			actorName,
			headlines,
			broadcasters,
			userId,
		} = data;

		switch (type) {
			case "syncBroadcast":
				if (actorName && headlines) this.handlers.syncBroadcast(actorName, headlines);
				break;
			case "stopBroadcast":
				if (actorName) this.handlers.stopBroadcast(actorName);
				break;
			case "frameUpdate":
				this.handlers.frameUpdate(data);
				break;
			case "controllerElection":
			case "controllerHeartbeat":
			case "controllerAnnouncement":
			case "controllerStatusRequest":
			case "controllerStatusResponse":
				this.handlers.controller(data);
				break;
			case "requestStateSync":
				if (userId) this.handlers.requestStateSync(userId);
				break;
			case "stateSyncResponse":
				if (broadcasters) this.handlers.stateSyncResponse(broadcasters);
				break;
			case "forceResync":
				this.handlers.forceResync();
				break;
		}
	}
}
