// Foundry's own chat message render gives us a bare content root — the same
// offset-blurred-shadow/outline "sheet card" treatment used everywhere else
// (ItemSheetComponent.svelte) can't be retrofitted onto that markup with CSS
// alone, since Foundry owns the actual <li> structure and it isn't rendered
// through that component. This moves Foundry's own rendered content (header,
// flavor, rolls, buttons — moved, not cloned, so existing click delegation
// and native behavior keep working unchanged) into a fresh inner content div,
// alongside a sibling shadow-glow div, mirroring old_project's
// wrapChatMessage.js. Styled in chat.scss as .sr3e-chat-message-*.
export function wrapChatMessage(html: HTMLElement): void {
    if (html.dataset.sr3eWrapped) return;
    html.dataset.sr3eWrapped = "true";

    const shadow = document.createElement("div");
    shadow.className = "sr3e-chat-message-shadow";

    const content = document.createElement("div");
    content.className = "sr3e-chat-message-content";
    content.append(...Array.from(html.childNodes));

    const wrapper = document.createElement("div");
    wrapper.className = "sr3e-chat-message-wrapper";
    wrapper.appendChild(shadow);
    wrapper.appendChild(content);

    html.appendChild(wrapper);
}
