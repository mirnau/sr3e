export function wrapChatMessage(message, html, context) {
   const isPopup = context?.canClose && !context?.canDelete;
   const wrapper = document.createElement("div");
   const dynamicBackground = document.createElement("div");
   const dynamicMessage = document.createElement("div");

   wrapper.classList.add("chat-message-wrapper");
   dynamicBackground.classList.add("chat-message-dynamic-background");
   dynamicMessage.classList.add("chat-message-dynamic");

   dynamicMessage.append(...html.childNodes);

   wrapper.append(dynamicBackground);
   wrapper.append(dynamicMessage);

   html.innerHTML = "";
   html.appendChild(wrapper);
}
