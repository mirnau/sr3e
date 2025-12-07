import { NewsMessage } from "./NewsMessage";

/**
 * Shared configuration values for the news service.
 */
export const NewsConfig = {
	AVG_CHAR_PX: 12,
	SCROLL_SPEED: 100,
	DEFAULT_MS: 10000,
	CONTROLLER_TIMEOUT: 15000,
	HEARTBEAT_INTERVAL: 5000,
	ELECTION_DELAY: 1000,
	ESTIMATED_TICKER_WIDTH: 400,
	MAX_VISIBLE: 5,
	DEFAULT_MESSAGES: [
		{ sender: "System", headline: "Please stand by." },
		{ sender: "System", headline: "Waiting for broadcast..." },
		{ sender: "System", headline: "No active news sources." },
	] as NewsMessage[],
};
