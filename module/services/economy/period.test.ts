import { describe, expect, it } from "vitest";
import { currentPeriod, daysUntilMonthEnd, monthsBetween } from "./period";

describe("currentPeriod", () => {
    it("formats a date as YYYY-MM", () => {
        expect(currentPeriod(new Date(2077, 2, 15))).toBe("2077-03");
        expect(currentPeriod(new Date(2077, 10, 1))).toBe("2077-11");
    });
});

describe("monthsBetween", () => {
    it("returns 0 for an empty from-period", () => {
        expect(monthsBetween("", "2077-03")).toBe(0);
    });

    it("returns 0 for equal periods", () => {
        expect(monthsBetween("2077-03", "2077-03")).toBe(0);
    });

    it("counts whole months within a year", () => {
        expect(monthsBetween("2077-01", "2077-04")).toBe(3);
    });

    it("counts whole months across a year boundary", () => {
        expect(monthsBetween("2076-11", "2077-02")).toBe(3);
    });
});

describe("daysUntilMonthEnd", () => {
    it("counts days remaining until the first of next month", () => {
        expect(daysUntilMonthEnd(new Date(2077, 2, 30))).toBe(2);
        expect(daysUntilMonthEnd(new Date(2077, 2, 1))).toBe(31);
    });
});
