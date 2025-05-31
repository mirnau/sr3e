import { cardLayout } from "./svelteStore";
import { tick } from 'svelte';

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

export function getRandomIntinRange(x, y) {
    return Math.floor(Math.random() * (y - x + 1)) + x;
}

export function getRandomBellCurveWithMode(min, max, mode) {
    if (min >= max) {
        throw new Error("The min value must be less than the max value.");
    }
    if (mode < min || mode > max) {
        throw new Error("The mode value must be within the range of min and max.");
    }

    function randomNormal() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); // Ensure u != 0
        while (v === 0) v = Math.random(); // Ensure v != 0
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    // Calculate the mean based on mode
    const mean = mode;
    const stdDev = (max - min) / 6; // Approximate standard deviation for 99.7% coverage

    let value;
    do {
        value = randomNormal() * stdDev + mean;
    } while (value < min || value > max); // Ensure the value is within bounds

    const int = Math.floor(value);

    return int;
}