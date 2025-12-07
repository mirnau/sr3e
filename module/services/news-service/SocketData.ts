import { NewsMessage } from "./NewsMessage";
import { SocketMessageType } from "./NewsService.svelte";

/**
 * Data structure for socket messages
 */
export interface SocketData {
	type: SocketMessageType;
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
