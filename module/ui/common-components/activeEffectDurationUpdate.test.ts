import { afterEach, describe, expect, it } from "vitest";
import { durationTypeFrom, durationUpdateForCommit } from "./activeEffectDurationUpdate";

const originalFoundry = Reflect.get(globalThis, "foundry") as unknown;

class ForcedDeletionStub {
    readonly marker = "forced";
}

afterEach(() => {
    setFoundry(originalFoundry);
});

describe("durationUpdateForCommit", () => {
    it("uses Foundry forced deletion operators when available", () => {
        setFoundry({ data: { operators: { ForcedDeletion: ForcedDeletionStub } } });

        const update = durationUpdateForCommit("rounds", 3);

        expect(Object.keys(update).some(key => key.includes(".-="))).toBe(false);
        expect(update["duration.rounds"]).toBe(3);
        expect(update["duration.turns"]).toBeInstanceOf(ForcedDeletionStub);
        expect(update["duration.seconds"]).toBeInstanceOf(ForcedDeletionStub);
    });

    it("clears stored units and value for permanent effects", () => {
        setFoundry({ data: { operators: { ForcedDeletion: ForcedDeletionStub } } });

        const update = durationUpdateForCommit("none", 0);

        expect(update).not.toHaveProperty("duration.type");
        expect(update["duration.units"]).toBe("seconds");
        expect(update["duration.value"]).toBe(0);
    });

    it("falls back to legacy deletion keys outside Foundry v14", () => {
        setFoundry(undefined);

        const update = durationUpdateForCommit("rounds", 3);

        expect(update["duration.-=turns"]).toBeNull();
        expect(update["duration.rounds"]).toBe(3);
    });

    it("rounds duration values to integers", () => {
        const update = durationUpdateForCommit("rounds", 2.6);

        expect(update["duration.value"]).toBe(3);
        expect(update["duration.rounds"]).toBe(3);
    });

    it("converts invalid duration values to zero", () => {
        const update = durationUpdateForCommit("rounds", Number.NaN);

        expect(update["duration.value"]).toBe(0);
        expect(update["duration.rounds"]).toBe(0);
    });

    it("reads legacy permanent duration type when units are absent", () => {
        expect(durationTypeFrom({ type: "none" })).toBe("none");
    });

    it("treats non-finite duration values as permanent", () => {
        expect(durationTypeFrom({ units: "seconds", value: Infinity })).toBe("none");
    });
});

function setFoundry(value: unknown): void {
    Object.defineProperty(globalThis, "foundry", {
        configurable: true,
        writable: true,
        value,
    });
}
