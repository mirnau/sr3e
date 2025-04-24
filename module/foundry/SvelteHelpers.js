export function localize(key) {
  return game.i18n.localize(key);
}

//const localize = (args) => game?.i18n?.localize?.(args) ?? args;

export function openFilePicker(document) {
  return new Promise((resolve) => {
    new FilePicker({
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