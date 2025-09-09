---
title: Utilities
parent: Services
grand_parent: Documentation
nav_order: 1
---

# @services/utilities.js

General-purpose helpers used across the system. Import with:

```js
import { localize, openFilePicker, activateTextEditor, kvOptions,
         moveCardById, toggleCardSpanById,
         getRandomIntinRange, getRandomBellCurveWithMode,
         lerpColor, lerpColorToHexAsString, lerp } from "@services/utilities.js";
```

---

## Localization

- `localize(key: string) → string`
  - Thin wrapper over Foundry `game.i18n.localize(key)`.
  - Use for all player-facing strings. Keys should come from `config.sr3e.*`.

---

## File picker

- `async openFilePicker(document: Document) → Promise<string>`
  - Opens Foundry’s FilePicker for images.
  - Seeds with `document.img`, updates the document with the selected path, and resolves with that path.
  - Throws: none; user cancellation simply leaves the document unchanged.

---

## Rich text editor

- `activateTextEditor({ target, content, owner, editable, callback })`
  - If `editable`, mounts Foundry’s `TextEditor` on `target` (height 300); calls `callback(html)` on save.
  - If not `editable`, enriches `content` into `target.innerHTML`.

---

## Option helpers

- `kvOptions(map: Record<string,string>) → Array<{ value: string, label: string }>`
  - Converts an object map into UI-ready options using `localize(token)` for labels.
  - Example: `{ short: config.procedure.range.short, long: config.procedure.range.long }`.

---

## Card layout helpers

- `moveCardById(id: string, direction: "up" | "down")`
  - Reorders a card in the `cardLayout` Svelte store.
  - No-op if card not found or bounds exceeded.

- `toggleCardSpanById(id: string)`
  - Cycles a card’s `span` through 1 → 2 → 3 → 1 in the `cardLayout` store.

Note: These depend on the `cardLayout` store from `module/svelteStore.js`.

---

## Randomization

- `getRandomIntinRange(x: number, y: number) → number`
  - Inclusive integer in `[x, y]`.

- `getRandomBellCurveWithMode(min: number, max: number, mode: number) → number`
  - Truncated normal-ish integer sampler using Box–Muller; clamps to `[min, max]` and skews by `mode`.
  - Throws if `min ≥ max` or `mode` is outside the range.

---

## Interpolation

- `lerp(a: number, b: number, t: number) → number`
  - Linear interpolation for scalars.

- `lerpColor(hex1: "#RRGGBB", hex2: "#RRGGBB", t: number) → "#RRGGBB"`
  - Interpolates two hex colors and returns a hex string.

- `lerpColorToHexAsString(color1: "#RRGGBB", color2: "#RRGGBB", t: number) → "#RRGGBB"`
  - Equivalent to `lerpColor`; kept for compatibility.
