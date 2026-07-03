import { describe, expect, it, vi } from "vitest";
import { transferBetweenSticks } from "./stickTransfer";

function stick(amount: number) {
    const system = { amount };
    return {
        system,
        update: vi.fn(async (data: Record<string, unknown>) => {
            for (const [path, value] of Object.entries(data)) {
                (system as Record<string, unknown>)[path.replace("system.", "")] = value;
            }
        }),
    };
}

describe("transferBetweenSticks", () => {
    it("moves the amount from source to target", async () => {
        const source = stick(500);
        const target = stick(100);

        const result = await transferBetweenSticks(source, target, 200);

        expect(result.ok).toBe(true);
        expect(source.system.amount).toBe(300);
        expect(target.system.amount).toBe(300);
    });

    it("blocks a transfer that exceeds the source balance, no mutation", async () => {
        const source = stick(100);
        const target = stick(0);

        const result = await transferBetweenSticks(source, target, 200);

        expect(result.ok).toBe(false);
        expect(source.system.amount).toBe(100);
        expect(target.system.amount).toBe(0);
    });

    it("blocks a non-positive amount", async () => {
        const source = stick(100);
        const target = stick(0);

        const result = await transferBetweenSticks(source, target, 0);

        expect(result.ok).toBe(false);
        expect(source.update).not.toHaveBeenCalled();
    });
});
