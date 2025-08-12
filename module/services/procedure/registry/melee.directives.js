// module/services/procedure/registry/melee.directives.js
import DirectiveRegistry from "@rules/DirectiveRegistry.js";

// Example: light “positioning” and “wound” hooks; reach is handled in planStrike,
// but you could also expose it here if you want all mods funneled through directives.
DirectiveRegistry.register("bladed", ({ situational }) => {
  const d = [];
  if (Number.isFinite(situational?.woundTNAdd)) d.push({ k: "attack.tnAdd", v: Number(situational.woundTNAdd) });
  if (situational?.calledShotExtraLevel) d.push({ k: "damage.levelDelta", v: Number(situational.calledShotExtraLevel) });
  // Example: special materials (monofilament, dikoted, etc.)
  if (situational?.dikoted) d.push({ k: "damage.powerAdd", v: 1 }, { k: "special.dikoted", v: true });
  return d;
});
