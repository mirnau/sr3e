import WeaponModePlanners from "@rules/WeaponModePlanners.js";

// pure helper (extracted)
function recoilTotal({ before, add, rc, heavy, shotgunBF = false }) {
  let total = Math.max(0, before + add - rc);
  if (total > 0 && (heavy || shotgunBF)) total *= 2;
  return total;
}

WeaponModePlanners.register("manual", () => ({
  roundsFired: 1, attackerTNMod: 0, powerDelta: 0, levelDelta: 0, notes: []
}));

WeaponModePlanners.register("semiauto", ({ phaseShotsFired, rc, heavy }) => {
  const add = phaseShotsFired > 0 ? 1 : 0;
  return {
    roundsFired: 1,
    attackerTNMod: recoilTotal({ before: phaseShotsFired, add, rc, heavy }),
    powerDelta: 0, levelDelta: 0, notes: ["SA"]
  };
});

WeaponModePlanners.register("burst", ({ phaseShotsFired, rc, heavy, ammoAvailable }) => {
  const want = 3;
  const rounds = ammoAvailable != null ? Math.min(want, Number(ammoAvailable) || 0) : want;
  if (rounds >= 2) {
    const att = recoilTotal({ before: phaseShotsFired, add: rounds, rc, heavy });
    return { roundsFired: rounds, attackerTNMod: att, powerDelta: rounds,
             levelDelta: Math.floor(rounds / 3), notes: [rounds >= 3 ? "BF" : "Short BF"] };
  }
  const att = recoilTotal({ before: phaseShotsFired, add: 1, rc, heavy });
  return { roundsFired: 1, attackerTNMod: att, powerDelta: 0, levelDelta: 0, notes: ["SA"] };
});

WeaponModePlanners.register("fullauto", ({ phaseShotsFired, rc, heavy, declaredRounds, ammoAvailable }) => {
  const maxRounds = 10;
  let rounds = Math.min(Math.max(1, Number(declaredRounds ?? maxRounds)), maxRounds);
  if (ammoAvailable != null) rounds = Math.min(rounds, Number(ammoAvailable) || 0);
  const att = recoilTotal({ before: phaseShotsFired, add: rounds, rc, heavy });
  return { roundsFired: rounds, attackerTNMod: att, powerDelta: rounds,
           levelDelta: Math.floor(rounds / 3), notes: [`FA ${rounds}`] };
});
