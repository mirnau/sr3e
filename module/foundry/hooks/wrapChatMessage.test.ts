// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { wrapChatMessage } from "./wrapChatMessage";

describe("wrapChatMessage", () => {
    it("moves the original content into a new .sr3e-chat-message-content div alongside a shadow div", () => {
        const html = document.createElement("li");
        html.className = "chat-message";
        html.innerHTML = `<header class="message-header">Header</header><div class="message-content">Body</div>`;

        wrapChatMessage(html);

        const wrapper = html.querySelector(".sr3e-chat-message-wrapper");
        expect(wrapper).not.toBeNull();

        const shadow = wrapper?.querySelector(":scope > .sr3e-chat-message-shadow");
        expect(shadow).not.toBeNull();

        const content = wrapper?.querySelector(":scope > .sr3e-chat-message-content");
        expect(content?.querySelector(".message-header")?.textContent).toBe("Header");
        expect(content?.querySelector(".message-content")?.textContent).toBe("Body");
    });

    it("preserves the original DOM nodes (moved, not cloned) so listeners/state on them survive", () => {
        const html = document.createElement("li");
        const original = document.createElement("button");
        original.textContent = "Click me";
        html.appendChild(original);

        wrapChatMessage(html);

        const found = html.querySelector("button");
        expect(found).toBe(original);
    });

    it("is idempotent — calling it twice does not nest a second wrapper", () => {
        const html = document.createElement("li");
        html.innerHTML = `<div class="message-content">Body</div>`;

        wrapChatMessage(html);
        wrapChatMessage(html);

        expect(html.querySelectorAll(".sr3e-chat-message-wrapper").length).toBe(1);
    });
});
