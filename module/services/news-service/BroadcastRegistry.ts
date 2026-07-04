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
	#headlineBags = new Map<string, number[]>();
	#lastHeadlines = new Map<string, string>();
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
			this.#headlineBags.delete(actorName);
			this.#lastHeadlines.delete(actorName);
		} else {
			broadcasters.set(actorName, headlines);
			this.#syncBag(actorName, headlines);
		}
		this.activeBroadcasters.set(new Map(broadcasters));
		this.#updateFeedBuffer();
	}

	stopBroadcaster(actorName: string): void {
		const broadcasters = get(this.activeBroadcasters);
		broadcasters.delete(actorName);
		this.#headlineBags.delete(actorName);
		this.#lastHeadlines.delete(actorName);
		this.activeBroadcasters.set(new Map(broadcasters));
		this.#updateFeedBuffer();
	}

	handleStateSyncResponse(broadcastersData: Record<string, string[]>): void {
		Object.entries(broadcastersData).forEach(([actorName, headlines]) => {
			this.receiveBroadcastSync(actorName, headlines);
		});
	}

	getFeedBuffer(): NewsMessage[] {
		const broadcasters = get(this.activeBroadcasters);

		if (broadcasters.size === 0) {
			return [...NewsConfig.DEFAULT_MESSAGES];
		}

		const batchSize = Math.min(this.#totalHeadlineCount(), NewsConfig.MAX_BATCH_SIZE);
		const batch: NewsMessage[] = [];

		for (let i = 0; i < batchSize; i++) {
			const next = this.#pumpNextHeadline();
			if (!next) break;
			batch.push(next);
		}

		this.#feedBuffer = batch.slice(0, this.maxVisible);
		this.#publishFeed();
		return batch;
	}

	#totalHeadlineCount(): number {
		let total = 0;
		get(this.activeBroadcasters).forEach(headlines => total += headlines.length);
		return total;
	}

	#pumpNextHeadline(): NewsMessage | null {
		const broadcasters = get(this.activeBroadcasters);
		if (broadcasters.size === 0) return null;
		const broadcasterNames: string[] = Array.from(broadcasters.keys());
		for (let offset = 0; offset < broadcasterNames.length; offset++) {
			const index = (this.#lastBroadcasterIndex + offset + 1) % broadcasterNames.length;
			const broadcasterName: string = broadcasterNames[index] as string;
			const headlines = broadcasters.get(broadcasterName);
			if (!headlines || headlines.length === 0) continue;
			const headline = this.#drawHeadline(broadcasterName, headlines);
			this.#lastBroadcasterIndex = index;
			return { sender: broadcasterName, headline };
		}
		return null;
	}

	#drawHeadline(actorName: string, headlines: string[]): string {
		let bag = this.#headlineBags.get(actorName) ?? [];
		if (bag.length === 0) {
			bag = this.#newBag(actorName, headlines);
		}

		const headlineIndex = bag.shift() ?? 0;
		this.#headlineBags.set(actorName, bag);
		const headline = headlines[headlineIndex] ?? headlines[0] ?? "";
		this.#lastHeadlines.set(actorName, headline);
		return headline;
	}

	#syncBag(actorName: string, headlines: string[]): void {
		const valid = new Set(headlines.map((_, index) => index));
		const bag = (this.#headlineBags.get(actorName) ?? []).filter((index) => valid.has(index));
		this.#headlineBags.set(actorName, bag);
	}

	#newBag(actorName: string, headlines: string[]): number[] {
		const bag = this.#shuffle(headlines.map((_, index) => index));
		const lastHeadline = this.#lastHeadlines.get(actorName);
		if (bag.length > 1 && lastHeadline && headlines[bag[0]!] === lastHeadline) {
			bag.push(bag.shift()!);
		}
		return bag;
	}

	#shuffle(indices: number[]): number[] {
		const shuffled = [...indices];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
		}
		return shuffled;
	}

	#updateFeedBuffer(): void {
		const broadcasters = get(this.activeBroadcasters);
		if (broadcasters.size === 0) {
			this.#feedBuffer = [];
		} else {
			this.#feedBuffer = this.#feedBuffer.filter(
				(message) =>
					broadcasters.has(message.sender) &&
					(broadcasters.get(message.sender) || []).includes(message.headline)
			);
		}
		this.#publishFeed();
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
