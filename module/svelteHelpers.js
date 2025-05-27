import { cardLayout } from "./svelteStore";

export function localize(key) {
  return game.i18n.localize(key);
}

export async function openFilePicker(document) {
  return new Promise((resolve) => {
    new foundry.applications.apps.FilePicker({
      type: "image",
      current: document.img,
      callback: (path) => {
        document.update({ img: path }, { render: true });
        resolve(path);
      },
    }).render(true);
  });
}


export function activateTextEditor({ target, content, owner, editable, callback }) {
  if (editable) {
    TextEditor.activateEditor({
      target: target,
      height: 300,
      save_onsubmit: false,
      content: content || "",
      buttons: true,
      owner: owner,
      callback: (html) => {
        callback(html);
      },
    });
  } else {
    target.innerHTML = TextEditor.enrichHTML(content);
  }
}

export function enrichText(content) {
  return TextEditor.enrichHTML(content);
}


export function moveCardById(id, direction) {
  cardLayout.update(cards => {
    const index = cards.findIndex(c => c.id === id);
    if (index === -1) return cards;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= cards.length) return cards;

    const reordered = [...cards];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    return reordered;
  });
}


export function toggleCardSpanById(id) {
  cardLayout.update(cards => {
    return cards.map(card => {
      if (card.id === id) {
        let nextSpan = (card.span ?? 1) + 1;
        if (nextSpan > 3) nextSpan = 1;
        return { ...card, span: nextSpan };
      }
      return card;
    });
  });
}
