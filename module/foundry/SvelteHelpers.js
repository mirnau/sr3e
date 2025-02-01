export function localize(key) {
  return game.i18n.localize(key);
}

export function openFilePicker(document) {
  // Use Foundry's FilePicker API
  new FilePicker({
    type: "image",
    current: document.img, // current image path
    callback: (path) => {
      // Update the actor's image with the selected path
      document.update({ img: path }, { render: true });
    },
  }).render(true);
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