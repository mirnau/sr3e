import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import { NewsConfig } from "./NewsConfig";
import { NewsMessage } from "./NewsMessage";
import { BroadcasterActor } from "./BroadcasterActor";

/**
 * Manages broadcaster state and feed buffering.
 */
export class BroadcastRegistry {
	readonly activeBroadcasters: Writable<Map<string, string[]>> = writable(new Map());
	readonly allFeeds: Writable<Record<string, NewsMessage[]>> = writable({});

	#feedBuffer: NewsMessage[] = [];
	#currentIndices = new Map<string, number>();
	#lastBroadcasterIndex = -1;

	constructor(private readonly maxVisible = NewsConfig.MAX_VISIBLE) {}

	loadFromActors(actors: BroadcasterActor[]): void {
		actors
			.filter((actor) => actor.type === "broadcaster" && !!actor.system?.isBroadcasting)
			.forEach((actor) => this.receiveBroadcastSync(actor.name, actor.system.rollingNews || []));
	}

	receiveBroadcastSync(actorName: string, headlines: string[]): void {
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

	stopBroadcaster(actorName: string): void {
		const broadcasters = get(this.activeBroadcasters);
		broadcasters.delete(actorName);
		this.#currentIndices.delete(actorName);
		this.activeBroadcasters.set(new Map(broadcasters));
		this.#updateFeedBuffer();
	}

	handleStateSyncResponse(broadcastersData: Record<string, string[]>): void {
		Object.entries(broadcastersData).forEach(([actorName, headlines]) => {
			this.receiveBroadcastSync(actorName, headlines);
		});
	}

	getFeedBuffer(minLength = 10): NewsMessage[] {
		this.#fillFeedBuffer(minLength);
		return [...this.#feedBuffer];
	}

	private #pumpNextHeadline(): NewsMessage | null {
		const broadcasters = get(this.activeBroadcasters);
		if (broadcasters.size === 0) return null;
		const broadcasterNames: string[] = Array.from(broadcasters.keys());
		for (let offset = 0; offset < broadcasterNames.length; offset++) {
			const index = (this.#lastBroadcasterIndex + offset + 1) % broadcasterNames.length;
			const broadcasterName: string = broadcasterNames[index] as string;
			const headlines = broadcasters.get(broadcasterName);
			if (!headlines || headlines.length === 0) continue;
			const currentIndex = this.#currentIndices.get(broadcasterName) || 0;
			const headline: string = headlines[currentIndex] as string;
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

		if (buffer.length === 0 && broadcasters.size === 0) {
			for (let i = 0; i < minLength; i++) {
				const msg: NewsMessage = NewsConfig.DEFAULT_MESSAGES[i % NewsConfig.DEFAULT_MESSAGES.length] as NewsMessage;
				buffer.push(msg);
			}
		}

		this.#feedBuffer = buffer.slice(-this.maxVisible);
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
		this.#fillFeedBuffer(this.maxVisible);
	}

	#publishFeed(): void {
		const feeds: Record<string, NewsMessage[]> = {};
		this.#feedBuffer.forEach((message) => {
			feeds[message.sender] = feeds[message.sender] || [];
			feeds[message.sender]!.push(message);
		});
		this.allFeeds.set(feeds);
	}
}
