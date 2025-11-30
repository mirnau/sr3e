import DirectiveRegistry from "@rules/DirectiveRegistry.js";

DirectiveRegistry.register("firearm", ({ ammo }) => {
  if (!ammo) return [];
  const t = String(ammo?.system?.type || ammo?.system?.ammoType || "").toLowerCase();
  const d = Array.isArray(ammo?.system?.effectDirectives) ? [...ammo.system.effectDirectives] : [];

  if (t === "apds") d.push({ k: "armor.mult.ballistic", v: 0.5 });
  if (t === "flechette") d.push({ k: "special.flechette", v: true });
  if (t === "gel") d.push({ k: "damage.type", v: "stun" }, { k: "damage.powerAdd", v: -2 });
  if (t === "explosive") d.push({ k: "damage.powerAdd", v: 1 });
  if (t === "incendiary") d.push({ k: "damage.type", v: "fire" }, { k: "special.incendiary", v: true });
  if (t === "capsule") d.push({ k: "special.capsule", v: true });
  if (t === "tracer") d.push({ k: "attack.tnAdd", v: -1 });
  if (t === "tracker") d.push({ k: "special.tracker", v: true });

  return d;
});
