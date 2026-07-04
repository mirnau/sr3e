import { describe, expect, it } from "vitest";
import {
    computeDetectionFactor,
    cyberdeckMetricUpdates,
    responseIncreaseMax,
    sanitizeUtility,
    type CyberdeckUtility,
} from "./cyberdeckCalculations";

describe("cyberdeckCalculations", () => {
    it("uses half Masking rounded up when no Sleaze utility is active", () => {
        expect(computeDetectionFactor(5, [], 6)).toBe(3);
    });

    it("uses active Sleaze and caps it by MPCP for Detection Factor", () => {
        const utilities: CyberdeckUtility[] = [
            { name: "Sleaze", rating: 8, size: 4, type: "operational", active: true },
        ];

        expect(computeDetectionFactor(4, utilities, 6)).toBe(5);
    });

    it("caps response increase at three and MPCP divided by four", () => {
        expect(responseIncreaseMax(6)).toBe(1);
        expect(responseIncreaseMax(12)).toBe(3);
        expect(responseIncreaseMax(20)).toBe(3);
    });

    it("sanitizes utility ratings, sizes, and unknown types", () => {
        expect(sanitizeUtility({ name: "Attack", rating: 9, size: 4.6, type: "bad", active: false }, 6)).toEqual({
            name: "Attack",
            rating: 6,
            size: 5,
            type: "operational",
            active: false,
        });
    });

    it("builds persisted derived metric updates", () => {
        const item = { parent: { system: { attributes: { intelligence: { value: 5, mod: 1 } } } } } as Item;
        const utilities: CyberdeckUtility[] = [
            { name: "Sleaze", rating: 4, size: 10, type: "operational", active: true },
            { name: "Browse", rating: 2, size: 3, type: "operational", active: false },
        ];

        expect(cyberdeckMetricUpdates(item, 5, 6, utilities)).toEqual({
            "system.memory.active.value": 10,
            "system.memory.storage.value": 13,
            "system.derived.detectionFactor": 5,
            "system.derived.hackingPool": 4,
        });
    });
});
