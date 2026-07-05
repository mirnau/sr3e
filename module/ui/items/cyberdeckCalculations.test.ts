import { describe, expect, it } from "vitest";
import {
    computeDetectionFactor,
    cyberdeckMetricUpdates,
    responseIncreaseMax,
} from "./cyberdeckCalculations";

describe("cyberdeckCalculations", () => {
    it("uses half Masking rounded up when Sleaze rating is zero", () => {
        expect(computeDetectionFactor(5, 0, 6)).toBe(3);
    });

    it("uses Sleaze rating and caps it by MPCP for Detection Factor", () => {
        expect(computeDetectionFactor(4, 8, 6)).toBe(5);
    });

    it("caps response increase at three and MPCP divided by four", () => {
        expect(responseIncreaseMax(6)).toBe(1);
        expect(responseIncreaseMax(12)).toBe(3);
        expect(responseIncreaseMax(20)).toBe(3);
    });

    it("builds persisted derived metric updates", () => {
        const item = { parent: { system: { attributes: { intelligence: { value: 5, mod: 1 } } } } } as Item;

        expect(cyberdeckMetricUpdates(item, 5, 6, 4)).toEqual({
            "system.derived.detectionFactor": 5,
            "system.derived.hackingPool": 4,
        });
    });
});
