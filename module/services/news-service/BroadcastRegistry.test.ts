import { afterEach, describe, expect, it, vi } from "vitest";
import { BroadcastRegistry } from "./BroadcastRegistry";

function headlines(messages: ReturnType<BroadcastRegistry["getFeedBuffer"]>): string[] {
	return messages.map((message) => `${message.sender}:${message.headline}`);
}

describe("BroadcastRegistry", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("cycles through every headline for one broadcaster before repeats dominate", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const registry = new BroadcastRegistry();
		registry.receiveBroadcastSync("A", ["a1", "a2", "a3", "a4", "a5", "a6"]);

		const first = registry.getFeedBuffer();
		const second = registry.getFeedBuffer();

		expect(new Set([...first, ...second].map((message) => message.headline))).toEqual(
			new Set(["a1", "a2", "a3", "a4", "a5", "a6"]),
		);
	});

	it("keeps multiple broadcasters in the cycle", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const registry = new BroadcastRegistry();
		registry.receiveBroadcastSync("A", ["a1", "a2", "a3"]);
		registry.receiveBroadcastSync("B", ["b1", "b2", "b3"]);
		registry.receiveBroadcastSync("C", ["c1", "c2", "c3"]);

		const shown = new Set(headlines([...registry.getFeedBuffer(), ...registry.getFeedBuffer()]));

		expect(shown).toEqual(new Set([
			"A:a1", "A:a2", "A:a3",
			"B:b1", "B:b2", "B:b3",
			"C:c1", "C:c2", "C:c3",
		]));
	});

	it("avoids repeating a broadcaster headline across shuffle-bag boundaries", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const registry = new BroadcastRegistry();
		registry.receiveBroadcastSync("A", ["a1", "a2"]);

		const first = registry.getFeedBuffer();
		const second = registry.getFeedBuffer();

		expect(second[0]?.headline).not.toBe(first.at(-1)?.headline);
	});
});
