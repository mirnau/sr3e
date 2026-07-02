// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { withDiePending } from "./diePendingState";

function group(): HTMLElement {
    const el = document.createElement("div");
    el.innerHTML = `<span class="sr3e-die">6</span><span class="sr3e-die">2</span>`;
    return el;
}

describe("withDiePending", () => {
    it("marks dice pending immediately and clears them once the task resolves", async () => {
        const el = group();
        let resolveTask: () => void = () => {};
        const task = new Promise<void>(resolve => { resolveTask = resolve; });

        withDiePending(el, () => task);

        expect(el.dataset.sr3ePending).toBe("true");
        expect(el.querySelectorAll(".sr3e-die-pending")).toHaveLength(2);

        resolveTask();
        await task;
        await Promise.resolve();

        expect(el.dataset.sr3ePending).toBeUndefined();
        expect(el.querySelectorAll(".sr3e-die-pending")).toHaveLength(0);
    });

    it("ignores a second call while one is already pending", () => {
        const el = group();
        const taskFn = vi.fn().mockReturnValue(new Promise(() => {}));

        withDiePending(el, taskFn);
        withDiePending(el, taskFn);

        expect(taskFn).toHaveBeenCalledTimes(1);
    });

    it("does nothing when the group element is missing", () => {
        const taskFn = vi.fn().mockResolvedValue(undefined);
        expect(() => withDiePending(null, taskFn)).not.toThrow();
        expect(taskFn).not.toHaveBeenCalled();
    });
});
