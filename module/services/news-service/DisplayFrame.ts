import { NewsMessage } from "./NewsMessage";

/**
 * A synchronized frame of news messages to display
 */

export interface DisplayFrame {
	buffer: NewsMessage[];
	timestamp: number;
	duration?: number;
}
