import { cardLayout } from "../svelteStore";
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

export function lerpColor(color1, color2, t) {
    const c1 = parseInt(color1.slice(1), 16); // Convert hex to int
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `rgb(${r}, ${g}, ${b})`;
}

export function lerpColorToHexAsString(color1, color2, t) {
    const c1 = parseInt(color1.slice(1), 16); // Convert hex to int
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 0xff, g1 = (c1 >> 8) & 0xff, b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff, g2 = (c2 >> 8) & 0xff, b2 = c2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    // Convert interpolated RGB to hex string
    const toHex = (value) => value.toString(16).padStart(2, '0'); // Ensure 2 digits
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}