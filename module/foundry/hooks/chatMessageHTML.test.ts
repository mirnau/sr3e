// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { registerChatMessageHTMLHook } from "./chatMessageHTML";

describe("registerChatMessageHTMLHook", () => {
    it("registers Foundry's HTMLElement chat-render hook", () => {
        const on = vi.fn();

        registerChatMessageHTMLHook({ on });

        expect(on).toHaveBeenCalledWith("renderChatMessageHTML", expect.any(Function));
        const handler = on.mock.calls[0]?.[1];
        expect(() => handler?.({}, document.createElement("article"))).not.toThrow();
    });
});
