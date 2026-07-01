# ADR-0008: Gadgets stored as ActiveEffect documents, not as embedded items

## Status
Accepted

## Context
Foundry VTT has no native concept of "item modifies another item." When a gadget (e.g. a scope) is attached to a weapon, the data must live somewhere that:
- Persists on the weapon independently of the source gadget item
- Participates in Foundry's `prepareData` / `applyActiveEffects` pipeline so stat modifiers apply automatically
- Survives sheet close/reopen and full reload without bespoke sync logic

Two options were considered:
1. Store the gadget as a child item embedded on the weapon item.
2. Stamp the gadget's effects as `ActiveEffect` documents on the weapon (or actor), carrying all gadget metadata in `flags.sr3e.gadget.*`.

Foundry V14 does not support doubly-embedded items (Item inside Item) in a stable way. Option 1 would require a custom serialization layer with no Foundry pipeline support.

## Decision
Option 2. Drag-dropping a gadget onto a weapon copies its embedded `ActiveEffect` docs onto the weapon, stamping each with:

```ts
flags.sr3e.gadget = {
  name, img, isEnabled, type: "gadget",
  origin,          // source gadget item id — grouping key
  targetItemType,
  gadgetType,
  commodity,
}
flags.sr3e.target: "self" | "character"
```

`isEnabled` / `disabled` on the `ActiveEffect` document are the persistence mechanism for the toggle — updated via `ae.update({ disabled: !on, "flags.sr3e.gadget.isEnabled": on }, { render: false })`. The source gadget item is deleted from actor inventory on drop and recreated on detach.

`GadgetViewer` groups effects by `flags.sr3e.gadget.origin` to present them as a single logical gadget row.

## Consequences
- No new document type required; `ActiveEffect` is Foundry-native and pipelines cleanly.
- `target: "character"` effects use `transfer: true` so Foundry copies them to the actor during `prepareData`.
- `target: "self"` effects stay on the weapon and apply during item `prepareData`.
- Gadget metadata (name, image, commodity) is denormalized into flags on every sibling effect — `WeaponModApp` must propagate commodity edits to all siblings on update.
- Grouping key is `origin` (source item id). This must never change after attachment; do not re-key by name or index.
