export function applyAuthorColorToChatMessage(message, html, context) {
   const color = message.author?.color;
   if (color) {
      html.style.setProperty("--author-color", color);
   }
}
